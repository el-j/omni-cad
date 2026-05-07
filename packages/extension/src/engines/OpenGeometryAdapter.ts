import {
  ICadEngine,
  CompileResponse,
  BrepMetadata,
  EngineExecutionOptions,
  ExportFormat,
} from '../types';

export class OpenGeometryAdapter implements ICadEngine {
  id = 'opengeometry';
  supportedExtensions = ['.ts', '.js'];
  capabilities;

  constructor(private readonly experimentalEnabled = false) {
    this.capabilities = {
      supportedExportFormats: [],
      supportsBrepMetadata: false,
      renderable: experimentalEnabled,
      experimental: true,
    };
  }

  async compile(code: string, _options?: EngineExecutionOptions): Promise<CompileResponse> {
    const start = Date.now();
    if (!this.experimentalEnabled) {
      return {
        success: false,
        meshes: [],
        errors: [
          'OpenGeometry is currently experimental and disabled by default because a real runtime is not implemented yet.',
        ],
        computeTimeMs: Date.now() - start,
      };
    }
    try {
      // Experimental placeholder until a real runtime is integrated.
      void code;
      const mesh = this._generatePlaceholderMesh();
      return {
        success: true,
        meshes: [mesh],
        warnings: ['OpenGeometry is running in experimental placeholder mode.'],
        computeTimeMs: Date.now() - start,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, meshes: [], errors: [msg], computeTimeMs: Date.now() - start };
    }
  }

  async getBrepMetadata(_code: string, _options?: EngineExecutionOptions): Promise<BrepMetadata> {
    if (!this.experimentalEnabled) {
      throw new Error('OpenGeometry metadata is unavailable while the experimental runtime is disabled.');
    }
    return {
      boundingBox: { xMin: -1, xMax: 1, yMin: -1, yMax: 1, zMin: -1, zMax: 1 },
      volume: 8,
      topology: { faces: 6, edges: 12, vertices: 8 },
    };
  }

  async export(
    _code: string,
    _format: ExportFormat,
    _options?: EngineExecutionOptions
  ): Promise<Buffer> {
    throw new Error('OpenGeometry export is unavailable until the real runtime is implemented.');
  }

  dispose(): void {}

  private _generatePlaceholderMesh() {
    // Unit cube vertices, normals, indices
    const vertices = [
      -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
      -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
    ];
    const normals = [
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    ];
    const indices = [
      0, 1, 2, 2, 3, 0,
      4, 5, 6, 6, 7, 4,
      0, 1, 5, 5, 4, 0,
      2, 3, 7, 7, 6, 2,
      1, 2, 6, 6, 5, 1,
      0, 3, 7, 7, 4, 0,
    ];
    return { vertices, normals, indices };
  }
}
