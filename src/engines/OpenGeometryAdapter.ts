import { ICadEngine, CompileResponse, BrepMetadata } from '../types';

export class OpenGeometryAdapter implements ICadEngine {
  id = 'opengeometry';
  supportedExtensions = ['.ts', '.js'];

  async compile(code: string): Promise<CompileResponse> {
    const start = Date.now();
    try {
      // Stub: In production this would run opengeometry_bg.wasm
      void code;
      const mesh = this._generatePlaceholderMesh();
      return { success: true, meshes: [mesh], computeTimeMs: Date.now() - start };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, errors: [msg], computeTimeMs: Date.now() - start };
    }
  }

  async getBrepMetadata(_code: string): Promise<BrepMetadata> {
    return {
      boundingBox: { xMin: -1, xMax: 1, yMin: -1, yMax: 1, zMin: -1, zMax: 1 },
      volume: 8,
      topology: { faces: 6, edges: 12, vertices: 8 },
    };
  }

  async export(_code: string, _format: 'STEP' | 'STL' | 'IGES' | 'glTF'): Promise<Buffer> {
    return Buffer.from('STUB EXPORT');
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
