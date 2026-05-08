import { expect, test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import {
  launchVSCode,
  waitForOmniCadSetupNotification,
  dismissOmniCadSetupNotification,
  runCommand
} from '../launcher';

// ── helpers ────────────────────────────────────────────────────────────────


async function triggerSetupViaCommandPalette(
  window: import('@playwright/test').Page,
  modifierKey: string,
) {
  // Try direct command execution first.
  if (await runCommand(window, modifierKey, 'OmniCAD: Run Setup')) {
    return;
  }

  // Warm up extension activation through a known command, then retry setup.
  await runCommand(window, modifierKey, 'OmniCAD: Open Viewer');
  await window.keyboard.press('Escape').catch(() => undefined);
  await window.waitForTimeout(500);

  if (await runCommand(window, modifierKey, 'OmniCAD: Run Setup')) {
    return;
  }

  throw new Error('Unable to execute OmniCAD: Run Setup from command palette');
}

test('OmniCAD setup popup quick-pick: closes via Use Detected Paths', async () => {
  const extensionPath = path.resolve(__dirname, '../../../../');
  const dummyFile = path.resolve(extensionPath, 'demo.py');
  if (!fs.existsSync(dummyFile)) {
    fs.writeFileSync(dummyFile, 'print("omnicad setup popup test")\n');
  }

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(
    extensionPath,
    dummyFile,
    'first-open',
    false,
    {
      'omniCAD.freecadPath': '/tmp/omnicad-stale-freecad',
      'omniCAD.openscadPath': '/tmp/omnicad-stale-openscad',
    },
  );

  try {
    await window
      .waitForSelector('.monaco-editor', { timeout: 10000 })
      .catch(() => undefined);
    await window.waitForTimeout(1500);

    // If setup is already visible from startup, use it; otherwise trigger setup via command.
    let useDetectedBtn = await waitForOmniCadSetupNotification(window, 1500);
    if (!useDetectedBtn) {
      await triggerSetupViaCommandPalette(window, modifier);
      useDetectedBtn = await waitForOmniCadSetupNotification(window, 15000);
    }
    expect(
      useDetectedBtn,
      'Use Detected Paths action should be visible',
    ).not.toBeNull();

    const useDetected = window
      .locator(
        '.quick-input-widget .quick-input-list-entry:has-text("Use Detected Paths")',
      )
      .first();
    const manualSetup = window
      .locator(
        '.quick-input-widget .quick-input-list-entry:has-text("Manual Setup")',
      )
      .first();
    const skipForNow = window
      .locator(
        '.quick-input-widget .quick-input-list-entry:has-text("Skip For Now")',
      )
      .first();

    await expect(useDetected).toBeVisible({ timeout: 3000 });
    await expect(manualSetup).toBeVisible({ timeout: 3000 });
    await expect(skipForNow).toBeVisible({ timeout: 3000 });

    await useDetected.click();
    await window.waitForTimeout(300);

    // Quick-pick should close after choosing an action.
    await expect(window.locator('.quick-input-widget')).toBeHidden({
      timeout: 6000,
    });
  } finally {
    await electronApp.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
