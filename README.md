<div align="center">

# OmniCAD

**The Universal CAD Engine for VS Code**

[![CI](https://github.com/el-j/omni-cad/actions/workflows/ci.yml/badge.svg)](https://github.com/el-j/omni-cad/actions/workflows/ci.yml)
[![Release](https://github.com/el-j/omni-cad/actions/workflows/release.yml/badge.svg)](https://github.com/el-j/omni-cad/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Extension-007ACC?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=omni-cad.omni-cad)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

_Write CAD models in TypeScript, Python, or OpenSCAD — see them live in 3D, export to any format._

[🌐 Landing Page](https://el-j.github.io/omni-cad/) · [📦 Latest Release](https://github.com/el-j/omni-cad/releases/latest) · [🐛 Report a Bug](https://github.com/el-j/omni-cad/issues/new?template=bug_report.yml) · [✨ Request a Feature](https://github.com/el-j/omni-cad/issues/new?template=feature_request.yml)

</div>

---

## ✨ What is OmniCAD?

OmniCAD is a VS Code extension that acts as a **universal frontend router** for CAD engines. Instead of juggling multiple tools, you write your CAD model in the language you prefer, and OmniCAD automatically picks the right engine, compiles it, and renders the result in a live 3D viewer — all inside VS Code.

| Language / File | Engine | Use Case |
|---|---|---|
| `.ts` / `.js` | [OpenGeometry](https://github.com/nicktindall/cyclon.p2p-rtc-client) | Parametric geometry via WebAssembly |
| `.py` / `.fcmacro` | [FreeCAD](https://www.freecad.org/) | Full BREP solid modelling |
| `.scad` | [OpenSCAD](https://openscad.org/) | CSG-based 3D printing models |

---

## 🚀 Features

- **Live 3D Viewer** — Three.js-powered WebGL viewer opens beside your editor. Save your file, see the update instantly.
- **Engine Router** — Strategy-pattern dispatcher automatically selects the right backend for each file extension.
- **Multi-format Export** — Export your models to **STEP**, **STL**, **IGES**, or **glTF** with a single click.
- **MCP Integration** — Built-in [Model Context Protocol](https://modelcontextprotocol.io) server exposes `compile_and_measure` and `export_geometry` tools to any MCP-capable AI agent.
- **Zero-config defaults** — Works out of the box for OpenGeometry. FreeCAD and OpenSCAD just need their executables on your `PATH`.
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
4. **Export** — click the **Export** button in the viewer toolbar and choose your format.

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

| Setting | Default | Description |
|---|---|---|
| `omniCAD.freecadPath` | `FreeCADCmd` | Path to the `FreeCADCmd` executable |
| `omniCAD.openscadPath` | `openscad` | Path to the `openscad` CLI executable |

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
└─────────────────────────────────────────────────────┘
```

The `EngineRouter` uses the **Strategy pattern**: each adapter implements the `ICadEngine` interface (`compile`, `getBrepMetadata`, `export`, `dispose`) and registers itself for its file extensions. The router looks up the right adapter by file extension at runtime.

---

## 🛠️ Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contributor guide.

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) |
| npm | ≥ 10 | Comes with Node.js |
| VS Code | ≥ 1.85 | For running/debugging the extension |
| FreeCAD | any | Optional — only needed for `.py`/`.fcmacro` |
| OpenSCAD | any | Optional — only needed for `.scad` |

### Setup

```bash
git clone https://github.com/el-j/omni-cad.git
cd omni-cad
npm install
```

### Commands

```bash
npm run compile        # Bundle extension + webview with esbuild
npm run watch          # Same, but in watch mode
npm run lint           # TypeScript type-check (no emit)
npm test               # Run unit tests (Mocha)
npm run test:coverage  # Run unit tests with c8 coverage report
npm run test:e2e       # Run E2E tests in a headless VS Code instance
npm run package        # Package a distributable .vsix
npm run build          # compile + package in one step
```

### Running locally in VS Code

1. Open the repo in VS Code.
2. Press `F5` — this launches a new **Extension Development Host** window with OmniCAD loaded.
3. Open a `.ts`, `.py`, or `.scad` file in the host window, then run `OmniCAD: Open Viewer`.

---

## 🧪 Testing

| Suite | Command | What it tests |
|---|---|---|
| Unit | `npm test` | EngineRouter dispatch, adapter stubs, compile/export responses |
| Coverage | `npm run test:coverage` | Same, with c8 line/branch/function coverage |
| E2E | `npm run test:e2e` | Extension activation, command registration, config defaults — runs inside a real VS Code instance via `@vscode/test-electron` |

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

- 🐛 [Report a bug](https://github.com/el-j/omni-cad/issues/new?template=bug_report.yml)
- ✨ [Request a feature](https://github.com/el-j/omni-cad/issues/new?template=feature_request.yml)
- 🔀 [Open a pull request](https://github.com/el-j/omni-cad/compare)

---

## 📄 License

[MIT](LICENSE) © el-j
