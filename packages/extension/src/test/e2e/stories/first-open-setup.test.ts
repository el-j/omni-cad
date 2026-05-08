import { expect, test } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { launchVSCode, openOmniCadViewer } from "../launcher";

test("handles first-open OmniCAD setup popup without blocking workflow", async () => {
  const extensionPath = path.resolve(__dirname, "../../../../");
  const dummyFile = path.resolve(extensionPath, "demo.py");
  if (!fs.existsSync(dummyFile)) {
    fs.writeFileSync(dummyFile, 'print("omnicad first-open test")\n');
  }

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(
    extensionPath,
    dummyFile,
    "first-open",
    false,
    {
      "omniCAD.freecadPath": "/tmp/omnicad-missing-freecadcmd",
      "omniCAD.openscadPath": "/tmp/omnicad-missing-openscad",
    },
  );

  try {
    await window.waitForSelector(".monaco-editor", { timeout: 5000 });

    const popupText = window.locator(
      "text=/OmniCAD detected:|Configure paths manually now\?/",
    );

    await window.keyboard.press("F1");
    await window.waitForTimeout(500);

    const paletteWarmup = window.locator(".quick-input-filter input");
    if (!(await paletteWarmup.isVisible().catch(() => false))) {
      await window.keyboard.press(`${modifier}+Shift+P`);
      await window.waitForTimeout(500);
    }

    let popupVisible = false;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      popupVisible = await popupText
        .isVisible({ timeout: 400 })
        .catch(() => false);
      if (popupVisible) {
        break;
      }
      await window.waitForTimeout(300);
    }

    await expect.soft(popupVisible).toBeTruthy();

    const useDetected = window.locator('button:has-text("Use Detected Paths")');
    const manualSetup = window.locator('button:has-text("Manual Setup")');
    const skipForNow = window.locator('button:has-text("Skip For Now")');

    if (popupVisible) {
      await expect(useDetected).toBeVisible();
      await expect(manualSetup).toBeVisible();
      await expect(skipForNow).toBeVisible();

      await useDetected.click();
      await expect(popupText).toBeHidden({ timeout: 5000 });
    }

    await openOmniCadViewer(window, modifier, 15000);

    const slider = window
      .frameLocator("iframe.webview")
      .frameLocator("iframe#active-frame")
      .locator(".scale-slider");
    await expect(slider).toBeVisible({ timeout: 8000 });
  } finally {
    await electronApp.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
