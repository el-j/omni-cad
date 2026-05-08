import { test } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { launchVSCode, openOmniCadViewer } from "../launcher";

test("capture mcp setup story", async () => {
  const extensionPath = path.resolve(__dirname, "../../../../");
  const dummyFile = path.resolve(extensionPath, "demo.py");
  if (!fs.existsSync(dummyFile)) {
    fs.writeFileSync(
      dummyFile,
      'import FreeCAD, Part\ndoc = FreeCAD.newDocument()\nbox = doc.addObject("Part::Box", "Box")\ndoc.recompute()\n',
    );
  }

  const { electronApp, userDataDir, window, modifier } = await launchVSCode(
    extensionPath,
    dummyFile,
    "mcp-setup",
  );

  try {
    // 1. Open the registered OmniCAD viewer command (popup-safe)
    await window.click(".monaco-editor");
    await openOmniCadViewer(window, modifier, 15000);

    let palette = window.locator(".quick-input-filter input");

    // 2. Re-run the same registered command to document command availability
    await window.keyboard.press("F1");
    await window.waitForTimeout(1000);
    await palette.waitFor({ state: "visible", timeout: 15000 });
    await palette.fill("> OmniCAD: Open Viewer");
    await window.keyboard.press("Enter");
    await window.waitForTimeout(3000);

    // 3. Document active monitoring
    await window.click(".monaco-editor");
    await window.keyboard.press(`${modifier}+End`);
    await window.keyboard.type(
      "\n# OmniCAD command surface verified (Open Viewer command available)",
      { delay: 50 },
    );
    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(5000);

    // 4. Show the MCP interaction in a dummy file
    await window.click(".monaco-editor");
    await window.keyboard.type(
      "\n# Story capture completed using only registered commands.",
      { delay: 50 },
    );
    await window.keyboard.press(`${modifier}+S`);
    await window.waitForTimeout(5000);
  } finally {
    await electronApp.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
