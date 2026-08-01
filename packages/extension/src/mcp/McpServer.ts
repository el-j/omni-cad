import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { EngineRouter } from "../engines/EngineRouter";
import { ExportFormat, ICadEngine } from "../types";

type EngineId = "opengeometry" | "freecad" | "openscad";

interface CompileMeasureArgs {
  code: string;
  engine: EngineId;
}

interface ExportGeometryArgs {
  code: string;
  engine: EngineId;
  format: ExportFormat;
}

interface ValidateSourceArgs {
  code: string;
  engine: EngineId;
}

interface ExplainCompileFailureArgs {
  code: string;
  engine: EngineId;
}

type ToolContent = { content: Array<{ type: "text"; text: string }> };

interface ErrorResult {
  code:
    | "VALIDATION_FAILED"
    | "ENGINE_NOT_FOUND"
    | "UNSUPPORTED_FORMAT"
    | "COMPILE_FAILED"
    | "RUNTIME_ERROR"
    | "TIMEOUT";
  message: string;
}

const MCP_API_VERSION = "1.1.0";
const MAX_CODE_SIZE = 250_000;
const DEFAULT_TOOL_TIMEOUT_MS = 120_000;

// Minimal type for McpServer.tool() that avoids TS2589 (excessive type depth
// from the SDK's zod-inference overloads) while preserving runtime correctness.
type RegisterToolFn = (
  name: string,
  description: string,
  schema: Record<string, z.ZodTypeAny>,
  handler: (args: Record<string, unknown>) => Promise<ToolContent>,
) => void;

function engineExtension(engine: EngineId): string {
  if (engine === "opengeometry") {
    return ".ts";
  }
  if (engine === "freecad") {
    return ".py";
  }
  return ".scad";
}

function errorContent(error: ErrorResult): ToolContent {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            apiVersion: MCP_API_VERSION,
            success: false,
            error,
          },
          null,
          2,
        ),
      },
    ],
  };
}

function successContent(tool: string, data: unknown): ToolContent {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            apiVersion: MCP_API_VERSION,
            success: true,
            tool,
            data,
          },
          null,
          2,
        ),
      },
    ],
  };
}

const compileMeasureSchema = z.object({
  code: z.string().min(1).max(MAX_CODE_SIZE).describe("The CAD script source code"),
  engine: z
    .enum(["opengeometry", "freecad", "openscad"] as const)
    .describe("The engine to compile with"),
});

const exportGeometrySchema = z.object({
  code: z.string().min(1).max(MAX_CODE_SIZE).describe("The CAD script source code"),
  engine: z
    .enum(["opengeometry", "freecad", "openscad"] as const)
    .describe("The engine to use"),
  format: z
    .enum(["STEP", "STL", "IGES", "glTF"] as const)
    .describe("Export format"),
});

const validateSourceSchema = z.object({
  code: z.string().min(1).max(MAX_CODE_SIZE).describe("The CAD script source code"),
  engine: z
    .enum(["opengeometry", "freecad", "openscad"] as const)
    .describe("The engine to validate for"),
});

const explainCompileFailureSchema = z.object({
  code: z.string().min(1).max(MAX_CODE_SIZE).describe("The CAD script source code"),
  engine: z
    .enum(["opengeometry", "freecad", "openscad"] as const)
    .describe("The engine to compile with"),
});

/**
 * Guarded MCP facade around OmniCAD adapters.
 *
 * It validates tool arguments, routes to the selected engine, and returns typed text payloads.
 */
export class OmniCadMcpServer {
  private server: McpServer;
  private router: EngineRouter;
  private transport?: StdioServerTransport;
  private readonly toolTimeoutMs: number;
  // Narrowed reference to server.tool that bypasses the SDK's deep zod overloads (TS2589).
  private readonly registerTool: RegisterToolFn;

  constructor(router: EngineRouter) {
    this.router = router;
    this.server = new McpServer({ name: "OmniCAD-MCP", version: "1.0.0" });
    this.toolTimeoutMs = Number.parseInt(
      process.env.OMNICAD_MCP_TIMEOUT_MS ?? `${DEFAULT_TOOL_TIMEOUT_MS}`,
      10,
    );
    this.registerTool = (this.server.tool as unknown as RegisterToolFn).bind(
      this.server,
    );
    this._registerTools();
  }

