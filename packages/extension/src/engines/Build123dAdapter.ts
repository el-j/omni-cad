import { ExportFormat } from "../types";
import { PythonBrepAdapter } from "./PythonBrepAdapter";

/**
 * build123d adapter for `.b3d.py` workflows.
 *
 * This first slice supports STL only to validate runtime viability.
 */
export class Build123dAdapter extends PythonBrepAdapter {
  id = "build123d";
  supportedExtensions = [".b3d.py"];
  capabilities = {
    supportedExportFormats: ["STL"] as ExportFormat[],
    supportsBrepMetadata: true,
    renderable: true,
  };

  protected buildRunnerScript(
    sourcePath: string,
    code: string,
    exportPath: string,
  ): string {
    return [
      "import os",
      "import runpy",
      "import sys",
      "import traceback",
      "",
      `SOURCE_PATH = r${JSON.stringify(sourcePath)}`,
      `INLINE_CODE = ${JSON.stringify(code)}`,
      `EXPORT_PATH = r${JSON.stringify(exportPath)}`,
      "",
      "def load_namespace(source_path, inline_code):",
      "    if os.path.exists(source_path):",
      '        return runpy.run_path(source_path, run_name="__main__")',
      '    ns = {"__file__": source_path, "__name__": "__main__"}',
      '    exec(compile(inline_code, source_path, "exec"), ns, ns)',
      "    return ns",
      "",
      "def resolve_model(ns):",
      '    if "result" in ns and ns["result"] is not None:',
      '        return ns["result"]',
      '    if "model" in ns and ns["model"] is not None:',
      '        model = ns["model"]',
      "        return model() if callable(model) else model",
      '    if "build" in ns and callable(ns["build"]):',
      '        return ns["build"]()',
      '    raise RuntimeError("build123d script must define result, model, or build()")',
      "",
      "if sys.version_info < (3, 10):",
      '    raise RuntimeError("build123d requires Python 3.10+ for OmniCAD integration")',
      "",
      "try:",
      "    from build123d import export_stl",
      "except Exception as exc:",
      "    raise RuntimeError(",
      '        "build123d runtime not available. Install with: python3 -m pip install build123d"',
      "    ) from exc",
      "",
      "try:",
      "    namespace = load_namespace(SOURCE_PATH, INLINE_CODE)",
      "    model = resolve_model(namespace)",
      "    export_stl(model, EXPORT_PATH)",
      '    print(f"OMNICAD_EXPORT_OK:{EXPORT_PATH}")',
      "except Exception:",
      "    traceback.print_exc()",
      "    sys.exit(1)",
      "",
    ].join("\n");
  }
}
