import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";
import { EngineRouter } from "./engines/EngineRouter";
import { WebviewPanel } from "./webview/WebviewPanel";
import { CompileResponse } from "./types";

let lastCompileResult: CompileResponse | undefined;
let startupSetupPromise: Promise<boolean> | undefined;

const FREECAD_DEFAULT = "FreeCADCmd";
const OPENSCAD_DEFAULT = "openscad";
const FIRST_OPEN_SETUP_KEY = "omniCAD.firstOpenSetupCompleted";

export function getLastCompileResultForTest(): CompileResponse | undefined {
  return lastCompileResult;
}

export function clearLastCompileResultForTest(): void {
  lastCompileResult = undefined;
}

function getEditorExtension(editor?: vscode.TextEditor): string | undefined {
  if (!editor) {
    return undefined;
  }

  return EngineRouter.getExtensionForFileName(editor.document.fileName);
}

function hasCustomConfiguredPath(
  value: string | undefined,
  defaultValue: string,
): boolean {
  if (!value) {
    return false;
  }
  return value.trim().length > 0 && value !== defaultValue;
}

function getConfigTarget(): vscode.ConfigurationTarget {
  return vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
    ? vscode.ConfigurationTarget.Workspace
    : vscode.ConfigurationTarget.Global;
}

interface SetupConfigurationReader {
  get<T>(section: string, defaultValue?: T): T | undefined;
}

interface SetupConfiguration extends SetupConfigurationReader {
  update(key: string, value: unknown, target?: vscode.ConfigurationTarget): Thenable<void>;
}

interface SetupState {
  get<T>(key: string, defaultValue?: T): T | undefined;
  update(key: string, value: unknown): Thenable<void>;
}

