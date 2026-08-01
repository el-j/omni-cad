/**
 * Vscode-agnostic first-open setup helpers.
 *
 * These interfaces and functions are kept free of any `vscode` imports so they
 * can be exercised by the plain-Node unit-test runner without the extension host.
 */

export const FIRST_OPEN_SETUP_KEY = "omniCAD.firstOpenSetupCompleted";

export interface SetupConfigurationReader {
  get<T>(section: string, defaultValue?: T): T | undefined;
}

/** Full configuration accessor that also supports writing. */
export interface SetupConfiguration extends SetupConfigurationReader {
  // ConfigurationTarget is a vscode enum (1 = Global, 2 = Workspace, 3 = WorkspaceFolder).
  // Using `number` here avoids a hard dependency on the vscode module.
  update(key: string, value: unknown, target?: number): Thenable<void>;
}

export interface SetupState {
  get<T>(key: string, defaultValue?: T): T | undefined;
  update(key: string, value: unknown): Thenable<void>;
}

export async function markFirstOpenSetupComplete(
  state: SetupState,
): Promise<void> {
  await state.update(FIRST_OPEN_SETUP_KEY, true);
}

/**
 * Gate-and-run the first-open setup flow.
 *
 * Returns `true` when the setup runner reported that it made configuration
 * changes; `false` when setup was already completed or was opted out.
 */
export async function runStartupFirstOpenSetup(
  state: SetupState,
  config: SetupConfigurationReader,
  setupRunner: (config: SetupConfiguration) => Promise<boolean> = async () =>
    false,
): Promise<boolean> {
  if (state.get<boolean>(FIRST_OPEN_SETUP_KEY, false)) {
    return false;
  }

  if (!config.get<boolean>("autoSetupOnStartup", true)) {
    return false;
  }

  try {
    return await setupRunner(config as SetupConfiguration);
  } finally {
    await markFirstOpenSetupComplete(state);
  }
}
