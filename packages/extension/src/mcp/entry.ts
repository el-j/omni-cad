import { EngineRouter } from '../engines/EngineRouter';
import { OmniCadMcpServer } from './McpServer';

async function main(): Promise<void> {
  const router = new EngineRouter(
    process.env.OMNICAD_FREECAD_PATH,
    process.env.OMNICAD_OPENSCAD_PATH,
    process.env.OMNICAD_ENABLE_EXPERIMENTAL_OPENGEOMETRY === '1'
  );
  const server = new OmniCadMcpServer(router);

  const shutdown = async () => {
    await server.dispose();
    router.dispose();
  };

  process.on('SIGINT', () => void shutdown().finally(() => process.exit(0)));
  process.on('SIGTERM', () => void shutdown().finally(() => process.exit(0)));

  await server.start();
}

main().catch((err) => {
  console.error('OmniCAD MCP entry failed:', err);
  process.exit(1);
});