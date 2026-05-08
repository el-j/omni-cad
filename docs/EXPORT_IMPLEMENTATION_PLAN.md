# Export Implementation Plan

Date: 2026-05-07

## Current Verified State

### What works today

1. Toolbar buttons post export requests from the webview.
2. The extension host receives `requestExport`, validates the active engine, opens a save dialog, and writes returned bytes to disk.
3. Engine export support currently exists only for STL on:

- FreeCAD and STEP is now implemented as well
- OpenSCAD

### What does not work today

1. STEP export is only implemented for FreeCAD.
2. IGES export is not implemented in the current adapters.
3. glTF export is not implemented in the current adapters.
4. OpenGeometry export is not implemented at all.

## Why the buttons felt broken

The toolbar always renders all export formats, but most engines only advertise `STL` today.
Unsupported buttons were previously disabled without strong visual feedback, so they looked inert instead of intentionally unavailable.

## Immediate UX Baseline

Completed in this pass:

1. Unsupported export buttons now render with a clear disabled style.
2. Save dialog defaults now use format-specific extensions and source-adjacent filenames.
3. FreeCAD can export STL, STEP, and IGES.

Still recommended:

1. Add a small inline status label such as `Export support: STL only for OpenSCAD`.
2. Show a short success toast inside the webview after export completes.
3. Show a friendly explanation when no supported CAD editor is active.

## Recommended Implementation Sequence

### Phase 1: Make current STL export feel reliable

1. Add extension-level tests for the `requestExport` flow in `WebviewPanel`.
2. Add save-dialog and file-write success/failure coverage.
3. Add clear webview feedback for unsupported engines and inactive editors.

### Phase 2: Expand FreeCAD export first

FreeCAD is the best path for richer CAD export because it has actual BREP-capable geometry.

Implement in this order:

1. STEP export in `FreeCadAdapter.export()`

- Use FreeCAD shape/object export to `.step` or `.stp`.

2. IGES export in `FreeCadAdapter.export()`

- Use FreeCAD shape/object export to `.iges` or `.igs`.

3. Optional glTF export for FreeCAD

- Either mesh through STL/OBJ conversion before glTF generation, or postpone until a proper mesh pipeline is added.

### Phase 3: Keep OpenSCAD honest

OpenSCAD is currently mesh-first, not BREP-first.

Recommended policy:

1. Keep STL as the only native OpenSCAD export for now.
2. Do not claim STEP or IGES until a real conversion pipeline exists.
3. If glTF is desired, implement a mesh conversion path from STL to glTF rather than pretending native support exists.

### Phase 4: OpenGeometry only after runtime maturity

OpenGeometry is still experimental.

Recommended order:

1. Stabilize compile/runtime first.
2. Add STL export once geometry generation is deterministic.
3. Add glTF export after mesh semantics are finalized.
4. Defer STEP and IGES unless a true solid/BREP representation is introduced.

## Definition Of Done

1. Export buttons visually reflect supported and unsupported states.
2. Supported formats open save dialog and produce files on disk.
3. FreeCAD exports STL and at least one BREP format successfully.
4. Unsupported formats fail explicitly with a user-facing message.
5. Export flow has unit or integration coverage for success and failure paths.

## Omni-Bridge Roadmap

### Capability Policy

1. The toolbar and marketplace copy must reflect adapter-specific reality, not aspirational format coverage.
2. Solid/BREP outputs (`STEP`, `IGES`) stay separate from mesh outputs (`STL`, `glTF`, `OBJ`) and drafting outputs (`DXF`, `SVG`).
3. New formats are added only after an adapter has a real file-producing backend plus validation.

### Export Priority Matrix

| Family      | Formats              | First Candidate Adapters                                       | Why                                       |
| ----------- | -------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| Solid/BREP  | `STEP`, `IGES`       | FreeCAD, future CadQuery/build123d                             | Best engineering interchange value        |
| Mesh        | `STL`, `glTF`, `OBJ` | OpenSCAD, FreeCAD, future JS/TS adapters                       | Viewer and downstream rendering workflows |
| Fabrication | `3MF`, `AMF`         | Mesh-first adapters after stable mesh export                   | Print/manufacturing usefulness            |
| Drafting    | `DXF`, `SVG`         | Future drafting-capable adapters or explicit conversion layers | 2D/CNC/laser workflows                    |

### Adapter Expansion Roadmap

1. BREP Python family next: investigate `CadQuery` and `build123d` as the most realistic next adapters.
2. JS/TS CAD family after that: treat `OpenJSCAD/JSCAD` as separate from `OpenGeometry`, then harden `OpenGeometry` instead of overloading it.
3. Library profiles later: treat ecosystems like `BOSL2` as adapter profiles if they ride an existing runtime.

### Planning Source

The active planning task for this expansion is `.claude/tasks/FEAT-201-omni-bridge-export-adapter-roadmap-2026-05-07.md`.
