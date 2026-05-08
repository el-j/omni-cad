import {
  ICadEngine,
  CompileResponse,
  BrepMetadata,
  EngineExecutionOptions,
  ExportFormat,
} from "../types";

type UnsupportedOpenGeometryExportError = Error & {
  code: "OMNICAD_UNSUPPORTED_EXPORT";
  adapter: "opengeometry";
  format: string;
  hint?: string;
};

/**
 * Experimental TypeScript/JavaScript adapter used for preview-only mesh compilation.
 */
export class OpenGeometryAdapter implements ICadEngine {
  id = "opengeometry";
  supportedExtensions = [".ts", ".js"];
  capabilities;

  constructor(private readonly experimentalEnabled = false) {
    this.capabilities = {
      supportedExportFormats: [],
      supportsBrepMetadata: false,
      renderable: experimentalEnabled,
      experimental: true,
    };
  }

  /** Compiles supported OpenGeometry model code into renderable mesh payloads. */
  async compile(
    code: string,
    _options?: EngineExecutionOptions,
  ): Promise<CompileResponse> {
    const start = Date.now();
    if (!this.experimentalEnabled) {
      return {
        success: false,
        meshes: [],
        errors: [
          "OpenGeometry is currently experimental and disabled by default.",
        ],
        computeTimeMs: Date.now() - start,
      };
    }
    try {
      // 1. Structural Evaluator: We evaluate the code in a sandbox
      const ctx = {
        box: (w: number, h: number, d: number) => ({
          type: "box",
          args: [w, h, d],
        }),
        cylinder: (r: number, h: number) => ({
          type: "cylinder",
          args: [r, h],
        }),
        union: (...items: any[]) => ({ type: "union", children: items }),
        rotate: (target: any, angles: [number, number, number]) => ({
          type: "rotate",
          target,
          angles,
        }),
        translate: (target: any, vec: [number, number, number]) => ({
          type: "translate",
          target,
          vec,
        }),
      };

      const modelBodyMatch = code.match(
        /export const model = \(\) => \{([\s\S]*)\};/,
      );
      if (!modelBodyMatch) {
        throw new Error(
          "Could not find export const model in the provided code.",
        );
      }

      const evaluator = new Function(
        ...Object.keys(ctx),
        `${modelBodyMatch[1]}`,
      );
      const root = evaluator(...Object.values(ctx));

      // 2. Mesh Generation Bridge
      const generatedMeshes = this._flattenAndGenerate(root);

      return {
        success: true,
        meshes: generatedMeshes,
        computeTimeMs: Date.now() - start,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        meshes: [],
        errors: [msg],
        computeTimeMs: Date.now() - start,
      };
    }
  }

  /**
   * Computes metadata from generated meshes; intended for preview analytics only.
   */
  async getBrepMetadata(
    _code: string,
    _options?: EngineExecutionOptions,
  ): Promise<BrepMetadata> {
    const result = await this.compile(_code, _options);
    if (!result.success || !result.meshes.length) {
      throw new Error(
        (!result.success ? result.errors.join("\n") : undefined) ??
          "OpenGeometry metadata requires a successful compile with generated meshes.",
      );
    }

    const bounds = this._calculateBounds(result.meshes[0].vertices);
    const sizeX = bounds.xMax - bounds.xMin;
    const sizeY = bounds.yMax - bounds.yMin;
    const sizeZ = bounds.zMax - bounds.zMin;
    return {
      boundingBox: bounds,
      volume: Math.max(0, sizeX * sizeY * sizeZ),
      topology: {
        faces: result.meshes[0].indices.length / 3,
        edges: 0,
        vertices: result.meshes[0].vertices.length / 3,
      },
    };
  }

  /**
   * OpenGeometry export is intentionally unavailable until a production export backend exists.
   */
  async export(
    _code: string,
    _format: ExportFormat,
    _options?: EngineExecutionOptions,
  ): Promise<Buffer> {
    const err = new Error(
      `OpenGeometry does not currently support ${_format} export.`,
    ) as UnsupportedOpenGeometryExportError;
    err.code = "OMNICAD_UNSUPPORTED_EXPORT";
    err.adapter = "opengeometry";
    err.format = _format;
    err.hint = "Use FreeCAD for STEP/IGES/STL or OpenSCAD for STL export.";
    throw err;
  }

  dispose(): void {}

