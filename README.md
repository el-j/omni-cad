<div align="center">

# OmniCAD

**The Universal CAD Engine for VS Code**

[![CI](https://github.com/el-j/omni-cad/actions/workflows/ci.yml/badge.svg)](https://github.com/el-j/omni-cad/actions/workflows/ci.yml)
[![Release](https://github.com/el-j/omni-cad/actions/workflows/release.yml/badge.svg)](https://github.com/el-j/omni-cad/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Extension-007ACC?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=omni-cad.omni-cad)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

_Write CAD models in TypeScript, Python, or OpenSCAD — see them live in 3D, with capability-aware export from the viewer._

[🌐 Landing Page](https://el-j.github.io/omni-cad/) · [📦 Latest Release](https://github.com/el-j/omni-cad/releases/latest) · [🐛 Report a Bug](https://github.com/el-j/omni-cad/issues/new?template=bug_report.yml) · [✨ Request a Feature](https://github.com/el-j/omni-cad/issues/new?template=feature_request.yml)

<video src="docs/omniCAD-vscode-plugin-freecad.m4v" autoplay loop muted playsinline width="100%"></video>

</div>

---

## ✨ What is OmniCAD?

OmniCAD is a VS Code extension that acts as a **universal frontend router** for CAD engines. Instead of juggling multiple tools, you write your CAD model in the language you prefer, and OmniCAD automatically picks the right engine, compiles it, and renders the result in a live 3D viewer — all inside VS Code.

| Language / File    | Engine                                   | Use Case                                                 |
| ------------------ | ---------------------------------------- | -------------------------------------------------------- |
| `.ts` / `.js`      | [OpenGeometry](https://opengeometry.dev) | Experimental preview only until real runtime integration |
| `.py` / `.fcmacro` | [FreeCAD](https://www.freecad.org/)      | Full BREP solid modelling                                |
| `.scad`            | [OpenSCAD](https://openscad.org/)        | CSG-based 3D printing models                             |

---

## 🚀 Features

- **Live 3D Viewer** — Three.js-powered WebGL viewer opens beside your editor. Save your file, see the update instantly.
- **Engine Router** — Strategy-pattern dispatcher automatically selects the right backend for each file extension.
- **Capability-aware Export** — Export actions are gated by the active engine's actual supported formats.
- **Current export coverage** — OpenSCAD exports STL, FreeCAD exports STL/STEP/IGES, and experimental OpenGeometry mode exports STL.
- **MCP Integration** — Built-in [Model Context Protocol](https://modelcontextprotocol.io) server exposes `compile_and_measure`, `export_geometry`, `get_engine_capabilities`, `validate_source`, and `explain_compile_failure` tools to MCP-capable AI agents.
- **Guarded experimental runtime** — OpenGeometry is explicitly gated until a real runtime is integrated.
- **Professional CI/CD** — Semantic versioning, automated `.vsix` releases, coverage reports, E2E tests in headless VS Code.

---

## 📦 Installation

### From the VS Code Marketplace _(recommended)_

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P`
3. Type `ext install omni-cad.omni-cad` and press Enter

### From a `.vsix` file

1. Download the latest `.vsix` from the [Releases page](https://github.com/el-j/omni-cad/releases/latest)
2. In VS Code, run **Extensions: Install from VSIX…** and select the file

---

## ⚡ Quick Start

1. **Open a supported file** — create or open any `.ts`, `.js`, `.py`, `.fcmacro`, or `.scad` file.
2. **Open the viewer** — run `OmniCAD: Open Viewer` from the Command Palette (`Ctrl+Shift+P`).
3. **Edit and save** — every time you save the file, OmniCAD re-compiles and updates the 3D view automatically.
4. **Export** — use the viewer toolbar to export one of the formats supported by the active engine.

### Example: OpenGeometry (TypeScript)

```typescript
// my-model.ts
// OmniCAD will compile this with the OpenGeometry engine
// and render the resulting mesh in the 3D viewer.

const radius = 10;
const height = 20;
// Your OpenGeometry API calls here…
```

### Example: OpenSCAD

```scad
// my-model.scad
difference() {
  cube([20, 20, 20], center = true);
  sphere(r = 12);
}
```

### Example: FreeCAD Python macro

```python
# my-model.py
import FreeCAD, Part
doc = FreeCAD.newDocument()
box = doc.addObject("Part::Box", "Box")
box.Length = 20
box.Width = 15
box.Height = 10
doc.recompute()
```

---

## ⚙️ Configuration

All settings are under the **OmniCAD** section in VS Code Settings (`Ctrl+,`):

| Setting                                  | Default      | Description                           |
| ---------------------------------------- | ------------ | ------------------------------------- |
| `omniCAD.freecadPath`                    | `FreeCADCmd` | Path to the `FreeCADCmd` executable   |
| `omniCAD.openscadPath`                   | `openscad`   | Path to the `openscad` CLI executable |
| `omniCAD.mcpEnabled`                     | `false`      | Enable guarded MCP server startup     |
| `omniCAD.enableExperimentalOpenGeometry` | `false`      | Enable OpenGeometry preview mode      |
| `omniCAD.worldUpAxis`                    | `Z`          | Viewer world up-axis (`Y` or `Z`)     |
| `omniCAD.viewerUnitLabel`                | `mm`         | Unit label shown in viewer toolbar    |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  VS Code Extension                  │
│                                                     │
│  extension.ts  ──onSave──►  EngineRouter            │
│                              │                      │
│                   ┌──────────┼──────────┐           │
│                   ▼          ▼          ▼           │
│         OpenGeometry    FreeCAD    OpenSCAD          │
│           Adapter       Adapter    Adapter           │
│           (.ts/.js)    (.py/.fc)   (.scad)          │
│                   └──────────┼──────────┘           │
│                              │ CompileResponse       │
│                              ▼                      │
│                        WebviewPanel                  │
│                      (Three.js / React)              │
│                                                     │
│  McpServer ──────► compile_and_measure              │
│   (stdio)  ──────► export_geometry                  │
│            ──────► get_engine_capabilities          │
│            ──────► validate_source                  │
│            ──────► explain_compile_failure          │
└─────────────────────────────────────────────────────┘
```

The `EngineRouter` uses the **Strategy pattern**: each adapter implements the `ICadEngine` interface (`compile`, `getBrepMetadata`, `export`, `dispose`) and registers itself for its file extensions. The router looks up the right adapter by file extension at runtime.

### MCP contract

Run MCP in stdio mode:

```bash
pnpm --filter omni-cad run mcp:stdio
```

Optional environment variables:

- `OMNICAD_FREECAD_PATH`: override FreeCAD CLI path
- `OMNICAD_OPENSCAD_PATH`: override OpenSCAD CLI path
- `OMNICAD_ENABLE_EXPERIMENTAL_OPENGEOMETRY=1`: enable OpenGeometry runtime tooling
- `OMNICAD_MCP_TIMEOUT_MS`: per-tool timeout (default `120000`)

All MCP tools return a versioned JSON envelope in the `text` payload:

```json
{
  "apiVersion": "1.1.0",
  "success": true,
  "tool": "validate_source",
  "data": {
    "engine": "opengeometry",
    "valid": false,
    "issues": ["OpenGeometry source must export `const model = () => ...`."],
    "warnings": []
  }
}
```

Error envelope:

```json
{
  "apiVersion": "1.1.0",
  "success": false,
  "error": {
    "code": "COMPILE_FAILED",
    "message": "..."
  }
}
```

---

## 🛠️ Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contributor guide.

### Prerequisites

| Tool     | Version | Notes                                                                            |
| -------- | ------- | -------------------------------------------------------------------------------- |
| Node.js  | ≥ 20    | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) |
| npm      | ≥ 10    | Comes with Node.js                                                               |
| VS Code  | ≥ 1.85  | For running/debugging the extension                                              |
| FreeCAD  | any     | Optional — only needed for `.py`/`.fcmacro`                                      |
| OpenSCAD | any     | Optional — only needed for `.scad`                                               |

### Setup

```bash
git clone https://github.com/el-j/omni-cad.git
cd omni-cad
pnpm install
```

### Commands

```bash
pnpm lint                                 # Run workspace lint/type-check tasks
pnpm test                                 # Run workspace tests
pnpm build                                # Build all workspace packages
pnpm test:e2e                             # Run workspace E2E flow
pnpm --filter omni-cad run compile        # Build the VS Code extension bundle
pnpm --filter omni-cad run package        # Package the extension as a .vsix
pnpm --filter @omni-cad/landing run dev   # Start the landing/docs app locally
```

### Running locally in VS Code

1. Open the repo in VS Code.
2. Press `F5` — this launches a new **Extension Development Host** window with OmniCAD loaded.
3. Open a `.ts`, `.py`, or `.scad` file in the host window, then run `OmniCAD: Open Viewer`.

---

## 🧪 Testing

| Suite     | Command                                    | What it tests                                                                                                                                      |
| --------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace | `pnpm test`                                | Package-level test suites orchestrated through the workspace                                                                                       |
| Host      | `pnpm --filter omni-cad run test:host`     | Extension test suite executed inside a real VS Code Extension Host (`@vscode/test-electron`) for runtime-faithful validation                     |
| Coverage  | `pnpm --filter omni-cad run test:coverage` | Extension unit coverage with c8 line/branch/function thresholds                                                                                    |
| E2E       | `pnpm --filter omni-cad run test:e2e`      | Extension activation, command registration, config defaults, FreeCAD render path — runs inside a real VS Code instance via `@vscode/test-electron` |

---

## 🔢 Versioning

OmniCAD uses **Semantic Versioning** (`MAJOR.MINOR.PATCH`) with automated releases via `semantic-release`.

- **`main`** → stable releases (`1.2.3`)
- **`develop`** → integration prereleases (`1.2.4-dev.1`)
- **`feature/*`** → feature prereleases (`1.2.4-feature-my-branch.1`)
- **`fix/*`** → fix prereleases (`1.2.4-fix-issue-123.1`)

Version bumps are determined by Conventional Commit messages:

- `feat:` → minor bump
- `fix:` / `perf:` → patch bump
- `BREAKING CHANGE:` or `feat!:` / `fix!:` → major bump

---

## 🗺️ Roadmap

- [ ] Publish to VS Code Marketplace
- [x] Add macOS and Windows E2E jobs
- [ ] Add export pipeline tests for STEP/STL/IGES/glTF
- [ ] Add configurable render quality/performance presets
- [ ] Add first-party engine adapter templates for contributors

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

- 🐛 [Report a bug](https://github.com/el-j/omni-cad/issues/new?template=bug_report.yml)
- ✨ [Request a feature](https://github.com/el-j/omni-cad/issues/new?template=feature_request.yml)
- 🔀 [Open a pull request](https://github.com/el-j/omni-cad/compare)

---

## 📄 License

[MIT](LICENSE) © el-j
