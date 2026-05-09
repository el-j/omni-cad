import { ExportFormat } from "../types";

export type ExportFamily = "solid-brep" | "mesh" | "drafting-fabrication";

export interface AdapterCapabilityEntry {
  adapterId: "freecad" | "openscad" | "cadquery" | "build123d" | "opengeometry";
  supportedExportFormats: ExportFormat[];
  notes: string;
}

/**
 * Centralized capability matrix used as the code-level source of truth for
 * currently shipped adapter export contracts.
 */
export const ADAPTER_EXPORT_CAPABILITY_MATRIX: AdapterCapabilityEntry[] = [
  {
    adapterId: "freecad",
    supportedExportFormats: ["STL", "STEP", "IGES"],
    notes: "Primary BREP-capable Python adapter.",
  },
  {
    adapterId: "openscad",
    supportedExportFormats: ["STL"],
    notes: "Mesh-first CSG adapter.",
  },
  {
    adapterId: "cadquery",
    supportedExportFormats: ["STL"],
    notes: "Python BREP-family adapter (STL slice shipped, STEP deferred).",
  },
  {
    adapterId: "build123d",
    supportedExportFormats: ["STL"],
    notes: "Python BREP-family adapter (STL slice shipped, STEP deferred).",
  },
  {
    adapterId: "opengeometry",
    supportedExportFormats: [],
    notes: "Experimental runtime; exports intentionally disabled.",
  },
];

/**
 * Export format groupings used for UX messaging and future expansion planning.
 */
export const EXPORT_FORMAT_FAMILIES: Record<ExportFamily, ExportFormat[]> = {
  "solid-brep": ["STEP", "IGES"],
  mesh: ["STL", "glTF"],
  "drafting-fabrication": [],
};

export function getAdapterCapabilityEntry(
  adapterId: AdapterCapabilityEntry["adapterId"],
): AdapterCapabilityEntry {
  const entry = ADAPTER_EXPORT_CAPABILITY_MATRIX.find(
    (candidate) => candidate.adapterId === adapterId,
  );
  if (!entry) {
    throw new Error(
      `No capability matrix entry defined for adapter: ${adapterId}`,
    );
  }
  return entry;
}
