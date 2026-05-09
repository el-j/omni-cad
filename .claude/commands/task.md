<!-- skill: planning -->

# /task -- OmniCAD Task Planning

Create or update a task file in `.claude/tasks/`.

## Output Requirements

- Task id: `FEAT-###`, `BUG-###`, `OPS-###`, or `DOC-###`
- Summary and scope boundaries
- Acceptance criteria as testable statements
- At least 3 edge cases when the task is non-trivial
- Public interfaces or files expected to change
- Suggested specialist when a task clearly belongs to one
- Black-box test specification for `/test`
- Validation commands for the smallest meaningful slice

## Template Choice

- Feature: `.claude/templates/feature.md`
- Bugfix: `.claude/templates/bugfix.md`
- Refactor: `.claude/templates/refactor.md`

## OmniCAD Routing Hints

- `packages/extension/**`: extension runtime, engines, MCP, export, packaging
- `packages/landing/**`: site/docs UI and content
- `.github/workflows/**`, root scripts, packaging metadata: release and automation

## Rules

1. Write the plan against the current repo structure, not generic assumptions.
2. Use verified commands from `CLAUDE.md`.
3. Keep scope small enough for one reviewable change set.
4. If the task affects shipped behavior, include packaging or release impact in the plan.

## Result Format

```
STATUS: planned|updated
TASK: {task-id}
FILE: .claude/tasks/{file}.md
TESTS: {planned test entrypoints}
SUMMARY: {1 sentence}
```

## Learnings

- Plans for this repo need explicit test commands because root `pnpm test` and extension-specific coverage/E2E are different gates.
