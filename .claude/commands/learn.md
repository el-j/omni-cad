<!-- skill: learning -->

# /learn -- OmniCAD Workflow Learning

After a task completes, append concrete lessons to the relevant command files.

## Inputs

- Task file
- Validation result
- Test result
- Review result
- Any follow-up items

## Rules

1. Preserve existing `## Learnings` sections.
2. Add only repo-specific lessons that would change future agent behavior.
3. Prefer one precise sentence over broad prose.

## Result Format

```
STATUS: updated|skipped
TASK: {task-id}
FILES: [updated command files]
LESSONS: {count}
SUMMARY: {1 sentence}
```

## Learnings

- Useful learnings in this repo usually concern validated commands, packaging gotchas, test harness details, or engine capability boundaries.
