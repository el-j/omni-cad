import { test } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { launchVSCode, openOmniCadViewer } from "../launcher";

// 1. Initial Render: Complex Turbine
const turbineCode = `import { cylinder, box, union, rotate, translate } from '@opengeometry/core';

export const model = () => {
  const hub = cylinder(10, 40);
  const bladeCount = 12;
  const twistAngle = 45;
  const blades = [];
  
  for(let i=0; i<bladeCount; i++) {
    const angle = (i / bladeCount) * 360;
    const blade = box(5, 50, 2);
    blades.push(
      rotate(translate(blade, [0, 20, 0]), [twistAngle, 0, angle])
    );
  }
  
  return union(hub, ...blades);
};`;

test("capture opengeometry preview story", async () => {
  const extensionPath = path.resolve(__dirname, "../../../../");
  const tsFile = path.resolve(extensionPath, "demo.ts");

  fs.writeFileSync(tsFile, turbineCode);

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(
    extensionPath,
    tsFile,
    "opengeometry",
  );

  try {
    await window.waitForSelector(".monaco-editor", { timeout: 3000 });
    // 1. Open OmniCAD Viewer (handles first-open popup race conditions)
    await openOmniCadViewer(window, modifier, 15000);
    let palette = window.locator(".quick-input-filter input");

    await window.click(".monaco-editor");
    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(100);

    // 2. LIVE UPDATE: Increase complexity
    // Navigate to bladeCount (line 6)
    await window.click(".monaco-editor"); // Ensure focus
    await window.keyboard.press("F1");
    await window.waitForTimeout(1000);
    await palette.waitFor({ state: "visible", timeout: 1500 });
    await palette.fill("> Go to Line...");
    await window.keyboard.press("Enter");
    await window.waitForTimeout(1000);
    await palette.fill(":6"); // bladeCount = 12
    await window.keyboard.press("Enter");

    // Change 12 to 24 blades
    await window.keyboard.press("End");
    await window.keyboard.press("Backspace");
    await window.keyboard.press("Backspace");
    await window.keyboard.press("Backspace");
    await window.keyboard.type("24;", { delay: 0 });

    // Change twistAngle to 90 (line 7)
    await window.keyboard.press("ArrowDown");
    await window.keyboard.press("End");
    await window.keyboard.press("Backspace");
    await window.keyboard.press("Backspace");
    await window.keyboard.press("Backspace");
    await window.keyboard.type("90;", { delay: 0 });

    // 3. Final Save & Sync
    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(3000);
  } finally {
    await electronApp.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
