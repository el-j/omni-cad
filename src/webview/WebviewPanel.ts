import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EngineRouter } from '../engines/EngineRouter';
import { ExtensionToWebviewMessage, WebviewToExtensionMessage } from '../types';

export class WebviewPanel {
  public static readonly viewType = 'omniCAD.viewer';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _getRouter: () => EngineRouter;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    context: vscode.ExtensionContext,
    getRouter: () => EngineRouter
  ): WebviewPanel {
    const column = vscode.ViewColumn.Beside;
    const panel = vscode.window.createWebviewPanel(
      WebviewPanel.viewType,
      'OmniCAD Viewer',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'dist'),
        ],
      }
    );
    return new WebviewPanel(panel, context.extensionUri, getRouter);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    getRouter: () => EngineRouter
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._getRouter = getRouter;

    this._panel.webview.html = this._getHtmlContent(this._panel.webview);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.onDidReceiveMessage(
      (msg: WebviewToExtensionMessage) => this._handleMessage(msg),
      null,
      this._disposables
    );
  }

  public sendMessage(message: ExtensionToWebviewMessage): void {
    this._panel.webview.postMessage(message);
  }

  public dispose(): void {
    this._panel.dispose();
    for (const d of this._disposables) { d.dispose(); }
    this._disposables = [];
  }

  private async _handleMessage(message: WebviewToExtensionMessage): Promise<void> {
    switch (message.type) {
      case 'ready':
        break;
      case 'requestExport': {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          this.sendMessage({ type: 'showError', message: 'No active editor' });
          return;
        }
        const ext = path.extname(editor.document.fileName).toLowerCase();
        const engine = this._getRouter().get(ext);
        if (!engine) {
          this.sendMessage({ type: 'showError', message: `No engine for extension ${ext}` });
          return;
        }
        const saveUri = await vscode.window.showSaveDialog({
          filters: { [message.format]: [message.format.toLowerCase()] },
        });
        if (!saveUri) { return; }
        try {
          const buf = await engine.export(editor.document.getText(), message.format, {
            sourcePath: editor.document.fileName,
          });
          fs.writeFileSync(saveUri.fsPath, buf);
          this.sendMessage({ type: 'exportComplete', filePath: saveUri.fsPath });
          vscode.window.showInformationMessage(`Exported to ${saveUri.fsPath}`);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          this.sendMessage({ type: 'showError', message: msg });
        }
        break;
      }
      case 'cameraMoved':
        break;
    }
  }

  private _getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
    );
    const nonce = this._getNonce();
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             script-src 'nonce-${nonce}' 'unsafe-eval';
             style-src 'unsafe-inline';
             img-src ${webview.cspSource} data:;
             connect-src 'none';" />
  <title>OmniCAD Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; background: #1e1e1e; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private _getNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < 32; i++) {
      nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nonce;
  }
}
