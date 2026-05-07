<!-- skill: testing -->
# /testfix -- OmniCAD Test Failure Analysis

Resolve failures from `/test` or post-implementation validation without shrinking coverage.

## Decision Rule

- Fix code when the requirement is correct and behavior is wrong.
- Fix the test when the task plan changed legitimately or the test encoded an invalid assumption.
- If both are unclear, stop and update the task plan first.

## Rules

1. Preserve intent and coverage.
2. Re-run the same failing command after each change.
3. Append any repeatable lesson to the relevant `## Learnings` section.

## Result Format

```
STATUS: fixed|blocked|failed
TASK: {task-id}
CAUSE: code|test|plan
COMMAND: {rerun command}
SUMMARY: {1 sentence}
```

## Learnings

- Keep fixes surgical; broad rewrites make it harder to tell whether the failing criterion was actually resolved.