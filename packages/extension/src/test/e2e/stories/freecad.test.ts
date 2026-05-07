import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { launchVSCode } from '../launcher';

test('capture freecad workflow story', async () => {
  const extensionPath = path.resolve(__dirname, '../../../../');
  const pyFile = path.resolve(extensionPath, 'demo_freecad.py');
  fs.writeFileSync(pyFile, 'import FreeCAD, Part\ndoc = FreeCAD.newDocument()\nbox = doc.addObject("Part::Box", "Box")\nbox.Length = 50\nbox.Width = 20\ndoc.recompute()\n');

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(extensionPath, pyFile, 'freecad');

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
