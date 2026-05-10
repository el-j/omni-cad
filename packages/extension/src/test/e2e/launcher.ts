import { _electron as electron } from "@playwright/test";
import type { ElectronApplication } from "@playwright/test";
import { downloadAndUnzipVSCode } from "@vscode/test-electron";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

const isMac = process.platform === "darwin";
const modifier = isMac ? "Meta" : "Control";
const FIRST_WINDOW_TIMEOUT_MS = 60000;
const RESTART_SETTLE_TIME_MS = 1200;
const CLOSE_TIMEOUT_MS = 10000;

async function dismissOnboardingOverlay(
  window: import("@playwright/test").Page,
): Promise<void> {
  const overlay = window.locator(".onboarding-a-overlay");
  const visible = await overlay.isVisible({ timeout: 100 }).catch(() => false);
  if (!visible) {
    return;
  }

  await window.keyboard.press("Escape").catch(() => undefined);
  const closeBtn = overlay.locator("button").first();
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
  window: import("@playwright/test").Page,
  modifierKey: string,
): Promise<import("@playwright/test").Locator> {
  // Try F1 first, then keyboard combo if needed
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt === 0) {
      await window.keyboard.press("F1");
    } else if (attempt === 1) {
      await window.keyboard.press(`${modifierKey}+Shift+P`);
    } else {
      // Last resort: use F1 again after a longer wait
      await window.waitForTimeout(1000);
      await window.keyboard.press("F1");
    }

    await window.waitForTimeout(800);
    const palette = window.locator(".quick-input-filter input");

    if (await palette.isVisible({ timeout: 3000 }).catch(() => false)) {
      return palette;
    }
  }

  throw new Error("Command palette failed to open after 3 attempts");
}

export async function runCommand(
  window: import("@playwright/test").Page,
  modifierKey: string,
  title: string,
): Promise<boolean> {
  let palette: import("@playwright/test").Locator;
  try {
    palette = await openCommandPalette(window, modifierKey);
  } catch (e: unknown) {
    console.warn(`Failed to open command palette: ${(e as Error).message}`);
    return false;
  }

  await palette.fill(`> ${title}`);
  await window.waitForTimeout(600);

  // Look for the command entry with retries
  for (let attempt = 0; attempt < 2; attempt++) {
    const entry = window
      .locator(`.quick-input-list-entry:has-text("${title}")`)
      .first();

    const visible = await entry.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await window.keyboard.press("Enter");
      await window.waitForTimeout(1200);
      return true;
    }

    if (attempt === 0) {
      // Retry: clear and retype
      await palette.fill("");
      await window.waitForTimeout(300);
      await palette.fill(`> ${title}`);
      await window.waitForTimeout(600);
    }
  }

  await window.keyboard.press("Escape").catch(() => undefined);
  return false;
}

/**
 * Waits for the OmniCAD setup notification toast to appear and clicks
 * "Use Detected Paths" (or "Skip For Now" as fallback) to dismiss it.
 * Returns true if the notification was found and dismissed, false otherwise.
 */
export async function dismissOmniCadSetupNotification(
  window: import("@playwright/test").Page,
  timeoutMs = 8000,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await dismissOnboardingOverlay(window);

    for (const selector of SETUP_DISMISS_SELECTORS) {
      const btn = window.locator(selector).first();
      const visible = await btn.isVisible({ timeout: 200 }).catch(() => false);
      if (visible) {
        if (selector.includes(".quick-input-widget")) {
          await window.keyboard.press("Enter").catch(() => undefined);
        } else {
          await btn.click({ force: true });
        }
        await window.waitForTimeout(200);
        return true;
      }
    }

    const quickInputVisible = await window
      .locator(".quick-input-widget")
      .isVisible({ timeout: 150 })
      .catch(() => false);
    if (quickInputVisible) {
      // Accept first action as a fallback; setup quick-pick orders "Use Detected Paths" first.
      await window.keyboard.press("Enter").catch(() => undefined);
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
  window: import("@playwright/test").Page,
  timeoutMs = 12000,
): Promise<import("@playwright/test").Locator | null> {
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
  window: import("@playwright/test").Page,
  modifierKey: string,
  timeoutMs = 10000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const opened = await runCommand(
      window,
      modifierKey,
      "OmniCAD: Open Viewer",
    );
    if (!opened) {
      await window.waitForTimeout(300);
      continue;
    }
    await window.waitForTimeout(800);

    await dismissOmniCadSetupNotification(window, 800);
    const slider = window
      .frameLocator("iframe.webview")
      .frameLocator("iframe#active-frame")
      .locator(".scale-slider");
    if (await slider.isVisible({ timeout: 1200 }).catch(() => false)) {
      return;
    }
    await window.keyboard.press("Escape").catch(() => undefined);
    await window.waitForTimeout(300);
  }

  throw new Error(
    "Failed to open OmniCAD viewer and locate scale slider within timeout",
  );
}

