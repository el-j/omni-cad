# OPS-300 -- Audit Remediation Tracker

## Summary

Track execution of outstanding implementation work identified by the 2026-05-07 audit using split task files with clear dependencies and finalization gates.

## Scope

- In scope:
  - Cross-task progress tracking and dependency ordering
  - P0 capability truthfulness and OpenGeometry contract hardening
  - P1 inline docs and TSDoc hardening
  - P1/P2 test and E2E hardening
- Out of scope:
  - Net-new adapter family implementation (CadQuery/build123d)
  - Marketplace expansion work not tied to audited gaps

## Linked Tasks

1. `OPS-301-p0-capability-truthfulness-and-opengeometry-contracts-2026-05-07.md`
2. `OPS-302-p1-inline-docs-and-tsdoc-hardening-2026-05-07.md`
3. `OPS-303-p1-p2-test-e2e-and-doc-claim-contracts-2026-05-07.md`

## Dependency Order

1. Complete OPS-301 first (product truthfulness and runtime contracts).
2. Start OPS-302 and OPS-303 after OPS-301 acceptance criteria pass.
3. Finalize OPS-303 only after OPS-302 documentation updates are merged.

## Acceptance Criteria

- [x] All linked tasks exist and include checklists, black-box specs, and gates.
- [x] No monolithic execution file is introduced for active scope.
- [x] Task ordering and dependencies are explicit and executable.
- [x] Tracker remains current as boxes are checked in linked tasks.

## Progress Checklist

- [x] OPS-301 created and approved
- [x] OPS-302 created and approved
- [x] OPS-303 created and approved
- [x] Dependency order confirmed by maintainers
- [x] Queue/state updated for orchestrator execution

## Validation Commands

```bash
pnpm test:agents
```

## Notes

- Use linked task files as the source of truth for implementation details.
- Keep this file lightweight; do not duplicate full checklists from linked tasks.
- `pnpm test:agents` passed on 2026-05-07 after task creation and orchestration updates.
