<!-- skill: extension-runtime -->

# extension-runtime -- OmniCAD Extension Specialist

Use this specialist for tasks centered on `packages/extension/`.

## Scope

- Engine adapter additions or changes
- Export format expansion and capability gating
- Webview export/render UX
- MCP server/runtime contract work
- Extension unit, integration, coverage, and E2E tests

## Current Repo Reality

- `FreeCadAdapter`: verified `STL`, `STEP`, `IGES`
- `OpenScadAdapter`: verified `STL` only
- `OpenGeometryAdapter`: experimental compile path, no real export support yet
- Export requests flow through `WebviewPanel` and engine `supportedExportFormats`

## Adapter Expansion Guidance

- BREP-first Python family: prioritize `CadQuery` and `build123d` after FreeCAD, because they fit VS Code workflows and can plausibly target STEP/IGES/STL.
- Mesh/CSG family: keep `OpenSCAD` honest, and treat `OpenJSCAD/JSCAD` as a distinct adapter family rather than folding them into OpenGeometry.
- Experimental TS/JS geometry family: stabilize `OpenGeometry` before promising serious export breadth.

## Preferred Validation

- `pnpm --filter omni-cad run pretest && pnpm --filter omni-cad run test`
- `pnpm --filter omni-cad run test:coverage`
- `pnpm --filter omni-cad run test:e2e` when UI/runtime behavior changed

## Result Format

```
STATUS: done|blocked|failed
FILES: [created/changed files]
TESTS: {focused command result}
RISK: low|medium|high
SUMMARY: {1 sentence}
```

## Learnings

- Keep export claims aligned with `supportedExportFormats`; adapters should advertise only formats backed by a real file-producing path and tests.
