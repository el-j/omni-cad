# OmniCAD Implementation Master Plan
Date: 2026-05-07
Status: IN PROGRESS

## Goal
Track and deliver the remaining implementation needed for a bulletproof, type-safe, production-aligned OmniCAD runtime.

## Workstreams
- Core Runtime and UI: `.claude/tasks/implementation-plan-core-runtime-2026-05-07.md`
- MCP and Contracts: `.claude/tasks/implementation-plan-mcp-contracts-2026-05-07.md`
- Testing and Quality: `.claude/tasks/implementation-plan-testing-quality-2026-05-07.md`

## Delivery Sequence
- [x] P0: Eliminate placeholders and wire MCP lifecycle
- [x] P1: Enforce strict contracts and capability gating
- [x] P2: Harden webview/runtime reliability and safety
- [x] P3: Complete coverage matrix and CI quality gates

## P0 Exit Criteria
- [x] OpenSCAD returns real mesh payloads from compile path
- [x] OpenGeometry has real runtime implementation or is explicitly feature-gated as experimental
- [x] MCP server is started/stopped by extension lifecycle with safe error handling
- [x] MCP request/response contract is runtime-validated

## Cross-Stream Non-Negotiables
- [x] No unvalidated boundary inputs at adapter/MCP/webview edges
- [x] No silent success with placeholder exports for promised formats
- [x] No dead protocol surface (either implement or remove)
- [x] No unhandled async errors in save/export/message flows

## Tracking Rules
- [x] Every completed item references a passing test
- [x] Every changed public contract updates docs and tests in same PR
- [x] Every new engine behavior includes timeout and failure-path tests

## Definition of Done
- [x] All three stream plans marked complete
- [x] `npm run compile` passes
- [x] `npm test` passes
- [x] `npm run test:e2e` passes
- [x] Coverage and CI gates pass per testing plan