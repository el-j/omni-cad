<!-- skill: documentation -->
# /docs -- OmniCAD Documentation Synchronization

Update user-facing and developer-facing documentation after implementation.

## Scope

- Landing page highlights and hero messaging (`packages/landing/src/components/Hero.tsx`)
- Docs page capability details (`packages/landing/src/pages/Docs.tsx`)
- Supporting roadmap/capability docs in `docs/`
- TSDoc for changed public TypeScript contracts

## Rules

1. Do not over-claim: docs must match verified adapter capabilities.
2. For user-visible changes, update both behavior docs and landing communication.
3. For new public TS exports, add concise TSDoc where missing.
4. Keep docs split, human-readable, and focused (no monolithic planning files).

## Result Format

```
STATUS: updated|skipped|blocked
FILES: [created/changed files]
SYNC: landing|docs|tsdoc
CHECKS: [validation commands]
SUMMARY: {1 sentence}
```

## Learnings

- In OmniCAD, docs quality is part of release quality. Landing copy, docs pages, and capability matrices should move together.