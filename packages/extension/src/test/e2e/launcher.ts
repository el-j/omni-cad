import { _electron as electron } from '@playwright/test';
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const isMac = process.platform === 'darwin';
const modifier = isMac ? 'Meta' : 'Control';

export async function launchVSCode(extensionPath: string, testFile?: string, videoDirName: string = 'default') {
  const vscodeExecutablePath = await downloadAndUnzipVSCode();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-test-user-'));
  const extensionsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-test-exts-'));
  
  // Clean settings to force a "First Run" state that we control
  const settingsDir = path.join(userDataDir, 'User');
  fs.mkdirSync(settingsDir, { recursive: true });
  fs.writeFileSync(path.join(settingsDir, 'settings.json'), JSON.stringify({
    "workbench.welcomePage.enabled": false,
    "workbench.startupEditor": "none",
    "telemetry.enableTelemetry": false,
    "telemetry.enableCrashReporter": false,
    "workbench.tips.enabled": false,
    "omniCAD.enableExperimentalOpenGeometry": true,
    "editor.minimap.enabled": false,
    "window.restoreWindows": "none",
    "workbench.editor.showTabs": "single",
    "workbench.welcomePage.walkthroughs.enabled": false,
    "workbench.account.onboarding.enabled": false,
    "extensions.ignoreRecommendations": true,
    "security.workspace.trust.enabled": false,
    "workbench.enableExperiments": false,
    "workbench.sideBar.visible": false,
    "workbench.auxiliaryBar.visible": false,
    "workbench.activityBar.visible": false,
    "workbench.statusBar.visible": false,
    "chat.enabled": false,
    "inlineChat.enabled": false,
    "github.copilot.chat.enabled": false,
    "workbench.panel.opened": false,
    "workbench.editor.showSecondarySideBar": false,
    "workbench.panel.defaultLocation": "hidden"
  }));

  const videoDir = path.resolve(extensionPath, 'test-results/videos', videoDirName);
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  const electronApp = await electron.launch({
    executablePath: vscodeExecutablePath,
    args: [
      '--extensionDevelopmentPath=' + extensionPath,
      '--extensions-dir=' + extensionsDir,
      '--no-sandbox',
      '--disable-gpu-sandbox',
      '--disable-updates',
      '--disable-telemetry',
      '--disable-workspace-trust',
      '--disable-side-bar',
      '--disable-activity-bar',
      '--disable-panel',
      '--disable-keytar-storage',
      '--user-data-dir=' + userDataDir,
      ...(testFile ? [testFile] : [])
    ],
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } }
  });

  const window = await electronApp.firstWindow();
  await window.waitForLoadState('networkidle');
  
  // Clean up temporary directories on close
  electronApp.on('close', () => {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
      fs.rmSync(extensionsDir, { recursive: true, force: true });
    } catch (e) {}
  });
  
  // 1. Brute-force dismiss onboarding (Escape + Targeted Click)
  try {
    // Spam Escape to close simple modals
    for (let i = 0; i < 3; i++) {
      await window.keyboard.press('Escape');
      await window.waitForTimeout(500);
    }

    // Target the onboarding overlay specifically
    const overlay = window.locator('.onboarding-a-overlay');
    if (await overlay.isVisible({ timeout: 5000 })) {
      // Find the "X" button (usually the first button without text in the overlay)
      const closeBtn = overlay.locator('button').filter({ hasText: '' }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }
    
    // Fallback: Click "Continue without Signing In"
    const signinDismiss = window.locator('button:has-text("Continue without Signing In")');
    if (await signinDismiss.isVisible({ timeout: 2000 })) {
      await signinDismiss.click();
    }
  } catch (e) {}
  // 2. Workspace Cleanup: Zen Mode (Hide Sidebar, Panel, Auxiliary Bar)
  try {
    await window.bringToFront();
    await window.waitForTimeout(500);
    await window.keyboard.press('F1');
    await window.waitForTimeout(1000);
    
    let palette = window.locator('.quick-input-filter input');
    if (!(await palette.isVisible())) {
       await window.keyboard.press(`${modifier}+Shift+P`);
       await window.waitForTimeout(1000);
    }
    await palette.fill('> View: Hide Secondary Side Bar');
    await window.waitForTimeout(1000);
    await window.keyboard.press('Enter');
  } catch (e) {}
  // 3. Handle "Extensions require a restart"
  try {
    const restartBtn = window.locator('button:has-text("Restart Extensions")');
    if (await restartBtn.isVisible({ timeout: 5000 })) {
      await restartBtn.click();
      
      // Wait for extension host to signal readiness via command availability
      let activated = false;
      for (let i = 0; i < 20; i++) {
        await window.bringToFront();
        await window.keyboard.press('F1');
        await window.waitForTimeout(500);
        const paletteInput = window.locator('.quick-input-filter input');
        if (!(await paletteInput.isVisible())) {
          await window.keyboard.press(`${modifier}+Shift+P`);
          await window.waitForTimeout(1000);
        }
        if (await paletteInput.isVisible()) {
          await paletteInput.fill('> OmniCAD: Open Viewer');
          const entry = window.locator('.quick-input-list-entry:has-text("OmniCAD: Open Viewer")');
          if (await entry.isVisible()) {
            activated = true;
            await window.keyboard.press('Escape');
            break;
          }
          await window.keyboard.press('Escape');
        }
        await window.waitForTimeout(1000);
      }
      if (!activated) console.warn('Extension activation signal not detected after 20s');
    }
  } catch (e) {}

  // 3. Final Focus & Editor Selection
  await window.click('.monaco-editor');
  await window.waitForTimeout(1000);

  return { electronApp, userDataDir, window, modifier };
}
