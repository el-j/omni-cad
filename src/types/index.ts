export interface MeshPayload {
  vertices: number[];
  normals: number[];
  indices: number[];
  colors?: number[];
}

export interface EngineExecutionOptions {
  sourcePath?: string;
}

export interface CompileResponse {
  success: boolean;
  meshes?: MeshPayload[];
  computeTimeMs: number;
  errors?: string[];
}

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
  supportedExtensions: string[];
  compile(code: string, options?: EngineExecutionOptions): Promise<CompileResponse>;
  getBrepMetadata(code: string, options?: EngineExecutionOptions): Promise<BrepMetadata>;
  export(code: string, format: 'STEP' | 'STL' | 'IGES' | 'glTF', options?: EngineExecutionOptions): Promise<Buffer>;
  dispose(): void;
}

// Message bus types (Extension <-> Webview)
export type ExtensionToWebviewMessage =
  | { type: 'updateMesh'; payload: CompileResponse }
  | { type: 'showError'; message: string }
  | { type: 'exportComplete'; filePath: string };

export type WebviewToExtensionMessage =
  | { type: 'requestExport'; format: 'STEP' | 'STL' | 'IGES' | 'glTF' }
  | { type: 'cameraMoved'; position: { x: number; y: number; z: number } }
  | { type: 'ready' };
