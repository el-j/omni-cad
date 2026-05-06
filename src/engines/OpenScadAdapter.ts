import * as cp from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { ICadEngine, CompileResponse, BrepMetadata } from '../types';

export class OpenScadAdapter implements ICadEngine {
  id = 'openscad';
  supportedExtensions = ['.scad'];
  private openscadPath: string;

  constructor(openscadPath = 'openscad') {
    this.openscadPath = openscadPath;
  }

  async compile(code: string): Promise<CompileResponse> {
    const start = Date.now();
    const timestamp = start;
    const tmpDir = os.tmpdir();
    const tmpInput = path.join(tmpDir, `omnicad_${timestamp}.scad`);
    const tmpOutput = path.join(tmpDir, `omnicad_${timestamp}.stl`);
    try {
      fs.writeFileSync(tmpInput, code, 'utf8');
      await this._runOpenScad(tmpInput, tmpOutput);
      return { success: true, meshes: [], computeTimeMs: Date.now() - start };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, errors: [msg], computeTimeMs: Date.now() - start };
    } finally {
      try { fs.unlinkSync(tmpInput); } catch { /* ignore */ }
      try { fs.unlinkSync(tmpOutput); } catch { /* ignore */ }
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
    return Buffer.from(`OPENSCAD_EXPORT_${format}`);
  }

  dispose(): void {}

  private _runOpenScad(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = cp.spawn(this.openscadPath, ['-o', outputPath, inputPath], {
        timeout: 60000,
      });
      let stderr = '';
      proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`openscad exited ${code}: ${stderr}`));
        }
      });
      proc.on('error', reject);
    });
  }
}
