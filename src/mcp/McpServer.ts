import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { EngineRouter } from '../engines/EngineRouter';
import { ICadEngine } from '../types';

type EngineId = 'opengeometry' | 'freecad' | 'openscad';
type ExportFormat = 'STEP' | 'STL' | 'IGES' | 'glTF';

interface CompileMeasureArgs {
  code: string;
  engine: EngineId;
}

interface ExportGeometryArgs {
  code: string;
  engine: EngineId;
  format: ExportFormat;
}

type ToolContent = { content: Array<{ type: 'text'; text: string }> };

function engineExtension(engine: EngineId): string {
  if (engine === 'opengeometry') { return '.ts'; }
  if (engine === 'freecad') { return '.py'; }
  return '.scad';
}

function errorContent(message: string): ToolContent {
  return { content: [{ type: 'text', text: JSON.stringify({ error: message }) }] };
}

const compileMeasureSchema = {
  code: z.string().describe('The CAD script source code'),
  engine: z.enum(['opengeometry', 'freecad', 'openscad'] as const).describe('The engine to compile with'),
};

const exportGeometrySchema = {
  code: z.string().describe('The CAD script source code'),
  engine: z.enum(['opengeometry', 'freecad', 'openscad'] as const).describe('The engine to use'),
  format: z.enum(['STEP', 'STL', 'IGES', 'glTF'] as const).describe('Export format'),
};

export class OmniCadMcpServer {
  private server: McpServer;
  private router: EngineRouter;

  constructor(router: EngineRouter) {
    this.router = router;
    this.server = new McpServer({ name: 'OmniCAD-MCP', version: '1.0.0' });
    this._registerTools();
  }

  private _registerTools(): void {
    // Cast to avoid TS2589 (excessive type instantiation from MCP SDK's zod-inference overload)
    const registerTool = (
      this.server.tool as (
        name: string,
        description: string,
        schema: Record<string, z.ZodTypeAny>,
        handler: (args: Record<string, unknown>) => Promise<ToolContent>
      ) => void
    ).bind(this.server);
    registerTool(
      'compile_and_measure',
      'Compiles CAD code and returns bounding box, volume, and topology for AI validation.',
      compileMeasureSchema,
      async (rawArgs: Record<string, unknown>): Promise<ToolContent> => {
        const args = rawArgs as unknown as CompileMeasureArgs;
        const adapter: ICadEngine | undefined = this.router.get(engineExtension(args.engine));
        if (!adapter) { return errorContent(`Engine ${args.engine} not found`); }
        const [compileResult, brepData] = await Promise.all([
          adapter.compile(args.code),
          adapter.getBrepMetadata(args.code),
        ]);
        return {
          content: [{ type: 'text', text: JSON.stringify({ compile: compileResult, brep: brepData }, null, 2) }],
        };
      }
    );

    registerTool(
      'export_geometry',
      'Exports CAD code to a specified file format (STEP, STL, IGES, glTF).',
      exportGeometrySchema,
      async (rawArgs: Record<string, unknown>): Promise<ToolContent> => {
        const args = rawArgs as unknown as ExportGeometryArgs;
        const adapter: ICadEngine | undefined = this.router.get(engineExtension(args.engine));
        if (!adapter) { return errorContent(`Engine ${args.engine} not found`); }
        const buf = await adapter.export(args.code, args.format);
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, bytes: buf.length, format: args.format }) }],
        };
      }
    );
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
