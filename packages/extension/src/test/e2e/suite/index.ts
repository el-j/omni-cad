import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

/**
 * This module is loaded by @vscode/test-electron inside the Extension
 * Development Host. The `run` export is the required entry-point.
 */
export async function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'tdd', color: true, timeout: 30000 });
  const testsRoot = path.resolve(__dirname);

  const files = await glob('**/*.e2e.js', { cwd: testsRoot });
  for (const f of files) {
    mocha.addFile(path.resolve(testsRoot, f));
  }

  return new Promise<void>((resolve, reject) => {
    mocha.run((failures: number) => {
      if (failures > 0) {
        reject(new Error(`${failures} E2E test(s) failed.`));
      } else {
        resolve();
      }
    });
  });
}
