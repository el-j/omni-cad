import * as path from "path";
import { ExportFormat } from "../types";

type ExportFileInfo = {
  label: string;
  extensions: string[];
  defaultExtension: string;
};

const exportFileInfo: Record<ExportFormat, ExportFileInfo> = {
  STL: {
    label: "STL mesh",
    extensions: ["stl"],
    defaultExtension: "stl",
  },
  STEP: {
    label: "STEP model",
    extensions: ["step", "stp"],
    defaultExtension: "step",
  },
  IGES: {
    label: "IGES model",
    extensions: ["iges", "igs"],
    defaultExtension: "iges",
  },
  glTF: {
    label: "glTF scene",
    extensions: ["gltf"],
    defaultExtension: "gltf",
  },
};

export function getExportFileInfo(format: ExportFormat): ExportFileInfo {
  return exportFileInfo[format];
}

export function getDefaultExportPath(
  sourcePath: string,
  format: ExportFormat,
): string {
  const fileInfo = getExportFileInfo(format);
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}.${fileInfo.defaultExtension}`);
}
