# Implementation Overview And Next Roadmap

Date: 2026-05-07
Scope: Audit of roadmap implementation state in the current monorepo branch, plus release-to-marketplace execution plan.

## 1. Verified Roadmap Implementation Status

### Implemented

1. Monorepo foundation and workspace orchestration
- Evidence: `pnpm` + `turbo` root scripts and package structure are active.
- Relevant files:
  - `package.json`
  - `pnpm-workspace.yaml`
  - `turbo.json`

2. Versioned docs publishing model
- Evidence: docs snapshots are merged under `versions/<tag>/`, channels under `channels/<name>/`, and metadata is tracked in `versions.json`.
- Relevant files:
  - `.github/workflows/release.yml`
  - `.github/workflows/pages.yml`
  - `scripts/docs/merge-versioned-site.mjs`

3. Docs selector and base-path-safe routing
- Evidence: UI selector reads `versions.json`; router and asset URLs are channel/version aware.
- Relevant files:
  - `packages/landing/src/App.tsx`
  - `packages/landing/src/pages/Docs.tsx`
  - `packages/landing/vite.config.ts`

4. Retention and rollback operations
- Evidence: prerelease retention script and channel rollback script exist and are wired into workflows.
- Relevant files:
  - `scripts/docs/apply-retention.mjs`
  - `scripts/docs/rollback-channel.mjs`
  - `.github/workflows/pages.yml`
  - `.github/workflows/release.yml`

5. Roadmap governance moved to docs experience
- Evidence: roadmap content is first-class app content with explicit done criteria.
- Relevant files:
  - `packages/landing/src/content/roadmap.ts`
  - `packages/landing/src/pages/Roadmap.tsx`

### Partially Implemented / Open

1. Docs quality gate depth
- Current: base-path correctness check is implemented.
- Open: external and internal link-checking is not yet wired as an enforced CI gate.
- Relevant file:
  - `.github/workflows/docs.yml`

2. Marketplace publication
- Current: release automation builds and attaches `.vsix` to GitHub Releases.
- Open: direct publish to VS Code Marketplace / Open VSX requires PAT-backed pipeline steps and configured repository secrets.
- Relevant file:
  - `.github/workflows/release.yml`

3. Update strategy policy document
- Current: GitHub release remains source of truth and docs channels are release-coupled.
- Open: explicit policy for extension update channels and fallback behavior should be finalized.

## 2. Marketplace Goal Fit (Your Stated Goal)

Goal recap: ship a stable, high-quality extension to the real VS Code Marketplace and keep updates working long term even after Azure DevOps trial concerns.

Assessment:
- Good news: runtime publishing in GitHub Actions does not require an active interactive Azure DevOps session. It only requires a valid PAT stored as GitHub secret.
- Long-term viability is achieved by:
  1. keeping release versioning sourced from Git history (`semantic-release`),
  2. publishing from CI via secrets (`VSCE_PAT`, optionally `OVSX_PAT`),
  3. rotating PAT before expiration.

This already aligns with your GitHub-first source-of-truth requirement.

## 3. Next Roadmap (Execution Sequence)

### Phase A: Marketplace Readiness Hardening (Immediate)

1. Ensure Marketplace metadata completeness
- Validate `publisher`, `repository`, `engines`, description, categories, and visual assets.
- Confirm extension package contains required runtime artifacts only.

2. Add release-time Marketplace publishing
- Publish stable releases from `main` to VS Code Marketplace via `VSCE_PAT`.
- Optionally publish to Open VSX via `OVSX_PAT`.

3. Add fail-fast diagnostics
- Explicit CI messaging when PAT secrets are missing.

### Phase B: Quality And Safety Gates (Before broad adoption)

1. Docs link checking gate
- Add external link checker and internal route verification.

2. Release smoke checks
- Add post-package smoke checks on produced `.vsix` (manifest sanity, command activation integrity).

3. Upgrade-path checks
- Verify extension upgrades from previous published versions in E2E.

### Phase C: Update Mechanism Strategy (GitHub source aligned)

1. Stable channel policy
- Marketplace stable updates only from `main` releases.

2. Pre-release policy
- Keep `beta`/`alpha` channels as optional docs and pre-release testing lanes.

3. Optional in-extension release-notice flow
- Add lightweight "new version available" notice sourced from GitHub Releases API (non-blocking).

### Phase D: Operations And Maintenance

1. PAT rotation runbook
- Rotation cadence, ownership, and break-glass procedure.

2. Rollback drills
- Practice manual channel rollback workflow dispatch quarterly.

3. Release checklist automation
- Convert manual checks to scripted CI assertions where possible.

## 4. Definition Of Done For Marketplace Launch

1. Stable release from `main` publishes successfully to Marketplace from GitHub Actions.
2. `.vsix` is attached to GitHub Release and installable manually.
3. Docs channel metadata and selector reflect the released version.
4. Rollback workflow dispatch is tested at least once.
5. PAT rotation responsibility and expiration tracking is documented.