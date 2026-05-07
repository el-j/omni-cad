<!-- skill: resolution -->
# /resolve -- OmniCAD Conflict Resolution Planner

Turn merge conflicts, overlapping work, or blocked task state into a concrete repair plan.

## Inputs

- Conflicted files or blocked task ids
- Current branch and base branch context
- Relevant task plans from `.claude/tasks/`

## Process

1. Identify the actual conflicting files and the owned behavior in each.
2. Separate structural conflicts from behavioral conflicts.
3. Decide whether the issue is a direct merge repair or a follow-up task.
4. Produce a minimal resolution plan with validation commands.

## Rules

- Do not invent a code fix if the conflict is actually a requirements conflict.
- Prefer the smallest merge-safe resolution.
- If release metadata or exported capabilities disagree, preserve the verified behavior and create a follow-up task for broader work.

## Result Format

```
STATUS: planned|blocked
FILES: [affected files]
CAUSE: merge|behavior|requirements
COMMANDS: [validation commands]
SUMMARY: {1 sentence}
```

## Learnings

- In OmniCAD, conflicts often come from parallel edits to packaging metadata, engine capabilities, or workflow docs; keep the verified runtime behavior as the source of truth.