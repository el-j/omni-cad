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

- [ ] A feasibility note identifies viable invocation/runtime strategy in this monorepo.
- [ ] Proposed extension mapping and adapter boundary are documented.
- [ ] At least one realistic export contract (`STL` or `STEP`) is proven or explicitly blocked with reason.
- [ ] A follow-up implementation task is created if feasibility is positive.

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