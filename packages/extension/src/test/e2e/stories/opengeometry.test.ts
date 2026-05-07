import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { launchVSCode } from '../launcher';

test('capture opengeometry preview story', async () => {
  const extensionPath = path.resolve(__dirname, '../../../../');
  const tsFile = path.resolve(extensionPath, 'demo.ts');
  fs.writeFileSync(tsFile, '// OmniCAD OpenGeometry Preview\nconst radius = 15;\n');

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(extensionPath, tsFile, 'opengeometry');

  try {
    await window.waitForSelector('.monaco-editor', { timeout: 10000 });
    // 1. Open OmniCAD Viewer
    await window.keyboard.press('F1');
    await window.waitForTimeout(100);
    let palette = window.locator('.quick-input-filter input');
    if (!(await palette.isVisible())) {
       await window.keyboard.press(`${modifier}+Shift+P`);
       await window.waitForTimeout(1000);
    }
    await palette.waitFor({ state: 'visible', timeout: 1500 });
    await palette.fill('> OmniCAD: Open Viewer');
    await window.keyboard.press('Enter');
    await window.waitForTimeout(2000);
    
    // 1. Initial Save to show the 50mm box
    await window.click('.monaco-editor');
    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(10000);

    // 2. LIVE UPDATE: Change 50 to 10
    // Navigate to line 2 (cube([20,20,20], center=true);
    await window.keyboard.press('F1');
    await window.waitForTimeout(1000);
    await palette.waitFor({ state: 'visible', timeout: 15000 });
    await palette.fill('> Go to Line...');
    await window.keyboard.press('Enter');
    await window.waitForTimeout(1000);
    
    // Type line number '2' and hit Enter
    await palette.waitFor({ state: 'visible', timeout: 15000 });
    await palette.fill(':2');
    await window.keyboard.press('Enter');
    await window.waitForTimeout(1000);

    // Modify cube size to 20x20x5
    await window.keyboard.press('Shift+End');
    await window.keyboard.type('const sphere = sphere(r=25);', { delay: 0 });
    await window.waitForTimeout(1000);

    // 3. Save to trigger re-render
    await window.keyboard.press(`${modifier}+S`);

    // 4. Wait for the engine to show result
    await window.waitForTimeout(20000);

  } finally {
    await electronApp.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
