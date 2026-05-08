# Orchestration Plan — FreeCAD Rendering E2E

Date: 2026-05-07
Status: COMPLETE

## Agents Used

- 3× Explore agents: render pipeline, windpower entrypoints, test-gap review

## Tasks

- [x] T1 — Inspect current render pipeline and isolate root causes
- [x] T2 — Validate FreeCAD headless execution and STL export on macOS Homebrew install
- [x] T3 — Inspect windpower-3d scripts and `.claude` conventions
- [x] T4 — Patch OmniCAD FreeCAD execution to preserve source paths and emit mesh data
- [x] T5 — Add focused integration and E2E tests for real FreeCAD rendering
- [x] T6 — Run compile, unit, and E2E validation
- [x] T7 — Finalize task report and mark complete

## Current Findings

- Root cause 1: FreeCadAdapter returned success with no meshes
- Root cause 2: compile() discarded the real file path, which breaks windpower project-relative imports
- Verified path: /Applications/FreeCAD.app/Contents/Resources/bin/freecadcmd

## Outcome

- FreeCAD rendering now produces actual mesh payloads in OmniCAD
- windpower-3d FreeCAD content is covered by both adapter-level integration tests and VS Code E2E tests
- Validation passed for compile, unit tests, and E2E tests

## Follow-up Audit

- 2026-05-07: Comprehensive implementation audit completed in `.claude/tasks/audit-implementation-gaps-2026-05-07.md`

## Implementation Planning

- 2026-05-07: Master tracker in `.claude/tasks/implementation-plan-master-2026-05-07.md`
- 2026-05-07: Core runtime plan in `.claude/tasks/implementation-plan-core-runtime-2026-05-07.md`
- 2026-05-07: MCP/contracts plan in `.claude/tasks/implementation-plan-mcp-contracts-2026-05-07.md`
- 2026-05-07: Testing/quality plan in `.claude/tasks/implementation-plan-testing-quality-2026-05-07.md`

## Execution Slices

- 2026-05-07: OpenSCAD P0 mesh/export slice completed in `.claude/tasks/execute-openscad-mesh-p0-2026-05-07.md`

## Execution Results

- OpenSCAD compile path now returns real renderable mesh payloads instead of `meshes: []`
- OpenSCAD STL export now returns real STL bytes and rejects unsupported formats explicitly
- Validation passed for `npm run compile`, `npm test`, and `npm run lint`

## Execution Results

- 2026-05-07: MCP/runtime/contracts hardening slice completed in `.claude/tasks/execute-mcp-runtime-hardening-p0-p1-2026-05-07.md`
- Engine capability model is now wired through adapters, router, MCP, extension runtime, and toolbar export gating
- OpenGeometry is now explicitly experimental and disabled by default unless the feature flag is enabled
- MCP is now lifecycle-wired behind `omniCAD.mcpEnabled`, validated with `zod`, and covered by unit and smoke tests
- Validation passed for `npm run lint`, `npm run compile`, `npm test`, `npm run test:coverage`, and `npm run test:e2e`

## Orchestration Execution — Audit Remediation Planning

- Date: 2026-05-07
- Status: COMPLETE
- Coordinator mode: parallel swarm planning with consolidated output

### Tasks

- [x] Define split remediation tracker task (`OPS-300`)
- [x] Define P0 execution task (`OPS-301`)
- [x] Define P1 documentation task (`OPS-302`)
- [x] Define P1/P2 test hardening task (`OPS-303`)
- [x] Run parallel quality review subagents on OPS-301/302/303
- [x] Apply quality deltas from subagent findings
- [x] Validate `.claude` workflow integrity (`pnpm test:agents`)
- [x] Update orchestrator state and queue with completion/planned statuses

### Outcome

- Planning execution is complete and tracked.
- `OPS-300` marked done in state history.
- `OPS-301`, `OPS-302`, and `OPS-303` are queued with explicit priorities and specialists.

## Orchestration Execution — OPS-301/302/303 Implementation

- Date: 2026-05-07
- Status: COMPLETE
- Coordinator mode: execute-task with focused parallel verification

### Tasks

- [x] Execute OPS-301 P0 capability and OpenGeometry contract hardening
- [x] Execute OPS-302 TSDoc and contract clarity hardening
- [x] Execute OPS-303 test/E2E/docs-claim contract hardening
- [x] Validate with full gate chain
- [x] Mark task files complete and move state entries to history

### Outcome

- OpenGeometry export now throws a typed unsupported contract; metadata is computed from generated geometry.
- Landing export feature copy no longer overclaims shipped glTF support.
- Added export artifact assertions and failure/recovery coverage in extension tests.
- Added capability-claim validator and wired it into `pnpm test:agents`.
- Validation passed: `pnpm test:agents`, extension `pretest/test/test:coverage/test:e2e`, and landing build.

## Orchestration Execution — FEAT Planning & Feasibility (Export Roadmap, CadQuery, build123d, Auto-Discovery)

