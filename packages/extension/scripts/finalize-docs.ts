import * as fs from 'fs';
import * as path from 'path';

const extensionPath = path.resolve(__dirname, '..');
const videoRoot = path.join(extensionPath, 'test-results/videos');
const targetDir = path.resolve(extensionPath, '../landing/public/videos');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Map of subdirectory names to target doc video names
const videoMap: Record<string, string> = {
  'mcp-setup': 'mcp-setup.webm',
  'openscad': 'openscad-render.webm',
  'opengeometry': 'opengeometry-preview.webm',
  'freecad': 'freecad-workflow.webm'
};

async function finalize() {
  if (!fs.existsSync(videoRoot)) {
    console.error('No video directory found.');
    return;
  }

  const subdirs = fs.readdirSync(videoRoot);
  
  for (const subdir of subdirs) {
    const matchedKey = Object.keys(videoMap).find(key => subdir.toLowerCase().includes(key));
    if (matchedKey) {
      const subdirPath = path.join(videoRoot, subdir);
      if (!fs.statSync(subdirPath).isDirectory()) continue;

      const files = fs.readdirSync(subdirPath).filter(f => f.endsWith('.webm'));
      if (files.length === 0) continue;

      // Get latest video in this subdir
      const latest = files.sort((a, b) => {
        return fs.statSync(path.join(subdirPath, b)).mtimeMs - fs.statSync(path.join(subdirPath, a)).mtimeMs;
      })[0];

      const source = path.join(subdirPath, latest);
      const destination = path.join(targetDir, videoMap[matchedKey]);
      fs.copyFileSync(source, destination);
      console.log(`Synced ${matchedKey} from ${subdir} -> ${destination}`);
    }
  }
}

finalize().catch(console.error);
