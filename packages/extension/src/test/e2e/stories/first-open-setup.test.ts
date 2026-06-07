import { expect, test } from "@playwright/test";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import {
  launchVSCode,
  waitForOmniCadSetupNotification,
  dismissOmniCadSetupNotification,
  runCommand,
} from "../launcher";

// ── helpers ────────────────────────────────────────────────────────────────

async function triggerSetupViaCommandPalette(
  window: import("@playwright/test").Page,
  modifierKey: string,
) {
  // Try direct command execution first.
  if (await runCommand(window, modifierKey, "OmniCAD: Run Setup")) {
    return;
  }

  // Warm up extension activation through a known command, then retry setup.
  await runCommand(window, modifierKey, "OmniCAD: Open Viewer");
  await window.keyboard.press("Escape").catch(() => undefined);
  await window.waitForTimeout(500);

  if (await runCommand(window, modifierKey, "OmniCAD: Run Setup")) {
    return;
  }

  throw new Error("Unable to execute OmniCAD: Run Setup from command palette");
}

test("OmniCAD setup popup quick-pick: closes via Use Detected Paths", async () => {
  const extensionPath = path.resolve(__dirname, "../../../../");
  const dummyFile = path.resolve(extensionPath, "demo.py");
  if (!fs.existsSync(dummyFile)) {
    fs.writeFileSync(dummyFile, 'print("omnicad setup popup test")\n');
  }

  const profileRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "omnicad-setup-profile-"),
  );
  const userDataDir = path.join(profileRoot, "user-data");
  const extensionsDir = path.join(profileRoot, "extensions");
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.mkdirSync(extensionsDir, { recursive: true });

  const firstLaunch = await launchVSCode(
    extensionPath,
    dummyFile,
    "first-open",
    false,
    {
      "omniCAD.freecadPath": "/tmp/omnicad-stale-freecad",
      "omniCAD.openscadPath": "/tmp/omnicad-stale-openscad",
    },
    {
      userDataDir,
      extensionsDir,
    },
  );

  try {
    const { electronApp, window, modifier } = firstLaunch;
    await window
      .waitForSelector(".monaco-editor", { timeout: 10000 })
      .catch(() => undefined);
    await window.waitForTimeout(1500);

    await triggerSetupViaCommandPalette(window, modifier);

    // Centralized popup handling should dismiss setup using the preferred action.
    const dismissed = await dismissOmniCadSetupNotification(window, 15000);

    // Fallback for flows where helper does not report dismissal even though prompt is present.
    if (!dismissed) {
      const useDetected = await waitForOmniCadSetupNotification(window, 5000);
      if (useDetected) {
        await useDetected.click({ force: true }).catch(async () => {
          await window.keyboard.press("Enter").catch(() => undefined);
        });
      }
    }

    // Quick-pick should close after choosing an action.
    await expect(window.locator(".quick-input-widget")).toBeHidden({
      timeout: 6000,
    });

    await electronApp.close();

    const secondLaunch = await launchVSCode(
      extensionPath,
      dummyFile,
      "first-open-repeat",
      false,
      {},
      {
        userDataDir,
        extensionsDir,
      },
    );

    try {
      await secondLaunch.window
        .waitForSelector(".monaco-editor", { timeout: 10000 })
        .catch(() => undefined);
      await secondLaunch.window.waitForTimeout(2000);

      const secondPrompt = await waitForOmniCadSetupNotification(
        secondLaunch.window,
        2000,
      );
      expect(secondPrompt).toBeNull();
      await expect(secondLaunch.window.locator(".quick-input-widget")).toBeHidden({
        timeout: 3000,
      });
    } finally {
      await secondLaunch.electronApp.close();
    }
  } finally {
    fs.rmSync(profileRoot, { recursive: true, force: true });
  }
});
