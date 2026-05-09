/**
 * Custom semantic-release plugin to handle version bumping in monorepo with workspace dependencies.
 * 
 * Bypasses npm version command which fails on workspace:* protocol.
 * Directly updates package.json version for both root and extension packages.
 */

const fs = require('fs');
const path = require('path');

module.exports = {
  verifyConditions() {
    // Verify package.json files exist
    if (!fs.existsSync('packages/extension/package.json')) {
      throw new Error('packages/extension/package.json not found');
    }
  },

  async prepare(pluginConfig, { nextRelease }) {
    const extPkgPath = path.join('packages/extension', 'package.json');
    
    if (!nextRelease || !nextRelease.version) {
      throw new Error('No next release version provided');
    }

    // Read extension package.json
    const pkg = JSON.parse(fs.readFileSync(extPkgPath, 'utf-8'));
    
    // Update version
    const oldVersion = pkg.version;
    pkg.version = nextRelease.version;
    
    // Write back with 2-space indentation and trailing newline
    fs.writeFileSync(extPkgPath, JSON.stringify(pkg, null, 2) + '\n');
    
    console.log(`Updated ${extPkgPath}: ${oldVersion} → ${nextRelease.version}`);
  },
};
