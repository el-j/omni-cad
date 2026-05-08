# CLAUDE.md -- OmniCAD

This file is the working contract for AI agents operating in OmniCAD.

## Project Overview

OmniCAD is a pnpm/turbo monorepo for a VS Code CAD extension, a docs/landing app,
and shared types. The extension routes source files to CAD engines, renders meshes,
exposes guarded MCP tooling, and packages to a VSIX for marketplace release.

## Repository Structure

```
omni-cad/
├── packages/
│   ├── extension/          # VS Code extension, engines, MCP, webview, tests
│   ├── landing/            # Vite landing/docs site
│   └── shared-types/       # Shared TypeScript contracts
├── .github/workflows/      # CI, release, docs, pages
├── .claude/
│   ├── commands/           # Core agent workflow prompts
│   ├── tasks/              # Planned and completed task records
│   ├── templates/          # Task plan templates
│   └── state/              # Orchestrator state
├── .build/                 # Runtime agent artifacts (gitignored)
└── scripts/                # Repo automation
```

## Development Commands

Verified commands for this repo:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm test:agents
pnpm build
pnpm --filter omni-cad run test:coverage
pnpm --filter omni-cad run test:e2e
pnpm --filter omni-cad run package
```

## Working Conventions

- Prefer the smallest validated change over broad rewrites.
- Treat `packages/extension` as the primary product surface; keep docs and release metadata aligned with shipped VSIX behavior.
- Do not claim engine capabilities that are not implemented and tested.
- When changing export, render, MCP, packaging, or release behavior, update tests or add focused coverage in the same slice.
- Keep `.claude/tasks` as the source of agent plans and execution notes for this repo.
- Keep planning files human-readable and split by concern; avoid monolithic "boss" plans.
- Treat documentation as part of shipping quality: update landing/docs content when important user-visible capabilities change.

## Testing Policy

- The workflow is test-first: plan the task, write or update black-box acceptance tests from the plan, then implement until they pass.
- Use focused tests before broad suites when the task scope is narrow.
- A task is finalized only after required E2E validation passes for the touched runtime surface.
- Extension validation entrypoints:
  - Unit/integration: `pnpm --filter omni-cad run pretest && pnpm --filter omni-cad run test`
  - Coverage gate: `pnpm --filter omni-cad run test:coverage`
  - E2E: `pnpm --filter omni-cad run test:e2e`
- Workflow validation entrypoint: `pnpm test:agents`

## Agent Workflow

### Core Commands

| Command         | Purpose                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `/bootstrap`    | Refresh the OmniCAD agent system from the current repo structure, commands, and conventions          |
| `/task`         | Create or refine a task plan in `.claude/tasks/` with acceptance criteria, edge cases, and test spec |
| `/validate`     | Check a task plan against the current codebase before work starts                                    |
| `/test`         | Write or update black-box acceptance tests from the plan before implementation                       |
| `/execute-task` | Implement the task against the failing or missing tests                                              |
| `/docs`         | Update public docs and landing communication for shipped changes                                     |
| `/review`       | White-box review against repo conventions and the approved plan                                      |
| `/testfix`      | Resolve test failures without shrinking coverage                                                     |
| `/learn`        | Write concrete lessons back into command files                                                       |
| `/orchestrator` | Run queued tasks in order using the same gates                                                       |
| `/state`        | Show current queue and task status from `.claude/state/orchestrator-state.json`                      |
| `/resolve`      | Turn merge conflicts or blocked cross-branch work into a concrete repair plan                        |

### Pipeline

```
/task -> /validate -> /test -> /execute-task -> /docs -> /review -> /testfix -> /learn
```

Rules:

- `/test` must work from the task plan and public behavior, not the implementation internals.
- `/execute-task` does not close a task until the planned tests pass.
- `/docs` updates `packages/landing` and related docs when user-visible capability changes ship.
- `/execute-task` marks tasks finalized only after required E2E passes.
- `/review` can request fixes, but it does not rewrite the task scope.
- `/learn` preserves prior learnings and appends only concrete new lessons.

### Specialist Routing

- `extension-runtime`: use for engine adapters, export formats, webview/runtime flows, MCP boundaries, and extension tests.
- `marketplace-release`: use for marketplace packaging, release workflows, docs/versioning, and publish readiness.

### Runtime Artifacts

- State file: `.claude/state/orchestrator-state.json`
- Follow-up queue: `.build/followup_queue.json`

## Commit Guidance

- Keep commits scoped to one task slice when possible.
- Reference the task file or task id in commit messages and PR descriptions.

## General Behavior

- Verify commands from `package.json` instead of guessing.
- Prefer current repo conventions over blueprint defaults when they differ.
- If a task touches marketplace release behavior, preserve the GitHub-based release path and VSIX packaging checks.
- Add concise TSDoc to important TypeScript public contracts so newcomers get strong IntelliSense context.