- Date: 2026-05-07
- Status: COMPLETE
- Coordinator mode: parallel subagent swarm for all FEAT feasibility tasks

### Tasks

- [x] FEAT-201: Export roadmap planning (capability matrix, UI foundation, expansion families P1–P4)
- [x] FEAT-202: CadQuery adapter feasibility assessment
- [x] FEAT-203: build123d adapter feasibility assessment
- [x] FEAT-204: Auto-discovery + first-open guided setup planning

### Task Outcomes

**FEAT-201 (Export Roadmap & Toolbar UI)**

- Status: Planned (execution ready)
- Acceptance: All 6 criteria met
- Key decisions:
  - Central capability matrix is source of truth (landing/docs validation gate enforces alignment)
  - Toolbar export button gated by adapter capability (no unsupported format offers)
  - Roadmap distinguishes verified formats (STEP/STL/IGES via FreeCAD, STL via OpenSCAD, experimental via OpenGeometry) from planned expansions (CadQuery/build123d, mesh family, drafting family)
- Execution slices A–E defined:
  - A: Central capability matrix + toolbar UI foundation
  - B: CadQuery adapter integration (depends on FEAT-202)
  - C: build123d + shared Python BREP family (depends on FEAT-202/203)
  - D: Mesh expansion (glTF, OBJ, 3MF)
  - E: Drafting expansion (DXF, SVG, AMF)
- Next: Start Slice A in parallel with FEAT-202/203/204

**FEAT-202 (CadQuery Adapter Feasibility)**

- Status: Feasibility confirmed ✅
- Acceptance: All 4 criteria met
- Key decisions:
  - Runtime: Spawn Python subprocess with CadQuery runner script (same pattern as FreeCAD)
  - Extension mapping: Use `.cq.py` extension or config-based preference to disambiguate from FreeCAD `.py` files
  - First export: STL (low risk), STEP follows
  - Architecture: Part of shared `PythonBrepAdapter` base layer with build123d (not standalone)
