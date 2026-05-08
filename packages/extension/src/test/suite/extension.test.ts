import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { EngineRouter } from "../../engines/EngineRouter";
import { OpenGeometryAdapter } from "../../engines/OpenGeometryAdapter";
import { FreeCadAdapter } from "../../engines/FreeCadAdapter";
import { OpenScadAdapter } from "../../engines/OpenScadAdapter";
import { OmniCadMcpServer } from "../../mcp/McpServer";
import {
  getDefaultExportPath,
  getExportFileInfo,
} from "../../export/exportFormats";
import {
  ADAPTER_EXPORT_CAPABILITY_MATRIX,
  getAdapterCapabilityEntry,
} from "../../export/capabilityMatrix";
import {
  buildExportSaveDialog,
  exportToFile,
  resolveExportRequest,
} from "../../webview/exportFlow";
import { ExportFormat, ICadEngine } from "../../types";

const freecadExecutable =
  "/Applications/FreeCAD.app/Contents/Resources/bin/freecadcmd";
const openscadExecutable = "/opt/homebrew/bin/openscad";
const windpowerHelixStation =
  "/Users/rex-fab-alt/Documents/code/playground/windpower-3d/src/base/helix_station.py";

suite("OmniCAD Extension Tests", () => {
  suite("EngineRouter", () => {
    let router: EngineRouter;

    setup(() => {
      router = new EngineRouter();
    });

    teardown(() => {
      router.dispose();
    });

    test("routes .ts to OpenGeometryAdapter", () => {
      const engine = router.get(".ts");
      assert.ok(engine, "engine should exist for .ts");
      assert.strictEqual(engine?.id, "opengeometry");
    });

    test("routes .js to OpenGeometryAdapter", () => {
      const engine = router.get(".js");
      assert.ok(engine, "engine should exist for .js");
      assert.strictEqual(engine?.id, "opengeometry");
    });

    test("routes .py to FreeCadAdapter", () => {
      const engine = router.get(".py");
      assert.ok(engine, "engine should exist for .py");
      assert.strictEqual(engine?.id, "freecad");
    });

    test("routes .cq.py to CadQueryAdapter", () => {
      const engine = router.get(".cq.py");
      assert.ok(engine, "engine should exist for .cq.py");
      assert.strictEqual(engine?.id, "cadquery");
    });

    test("routes .b3d.py to Build123dAdapter", () => {
      const engine = router.get(".b3d.py");
      assert.ok(engine, "engine should exist for .b3d.py");
      assert.strictEqual(engine?.id, "build123d");
    });

    test("routes .fcmacro to FreeCadAdapter", () => {
      const engine = router.get(".fcmacro");
      assert.ok(engine, "engine should exist for .fcmacro");
      assert.strictEqual(engine?.id, "freecad");
    });

    test("routes .scad to OpenScadAdapter", () => {
      const engine = router.get(".scad");
      assert.ok(engine, "engine should exist for .scad");
      assert.strictEqual(engine?.id, "openscad");
    });

    test("returns undefined for unknown extension", () => {
      const engine = router.get(".xyz");
      assert.strictEqual(engine, undefined);
    });

    test("is case-insensitive", () => {
      const engine = router.get(".TS");
      assert.ok(engine, "should handle uppercase extensions");
      assert.strictEqual(engine?.id, "opengeometry");
    });
  });

  suite("OpenGeometryAdapter", () => {
    const adapter = new OpenGeometryAdapter();

    test("compile fails when experimental runtime is disabled", async () => {
      const result = await adapter.compile("// test code");
      assert.strictEqual(result.success, false);
      assert.ok(
        result.errors.length > 0,
        "should explain why opengeometry is disabled",
      );
      assert.ok(result.computeTimeMs >= 0);
    });

    test("compile mesh has vertices and indices when experimental runtime is enabled", async () => {
      const experimentalAdapter = new OpenGeometryAdapter(true);
      const result = await experimentalAdapter.compile(
        [
          "export const model = () => {",
          "  return box(10, 20, 30);",
          "};",
        ].join("\n"),
      );
      assert.strictEqual(
        result.success,
        true,
        !result.success ? result.errors.join("\n") : undefined,
      );
      assert.ok(
        result.meshes && result.meshes.length > 0,
        "expected at least one mesh",
      );
      const mesh = result.meshes![0];
      assert.ok(mesh.vertices.length > 0, "vertices should be non-empty");
      assert.ok(mesh.indices.length > 0, "indices should be non-empty");
    });

    test("getBrepMetadata returns expected structure when experimental runtime is enabled", async () => {
      const experimentalAdapter = new OpenGeometryAdapter(true);
      const meta = await experimentalAdapter.getBrepMetadata(
        [
          "export const model = () => {",
          "  return box(10, 20, 30);",
          "};",
        ].join("\n"),
      );
      assert.ok(typeof meta.volume === "number");
      assert.ok(typeof meta.boundingBox.xMin === "number");
      assert.ok(typeof meta.topology.faces === "number");
      assert.ok(
        meta.volume > 0,
        "expected computed non-zero volume from generated mesh bounds",
      );
    });

    test("export returns unsupported contract details until a real runtime exists", async () => {
      await assert.rejects(
        () => adapter.export("// test", "STL"),
        (err: unknown) => {
          assert.ok(err instanceof Error);
          const withCode = err as Error & {
            code?: string;
            adapter?: string;
            format?: string;
            hint?: string;
          };
          assert.strictEqual(withCode.code, "OMNICAD_UNSUPPORTED_EXPORT");
          assert.strictEqual(withCode.adapter, "opengeometry");
          assert.strictEqual(withCode.format, "STL");
          assert.match(
            withCode.message,
            /does not currently support STL export/,
          );
          assert.match(withCode.hint ?? "", /FreeCAD|OpenSCAD/);
          return true;
        },
      );
    });
  });

  suite("FreeCadAdapter", () => {
    const adapter = new FreeCadAdapter("nonexistent_freecad_cmd");

    test("compile returns failure when FreeCAD is not installed", async () => {
      const result = await adapter.compile("import FreeCAD");
      assert.strictEqual(result.success, false);
      assert.ok(result.errors && result.errors.length > 0);
    });

    test("compile returns a renderable mesh when FreeCAD is available", async function () {
      if (!fs.existsSync(freecadExecutable)) {
        this.skip();
      }

      const workingAdapter = new FreeCadAdapter(freecadExecutable);
      const result = await workingAdapter.compile(
        [
          "import FreeCAD as App",
          "import Part",
          'doc = App.newDocument("Smoke")',
          'box = doc.addObject("Part::Feature", "Box")',
          "box.Shape = Part.makeBox(1, 2, 3)",
        ].join("\n"),
      );

      assert.strictEqual(result.success, true);
      assert.ok(
        result.meshes && result.meshes.length === 1,
        "should export one mesh",
      );
      assert.ok(
        result.meshes![0].vertices.length > 0,
        "mesh should contain vertices",
      );
      assert.ok(
        result.meshes![0].indices.length > 0,
        "mesh should contain indices",
      );
    });

    test("compile preserves sourcePath so windpower scripts can resolve project-relative imports", async function () {
      if (
        !fs.existsSync(freecadExecutable) ||
        !fs.existsSync(windpowerHelixStation)
      ) {
        this.skip();
      }

      const workingAdapter = new FreeCadAdapter(freecadExecutable);
      const code = fs.readFileSync(windpowerHelixStation, "utf8");
      const result = await workingAdapter.compile(code, {
        sourcePath: windpowerHelixStation,
      });

      assert.strictEqual(
        result.success,
        true,
        !result.success ? result.errors.join("\n") : undefined,
      );
      assert.ok(
        result.meshes && result.meshes.length === 1,
        "windpower script should produce a mesh",
      );
      assert.ok(
        result.meshes![0].vertices.length > 300,
        "windpower mesh should be non-trivial",
      );
    });

    test("export returns STL bytes when FreeCAD is available", async function () {
      this.timeout(30000);
      if (!fs.existsSync(freecadExecutable)) {
        this.skip();
      }

      const workingAdapter = new FreeCadAdapter(freecadExecutable);
      const buf = await workingAdapter.export(
        [
          "import FreeCAD as App",
          "import Part",
          'doc = App.newDocument("Smoke")',
          'box = doc.addObject("Part::Feature", "Box")',
          "box.Shape = Part.makeBox(1, 2, 3)",
        ].join("\n"),
        "STL",
      );

      assert.ok(Buffer.isBuffer(buf));
      assert.ok(buf.length > 84, "expected STL export content");
    });

    test("export returns STEP bytes when FreeCAD is available", async function () {
      this.timeout(30000);
      if (!fs.existsSync(freecadExecutable)) {
        this.skip();
      }

      const workingAdapter = new FreeCadAdapter(freecadExecutable);
      const buf = await workingAdapter.export(
        [
          "import FreeCAD as App",
          "import Part",
          'doc = App.newDocument("Smoke")',
          'box = doc.addObject("Part::Feature", "Box")',
          "box.Shape = Part.makeBox(1, 2, 3)",
        ].join("\n"),
        "STEP",
      );

      assert.ok(Buffer.isBuffer(buf));
      assert.ok(buf.length > 32, "expected STEP export content");
      assert.match(
        buf.toString("utf8", 0, Math.min(buf.length, 128)),
        /ISO-10303|FILE_DESCRIPTION|STEP/i,
      );
    });

    test("export returns IGES bytes when FreeCAD is available", async function () {
      this.timeout(30000);
      if (!fs.existsSync(freecadExecutable)) {
        this.skip();
      }

      const workingAdapter = new FreeCadAdapter(freecadExecutable);
      const buf = await workingAdapter.export(
        [
          "import FreeCAD as App",
          "import Part",
          'doc = App.newDocument("Smoke")',
          'box = doc.addObject("Part::Feature", "Box")',
          "box.Shape = Part.makeBox(1, 2, 3)",
        ].join("\n"),
        "IGES",
      );

      assert.ok(Buffer.isBuffer(buf));
      assert.ok(buf.length > 32, "expected IGES export content");
      assert.match(
        buf.toString("utf8", 0, Math.min(buf.length, 256)),
        /S\s+1|IGES|Copyright/i,
      );
    });

    test("export rejects unsupported formats", async function () {
      if (!fs.existsSync(freecadExecutable)) {
        this.skip();
      }

      const workingAdapter = new FreeCadAdapter(freecadExecutable);
      await assert.rejects(() => workingAdapter.export('print("x")', "glTF"));
    });
  });

  suite("OpenScadAdapter", () => {
    const adapter = new OpenScadAdapter("nonexistent_openscad_cmd");

    test("compile returns failure when openscad is not installed", async () => {
      const result = await adapter.compile("cube([1,1,1]);");
      assert.strictEqual(result.success, false);
      assert.ok(result.errors && result.errors.length > 0);
    });

    test("compile returns a renderable mesh when OpenSCAD is available", async function () {
      this.timeout(30000);
      if (!fs.existsSync(openscadExecutable)) {
        this.skip();
      }

      const workingAdapter = new OpenScadAdapter(openscadExecutable);
      const result = await workingAdapter.compile("cube([1,2,3]);");

      assert.strictEqual(result.success, true);
      assert.ok(
        result.meshes && result.meshes.length === 1,
        "should export one mesh",
      );
      assert.ok(
        result.meshes![0].vertices.length > 0,
        "mesh should contain vertices",
      );
      assert.ok(
        result.meshes![0].indices.length > 0,
        "mesh should contain indices",
      );
    });

    test("export returns STL bytes when OpenSCAD is available", async function () {
      this.timeout(30000);
      if (!fs.existsSync(openscadExecutable)) {
        this.skip();
      }

      const workingAdapter = new OpenScadAdapter(openscadExecutable);
      const buf = await workingAdapter.export("cube([1,2,3]);", "STL");

      assert.ok(Buffer.isBuffer(buf));
      assert.ok(buf.length > 84, "expected binary STL content");
    });

    test("export rejects unsupported formats", async function () {
      if (!fs.existsSync(openscadExecutable)) {
        this.skip();
      }

      const workingAdapter = new OpenScadAdapter(openscadExecutable);
      await assert.rejects(() =>
        workingAdapter.export("cube([1,2,3]);", "STEP"),
      );
    });
  });

  suite("CadQueryAdapter", () => {
    test("router exposes CadQuery STL capability", () => {
      const router = new EngineRouter();
      assert.deepStrictEqual(
        router.getCapabilities(".cq.py")?.supportedExportFormats,
        ["STL"],
      );
      router.dispose();
    });

    test("compound extension helper resolves .cq.py correctly", () => {
      assert.strictEqual(
        EngineRouter.getExtensionForFileName("/tmp/model.cq.py"),
        ".cq.py",
      );
      assert.strictEqual(
        EngineRouter.getExtensionForFileName("/tmp/model.b3d.py"),
        ".b3d.py",
      );
      assert.strictEqual(
        EngineRouter.getExtensionForFileName("/tmp/model.py"),
        ".py",
      );
      assert.strictEqual(
        EngineRouter.getExtensionForFileName("/tmp/model.scad"),
        ".scad",
      );
    });

    test("resolveExportRequest routes .cq.py through cadquery capability model", () => {
      const result = resolveExportRequest(
        "STL",
        {
          document: {
            fileName: "/tmp/model.cq.py",
            isUntitled: false,
            getText: () => "result = None",
          },
        },
        (ext) => {
          if (ext !== ".cq.py") {
            return undefined;
          }

          return {
            id: "cadquery",
            supportedExtensions: [".cq.py"],
            capabilities: {
              supportedExportFormats: ["STL"] as ExportFormat[],
              supportsBrepMetadata: true,
              renderable: true,
            },
            compile: async () => ({
              success: true,
              meshes: [],
              computeTimeMs: 0,
            }),
            getBrepMetadata: async () => ({
              boundingBox: {
                xMin: 0,
                xMax: 0,
                yMin: 0,
                yMax: 0,
                zMin: 0,
                zMax: 0,
              },
              volume: 0,
              topology: { faces: 0, edges: 0, vertices: 0 },
            }),
            export: async () => Buffer.from("x"),
            dispose: () => {},
          };
        },
      );

      assert.strictEqual(result.ok, true);
    });
  });

  suite("Build123dAdapter", () => {
    test("router exposes build123d STL capability", () => {
      const router = new EngineRouter();
      assert.deepStrictEqual(
        router.getCapabilities(".b3d.py")?.supportedExportFormats,
        ["STL"],
      );
      router.dispose();
    });
  });

  suite("Engine capabilities", () => {
    test("router exposes FreeCAD STL, STEP, and IGES capability", () => {
      const router = new EngineRouter();
      assert.deepStrictEqual(
        router.getCapabilities(".py")?.supportedExportFormats,
        ["STL", "STEP", "IGES"],
      );
      router.dispose();
    });

    test("router exposes OpenSCAD STL capability", () => {
      const router = new EngineRouter();
      assert.deepStrictEqual(
        router.getCapabilities(".scad")?.supportedExportFormats,
        ["STL"],
      );
      router.dispose();
    });

    test("capability matrix stays aligned with routed adapter capabilities", () => {
      const router = new EngineRouter();

      assert.deepStrictEqual(
        router.getCapabilities(".py")?.supportedExportFormats,
        getAdapterCapabilityEntry("freecad").supportedExportFormats,
      );
      assert.deepStrictEqual(
        router.getCapabilities(".scad")?.supportedExportFormats,
        getAdapterCapabilityEntry("openscad").supportedExportFormats,
      );
      assert.deepStrictEqual(
        router.getCapabilities(".cq.py")?.supportedExportFormats,
        getAdapterCapabilityEntry("cadquery").supportedExportFormats,
      );
      assert.deepStrictEqual(
        router.getCapabilities(".b3d.py")?.supportedExportFormats,
        getAdapterCapabilityEntry("build123d").supportedExportFormats,
      );
      assert.deepStrictEqual(
        router.getCapabilities(".ts")?.supportedExportFormats,
        getAdapterCapabilityEntry("opengeometry").supportedExportFormats,
      );

      router.dispose();
    });

    test("capability matrix includes all known runtime adapters", () => {
      const adapterIds = ADAPTER_EXPORT_CAPABILITY_MATRIX.map(
        (entry) => entry.adapterId,
      ).sort();
      assert.deepStrictEqual(adapterIds, [
        "build123d",
        "cadquery",
        "freecad",
        "opengeometry",
        "openscad",
      ]);
    });
  });

  suite("Engine discovery", () => {
    test("discovers macOS default app paths when present", () => {
      const discovered = EngineRouter.discoverInstalledEngines({
        platform: "darwin",
        env: {},
        fileExists: (candidatePath: string) =>
          candidatePath ===
            "/Applications/FreeCAD.app/Contents/Resources/bin/freecadcmd" ||
          candidatePath ===
            "/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD",
        isExecutable: () => true,
      });

      assert.strictEqual(
        discovered.freecadPath,
        "/Applications/FreeCAD.app/Contents/Resources/bin/freecadcmd",
      );
      assert.strictEqual(
        discovered.openscadPath,
        "/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD",
      );
      assert.deepStrictEqual(discovered.warnings, []);
    });

    test("falls back to PATH lookup when default locations are unavailable", () => {
      const discovered = EngineRouter.discoverInstalledEngines({
        platform: "linux",
        env: { PATH: "/tmp/bin:/opt/cad" },
        fileExists: (candidatePath: string) =>
          candidatePath === "/opt/cad/openscad",
        isExecutable: () => true,
      });

      assert.strictEqual(discovered.openscadPath, "/opt/cad/openscad");
    });

    test("treats missing absolute configured path as stale", () => {
      assert.strictEqual(
        EngineRouter.isConfiguredPathStale("/tmp/does-not-exist"),
        true,
      );
    });

    test("does not treat command aliases as stale configured paths", () => {
      assert.strictEqual(EngineRouter.isConfiguredPathStale("openscad"), false);
      assert.strictEqual(
        EngineRouter.isConfiguredPathStale("FreeCADCmd"),
        false,
      );
    });
  });

  suite("export format metadata", () => {
    test("builds default export paths from source file names", () => {
      assert.strictEqual(
        getDefaultExportPath("/tmp/model.py", "STEP"),
        path.join("/tmp", "model.step"),
      );
      assert.strictEqual(
        getDefaultExportPath("/tmp/model.scad", "STL"),
        path.join("/tmp", "model.stl"),
      );
    });

    test("returns save metadata for STEP", () => {
      assert.deepStrictEqual(getExportFileInfo("STEP"), {
        label: "STEP model",
        extensions: ["step", "stp"],
        defaultExtension: "step",
      });
    });

    test("returns save metadata for IGES", () => {
      assert.deepStrictEqual(getExportFileInfo("IGES"), {
        label: "IGES model",
        extensions: ["iges", "igs"],
        defaultExtension: "iges",
      });
    });
  });

  suite("OmniCadMcpServer", () => {
    test("compile_and_measure rejects invalid input", async () => {
      const server = new OmniCadMcpServer(new EngineRouter());
      const result = await server.compileAndMeasure({ engine: "freecad" });
      assert.match(result.content[0].text, /VALIDATION_FAILED/);
    });

    test("export_geometry rejects unsupported format for openscad", async () => {
      const server = new OmniCadMcpServer(new EngineRouter());
      const result = await server.exportGeometry({
        code: "cube([1,1,1]);",
        engine: "openscad",
        format: "STEP",
      });
      assert.match(result.content[0].text, /UNSUPPORTED_FORMAT/);
    });
  });

  suite("webview export flow helpers", () => {
    function fakeEditor(fileName: string, text: string, isUntitled = false) {
      return {
        document: {
          fileName,
          isUntitled,
          getText: () => text,
        },
      };
    }

    test("buildExportSaveDialog provides default STEP path and filter metadata", () => {
      const dialog = buildExportSaveDialog("STEP", {
        fileName: "/tmp/model.py",
        isUntitled: false,
        getText: () => "ignored",
      });

      assert.strictEqual(dialog.defaultPath, path.join("/tmp", "model.step"));
      assert.strictEqual(dialog.saveLabel, "Export STEP");
      assert.deepStrictEqual(dialog.filters, {
        "STEP model": ["step", "stp"],
      });
    });

    test("buildExportSaveDialog omits default path for untitled files", () => {
      const dialog = buildExportSaveDialog("STL", {
        fileName: "untitled:Untitled-1",
        isUntitled: true,
        getText: () => "ignored",
      });

      assert.strictEqual(dialog.defaultPath, undefined);
      assert.deepStrictEqual(dialog.filters, {
        "STL mesh": ["stl"],
      });
    });

    test("resolveExportRequest rejects unsupported format", () => {
      const result = resolveExportRequest(
        "glTF",
        fakeEditor("/tmp/model.py", 'print("x")'),
        () => ({
          id: "fake",
          supportedExtensions: [".py"],
          capabilities: {
            supportedExportFormats: ["STL"],
            supportsBrepMetadata: false,
            renderable: true,
          },
          compile: async () => ({
            success: true,
            meshes: [],
            computeTimeMs: 0,
          }),
          getBrepMetadata: async () => ({
            boundingBox: {
              xMin: 0,
              xMax: 0,
              yMin: 0,
              yMax: 0,
              zMin: 0,
              zMax: 0,
            },
            volume: 0,
            topology: { faces: 0, edges: 0, vertices: 0 },
          }),
          export: async () => Buffer.from("x"),
          dispose: () => {},
        }),
      );

      assert.strictEqual(result.ok, false);
      if (!result.ok) {
        assert.match(result.message, /does not support glTF export/);
      }
    });

    test("resolveExportRequest rejects when no active editor exists", () => {
      const result = resolveExportRequest("STL", undefined, () => undefined);
      assert.strictEqual(result.ok, false);
      if (!result.ok) {
        assert.strictEqual(result.message, "No active editor");
      }
    });

    test("resolveExportRequest rejects when no engine exists for extension", () => {
      const result = resolveExportRequest(
        "STL",
        fakeEditor("/tmp/model.unknown", "x"),
        () => undefined,
      );
      assert.strictEqual(result.ok, false);
      if (!result.ok) {
        assert.match(result.message, /No engine for extension \.unknown/);
      }
    });

    test("resolveExportRequest returns export context for supported engine", () => {
      const engine: ICadEngine = {
        id: "freecad",
        supportedExtensions: [".py"],
        capabilities: {
          supportedExportFormats: ["STL", "STEP", "IGES"] as ExportFormat[],
          supportsBrepMetadata: true,
          renderable: true,
        },
        compile: async () => ({
          success: true as const,
          meshes: [],
          computeTimeMs: 0,
        }),
        getBrepMetadata: async () => ({
          boundingBox: { xMin: 0, xMax: 1, yMin: 0, yMax: 1, zMin: 0, zMax: 1 },
          volume: 1,
          topology: { faces: 1, edges: 1, vertices: 1 },
        }),
        export: async () => Buffer.from("x"),
        dispose: () => {},
      };

      const result = resolveExportRequest(
        "STEP",
        fakeEditor("/tmp/model.py", 'print("x")'),
        () => engine,
      );
      assert.strictEqual(result.ok, true);
      if (result.ok) {
        assert.strictEqual(result.sourcePath, "/tmp/model.py");
        assert.strictEqual(result.code, 'print("x")');
        assert.strictEqual(
          result.saveDialog.defaultPath,
          path.join("/tmp", "model.step"),
        );
      }
    });

    test("exportToFile writes exported bytes and forwards sourcePath", async () => {
      const tmpDir = fs.mkdtempSync(
        path.join("/tmp", "omnicad-exportflow-test-"),
      );
      const targetPath = path.join(tmpDir, "model.step");
      let capturedSourcePath: string | undefined;

      const engine: ICadEngine = {
        id: "freecad",
        supportedExtensions: [".py"],
        capabilities: {
          supportedExportFormats: ["STL", "STEP", "IGES"] as ExportFormat[],
          supportsBrepMetadata: true,
          renderable: true,
        },
        compile: async () => ({
          success: true as const,
          meshes: [],
          computeTimeMs: 0,
        }),
        getBrepMetadata: async () => ({
          boundingBox: { xMin: 0, xMax: 1, yMin: 0, yMax: 1, zMin: 0, zMax: 1 },
          volume: 1,
          topology: { faces: 1, edges: 1, vertices: 1 },
        }),
        export: async (
          _code: string,
          _format: ExportFormat,
          options?: { sourcePath?: string },
        ) => {
          capturedSourcePath = options?.sourcePath;
          return Buffer.from("STEP_BYTES");
        },
        dispose: () => {},
      };

      await exportToFile(
        engine,
        'print("x")',
        "STEP",
        "/tmp/model.py",
        targetPath,
        (dest, data) => fs.writeFileSync(dest, data),
      );

      assert.strictEqual(capturedSourcePath, "/tmp/model.py");
      assert.strictEqual(fs.readFileSync(targetPath, "utf8"), "STEP_BYTES");

      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    test("exportToFile propagates write errors", async () => {
      const engine: ICadEngine = {
        id: "freecad",
        supportedExtensions: [".py"],
        capabilities: {
          supportedExportFormats: ["STL", "STEP", "IGES"] as ExportFormat[],
          supportsBrepMetadata: true,
          renderable: true,
        },
        compile: async () => ({
          success: true as const,
          meshes: [],
          computeTimeMs: 0,
        }),
        getBrepMetadata: async () => ({
          boundingBox: { xMin: 0, xMax: 1, yMin: 0, yMax: 1, zMin: 0, zMax: 1 },
          volume: 1,
          topology: { faces: 1, edges: 1, vertices: 1 },
        }),
        export: async () => Buffer.from("STEP_BYTES"),
        dispose: () => {},
      };

      await assert.rejects(
        () =>
          exportToFile(
            engine,
            'print("x")',
            "STEP",
            "/tmp/model.py",
            "/tmp/no-permission.step",
            () => {
              const err = new Error("EACCES: permission denied");
              (err as Error & { code?: string }).code = "EACCES";
              throw err;
            },
          ),
        /EACCES/,
      );
    });
  });
});
