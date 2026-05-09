/**
 * Semantic Release Configuration for OmniCAD monorepo
 * 
 * Handles:
 * - Branch-based channels (main→prod, develop→beta, feature/*→alpha, fix/*→alpha)
 * - Custom version bump via direct package.json update (bypasses npm which fails on workspace:* protocol)
 * - Changelog, git commits, GitHub releases
 */

const versionPlugin = require('./scripts/semantic-release-plugin-version.cjs');

module.exports = {
  branches: [
    { name: 'main', channel: 'prod' },
    { name: 'develop', channel: 'beta', prerelease: 'beta' },
    { name: 'feature/*', channel: 'alpha', prerelease: 'alpha' },
    { name: 'fix/*', channel: 'alpha', prerelease: 'alpha' },
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    // Custom version plugin that directly updates package.json
    // (avoids npm version which fails on workspace:* dependencies)
    [versionPlugin, {}],
    [
      '@semantic-release/git',
      {
        assets: ['packages/extension/package.json', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [],
        successComment: false,
        failComment: false,
        releasedLabels: false,
      },
    ],
  ],
};
