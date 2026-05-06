import * as assert from 'assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'omni-cad.omni-cad';

suite('OmniCAD E2E Tests', function () {
  // Longer timeout: VS Code activation can take a few seconds
  this.timeout(30000);

  suiteSetup(async () => {
    // Trigger activation explicitly so the extension is ready for all tests
    const ext = vscode.extensions.getExtension(EXTENSION_ID);
    if (ext && !ext.isActive) {
      await ext.activate();
    }
  });

  test('Extension is installed', () => {
    const ext = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(ext, `Extension "${EXTENSION_ID}" should be installed`);
  });

  test('Extension activates without error', async () => {
    const ext = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(ext, `Extension "${EXTENSION_ID}" should be installed`);
    if (!ext.isActive) {
      await ext.activate();
    }
    assert.ok(ext.isActive, 'Extension should be active after activation');
  });

  test('omniCAD.openViewer command is registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes('omniCAD.openViewer'),
      'The omniCAD.openViewer command should be registered'
    );
  });

  test('Extension contributes freecadPath configuration', () => {
    const config = vscode.workspace.getConfiguration('omniCAD');
    assert.ok(
      config.has('freecadPath'),
      'omniCAD.freecadPath configuration property should exist'
    );
    assert.strictEqual(
      config.get<string>('freecadPath'),
      'FreeCADCmd',
      'freecadPath default should be "FreeCADCmd"'
    );
  });

  test('Extension contributes openscadPath configuration', () => {
    const config = vscode.workspace.getConfiguration('omniCAD');
    assert.ok(
      config.has('openscadPath'),
      'omniCAD.openscadPath configuration property should exist'
    );
    assert.strictEqual(
      config.get<string>('openscadPath'),
      'openscad',
      'openscadPath default should be "openscad"'
    );
  });
});
