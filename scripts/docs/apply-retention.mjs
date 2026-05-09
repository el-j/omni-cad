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

function readIndex(indexPath) {
  if (!fs.existsSync(indexPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
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

function isPrereleaseVersion(target) {
  return target.kind === 'version' && String(target.id).includes('-');
}

function parseSemverLike(value) {
  const match = String(value).match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/);
  if (!match) {
    return null;
  }

  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10),
    prerelease: match[4] ? match[4].split('.') : [],
  };
}

function compareIdentifiers(a, b) {
  const aNum = /^\d+$/.test(a);
  const bNum = /^\d+$/.test(b);

  if (aNum && bNum) {
    return Number.parseInt(a, 10) - Number.parseInt(b, 10);
  }

  if (aNum && !bNum) {
    return -1;
  }

  if (!aNum && bNum) {
    return 1;
  }

  return a.localeCompare(b);
}

function compareSemverDesc(aValue, bValue) {
  const a = parseSemverLike(aValue);
  const b = parseSemverLike(bValue);

  if (!a || !b) {
    return 0;
  }

  if (a.major !== b.major) {
    return b.major - a.major;
  }
  if (a.minor !== b.minor) {
    return b.minor - a.minor;
  }
  if (a.patch !== b.patch) {
    return b.patch - a.patch;
  }

  const maxLength = Math.max(a.prerelease.length, b.prerelease.length);
  for (let index = 0; index < maxLength; index += 1) {
    const aPart = a.prerelease[index];
    const bPart = b.prerelease[index];

    if (aPart === undefined && bPart === undefined) {
      return 0;
    }
    if (aPart === undefined) {
      return 1;
    }
    if (bPart === undefined) {
      return -1;
    }

    const diff = compareIdentifiers(aPart, bPart);
    if (diff !== 0) {
      return diff > 0 ? -1 : 1;
    }
  }

  return 0;
}

function byVersionThenUpdatedDesc(a, b) {
  const bySemver = compareSemverDesc(a.id, b.id);
  if (bySemver !== 0) {
    return bySemver;
  }

  const aTime = Date.parse(a.updatedAt || 0) || 0;
  const bTime = Date.parse(b.updatedAt || 0) || 0;
  return bTime - aTime;
}

function main() {
  const args = parseArgs(process.argv);
  const siteDir = args.site;
  const keepPrerelease = Number.parseInt(String(args['keep-prerelease'] || '10'), 10);

  if (!siteDir) {
    throw new Error('Missing required --site argument');
  }

  if (!Number.isFinite(keepPrerelease) || keepPrerelease < 0) {
    throw new Error('Expected --keep-prerelease to be a non-negative integer');
  }

  const indexPath = path.join(siteDir, 'versions.json');
  const index = readIndex(indexPath);
  if (!index || !Array.isArray(index.targets)) {
    return;
  }

  const prereleases = index.targets.filter(isPrereleaseVersion).sort(byVersionThenUpdatedDesc);
  const keepIds = new Set(prereleases.slice(0, keepPrerelease).map((target) => target.id));

  const retained = [];
  for (const target of index.targets) {
    if (!isPrereleaseVersion(target) || keepIds.has(target.id)) {
      retained.push(target);
      continue;
    }

    const relPath = normalizePathFragment(target.path);
    const absolutePath = path.join(siteDir, relPath);
    fs.rmSync(absolutePath, { recursive: true, force: true });
  }

  index.targets = sortTargets(retained);
  index.generatedAt = new Date().toISOString();
  fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
}

main();