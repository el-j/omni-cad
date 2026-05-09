<!-- skill: bootstrap -->

# /bootstrap -- OmniCAD Agent Bootstrap

Refresh the OmniCAD agent workflow from the current repository state.

## Goals

1. Scan current repo structure, package scripts, workflows, and key docs.
2. Confirm `CLAUDE.md`, `.claude/commands/`, `.claude/templates/`, and `.claude/state/` still reflect reality.
3. Propose new specialists only when repeated work patterns are evident.
4. Update the orchestrator queue or state only when there is a concrete next task.

## Checklist

1. Verify root and package-level commands from `package.json` files.
2. Verify workflow paths under `.github/workflows/`.
3. Verify `.claude/tasks/` naming and backlog conventions still fit the repo.
4. Check whether export/runtime/release surfaces changed enough to require new routing notes.
5. Run `pnpm test:agents` after bootstrap edits.

## Rules

- Start from repo reality, not the original blueprint defaults.
- Preserve existing `## Learnings` sections.
- Keep bootstrap changes thin; do not rewrite functioning commands without a concrete reason.

## Result Format

```
STATUS: updated|no-change|blocked
FILES: [created/changed files]
CHECKS: {count}
COMMAND: pnpm test:agents
SUMMARY: {1 sentence}
```

## Learnings

- OmniCAD should keep backlog and state in `.claude/` because `docs/` is reserved for the published site and release docs.