async function runFirstOpenSetup(
  config: SetupConfiguration,
): Promise<boolean> {
  const freecadPath = config.get<string>("freecadPath");
  const openscadPath = config.get<string>("openscadPath");

  const hasCustomFreecad = hasCustomConfiguredPath(
    freecadPath,
    FREECAD_DEFAULT,
  );
  const hasCustomOpenScad = hasCustomConfiguredPath(
    openscadPath,
    OPENSCAD_DEFAULT,
  );

  const staleFreecad =
    hasCustomFreecad && EngineRouter.isConfiguredPathStale(freecadPath);
  const staleOpenScad =
    hasCustomOpenScad && EngineRouter.isConfiguredPathStale(openscadPath);
  const shouldPrompt =
    !hasCustomFreecad || !hasCustomOpenScad || staleFreecad || staleOpenScad;

  if (!shouldPrompt) {
    return false;
  }

  const discovered = EngineRouter.discoverInstalledEngines();
  discovered.warnings.forEach((message) =>
    console.warn(`[OmniCAD setup] ${message}`),
  );

  const detectedEngines: string[] = [];
  if (discovered.freecadPath) {
    detectedEngines.push(`FreeCAD (${discovered.freecadPath})`);
  }
  if (discovered.openscadPath) {
    detectedEngines.push(`OpenSCAD (${discovered.openscadPath})`);
  }

  const message =
    detectedEngines.length > 0
      ? `OmniCAD detected: ${detectedEngines.join(", ")}. Do you want to store these paths?`
      : "OmniCAD could not auto-detect FreeCAD/OpenSCAD. Configure paths manually now?";

  const actionUseDetected = "Use Detected Paths";
  const actionManual = "Manual Setup";
  const actionSkip = "Skip For Now";

  const actionSelection = await vscode.window.showQuickPick(
    [
      {
        label: actionUseDetected,
        description:
          discovered.freecadPath || discovered.openscadPath
            ? "Apply detected executable paths"
            : "No detected paths available",
      },
      {
        label: actionManual,
        description: "Configure executable paths manually",
      },
      {
        label: actionSkip,
        description: "Keep current values and continue",
      },
    ],
    {
      title: "OmniCAD Setup",
      placeHolder: message,
      ignoreFocusOut: true,
    },
  );
  const selection = actionSelection?.label;

  const target = getConfigTarget();
  const shouldOpenManual =
    selection === actionManual ||
    (selection !== actionUseDetected && selection !== actionSkip);

  if (
    selection === actionUseDetected &&
    (discovered.freecadPath || discovered.openscadPath)
  ) {
    if (discovered.freecadPath) {
      await config.update("freecadPath", discovered.freecadPath, target);
    }
    if (discovered.openscadPath) {
      await config.update("openscadPath", discovered.openscadPath, target);
    }
    return true;
  }

  if (selection === actionSkip) {
    return false;
  }

  if (!shouldOpenManual) {
    return false;
  }

  const engineSelection = await vscode.window.showQuickPick(
    [
      {
        label: "FreeCAD",
        description: discovered.freecadPath
          ? `Detected: ${discovered.freecadPath}`
          : "No path detected",
        picked: Boolean(discovered.freecadPath),
      },
      {
        label: "OpenSCAD",
        description: discovered.openscadPath
          ? `Detected: ${discovered.openscadPath}`
          : "No path detected",
        picked: Boolean(discovered.openscadPath),
      },
    ],
    {
      canPickMany: true,
      title: "OmniCAD Setup",
      placeHolder: "Select CAD engines to configure",
      ignoreFocusOut: true,
    },
  );

  if (!engineSelection || engineSelection.length === 0) {
    return false;
  }

  let changed = false;

  if (engineSelection.some((item) => item.label === "FreeCAD")) {
    const freecadInput = await vscode.window.showInputBox({
      title: "OmniCAD Setup",
      prompt: "Path to FreeCAD executable",
      value:
        discovered.freecadPath ??
        (hasCustomFreecad ? freecadPath : FREECAD_DEFAULT),
      ignoreFocusOut: true,
      validateInput: (value) =>
        EngineRouter.isExecutablePath(value)
          ? undefined
          : "Path does not exist or is not executable",
    });

    if (freecadInput) {
      await config.update("freecadPath", freecadInput, target);
      changed = true;
    }
  }

  if (engineSelection.some((item) => item.label === "OpenSCAD")) {
    const openscadInput = await vscode.window.showInputBox({
      title: "OmniCAD Setup",
      prompt: "Path to OpenSCAD executable",
      value:
        discovered.openscadPath ??
        (hasCustomOpenScad ? openscadPath : OPENSCAD_DEFAULT),
      ignoreFocusOut: true,
      validateInput: (value) =>
        EngineRouter.isExecutablePath(value)
          ? undefined
          : "Path does not exist or is not executable",
    });

    if (openscadInput) {
      await config.update("openscadPath", openscadInput, target);
      changed = true;
    }
  }

  return changed;
}

async function markFirstOpenSetupComplete(state: SetupState): Promise<void> {
  await state.update(FIRST_OPEN_SETUP_KEY, true);
}

