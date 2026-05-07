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

export class FreeCadAdapter implements ICadEngine {
  id = 'freecad';
  supportedExtensions = ['.py', '.fcmacro'];
  capabilities = {
    supportedExportFormats: ['STL'] as ExportFormat[],
    supportsBrepMetadata: true,
    renderable: true,
  };
  private freecadPath: string;

  constructor(freecadPath = 'FreeCADCmd') {
    this.freecadPath = this._resolveFreeCadPath(freecadPath);
  }

  async compile(code: string, options?: EngineExecutionOptions): Promise<CompileResponse> {
    const start = Date.now();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omnicad-freecad-'));
    const tmpSource = path.join(tmpDir, 'model.py');
    const sourcePath = options?.sourcePath && fs.existsSync(options.sourcePath)
      ? options.sourcePath
      : tmpSource;
    const exportPath = path.join(tmpDir, 'model.stl');
    try {
      if (sourcePath === tmpSource) {
        fs.writeFileSync(tmpSource, code, 'utf8');
      }
      await this._exportWithFreeCad(sourcePath, code, exportPath);
      const mesh = this._parseStl(exportPath);
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
      throw new Error((!result.success ? result.errors.join('\n') : undefined) ?? 'Failed to compile FreeCAD model');
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
    if (format !== 'STL') {
      throw new Error(`FreeCAD export for ${format} is not implemented yet`);
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omnicad-freecad-export-'));
    const tmpSource = path.join(tmpDir, 'model.py');
    const sourcePath = options?.sourcePath && fs.existsSync(options.sourcePath)
      ? options.sourcePath
      : tmpSource;
    const exportPath = path.join(tmpDir, 'model.stl');

    try {
      if (sourcePath === tmpSource) {
        fs.writeFileSync(tmpSource, code, 'utf8');
      }
      await this._exportWithFreeCad(sourcePath, code, exportPath);
      return fs.readFileSync(exportPath);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  dispose(): void {}

  private _resolveFreeCadPath(configuredPath: string): string {
    if (configuredPath !== 'FreeCADCmd') {
      return configuredPath;
    }

    const candidates = [
      '/Applications/FreeCAD.app/Contents/Resources/bin/freecadcmd',
      '/opt/homebrew/bin/FreeCADCmd',
      '/opt/homebrew/bin/freecadcmd',
      'FreeCADCmd',
      'freecadcmd',
    ];

    return candidates.find((candidate) => candidate.includes('/') ? fs.existsSync(candidate) : true) ?? configuredPath;
  }

  private _exportWithFreeCad(sourcePath: string, code: string, exportPath: string): Promise<void> {
    const runnerPath = path.join(path.dirname(exportPath), 'runner.py');
    fs.writeFileSync(runnerPath, this._buildRunnerScript(sourcePath, code, exportPath), 'utf8');
    return this._runFreeCAD(runnerPath);
  }

  private _buildRunnerScript(sourcePath: string, code: string, exportPath: string): string {
    return [
      'import os',
      'import runpy',
      'import sys',
      'import traceback',
      'import FreeCAD as App',
      'import Mesh',
      '',
      `SOURCE_PATH = r${JSON.stringify(sourcePath)}`,
      `INLINE_CODE = ${JSON.stringify(code)}`,
      `EXPORT_PATH = r${JSON.stringify(exportPath)}`,
      '',
      'def add_search_paths(source_path):',
      '    current = os.path.dirname(os.path.abspath(source_path))',
      '    visited = set()',
      '    while current and current not in visited:',
      '        if current not in sys.path:',
      '            sys.path.insert(0, current)',
      '        visited.add(current)',
      '        parent = os.path.dirname(current)',
      '        if parent == current:',
      '            break',
      '        current = parent',
      '',
      'def execute_source(source_path, inline_code):',
      '    if os.path.exists(source_path):',
      '        add_search_paths(source_path)',
      '        runpy.run_path(source_path, run_name="__main__")',
      '        return',
      '    namespace = {"__file__": source_path, "__name__": "__main__"}',
      '    exec(compile(inline_code, source_path, "exec"), namespace, namespace)',
      '',
      'try:',
      '    execute_source(SOURCE_PATH, INLINE_CODE)',
      '    docs = list(App.listDocuments().values())',
      '    for doc in docs:',
      '        doc.recompute()',
      '    exportable = []',
      '    for doc in docs:',
      '        for obj in doc.Objects:',
      '            shape = getattr(obj, "Shape", None)',
      '            if shape is not None and not shape.isNull():',
      '                exportable.append(obj)',
      '    if not exportable:',
      '        raise RuntimeError(f"No exportable FreeCAD shapes found after running {SOURCE_PATH}")',
      '    Mesh.export(exportable, EXPORT_PATH)',
      '    print(f"OMNICAD_EXPORT_OK:{EXPORT_PATH}")',
      'except Exception:',
      '    traceback.print_exc()',
      '    sys.exit(1)',
      '',
    ].join('\n');
  }

  private _runFreeCAD(scriptPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = cp.spawn(this.freecadPath, [scriptPath], {
        timeout: 120000,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
        },
      });
      let stderr = '';
      let stdout = '';
      proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
      proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
      proc.on('close', (code: number | null) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FreeCAD exited ${code}: ${stderr || stdout}`));
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
      throw new Error('FreeCAD export did not contain any STL triangles');
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

    if (!Number.isFinite(bounds.xMin)) {
      throw new Error('FreeCAD mesh bounds could not be computed from the exported geometry');
    }

    return bounds;
  }
}
