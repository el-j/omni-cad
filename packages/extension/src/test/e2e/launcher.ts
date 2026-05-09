import { _electron as electron } from '@playwright/test';
import { downloadAndUnzipVSCode } from '@vscode/test-electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const isMac = process.platform === 'darwin';
const modifier = isMac ? 'Meta' : 'Control';

async function dismissOnboardingOverlay(
  window: import('@playwright/test').Page,
): Promise<void> {
  const overlay = window.locator('.onboarding-a-overlay');
  const visible = await overlay.isVisible({ timeout: 100 }).catch(() => false);
  if (!visible) {
    return;
  }

  await window.keyboard.press('Escape').catch(() => undefined);
  const closeBtn = overlay.locator('button').first();
  if (await closeBtn.isVisible({ timeout: 100 }).catch(() => false)) {
    await closeBtn.click({ force: true }).catch(() => undefined);
  }
}

/**
 * Selectors for OmniCAD setup actions.
 *
 * Primary path: setup prompt is a VS Code QuickPick with list entries.
 * Fallback path: legacy notification/button based UI.
 */
const SETUP_USE_DETECTED_SELECTORS = [
  '.quick-input-widget .quick-input-list-entry:has-text("Use Detected Paths")',
  '.quick-input-widget .monaco-list-row:has-text("Use Detected Paths")',
  '.notification-list-item .monaco-button:has-text("Use Detected Paths")',
  '.notification-list-item a:has-text("Use Detected Paths")',
  '.notifications-toasts a:has-text("Use Detected Paths")',
  'a:has-text("Use Detected Paths")',
  'button:has-text("Use Detected Paths")',
];

const SETUP_DISMISS_SELECTORS = [
  ...SETUP_USE_DETECTED_SELECTORS,
  '.quick-input-widget .quick-input-list-entry:has-text("Skip For Now")',
  '.quick-input-widget .monaco-list-row:has-text("Skip For Now")',
  '.notification-list-item .monaco-button:has-text("Skip For Now")',
  '.notification-list-item a:has-text("Skip For Now")',
  '.notifications-toasts a:has-text("Skip For Now")',
  'a:has-text("Skip For Now")',
  'button:has-text("Skip For Now")',
];

export async function openCommandPalette(
  window: import('@playwright/test').Page,
  modifierKey: string,
): Promise<import('@playwright/test').Locator> {
  await window.keyboard.press('F1');
  await window.waitForTimeout(400);

  const palette = window.locator('.quick-input-filter input');
  if (!(await palette.isVisible({ timeout: 1200 }).catch(() => false))) {
    await window.keyboard.press(`${modifierKey}+Shift+P`);
    await window.waitForTimeout(400);
  }
  await palette.waitFor({ state: 'visible', timeout: 6000 });
  return palette;
}

export async function runCommand(
  window: import('@playwright/test').Page,
  modifierKey: string,
  title: string,
): Promise<boolean> {
  const palette = await openCommandPalette(window, modifierKey);
  await palette.fill(`> ${title}`);
  await window.waitForTimeout(250);
  const entry = window
    .locator(`.quick-input-list-entry:has-text("${title}")`)
    .first();
  const visible = await entry.isVisible({ timeout: 1200 }).catch(() => false);
  if (!visible) {
    await window.keyboard.press('Escape').catch(() => undefined);
    return false;
  }
  await window.keyboard.press('Enter');
  await window.waitForTimeout(800);
  return true;
}
/**
 * Waits for the OmniCAD setup notification toast to appear and clicks
 * "Use Detected Paths" (or "Skip For Now" as fallback) to dismiss it.
 * Returns true if the notification was found and dismissed, false otherwise.
 */
export async function dismissOmniCadSetupNotification(
  window: import('@playwright/test').Page,
  timeoutMs = 8000,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await dismissOnboardingOverlay(window);

    for (const selector of SETUP_DISMISS_SELECTORS) {
      const btn = window.locator(selector).first();
      const visible = await btn.isVisible({ timeout: 200 }).catch(() => false);
      if (visible) {
        if (selector.includes('.quick-input-widget')) {
          await window.keyboard.press('Enter').catch(() => undefined);
        } else {
          await btn.click({ force: true });
        }
        await window.waitForTimeout(200);
        return true;
      }
    }

    const quickInputVisible = await window
      .locator('.quick-input-widget')
      .isVisible({ timeout: 150 })
      .catch(() => false);
    if (quickInputVisible) {
      // Accept first action as a fallback; setup quick-pick orders "Use Detected Paths" first.
      await window.keyboard.press('Enter').catch(() => undefined);
      await window.waitForTimeout(150);
      return true;
    }

    await window.waitForTimeout(300);
  }
  return false;
}

/**
 * Waits for the OmniCAD setup notification's "Use Detected Paths" button
 * to become visible. Returns the locator when found, or null on timeout.
 */
