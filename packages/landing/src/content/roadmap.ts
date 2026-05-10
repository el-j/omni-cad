export type RoadmapStatus = "done" | "in-progress" | "planned";

export type RoadmapItem = {
  id: string;
  title: string;
  status: RoadmapStatus;
  owner: string;
  target: string;
  doneCriteria: string[];
};

export const roadmapItems: RoadmapItem[] = [
  // ── DONE ──────────────────────────────────────────────────────────────────
  {
    id: "marketplace-launch",
    title: "VS Code Marketplace launch",
    status: "done",
    owner: "Core Maintainers",
    target: "Q2 2026",
    doneCriteria: [
      "Extension published to VS Code Marketplace via VSCE_PAT secret from CI",
      ".vsix artifact attached to every GitHub Release",
      "Marketplace metadata (publisher, categories, description, icon) verified",
    ],
  },
  {
    id: "freecad-brep-render",
    title: "FreeCAD solid rendering in live viewer",
    status: "done",
    owner: "Engine Runtime",
    target: "Q1 2026",
    doneCriteria: [
      "FreeCAD Python scripts compile and send real STL mesh payloads to the viewer",
      "Visible solids render in the Three.js panel on every file save",
      "STL, STEP, and IGES export produce non-empty verified files",
    ],
  },
  {
    id: "openscad-mesh-render",
    title: "OpenSCAD mesh rendering",
    status: "done",
    owner: "Engine Runtime",
    target: "Q1 2026",
    doneCriteria: [
      "OpenSCAD .scad scripts compile to real STL mesh data",
      "Mesh renders live in the viewer panel beside the editor",
      "STL export writes a verified non-empty file",
    ],
  },
  // ── IN PROGRESS ───────────────────────────────────────────────────────────
  {
    id: "cadquery-adapter",
    title: "CadQuery adapter (Python BREP family)",
    status: "in-progress",
    owner: "Engine Runtime",
    target: "Q2 2026",
    doneCriteria: [
      ".cq.py files are routed to the CadQuery adapter automatically",
      "Compile path returns a renderable STL mesh to the viewer",
      "STL and STEP export verified with non-empty artifact assertion",
      "Graceful fallback when CadQuery is not installed in the Python environment",
    ],
  },
  {
    id: "viewer-world-rotation",
    title: "World up-axis and scene orientation",
    status: "in-progress",
    owner: "Viewer / UI",
    target: "Q2 2026",
    doneCriteria: [
      "FreeCAD models render lying flat (Z-up world space) instead of standing vertically",
      "Configurable world-up axis (Y-up / Z-up) per engine or globally in settings",
      "Viewer camera resets to the correct orientation when switching engine or file",
    ],
  },
  {
    id: "viewer-scale-settings",
    title: "Improved viewer scale and unit display",
    status: "in-progress",
    owner: "Viewer / UI",
    target: "Q2 2026",
    doneCriteria: [
      "Render scale slider persists between sessions via VS Code workspace settings",
      "Physical unit label (mm / cm / inch) displayed in the viewer toolbar",
      "Model auto-fits the camera on first load without manual zoom",
    ],
  },
  // ── PLANNED ───────────────────────────────────────────────────────────────
  {
    id: "build123d-adapter",
    title: "build123d adapter (Python BREP family)",
    status: "planned",
    owner: "Engine Runtime",
    target: "Q3 2026",
    doneCriteria: [
      ".b3d.py files are routed to the build123d adapter automatically",
      "Compile path returns a renderable mesh to the viewer",
      "STEP and STL export verified with non-empty artifact assertion",
    ],
  },
  {
    id: "opengeometry-export",
    title: "OpenGeometry export support",
    status: "planned",
    owner: "Engine Runtime",
    target: "Q3 2026",
    doneCriteria: [
      "OpenGeometry compile path produces a renderable mesh in the viewer",
      "At least one mesh export format (glTF or STL) verified with non-empty output",
      "Export capability shown correctly in the toolbar for .ts files",
    ],
  },
  {
    id: "mesh-interchange-formats",
    title: "Mesh interchange exports: glTF and OBJ",
    status: "planned",
    owner: "Engine Runtime",
    target: "Q3 2026",
    doneCriteria: [
      "glTF export available for engines with a real mesh pipeline (OpenSCAD, CadQuery)",
      "OBJ export available as a lightweight mesh interchange option",
      "Toolbar labels explicitly identify mesh exports vs solid-model exports",
    ],
  },
  {
    id: "jscad-adapter",
    title: "JSCAD adapter (JS/TS CSG family)",
    status: "planned",
    owner: "Engine Runtime",
    target: "Q4 2026",
    doneCriteria: [
      ".jscad files are routed to the JSCAD adapter",
      "CSG geometry compiles and renders in the viewer",
      "STL export verified with non-empty artifact",
    ],
  },
  {
    id: "fabrication-formats",
    title: "Fabrication exports: 3MF and DXF",
    status: "planned",
    owner: "Engine Runtime",
    target: "Q4 2026",
    doneCriteria: [
      "3MF export available for print-ready workflows",
      "DXF export available for CNC and laser-cut 2D profiles where the adapter supports it",
      "Export format labels distinguish fabrication, mesh, and solid-model outputs",
    ],
  },
];
