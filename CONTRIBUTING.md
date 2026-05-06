# Contributing to OmniCAD

First off — thank you for taking the time to contribute! 🎉  
Every bug report, feature request, and pull request makes OmniCAD better for everyone.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
  - [Running the Extension Locally](#running-the-extension-locally)
  - [Running Tests](#running-tests)
  - [Building a .vsix](#building-a-vsix)
- [How to Add a New CAD Engine](#how-to-add-a-new-cad-engine)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).  
By participating, you agree to uphold it.

---

## Getting Started

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥ 20 LTS | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) |
| npm | ≥ 10 | Bundled with Node.js |
| [VS Code](https://code.visualstudio.com/) | ≥ 1.85 | For extension development |
| [FreeCAD](https://www.freecad.org/) | any | _Optional_ — needed to run `.py` / `.fcmacro` models |
| [OpenSCAD](https://openscad.org/) | any | _Optional_ — needed to run `.scad` models |

### Setup

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/omni-cad.git
cd omni-cad

# 2. Install dependencies
npm install

# 3. Verify everything works
npm run lint    # should produce no errors
npm test        # should show 13 passing tests
```

### Project Structure

```
omni-cad/
├── src/
│   ├── extension.ts           # Extension entry point (activate / deactivate)
│   ├── engines/
│   │   ├── EngineRouter.ts    # Strategy-pattern dispatcher
│   │   ├── OpenGeometryAdapter.ts
│   │   ├── FreeCadAdapter.ts
│   │   └── OpenScadAdapter.ts
│   ├── types/
│   │   └── index.ts           # ICadEngine interface + shared types
│   ├── mcp/
│   │   └── McpServer.ts       # Model Context Protocol server
│   ├── webview/
│   │   ├── WebviewPanel.ts    # VS Code WebviewPanel host
│   │   └── ui/
│   │       ├── main.tsx       # React app entry point
│   │       └── components/    # Scene, Toolbar, etc.
│   └── test/
│       ├── suite/             # Unit tests (Mocha)
│       └── e2e/               # E2E tests (@vscode/test-electron)
├── docs/
│   └── index.html             # Landing page (GitHub Pages)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml             # PR gate: lint, test, build, E2E
│   │   ├── release.yml        # Semantic release on main push
│   │   └── pages.yml          # Landing page deploy to GitHub Pages
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   └── feature_request.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── esbuild.js                 # Build script (bundles extension + webview)
├── tsconfig.json
├── package.json
├── .releaserc.json            # Semantic-release configuration
└── .vscodeignore              # Files excluded from the .vsix package
```

---

## Development Workflow

### Running the Extension Locally

1. Open the repo folder in VS Code.
2. Press **F5** — VS Code launches a new **Extension Development Host** window with OmniCAD loaded.
3. In the host window, open a `.ts`, `.py`, or `.scad` file, then run `OmniCAD: Open Viewer` from the Command Palette (`Ctrl+Shift+P`).

### Running Tests

```bash
# Type-check only (fast)
npm run lint

# Unit tests
npm test

# Unit tests + coverage report (generates coverage/ directory)
npm run test:coverage

# E2E tests in a headless VS Code instance
# Requires: npm run compile first, plus X display on Linux (xvfb)
npm run test:e2e
```

> **Note for Linux CI / headless environments:** The E2E runner requires a display server.  
> Wrap the command with `xvfb-run -a npm run test:e2e`.

### Building a .vsix

```bash
npm run compile    # Produce dist/extension.js and dist/webview.js
npm run package    # Create omni-cad-<version>.vsix
# or both in one step:
npm run build
```

---

## How to Add a New CAD Engine

1. **Create the adapter** in `src/engines/`:

   ```typescript
   // src/engines/MyNewEngineAdapter.ts
   import { ICadEngine, CompileResponse, BrepMetadata } from '../types';

   export class MyNewEngineAdapter implements ICadEngine {
     id = 'mynewengine';
     supportedExtensions = ['.myext'];

     async compile(code: string): Promise<CompileResponse> { /* … */ }
     async getBrepMetadata(code: string): Promise<BrepMetadata> { /* … */ }
     async export(code: string, format: 'STEP' | 'STL' | 'IGES' | 'glTF'): Promise<Buffer> { /* … */ }
     dispose(): void {}
   }
   ```

2. **Register it** in `src/engines/EngineRouter.ts`:

   ```typescript
   import { MyNewEngineAdapter } from './MyNewEngineAdapter';
   // …inside constructor:
   const me = new MyNewEngineAdapter(/* options */);
   for (const ext of me.supportedExtensions) { this.engines.set(ext, me); }
   ```

3. **Add activationEvents** in `package.json`:

   ```json
   "activationEvents": ["onLanguage:myext"]
   ```

4. **Write unit tests** in `src/test/suite/extension.test.ts` covering at least:
   - Happy-path `compile` response
   - Error path when the external tool is missing

5. **Update the README** engine table.

6. Submit a pull request — the CI pipeline will run lint, tests, and build automatically.

---

## Commit Message Convention

This project uses **[Conventional Commits](https://www.conventionalcommits.org/)**, which drive automated semantic versioning via `semantic-release`.

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use | Version bump |
|---|---|---|
| `feat` | A new user-visible feature | Minor (`0.x.0`) |
| `fix` | A bug fix | Patch (`0.0.x`) |
| `docs` | Documentation changes only | — |
| `refactor` | Code restructuring without behaviour change | — |
| `test` | Adding or fixing tests | — |
| `chore` | Build, CI, dependency updates | — |
| `perf` | Performance improvement | Patch |
| `BREAKING CHANGE` | Footer or `!` suffix — incompatible API change | Major (`x.0.0`) |

### Examples

```
feat(engine): add Blender Python adapter
fix(openscad): handle spaces in file paths on Windows
docs: update CONTRIBUTING quick-start steps
chore(deps): bump esbuild from 0.21.5 to 0.22.0
feat!: rename ICadEngine.compile return type
```

---

## Pull Request Process

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes**, following the code style of the surrounding code (TypeScript strict mode, no `any` without a comment).

3. **Add or update tests** — unit tests for new logic, E2E tests for new VS Code commands or UI.

4. **Run the full suite locally** before pushing:
   ```bash
   npm run lint && npm test
   ```

5. **Commit** with a [conventional commit message](#commit-message-convention).

6. **Push** and **open a pull request** against `main`. The PR template will guide you through the required checklist.

7. **Address review comments.** All CI checks (lint, unit tests, build, E2E) must be green before a PR can be merged.

8. A maintainer will merge using **Squash and Merge** (or **Merge Commit** for large feature branches). The commit message on `main` drives the next automated release.

---

## Reporting Bugs

Use the [Bug Report template](https://github.com/el-j/omni-cad/issues/new?template=bug_report.yml).  
Please include:

- OS and VS Code version
- OmniCAD extension version
- Steps to reproduce
- Expected vs. actual behaviour
- Any error messages from the **Output** panel (`OmniCAD` channel)

---

## Suggesting Features

Use the [Feature Request template](https://github.com/el-j/omni-cad/issues/new?template=feature_request.yml).  
Describe the problem you're trying to solve, not just the solution you have in mind.

---

Thank you again for contributing! 🚀
