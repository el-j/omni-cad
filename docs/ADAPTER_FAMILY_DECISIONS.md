# OmniCAD Adapter Family Decisions

Date: 2026-05-07
Status: Decision baseline for FEAT-201

## Decision 1: Prioritize BREP Python family first

Decision:
- Evaluate `CadQuery` and `build123d` before adding more mesh-only adapters.

Reasoning:
- OmniCAD already has Python and FreeCAD paths, so operational fit is high.
- BREP-first adapters increase serious CAD interchange value (`STEP`, `IGES`) fastest.
- This keeps product direction aligned with engineering-grade workflows.

## Decision 2: Keep JS/TS family explicit and separate

Decision:
- Treat `OpenJSCAD/JSCAD` and hardened `OpenGeometry` as separate adapter candidates.

Reasoning:
- They differ in maturity, semantics, and likely export contracts.
- Combining them early would blur capability claims and testing boundaries.

## Decision 3: Model library ecosystems as profiles first

Decision:
- Treat ecosystems like `BOSL2` (OpenSCAD) and helper stacks around CadQuery/build123d as profiles over base adapters unless they require distinct runtimes.

Reasoning:
- Reduces adapter explosion.
- Keeps routing simpler while still supporting real-world coding styles.

## Decision 4: Introduce drafting/fabrication outputs only with dedicated UX copy

Decision:
- Defer `DXF`, `SVG`, `3MF`, `AMF` until capability labels and save-dialog semantics clearly separate these from solid model exports.

Reasoning:
- Prevents user confusion from mixed export categories.
- Keeps OmniCAD claims technically accurate.

## Trigger Conditions To Revise

Revisit these decisions when any of the following is true:

1. A candidate adapter produces stable compile + export + metadata contracts with tests.
2. User adoption shows clear demand for a specific unsupported language family.
3. Marketplace feedback requires reshaping capability prioritization.