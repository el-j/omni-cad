import * as cp from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { ICadEngine, CompileResponse, BrepMetadata } from '../types';

export class FreeCadAdapter implements ICadEngine {
  id = 'freecad';
  supportedExtensions = ['.py', '.fcmacro'];
  private freecadPath: string;

  constructor(freecadPath = 'FreeCADCmd') {
    this.freecadPath = freecadPath;
  }

  async compile(code: string): Promise<CompileResponse> {
    const start = Date.now();
    const tmpFile = path.join(os.tmpdir(), `omnicad_${Date.now()}.py`);
    try {
      fs.writeFileSync(tmpFile, code, 'utf8');
      await this._runFreeCAD(tmpFile);
      return { success: true, meshes: [], computeTimeMs: Date.now() - start };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, errors: [msg], computeTimeMs: Date.now() - start };
    } finally {
      try { fs.unlinkSync(tmpFile); } catch { /* ignore cleanup errors */ }
    }
  }

  async getBrepMetadata(code: string): Promise<BrepMetadata> {
    await this.compile(code);
    return {
      boundingBox: { xMin: 0, xMax: 1, yMin: 0, yMax: 1, zMin: 0, zMax: 1 },
      volume: 1,
      topology: { faces: 6, edges: 12, vertices: 8 },
    };
  }

  async export(code: string, format: 'STEP' | 'STL' | 'IGES' | 'glTF'): Promise<Buffer> {
    await this.compile(code);
    return Buffer.from(`FREECAD_EXPORT_${format}`);
  }

  dispose(): void {}

  private _runFreeCAD(scriptPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = cp.spawn(this.freecadPath, [scriptPath], { timeout: 30000 });
      let stderr = '';
      proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FreeCAD exited ${code}: ${stderr}`));
        }
      });
      proc.on('error', reject);
    });
  }
}
