<!-- skill: implementation -->

# /execute-task -- OmniCAD Test-First Implementation

Implement an approved task against the tests prepared by `/test`.

## Flow

1. Read the task plan.
2. Confirm the validation result is still current.
3. If the task names a specialist, route to it before implementation.
4. Run the focused failing test or the missing-coverage check.
5. Implement the smallest change that satisfies the failing criterion.
6. Re-run the same focused test immediately.
7. After the slice passes, run the smallest additional lint/type/build gate that covers the touched code.
8. Run `/docs` for user-visible changes.
9. Run required E2E gate for touched runtime surfaces.
10. Mark task finalized only when E2E gate is green.

## Rules

1. Do not widen scope between the first implementation edit and the first focused validation.
2. Do not close the task while planned tests are still failing.
3. Keep packaging, README claims, and capability flags consistent with shipped behavior.
4. Record out-of-scope findings in `.build/followup_queue.json`.
5. If runtime/UI behavior changed, E2E is mandatory before finalization.

## Result Format

```
STATUS: done|blocked|failed
TASK: {task-id}
FILES: [created/changed files]
TESTS: {focused command result}
SUMMARY: {1 sentence}
```

## Learnings

- In this repo, packaging is part of product correctness for extension changes; if the task touches shipped UX, include package validation before closing.