  private _registerTools(): void {
    this.registerTool(
      "compile_and_measure",
      "Compiles CAD code and returns bounding box, volume, and topology for AI validation.",
      compileMeasureSchema.shape,
      async (rawArgs: Record<string, unknown>): Promise<ToolContent> =>
        this.compileAndMeasure(rawArgs),
    );

    this.registerTool(
      "export_geometry",
      "Exports CAD code to a specified file format (STEP, STL, IGES, glTF).",
      exportGeometrySchema.shape,
      async (rawArgs: Record<string, unknown>): Promise<ToolContent> =>
        this.exportGeometry(rawArgs),
    );

    this.registerTool(
      "get_engine_capabilities",
      "Returns shipped engine capabilities and file-extension routing metadata.",
      {},
      async (): Promise<ToolContent> => this.getEngineCapabilities(),
    );

    this.registerTool(
      "validate_source",
      "Runs lightweight engine-aware source validation before compile/export.",
      validateSourceSchema.shape,
      async (rawArgs: Record<string, unknown>): Promise<ToolContent> =>
        this.validateSource(rawArgs),
    );

    this.registerTool(
      "explain_compile_failure",
      "Compiles source and returns normalized failure hints for agent remediation.",
      explainCompileFailureSchema.shape,
      async (rawArgs: Record<string, unknown>): Promise<ToolContent> =>
        this.explainCompileFailure(rawArgs),
    );
  }

