import {
  getDefaultExportPath,
  getExportFileInfo,
} from "../export/exportFormats";
import { EngineExecutionOptions, ExportFormat, ICadEngine } from "../types";
import { EngineRouter } from "../engines/EngineRouter";

type EditorDocumentLike = {
  fileName: string;
  isUntitled: boolean;
  getText(): string;
};

type TextEditorLike = {
  document: EditorDocumentLike;
};

type SaveDialogShape = {
  defaultPath?: string;
  saveLabel: string;
  filters: Record<string, string[]>;
};

type ResolvedExportRequest =
  | { ok: false; message: string }
  | {
      ok: true;
      engine: ICadEngine;
      code: string;
      sourcePath: string;
      saveDialog: SaveDialogShape;
    };

const validFormats: ExportFormat[] = ["STEP", "STL", "IGES", "glTF"];

/**
 * Builds save dialog defaults for an export request.
 */
export function buildExportSaveDialog(
  format: ExportFormat,
  document: EditorDocumentLike,
): SaveDialogShape {
  const fileInfo = getExportFileInfo(format);
  return {
    defaultPath: document.isUntitled
      ? undefined
      : getDefaultExportPath(document.fileName, format),
    saveLabel: `Export ${format}`,
    filters: { [fileInfo.label]: fileInfo.extensions },
  };
}

/**
 * Resolves the active editor context and validates export capability before opening a save dialog.
 */
export function resolveExportRequest(
  format: ExportFormat,
  editor: TextEditorLike | undefined,
  getEngine: (ext: string) => ICadEngine | undefined,
): ResolvedExportRequest {
  if (!validFormats.includes(format)) {
    return { ok: false, message: `Unsupported export format ${format}` };
  }
  if (!editor) {
    return { ok: false, message: "No active editor" };
  }

  const ext = EngineRouter.getExtensionForFileName(editor.document.fileName);
  const engine = getEngine(ext);
  if (!engine) {
    return { ok: false, message: `No engine for extension ${ext}` };
  }
  if (!engine.capabilities.supportedExportFormats.includes(format)) {
    return {
      ok: false,
      message: `${engine.id} does not support ${format} export`,
    };
  }

  return {
    ok: true,
    engine,
    code: editor.document.getText(),
    sourcePath: editor.document.fileName,
    saveDialog: buildExportSaveDialog(format, editor.document),
  };
}

/**
 * Executes engine export and writes bytes to the chosen destination path.
 */
export async function exportToFile(
  engine: ICadEngine,
  code: string,
  format: ExportFormat,
  sourcePath: string,
  destinationPath: string,
  writeFile: (targetPath: string, data: Buffer) => void,
  options?: EngineExecutionOptions,
): Promise<void> {
  const mergedOptions: EngineExecutionOptions = {
    sourcePath,
    ...options,
  };
  const buf = await engine.export(code, format, mergedOptions);
  writeFile(destinationPath, buf);
}
