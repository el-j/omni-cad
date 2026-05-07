<!-- skill: orchestration -->
# /orchestrator -- OmniCAD Sequential Queue Runner

Run queued tasks from `.claude/state/orchestrator-state.json` one at a time.

## Queue Policy

1. Pick the highest-priority open task.
2. Run `/validate`.
3. Run `/test`.
4. Run `/execute-task`.
5. Run `/review`.
6. If needed, run `/testfix` and re-check.
7. Run required E2E before marking finalized.
8. Run `/learn` and update state.

## Rules

- One task at a time.
- Do not skip the `/test` step; this repo uses a test-first workflow.
- Do not mark runtime tasks complete until required E2E passes.
- If a task is blocked, record the blocker and move on only if the state policy allows it.

## Result Format

```
STATUS: idle|running|blocked|complete
TASK: {task-id|none}
PHASE: {phase}
QUEUE: {remaining count}
SUMMARY: {1 sentence}
```

## Learnings

- Keep the orchestrator thin; task-specific logic belongs in the task plan or core commands, not in queue management.