  private async withTimeout<T>(promise: Promise<T>, toolName: string): Promise<T> {
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          Object.assign(new Error(`Tool ${toolName} exceeded timeout.`), {
            code: "OMNICAD_MCP_TIMEOUT",
          }),
        );
      }, this.toolTimeoutMs);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  private getEngineForId(engine: EngineId): ICadEngine | undefined {
    return this.router.get(engineExtension(engine));
  }

  /**
   * Compiles source code with the requested engine and optionally returns BREP metadata.
   */
  public async compileAndMeasure(
    rawArgs: Record<string, unknown>,
  ): Promise<ToolContent> {
    const parsedArgs = compileMeasureSchema.safeParse(rawArgs);
    if (!parsedArgs.success) {
      return errorContent({
        code: "VALIDATION_FAILED",
        message: parsedArgs.error.message,
      });
    }

    const args: CompileMeasureArgs = parsedArgs.data;
    const adapter: ICadEngine | undefined = this.getEngineForId(args.engine);
    if (!adapter) {
      return errorContent({
        code: "ENGINE_NOT_FOUND",
        message: `Engine ${args.engine} not found`,
      });
    }

    try {
      const compileResult = await this.withTimeout(
        adapter.compile(args.code),
        "compile_and_measure",
      );
      if (!compileResult.success) {
        return errorContent({
          code: "COMPILE_FAILED",
          message: compileResult.errors.join("\n"),
        });
      }

      if (
        adapter.capabilities.renderable &&
        (!compileResult.meshes || compileResult.meshes.length === 0)
      ) {
        return errorContent({
          code: "COMPILE_FAILED",
          message: "Engine returned success but produced no meshes.",
        });
      }

      if (!adapter.capabilities.supportsBrepMetadata) {
        return successContent("compile_and_measure", {
          compile: compileResult,
          brep: null,
        });
      }

      const brepData = await this.withTimeout(
        adapter.getBrepMetadata(args.code),
        "compile_and_measure",
      );

      const b = brepData.boundingBox;
      if (
        !Number.isFinite(b.xMin) ||
        !Number.isFinite(b.xMax) ||
        !Number.isFinite(b.yMin) ||
        !Number.isFinite(b.yMax) ||
        !Number.isFinite(b.zMin) ||
        !Number.isFinite(b.zMax)
      ) {
        return errorContent({
          code: "RUNTIME_ERROR",
          message: "Engine returned non-finite bounding box values.",
        });
      }

      return successContent("compile_and_measure", {
        compile: compileResult,
        brep: brepData,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        err &&
        typeof err === "object" &&
        (err as { code?: string }).code === "OMNICAD_MCP_TIMEOUT"
      ) {
        return errorContent({
          code: "TIMEOUT",
          message,
        });
      }
      return errorContent({
        code: "RUNTIME_ERROR",
        message,
      });
    }
  }

  /**
   * Exports geometry using the requested engine/format pair when capability-gated support exists.
   */
  public async exportGeometry(
    rawArgs: Record<string, unknown>,
  ): Promise<ToolContent> {
    const parsedArgs = exportGeometrySchema.safeParse(rawArgs);
    if (!parsedArgs.success) {
      return errorContent({
        code: "VALIDATION_FAILED",
        message: parsedArgs.error.message,
      });
    }

    const args: ExportGeometryArgs = parsedArgs.data;
    const adapter: ICadEngine | undefined = this.getEngineForId(args.engine);
    if (!adapter) {
      return errorContent({
        code: "ENGINE_NOT_FOUND",
        message: `Engine ${args.engine} not found`,
      });
    }

    if (!adapter.capabilities.supportedExportFormats.includes(args.format)) {
      return errorContent({
        code: "UNSUPPORTED_FORMAT",
        message: `${adapter.id} does not support ${args.format} export`,
      });
    }

    try {
      const buf = await this.withTimeout(
        adapter.export(args.code, args.format),
        "export_geometry",
      );
      return successContent("export_geometry", {
        bytes: buf.length,
        format: args.format,
        adapterId: adapter.id,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        err &&
        typeof err === "object" &&
        (err as { code?: string }).code === "OMNICAD_MCP_TIMEOUT"
      ) {
        return errorContent({
          code: "TIMEOUT",
          message,
        });
      }
      return errorContent({
        code: "RUNTIME_ERROR",
        message,
      });
    }
  }

  public async getEngineCapabilities(): Promise<ToolContent> {
    const engineIds: EngineId[] = ["opengeometry", "freecad", "openscad"];
    const engines = engineIds.map((engineId) => {
      const adapter = this.getEngineForId(engineId);
      return {
        engineId,
        extension: engineExtension(engineId),
        adapterId: adapter?.id ?? null,
        capabilities: adapter?.capabilities ?? null,
      };
    });

    return successContent("get_engine_capabilities", {
      engines,
    });
  }

  public async validateSource(
    rawArgs: Record<string, unknown>,
  ): Promise<ToolContent> {
    const parsedArgs = validateSourceSchema.safeParse(rawArgs);
    if (!parsedArgs.success) {
      return errorContent({
        code: "VALIDATION_FAILED",
        message: parsedArgs.error.message,
      });
    }

    const args: ValidateSourceArgs = parsedArgs.data;
    const adapter = this.getEngineForId(args.engine);
    if (!adapter) {
      return errorContent({
        code: "ENGINE_NOT_FOUND",
        message: `Engine ${args.engine} not found`,
      });
    }

    const issues: string[] = [];
    const warnings: string[] = [];

    if (args.engine === "opengeometry") {
      if (!/export\s+const\s+model\s*=/.test(args.code)) {
        issues.push("OpenGeometry source must export `const model = () => ...`.");
      }
    }

    if (args.engine === "freecad") {
      if (!/(import\s+FreeCAD|import\s+Part)/.test(args.code)) {
        warnings.push("FreeCAD scripts commonly import FreeCAD and/or Part.");
      }
    }

    if (args.engine === "openscad") {
      const openParens = (args.code.match(/\(/g) ?? []).length;
      const closeParens = (args.code.match(/\)/g) ?? []).length;
      const openBraces = (args.code.match(/\{/g) ?? []).length;
      const closeBraces = (args.code.match(/\}/g) ?? []).length;
      if (openParens !== closeParens || openBraces !== closeBraces) {
        issues.push("OpenSCAD source has unbalanced parentheses or braces.");
      }
    }

    return successContent("validate_source", {
      engine: args.engine,
      valid: issues.length === 0,
      issues,
      warnings,
      maxCodeSize: MAX_CODE_SIZE,
    });
  }

  public async explainCompileFailure(
    rawArgs: Record<string, unknown>,
  ): Promise<ToolContent> {
    const parsedArgs = explainCompileFailureSchema.safeParse(rawArgs);
    if (!parsedArgs.success) {
      return errorContent({
        code: "VALIDATION_FAILED",
        message: parsedArgs.error.message,
      });
    }

    const args: ExplainCompileFailureArgs = parsedArgs.data;
    const adapter = this.getEngineForId(args.engine);
    if (!adapter) {
      return errorContent({
        code: "ENGINE_NOT_FOUND",
        message: `Engine ${args.engine} not found`,
      });
    }

    try {
      const compile = await this.withTimeout(
        adapter.compile(args.code),
        "explain_compile_failure",
      );
      if (compile.success) {
        return successContent("explain_compile_failure", {
          engine: args.engine,
          failed: false,
          message: "Compile succeeded; no failure explanation needed.",
        });
      }

      const rawErrors = compile.errors;
      const hints: string[] = [];
      for (const err of rawErrors) {
        const lower = err.toLowerCase();
        if (lower.includes("not found") || lower.includes("no such file")) {
          hints.push("Verify executable paths and required CAD dependencies.");
        }
        if (lower.includes("syntax") || lower.includes("parse")) {
          hints.push("Check source syntax for the selected CAD engine.");
        }
        if (lower.includes("unsupported") || lower.includes("not implemented")) {
          hints.push("Confirm format/feature support from engine capabilities.");
        }
        if (lower.includes("experimental")) {
          hints.push("Enable experimental runtime features when required.");
        }
      }

      if (hints.length === 0) {
        hints.push("Re-run validate_source and inspect rawErrors for adapter-specific context.");
      }

      return successContent("explain_compile_failure", {
        engine: args.engine,
        failed: true,
        rawErrors,
        hints: Array.from(new Set(hints)),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        err &&
        typeof err === "object" &&
        (err as { code?: string }).code === "OMNICAD_MCP_TIMEOUT"
      ) {
        return errorContent({
          code: "TIMEOUT",
          message,
        });
      }
      return errorContent({
        code: "RUNTIME_ERROR",
        message,
      });
    }
  }

  /** Connects the MCP server to stdio transport. */
  async start(): Promise<void> {
    this.transport = new StdioServerTransport();
    await this.server.connect(this.transport);
  }

  /** Closes transport and server resources. */
  async dispose(): Promise<void> {
    await (
      this.transport as { close?: () => Promise<void> | void } | undefined
    )?.close?.();
    await (this.server as { close?: () => Promise<void> | void }).close?.();
  }
}
