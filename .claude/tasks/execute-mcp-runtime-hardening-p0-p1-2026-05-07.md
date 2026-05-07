# Task — Execute MCP, Contracts, and Runtime Hardening
Date: 2026-05-07
Status: COMPLETE

## Goal
Execute the next backlog slices: wire MCP lifecycle with strict validation, add capability-driven runtime gating, harden extension/webview paths, and explicitly gate OpenGeometry as experimental until a real runtime exists.

## Checklist
- [x] Create execution task file
- [x] Inspect MCP/runtime surfaces and finalize scope
- [x] Implement capability model and contract updates
- [x] Wire guarded MCP lifecycle with strict validation
- [x] Harden extension/webview runtime error handling and dead protocol surface
- [x] Gate OpenGeometry as experimental in runtime/UI/docs
- [x] Add or expand tests for contracts, MCP, and runtime gating
- [x] Run compile, lint, unit, e2e, and coverage validation
- [x] Update `.claude` trackers and mark done

## Result
- Added a shared engine capability model and discriminated compile contract, then enforced those capabilities in the router, MCP layer, extension runtime, and toolbar export UX.
- Wired guarded MCP startup through extension activation with a standalone entrypoint, `zod` request validation, typed error envelopes, capability-aware export checks, and deterministic disposal.
- Hardened extension/webview flows by removing dead protocol surface, adding save-path error handling, tightening CSP, and cleaning up scene listeners/resources.
- Explicitly feature-gated OpenGeometry as experimental until a real runtime exists, with matching docs and tests.
- Expanded validation coverage across MCP contracts, protocol variants, OpenSCAD positive paths, OpenSCAD config reload E2E, and coverage threshold enforcement.

## Validation
- `npm run lint` ✓
- `npm run compile` ✓
- `npm test` ✓
- `npm run test:coverage` ✓
- `npm run test:e2e` ✓