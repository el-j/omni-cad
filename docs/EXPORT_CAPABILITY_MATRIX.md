# OmniCAD Export Capability Matrix

Date: 2026-05-07
Status: Planning baseline

## Current Verified Support

| Adapter      | Runtime Status | Geometry Class                  | Verified Export Formats | Notes                              |
| ------------ | -------------- | ------------------------------- | ----------------------- | ---------------------------------- |
| FreeCAD      | Production     | BREP + mesh render bridge       | `STL`, `STEP`, `IGES`   | Current strongest engineering path |
| OpenSCAD     | Production     | Mesh/CSG                        | `STL`                   | Keep mesh-first claims explicit    |
| OpenGeometry | Experimental   | TS/JS procedural mesh prototype | none                    | No production export contract yet  |

## Planned Export Families

| Family                 | Formats              | Primary Use                      | Candidate Adapter Families                              |
| ---------------------- | -------------------- | -------------------------------- | ------------------------------------------------------- |
| Solid/BREP Interchange | `STEP`, `IGES`       | Engineering CAD exchange         | FreeCAD, CadQuery/build123d family                      |
| Mesh Interchange       | `STL`, `glTF`, `OBJ` | Visualization and mesh pipelines | OpenSCAD, FreeCAD mesh path, JS/TS mesh adapters        |
| Fabrication            | `3MF`, `AMF`         | 3D printing workflows            | Mesh adapters after stable mesh contracts               |
| Drafting/2D            | `DXF`, `SVG`         | CNC/laser/drafting workflows     | Future drafting-capable adapters or explicit converters |

## Capability Rules

1. Toolbar formats must be adapter-specific and capability-gated.
2. Marketplace and README text must describe verified support only.
3. New format support requires a file-producing backend and automated validation before UI exposure.
4. Mesh outputs must never be presented as equivalent to solid/BREP exports.

## Immediate Execution Links

- Roadmap task: `.claude/tasks/FEAT-201-omni-bridge-export-adapter-roadmap-2026-05-07.md`
- Feasibility tasks:
  - `.claude/tasks/FEAT-202-cadquery-adapter-feasibility-2026-05-07.md`
  - `.claude/tasks/FEAT-203-build123d-adapter-feasibility-2026-05-07.md`
