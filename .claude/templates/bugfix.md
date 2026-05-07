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

## Validation Commands

```bash
pnpm test:agents
```