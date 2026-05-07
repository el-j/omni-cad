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

- [ ] Feasibility result states whether build123d is viable in current extension architecture.
- [ ] Decision is documented: standalone adapter vs shared Python BREP family layer.
- [ ] At least one export contract is validated or explicitly blocked with technical reasons.
- [ ] Next-step implementation task is queued if viability is confirmed.

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