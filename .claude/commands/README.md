# OmniCAD Claude Command System

This is a thin, test-driven adaptation of the blueprint workflow for the OmniCAD monorepo.

## Command Set

| Command | Purpose |
|---------|---------|
| `/task` | Write a task plan in `.claude/tasks/` |
| `/validate` | Compare that plan with code reality |
| `/test` | Create or update black-box acceptance tests first |
| `/execute-task` | Implement only what is needed to make planned tests pass |
| `/review` | Review code against the plan and repo conventions |
| `/testfix` | Resolve failures without removing coverage |
| `/learn` | Persist concrete workflow learnings into command files |
| `/orchestrator` | Run queued tasks sequentially |
| `/state` | Show queue and task state |

## Pipeline

```
/task -> /validate -> /test -> /execute-task -> /review -> /testfix -> /learn
```

## Repo-Specific Decisions

- Backlog and execution records stay in `.claude/tasks/` because the root `docs/` tree is used for the published site.
- Runtime state lives in `.claude/state/orchestrator-state.json`.
- Follow-up items that are out of scope for the current task go to `.build/followup_queue.json`.
- Verified repo commands are the ones listed in `CLAUDE.md`; if package scripts change, update both `CLAUDE.md` and the validator.

## Quality Gates

1. Plan has acceptance criteria, edge cases, and test spec.
2. Plan is validated against the current codebase before edits.
3. Acceptance tests are written or updated before implementation.
4. Implementation is scoped to making the tests pass.
5. Review checks conventions, packaging claims, and unintended regressions.
6. Learnings are appended after completion.

## Learnings

- Start thin. Add specialist agents only after repeated task patterns appear in this repo.