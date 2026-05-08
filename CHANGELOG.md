# Unreleased

### Changed

* harden OpenGeometry export/metadata contracts with explicit unsupported export error shape and computed metadata bounds
* align landing feature export messaging with currently verified runtime capabilities
* align MCP setup E2E story to contributed command surface only
* add consent-first first-open CAD engine discovery and setup wizard flow with stale-path revalidation
* add CadQuery runtime slice with `.cq.py` routing and STL export contract
* add shared Python BREP adapter base and build123d `.b3d.py` STL runtime slice
* add central extension export capability matrix for runtime adapter contracts

### Tests

* add export artifact assertions for FreeCAD STEP and OpenSCAD STL in extension E2E suite
* add export write-error propagation coverage and unsupported format regression tests
* add capability claim validator (`scripts/validate-capability-claims.mjs`) and include it in `pnpm test:agents`
* add unit coverage for engine auto-discovery fallback and stale configured-path handling
* add unit coverage for CadQuery compound-extension routing and capability gating
* add unit coverage for build123d compound-extension routing and capability exposure
* add unit checks enforcing router-to-capability-matrix contract alignment

# [1.2.0](https://github.com/el-j/omni-cad/compare/v1.1.0...v1.2.0) (2026-05-07)


### Features

* complete backlog — progress UI, finite guards, MCP response validation, test coverage ([c448804](https://github.com/el-j/omni-cad/commit/c4488040c261c991b99736a8de5c6244f2598d44))
* integrate FreeCAD demo video into landing page and README ([c81916b](https://github.com/el-j/omni-cad/commit/c81916b44ab76f3b1599ca2bf4c978e151cfccd3))

# [1.1.0](https://github.com/el-j/omni-cad/compare/v1.0.0...v1.1.0) (2026-05-07)


### Features

* implement FreeCAD rendering integration and enhance adapters for improved mesh handling ([d7e4bdf](https://github.com/el-j/omni-cad/commit/d7e4bdfc28f762a88605ca3b2e358f7a3313bd69))
* Integrate MCP server and experimental OpenGeometry support ([439e850](https://github.com/el-j/omni-cad/commit/439e85064e7a7352f4bbbfa39f87256bca3afeed))

# 1.0.0 (2026-05-06)


### Bug Fixes

* address code review feedback ([c0a82a3](https://github.com/el-j/omni-cad/commit/c0a82a3ea3e5d323804e3e32b46f27988a5dab1a))
* pin actions/download-artifact to v4.1.3 to fix arbitrary file write CVE ([50d0e52](https://github.com/el-j/omni-cad/commit/50d0e52f2ffe2c8db15bb403d3ac2af88612fdcf))
* pin anchore/sbom-action to v0.24.0, guard test runner with require.main, fix OpenGeometry link ([2257749](https://github.com/el-j/omni-cad/commit/2257749276361f2612dafb95bc981f404a35c4b2))


### Features

* add CI/CD workflows, E2E tests, semantic release, and .vsix packaging ([12858fb](https://github.com/el-j/omni-cad/commit/12858fb7d9e53d3d47b6ac00d5e14988357274a5))
* implement complete OmniCAD VS Code extension ([0e89047](https://github.com/el-j/omni-cad/commit/0e89047d35cafef5fa37e776d7af0f357de056f0))
* scaffold OmniCAD VS Code extension ([a710bc2](https://github.com/el-j/omni-cad/commit/a710bc2fc812b3f5cd0207b5752c84d85a029673))
