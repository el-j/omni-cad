import * as vscode from 'vscode';
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

export function activate(context: vscode.ExtensionContext): void {
  const createRouter = () => {
    const config = vscode.workspace.getConfiguration('omniCAD');
    return new EngineRouter(
      config.get<string>('freecadPath'),
      config.get<string>('openscadPath')
    );
  };

  let router = createRouter();

  let panel: WebviewPanel | undefined;

  const openViewer = vscode.commands.registerCommand('omniCAD.openViewer', () => {
    panel = WebviewPanel.createOrShow(context, () => router);
  });

  const onSave = vscode.workspace.onDidSaveTextDocument(async (doc) => {
    const ext = doc.fileName.substring(doc.fileName.lastIndexOf('.')).toLowerCase();
    const engine = router.get(ext);
    if (!engine || !panel) { return; }

    const result = await engine.compile(doc.getText(), { sourcePath: doc.fileName });
    lastCompileResult = result;
    panel.sendMessage({ type: 'updateMesh', payload: result });
  });

  const onConfigChange = vscode.workspace.onDidChangeConfiguration((event) => {
    if (!event.affectsConfiguration('omniCAD.freecadPath') && !event.affectsConfiguration('omniCAD.openscadPath')) {
      return;
    }

    router.dispose();
    router = createRouter();
  });

  context.subscriptions.push(openViewer, onSave, onConfigChange, { dispose: () => router.dispose() });
}

export function deactivate(): void {}
