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

function normalizeSitePath(input) {
  const noLeading = String(input || '').replace(/^\/+/, '');
  if (!noLeading) {
    throw new Error('Expected a non-empty relative path for --path');
  }
  return noLeading.endsWith('/') ? noLeading : `${noLeading}/`;
}

function copyDirContents(sourceDir, targetDir) {
  ensureDir(targetDir);

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    ensureDir(targetDir);
  }

  for (const entry of fs.readdirSync(sourceDir)) {
    const source = path.join(sourceDir, entry);
    const target = path.join(targetDir, entry);
    fs.cpSync(source, target, { recursive: true });
  }
}

function readIndex(indexPath) {
  if (!fs.existsSync(indexPath)) {
    return {
      generatedAt: new Date().toISOString(),
      defaultTarget: 'channels/develop/',
      targets: [],
    };
  }

  const parsed = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  return {
    generatedAt: parsed.generatedAt || new Date().toISOString(),
    defaultTarget: parsed.defaultTarget || 'channels/develop/',
    targets: Array.isArray(parsed.targets) ? parsed.targets : [],
  };
}

function upsertTarget(index, target) {
  const existingIndex = index.targets.findIndex((item) => item.id === target.id);
  if (existingIndex >= 0) {
    index.targets[existingIndex] = {
      ...index.targets[existingIndex],
      ...target,
    };
    return;
  }

  index.targets.push(target);
}

function sortTargets(targets) {
  const rankByKind = { channel: 0, version: 1 };
  return [...targets].sort((a, b) => {
    const rankA = rankByKind[a.kind] ?? 99;
    const rankB = rankByKind[b.kind] ?? 99;
    if (rankA !== rankB) {
      return rankA - rankB;
    }

    return String(a.id).localeCompare(String(b.id));
  });
}

function writeRedirectPages(siteDir) {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OmniCAD Docs</title>
  </head>
  <body>
    <script>
      (function () {
        var base = '/omni-cad/';
        var fallback = 'channels/develop/';
        fetch(base + 'versions.json', { cache: 'no-store' })
          .then(function (res) {
            if (!res.ok) throw new Error('metadata unavailable');
            return res.json();
          })
          .then(function (meta) {
            var target = (meta && meta.defaultTarget) || fallback;
            window.location.replace(base + target);
          })
          .catch(function () {
            window.location.replace(base + fallback);
          });
      })();
    </script>
  </body>
</html>
`;

  fs.writeFileSync(path.join(siteDir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(siteDir, '404.html'), html, 'utf8');
}

function main() {
  const args = parseArgs(process.argv);
  const siteDir = args.site;
  const distDir = args.dist;
  const id = args.id;
  const kind = args.kind;
  const label = args.label;
  const relativePath = normalizeSitePath(args.path);

  if (!siteDir || !distDir || !id || !kind || !label) {
    throw new Error('Missing required args. Required: --site --dist --id --kind --label --path');
  }

  if (!fs.existsSync(distDir)) {
    throw new Error(`Dist directory not found: ${distDir}`);
  }

  ensureDir(siteDir);

  const targetDir = path.join(siteDir, relativePath);
  copyDirContents(distDir, targetDir);

  const metadataPath = path.join(siteDir, 'versions.json');
  const index = readIndex(metadataPath);

  if (args['default-target']) {
    index.defaultTarget = normalizeSitePath(args['default-target']);
  }

  if (args['default-if-empty'] && !index.defaultTarget) {
    index.defaultTarget = normalizeSitePath(args['default-if-empty']);
  }

  upsertTarget(index, {
    id,
    label,
    kind,
    path: relativePath,
    version: args.version || null,
    updatedAt: new Date().toISOString(),
  });

  index.generatedAt = new Date().toISOString();
  index.targets = sortTargets(index.targets);

  fs.writeFileSync(metadataPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  writeRedirectPages(siteDir);
}

main();