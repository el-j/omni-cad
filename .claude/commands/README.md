# OmniCAD Claude Command System

This is a thin, test-driven adaptation of the blueprint workflow for the OmniCAD monorepo.

## Command Set

| Command         | Purpose                                                        |
| --------------- | -------------------------------------------------------------- |
| `/bootstrap`    | Refresh the agent system from current repo reality             |
| `/task`         | Write a task plan in `.claude/tasks/`                          |
| `/validate`     | Compare that plan with code reality                            |
| `/test`         | Create or update black-box acceptance tests first              |
| `/execute-task` | Implement only what is needed to make planned tests pass       |
| `/docs`         | Update docs and landing communication for shipped changes      |
| `/review`       | Review code against the plan and repo conventions              |
| `/testfix`      | Resolve failures without removing coverage                     |
| `/learn`        | Persist concrete workflow learnings into command files         |
| `/orchestrator` | Run queued tasks sequentially                                  |
| `/state`        | Show queue and task state                                      |
| `/resolve`      | Convert merge conflicts or blocked overlaps into a repair task |

## Pipeline

```
/task -> /validate -> /test -> /execute-task -> /docs -> /review -> /testfix -> /learn
```

## Repo-Specific Decisions

- Backlog and execution records stay in `.claude/tasks/` because the root `docs/` tree is used for the published site.
- Runtime state lives in `.claude/state/orchestrator-state.json`.
- Follow-up items that are out of scope for the current task go to `.build/followup_queue.json`.
- Verified repo commands are the ones listed in `CLAUDE.md`; if package scripts change, update both `CLAUDE.md` and the validator.

## Specialists

- `extension-runtime`: engine adapters, export roadmap slices, runtime/UI wiring, MCP integration, extension tests.
- `marketplace-release`: VSIX packaging, release workflows, marketplace metadata, versioned docs, publish gates.

## Quality Gates

1. Plan has acceptance criteria, edge cases, and test spec.
2. Plan is validated against the current codebase before edits.
3. Acceptance tests are written or updated before implementation.
4. Implementation is scoped to making the tests pass.
5. Documentation and landing/docs pages are updated for shipped user-visible changes.
6. Review checks conventions, packaging claims, docs consistency, and unintended regressions.
7. E2E is run for touched runtime surfaces before finalization.
8. Learnings are appended after completion.

## File Readability Rule

- No monolithic "boss" planning docs for active work.
- Use one intent per file with explicit ids and date-stamped names.
- Keep task plans in `.claude/tasks/` split into focused, testable slices.

## Developer Documentation Rule

- New or significantly changed TypeScript exports should include concise TSDoc for IntelliSense quality.
- Prefer documenting public interfaces and contracts over internal one-liners.

## Learnings

- Start thin. Add specialist agents only after repeated task patterns appear in this repo.
- The first repeated patterns are now clear enough to justify `extension-runtime` and `marketplace-release` specialists.
