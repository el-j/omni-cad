# OPS-302 -- P1 Inline Docs And TSDoc Hardening

## Summary

Raise maintainability and IntelliSense quality by documenting extension public contracts with concise, accurate TSDoc and ensuring user-facing docs map cleanly to implemented behavior.

## Scope

- In scope:
  - Add/upgrade TSDoc on public classes, interfaces, and exported functions in extension runtime surfaces
  - Document error contracts and capability semantics for adapters, router, webview export flow, and MCP server
  - Ensure docs references point to capability matrix for shipped behavior
- Out of scope:
  - Large refactors unrelated to documentation clarity
  - New feature implementation beyond documentation-required code touchpoints

## Acceptance Criteria

- [x] Core extension public surfaces have concise TSDoc with params/returns/errors where relevant.
- [x] Adapter capability semantics are explicitly documented as shipped vs experimental.
- [x] `EngineRouter` and export flow contracts are documented for IntelliSense consumers.
- [x] MCP tool contract docs align with runtime behavior.
- [x] Landing/docs references for capabilities point to maintained source-of-truth docs.

## Edge Cases

- Documentation claims drift when behavior changes without doc update.
- Excessive comments reduce signal and become stale.
- Experimental adapter semantics mistaken for production support.

## Public Surface

- `packages/extension/src/engines/EngineRouter.ts`
- `packages/extension/src/engines/FreeCadAdapter.ts`
- `packages/extension/src/engines/OpenScadAdapter.ts`
- `packages/extension/src/engines/OpenGeometryAdapter.ts`
- `packages/extension/src/webview/exportFlow.ts`
- `packages/extension/src/webview/WebviewPanel.ts`
- `packages/extension/src/mcp/McpServer.ts`
- `packages/shared-types/src/index.ts`
- `packages/landing/src/pages/Docs.tsx`

## Black-Box Test Spec

1. Developer can discover adapter/export contracts via IntelliSense without reading implementation internals.
2. Public method docs describe real error behavior for unsupported/deferred operations.
3. Capability docs consumers can resolve shipped support from matrix and landing docs consistently.

## Validation Commands

```bash
pnpm --filter omni-cad run pretest
pnpm --filter omni-cad run test
pnpm --filter omni-cad run test:coverage
pnpm --filter @omni-cad/landing run build
```

## Documentation Coverage Inventory

- [x] Record baseline TSDoc coverage for listed public surfaces before edits.
- [x] Record post-change TSDoc coverage for the same surfaces.
- [x] Include a short delta summary in task execution notes.

## Implementation Checklist

1. Engine Runtime Contracts
- [x] Add/normalize TSDoc for `EngineRouter` public API.
- [x] Add/normalize TSDoc for each adapter public method.
- [x] Document capability semantics for `supportsFormat` and `export` methods.

2. Webview And Export Contracts
- [x] Add TSDoc to exported helpers in `exportFlow.ts`.
- [x] Document webview message payload and error propagation contract in `WebviewPanel.ts`.
- [x] Ensure error docs reference typed contract values used in tests.

3. MCP Contract Docs
- [x] Add concise contract-oriented TSDoc around MCP tool handlers.
- [x] Ensure handler docs match schema-enforced input/output behavior.

4. Public Docs Sync
- [x] Cross-check `Docs.tsx` capability snapshot wording against matrix.
- [x] Keep matrix references current in user-facing docs.

5. Review And Guardrails
- [x] Run focused review for stale or speculative docs language.
- [x] Add follow-up checklist item in task notes when documentation debt remains.
- [x] Add a CI or local lint gate to prevent future TSDoc regressions on touched public APIs.

## Documentation Updates

- [x] Update capability and contract docs in landing/docs where wording changed.
- [x] Add short release note entries for significant contract clarifications.
- [x] Keep examples minimal and directly executable where included.

## Finalization Gates

- [x] Acceptance criteria complete.
- [x] Tests/build pass for touched surfaces.
- [x] Reviewer confirms docs are concise and implementation-accurate.
- [x] No speculative capability claims introduced.

## Risks

- Broad doc edits can create noisy diffs and review fatigue.
- Missing a key exported symbol can leave IntelliSense uneven.
- Contract docs may become stale without coupling to test updates.

## Execution Notes (2026-05-07)

- Baseline inventory:
  - Public runtime contracts had uneven TSDoc coverage (notably `EngineRouter`, `OpenGeometryAdapter`, `WebviewPanel`, `exportFlow`, and `McpServer`).
- Post-change inventory:
  - Added concise TSDoc on core public contracts in:
    - `packages/extension/src/engines/EngineRouter.ts`
    - `packages/extension/src/engines/FreeCadAdapter.ts`
    - `packages/extension/src/engines/OpenScadAdapter.ts`
    - `packages/extension/src/engines/OpenGeometryAdapter.ts`
    - `packages/extension/src/webview/exportFlow.ts`
    - `packages/extension/src/webview/WebviewPanel.ts`
    - `packages/extension/src/mcp/McpServer.ts`
- Guardrail:
  - Added claim/contract gate in `scripts/validate-capability-claims.mjs` and wired it through `pnpm test:agents`.
- Validation:
  - Passed extension pretest/test/coverage and landing build.