- Key blockers & mitigations:
  1. Python env mismatch (FreeCAD ships Python; CadQuery doesn't) → explicit detection + helpful error
  2. Extension `.py` overlap → use `.cq.py` or config preference
  3. Missing CadQuery install → graceful skip with install guidance
- Next implementation slice:
  1. Add `.cq.py` extension support + config-preferred routing
  2. Implement `CadQueryAdapter` with STL export
  3. Add environment detection & pip availability check
  4. E2E test: `.cq.py` file → render → export STL

**FEAT-203 (build123d Adapter Feasibility)**

- Status: Feasibility confirmed ✅
- Acceptance: All 4 criteria met
- Key decisions:
  - Runtime: Spawn Python subprocess (same pattern as FreeCAD/CadQuery)
  - Architecture: Shared `PythonBrepAdapter` base layer (NOT standalone adapter)
  - Rationale: Both CadQuery and build123d are Python subprocess-spawned, use OCP/BREP, require identical env detection + serialization + error handling
  - First export: STL (required), STEP (target)
- Key blockers & mitigations:
  1. Python 3.10+ requirement (check + helpful error)
  2. OCP/CadQuery bindings availability (platform-specific; graceful skip)
  3. Script-to-BREP contract clarity (POC spike needed to validate serialization)
- Risk: Low (subprocess pattern proven); Medium (OCP binary availability edge cases); Dependency (FEAT-202 POC informs shared layer design)
- Next implementation slice:
  1. Create `PythonBrepAdapter` base class with shared Python runner init, env detection, Python 3.10+ check
  2. Implement `PythonBrepAdapter.compile()` harness for build123d scripts
  3. Implement `PythonBrepAdapter.export(STL)` with temp file I/O + serialization validation
  4. E2E test: build123d `.py` → compile → measure → export STL

**FEAT-204 (Auto-Discovery & First-Open Guided Setup)**

- Status: Planned (implementation ready) ✅
- Acceptance: All 6 criteria met
- Key flow: Consent-first detection → show detected engines → obtain user consent before storing paths → fallback wizard for manual setup
- Safe defaults: Platform-specific scans
  - macOS: `/Applications/FreeCAD.app`, `/Applications/OpenSCAD.app`, `which freecad/openscad`
  - Linux: `/usr/bin/freecad`, snap paths, `/usr/bin/openscad`, `which` fallback
  - Windows: `C:\Program Files\`, registry fallback (no shell required)
- Fallback wizard: Manual engine selection, path validation, "skip for now" option
- Edge cases handled: Multiple installations, stale paths, permission denied, concurrent activations, Windows no-shell
- Black-box tests: 6 scenarios (all found, partial, none found, stale paths, user deny, permission denied)
- Test commands: `pnpm --filter omni-cad run test -- --grep "first-open"`, `pnpm --filter omni-cad run test:coverage`
- Key files: extension.ts (activation hook), EngineRouter.ts (detection logic), WebviewPanel.ts (consent UI), test suite (6 scenarios)
- Next: `/validate` → `/test` → `/execute-task` pipeline

### Execution Record

- FEAT-201 planning: 2026-05-07 (complete, ready for implementation slices A–E)
- FEAT-202 feasibility: 2026-05-07 (complete, CadQuery confirmed viable as part of Python BREP family)
- FEAT-203 feasibility: 2026-05-07 (complete, build123d confirmed viable as shared base layer)
- FEAT-204 planning: 2026-05-07 (complete, consent-first auto-discovery ready for `/validate` → `/test` → `/execute-task`)

### Queue Status

- FEAT-201, FEAT-202, FEAT-203, FEAT-204 all planned with execution outcomes
- Next: FEAT-204 implementation (auto-discovery/first-open) can start immediately (no dependencies)
- FEAT-202 CadQuery POC can start immediately (low risk, proven pattern)
- FEAT-203 build123d should wait for FEAT-202 POC to inform shared layer design
- FEAT-201 Slice A (capability matrix + toolbar) can start immediately in parallel

## Orchestration Execution — FEAT-204 Implementation (Slice 1)

- Date: 2026-05-08
- Status: IN PROGRESS
- Coordinator mode: execute-task with focused unit validation

### Tasks

- [x] Add platform-aware engine discovery and stale-path checks in router
- [x] Add first-open consent flow and manual setup fallback in extension activation
- [x] Add extension setting toggle to disable startup setup flow (`omniCAD.autoSetupOnStartup`)
- [x] Add unit coverage for discovery defaults, PATH fallback, and stale-path behavior
- [ ] Add first-open E2E story coverage
- [ ] Run full repo validation gates

### Current Outcome

- FEAT-204 first implementation slice is landed in runtime code:
  - discovery helpers in `EngineRouter`
  - consent-first setup and manual path wizard in `extension.activate`
  - stale-path revalidation support on activation
- Unit diagnostics are clean for touched files.
- Full `pnpm` gate execution is currently blocked locally by package manager spec mismatch (`Unsupported package manager specification (~pnpm@10.33.2)`).

## Orchestration Execution — FEAT-202 Implementation (Slice 1)

- Date: 2026-05-08
- Status: IN PROGRESS
- Coordinator mode: execute-task with focused unit validation

### Tasks

- [x] Implement CadQuery adapter runtime shell (`CadQueryAdapter`) with STL contract
- [x] Add `.cq.py` extension routing while preserving `.py` → FreeCAD mapping
- [x] Wire compound extension resolution into activation and export flow
- [x] Add focused unit tests for CadQuery route/capability behavior
- [ ] Add CadQuery E2E export artifact story
- [ ] Run full repo validation gates (`test:coverage`, `test:e2e`, `test:agents`)

### Current Outcome

- `CadQueryAdapter` added with Python subprocess execution and explicit missing-runtime guidance.
- `.cq.py` files now route to CadQuery for compile/export requests.
- Validation passed for extension compile + unit tests:
  - `pnpm --filter omni-cad run pretest`
  - `pnpm --filter omni-cad run test` (55 passing)

## Orchestration Execution — FEAT-203 Implementation (Slice 1)

- Date: 2026-05-08
- Status: IN PROGRESS
- Coordinator mode: execute-task with shared runtime base extraction

### Tasks

- [x] Implement shared `PythonBrepAdapter` base layer for Python BREP family
- [x] Refactor CadQuery adapter to use shared base class
- [x] Implement build123d adapter runtime shell (`Build123dAdapter`) with STL contract
- [x] Add `.b3d.py` routing and compound extension detection
- [x] Add focused unit tests for build123d route/capability exposure
- [ ] Add build123d E2E export artifact story
- [ ] Extend build123d export contract to STEP

### Current Outcome

- Shared `PythonBrepAdapter` now provides common Python subprocess + STL parsing + metadata logic.
- `Build123dAdapter` added with `.b3d.py` support and Python 3.10+ guard.
- Validation passed for extension compile + unit tests:
  - `pnpm --filter omni-cad run pretest`
  - `pnpm --filter omni-cad run test` (57 passing)
- Added extension-host E2E artifact stories for CadQuery and build123d in `src/test/e2e/suite/extension.e2e.ts`.
- Current `pnpm --filter omni-cad run test:e2e` Playwright suite remains green (4 passing).

## Orchestration Execution — FEAT-201 Implementation (Slice A Foundation)

- Date: 2026-05-08
- Status: IN PROGRESS
- Coordinator mode: execute-task with runtime contract alignment checks

### Tasks

- [x] Add central code-level export capability matrix for active adapters
- [x] Add test coverage that enforces router capability alignment with matrix entries
- [ ] Wire format-family matrix metadata into toolbar/export UX labels

### Current Outcome

- Added `packages/extension/src/export/capabilityMatrix.ts` as runtime source of truth for adapter export contracts.
- Added matrix-alignment unit tests in `extension.test.ts`.
- Validation passed:
  - `pnpm --filter omni-cad run pretest`
  - `pnpm --filter omni-cad run test` (59 passing)
  - `pnpm test:agents`
