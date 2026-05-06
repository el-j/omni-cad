import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Scene } from './components/Scene';
import { Toolbar } from './components/Toolbar';
import { MeshPayload, ExtensionToWebviewMessage, WebviewToExtensionMessage } from '../../types';

// VS Code API for webview
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

  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionToWebviewMessage>) => {
      const msg = event.data;
      switch (msg.type) {
        case 'updateMesh':
          if (msg.payload.success && msg.payload.meshes && msg.payload.meshes.length > 0) {
            setMesh(msg.payload.meshes[0]);
            setError(null);
          } else if (!msg.payload.success) {
            setError(msg.payload.errors?.join('\n') ?? 'Unknown error');
          }
          break;
        case 'showError':
          setError(msg.message);
          break;
        case 'exportComplete':
          setError(null);
          break;
      }
    };
    window.addEventListener('message', handler);
    vscode.postMessage({ type: 'ready' });
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleExport = (format: 'STEP' | 'STL' | 'IGES' | 'glTF') => {
    vscode.postMessage({ type: 'requestExport', format });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Toolbar
        showGrid={showGrid}
        wireframe={wireframe}
        onToggleGrid={() => setShowGrid((v) => !v)}
        onToggleWireframe={() => setWireframe((v) => !v)}
        onExport={handleExport}
      />
      <Scene meshPayload={mesh} wireframe={wireframe} showGrid={showGrid} />
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
