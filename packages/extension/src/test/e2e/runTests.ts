import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { runTests } from "@vscode/test-electron";

async function main(): Promise<void> {
  // The folder containing the extension's package.json
  const extensionDevelopmentPath = path.resolve(__dirname, "../../../");

  // The path to the compiled test runner module (must export `run`)
  const extensionTestsPath = path.resolve(__dirname, "./suite");
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "oc-vscode-user-"));
  const extensionsDir = fs.mkdtempSync(path.join(os.tmpdir(), "oc-vscode-exts-"));

  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath,
    // Disable other extensions to keep the test environment clean
    launchArgs: [
      "--disable-extensions",
      "--skip-welcome",
      "--skip-release-notes",
      "--disable-telemetry",
      "--disable-update-check",
      "--disable-workspace-trust-prompt",
      "--no-proxy-server",
      `--user-data-dir=${userDataDir}`,
      `--extensions-dir=${extensionsDir}`,
    ],
  });
}

main().catch((err: unknown) => {
  console.error("E2E test runner failed:", err);
  process.exit(1);
});
