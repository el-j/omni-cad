import { test } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { closeVSCodeApp, launchVSCode, openOmniCadViewer } from "../launcher";

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

const updatedTurbineCode = `import { cylinder, box, union, rotate, translate } from '@opengeometry/core';

export const model = () => {
  const hub = cylinder(10, 40);
  const bladeCount = 24;
  const twistAngle = 90;
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
    await window.waitForSelector(".monaco-editor", { timeout: 10000 });
    // 1. Open OmniCAD Viewer (handles first-open popup race conditions)
    await openOmniCadViewer(window, modifier, 20000);

    await window.click(".monaco-editor");
    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(100);

    // 2. LIVE UPDATE: replace editor content with updated model
    await window.click(".monaco-editor");
    await window.keyboard.press(`${modifier}+A`);
    await window.keyboard.type(updatedTurbineCode, { delay: 0 });

    // 3. Final Save & Sync
    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(3000);
  } finally {
    await closeVSCodeApp(electronApp);
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
