# REFAC-XXX -- Title

## Summary

Describe the internal improvement and why it is needed.

## Constraints

- External behavior must stay stable unless explicitly listed below.

## Acceptance Criteria

- [ ] Existing behavior remains covered
- [ ] New structure is verified by tests or type/lint gates
- [ ] Follow-up work is recorded if scope is intentionally limited

## Edge Cases

- Existing callers
- Build/package impact
- Test harness impact

## Public Surface

- Expected unchanged behavior:
- Intentional changes:

## Suggested Specialist

- `extension-runtime` | `marketplace-release` | none

## Black-Box Test Spec

- Contract tests to protect unchanged behavior:

## Documentation Updates

- Landing hero update required: yes/no
- Docs page update required: yes/no
- Capability/roadmap docs update required: yes/no
- TSDoc updates required for public TS exports: yes/no

## Validation Commands

```bash
pnpm test:agents
```

## Finalization Gates

- Contract tests stay green
- Required E2E pass for touched runtime surfaces