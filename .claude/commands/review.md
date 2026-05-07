<!-- skill: review -->
# /review -- OmniCAD White-Box Review

Review the implementation against the approved plan and repo conventions.

## Focus Areas

1. Acceptance criteria coverage
2. Regression risk in extension, landing, or release flows
3. Honest capability claims in docs, UI, and package metadata
4. Documentation sync quality for landing/docs pages and capability docs
5. Missing or weak validation
6. Follow-up items that should not block the current task

## Rules

- Review findings first, ordered by severity.
- Prefer concrete file references and missing tests over stylistic nits.
- Do not silently expand the task scope.

## Result Format

```
STATUS: pass|fail
TASK: {task-id}
FINDINGS: {count}
BLOCKERS: {count}
SUMMARY: {1 sentence}
```

## Learnings

- Review should explicitly check marketplace-facing metadata when extension packaging changed.