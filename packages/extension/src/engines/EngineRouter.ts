import { ICadEngine } from '../types';
import { OpenGeometryAdapter } from './OpenGeometryAdapter';
import { FreeCadAdapter } from './FreeCadAdapter';
import { OpenScadAdapter } from './OpenScadAdapter';

/**
 * Routes source extensions to adapter instances and exposes adapter capabilities
 * to runtime callers and the webview.
 */
export class EngineRouter {
  private engines: Map<string, ICadEngine> = new Map();

  /**
   * Creates adapter instances and maps each supported extension to its engine.
   */
  constructor(freecadPath?: string, openscadPath?: string, enableExperimentalOpenGeometry = false) {
    const og = new OpenGeometryAdapter(enableExperimentalOpenGeometry);
    const fc = new FreeCadAdapter(freecadPath);
    const os = new OpenScadAdapter(openscadPath);

    for (const ext of og.supportedExtensions) { this.engines.set(ext, og); }
    for (const ext of fc.supportedExtensions) { this.engines.set(ext, fc); }
    for (const ext of os.supportedExtensions) { this.engines.set(ext, os); }
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
}
