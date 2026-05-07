import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Scene } from './components/Scene';
import { Toolbar } from './components/Toolbar';
import { ExportFormat, MeshPayload, ExtensionToWebviewMessage, WebviewToExtensionMessage } from '../../types';

// VS Code API for webview.
// acquireVsCodeApi() must be called exactly once per webview lifetime.
declare function acquireVsCodeApi(): {
  postMessage(msg: WebviewToExtensionMessage): void;
  getState<T>(): T | undefined;
  setState<T>(state: T): void;
};

const vscode = acquireVsCodeApi();

const App: React.FC = () => {
  const [mesh, setMesh] = useState<MeshPayload | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supportedFormats, setSupportedFormats] = useState<ExportFormat[]>([]);
  const [engineLabel, setEngineLabel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');

  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionToWebviewMessage>) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object' || !('type' in msg)) {
        return;
      }
      switch (msg.type) {
        case 'compiling':
          setIsLoading(true);
          setLoadingText('Compiling...');
          break;
        case 'exportStarted':
          setIsLoading(true);
          setLoadingText('Exporting...');
          break;
        case 'updateMesh':
          setIsLoading(false);
          if (msg.payload.success && msg.payload.meshes.length > 0) {
            setMesh(msg.payload.meshes[0]);
            setError(null);
          } else if (!msg.payload.success) {
            setError(msg.payload.errors.join('\n'));
          }
          break;
        case 'showError':
          setIsLoading(false);
          setError(msg.message);
          break;
        case 'exportComplete':
          setIsLoading(false);
          setError(null);
          break;
        case 'engineCapabilities':
          setSupportedFormats(msg.payload.capabilities?.supportedExportFormats ?? []);
          setEngineLabel(msg.payload.engineId ?? null);
          if (msg.payload.reason) {
            setError(msg.payload.reason);
          }
          break;
      }
    };
    window.addEventListener('message', handler);
    vscode.postMessage({ type: 'ready' });
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleExport = (format: ExportFormat) => {
    vscode.postMessage({ type: 'requestExport', format });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Toolbar
        showGrid={showGrid}
        wireframe={wireframe}
        supportedFormats={supportedFormats}
        engineLabel={engineLabel}
        onToggleGrid={() => setShowGrid((v) => !v)}
        onToggleWireframe={() => setWireframe((v) => !v)}
        onExport={handleExport}
      />
      <Scene meshPayload={mesh} wireframe={wireframe} showGrid={showGrid} />
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '24px',
            fontFamily: 'sans-serif',
            zIndex: 20,
          }}
        >
          {loadingText}
        </div>
      )}
      {error && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            background: '#5a1d1d',
            color: '#f48771',
            padding: '8px 12px',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            zIndex: 10,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
