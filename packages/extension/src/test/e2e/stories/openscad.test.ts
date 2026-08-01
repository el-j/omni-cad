import { test } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { closeVSCodeApp, launchVSCode, openOmniCadViewer } from "../launcher";

const openscadInitialCode =
  "difference() {\n  cube([20,20,20], center=true);\n  sphere(r=14, $fn=64);\n}\n";
const openscadUpdatedCode =
  "difference() {\n  cube([50,15,75], center=true);\n  sphere(r=14, $fn=64);\n}\n";

test("capture openscad render story", async () => {
  const extensionPath = path.resolve(__dirname, "../../../../");
  const scadFile = path.resolve(extensionPath, "demo.scad");
  fs.writeFileSync(scadFile, openscadInitialCode);

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(
    extensionPath,
    scadFile,
    "openscad",
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
    await window.waitForTimeout(1000);

    // 1. Initial Save to show the 50mm box
    await window.click(".monaco-editor");
    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(1000);

    // 2. LIVE UPDATE: replace editor content with updated script
    await window.click(".monaco-editor");
    await window.keyboard.press(`${modifier}+A`);
    await window.keyboard.type(openscadUpdatedCode, { delay: 0 });

    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(1000);

    // 4. Wait for the engine to show result
    await window.waitForTimeout(3000);
  } finally {
    await closeVSCodeApp(electronApp);
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
