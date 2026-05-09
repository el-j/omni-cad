#!/usr/bin/env node
/**
 * Custom prepare script for semantic-release in monorepo.
 * Handles version bumping for packages with workspace:* dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkgPath = process.env.npm_config_pkgRoot || 'packages/extension';
const packageJsonPath = path.join(pkgPath, 'package.json');
const version = process.argv[2];

if (!version) {
  throw new Error('Version argument required');
}

console.log(`Preparing ${packageJsonPath} for version ${version}`);

// Read package.json
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Update version directly without npm version command
// (which fails on workspace:* protocol in monorepo)
pkg.version = version;

// Write back
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`✓ Updated ${packageJsonPath} to version ${version}`);
