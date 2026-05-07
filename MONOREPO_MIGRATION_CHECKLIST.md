# Monorepo Migration Checklist

This checklist replaces the older pre-monorepo planning shards and tracks the repo against the current workspace layout.

## Completed Foundation

- [x] Root workspace uses `pnpm` + `turbo`
- [x] Reusable types live in `packages/shared-types`
- [x] VS Code extension lives in `packages/extension`
- [x] Landing/docs app lives in `packages/landing`
- [x] Root automation has been updated to use workspace-aware `pnpm` commands
- [x] GitHub Pages now builds from `packages/landing` instead of the legacy static `docs/index.html`
- [x] Legacy implementation-plan shards from the pre-monorepo layout have been removed

## Current Workspace Shape

- [x] Root scripts orchestrate the workspace: `build`, `lint`, `test`, `test:e2e`, `dev`
- [x] Extension packaging remains isolated to `packages/extension`
- [x] Shared landing/docs assets live under `packages/landing/public`
- [x] Release automation versions the extension package manifest at `packages/extension/package.json`

## Remaining Docs Platform Work

- [x] Add versioned docs snapshots per release tag (`vX.Y.Z`)
- [x] Add moving docs channels such as `latest`, `beta`, and `develop`
- [x] Add a docs version selector in the React app
- [x] Publish release notes and upgrade guidance in the docs UI
- [x] Define retention and rollback rules for docs channels

## Remaining Release And Governance Work

- [x] Connect release publishing to docs snapshot publishing
- [x] Move roadmap ownership into the docs experience instead of ad hoc task files
- [x] Define done criteria for roadmap items
- [x] Add docs-specific quality gates such as link checking and Pages base-path checks

## Cleanup Policy

- [x] Remove files that only existed to support the pre-monorepo static Pages site
- [x] Remove duplicated planning files that no longer reflect the active workspace layout
- [ ] Continue deleting stale npm-era references when touching adjacent files