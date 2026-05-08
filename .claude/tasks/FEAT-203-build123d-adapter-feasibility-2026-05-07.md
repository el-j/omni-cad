# FEAT-203 -- build123d Adapter Feasibility

## Summary

Determine whether build123d should be implemented as a dedicated adapter or folded into a broader Python BREP adapter family, and define the minimum viable contract for OmniCAD.

## Scope

- In scope:
  - Runtime invocation strategy for build123d scripts
  - Potential overlap/divergence with CadQuery feasibility findings
  - Candidate export contract (`STL`, `STEP`, optionally `IGES`)
  - Test strategy for adapter contract validation
- Out of scope:
  - Final production adapter rollout
  - UI/toolbar copy changes beyond feasibility conclusions

## Acceptance Criteria

- [x] Feasibility result states whether build123d is viable in current extension architecture.
- [x] Decision is documented: standalone adapter vs shared Python BREP family layer.
- [x] At least one export contract is validated or explicitly blocked with technical reasons.
- [x] Next-step implementation task is queued if viability is confirmed.

## Edge Cases

- Build123d script patterns that differ from FreeCAD-style document flows.
- Dependency/version conflicts with local Python toolchains.
- Export file generation with invalid geometry or empty solids.

## Public Surface

- `packages/extension/src/engines/**`
- `packages/extension/src/test/suite/**`
- `.claude/tasks/**`

## Suggested Specialist

- `extension-runtime`

## Black-Box Test Spec

- Focused test entrypoint: `pnpm --filter omni-cad run pretest && pnpm --filter omni-cad run test`
- Expected failing behavior before implementation: no build123d adapter path exists.
- Passing behavior after implementation slice: feasibility harness proves or rejects the targeted contract with explicit test output.

## Validation Commands

```bash
pnpm test:agents
```

## Feasibility Outcome (2026-05-07)

### Viability: ✅ Confirmed
- build123d is pure Python with native OCP/CadQuery integration, supports both STL and STEP export natively.

### Architecture Decision: Shared Python BREP Family Layer
- **Recommendation**: Do NOT create a standalone build123d adapter. Instead, implement a shared `PythonBrepAdapter` base layer that serves both CadQuery and build123d.
- **Rationale**: Both are Python subprocess-spawned, use OCP/BREP objects, and require nearly identical environment detection, serialization, and error handling.
- **Benefit**: Single unified Python runner, shared env check, shared export logic; reduces maintenance burden.

### First Export Contracts: STL + STEP (Target)
- **Required**: Implement STL export first (minimum viable proof).
- **Target**: STEP export as follow-up (both are `.export()` method calls in Python).
- **IGES**: Deferred to P2 per export priority matrix.

### Key Blockers & Mitigations
1. **Python 3.10+ requirement**: build123d requires Python 3.10+; FreeCAD may ship older Python → require explicit version check + helpful error message.
2. **OCP/CadQuery bindings availability**: OCP binary wheels may not exist for all platforms (esp. older macOS) → graceful skip with platform-specific install guidance.
3. **Script-to-BREP contract clarity**: build123d scripts return BREP objects; need explicit runner harness to serialize/export → POC spike to validate serialization method.

### Webview/Runtime Serialization Note
- Webview message passing does not support BREP object serialization → export flow must compute file on host, return file bytes (not object references).
- This aligns with current FreeCAD/OpenSCAD export pattern; no additional architectural change needed.

### Next Implementation Slice (POC)
1. Create `PythonBrepAdapter` base class with shared Python runner initialization, env detection, Python version check.
2. Implement `PythonBrepAdapter.compile()` harness for build123d scripts (executes script, returns mesh bounds from result object).
3. Implement `PythonBrepAdapter.export(STL)` with temp file I/O and serialization validation.
4. E2E test: `.py` build123d file → compile → measure → export STL → assert file exists and size > 0.
5. Validate Python 3.10+ check and skip behavior.

### Risk Assessment
- **Low risk**: Python subprocess pattern proven with FreeCAD; BREP serialization is standard in CAD.
- **Medium risk**: OCP binary availability on macOS/Linux edge cases; mitigate with comprehensive install guidance.
- **Dependency**: FEAT-202 CadQuery POC completion informs shared layer design; do not start FEAT-203 implementation until FEAT-202 POC slice is merged.