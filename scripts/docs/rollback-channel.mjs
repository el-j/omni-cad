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

function normalizePathFragment(input) {
  const noLeading = String(input || '').replace(/^\/+/, '');
  return noLeading.endsWith('/') ? noLeading : `${noLeading}/`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readIndex(indexPath) {
  if (!fs.existsSync(indexPath)) {
    return {
      generatedAt: new Date().toISOString(),
      defaultTarget: 'channels/develop/',
      targets: [],
    };
  }
  return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
}

function upsertTarget(index, target) {
  const existingIndex = index.targets.findIndex((item) => item.id === target.id && item.kind === target.kind);
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

function titleCase(input) {
  return String(input)
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function main() {
  const args = parseArgs(process.argv);
  const siteDir = args.site;
  const version = args.version;
  const channel = args.channel || 'latest';
  const setDefault = String(args['set-default'] || 'false') === 'true';

  if (!siteDir || !version) {
    throw new Error('Missing required args. Required: --site --version');
  }

  const versionPath = normalizePathFragment(`versions/${version}/`);
  const channelPath = normalizePathFragment(`channels/${channel}/`);

  const sourceDir = path.join(siteDir, versionPath);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Cannot rollback: version docs not found at ${sourceDir}`);
  }

  const targetDir = path.join(siteDir, channelPath);
  ensureDir(path.dirname(targetDir));
  fs.rmSync(targetDir, { recursive: true, force: true });
  ensureDir(targetDir);

  for (const entry of fs.readdirSync(sourceDir)) {
    fs.cpSync(path.join(sourceDir, entry), path.join(targetDir, entry), { recursive: true });
  }

  const metadataPath = path.join(siteDir, 'versions.json');
  const index = readIndex(metadataPath);

  upsertTarget(index, {
    id: channel,
    label: titleCase(channel),
    kind: 'channel',
    path: channelPath,
    version,
    updatedAt: new Date().toISOString(),
  });

  if (setDefault) {
    index.defaultTarget = channelPath;
  }

  index.targets = sortTargets(index.targets);
  index.generatedAt = new Date().toISOString();
  fs.writeFileSync(metadataPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
}

main();