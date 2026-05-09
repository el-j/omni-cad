<!-- skill: validation -->

# /validate -- OmniCAD Plan Validation

Validate a task plan against the current codebase before implementation.

## Checks

1. Paths and files in the plan exist.
2. Named commands exist in the relevant `package.json` files.
3. The public interface in the plan matches current code boundaries.
4. Acceptance criteria are testable with available tooling.
5. Edge cases cover capability limits, packaging/release effects, and regressions where relevant.

## Rules

- Do not start implementation here.
- If the plan is wrong, update the task file before work starts.
- Flag when a task needs both focused tests and full-suite follow-up.

## Result Format

```
STATUS: pass|revise|blocked
TASK: {task-id}
FINDINGS: {count}
FILES: [key files checked]
SUMMARY: {1 sentence}
```

## Learnings

- Validate script and workflow paths carefully; the repo is a monorepo, but the shipped extension still has package-local commands.
