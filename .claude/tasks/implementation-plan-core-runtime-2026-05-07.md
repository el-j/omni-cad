# Core Runtime Implementation Plan
Date: 2026-05-07
Status: IN PROGRESS

## Scope
- Engines: OpenGeometry, OpenSCAD, FreeCAD, EngineRouter
- Extension runtime: activation, save pipeline, config reload
- Webview runtime: message bus, scene lifecycle, export UX

## Milestone A: Engine Completion (P0)
- [x] Implement OpenSCAD STL parse -> `MeshPayload[]` in compile path
- [x] Replace OpenSCAD export placeholder buffers with real bytes for supported formats
- [x] Implement OpenGeometry runtime or gate as experimental with explicit UI/README behavior
- [x] Add adapter capability declarations per engine

### Acceptance Criteria
- [x] No adapter returns success with empty mesh for render-intended compile in the OpenSCAD path
- [x] No adapter returns placeholder bytes for claimed supported export formats in the OpenSCAD STL path
- [x] Engine capabilities are queryable and enforced by callers

## Completed Execution Slices
- [x] 2026-05-07: OpenSCAD compile/export path upgraded from placeholder behavior to real STL-backed mesh/export behavior and validated with unit tests
- [x] 2026-05-07: MCP/contracts/runtime hardening slice completed with capability gating, guarded MCP lifecycle, OpenGeometry experimental gating, and expanded validation coverage

## Milestone B: Extension Reliability (P1)
- [x] Wrap save compile flow in robust try/catch with user-visible diagnostics
- [x] Ensure config changes rebind engine behavior deterministically
- [x] Add safe disposal behavior for router/panel lifecycle
- [ ] Ensure unsupported file extensions fail gracefully with explicit feedback

### Acceptance Criteria
- [x] No unhandled promise rejections in save/compile/export path
- [x] Config hot-reload behavior is deterministic and tested

## Milestone C: Webview Robustness (P2)
- [x] Implement or remove `cameraMoved` message path
- [x] Fix scene listener/resource cleanup for all attached listeners
- [ ] Add compile/export progress and unsupported-format feedback UI
- [x] Tighten CSP posture and remove avoidable unsafe directives

### Acceptance Criteria
- [x] No dead message types in protocol contracts
- [ ] No listener leaks after panel close/remount cycles
- [x] Unsupported actions produce clear actionable messages

## Type-Safety Requirements
- [x] Strengthen `CompileResponse` contract to avoid ambiguous success states
- [ ] Guard mesh/bounds values against non-finite numeric values
- [x] Avoid unsafe casts in runtime paths; use explicit narrowing/guards

## Risk Controls
- [x] Use feature flags for incremental OpenGeometry rollout
- [x] Keep fallback behavior explicit and user-visible, not silent
- [x] Keep subprocess timeouts and cleanup deterministic

## Done Criteria
- [ ] Runtime milestones A/B/C completed
- [x] New behavior covered by unit/integration tests
- [x] E2E verifies at least one real render path per implemented engine
