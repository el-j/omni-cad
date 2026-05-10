import { test } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { closeVSCodeApp, launchVSCode, openOmniCadViewer } from "../launcher";

const freecadInitialCode =
  'import FreeCAD, Part\ndoc = FreeCAD.newDocument()\nbox = doc.addObject("Part::Box", "Box")\nbox.Length = 50\nbox.Width = 20\ndoc.recompute()\n';
const freecadUpdatedCode =
  'import FreeCAD, Part\ndoc = FreeCAD.newDocument()\nbox = doc.addObject("Part::Box", "Box")\nbox.Length = 10\nbox.Width = 20\ndoc.recompute()\n';

test("capture freecad workflow story", async () => {
  const extensionPath = path.resolve(__dirname, "../../../../");
  const pyFile = path.resolve(extensionPath, "demo.py");
  fs.writeFileSync(pyFile, freecadInitialCode);

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(
    extensionPath,
    pyFile,
    "freecad",
  );

  try {
    await window.waitForSelector(".monaco-editor", { timeout: 10000 });

    // 1. Open OmniCAD Viewer (handles first-open popup race conditions)
    await openOmniCadViewer(window, modifier, 20000);

    // Pierce the webview iframe to find the scale slider
    const webviewFrame = window
      .frameLocator("iframe.webview")
      .frameLocator("iframe#active-frame");
    const slider = webviewFrame.locator(".scale-slider");
    await slider.waitFor({ state: "visible", timeout: 15000 });
    await slider.fill("0.1");
    await window.waitForTimeout(100);

    // 1. Initial Save to show the 50mm box
    await window.click(".monaco-editor");
    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(100);

    // 2. LIVE UPDATE: replace editor content with updated script
    await window.click(".monaco-editor");
    await window.keyboard.press(`${modifier}+A`);
    await window.keyboard.type(freecadUpdatedCode, { delay: 0 });
    await window.waitForTimeout(200);

    // 3. Save to trigger re-render
    await window.keyboard.press(`${modifier}+S`);

    // 4. Wait for the engine to show result
    await window.waitForTimeout(3000);
  } finally {
    await closeVSCodeApp(electronApp);
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
