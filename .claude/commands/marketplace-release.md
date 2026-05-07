<!-- skill: marketplace-release -->
# marketplace-release -- OmniCAD Release Specialist

Use this specialist for marketplace and release readiness work.

## Scope

- VSIX packaging and included assets
- GitHub release workflow behavior
- Marketplace publish configuration and metadata
- Versioned docs, changelog, and release notes consistency
- Update mechanism and release artifact integrity

## Current Repo Reality

- GitHub is the release source of truth.
- The repo root `pnpm build` restores a root-level VSIX artifact.
- The extension package ships package-local README, changelog, license, and icon.
- Marketplace publish depends on configured secrets in GitHub Actions environments.

## Preferred Validation

- `pnpm --filter omni-cad run package`
- `pnpm build`
- Validate workflow files and packaging metadata together

## Result Format

```
STATUS: done|blocked|failed
FILES: [created/changed files]
CHECKS: [validation commands]
RISK: low|medium|high
SUMMARY: {1 sentence}
```

## Learnings

- Marketplace readiness in this repo is not only CI syntax; the shipped VSIX contents and GitHub-based release path must stay coherent.