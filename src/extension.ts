import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { EngineRouter } from './engines/EngineRouter';
import { WebviewPanel } from './webview/WebviewPanel';
import { CompileResponse } from './types';

let lastCompileResult: CompileResponse | undefined;

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

  return editor.document.fileName.substring(editor.document.fileName.lastIndexOf('.')).toLowerCase();
}

export function activate(context: vscode.ExtensionContext): void {
  const createRouter = () => {
    const config = vscode.workspace.getConfiguration('omniCAD');
    return new EngineRouter(
      config.get<string>('freecadPath'),
      config.get<string>('openscadPath'),
      config.get<boolean>('enableExperimentalOpenGeometry')
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
      panel.sendMessage({ type: 'engineCapabilities', payload: { reason: 'No active editor' } });
      return;
    }

    const engine = router.get(ext);
    if (!engine) {
      panel.sendMessage({
        type: 'engineCapabilities',
        payload: { reason: `No engine for extension ${ext}` },
      });
      return;
    }

    panel.sendMessage({
      type: 'engineCapabilities',
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
    const config = vscode.workspace.getConfiguration('omniCAD');
    if (!config.get<boolean>('mcpEnabled')) {
      return;
    }

    const entryPath = path.join(context.extensionPath, 'dist', 'mcp', 'entry.js');
    mcpProcess = cp.spawn(process.execPath, [entryPath], {
      env: {
        ...process.env,
        OMNICAD_FREECAD_PATH: config.get<string>('freecadPath') ?? '',
        OMNICAD_OPENSCAD_PATH: config.get<string>('openscadPath') ?? '',
        OMNICAD_ENABLE_EXPERIMENTAL_OPENGEOMETRY: config.get<boolean>('enableExperimentalOpenGeometry') ? '1' : '0',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    mcpProcess.stderr?.on('data', (chunk: Buffer) => console.warn(`[OmniCAD MCP] ${chunk.toString().trim()}`));
  };

  const openViewer = vscode.commands.registerCommand('omniCAD.openViewer', () => {
    panel = WebviewPanel.createOrShow(context, () => router);
    syncPanelCapabilities();
  });

  const onSave = vscode.workspace.onDidSaveTextDocument(async (doc) => {
    const ext = doc.fileName.substring(doc.fileName.lastIndexOf('.')).toLowerCase();
    const engine = router.get(ext);
    if (!engine || !panel) { return; }

    try {
      panel.sendMessage({ type: 'compiling' });
      const result = await engine.compile(doc.getText(), { sourcePath: doc.fileName });
      lastCompileResult = result;
      panel.sendMessage({ type: 'updateMesh', payload: result });
      syncPanelCapabilities(vscode.window.activeTextEditor);
    } catch (err: unknown) {
      panel.sendMessage({
        type: 'showError',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });

  const onActiveEditorChange = vscode.window.onDidChangeActiveTextEditor((editor) => {
    syncPanelCapabilities(editor);
  });

  const onConfigChange = vscode.workspace.onDidChangeConfiguration((event) => {
    if (
      !event.affectsConfiguration('omniCAD.freecadPath') &&
      !event.affectsConfiguration('omniCAD.openscadPath') &&
      !event.affectsConfiguration('omniCAD.mcpEnabled') &&
      !event.affectsConfiguration('omniCAD.enableExperimentalOpenGeometry')
    ) {
      return;
    }

    router.dispose();
    router = createRouter();
    syncMcpProcess();
    syncPanelCapabilities();
  });

  syncMcpProcess();

  context.subscriptions.push(openViewer, onSave, onActiveEditorChange, onConfigChange, {
    dispose: () => {
      stopMcpProcess();
      router.dispose();
    },
  });
}

export function deactivate(): void {}
