import * as path from "path";
import { runTests } from "@vscode/test-electron";

async function main(): Promise<void> {
  // The folder containing the extension's package.json
  const extensionDevelopmentPath = path.resolve(__dirname, "../../../");

  // The path to the compiled test runner module (must export `run`)
  const extensionTestsPath = path.resolve(__dirname, "./suite");

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
    ],
  });
}

main().catch((err: unknown) => {
  console.error("E2E test runner failed:", err);
  process.exit(1);
});
