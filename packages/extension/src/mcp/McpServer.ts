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

type ToolContent = { content: Array<{ type: "text"; text: string }> };

interface ErrorResult {
  code:
    | "VALIDATION_FAILED"
    | "ENGINE_NOT_FOUND"
    | "UNSUPPORTED_FORMAT"
    | "COMPILE_FAILED"
    | "RUNTIME_ERROR";
  message: string;
}

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
    content: [{ type: "text", text: JSON.stringify({ error }, null, 2) }],
  };
}

const compileMeasureSchema = z.object({
  code: z.string().min(1).max(1_000_000).describe("The CAD script source code"),
  engine: z
    .enum(["opengeometry", "freecad", "openscad"] as const)
    .describe("The engine to compile with"),
});

const exportGeometrySchema = z.object({
  code: z.string().min(1).max(1_000_000).describe("The CAD script source code"),
  engine: z
    .enum(["opengeometry", "freecad", "openscad"] as const)
    .describe("The engine to use"),
  format: z
    .enum(["STEP", "STL", "IGES", "glTF"] as const)
    .describe("Export format"),
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
  // Narrowed reference to server.tool that bypasses the SDK's deep zod overloads (TS2589).
  private readonly registerTool: RegisterToolFn;

  constructor(router: EngineRouter) {
    this.router = router;
    this.server = new McpServer({ name: "OmniCAD-MCP", version: "1.0.0" });
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
    const adapter: ICadEngine | undefined = this.router.get(
      engineExtension(args.engine),
    );
    if (!adapter) {
      return errorContent({
        code: "ENGINE_NOT_FOUND",
        message: `Engine ${args.engine} not found`,
      });
    }

    try {
      const compileResult = await adapter.compile(args.code);
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
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { compile: compileResult, brep: null },
                null,
                2,
              ),
            },
          ],
        };
      }

      const brepData = await adapter.getBrepMetadata(args.code);

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

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { compile: compileResult, brep: brepData },
              null,
              2,
            ),
          },
        ],
      };
    } catch (err: unknown) {
      return errorContent({
        code: "RUNTIME_ERROR",
        message: err instanceof Error ? err.message : String(err),
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
    const adapter: ICadEngine | undefined = this.router.get(
      engineExtension(args.engine),
    );
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
      const buf = await adapter.export(args.code, args.format);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              bytes: buf.length,
              format: args.format,
            }),
          },
        ],
      };
    } catch (err: unknown) {
      return errorContent({
        code: "RUNTIME_ERROR",
        message: err instanceof Error ? err.message : String(err),
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
