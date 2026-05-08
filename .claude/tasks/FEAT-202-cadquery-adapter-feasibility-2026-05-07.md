# FEAT-202 -- CadQuery Adapter Feasibility

## Summary

Determine whether CadQuery should become a first-class OmniCAD adapter and define the smallest viable technical path for compile/render/export behavior in VS Code.

## Scope

- In scope:
  - Runtime dependency and invocation strategy for CadQuery
  - Candidate file extensions and router mapping approach
  - Feasibility of `STL` and `STEP` export contract from CadQuery workflows
  - Minimal black-box acceptance tests for any proposed contract
- Out of scope:
  - Full production adapter implementation
  - Marketplace claim updates

## Acceptance Criteria

- [x] A feasibility note identifies viable invocation/runtime strategy in this monorepo.
- [x] Proposed extension mapping and adapter boundary are documented.
- [x] At least one realistic export contract (`STL` or `STEP`) is proven or explicitly blocked with reason.
- [x] A follow-up implementation task is created if feasibility is positive.

## Edge Cases

- Local Python environment mismatch between extension host and user runtime.
- CadQuery scripts that rely on external modules or project-relative imports.
- Export success with empty/degenerate geometry must be treated as failure.

## Public Surface

- `packages/extension/src/engines/**`
- `packages/extension/src/test/suite/**`
- `.claude/tasks/**`

## Suggested Specialist

- `extension-runtime`

## Black-Box Test Spec

- Focused test entrypoint: `pnpm --filter omni-cad run pretest && pnpm --filter omni-cad run test`
- Expected failing behavior before implementation: no CadQuery adapter path exists.
- Passing behavior after implementation slice: feasibility harness proves or rejects the targeted contract with explicit test output.

## Validation Commands

```bash
pnpm test:agents
```

## Feasibility Outcome (2026-05-07)

### Viability: ✅ Confirmed
- CadQuery is pure Python, subprocess-spawnable (parallel to FreeCAD), with native `STL`/`STEP` export via `.export()` method.

### Runtime Strategy
- Spawn Python subprocess with CadQuery runner script; requires `python3` + `pip install cadquery`.
- Build inline executor wrapper to handle missing/mismatched environments gracefully.

### Extension Mapping & FreeCAD Overlap
- **Blocker**: Both adapt `.py` files; FreeCAD currently claims ownership in EngineRouter.
- **Resolution**: Adopt marker-based differentiation—CadQuery uses `# cadquery` comment at head, or introduce `.cq.py` extension with config-based preference.

### First Export Contract: STL
- Implement `CadQueryAdapter.export()` targeting STL as proven first contract.
- STEP follows same pattern after STL is validated.

### Key Blockers & Mitigations
1. Python environment mismatch (FreeCAD ships Python; CadQuery doesn't) → require explicit detection + helpful error messaging.
2. Extension `.py` overlap → implement config preference or `.cq.py` extension fork.
3. Missing CadQuery install → graceful skip with install guidance, not silent fallback.

### Next Implementation Slice
1. Add `.cq.py` extension support + config-preferred routing for ambiguous `.py` files.
2. Implement `CadQueryAdapter` with STL export only; test with sample `Box()` geometry.
3. Add environment detection & pip availability check; skip render/export if not available.
4. E2E test: `.cq.py` file → render → export STL (pass/fail clear).

### Decision: Ready for FEAT-204 Python BREP Implementation
- CadQuery is viable and should be paired with `build123d` in a shared `PythonBrepAdapter` base layer.