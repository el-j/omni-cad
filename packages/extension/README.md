# OmniCAD for VS Code

OmniCAD brings code-driven CAD workflows directly into VS Code.

It routes your active model file to the correct backend, compiles it on save, and renders the result in the OmniCAD viewer.

## What it supports today

- FreeCAD Python models (`.py`, `.fcmacro`) with live STL-based preview
- OpenSCAD models (`.scad`) with live STL-based preview
- Experimental OpenGeometry preview for `.ts` and `.js` when explicitly enabled
- In-editor 3D viewer with grid, wireframe, and scale controls
- Guarded MCP entrypoint for automation scenarios

## Current export support

- FreeCAD: STL, STEP, IGES
- OpenSCAD: STL
- OpenGeometry: not yet implemented

The export buttons only enable formats that the active engine currently supports.

## Requirements

OmniCAD works best when the matching CAD tool is installed and reachable:

- FreeCAD: `FreeCADCmd` or `freecadcmd`
- OpenSCAD: `openscad`

You can override both paths in the OmniCAD extension settings.

## Getting started

1. Open a supported CAD source file.
2. Run the command `OmniCAD: Open Viewer`.
3. Save the file to trigger compilation and preview refresh.
4. Use the toolbar to inspect the model or export supported formats.

## Important settings

- `omniCAD.freecadPath`: path to the FreeCAD CLI
- `omniCAD.openscadPath`: path to the OpenSCAD CLI
- `omniCAD.mcpEnabled`: enables the guarded MCP server entrypoint
- `omniCAD.enableExperimentalOpenGeometry`: enables experimental OpenGeometry preview
- `omniCAD.renderScale`: viewer scale factor

## Project links

- Repository: https://github.com/el-j/omni-cad
- Issues: https://github.com/el-j/omni-cad/issues
- Releases: https://github.com/el-j/omni-cad/releases

## Notes

This extension is actively evolving as part of the OmniCAD monorepo. For broader project documentation and release history, see the repository README and changelog.
