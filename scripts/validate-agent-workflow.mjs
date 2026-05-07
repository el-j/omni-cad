import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const requiredFiles = [
  'CLAUDE.md',
  '.claude/commands/README.md',
  '.claude/commands/bootstrap.md',
  '.claude/commands/task.md',
  '.claude/commands/validate.md',
  '.claude/commands/test.md',
  '.claude/commands/execute-task.md',
  '.claude/commands/review.md',
  '.claude/commands/testfix.md',
  '.claude/commands/learn.md',
  '.claude/commands/orchestrator.md',
  '.claude/commands/state.md',
  '.claude/commands/resolve.md',
  '.claude/commands/extension-runtime.md',
  '.claude/commands/marketplace-release.md',
  '.claude/templates/feature.md',
  '.claude/templates/bugfix.md',
  '.claude/templates/refactor.md',
  '.claude/templates/checklist.md',
  '.claude/state/orchestrator-state.json',
  '.claude/tasks/FEAT-201-omni-bridge-export-adapter-roadmap-2026-05-07.md'
];

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(repoRoot, relativePath);
  assert.ok(fs.existsSync(absolutePath), `Missing required workflow file: ${relativePath}`);
}

const rootPackageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
const extensionPackageJson = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'packages/extension/package.json'), 'utf8')
);
const claudeMd = fs.readFileSync(path.join(repoRoot, 'CLAUDE.md'), 'utf8');
const commandsReadme = fs.readFileSync(path.join(repoRoot, '.claude/commands/README.md'), 'utf8');
const state = JSON.parse(
  fs.readFileSync(path.join(repoRoot, '.claude/state/orchestrator-state.json'), 'utf8')
);

const expectedPipeline = '/task -> /validate -> /test -> /execute-task -> /review -> /testfix -> /learn';
assert.match(claudeMd, new RegExp(expectedPipeline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(commandsReadme, new RegExp(expectedPipeline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

const requiredRootScripts = ['build', 'lint', 'test', 'test:agents'];
for (const scriptName of requiredRootScripts) {
  assert.ok(rootPackageJson.scripts?.[scriptName], `Missing root script: ${scriptName}`);
}

const requiredExtensionScripts = ['pretest', 'test', 'test:coverage', 'test:e2e', 'package'];
for (const scriptName of requiredExtensionScripts) {
  assert.ok(extensionPackageJson.scripts?.[scriptName], `Missing extension script: ${scriptName}`);
}

const commandFiles = [
  'bootstrap',
  'task',
  'validate',
  'test',
  'execute-task',
  'review',
  'testfix',
  'learn',
  'orchestrator',
  'state',
  'resolve',
  'extension-runtime',
  'marketplace-release'
];

for (const commandName of commandFiles) {
  const content = fs.readFileSync(
    path.join(repoRoot, `.claude/commands/${commandName}.md`),
    'utf8'
  );
  assert.match(content, /## Learnings/, `Command missing Learnings section: ${commandName}`);
  assert.match(content, /## Result Format/, `Command missing Result Format section: ${commandName}`);
}

for (const templateName of ['feature', 'bugfix', 'refactor']) {
  const content = fs.readFileSync(
    path.join(repoRoot, `.claude/templates/${templateName}.md`),
    'utf8'
  );
  assert.match(content, /## Acceptance Criteria/);
  assert.match(content, /## Black-Box Test Spec/);
}

assert.equal(state.orchestrator.status, 'idle');
assert.equal(state.orchestrator.baseBranch, 'main');
assert.ok(Array.isArray(state.queue), 'State queue must be an array');
assert.ok(Array.isArray(state.history), 'State history must be an array');
assert.ok(state.queue.some((item) => item.id === 'FEAT-201'), 'State queue must include FEAT-201');

console.log('Agent workflow validation passed.');