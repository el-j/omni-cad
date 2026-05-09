import * as fs from "fs";
import * as path from "path";
import { ICadEngine } from "../types";
import { OpenGeometryAdapter } from "./OpenGeometryAdapter";
import { FreeCadAdapter } from "./FreeCadAdapter";
import { OpenScadAdapter } from "./OpenScadAdapter";
import { CadQueryAdapter } from "./CadQueryAdapter";
import { Build123dAdapter } from "./Build123dAdapter";

export interface DiscoveredEnginePaths {
  freecadPath?: string;
  openscadPath?: string;
  warnings: string[];
}

interface DiscoveryOptions {
  platform?: NodeJS.Platform;
  env?: NodeJS.ProcessEnv;
  fileExists?: (candidatePath: string) => boolean;
  isExecutable?: (candidatePath: string) => boolean;
}

/**
 * Routes source extensions to adapter instances and exposes adapter capabilities
 * to runtime callers and the webview.
 */
export class EngineRouter {
  private engines: Map<string, ICadEngine> = new Map();

  /**
   * Creates adapter instances and maps each supported extension to its engine.
   */
  constructor(
    freecadPath?: string,
    openscadPath?: string,
    enableExperimentalOpenGeometry = false,
  ) {
    const og = new OpenGeometryAdapter(enableExperimentalOpenGeometry);
    const fc = new FreeCadAdapter(freecadPath);
    const os = new OpenScadAdapter(openscadPath);
    const cq = new CadQueryAdapter();
    const b3d = new Build123dAdapter();

    for (const ext of og.supportedExtensions) {
      this.engines.set(ext, og);
    }
    for (const ext of fc.supportedExtensions) {
      this.engines.set(ext, fc);
    }
    for (const ext of os.supportedExtensions) {
      this.engines.set(ext, os);
    }
    for (const ext of cq.supportedExtensions) {
      this.engines.set(ext, cq);
    }
    for (const ext of b3d.supportedExtensions) {
      this.engines.set(ext, b3d);
    }
  }

