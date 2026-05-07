#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const extensionDir = path.join(repoRoot, 'packages', 'extension');

const vsixFiles = fs
  .readdirSync(extensionDir)
  .filter((file) => file.endsWith('.vsix'))
  .map((file) => ({
    file,
    fullPath: path.join(extensionDir, file),
    mtimeMs: fs.statSync(path.join(extensionDir, file)).mtimeMs,
  }))
  .sort((left, right) => right.mtimeMs - left.mtimeMs);

if (vsixFiles.length === 0) {
  throw new Error('No VSIX file found in packages/extension after packaging');
}

for (const entry of fs.readdirSync(repoRoot)) {
  if (entry.endsWith('.vsix')) {
    fs.rmSync(path.join(repoRoot, entry), { force: true });
  }
}

const latest = vsixFiles[0];
const targetPath = path.join(repoRoot, latest.file);
fs.copyFileSync(latest.fullPath, targetPath);

console.log(`Copied ${latest.file} to repo root`);