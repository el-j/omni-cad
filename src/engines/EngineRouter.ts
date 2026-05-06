import { ICadEngine } from '../types';
import { OpenGeometryAdapter } from './OpenGeometryAdapter';
import { FreeCadAdapter } from './FreeCadAdapter';
import { OpenScadAdapter } from './OpenScadAdapter';

export class EngineRouter {
  private engines: Map<string, ICadEngine> = new Map();

  constructor(freecadPath?: string, openscadPath?: string) {
    const og = new OpenGeometryAdapter();
    const fc = new FreeCadAdapter(freecadPath);
    const os = new OpenScadAdapter(openscadPath);

    for (const ext of og.supportedExtensions) { this.engines.set(ext, og); }
    for (const ext of fc.supportedExtensions) { this.engines.set(ext, fc); }
    for (const ext of os.supportedExtensions) { this.engines.set(ext, os); }
  }

  get(extension: string): ICadEngine | undefined {
    return this.engines.get(extension.toLowerCase());
  }

  dispose(): void {
    const seen = new Set<ICadEngine>();
    for (const engine of this.engines.values()) {
      if (!seen.has(engine)) {
        engine.dispose();
        seen.add(engine);
      }
    }
  }
}