  private _flattenAndGenerate(
    node: any,
    matrix: number[] = this._identity(),
  ): any[] {
    if (!node) return [];

    if (node.type === "box") {
      return [
        this._generateBox(node.args[0], node.args[1], node.args[2], matrix),
      ];
    }
    if (node.type === "cylinder") {
      return [this._generateCylinder(node.args[0], node.args[1], matrix)];
    }
    if (node.type === "union") {
      return node.children.flatMap((c: any) =>
        this._flattenAndGenerate(c, matrix),
      );
    }
    if (node.type === "translate") {
      const transMatrix = this._multiply(
        matrix,
        this._translationMatrix(node.vec),
      );
      return this._flattenAndGenerate(node.target, transMatrix);
    }
    if (node.type === "rotate") {
      const rotMatrix = this._multiply(
        matrix,
        this._rotationMatrix(node.angles),
      );
      return this._flattenAndGenerate(node.target, rotMatrix);
    }
    return [];
  }

  private _identity() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }

  private _translationMatrix([x, y, z]: [number, number, number]) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  }

  private _rotationMatrix([ax, ay, az]: [number, number, number]) {
    const rx = (ax * Math.PI) / 180;
    const ry = (ay * Math.PI) / 180;
    const rz = (az * Math.PI) / 180;

    // Rotation X
    const mx = [
      1,
      0,
      0,
      0,
      0,
      Math.cos(rx),
      Math.sin(rx),
      0,
      0,
      -Math.sin(rx),
      Math.cos(rx),
      0,
      0,
      0,
      0,
      1,
    ];
    // Rotation Y
    const my = [
      Math.cos(ry),
      0,
      -Math.sin(ry),
      0,
      0,
      1,
      0,
      0,
      Math.sin(ry),
      0,
      Math.cos(ry),
      0,
      0,
      0,
      0,
      1,
    ];
    // Rotation Z
    const mz = [
      Math.cos(rz),
      Math.sin(rz),
      0,
      0,
      -Math.sin(rz),
      Math.cos(rz),
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ];

    return this._multiply(this._multiply(mx, my), mz);
  }

  private _multiply(a: number[], b: number[]) {
    const out = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          out[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
        }
      }
    }
    return out;
  }

  private _generateBox(w: number, h: number, d: number, matrix: number[]) {
    const hw = w / 2,
      hh = h / 2,
      hd = d / 2;
    const vertices = [
      -hw,
      -hh,
      -hd,
      hw,
      -hh,
      -hd,
      hw,
      hh,
      -hd,
      -hw,
      hh,
      -hd,
      -hw,
      -hh,
      hd,
      hw,
      -hh,
      hd,
      hw,
      hh,
      hd,
      -hw,
      hh,
      hd,
    ];
    const indices = [
      0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, 0, 1, 5, 5, 4, 0, 2, 3, 7, 7, 6, 2, 1,
      2, 6, 6, 5, 1, 0, 3, 7, 7, 4, 0,
    ];
    return {
      vertices: this._applyMatrix(vertices, matrix),
      normals: [],
      indices,
    };
  }

  private _generateCylinder(r: number, h: number, matrix: number[]) {
    const vertices: number[] = [];
    const indices: number[] = [];
    const segments = 12;
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const x = Math.cos(a) * r,
        y = Math.sin(a) * r;
      vertices.push(x, y, -h / 2, x, y, h / 2);
      const next = ((i + 1) % segments) * 2;
      indices.push(i * 2, i * 2 + 1, next + 1, next + 1, next, i * 2);
    }
    return {
      vertices: this._applyMatrix(vertices, matrix),
      normals: [],
      indices,
    };
  }

  private _applyMatrix(verts: number[], m: number[]) {
    const out = [];
    for (let i = 0; i < verts.length; i += 3) {
      const x = verts[i],
        y = verts[i + 1],
        z = verts[i + 2];
      out.push(x * m[0] + y * m[4] + z * m[8] + m[12]);
      out.push(x * m[1] + y * m[5] + z * m[9] + m[13]);
      out.push(x * m[2] + y * m[6] + z * m[10] + m[14]);
    }
    return out;
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

    for (let i = 0; i < vertices.length; i += 3) {
      bounds.xMin = Math.min(bounds.xMin, vertices[i]);
      bounds.xMax = Math.max(bounds.xMax, vertices[i]);
      bounds.yMin = Math.min(bounds.yMin, vertices[i + 1]);
      bounds.yMax = Math.max(bounds.yMax, vertices[i + 1]);
      bounds.zMin = Math.min(bounds.zMin, vertices[i + 2]);
      bounds.zMax = Math.max(bounds.zMax, vertices[i + 2]);
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
        "OpenGeometry mesh bounds could not be computed from generated geometry.",
      );
    }

    return bounds;
  }
}
