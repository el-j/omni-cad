import * as assert from "assert";
import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { EngineRouter } from "../../engines/EngineRouter";
import { OmniCadMcpServer } from "../../mcp/McpServer";
import envelopeFixtures from "../fixtures/mcp-envelope-fixtures.json";

const openscadExecutable = "/opt/homebrew/bin/openscad";

function parseEnvelope(text: string) {
  return JSON.parse(text) as {
    apiVersion: string;
    success: boolean;
    tool?: string;
    data?: Record<string, unknown>;
    error?: { code: string; message: string };
  };
}

suite("OmniCAD MCP Contracts", () => {
  test("compile_and_measure returns compile failure for disabled opengeometry runtime", async () => {
    const server = new OmniCadMcpServer(new EngineRouter());
    const result = await server.compileAndMeasure({
      code: "const x = 1;",
      engine: "opengeometry",
    });
    const envelope = parseEnvelope(result.content[0].text);
    assert.strictEqual(envelope.apiVersion, "1.1.0");
    assert.strictEqual(envelope.success, false);
    assert.strictEqual(envelope.error?.code, "COMPILE_FAILED");
  });

  test("export_geometry validates shape", async () => {
    const server = new OmniCadMcpServer(new EngineRouter());
    const result = await server.exportGeometry({
      code: "",
      engine: "openscad",
      format: "STL",
    });
    const envelope = parseEnvelope(result.content[0].text);
    assert.strictEqual(envelope.success, false);
    assert.strictEqual(envelope.error?.code, "VALIDATION_FAILED");
  });

  test("compile_and_measure handles empty mesh responses for renderable adapters", async () => {
    const fakeRouter = new EngineRouter();
    fakeRouter.get = () => ({
      id: "fake",
      capabilities: {
        supportedExportFormats: [],
        supportsBrepMetadata: false,
        renderable: true,
      },
      supportedExtensions: [".fake"],
      compile: async () => ({ success: true, meshes: [], computeTimeMs: 0 }),
      getBrepMetadata: async () => {
        throw new Error("Not implemented");
      },
      export: async () => {
        throw new Error("Not implemented");
      },
      dispose: () => {},
    });
    const server = new OmniCadMcpServer(fakeRouter);
    const result = await server.compileAndMeasure({
      code: "x",
      engine: "freecad",
    });
    const envelope = parseEnvelope(result.content[0].text);
    assert.strictEqual(envelope.success, false);
    assert.strictEqual(envelope.error?.code, "COMPILE_FAILED");
    assert.match(envelope.error?.message ?? "", /produced no meshes/);
  });

  test("compile_and_measure handles non-finite bounds", async () => {
    const fakeRouter = new EngineRouter();
    fakeRouter.get = () => ({
      id: "fake",
      capabilities: {
        supportedExportFormats: [],
        supportsBrepMetadata: true,
        renderable: true,
      },
      supportedExtensions: [".fake"],
      compile: async () => ({
        success: true,
        meshes: [{ vertices: [], normals: [], indices: [] }],
        computeTimeMs: 0,
      }),
      getBrepMetadata: async () => ({
        boundingBox: {
          xMin: Infinity,
          xMax: 1,
          yMin: 1,
          yMax: 1,
          zMin: 1,
          zMax: 1,
        },
        volume: 0,
        topology: { faces: 0, edges: 0, vertices: 0 },
      }),
      export: async () => {
        throw new Error("Not implemented");
      },
      dispose: () => {},
    });
    const server = new OmniCadMcpServer(fakeRouter);
    const result = await server.compileAndMeasure({
      code: "x",
      engine: "freecad",
    });
    const envelope = parseEnvelope(result.content[0].text);
    assert.strictEqual(envelope.success, false);
    assert.strictEqual(envelope.error?.code, "RUNTIME_ERROR");
    assert.match(envelope.error?.message ?? "", /non-finite bounding box values/);
  });

  test("export_geometry rejects formats unsupported by the engine", async () => {
    const fakeRouter = new EngineRouter();
    fakeRouter.get = () => ({
      id: "fake",
      capabilities: {
        supportedExportFormats: ["STL"],
        supportsBrepMetadata: true,
        renderable: true,
      },
      supportedExtensions: [".fake"],
      compile: async () => {
        throw new Error("Not implemented");
      },
      getBrepMetadata: async () => {
        throw new Error("Not implemented");
      },
      export: async () => {
        throw new Error("Not implemented");
      },
      dispose: () => {},
    });
    const server = new OmniCadMcpServer(fakeRouter);
    const result = await server.exportGeometry({
      code: "x",
      engine: "freecad",
      format: "STEP",
    });
    const envelope = parseEnvelope(result.content[0].text);
    assert.strictEqual(envelope.success, false);
    assert.strictEqual(envelope.error?.code, "UNSUPPORTED_FORMAT");
    assert.match(envelope.error?.message ?? "", /fake does not support STEP export/);
  });

  test("export_geometry succeeds for OpenSCAD STL when the binary is available", async function () {
    this.timeout(30000);
    if (!fs.existsSync(openscadExecutable)) {
      this.skip();
    }

    const server = new OmniCadMcpServer(
      new EngineRouter(undefined, openscadExecutable),
    );
    const result = await server.exportGeometry({
      code: "cube([1,2,3]);",
      engine: "openscad",
      format: "STL",
    });
    const envelope = parseEnvelope(result.content[0].text);
    assert.strictEqual(envelope.success, true);
    assert.strictEqual(envelope.tool, "export_geometry");
    assert.strictEqual(envelope.data?.format, "STL");
  });

  test("get_engine_capabilities returns capabilities envelope", async () => {
    const server = new OmniCadMcpServer(new EngineRouter());
    const result = await server.getEngineCapabilities();
    const envelope = parseEnvelope(result.content[0].text);
    assert.strictEqual(envelope.success, true);
    assert.strictEqual(envelope.tool, "get_engine_capabilities");
    assert.ok(Array.isArray(envelope.data?.engines));
  });

  test("validate_source reports invalid OpenGeometry source", async () => {
    const server = new OmniCadMcpServer(new EngineRouter());
    const result = await server.validateSource({
      code: "const bad = 1;",
      engine: "opengeometry",
    });
    const envelope = parseEnvelope(result.content[0].text);
    assert.strictEqual(envelope.success, true);
    assert.strictEqual(envelope.tool, "validate_source");
    assert.strictEqual(envelope.data?.valid, false);
  });

  test("explain_compile_failure returns remediation hints", async () => {
    const server = new OmniCadMcpServer(new EngineRouter());
    const result = await server.explainCompileFailure({
      code: "const x = 1;",
      engine: "opengeometry",
    });
    const envelope = parseEnvelope(result.content[0].text);
    assert.strictEqual(envelope.success, true);
    assert.strictEqual(envelope.tool, "explain_compile_failure");
    assert.strictEqual(envelope.data?.failed, true);
    assert.ok(Array.isArray(envelope.data?.hints));
  });

  test("envelope compatibility fixtures remain stable", async () => {
    const server = new OmniCadMcpServer(new EngineRouter());

    const validationResult = await server.validateSource({
      code: "const bad = 1;",
      engine: "opengeometry",
    });
    const validationEnvelope = parseEnvelope(validationResult.content[0].text);
    assert.deepStrictEqual(
      validationEnvelope,
      envelopeFixtures.validateSourceOpenGeometryInvalid,
    );

    const fakeRouter = new EngineRouter();
    fakeRouter.get = () => ({
      id: "fake",
      capabilities: {
        supportedExportFormats: ["STL"],
        supportsBrepMetadata: true,
        renderable: true,
      },
      supportedExtensions: [".fake"],
      compile: async () => {
        throw new Error("Not implemented");
      },
      getBrepMetadata: async () => {
        throw new Error("Not implemented");
      },
      export: async () => {
        throw new Error("Not implemented");
      },
      dispose: () => {},
    });

    const fakeServer = new OmniCadMcpServer(fakeRouter);
    const unsupportedResult = await fakeServer.exportGeometry({
      code: "x",
      engine: "freecad",
      format: "STEP",
    });
    const unsupportedEnvelope = parseEnvelope(unsupportedResult.content[0].text);
    assert.deepStrictEqual(unsupportedEnvelope, envelopeFixtures.unsupportedFormatError);
  });

  test("mcp entry starts without crashing", async function () {
    this.timeout(10000);
    const entryPath = path.resolve(__dirname, "../../mcp/entry.js");

    await new Promise<void>((resolve, reject) => {
      const child = cp.spawn(process.execPath, [entryPath], {
        env: {
          ...process.env,
          OMNICAD_OPENSCAD_PATH: openscadExecutable,
        },
        stdio: ["pipe", "pipe", "pipe"],
      });

      let exited = false;
      let stderr = "";

      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.once("error", reject);
      child.once("exit", (code, signal) => {
        exited = true;
        reject(
          new Error(
            `MCP entry exited early with code=${code} signal=${signal} stderr=${stderr}`,
          ),
        );
      });

      setTimeout(() => {
        if (exited) {
          return;
        }
        child.kill();
        resolve();
      }, 500);
    });
  });

  test("mcp stdio entry supports tool discovery and invocation", async function () {
    this.timeout(15000);

    const entryPath = path.resolve(__dirname, "../../mcp/entry.js");
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [entryPath],
      env: {
        ...process.env,
        OMNICAD_OPENSCAD_PATH: openscadExecutable,
      } as Record<string, string>,
      stderr: "pipe",
    });
    const client = new Client({
      name: "omnicad-test-client",
      version: "1.0.0",
    });

    try {
      await client.connect(transport);
      const tools = await client.listTools();
      assert.ok(
        tools.tools.some((tool) => tool.name === "compile_and_measure"),
      );
      assert.ok(tools.tools.some((tool) => tool.name === "export_geometry"));
      assert.ok(
        tools.tools.some((tool) => tool.name === "get_engine_capabilities"),
      );
      assert.ok(tools.tools.some((tool) => tool.name === "validate_source"));
      assert.ok(
        tools.tools.some((tool) => tool.name === "explain_compile_failure"),
      );

      const result = await client.callTool({
        name: "compile_and_measure",
        arguments: { code: "const x = 1;", engine: "opengeometry" },
      });

      const content = result.content as Array<{ type: string; text?: string }>;
      const textPart = content.find(
        (item) => item.type === "text" && typeof item.text === "string",
      );
      assert.ok(textPart, "expected text tool output");
      const envelope = parseEnvelope(textPart.text ?? "{}");
      assert.strictEqual(envelope.success, false);
      assert.strictEqual(envelope.error?.code, "COMPILE_FAILED");
    } finally {
      await transport.close();
    }
  });
});
