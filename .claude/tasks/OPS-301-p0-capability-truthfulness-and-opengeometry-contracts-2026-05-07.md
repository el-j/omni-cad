# OPS-301 -- P0 Capability Truthfulness And OpenGeometry Contracts

## Summary

Close the highest-risk audit gaps by aligning user-visible capability claims with verified behavior, hardening OpenGeometry export/metadata contracts, and adding end-to-end assertions for real export artifacts.

## Scope

- In scope:
  - Remove or qualify any public claim that implies shipped glTF export support
  - Replace OpenGeometry export placeholder behavior with explicit, typed unsupported/deferred contract
  - Replace OpenGeometry hardcoded metadata placeholders with computed data or explicit deferred contract
  - Add E2E assertions that successful exports create valid non-empty files
  - Verify MCP setup/status story behavior matches actual command/tool surface
- Out of scope:
  - Implementing new adapter families
  - Shipping new export formats not already validated

## Acceptance Criteria

- [x] Landing/docs capability statements do not overclaim currently shipped exports.
- [x] OpenGeometry export path returns a stable, explicit unsupported/deferred contract.
- [x] OpenGeometry metadata path is no longer hardcoded placeholder data.
- [x] E2E coverage asserts exported files exist and are non-empty for supported formats.
- [x] MCP setup/status tests only rely on registered commands and implemented behavior.
- [x] Unit/integration/E2E gates pass without reducing coverage.

## Contract Shape (Implementation Target)

Use a typed error contract for unsupported/deferred OpenGeometry export handling:

```ts
type DeferredExportError = {
  code: "OMNICAD_UNSUPPORTED_EXPORT";
  adapter: "opengeometry";
  format: string;
  message: string;
  hint?: string;
};
```

Behavior target:

- Export attempts must return/throw this contract shape (or an exact runtime equivalent).
- `message` must describe current unsupported status.
- `hint` should point users to supported adapter/format alternatives when available.

## Edge Cases

- Cached UI state still presents a now-qualified format claim after extension reload.
- Unsupported export format requests arrive from MCP clients using stale assumptions.
- Export save path failures (`EACCES`, `ENOSPC`) produce actionable errors without crash.
- OpenGeometry source compiles but export remains unsupported.

## Public Surface

- `packages/landing/src/components/Features.tsx`
- `packages/landing/src/pages/Docs.tsx`
- `docs/EXPORT_CAPABILITY_MATRIX.md`
- `packages/extension/src/engines/OpenGeometryAdapter.ts`
- `packages/extension/src/webview/exportFlow.ts`
- `packages/extension/src/webview/WebviewPanel.ts`
- `packages/extension/src/mcp/McpServer.ts`
- `packages/extension/src/test/e2e/stories/mcp-setup.test.ts`
- `packages/extension/src/test/e2e/suite/extension.e2e.ts`

## Black-Box Test Spec

1. User can export with a supported adapter/format pair and a file is written.
2. Exported file exists and has non-zero bytes after operation success.
3. Unsupported format request returns a stable unsupported/deferred error contract.
4. OpenGeometry export communicates unsupported/deferred status without roadmap-only placeholder text.
5. MCP setup/status flow reflects only commands/tools that are actually registered and callable.

## Validation Commands

```bash
pnpm test:agents
pnpm --filter omni-cad run pretest
pnpm --filter omni-cad run test
pnpm --filter omni-cad run test:coverage
pnpm --filter omni-cad run test:e2e
pnpm --filter @omni-cad/landing run build
```

## Implementation Checklist

1. Capability Truthfulness

- [x] Audit `Features.tsx` and remove/qualify unverified export claims.
- [x] Align docs table entries with verified adapter capabilities.
- [x] Ensure matrix language distinguishes shipped vs planned support.

2. OpenGeometry Contract Hardening

- [x] Replace export placeholder throw text with a typed unsupported/deferred contract.
- [x] Add/update adapter tests asserting stable error code/message shape.
- [x] Replace hardcoded metadata placeholder values with computed metadata or explicit deferred response.
- [x] Add tests that lock metadata contract shape for OpenGeometry.

3. Export Flow Robustness

- [x] Add failure-path tests for save dialog cancellation and file-write errors.
- [x] Ensure webview error propagation is user-actionable and typed.
- [x] Add regression tests for unsupported format resolution in export flow helper.

4. E2E Assertions

- [x] Extend E2E suite to assert output artifact existence for at least one FreeCAD and one OpenSCAD export.
- [x] Assert exported file byte size is greater than zero.
- [x] Keep E2E assertions deterministic and temp-directory isolated.

5. MCP Story Alignment

- [x] Validate e2e MCP story assumptions against actual command registration.
- [x] Remove or revise story steps that rely on non-existent command ids.
- [x] Add a focused test that checks command registration contract where applicable.

## Documentation Updates

- [x] Update `docs/EXPORT_CAPABILITY_MATRIX.md` capability language.
- [x] Update landing docs/feature copy for capability truthfulness.
- [x] Update changelog entry for clarified capability messaging.

## Finalization Gates

- [x] All acceptance criteria checked.
- [x] Runtime tests pass (`pretest`, `test`, `coverage`, `e2e`).
- [x] Landing build passes.
- [x] `pnpm test:agents` passes.
- [x] Reviewer confirms no user-visible overclaim remains.

## Risks

- Tightening capability claims may be perceived as feature reduction.
- E2E file assertions may be flaky without strict temp path management.
- OpenGeometry contract changes may require updates in consuming code paths.

## Execution Notes (2026-05-07)

- Capability truthfulness:
  - Updated `packages/landing/src/components/Features.tsx` export copy to remove shipped glTF overclaim.
- OpenGeometry contract hardening:
  - `packages/extension/src/engines/OpenGeometryAdapter.ts` now throws a typed unsupported export contract with `code`, `adapter`, `format`, and `hint`.
  - `getBrepMetadata` now computes metadata from compiled mesh output instead of placeholder constants.
- MCP story alignment:
  - `packages/extension/src/test/e2e/stories/mcp-setup.test.ts` now uses only registered command palette entries.
- E2E artifact coverage:
  - `packages/extension/src/test/e2e/suite/extension.e2e.ts` includes non-empty artifact assertions for FreeCAD STEP and OpenSCAD STL exports.
- Validation:
  - Passed `pnpm test:agents`, extension pretest/test/coverage/e2e, and landing build.
