import { test } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { launchVSCode, openOmniCadViewer } from "../launcher";

test("capture openscad render story", async () => {
  const extensionPath = path.resolve(__dirname, "../../../../");
  const scadFile = path.resolve(extensionPath, "demo.scad");
  fs.writeFileSync(
    scadFile,
    "difference() {\n  cube([20,20,20], center=true);\n  sphere(r=14, $fn=64);\n}\n",
  );

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(
    extensionPath,
    scadFile,
    "openscad",
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
    await window.waitForTimeout(1000);

    // 1. Initial Save to show the 50mm box
    await window.click(".monaco-editor");
    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(1000);

    // 2. LIVE UPDATE: Change 50 to 10
    // Navigate to line 2 (cube([20,20,20], center=true);
    await window.keyboard.press("F1");
    await window.waitForTimeout(1000);
    await palette.waitFor({ state: "visible", timeout: 1500 });
    await palette.fill("> Go to Line...");
    await window.keyboard.press("Enter");
    await window.waitForTimeout(1000);

    // Type line number '2' and hit Enter
    await palette.waitFor({ state: "visible", timeout: 1500 });
    await palette.fill(":2");
    await window.keyboard.press("Enter");
    await window.waitForTimeout(1000);

    // Modify cube size to 20x20x5
    await window.keyboard.press("Shift+End");
    await window.keyboard.type(" cube([50,15,75], center=true);", {
      delay: 10,
    });

    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(1000);

    // 4. Wait for the engine to show result
    await window.waitForTimeout(3000);
  } finally {
    await electronApp.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
