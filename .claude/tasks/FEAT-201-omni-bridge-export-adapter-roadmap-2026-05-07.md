# FEAT-201 -- Omni-Bridge Export And Adapter Roadmap

## Summary

Define the next product roadmap for OmniCAD so the extension can grow from a FreeCAD/OpenSCAD bridge into a broader VS Code bridge for open CAD coding ecosystems. The plan must stay honest about what is implemented today while setting a phased path for new export formats, new adapter families, and the validation required before those capabilities are exposed in the UI or marketplace messaging.

## Scope

- In scope:
  - Verified export matrix for current adapters
  - Target export matrix for next phases
  - Priority ordering for new adapter families and language styles
  - Validation strategy and slice-by-slice execution plan
  - Marketplace/docs implications of capability expansion
- Out of scope:
  - Implementing new adapters in this task
  - Claiming support for formats that do not yet have a producing backend
  - Non-VS Code market expansion work

## Acceptance Criteria

- [ ] The roadmap distinguishes verified support, near-term targets, and deferred formats.
- [ ] The roadmap covers current adapters and at least three future adapter families.
- [ ] The roadmap defines a priority order for export formats, with clear reasoning by geometry class.
- [ ] The roadmap identifies validation gates required before new export buttons or marketplace claims go live.
- [ ] The plan is stored in `.claude/tasks/` and queued in `.claude/state/orchestrator-state.json`.

## Edge Cases

- Mesh-only engines must not be marketed as BREP exporters just because a conversion tool exists.
- Library ecosystems like BOSL2 or CadQuery plugins may extend an existing adapter family rather than justify a brand-new engine adapter.
- Some useful formats are 2D or manufacturing-adjacent (`DXF`, `SVG`, `3MF`) and need explicit positioning in the UX instead of being mixed blindly with solid-model exports.

## Public Surface

- `CLAUDE.md`
- `.claude/commands/**`
- `.claude/state/orchestrator-state.json`
- `.claude/tasks/FEAT-201-omni-bridge-export-adapter-roadmap-2026-05-07.md`
- `docs/EXPORT_IMPLEMENTATION_PLAN.md`

## Suggested Specialist

- `extension-runtime`

## Black-Box Test Spec

- Focused test entrypoint: `pnpm test:agents`
- Expected failing behavior before implementation: the workflow validator fails if required agent files, templates, or task queue wiring are missing.
- Passing behavior after implementation: validator passes and the task/state/docs describe a coherent roadmap with explicit current versus planned support.

## Validation Commands

```bash
pnpm test:agents
```

## Export Roadmap

### Current Verified Matrix

| Adapter | Input Style | Current Verified Exports | Notes |
|---------|-------------|--------------------------|-------|
| FreeCAD | Python + document objects | `STL`, `STEP`, `IGES` | Best current path for solid/BREP workflows |
| OpenSCAD | `.scad` mesh/CSG scripts | `STL` | Mesh-first, should stay honest |
| OpenGeometry | TS/JS experimental DSL | none | Compile path exists, export path not production-ready |

### Priority Export Families

1. Solid/BREP interchange: `STEP`, `IGES`
2. Mesh/viewer interchange: `STL`, `glTF`, `OBJ`
3. Manufacturing/printing interchange: `3MF`, `AMF`
4. 2D drafting/vector interchange: `DXF`, `SVG`

### Proposed Product Policy

- Show only formats that a selected adapter can really produce today.
- Treat `glTF` and `OBJ` as mesh exports, never as solid-model interchange.
- Treat `DXF` and `SVG` as separate drafting outputs with their own UX copy.
- Add a central export capability matrix before adding more toolbar buttons.

## Adapter Expansion Families

### P1: BREP Python Family

1. `CadQuery`
2. `build123d`
3. `pythonOCC` or OCC-backed research spike

Rationale:
- Strong overlap with VS Code Python workflows
- Better path to real `STEP` and `IGES`
- Natural fit with the current Python-oriented adapter model

### P2: JS/TS CAD Family

1. `OpenJSCAD/JSCAD`
2. Hardening `OpenGeometry`
3. Optional bridge experiments around manifold/mesh DSLs if they can produce stable contracts

Rationale:
- Expands OmniCAD into native TypeScript/JavaScript CAD authoring
- Fits VS Code developer audience directly
- Requires careful separation between solid-ish semantics and mesh-only semantics

### P3: Existing DSL And Library Profiles

1. OpenSCAD library profiles such as `BOSL2`
2. CadQuery helper libraries and project templates
3. Parametric Python macro/project profiles inside the FreeCAD family

Rationale:
- Sometimes the right abstraction is a profile on top of an existing adapter rather than a whole new engine
- Improves UX for real-world user ecosystems without fragmenting the router too early

### P4: Drafting And Fabrication Targets

1. `DXF`
2. `SVG`
3. `3MF`

Rationale:
- These widen utility for CNC, laser, and print workflows
- They should be introduced only when adapter semantics and save-dialog messaging can distinguish them cleanly from solid export

## Execution Slices

### Slice A -- Export Matrix Foundation

- Add a central capability matrix for format families and file extensions
- Add tests that assert claimed formats match adapter capabilities
- Update toolbar UX to explain mesh vs solid vs drafting outputs

### Slice B -- WebviewPanel Export Flow Tests

- Add extension-level coverage for save-dialog defaults and file writes
- Add success/error coverage for inactive editor and unsupported adapter states

### Slice C -- CadQuery/build123d Feasibility Spike

- Determine whether they should be separate adapters or a Python-family adapter layer
- Prove at least one real export path and compile/render path
- Decide which file extensions and runtime dependencies are supportable in VS Code

### Slice D -- Mesh Interchange Expansion

- Add honest `glTF` or `OBJ` exports where a stable mesh path exists
- Keep format labels explicit about mesh semantics

### Slice E -- Drafting/Fabrication Expansion

- Add `DXF`/`SVG`/`3MF` only with dedicated capability messaging and tests

## Notes

- Marketplace or README copy must not promise “all CAD formats”; the product should instead claim an expanding capability matrix with adapter-specific support.
- If future non-VS Code markets appear, the export capability matrix created here should become the product-level source of truth for all clients.