import * as assert from 'assert';
import { ExtensionToWebviewMessage, WebviewToExtensionMessage } from '../../types';

function describeExtensionMessage(message: ExtensionToWebviewMessage): string {
  switch (message.type) {
    case 'compiling':
      return 'compiling';
    case 'exportStarted':
      return 'exportStarted';
    case 'updateMesh':
      return message.payload.success ? 'mesh-success' : 'mesh-error';
    case 'showError':
      return `error:${message.message}`;
    case 'exportComplete':
      return `export:${message.filePath}`;
    case 'engineCapabilities':
      return `capabilities:${message.payload.engineId ?? 'unknown'}`;
    case 'updateConfig':
      return `updateConfig:${message.payload.renderScale}`;
  }
}

function describeWebviewMessage(message: WebviewToExtensionMessage): string {
  switch (message.type) {
    case 'requestExport':
      return `request:${message.format}`;
    case 'ready':
      return 'ready';
  }
}

suite('Protocol contracts', () => {
  test('covers all extension-to-webview message variants', () => {
    const messages: ExtensionToWebviewMessage[] = [
      { type: 'compiling' },
      { type: 'exportStarted' },
      { type: 'updateMesh', payload: { success: true, meshes: [], computeTimeMs: 1 } },
      { type: 'showError', message: 'boom' },
      { type: 'exportComplete', filePath: '/tmp/model.stl' },
      {
        type: 'engineCapabilities',
        payload: {
          engineId: 'openscad',
          capabilities: {
            supportedExportFormats: ['STL'],
            supportsBrepMetadata: true,
            renderable: true,
          },
        },
      },
    ];

    assert.deepStrictEqual(messages.map(describeExtensionMessage), [
      'compiling',
      'exportStarted',
      'mesh-success',
      'error:boom',
      'export:/tmp/model.stl',
      'capabilities:openscad',
    ]);
  });

  test('covers all webview-to-extension message variants', () => {
    const messages: WebviewToExtensionMessage[] = [
      { type: 'requestExport', format: 'STL' },
      { type: 'ready' },
    ];

    assert.deepStrictEqual(messages.map(describeWebviewMessage), ['request:STL', 'ready']);
  });
});