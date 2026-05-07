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
| [pnpm](https://pnpm.io/) | 10.x | Workspace package manager used by the monorepo |
| [VS Code](https://code.visualstudio.com/) | ≥ 1.85 | For extension development |
| [FreeCAD](https://www.freecad.org/) | any | _Optional_ — needed to run `.py` / `.fcmacro` models |
| [OpenSCAD](https://openscad.org/) | any | _Optional_ — needed to run `.scad` models |

### Setup

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/omni-cad.git
cd omni-cad

# 2. Install dependencies
pnpm install

# 3. Verify everything works
pnpm lint
pnpm test
```

### Project Structure

```
omni-cad/
├── packages/
│   ├── extension/
│   │   ├── src/
│   │   │   ├── extension.ts
│   │   │   ├── engines/
│   │   │   ├── mcp/
│   │   │   ├── test/
│   │   │   ├── types/
│   │   │   └── webview/
│   │   ├── esbuild.js         # Extension + webview bundling
│   │   └── package.json
│   ├── landing/
│   │   ├── src/               # Landing page + docs UI
│   │   ├── public/            # Static assets and generated demo videos
│   │   └── package.json
│   └── shared-types/
│       ├── src/
│       └── package.json
├── docs/
│   └── omniCAD-vscode-plugin-freecad.m4v
├── .github/
│   ├── workflows/
│   │   ├── ci.yml             # Workspace lint, test, build, and extension E2E
│   │   ├── docs.yml           # Docs asset generation and landing build
│   │   ├── release.yml        # Semantic release + VSIX publishing
│   │   └── pages.yml          # Landing/docs deployment to GitHub Pages
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   └── feature_request.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── package.json               # Root workspace scripts
├── pnpm-workspace.yaml
├── turbo.json
└── .releaserc.json            # Semantic-release configuration
```

---

## Development Workflow

### Branching & Release Channels

OmniCAD follows a GitVersion-style branching model with Semantic Versioning:

- `main` → stable production releases (`x.y.z`)
- `develop` → integration prereleases (`x.y.z-dev.n`)
- `feature/<name>` → feature prereleases (`x.y.z-feature-<name>.n`)
- `fix/<name>` → fix prereleases (`x.y.z-fix-<name>.n`)

Branch names are validated in CI for pull requests targeting `main` or `develop`.

### Running the Extension Locally

1. Open the repo folder in VS Code.
2. Press **F5** — VS Code launches a new **Extension Development Host** window with OmniCAD loaded.
3. In the host window, open a `.ts`, `.py`, or `.scad` file, then run `OmniCAD: Open Viewer` from the Command Palette (`Ctrl+Shift+P`).

### Running Tests

```bash
# Workspace lint and tests
pnpm lint
pnpm test

# Extension-only coverage
pnpm --filter omni-cad run test:coverage

# Extension E2E tests in a headless VS Code instance
pnpm --filter omni-cad run test:e2e
```

> **Note for Linux CI / headless environments:** The E2E runner requires a display server.  
> Wrap the command with `xvfb-run -a pnpm --filter omni-cad run test:e2e`.

### Building a .vsix

```bash
pnpm --filter omni-cad run compile    # Produce dist/extension.js and dist/webview.js
pnpm --filter omni-cad run package    # Create omni-cad-<version>.vsix
```

---

## How to Add a New CAD Engine

1. **Create the adapter** in `packages/extension/src/engines/`:

   ```typescript
   // packages/extension/src/engines/MyNewEngineAdapter.ts
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

2. **Register it** in `packages/extension/src/engines/EngineRouter.ts`:

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

4. **Write unit tests** in `packages/extension/src/test/suite/extension.test.ts` covering at least:
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

1. **Fork** the repository and create a branch from `develop`:
   ```bash
   git checkout -b feature/my-feature
   ```

   Use branch names `feature/<name>` for new features and `fix/<name>` for bug fixes.

2. **Make your changes**, following the code style of the surrounding code (TypeScript strict mode, no `any` without a comment).

3. **Add or update tests** — unit tests for new logic, E2E tests for new VS Code commands or UI.

4. **Run the full suite locally** before pushing:
   ```bash
   pnpm lint && pnpm test
   ```

5. **Commit** with a [conventional commit message](#commit-message-convention).

6. **Push** and **open a pull request** against `develop` (or `main` for urgent hotfixes). The PR template will guide you through the required checklist.

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
