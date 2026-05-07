import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { launchVSCode } from '../launcher';

test('capture mcp setup story', async () => {
  const extensionPath = path.resolve(__dirname, '../../../../');
  const dummyFile = path.resolve(extensionPath, 'demo.py');
  if (!fs.existsSync(dummyFile)) {
    fs.writeFileSync(dummyFile, 'import FreeCAD, Part\ndoc = FreeCAD.newDocument()\nbox = doc.addObject("Part::Box", "Box")\ndoc.recompute()\n');
  }

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(extensionPath, dummyFile, 'mcp-setup');

  try {
    
    await window.waitForSelector('.monaco-editor', { timeout: 30000 });
    
    // Attempt to close any lingering popups
    try {
      const closeBtn = await window.locator('a:has-text("Continue without Signing In")');
      if (await closeBtn.isVisible()) await closeBtn.click();
    } catch(e) {}

    await window.click('.monaco-editor');
    await window.waitForTimeout(2000);

    // Try multiple shortcuts for Command Palette
    await window.keyboard.press('F1');
    await window.waitForTimeout(1000);
    
    let palette = window.locator('.quick-input-filter input');
    if (!(await palette.isVisible())) {
       await window.keyboard.press(`${modifier}+Shift+P`);
       await window.waitForTimeout(1000);
    }
    
    await palette.waitFor({ state: 'visible', timeout: 15000 });
    await palette.fill('OmniCAD: Open Viewer');
    await window.keyboard.press('Enter');
    await window.waitForTimeout(2000);
    await window.keyboard.press(`${modifier}+S`);

    await window.waitForTimeout(20000);
  } finally {
    await electronApp.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
