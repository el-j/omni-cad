# OPS-303 -- P1/P2 Test, E2E, And Docs-Claim Contracts

## Summary

Increase confidence in runtime behavior by hardening unit/integration/E2E coverage around export failure paths, command registration assumptions, and docs-to-implementation consistency.

## Scope

- In scope:
  - Unit/integration tests for export validation and failure modes
  - Adapter-level unsupported/deferred behavior tests
  - Command registration and callable-surface contract checks
  - E2E assertions for error handling and retry flows
  - Release-facing docs claim consistency checks against capability matrix
- Out of scope:
  - New adapter feature delivery not required for current audited gaps

## Acceptance Criteria

- [x] Export failure paths are covered with deterministic unit/integration tests.
- [x] Adapter unsupported/deferred behavior is validated per adapter contract.
- [x] Command assumptions in tests/stories are aligned with registered commands.
- [x] E2E includes at least one export failure-and-recovery path.
- [x] Docs capability claims have a repeatable consistency check.

## Edge Cases

- Unsupported format selected for current adapter despite format being globally listed.
- Source document path is missing or invalid during export request.
- File write fails due to permission or disk-space limitations.
- Story tests depend on command ids that are renamed or removed.
- Docs table is manually edited and drifts from capability matrix.

## Public Surface

- `packages/extension/src/test/suite/extension.test.ts`
- `packages/extension/src/test/suite/mcp.test.ts`
- `packages/extension/src/test/e2e/suite/extension.e2e.ts`
- `packages/extension/src/test/e2e/stories/mcp-setup.test.ts`
- `packages/extension/src/webview/exportFlow.ts`
- `packages/extension/src/extension.ts`
- `packages/extension/package.json`
- `docs/EXPORT_CAPABILITY_MATRIX.md`
- `packages/landing/src/pages/Docs.tsx`

## Black-Box Test Spec

1. Export request with unsupported adapter/format pair fails with stable error contract.
2. Export request with valid adapter/format pair writes output and reports success.
3. Save/write failure surfaces an actionable error without extension crash.
4. MCP setup/status path only uses implemented and registered command/tool contracts.
5. Docs capability snapshot remains consistent with capability matrix after build/test.

## Validation Commands

```bash
pnpm --filter omni-cad run pretest
pnpm --filter omni-cad run test
pnpm --filter omni-cad run test:coverage
pnpm --filter omni-cad run test:e2e
pnpm --filter @omni-cad/landing run build
pnpm test:agents
```

## Implementation Checklist

1. Unit/Integration Coverage Expansion
- [x] Add tests for unsupported format resolution and messaging.
- [x] Add tests for missing source path and canceled save flow.
- [x] Add tests for filesystem write error propagation.
- [x] Add adapter-specific unsupported/deferred behavior tests.

2. Command And MCP Contract Checks
- [x] Add a focused check for expected command registration/callability.
- [x] Align MCP setup story steps with actual command/tool surface.
- [x] Add regression tests preventing drift between tests and command ids.

3. E2E Hardening
- [x] Add export failure-and-retry story coverage.
- [x] Assert user-visible error and successful retry behavior.
- [x] Keep E2E selectors resilient and deterministic.

4. Docs-Claim Contract Validation
- [x] Add `scripts/validate-capability-claims.mjs` to compare landing/docs capability statements against `docs/EXPORT_CAPABILITY_MATRIX.md`.
- [x] Fail validation when shipped-claims drift from source-of-truth matrix.
- [x] Document maintenance path for updating capability claims with tests.

5. Quality And Release Readiness
- [x] Maintain or improve coverage in touched files.
- [x] Remove fragile assumptions or skipped tests in modified suites.
- [x] Ensure CI command set remains representative of local validation.

## Documentation Updates

- [x] Update test strategy notes for new failure-path coverage.
- [x] Update docs where capability claim contract checks are introduced.
- [x] Add brief release note entry for improved test guarantees.

## Finalization Gates

- [x] Acceptance criteria complete.
- [x] Full extension test chain and E2E pass.
- [x] Landing build passes with updated docs checks.
- [x] Agent workflow validation passes.
- [x] Reviewer signs off on deterministic and stable test additions.

## Risks

- E2E retry-flow assertions may become flaky without stable selectors.
- Strict docs-claim checks may require ongoing upkeep when capabilities evolve.
- Additional tests can increase runtime unless kept focused.

## Requirement-To-Test Traceability

- [x] Map each edge case to at least one unit/integration or E2E test id in execution notes.
- [x] Block finalization if any acceptance criterion has no linked test evidence.

## Execution Notes (2026-05-07)

- Traceability map:
  - Unsupported format edge case:
    - `extension.test.ts` -> `resolveExportRequest rejects unsupported format`
    - `extension.test.ts` -> `export rejects unsupported formats` (OpenSCAD and FreeCAD)
  - Missing/invalid source path edge case:
    - `extension.test.ts` -> `resolveExportRequest rejects when no active editor exists`
    - `extension.test.ts` -> `resolveExportRequest rejects when no engine exists for extension`
  - File write failure edge case:
    - `extension.test.ts` -> `exportToFile propagates write errors`
  - Command drift edge case:
    - `mcp-setup.test.ts` command palette usage aligned to contributed command
    - `extension.e2e.ts` -> `omniCAD.openViewer command is registered`
  - Docs claim drift edge case:
    - `scripts/validate-capability-claims.mjs` enforced via `pnpm test:agents`
  - Failure-and-recovery E2E edge case:
    - `extension.e2e.ts` -> `OpenSCAD export failure and recovery path is stable`
- Coverage result:
  - Coverage gate passed with branch coverage above threshold.
- Validation:
  - Passed `pnpm test:agents`, extension pretest/test/coverage/e2e, and landing build.

