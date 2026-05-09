import { test } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { launchVSCode, openOmniCadViewer } from "../launcher";

test("capture freecad workflow story", async () => {
  const extensionPath = path.resolve(__dirname, "../../../../");
  const pyFile = path.resolve(extensionPath, "demo.py");
  fs.writeFileSync(
    pyFile,
    'import FreeCAD, Part\ndoc = FreeCAD.newDocument()\nbox = doc.addObject("Part::Box", "Box")\nbox.Length = 50\nbox.Width = 20\ndoc.recompute()\n',
  );

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(
    extensionPath,
    pyFile,
    "freecad",
  );

  try {
    await window.waitForSelector(".monaco-editor", { timeout: 1000 });

    // 1. Open OmniCAD Viewer (handles first-open popup race conditions)
    await openOmniCadViewer(window, modifier, 15000);
    let palette = window.locator(".quick-input-filter input");

    // Pierce the webview iframe to find the scale slider
    const webviewFrame = window
      .frameLocator("iframe.webview")
      .frameLocator("iframe#active-frame");
    const slider = webviewFrame.locator(".scale-slider");
    await slider.waitFor({ state: "visible", timeout: 6000 });
    await slider.fill("0.1");
    await window.waitForTimeout(100);

    // 1. Initial Save to show the 50mm box
    await window.click(".monaco-editor");
    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(100);

    // 2. LIVE UPDATE: Change 50 to 10
    // Navigate to line 4 (box.Length = 50)
    await window.keyboard.press("F1");
    await window.waitForTimeout(1000);
    await palette.waitFor({ state: "visible", timeout: 1500 });
    await palette.fill("> Go to Line...");
    await window.keyboard.press("Enter");
    await window.waitForTimeout(1000);

    // Type line number '4' and hit Enter
    await palette.waitFor({ state: "visible", timeout: 1500 });
    await palette.fill(":4");
    await window.keyboard.press("Enter");
    await window.waitForTimeout(1000);

    // Move to end of line, delete '50', type '10'
    await window.keyboard.press("End");
    await window.keyboard.press("Backspace");
    await window.keyboard.press("Backspace");
    await window.keyboard.type("10", { delay: 100 });
    await window.waitForTimeout(1000);

    // 3. Save to trigger re-render
    await window.keyboard.press(`${modifier}+S`);

    // 4. Wait for the engine to show result
    await window.waitForTimeout(3000);
  } finally {
    await electronApp.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
