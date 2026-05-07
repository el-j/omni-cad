import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { launchVSCode } from '../launcher';

test('capture openscad render story', async () => {
  const extensionPath = path.resolve(__dirname, '../../../../');
  const scadFile = path.resolve(extensionPath, 'demo.scad');
  fs.writeFileSync(scadFile, 'difference() {\n  cube([20,20,20], center=true);\n  sphere(r=14, $fn=64);\n}\n');

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(extensionPath, scadFile, 'openscad');

  try {
    await window.waitForSelector('.monaco-editor', { timeout: 30000 });
    
    // 1. Open OmniCAD Viewer
    await window.keyboard.press('F1');
    await window.waitForSelector('.quick-input-filter', { timeout: 15000 });
    await window.type('.quick-input-filter input', 'OmniCAD: Open Viewer');
    await window.keyboard.press('Enter');

    // 2. Switch focus back to the file tab
    await window.click('.monaco-editor');
    await window.waitForTimeout(1000);

    // 3. Save the file to trigger rendering
    await window.keyboard.press(`${modifier}+S`);

    // 4. Wait for the engine to show result
    await window.waitForTimeout(10000);

  } finally {
    await electronApp.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
