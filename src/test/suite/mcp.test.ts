import * as assert from 'assert';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { EngineRouter } from '../../engines/EngineRouter';
import { OmniCadMcpServer } from '../../mcp/McpServer';

const openscadExecutable = '/opt/homebrew/bin/openscad';

suite('OmniCAD MCP Contracts', () => {
  test('compile_and_measure returns compile failure for disabled opengeometry runtime', async () => {
    const server = new OmniCadMcpServer(new EngineRouter());
    const result = await server.compileAndMeasure({ code: 'const x = 1;', engine: 'opengeometry' });
    assert.match(result.content[0].text, /COMPILE_FAILED/);
  });

  test('export_geometry validates shape', async () => {
    const server = new OmniCadMcpServer(new EngineRouter());
    const result = await server.exportGeometry({ code: '', engine: 'openscad', format: 'STL' });
    assert.match(result.content[0].text, /VALIDATION_FAILED/);
  });

  test('export_geometry succeeds for OpenSCAD STL when the binary is available', async function () {
    this.timeout(30000);
    if (!fs.existsSync(openscadExecutable)) {
      this.skip();
    }

    const server = new OmniCadMcpServer(new EngineRouter(undefined, openscadExecutable));
    const result = await server.exportGeometry({ code: 'cube([1,2,3]);', engine: 'openscad', format: 'STL' });
    assert.match(result.content[0].text, /"success":true/);
    assert.match(result.content[0].text, /"format":"STL"/);
  });

  test('mcp entry starts without crashing', async function () {
    this.timeout(10000);
    const entryPath = path.resolve(__dirname, '../../mcp/entry.js');

    await new Promise<void>((resolve, reject) => {
      const child = cp.spawn(process.execPath, [entryPath], {
        env: {
          ...process.env,
          OMNICAD_OPENSCAD_PATH: openscadExecutable,
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let exited = false;
      let stderr = '';

      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.once('error', reject);
      child.once('exit', (code, signal) => {
        exited = true;
        reject(new Error(`MCP entry exited early with code=${code} signal=${signal} stderr=${stderr}`));
      });

      setTimeout(() => {
        if (exited) {
          return;
        }
        child.kill();
        resolve();
      }, 500);
    });
  });

  test('mcp stdio entry supports tool discovery and invocation', async function () {
    this.timeout(15000);

    const entryPath = path.resolve(__dirname, '../../mcp/entry.js');
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [entryPath],
      env: {
        ...process.env,
        OMNICAD_OPENSCAD_PATH: openscadExecutable,
      } as Record<string, string>,
      stderr: 'pipe',
    });
    const client = new Client({ name: 'omnicad-test-client', version: '1.0.0' });

    try {
      await client.connect(transport);
      const tools = await client.listTools();
      assert.ok(tools.tools.some((tool) => tool.name === 'compile_and_measure'));
      assert.ok(tools.tools.some((tool) => tool.name === 'export_geometry'));

      const result = await client.callTool({
        name: 'compile_and_measure',
        arguments: { code: 'const x = 1;', engine: 'opengeometry' },
      });

      const content = result.content as Array<{ type: string; text?: string }>;
      const textPart = content.find((item) => item.type === 'text' && typeof item.text === 'string');
      assert.ok(textPart, 'expected text tool output');
      assert.match(textPart.text ?? '', /COMPILE_FAILED/);
    } finally {
      await transport.close();
    }
  });
});