export async function waitForOmniCadSetupNotification(
  window: import('@playwright/test').Page,
  timeoutMs = 12000,
): Promise<import('@playwright/test').Locator | null> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    for (const selector of SETUP_USE_DETECTED_SELECTORS) {
      const btn = window.locator(selector).first();
      const visible = await btn.isVisible({ timeout: 200 }).catch(() => false);
      if (visible) {
        return btn;
      }
    }
    await window.waitForTimeout(300);
  }
  return null;
}

export async function openOmniCadViewer(
  window: import('@playwright/test').Page,
  modifierKey: string,
  timeoutMs = 10000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const opened = await runCommand(
      window,
      modifierKey,
      'OmniCAD: Open Viewer',
    );
    if (!opened) {
      await window.waitForTimeout(300);
      continue;
    }
    await window.waitForTimeout(800);

    await dismissOmniCadSetupNotification(window, 800);
    const slider = window
      .frameLocator('iframe.webview')
      .frameLocator('iframe#active-frame')
      .locator('.scale-slider');
    if (await slider.isVisible({ timeout: 1200 }).catch(() => false)) {
      return;
    }
    await window.keyboard.press('Escape').catch(() => undefined);
    await window.waitForTimeout(300);
  }

  throw new Error(
    'Failed to open OmniCAD viewer and locate scale slider within timeout',
  );
}

export async function launchVSCode(
  extensionPath: string,
  testFile?: string,
  videoDirName: string = 'default',
  autoDismissSetupPopup = true,
  settingsOverrides: Record<string, unknown> = {},
) {
  const vscodeExecutablePath = await downloadAndUnzipVSCode();
  const userDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'vscode-test-user-'),
  );
  const extensionsDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'vscode-test-exts-'),
  );

  // Clean settings to force a "First Run" state that we control
  const settingsDir = path.join(userDataDir, 'User');
  fs.mkdirSync(settingsDir, { recursive: true });
  fs.writeFileSync(
    path.join(settingsDir, 'settings.json'),
    JSON.stringify({
      'workbench.welcomePage.enabled': false,
      'workbench.startupEditor': 'none',
      'telemetry.enableTelemetry': false,
      'telemetry.enableCrashReporter': false,
      'workbench.tips.enabled': false,
      'omniCAD.enableExperimentalOpenGeometry': true,
      'editor.minimap.enabled': false,
      'window.restoreWindows': 'none',
      'workbench.editor.showTabs': 'single',
      'workbench.welcomePage.walkthroughs.enabled': false,
      'workbench.account.onboarding.enabled': false,
      'extensions.ignoreRecommendations': true,
      'security.workspace.trust.enabled': false,
      'workbench.enableExperiments': false,
      'workbench.sideBar.visible': false,
      'workbench.auxiliaryBar.visible': false,
      'workbench.activityBar.visible': false,
      'workbench.statusBar.visible': false,
      'chat.enabled': false,
      'inlineChat.enabled': false,
      'github.copilot.chat.enabled': false,
      'workbench.panel.opened': false,
      'workbench.editor.showSecondarySideBar': false,
      'workbench.panel.defaultLocation': 'hidden',
      ...settingsOverrides,
    }),
  );

  const videoDir = path.resolve(
    extensionPath,
    'test-results/videos',
    videoDirName,
  );
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
      ...(testFile ? [testFile] : []),
    ],
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
  });

  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  // In CI the extension host can keep background requests alive; don't hard-fail on networkidle.
  await window.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined);

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
    if (await overlay.isVisible({ timeout: 100 })) {
      // Find the "X" button (usually the first button without text in the overlay)
      const closeBtn = overlay
        .locator('button')
        .filter({ hasText: '' })
        .first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }

    // Fallback: Click "Continue without Signing In"
    const signinDismiss = window.locator(
      'button:has-text("Continue without Signing In")',
    );
    if (await signinDismiss.isVisible({ timeout: 100 })) {
      await signinDismiss.click();
    }
  } catch (e) {}
  // 2. Workspace Cleanup: Zen Mode (Hide Sidebar, Panel, Auxiliary Bar)
  await dismissOmniCadSetupNotification(window, 800);
  await runCommand(window, modifier, 'View: Hide Secondary Side Bar').catch(
    () => false,
  );

  // 3. Handle "Extensions require a restart"
  try {
    const restartBtn = window.locator('button:has-text("Restart Extensions")');
    if (await restartBtn.isVisible({ timeout: 1000 })) {
      await restartBtn.click();

      // Wait for extension host to signal readiness via command availability
      let activated = false;
      for (let i = 0; i < 20; i++) {
        await window.bringToFront();

        const opened = await runCommand(
          window,
          modifier,
          'OmniCAD: Open Viewer',
        ).catch(() => false);
        if (opened) {
          activated = true;
          await window.keyboard.press('Escape');
          break;
        }
        await window.waitForTimeout(100);
      }
      if (!activated)
        console.warn('Extension activation signal not detected after 20s');
    }
  } catch (e) {}

  await window.click('.monaco-editor');
  await window.waitForTimeout(1000);

  return { electronApp, userDataDir, window, modifier };
}
