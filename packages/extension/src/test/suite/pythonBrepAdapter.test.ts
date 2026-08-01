import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { PythonBrepAdapter } from "../../engines/PythonBrepAdapter";
import { ExportFormat } from "../../types";

class TestPythonBrepAdapter extends PythonBrepAdapter {
  id = "test-python-brep";
  supportedExtensions = [".py"];
  capabilities = {
    supportedExportFormats: ["STL"] as ExportFormat[],
    supportsBrepMetadata: true,
    renderable: true,
  };

  constructor(
    private readonly mode: "ascii" | "binary" | "throw" = "ascii",
  ) {
    super();
  }

  protected buildRunnerScript(): string {
    return "print('noop')";
  }

  protected async exportWithPython(
    _sourcePath: string,
    _code: string,
    exportPath: string,
  ): Promise<void> {
    if (this.mode === "throw") {
      throw new Error("synthetic export failure");
    }

    if (this.mode === "binary") {
      fs.writeFileSync(exportPath, buildBinaryStlBuffer());
      return;
    }

    fs.writeFileSync(exportPath, buildAsciiStl(), "utf8");
  }

  public exposeParseStl(filePath: string) {
    return this.parseStl(filePath);
  }

  public exposeBounds(vertices: number[]) {
    return this.calculateBounds(vertices);
  }

  public async exposeRunPython(scriptPath: string): Promise<void> {
    await this.runPython(scriptPath);
  }

  public setPythonExecutableForTest(executable: string): void {
    this.pythonExecutable = executable;
  }
}

function buildAsciiStl(): string {
  return [
    "solid test",
    "facet normal 0 0 1",
    "  outer loop",
    "    vertex 0 0 0",
    "    vertex 1 0 0",
    "    vertex 0 1 0",
    "  endloop",
    "endfacet",
    "endsolid test",
    "",
  ].join("\n");
}

function buildBinaryStlBuffer(): Buffer {
  const triangleCount = 1;
  const buffer = Buffer.alloc(84 + triangleCount * 50);
  buffer.writeUInt32LE(triangleCount, 80);
  const offset = 84;

  // normal
  buffer.writeFloatLE(0, offset);
  buffer.writeFloatLE(0, offset + 4);
  buffer.writeFloatLE(1, offset + 8);

  // v1
  buffer.writeFloatLE(0, offset + 12);
  buffer.writeFloatLE(0, offset + 16);
  buffer.writeFloatLE(0, offset + 20);

  // v2
  buffer.writeFloatLE(1, offset + 24);
  buffer.writeFloatLE(0, offset + 28);
  buffer.writeFloatLE(0, offset + 32);

  // v3
  buffer.writeFloatLE(0, offset + 36);
  buffer.writeFloatLE(1, offset + 40);
  buffer.writeFloatLE(0, offset + 44);

  // attribute byte count
  buffer.writeUInt16LE(0, offset + 48);
  return buffer;
}

suite("PythonBrepAdapter", () => {
  test("compile returns mesh payload on successful STL generation", async () => {
    const adapter = new TestPythonBrepAdapter("ascii");
    const result = await adapter.compile("print('ok')");

    assert.strictEqual(result.success, true);
    assert.ok(result.meshes.length > 0);
    assert.ok(result.meshes[0].vertices.length > 0);
    assert.ok(result.meshes[0].indices.length > 0);
  });

  test("compile returns structured failure when export pipeline throws", async () => {
    const adapter = new TestPythonBrepAdapter("throw");
    const result = await adapter.compile("print('boom')");

    assert.strictEqual(result.success, false);
    assert.match(result.errors[0], /synthetic export failure/);
  });

  test("export rejects unsupported formats", async () => {
    const adapter = new TestPythonBrepAdapter("ascii");
    await assert.rejects(() => adapter.export("print('x')", "STEP"), {
      message: /not implemented/,
    });
  });

  test("export writes STL bytes for supported format", async () => {
    const adapter = new TestPythonBrepAdapter("ascii");
    const payload = await adapter.export("print('x')", "STL");

    assert.ok(payload.byteLength > 0);
    assert.match(payload.toString("utf8"), /solid test/);
  });

  test("parseStl handles binary STL payloads", () => {
    const adapter = new TestPythonBrepAdapter("ascii");
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "omnicad-binary-stl-"));
    const filePath = path.join(tmpDir, "mesh.stl");
    fs.writeFileSync(filePath, buildBinaryStlBuffer());

    try {
      const mesh = adapter.exposeParseStl(filePath);
      assert.strictEqual(mesh.indices.length, 3);
      assert.strictEqual(mesh.vertices.length, 9);
      assert.strictEqual(mesh.normals.length, 9);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test("calculateBounds computes finite bounds", () => {
    const adapter = new TestPythonBrepAdapter();
    const bounds = adapter.exposeBounds([0, 1, 2, 3, 4, 5, -1, -2, -3]);

    assert.deepStrictEqual(bounds, {
      xMin: -1,
      xMax: 3,
      yMin: -2,
      yMax: 4,
      zMin: -3,
      zMax: 5,
    });
  });

  test("calculateBounds rejects non-finite vertices", () => {
    const adapter = new TestPythonBrepAdapter();
    assert.throws(
      () => adapter.exposeBounds([0, Number.NaN, 2]),
      /could not be computed/,
    );
  });

  test("runPython reports executable failures with adapter context", async () => {
    const adapter = new TestPythonBrepAdapter();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "omnicad-python-runner-"));
    const scriptPath = path.join(tmpDir, "runner.py");
    fs.writeFileSync(scriptPath, "print('hello')\n", "utf8");
    adapter.setPythonExecutableForTest("definitely-missing-python-executable");

    try {
      await assert.rejects(
        () => adapter.exposeRunPython(scriptPath),
        /Failed to execute definitely-missing-python-executable/,
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
