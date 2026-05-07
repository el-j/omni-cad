# Testing and Quality Implementation Plan
Date: 2026-05-07
Status: IN PROGRESS

## Scope
Close coverage gaps for MCP, message transport, export matrix, engine-positive paths, and reliability behavior under failure conditions.

## Milestone A: Coverage Baseline (P0)
- [x] Add MCP server unit tests for both tools
- [x] Add malformed input and validation-failure tests
- [x] Add adapter failure mapping tests (timeout/exit/error)
- [x] Add OpenSCAD positive compile/render tests after implementation

### Acceptance Criteria
- [x] MCP has meaningful unit coverage
- [x] Failure modes are tested, not assumed

## Milestone B: Message and UI Contract Tests (P1)
- [x] Add webview message-bus tests for ready/updateMesh/showError/exportComplete
- [ ] Add export flow integration tests for success and failure UX
- [x] Add protocol compatibility tests for extension <-> webview message types
- [ ] Add tests ensuring unsupported export actions report clear errors

### Acceptance Criteria
- [x] No untested message types in protocol contracts
- [ ] Export UX has deterministic tested outcomes

## Milestone C: E2E Matrix Expansion (P1/P2)
- [x] Keep FreeCAD render e2e and stabilize fixtures
- [x] Add OpenSCAD e2e positive path once runtime implemented
- [ ] Add engine capability e2e checks (supported vs unsupported format behavior)
- [x] Add config reload e2e checks for engine path changes

### Acceptance Criteria
- [x] E2E covers every non-placeholder engine path
- [ ] E2E validates capability gating behavior

## Milestone D: CI and Flakiness Controls (P2)
- [x] Define separate gates for unit/integration/e2e suites
- [ ] Add retry policy only where deterministic flake is proven
- [ ] Add fixture normalization and temp-file isolation
- [x] Keep runtime-heavy tests bounded by explicit timeout policy

### Acceptance Criteria
- [ ] Test suite is stable across repeated CI runs
- [x] Coverage gates fail fast on regressions

## Quality Gates
- [x] `npm run compile` required
- [x] `npm test` required
- [x] `npm run test:e2e` required
- [x] Coverage thresholds enforced for critical surfaces

## Done Criteria
- [ ] Missing test surfaces from audit are covered
- [ ] No critical feature remains untested in at least one suitable layer
- [x] CI gates provide regression protection for core runtime and MCP
