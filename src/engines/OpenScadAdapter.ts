import * as cp from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {
  ICadEngine,
  CompileResponse,
  BrepMetadata,
  EngineExecutionOptions,
  MeshPayload,
  ExportFormat,
} from '../types';

export class OpenScadAdapter implements ICadEngine {
  id = 'openscad';
  supportedExtensions = ['.scad'];
  capabilities = {
    supportedExportFormats: ['STL'] as ExportFormat[],
    supportsBrepMetadata: true,
    renderable: true,
  };
  private openscadPath: string;

  constructor(openscadPath = 'openscad') {
    this.openscadPath = openscadPath;
  }

  async compile(code: string, _options?: EngineExecutionOptions): Promise<CompileResponse> {
    const start = Date.now();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omnicad-openscad-'));
    const tmpInput = path.join(tmpDir, 'model.scad');
    const tmpOutput = path.join(tmpDir, 'model.stl');
    try {
      fs.writeFileSync(tmpInput, code, 'utf8');
      await this._runOpenScad(tmpInput, tmpOutput);
      const mesh = this._parseStl(tmpOutput);
      return { success: true, meshes: [mesh], computeTimeMs: Date.now() - start };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, meshes: [], errors: [msg], computeTimeMs: Date.now() - start };
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  async getBrepMetadata(code: string, options?: EngineExecutionOptions): Promise<BrepMetadata> {
    const result = await this.compile(code, options);
    if (!result.success || !result.meshes?.length) {
      throw new Error((!result.success ? result.errors.join('\n') : undefined) ?? 'Failed to compile OpenSCAD model');
    }
    const bounds = this._calculateBounds(result.meshes[0].vertices);
    return {
      boundingBox: bounds,
      volume: 0,
      topology: {
        faces: result.meshes[0].indices.length / 3,
        edges: 0,
        vertices: result.meshes[0].vertices.length / 3,
      },
    };
  }

  async export(
    code: string,
    format: ExportFormat,
    options?: EngineExecutionOptions
  ): Promise<Buffer> {
    void options;
    if (format !== 'STL') {
      throw new Error(`OpenSCAD export for ${format} is not implemented yet`);
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omnicad-openscad-export-'));
    const tmpInput = path.join(tmpDir, 'model.scad');
    const tmpOutput = path.join(tmpDir, 'model.stl');
    try {
      fs.writeFileSync(tmpInput, code, 'utf8');
      await this._runOpenScad(tmpInput, tmpOutput);
      return fs.readFileSync(tmpOutput);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  dispose(): void {}

  private _runOpenScad(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = cp.spawn(this.openscadPath, ['-o', outputPath, inputPath], {
        timeout: 60000,
      });
      let stderr = '';
      let stdout = '';
      proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
      proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
      proc.on('close', (code: number | null) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`openscad exited ${code}: ${stderr || stdout}`));
        }
      });
      proc.on('error', reject);
    });
  }

  private _parseStl(filePath: string): MeshPayload {
    const buffer = fs.readFileSync(filePath);
    const binaryMesh = this._parseBinaryStl(buffer);
    if (binaryMesh) {
      return binaryMesh;
    }
    return this._parseAsciiStl(buffer.toString('utf8'));
  }

  private _parseBinaryStl(buffer: Buffer): MeshPayload | null {
    if (buffer.length < 84) {
      return null;
    }

    const triangleCount = buffer.readUInt32LE(80);
    if (84 + triangleCount * 50 !== buffer.length) {
      return null;
    }

    const vertices: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (let index = 0; index < triangleCount; index++) {
      const offset = 84 + index * 50;
      const normal = [
        buffer.readFloatLE(offset),
        buffer.readFloatLE(offset + 4),
        buffer.readFloatLE(offset + 8),
      ];
      for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
        const vertexOffset = offset + 12 + vertexIndex * 12;
        vertices.push(
          buffer.readFloatLE(vertexOffset),
          buffer.readFloatLE(vertexOffset + 4),
          buffer.readFloatLE(vertexOffset + 8)
        );
        normals.push(...normal);
        indices.push(index * 3 + vertexIndex);
      }
    }

    return { vertices, normals, indices };
  }

  private _parseAsciiStl(text: string): MeshPayload {
    const facetRegex = /facet\s+normal\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+outer\s+loop\s+vertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+vertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+vertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+endloop\s+endfacet/gi;
    const vertices: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    let triangleIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = facetRegex.exec(text)) !== null) {
      const normal = [Number(match[1]), Number(match[2]), Number(match[3])];
      const coords = match.slice(4).map(Number);
      for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++) {
        const base = vertexIndex * 3;
        vertices.push(coords[base], coords[base + 1], coords[base + 2]);
        normals.push(...normal);
        indices.push(triangleIndex * 3 + vertexIndex);
      }
      triangleIndex += 1;
    }

    if (!indices.length) {
      throw new Error('OpenSCAD export did not contain any STL triangles');
    }

    return { vertices, normals, indices };
  }

  private _calculateBounds(vertices: number[]) {
    const bounds = {
      xMin: Infinity,
      xMax: -Infinity,
      yMin: Infinity,
      yMax: -Infinity,
      zMin: Infinity,
      zMax: -Infinity,
    };

    for (let index = 0; index < vertices.length; index += 3) {
      bounds.xMin = Math.min(bounds.xMin, vertices[index]);
      bounds.xMax = Math.max(bounds.xMax, vertices[index]);
      bounds.yMin = Math.min(bounds.yMin, vertices[index + 1]);
      bounds.yMax = Math.max(bounds.yMax, vertices[index + 1]);
      bounds.zMin = Math.min(bounds.zMin, vertices[index + 2]);
      bounds.zMax = Math.max(bounds.zMax, vertices[index + 2]);
    }

    return bounds;
  }
}
