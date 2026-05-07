export interface MeshPayload {
  vertices: number[];
  normals: number[];
  indices: number[];
  colors?: number[];
}

export type ExportFormat = 'STEP' | 'STL' | 'IGES' | 'glTF';

export interface EngineCapabilities {
  supportedExportFormats: ExportFormat[];
  supportsBrepMetadata: boolean;
  renderable: boolean;
  experimental?: boolean;
}

export interface EngineExecutionOptions {
  sourcePath?: string;
}

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

export interface ICadEngine {
  id: string;
  capabilities: EngineCapabilities;
  supportedExtensions: string[];
  compile(code: string, options?: EngineExecutionOptions): Promise<CompileResponse>;
  getBrepMetadata(code: string, options?: EngineExecutionOptions): Promise<BrepMetadata>;
  export(code: string, format: ExportFormat, options?: EngineExecutionOptions): Promise<Buffer>;
  dispose(): void;
}

// Message bus types (Extension <-> Webview)
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
  };

export type WebviewToExtensionMessage =
  | { type: 'requestExport'; format: ExportFormat }
  | { type: 'ready' };
