import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const features = read('packages/landing/src/components/Features.tsx');
const docsPage = read('packages/landing/src/pages/Docs.tsx');
const matrix = read('docs/EXPORT_CAPABILITY_MATRIX.md');
const extensionPackageJson = JSON.parse(read('packages/extension/package.json'));
const mcpStory = read('packages/extension/src/test/e2e/stories/mcp-setup.test.ts');

assert.ok(
  !/One click to export[\s\S]*glTF/i.test(features),
  'Features page must not claim shipped glTF export support in the primary export feature copy.'
);

assert.match(matrix, /\|\s*FreeCAD\s*\|[\s\S]*`STL`,\s*`STEP`,\s*`IGES`/i);
assert.match(matrix, /\|\s*OpenSCAD\s*\|[\s\S]*`STL`/i);
assert.match(matrix, /\|\s*OpenGeometry\s*\|[\s\S]*none/i);

assert.match(docsPage, />STL, STEP, IGES</);
assert.match(docsPage, />STL</);
assert.match(docsPage, />None</);

const contributedCommands = new Set(
  (extensionPackageJson.contributes?.commands ?? []).map((entry) => entry.title)
);
assert.ok(
  contributedCommands.has('OmniCAD: Open Viewer'),
  'Expected command contribution: OmniCAD: Open Viewer'
);

assert.ok(
  !/Setup AI Bridge|Show MCP Status/.test(mcpStory),
  'MCP setup story must not depend on non-contributed command palette entries.'
);
assert.ok(
  /OmniCAD: Open Viewer/.test(mcpStory) || /openOmniCadViewer\s*\(/.test(mcpStory),
  'MCP setup story must exercise the contributed OmniCAD viewer command directly or through openOmniCadViewer helper.'
);

console.log('Capability claim validation passed.');