  /** Returns the router extension key, including supported compound extensions like `.cq.py`. */
  static getExtensionForFileName(fileName: string): string {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith(".cq.py")) {
      return ".cq.py";
    }
    if (lowerName.endsWith(".b3d.py")) {
      return ".b3d.py";
    }
    return path.extname(lowerName);
  }

  /** Returns the adapter registered for a file extension (case-insensitive). */
  get(extension: string): ICadEngine | undefined {
    return this.engines.get(extension.toLowerCase());
  }

  /** Returns capability metadata for the adapter bound to the extension. */
  getCapabilities(extension: string) {
    return this.get(extension)?.capabilities;
  }

  /** Disposes each unique adapter instance exactly once. */
  dispose(): void {
    const seen = new Set<ICadEngine>();
    for (const engine of this.engines.values()) {
      if (!seen.has(engine)) {
        try {
          engine.dispose();
        } catch {
          // Best-effort disposal across shared engines.
        }
        seen.add(engine);
      }
    }
  }

  /**
   * Returns discovered engine executable paths using platform-specific defaults
   * plus PATH lookup as a fallback.
   */
  static discoverInstalledEngines(
    options: DiscoveryOptions = {},
  ): DiscoveredEnginePaths {
    const platform = options.platform ?? process.platform;
    const env = options.env ?? process.env;
    const fileExists =
      options.fileExists ??
      ((candidatePath: string) => fs.existsSync(candidatePath));
    const isExecutable =
      options.isExecutable ??
      ((candidatePath: string) => EngineRouter.isExecutablePath(candidatePath));
    const warnings: string[] = [];

    const freecadCandidates = EngineRouter.getDefaultCandidates(
      "freecad",
      platform,
    );
    const openscadCandidates = EngineRouter.getDefaultCandidates(
      "openscad",
      platform,
    );

    const freecadPath =
      EngineRouter.findFirstValidPath(
        freecadCandidates,
        fileExists,
        isExecutable,
        warnings,
      ) ??
      EngineRouter.findOnPath(
        ["FreeCADCmd", "freecadcmd", "freecad"],
        platform,
        env,
        fileExists,
        isExecutable,
      );

    const openscadPath =
      EngineRouter.findFirstValidPath(
        openscadCandidates,
        fileExists,
        isExecutable,
        warnings,
      ) ??
      EngineRouter.findOnPath(
        ["openscad"],
        platform,
        env,
        fileExists,
        isExecutable,
      );

    return {
      freecadPath,
      openscadPath,
      warnings,
    };
  }

  /** Returns true when a configured custom path is stale or not executable. */
  static isConfiguredPathStale(candidatePath?: string): boolean {
    if (!candidatePath || !path.isAbsolute(candidatePath)) {
      return false;
    }
    return !EngineRouter.isExecutablePath(candidatePath);
  }

  /** Best-effort executable path probe across macOS/Linux/Windows. */
  static isExecutablePath(candidatePath: string): boolean {
    try {
      if (!fs.existsSync(candidatePath)) {
        return false;
      }
      if (process.platform === "win32") {
        return true;
      }
      fs.accessSync(candidatePath, fs.constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }

  private static findFirstValidPath(
    candidates: string[],
    fileExists: (candidatePath: string) => boolean,
    isExecutable: (candidatePath: string) => boolean,
    warnings: string[],
  ): string | undefined {
    for (const candidatePath of candidates) {
      try {
        if (fileExists(candidatePath) && isExecutable(candidatePath)) {
          return candidatePath;
        }
      } catch {
        warnings.push(`Unable to inspect ${candidatePath}`);
      }
    }
    return undefined;
  }

  private static findOnPath(
    binaryNames: string[],
    platform: NodeJS.Platform,
    env: NodeJS.ProcessEnv,
    fileExists: (candidatePath: string) => boolean,
    isExecutable: (candidatePath: string) => boolean,
  ): string | undefined {
    const pathValue = env.PATH ?? env.Path ?? "";
    if (!pathValue) {
      return undefined;
    }

    const directories = EngineRouter.splitPathEnv(pathValue, platform);
    const executableSuffixes = EngineRouter.getExecutableSuffixes(
      platform,
      env,
    );

    for (const directory of directories) {
      for (const binaryName of binaryNames) {
        for (const suffix of executableSuffixes) {
          const candidatePath = path.join(directory, `${binaryName}${suffix}`);
          if (fileExists(candidatePath) && isExecutable(candidatePath)) {
            return candidatePath;
          }
        }
      }
    }

    return undefined;
  }

  private static splitPathEnv(
    pathValue: string,
    platform: NodeJS.Platform,
  ): string[] {
    if (platform === "win32") {
      return pathValue.split(";").filter(Boolean);
    }
    return pathValue.split(":").filter(Boolean);
  }

  private static getExecutableSuffixes(
    platform: NodeJS.Platform,
    env: NodeJS.ProcessEnv,
  ): string[] {
    if (platform !== "win32") {
      return [""];
    }

    const pathExt = env.PATHEXT ?? ".EXE;.CMD;.BAT;.COM";
    const suffixes = pathExt
      .split(";")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => value.toLowerCase());

    return [""].concat(suffixes);
  }

  private static getDefaultCandidates(
    engine: "freecad" | "openscad",
    platform: NodeJS.Platform,
  ): string[] {
    if (engine === "freecad") {
      if (platform === "darwin") {
        return [
          "/Applications/FreeCAD.app/Contents/Resources/bin/freecadcmd",
          "/Applications/FreeCAD.app/Contents/MacOS/FreeCAD",
        ];
      }
      if (platform === "win32") {
        return [
          "C:\\Program Files\\FreeCAD\\bin\\FreeCADCmd.exe",
          "C:\\Program Files\\FreeCAD 1.0\\bin\\FreeCADCmd.exe",
        ];
      }
      return [
        "/usr/bin/freecadcmd",
        "/usr/local/bin/freecadcmd",
        "/snap/bin/freecad",
      ];
    }

    if (platform === "darwin") {
      return ["/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD"];
    }
    if (platform === "win32") {
      return ["C:\\Program Files\\OpenSCAD\\openscad.exe"];
    }
    return [
      "/usr/bin/openscad",
      "/usr/local/bin/openscad",
      "/snap/bin/openscad",
    ];
  }
}
