# MCP and Contracts Implementation Plan
Date: 2026-05-07
Status: IN PROGRESS

## Scope
Harden MCP as a first-class, type-safe runtime surface with explicit lifecycle, strict validation, capability-aware behavior, and consistent error contracts.

## Milestone A: Lifecycle Wiring (P0)
- [x] Instantiate MCP server from extension activation path
- [x] Add guarded startup strategy (opt-in/configurable if required)
- [x] Add deterministic shutdown/disposal path
- [x] Add startup failure diagnostics without crashing extension

### Acceptance Criteria
- [x] MCP tools become reachable in runtime
- [x] Start/stop behavior is deterministic and tested

## Milestone B: Runtime Validation (P0/P1)
- [x] Replace unsafe MCP arg casts with strict `zod.parse` validation
- [x] Validate request payload size and required fields
- [ ] Validate adapter responses before returning MCP payloads
- [x] Normalize all failures into typed error responses

### Error Contract
- [x] Define standard error envelope (code, message, optional details)
- [x] Map validation failures to validation error code
- [x] Map adapter/subprocess failures to adapter/runtime codes
- [x] Ensure tool responses never leak raw stack traces

## Milestone C: Capability Model Alignment (P1)
- [x] Introduce per-engine capability model (compile/export/metadata)
- [x] Restrict tool format options by engine capability
- [x] Align README/UI/tool docs with actual capabilities
- [x] Add unsupported-capability error behavior with actionable message

### Acceptance Criteria
- [x] No contract mismatch between tool claims and engine implementation
- [x] Tool calls fail fast and explicitly on unsupported operations

## Migration and Rollout
- [ ] Preserve backward compatibility where feasible
- [ ] Add temporary compatibility path with explicit deprecation notes
- [ ] Remove compatibility path after coverage and adoption gates pass

## Test Gates
- [x] Unit: schema validation and rejection cases
- [x] Unit: typed error envelope mapping
- [x] Integration: tool invocation to adapter pipeline
- [x] E2E: runtime MCP tool path execution
- [x] Coverage target for MCP surfaces agreed and enforced in CI

## Done Criteria
- [x] MCP lifecycle wired and stable
- [x] No unsafe runtime casts on tool boundaries
- [x] Capability model active and enforced
- [ ] MCP tests and CI gates green
