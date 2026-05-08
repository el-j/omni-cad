# Task — Comprehensive Implementation Audit

Date: 2026-05-07
Status: COMPLETE

## Scope

- Full source audit across `src/engines`, `src/mcp`, `src/webview`, `src/extension.ts`, and all test suites.
- Focus areas: implementation gaps, stubs/placeholders, TODO debt, missing features, unlinked features, and e2e-untested features.

## Critical Findings

- OpenGeometry adapter is still placeholder-based (`compile`, metadata, export): no real OpenGeometry/WASM execution.
- OpenSCAD adapter compile path does not return renderable mesh data (`meshes: []`), and export path returns placeholder buffers.
- MCP server class is not wired into extension activation (`OmniCadMcpServer` exists but is never instantiated/started).

## High Findings

- MCP request args are cast unsafely without runtime validation despite zod schemas being defined; malformed inputs can pass through unchecked.
- Export feature contract mismatch: UI advertises STEP/STL/IGES/glTF globally, but FreeCAD supports STL only and other adapters are stubbed.
- Save-to-compile path has no outer try/catch in extension event handler; unexpected adapter throws can surface as unhandled failures.

## Medium Findings

- `cameraMoved` message type is defined but not implemented (no producer logic in webview scene and no consumer behavior in extension).
- Scene event listener cleanup is incomplete (wheel and mousedown listeners on renderer dom element are not removed in cleanup).
- Compile response schema allows optional meshes and success with empty geometry; this weakens runtime contracts.
- FreeCAD bounds helper can produce Infinity/-Infinity if mesh data is empty or malformed; no finite guard.

## Unlinked / Incomplete Features

- MCP tooling (`compile_and_measure`, `export_geometry`) is effectively unreachable from extension runtime.
- Camera synchronization feature is declared in types but not functionally connected.
- Multi-format export in README/UI is ahead of backend implementation for most engines.

## E2E-Untested Features

- MCP server lifecycle and tool handlers have zero tests.
- Webview message-bus behavior (`ready`, `requestExport`, error/reporting paths) lacks dedicated integration tests.
- Toolbar export permutations by engine and unsupported-format UX are not covered.
- OpenSCAD positive-path rendering is not covered by e2e.
- OpenGeometry real execution path is not testable yet because it is stubbed.

## Action Backlog (Industry-Standard, Type-Safe, Bulletproof)

### P0 — Delivery Blockers

- [ ] Implement real OpenSCAD mesh extraction: export STL -> parse triangles -> return `MeshPayload[]`.
- [ ] Integrate OpenGeometry runtime (or explicitly mark engine experimental and remove production claims).
- [ ] Wire MCP server into extension lifecycle with robust startup/shutdown and guarded opt-in.
- [ ] Replace MCP unsafe casts with strict runtime parsing (`zod.parse`) and structured error responses.

### P1 — Contract and Reliability

- [ ] Introduce engine capability model (`supportedExportFormats`, maybe `supportsBrepMetadata`) and gate UI/tooling by capability.
- [ ] Harden extension save handler with top-level try/catch and explicit user-facing diagnostics.
- [ ] Make `CompileResponse` discriminated (e.g., success=true requires non-empty meshes unless explicitly metadata-only).
- [ ] Add finite checks and schema guards for parsed mesh/bounds before emitting to webview/MCP.

### P2 — Webview Robustness and UX

- [ ] Implement or remove `cameraMoved`; avoid dead protocol surface.
- [ ] Complete Scene cleanup for all listeners/resources and add a rendering throttle/visibility pause strategy.
- [ ] Add loading/progress and unsupported-format feedback paths in webview.
- [ ] Tighten CSP (`unsafe-eval` removal path) with bundling changes where possible.

### P3 — Test and Quality Expansion

- [ ] Add MCP unit/integration tests for both tools, including malformed input and adapter-failure scenarios.
- [ ] Add webview message-flow tests (panel <-> UI) for export success/error and ready handshake.
- [ ] Add adapter contract tests asserting non-placeholder outputs for OpenSCAD/OpenGeometry once implemented.
- [ ] Add e2e matrix by engine and format with deterministic fixtures and bounded runtime.

## Conclusion

The FreeCAD rendering hotfix is a strong, verified step, but OmniCAD remains partially production-ready because two engine backends and MCP integration are still incomplete/placeholder-driven. The highest-value path is to close runtime contract gaps (capabilities + validation), finish OpenSCAD/OpenGeometry execution, then expand test coverage to include MCP and webview transport layers.
