/**
 * Triangulated mesh payload exchanged between adapters, extension host, and webview renderer.
 */
export interface MeshPayload {
  vertices: number[];
  normals: number[];
  indices: number[];
  colors?: number[];
}

/**
 * Export formats currently modeled by OmniCAD contracts.
 */
export type ExportFormat = 'STEP' | 'STL' | 'IGES' | 'glTF';

/**
 * Adapter capability descriptor used for routing, UI gating, and MCP validation.
 */
export interface EngineCapabilities {
  supportedExportFormats: ExportFormat[];
  supportsBrepMetadata: boolean;
  renderable: boolean;
  experimental?: boolean;
}

/**
 * Shared execution options passed to adapter operations.
 */
export interface EngineExecutionOptions {
  sourcePath?: string;
}

/**
 * Compile contract returned by CAD adapters.
 */
export type CompileResponse =
  | {
    success: true;
    meshes: MeshPayload[];
    computeTimeMs: number;
    warnings?: string[];
  }
  | {
    success: false;
    meshes: MeshPayload[];
    computeTimeMs: number;
    errors: string[];
    warnings?: string[];
  };

/**
 * Geometric metadata for measurement or metadata-oriented MCP calls.
 */
export interface BrepMetadata {
  boundingBox: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    zMin: number;
    zMax: number;
  };
  volume: number;
  topology: {
    faces: number;
    edges: number;
    vertices: number;
  };
}

/**
 * Unified adapter contract every engine implementation must satisfy.
 */
export interface ICadEngine {
  id: string;
  capabilities: EngineCapabilities;
  supportedExtensions: string[];
  compile(code: string, options?: EngineExecutionOptions): Promise<CompileResponse>;
  getBrepMetadata(code: string, options?: EngineExecutionOptions): Promise<BrepMetadata>;
  export(code: string, format: ExportFormat, options?: EngineExecutionOptions): Promise<Buffer>;
  dispose(): void;
}

/**
 * Message bus contract from extension host to webview UI.
 */
export type ExtensionToWebviewMessage =
  | { type: 'compiling' }
  | { type: 'updateMesh'; payload: CompileResponse }
  | { type: 'showError'; message: string }
  | { type: 'exportStarted' }
  | { type: 'exportComplete'; filePath: string }
  | {
    type: 'engineCapabilities';
    payload: {
      engineId?: string;
      capabilities?: EngineCapabilities;
      reason?: string;
    };
  }
  | {
    type: 'updateConfig';
    payload: {
      renderScale: number;
    };
  };

/**
 * Message bus contract from webview UI to extension host.
 */
export type WebviewToExtensionMessage =
  | { type: 'requestExport'; format: ExportFormat }
  | { type: 'ready' };
