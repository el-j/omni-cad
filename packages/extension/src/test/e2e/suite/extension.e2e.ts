import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import * as cp from "child_process";
import {
  clearLastCompileResultForTest,
  getLastCompileResultForTest,
} from "../../../extension";
import { FreeCadAdapter } from "../../../engines/FreeCadAdapter";
import { OpenScadAdapter } from "../../../engines/OpenScadAdapter";
import { CadQueryAdapter } from "../../../engines/CadQueryAdapter";
import { Build123dAdapter } from "../../../engines/Build123dAdapter";
import { OpenGeometryAdapter } from "../../../engines/OpenGeometryAdapter";

const EXTENSION_ID = "omni-cad.omni-cad";
const freecadExecutable =
  "/Applications/FreeCAD.app/Contents/Resources/bin/freecadcmd";
const openscadExecutable = "/opt/homebrew/bin/openscad";
const windpowerHelixStation =
  "/Users/rex-fab-alt/Documents/code/playground/windpower-3d/src/base/helix_station.py";

function pythonModuleAvailable(moduleName: string): boolean {
  try {
    cp.execFileSync("python3", ["-c", `import ${moduleName}`], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

suite("OmniCAD E2E Tests", function () {
  // Longer timeout: VS Code activation can take a few seconds
  this.timeout(30000);

  suiteSetup(async () => {
    await vscode.workspace
      .getConfiguration("omniCAD")
      .update("freecadPath", undefined, vscode.ConfigurationTarget.Global);
    await vscode.workspace
      .getConfiguration("omniCAD")
      .update("openscadPath", undefined, vscode.ConfigurationTarget.Global);
    await vscode.workspace
      .getConfiguration("omniCAD")
      .update("mcpEnabled", undefined, vscode.ConfigurationTarget.Global);
    await vscode.workspace
      .getConfiguration("omniCAD")
      .update(
        "enableExperimentalOpenGeometry",
        undefined,
        vscode.ConfigurationTarget.Global,
      );

    // Trigger activation explicitly so the extension is ready for all tests
    const ext = vscode.extensions.getExtension(EXTENSION_ID);
    if (ext && !ext.isActive) {
      await ext.activate();
    }
  });

  test("Extension is installed", () => {
    const ext = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(ext, `Extension "${EXTENSION_ID}" should be installed`);
  });

  test("Extension activates without error", async () => {
    const ext = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(ext, `Extension "${EXTENSION_ID}" should be installed`);
    if (!ext.isActive) {
      await ext.activate();
    }
    assert.ok(ext.isActive, "Extension should be active after activation");
  });

  test("omniCAD.openViewer command is registered", async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes("omniCAD.openViewer"),
      "The omniCAD.openViewer command should be registered",
    );
  });

  test("Extension contributes freecadPath configuration", () => {
    const config = vscode.workspace.getConfiguration("omniCAD");
    assert.ok(
      config.has("freecadPath"),
      "omniCAD.freecadPath configuration property should exist",
    );
    assert.strictEqual(
      config.get<string>("freecadPath"),
      "FreeCADCmd",
      'freecadPath default should be "FreeCADCmd"',
    );
  });

  test("Extension contributes openscadPath configuration", () => {
    const config = vscode.workspace.getConfiguration("omniCAD");
    assert.ok(
      config.has("openscadPath"),
      "omniCAD.openscadPath configuration property should exist",
    );
    assert.strictEqual(
      config.get<string>("openscadPath"),
      "openscad",
      'openscadPath default should be "openscad"',
    );
  });

  test("Extension contributes MCP and experimental OpenGeometry configuration", () => {
    const config = vscode.workspace.getConfiguration("omniCAD");
    assert.ok(
      config.has("mcpEnabled"),
      "omniCAD.mcpEnabled configuration property should exist",
    );
    assert.strictEqual(
      config.get<boolean>("mcpEnabled"),
      false,
      "mcpEnabled default should be false",
    );
    assert.ok(
      config.has("enableExperimentalOpenGeometry"),
      "omniCAD.enableExperimentalOpenGeometry configuration property should exist",
    );
    assert.strictEqual(
      config.get<boolean>("enableExperimentalOpenGeometry"),
      false,
      "enableExperimentalOpenGeometry default should be false",
    );
  });

  test("saving a FreeCAD windpower file produces a renderable mesh payload", async function () {
    if (
      !fs.existsSync(freecadExecutable) ||
      !fs.existsSync(windpowerHelixStation)
    ) {
      this.skip();
    }

    await vscode.workspace
      .getConfiguration("omniCAD")
      .update(
        "freecadPath",
        freecadExecutable,
        vscode.ConfigurationTarget.Global,
      );

    await vscode.commands.executeCommand("omniCAD.openViewer");

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "omnicad-e2e-"));
    const tempFile = path.join(tempDir, "helix_station.py");
    fs.copyFileSync(windpowerHelixStation, tempFile);

    try {
      const doc = await vscode.workspace.openTextDocument(tempFile);
      const editor = await vscode.window.showTextDocument(doc);
      clearLastCompileResultForTest();

      const edit = new vscode.WorkspaceEdit();
      edit.insert(
        doc.uri,
        new vscode.Position(doc.lineCount, 0),
        "\n# omniCAD e2e\n",
      );
      await vscode.workspace.applyEdit(edit);
      await doc.save();

      for (let attempt = 0; attempt < 20; attempt += 1) {
        const result = getLastCompileResultForTest();
        if (result) {
          assert.strictEqual(
            result.success,
            true,
            !result.success ? result.errors.join("\n") : undefined,
          );
          assert.ok(
            result.meshes && result.meshes.length > 0,
            "expected at least one rendered mesh",
          );
          assert.ok(
            result.meshes[0].vertices.length > 0,
            "expected mesh vertices to be present",
          );
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      assert.fail("expected a compile result after saving the file");
      void editor;
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
      await vscode.workspace
        .getConfiguration("omniCAD")
        .update("freecadPath", undefined, vscode.ConfigurationTarget.Global);
    }
  });

  test("saving an OpenSCAD file produces a renderable mesh payload after config reload", async function () {
    if (!fs.existsSync(openscadExecutable)) {
      this.skip();
    }

    const config = vscode.workspace.getConfiguration("omniCAD");
    await config.update(
      "openscadPath",
      "/definitely/missing/openscad",
      vscode.ConfigurationTarget.Global,
    );
    await config.update(
      "openscadPath",
      openscadExecutable,
      vscode.ConfigurationTarget.Global,
    );

    await vscode.commands.executeCommand("omniCAD.openViewer");

    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "omnicad-openscad-e2e-"),
    );
    const tempFile = path.join(tempDir, "cube.scad");
    fs.writeFileSync(tempFile, "cube([1, 2, 3]);\n", "utf8");

    try {
      const doc = await vscode.workspace.openTextDocument(tempFile);
      await vscode.window.showTextDocument(doc);
      clearLastCompileResultForTest();

      const edit = new vscode.WorkspaceEdit();
      edit.insert(
        doc.uri,
        new vscode.Position(doc.lineCount, 0),
        "\n// omniCAD e2e\n",
      );
      await vscode.workspace.applyEdit(edit);
      await doc.save();

      for (let attempt = 0; attempt < 20; attempt += 1) {
        const result = getLastCompileResultForTest();
        if (result) {
          assert.strictEqual(
            result.success,
            true,
            !result.success ? result.errors.join("\n") : undefined,
          );
          assert.ok(
            result.meshes.length > 0,
            "expected at least one rendered mesh",
          );
          assert.ok(
            result.meshes[0].vertices.length > 0,
            "expected mesh vertices to be present",
          );
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      assert.fail("expected an OpenSCAD compile result after saving the file");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
      await config.update(
        "openscadPath",
        undefined,
        vscode.ConfigurationTarget.Global,
      );
    }
  });

  test("FreeCAD export writes a non-empty STEP artifact when FreeCAD is available", async function () {
    this.timeout(30000);
    if (!fs.existsSync(freecadExecutable)) {
      this.skip();
    }

    const adapter = new FreeCadAdapter(freecadExecutable);
    const outDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "omnicad-e2e-freecad-export-"),
    );
    const outPath = path.join(outDir, "artifact.step");
    try {
      const payload = await adapter.export(
        [
          "import FreeCAD as App",
          "import Part",
          'doc = App.newDocument("Smoke")',
          'box = doc.addObject("Part::Feature", "Box")',
          "box.Shape = Part.makeBox(1, 2, 3)",
        ].join("\n"),
        "STEP",
      );
      fs.writeFileSync(outPath, payload);

      assert.ok(fs.existsSync(outPath), "expected STEP file to be created");
      assert.ok(fs.statSync(outPath).size > 0, "expected STEP file size > 0");
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });

  test("OpenGeometry export writes a non-empty STL artifact when experimental mode is enabled", async function () {
    this.timeout(30000);

    const adapter = new OpenGeometryAdapter(true);
    const outDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "omnicad-e2e-opengeometry-export-"),
    );
    const outPath = path.join(outDir, "artifact.stl");
    try {
      const payload = await adapter.export(
        [
          "export const model = () => {",
          "  return box(2, 3, 4);",
          "};",
        ].join("\n"),
        "STL",
      );
      fs.writeFileSync(outPath, payload);

      assert.ok(
        fs.existsSync(outPath),
        "expected OpenGeometry STL file to be created",
      );
      assert.ok(
        fs.statSync(outPath).size > 0,
        "expected OpenGeometry STL file size > 0",
      );
      assert.match(
        payload.toString("utf8"),
        /solid omnicad_opengeometry/,
        "expected OpenGeometry STL header",
      );
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });

  test("OpenSCAD export writes a non-empty STL artifact when OpenSCAD is available", async function () {
    this.timeout(30000);
    if (!fs.existsSync(openscadExecutable)) {
      this.skip();
    }

    const adapter = new OpenScadAdapter(openscadExecutable);
    const outDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "omnicad-e2e-openscad-export-"),
    );
    const outPath = path.join(outDir, "artifact.stl");
    try {
      const payload = await adapter.export("cube([1,2,3]);", "STL");
      fs.writeFileSync(outPath, payload);

      assert.ok(fs.existsSync(outPath), "expected STL file to be created");
      assert.ok(fs.statSync(outPath).size > 0, "expected STL file size > 0");
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });

  test("OpenSCAD export failure and recovery path is stable", async function () {
    this.timeout(30000);
    if (!fs.existsSync(openscadExecutable)) {
      this.skip();
    }

    const adapter = new OpenScadAdapter(openscadExecutable);
    const outDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "omnicad-e2e-openscad-recovery-"),
    );
    const recoveredPath = path.join(outDir, "recovered.stl");

    try {
      await assert.rejects(
        () => adapter.export("cube([1,2,3]);", "STEP"),
        /not implemented/,
      );

      const payload = await adapter.export("cube([1,2,3]);", "STL");
      fs.writeFileSync(recoveredPath, payload);
      assert.ok(
        fs.existsSync(recoveredPath),
        "expected recovered STL file to be created",
      );
      assert.ok(
        fs.statSync(recoveredPath).size > 0,
        "expected recovered STL file size > 0",
      );
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });

  test("CadQuery export writes a non-empty STL artifact when CadQuery is available", async function () {
    this.timeout(30000);
    if (!pythonModuleAvailable("cadquery")) {
      this.skip();
    }

    const adapter = new CadQueryAdapter();
    const outDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "omnicad-e2e-cadquery-export-"),
    );
    const outPath = path.join(outDir, "artifact.stl");
    try {
      const payload = await adapter.export(
        'import cadquery as cq\nresult = cq.Workplane("XY").box(2, 3, 4)',
        "STL",
      );
      fs.writeFileSync(outPath, payload);

      assert.ok(
        fs.existsSync(outPath),
        "expected CadQuery STL file to be created",
      );
      assert.ok(
        fs.statSync(outPath).size > 0,
        "expected CadQuery STL file size > 0",
      );
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });

  test("build123d export writes a non-empty STL artifact when build123d is available", async function () {
    this.timeout(30000);
    if (!pythonModuleAvailable("build123d")) {
      this.skip();
    }

    const adapter = new Build123dAdapter();
    const outDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "omnicad-e2e-build123d-export-"),
    );
    const outPath = path.join(outDir, "artifact.stl");
    try {
      const payload = await adapter.export(
        "from build123d import Box\nresult = Box(2, 3, 4)",
        "STL",
      );
      fs.writeFileSync(outPath, payload);

      assert.ok(
        fs.existsSync(outPath),
        "expected build123d STL file to be created",
      );
      assert.ok(
        fs.statSync(outPath).size > 0,
        "expected build123d STL file size > 0",
      );
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });
});
