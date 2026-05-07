# BUG-XXX -- Title

## Summary

Describe the broken behavior and the expected corrected behavior.

## Reproduction

1. Step 1
2. Step 2
3. Observed failure

## Acceptance Criteria

- [ ] Broken behavior is covered by a failing test first
- [ ] Fix resolves the reported failure
- [ ] No capability claim or packaging regression is introduced

## Edge Cases

- Similar input variant
- Missing dependency or disabled capability
- Existing user content or config

## Public Surface

- Files or commands affected

## Suggested Specialist

- `extension-runtime` | `marketplace-release` | none

## Black-Box Test Spec

- Minimal regression test:
- Additional edge-case test:

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

- Regression tests pass
- Required E2E pass for touched runtime surfaces