export async function launchVSCode(
  extensionPath: string,
  testFile?: string,
  videoDirName: string = "default",
  autoDismissSetupPopup = true,
  settingsOverrides: Record<string, unknown> = {},
) {
  const vscodeExecutablePath = await downloadAndUnzipVSCode();
  const userDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "vscode-test-user-"),
  );
  const extensionsDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "vscode-test-exts-"),
  );

  // Clean settings to force a "First Run" state that we control
  const settingsDir = path.join(userDataDir, "User");
  fs.mkdirSync(settingsDir, { recursive: true });
  fs.writeFileSync(
    path.join(settingsDir, "settings.json"),
    JSON.stringify({
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
      "workbench.panel.defaultLocation": "hidden",
      ...settingsOverrides,
    }),
  );

  const videoDir = path.resolve(
    extensionPath,
    "test-results/videos",
    videoDirName,
  );
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  const electronApp = await electron.launch({
    executablePath: vscodeExecutablePath,
    args: [
      "--extensionDevelopmentPath=" + extensionPath,
      "--extensions-dir=" + extensionsDir,
      "--no-sandbox",
      "--disable-gpu-sandbox",
      // Disable hardware GPU so Electron/Chromium falls back to the software
      // rasteriser (SwiftShader/Mesa) in headless CI environments.  Without
      // this flag, GPU compositor initialisation silently hangs when no real
      // GPU is available (e.g. GitHub-hosted runners with xvfb), which
      // prevents Monaco from ever rendering and causes every test to consume
      // its full timeout budget.
      "--disable-gpu",
      // Prevent Chromium from using /dev/shm, which is limited (64 MB) in
      // Docker-like CI environments and can cause renderer crashes.
      "--disable-dev-shm-usage",
      "--disable-updates",
      "--disable-telemetry",
      "--disable-workspace-trust",
      "--disable-side-bar",
      "--disable-activity-bar",
      "--disable-panel",
      "--disable-keytar-storage",
      "--user-data-dir=" + userDataDir,
      ...(testFile ? [testFile] : []),
    ],
    ...(process.env.CI
      ? {}
      : { recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } } }),
  });

  const window = (await Promise.race([
    electronApp.firstWindow(),
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Timed out waiting for VS Code first window")),
        FIRST_WINDOW_TIMEOUT_MS,
      );
    }),
  ]).catch(async (err) => {
    // Ensure the Electron process is cleaned up before propagating.
    await electronApp.close().catch(() => undefined);
    throw err;
  })) as import("@playwright/test").Page;

  // In CI (headless/xvfb-run), domcontentloaded may not fire reliably.
  // Wait for the workbench to be visible; 30 s is plenty — if it hasn't
  // appeared by then the GPU software-render fallback is still stuck and
  // we should fail fast rather than burning the full test timeout.
  const uiReady = await window
    .locator('div[class*="workbench"]')
    .isVisible({ timeout: 30000 })
    .catch(() => false);

  if (!uiReady) {
    // Fallback: wait for networkidle as a proxy for readiness
    await window
      .waitForLoadState("networkidle", { timeout: 15000 })
      .catch(() => undefined);
  }

  // Allow extension host activation to complete
  await window.waitForTimeout(3000);

  // Clean up temporary directories on close
  electronApp.on("close", () => {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
      fs.rmSync(extensionsDir, { recursive: true, force: true });
    } catch (e) {}
  });

  // 1. Brute-force dismiss onboarding (Escape + Targeted Click)
  try {
    // Spam Escape to close simple modals
    for (let i = 0; i < 3; i++) {
      await window.keyboard.press("Escape");
      await window.waitForTimeout(500);
    }

    // Target the onboarding overlay specifically
    const overlay = window.locator(".onboarding-a-overlay");
    if (await overlay.isVisible({ timeout: 100 })) {
      // Find the "X" button (usually the first button without text in the overlay)
      const closeBtn = overlay
        .locator("button")
        .filter({ hasText: "" })
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
  await runCommand(window, modifier, "View: Hide Secondary Side Bar").catch(
    () => false,
  );

  // 3. Handle "Extensions require a restart"
  try {
    const restartBtn = window.locator('button:has-text("Restart Extensions")');
    if (await restartBtn.isVisible({ timeout: 1000 })) {
      await restartBtn.click();
      // Keep this bounded and defer activation checks to per-test helpers.
      await window.waitForTimeout(RESTART_SETTLE_TIME_MS);
    }
  } catch (e) {}

  // Focus the editor so that keyboard shortcuts work in subsequent tests.
  // Use an explicit 5 s timeout so that if Monaco is still loading the click
  // fails fast rather than inheriting the full remaining test-timeout budget.
  const clickOk = await window
    .click(".monaco-editor", { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  if (!clickOk) {
    console.warn(
      "launchVSCode: .monaco-editor not ready after 5 s — editor focus skipped",
    );
  }
  await window.waitForTimeout(1000);

  return { electronApp, userDataDir, window, modifier };
}

export async function closeVSCodeApp(
  electronApp: ElectronApplication,
): Promise<void> {
  const closed = await Promise.race([
    electronApp
      .close()
      .then(() => true)
      .catch(() => false),
    new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(false), CLOSE_TIMEOUT_MS),
    ),
  ]);

  if (closed) return;

  console.warn(
    `closeVSCodeApp: electronApp.close() timed out after ${CLOSE_TIMEOUT_MS} ms; killing process`,
  );

  const proc = electronApp.process();
  if (proc && !proc.killed) {
    proc.kill("SIGKILL");
  }
}
