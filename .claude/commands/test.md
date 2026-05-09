<!-- skill: testing -->

# /test -- OmniCAD Black-Box Acceptance Tests

Write or update tests from the approved task plan before implementation starts.

## Core Principle

Use the task plan, public behavior, and repo conventions. Do not depend on implementation details that are not part of the public behavior under test.

## Strategy

1. Read the task plan.
2. Extract acceptance criteria and edge cases.
3. Choose the narrowest executable test surface.
4. Add failing tests or document why an existing test already covers the criterion.
5. Run the focused test command.

## Preferred Test Surfaces

- Extension unit/integration: `packages/extension/src/test/suite/*.test.ts`
- Extension E2E: `packages/extension/src/test/e2e/**`
- Workflow integrity: `scripts/validate-agent-workflow.mjs`

## Rules

1. Tests come before implementation.
2. Each acceptance criterion needs at least one test or explicit coverage note.
3. If a surface is not directly testable, write the closest stable contract test and add a follow-up item.
4. Include an E2E target in the task spec when the task touches user-visible runtime flows.

## Result Format

```
STATUS: pass|fail|blocked
TASK: {task-id}
TESTS_WRITTEN: {n}
COMMAND: {focused test command}
SUMMARY: {1 sentence}
```

## Learnings

- For extension tests, refresh compiled test output with `pnpm --filter omni-cad run pretest` before running the suite when assertions changed.