export async function runStartupFirstOpenSetup(
  state: SetupState,
  config: SetupConfigurationReader,
  setupRunner: (config: SetupConfiguration) => Promise<boolean> = runFirstOpenSetup,
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

export function activate(context: vscode.ExtensionContext): void {
  const createRouter = () => {
    const config = vscode.workspace.getConfiguration("omniCAD");
    return new EngineRouter(
      config.get<string>("freecadPath"),
      config.get<string>("openscadPath"),
      config.get<boolean>("enableExperimentalOpenGeometry"),
    );
  };

  let router = createRouter();
  let mcpProcess: cp.ChildProcess | undefined;

  let panel: WebviewPanel | undefined;

  const syncPanelCapabilities = (editor = vscode.window.activeTextEditor) => {
    if (!panel) {
      return;
    }

    const ext = getEditorExtension(editor);
    if (!ext) {
      panel.sendMessage({
        type: "engineCapabilities",
        payload: { reason: "No active editor" },
      });
      return;
    }

    const engine = router.get(ext);
    if (!engine) {
      panel.sendMessage({
        type: "engineCapabilities",
        payload: { reason: `No engine for extension ${ext}` },
      });
      return;
    }

    panel.sendMessage({
      type: "engineCapabilities",
      payload: { engineId: engine.id, capabilities: engine.capabilities },
    });
  };

  const stopMcpProcess = () => {
    if (mcpProcess && !mcpProcess.killed) {
      mcpProcess.kill();
    }
    mcpProcess = undefined;
  };

  const syncMcpProcess = () => {
    stopMcpProcess();
    const config = vscode.workspace.getConfiguration("omniCAD");
    if (!config.get<boolean>("mcpEnabled")) {
      return;
    }

    const entryPath = path.join(
      context.extensionPath,
      "dist",
      "mcp",
      "entry.js",
    );
    mcpProcess = cp.spawn(process.execPath, [entryPath], {
      env: {
        ...process.env,
        OMNICAD_FREECAD_PATH: config.get<string>("freecadPath") ?? "",
        OMNICAD_OPENSCAD_PATH: config.get<string>("openscadPath") ?? "",
        OMNICAD_ENABLE_EXPERIMENTAL_OPENGEOMETRY: config.get<boolean>(
          "enableExperimentalOpenGeometry",
        )
          ? "1"
          : "0",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    mcpProcess.stderr?.on("data", (chunk: Buffer) =>
      console.warn(`[OmniCAD MCP] ${chunk.toString().trim()}`),
    );
  };

  const refreshRuntime = () => {
    router.dispose();
    router = createRouter();
    syncMcpProcess();
    syncPanelCapabilities();
  };

  const openViewer = vscode.commands.registerCommand(
    "omniCAD.openViewer",
    () => {
      panel = WebviewPanel.createOrShow(context, () => router);
      syncPanelCapabilities();
    },
  );

  const runSetup = vscode.commands.registerCommand(
    "omniCAD.runSetup",
    async () => {
      const changed = await runFirstOpenSetup(
        vscode.workspace.getConfiguration("omniCAD"),
      );
      await markFirstOpenSetupComplete(context.globalState);
      if (changed) {
        refreshRuntime();
      }
    },
  );

  const onSave = vscode.workspace.onDidSaveTextDocument(async (doc) => {
    const ext = EngineRouter.getExtensionForFileName(doc.fileName);
    const engine = router.get(ext);
    if (!engine || !panel) {
      return;
    }

    try {
      panel.sendMessage({ type: "compiling" });
      const result = await engine.compile(doc.getText(), {
        sourcePath: doc.fileName,
      });
      lastCompileResult = result;
      panel.sendMessage({ type: "updateMesh", payload: result });
      syncPanelCapabilities(vscode.window.activeTextEditor);
    } catch (err: unknown) {
      panel.sendMessage({
        type: "showError",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });

  const onActiveEditorChange = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      syncPanelCapabilities(editor);
    },
  );

  const onConfigChange = vscode.workspace.onDidChangeConfiguration((event) => {
    if (
      !event.affectsConfiguration("omniCAD.freecadPath") &&
      !event.affectsConfiguration("omniCAD.openscadPath") &&
      !event.affectsConfiguration("omniCAD.mcpEnabled") &&
      !event.affectsConfiguration("omniCAD.enableExperimentalOpenGeometry")
    ) {
      return;
    }

    refreshRuntime();
  });

  syncMcpProcess();

  if (!startupSetupPromise) {
    startupSetupPromise = runStartupFirstOpenSetup(
      context.globalState,
      vscode.workspace.getConfiguration("omniCAD"),
    )
      .then((changed) => {
        if (changed) {
          refreshRuntime();
        }
        return changed;
      })
      .catch((error: unknown) => {
        console.warn(
          `[OmniCAD setup] ${error instanceof Error ? error.message : String(error)}`,
        );
        return false;
      })
      .finally(() => {
        startupSetupPromise = undefined;
      });
  }

  context.subscriptions.push(
    openViewer,
    runSetup,
    onSave,
    onActiveEditorChange,
    onConfigChange,
    {
      dispose: () => {
        stopMcpProcess();
        router.dispose();
      },
    },
  );
}

export function deactivate(): void {}
