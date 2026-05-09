#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }
  return args;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDirContents(sourceDir, targetDir) {
  ensureDir(targetDir);
  for (const entry of fs.readdirSync(sourceDir)) {
    const source = path.join(sourceDir, entry);
    const target = path.join(targetDir, entry);
    fs.cpSync(source, target, { recursive: true });
  }
}

function pruneRoot(siteDir) {
  const preserve = new Set(['channels', 'versions', 'versions.json', '.nojekyll', 'CNAME']);
  for (const entry of fs.readdirSync(siteDir)) {
    if (preserve.has(entry)) {
      continue;
    }

    fs.rmSync(path.join(siteDir, entry), { recursive: true, force: true });
  }
}

function main() {
  const args = parseArgs(process.argv);
  const siteDir = args.site;
  const distDir = args.dist;

  if (!siteDir || !distDir) {
    throw new Error('Missing required args. Required: --site --dist');
  }

  if (!fs.existsSync(distDir)) {
    throw new Error(`Dist directory not found: ${distDir}`);
  }

  ensureDir(siteDir);
  pruneRoot(siteDir);
  copyDirContents(distDir, siteDir);
}

main();
