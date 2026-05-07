<!-- skill: reporting -->
# /state -- OmniCAD Workflow State

Read `.claude/state/orchestrator-state.json` and present the current queue, active task, blockers, and recent history.

## Rules

- Read-only.
- Show open blockers first.
- Keep output short enough to scan quickly.

## Result Format

```
STATUS: ok
ACTIVE: {task-id|none}
QUEUE: {count}
BLOCKERS: {count}
SUMMARY: {1 sentence}
```

## Learnings

- State output is only useful if the task file paths are stable and the phase names match the actual workflow.