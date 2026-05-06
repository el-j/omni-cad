import * as vscode from 'vscode';
import { EngineRouter } from './engines/EngineRouter';
import { WebviewPanel } from './webview/WebviewPanel';

export function activate(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration('omniCAD');
  const router = new EngineRouter(
    config.get<string>('freecadPath'),
    config.get<string>('openscadPath')
  );

  let panel: WebviewPanel | undefined;

  const openViewer = vscode.commands.registerCommand('omniCAD.openViewer', () => {
    panel = WebviewPanel.createOrShow(context, router);
  });

  const onSave = vscode.workspace.onDidSaveTextDocument(async (doc) => {
    const ext = doc.fileName.substring(doc.fileName.lastIndexOf('.')).toLowerCase();
    const engine = router.get(ext);
    if (!engine || !panel) { return; }

    const result = await engine.compile(doc.getText());
    panel.sendMessage({ type: 'updateMesh', payload: result });
  });

  context.subscriptions.push(openViewer, onSave, { dispose: () => router.dispose() });
}

export function deactivate(): void {}
