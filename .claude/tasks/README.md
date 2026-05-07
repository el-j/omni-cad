# OmniCAD Task File Conventions

## Goal

Keep task files human-readable, separated, and easy to validate.

## Rules

1. One core intent per task file.
2. Use explicit ids and descriptive names:
   - `FEAT-###-short-kebab-title-YYYY-MM-DD.md`
   - `BUG-###-short-kebab-title-YYYY-MM-DD.md`
   - `OPS-###-short-kebab-title-YYYY-MM-DD.md`
3. Avoid monolithic "boss" files for active execution scope.
4. Split broad work into multiple linked task files with clear dependencies.
5. Every task must include acceptance criteria, edge cases, black-box test spec, and finalization gates.
6. Every task must include a `Documentation Updates` section, even if all entries are `no`.

## Validation

- Workflow integrity: `pnpm test:agents`
- Runtime tasks: include focused tests and required E2E before marking finalized.