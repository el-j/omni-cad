import * as cp from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  BrepMetadata,
  CompileResponse,
  EngineExecutionOptions,
  ExportFormat,
  ICadEngine,
  MeshPayload,
} from "../types";

/**
 * Shared base adapter for Python BREP-family engines.
 *
 * Subclasses provide a Python runner script that exports STL for compile/export.
 */
export abstract class PythonBrepAdapter implements ICadEngine {
  abstract id: string;
  abstract supportedExtensions: string[];
  abstract capabilities: {
    supportedExportFormats: ExportFormat[];
    supportsBrepMetadata: boolean;
    renderable: boolean;
    experimental?: boolean;
  };

  protected pythonExecutable = "python3";

  async compile(
    code: string,
    options?: EngineExecutionOptions,
  ): Promise<CompileResponse> {
    const start = Date.now();
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), `omnicad-${this.id}-`),
    );
    const tmpSource = path.join(tmpDir, `model${this.supportedExtensions[0]}`);
    const sourcePath =
      options?.sourcePath && fs.existsSync(options.sourcePath)
        ? options.sourcePath
        : tmpSource;
    const exportPath = path.join(tmpDir, "model.stl");

    try {
      if (sourcePath === tmpSource) {
        fs.writeFileSync(tmpSource, code, "utf8");
      }

      await this.exportWithPython(sourcePath, code, exportPath);
      const mesh = this.parseStl(exportPath);
      return {
        success: true,
        meshes: [mesh],
        computeTimeMs: Date.now() - start,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        meshes: [],
        errors: [message],
        computeTimeMs: Date.now() - start,
      };
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  async getBrepMetadata(
    code: string,
    options?: EngineExecutionOptions,
  ): Promise<BrepMetadata> {
    const result = await this.compile(code, options);
    if (!result.success || !result.meshes?.length) {
      throw new Error(
        (!result.success ? result.errors.join("\n") : undefined) ??
          `Failed to compile ${this.id} model`,
      );
    }

    const bounds = this.calculateBounds(result.meshes[0].vertices);
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
    options?: EngineExecutionOptions,
  ): Promise<Buffer> {
    if (!this.capabilities.supportedExportFormats.includes(format)) {
      throw new Error(`${this.id} export for ${format} is not implemented yet`);
    }

    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), `omnicad-${this.id}-export-`),
    );
    const tmpSource = path.join(tmpDir, `model${this.supportedExtensions[0]}`);
    const sourcePath =
      options?.sourcePath && fs.existsSync(options.sourcePath)
        ? options.sourcePath
        : tmpSource;
    const exportPath = path.join(tmpDir, "model.stl");

    try {
      if (sourcePath === tmpSource) {
        fs.writeFileSync(tmpSource, code, "utf8");
      }

      if (format !== "STL") {
        throw new Error(
          `${this.id} export for ${format} is not implemented yet`,
        );
      }

      await this.exportWithPython(sourcePath, code, exportPath);
      return fs.readFileSync(exportPath);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  dispose(): void {}

  protected abstract buildRunnerScript(
    sourcePath: string,
    code: string,
    exportPath: string,
  ): string;

  protected async exportWithPython(
    sourcePath: string,
    code: string,
    exportPath: string,
  ): Promise<void> {
    const runnerPath = path.join(path.dirname(exportPath), "runner.py");
    fs.writeFileSync(
      runnerPath,
      this.buildRunnerScript(sourcePath, code, exportPath),
      "utf8",
    );
    await this.runPython(runnerPath);
  }

  protected runPython(scriptPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = cp.spawn(this.pythonExecutable, [scriptPath], {
        timeout: 120000,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
        },
      });

      let stderr = "";
      let stdout = "";
      proc.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      proc.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      proc.on("close", (code: number | null) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(
          new Error(
            `${this.id} python runner exited ${code}: ${stderr || stdout}`,
          ),
        );
      });

      proc.on("error", (error) => {
        reject(
          new Error(
            `Failed to execute ${this.pythonExecutable} for ${this.id}: ${error.message}`,
          ),
        );
      });
    });
  }

  protected parseStl(filePath: string): MeshPayload {
    const buffer = fs.readFileSync(filePath);
    const binaryMesh = this.parseBinaryStl(buffer);
    if (binaryMesh) {
      return binaryMesh;
    }
    return this.parseAsciiStl(buffer.toString("utf8"));
  }

  private parseBinaryStl(buffer: Buffer): MeshPayload | null {
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
          buffer.readFloatLE(vertexOffset + 8),
        );
        normals.push(...normal);
        indices.push(index * 3 + vertexIndex);
      }
    }

    return { vertices, normals, indices };
  }

  private parseAsciiStl(text: string): MeshPayload {
    const facetRegex =
      /facet\s+normal\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+outer\s+loop\s+vertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+vertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+vertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+endloop\s+endfacet/gi;
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
      throw new Error(`${this.id} export did not contain any STL triangles`);
    }

    return { vertices, normals, indices };
  }

  protected calculateBounds(vertices: number[]) {
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

    if (
      !Number.isFinite(bounds.xMin) ||
      !Number.isFinite(bounds.xMax) ||
      !Number.isFinite(bounds.yMin) ||
      !Number.isFinite(bounds.yMax) ||
      !Number.isFinite(bounds.zMin) ||
      !Number.isFinite(bounds.zMax)
    ) {
      throw new Error(
        `${this.id} mesh bounds could not be computed from the exported geometry`,
      );
    }

    return bounds;
  }
}
