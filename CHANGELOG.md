# [1.5.0](https://github.com/el-j/omni-cad/compare/v1.4.1...v1.5.0) (2026-05-10)


### Features

* **landing:** replace docs roadmap with plugin delivery milestones ([72942e8](https://github.com/el-j/omni-cad/commit/72942e8d9c5ad4037caba7daed9f9a357529b6e4))

## [1.4.1](https://github.com/el-j/omni-cad/compare/v1.4.0...v1.4.1) (2026-05-10)


### Bug Fixes

* **pages:** persist full site snapshot and restore stable root on release deploy ([5d70219](https://github.com/el-j/omni-cad/commit/5d70219d5e4f63101627eba6b3b300952e588fe9))
* **release:** use valid prerelease identifiers for wildcard branches ([e8b209e](https://github.com/el-j/omni-cad/commit/e8b209edb274bdbee205deb6c7c1be6d9e1158e8))
* repair gh-pages and release workflows for develop and main ([ed59414](https://github.com/el-j/omni-cad/commit/ed59414e54c0f37c912f9b906b61d9752fbf3172))

## [1.4.1-beta.2](https://github.com/el-j/omni-cad/compare/v1.4.1-beta.1...v1.4.1-beta.2) (2026-05-10)


### Bug Fixes

* **pages:** persist full site snapshot and restore stable root on release deploy ([5d70219](https://github.com/el-j/omni-cad/commit/5d70219d5e4f63101627eba6b3b300952e588fe9))

## [1.4.1-beta.1](https://github.com/el-j/omni-cad/compare/v1.4.0...v1.4.1-beta.1) (2026-05-09)


### Bug Fixes

* **release:** use valid prerelease identifiers for wildcard branches ([e8b209e](https://github.com/el-j/omni-cad/commit/e8b209edb274bdbee205deb6c7c1be6d9e1158e8))
* repair gh-pages and release workflows for develop and main ([ed59414](https://github.com/el-j/omni-cad/commit/ed59414e54c0f37c912f9b906b61d9752fbf3172))

# [1.4.0-beta.4](https://github.com/el-j/omni-cad/compare/v1.4.0-beta.3...v1.4.0-beta.4) (2026-05-09)


### Bug Fixes

* **release:** use valid prerelease identifiers for wildcard branches ([e8b209e](https://github.com/el-j/omni-cad/commit/e8b209edb274bdbee205deb6c7c1be6d9e1158e8))
* repair gh-pages and release workflows for develop and main ([ed59414](https://github.com/el-j/omni-cad/commit/ed59414e54c0f37c912f9b906b61d9752fbf3172))

# [1.4.0-beta.3](https://github.com/el-j/omni-cad/compare/v1.4.0-beta.2...v1.4.0-beta.3) (2026-05-09)


### Bug Fixes

* update workflow to use Ubuntu 22.04 and improve system dependency installation ([6926df2](https://github.com/el-j/omni-cad/commit/6926df293ce46fd43cfc571b87639ec20489c289))

# [1.4.0-beta.2](https://github.com/el-j/omni-cad/compare/v1.4.0-beta.1...v1.4.0-beta.2) (2026-05-09)


### Bug Fixes

* remove version specification for pnpm setup ([dff8357](https://github.com/el-j/omni-cad/commit/dff8357b3186d4e123bbdf66f679287dc773b3fa))
* update formatting and improve code readability in updateCheck.ts ([2e146d9](https://github.com/el-j/omni-cad/commit/2e146d939997dd753121b677aadcc7175d11534d))

# [1.4.0-beta.1](https://github.com/el-j/omni-cad/compare/v1.3.0...v1.4.0-beta.1) (2026-05-09)


### Bug Fixes

* add .env to .gitignore to prevent environment file from being tracked ([7802a53](https://github.com/el-j/omni-cad/commit/7802a53a59197de69a9f5d525ffeae2b141dc595))
* adjust test coverage thresholds and improve waitForLoadState handling in e2e tests ([7e46349](https://github.com/el-j/omni-cad/commit/7e46349050d9e86d6fa1a08c33b2df46f7fc0eb4))
* **ci:** replace actions/core with actions/setup-node in docs workflow ([8b37ea2](https://github.com/el-j/omni-cad/commit/8b37ea26fe00cff69d1052556055cccb9b8928cf))
* **docs:** serve stable root site and keep beta/alpha channels beside it ([0380fc2](https://github.com/el-j/omni-cad/commit/0380fc22caf978c3cae4d93320b93a12f803bb2f))
* **e2e:** harden CI launcher for headless xvfb-run environments ([ee0c535](https://github.com/el-j/omni-cad/commit/ee0c5359d8fc6a88d20e7faa3064a42661769953))
* **release,e2e:** custom prepare script for workspace deps + increase test timeouts ([6e5ef9f](https://github.com/el-j/omni-cad/commit/6e5ef9f05faf6456003fb2d9ca3ebc2ac412813e))
* **release:** disable github issue comments and fix PR template placeholder ([ab38d76](https://github.com/el-j/omni-cad/commit/ab38d76ce0a3d498efc0ba574700c312a5928988)), closes [#123](https://github.com/el-j/omni-cad/issues/123)
* **release:** remove stale json config so semantic-release uses js config ([2d025c0](https://github.com/el-j/omni-cad/commit/2d025c03940a74e9b7e6d24d795ece9ff81131f6))
* **release:** replace npm plugin with custom version plugin for monorepo ([0c4a9a6](https://github.com/el-j/omni-cad/commit/0c4a9a69f9ac8d2d2294417832682ddd20739701))
* **release:** update debug step to load .releaserc.js instead of .json ([aef74c3](https://github.com/el-j/omni-cad/commit/aef74c3269d750ed39d6f2e019f8028d73e49d6b))
* update pretest and pretest:e2e scripts to include shared-types build ([31568e4](https://github.com/el-j/omni-cad/commit/31568e4296da605d482cf787b2d50efad755c3b8))
* update release configuration to specify channels for branches and add VSCode settings ([cd0771c](https://github.com/el-j/omni-cad/commit/cd0771c07f74389155a402f80eb0b62293537691))
* update validation for MCP setup story to ensure proper command usage ([edec6af](https://github.com/el-j/omni-cad/commit/edec6afabb6644ffb2a67e1ffe1e8fc1cfa3824d))


### Features

* add branch-based semver channels and roadmap docs ([00aaf01](https://github.com/el-j/omni-cad/commit/00aaf01ef45dd4e083a22b1d56140b33a8ab3aa8))
* add icon and enhance package metadata for VS Code extension ([99a27d7](https://github.com/el-j/omni-cad/commit/99a27d7880ea6d2590056e5f65343554bf22a5ce))
* add landing page, e2e tests, and workspace configuration for monorepo support ([d0fc5e6](https://github.com/el-j/omni-cad/commit/d0fc5e692bc96c10b2dba4897191521fe82b2ad8))
* add orchestration plan for FreeCAD rendering E2E and update release workflow for production environment ([08bb632](https://github.com/el-j/omni-cad/commit/08bb63227b5f1618a7560b9ab0072cf0c6ed4f77))
* add semantic release configuration and improve test scripts formatting ([b437d2e](https://github.com/el-j/omni-cad/commit/b437d2e7652873b3e7d1478261a885bdaf9e1504))
* add status banner for export process updates and success messages in webview ([c9a4898](https://github.com/el-j/omni-cad/commit/c9a48983bb94d40dd0e29d53d5560b4fdf5fab0a))
* enhance CAD engine adapters with detailed documentation and capabilities ([6b15a6e](https://github.com/el-j/omni-cad/commit/6b15a6e6cd46ee767900d980bae6c6e36420a3a1))
* enhance command documentation and add new commands for agent bootstrap, conflict resolution, and marketplace release ([3fca656](https://github.com/el-j/omni-cad/commit/3fca65654a610d846e75da369dd4d5a510d00ab3))
* enhance documentation processes and update related commands for user-visible changes ([4d5bbc9](https://github.com/el-j/omni-cad/commit/4d5bbc94079b2ec4c217b8cafe6be35f436689db))
* enhance export functionality and add tests for export flow ([08f4844](https://github.com/el-j/omni-cad/commit/08f4844fd63c50f216d20cdedc344fc7a199898d))
* enhance FreeCAD export capabilities to support STEP and IGES formats, update documentation and tests ([7162e27](https://github.com/el-j/omni-cad/commit/7162e279275dff674b61a1bb364514fe3051aa1c))
* implement 7-second start and loop offset for video players and update related assets ([a3fecd2](https://github.com/el-j/omni-cad/commit/a3fecd232adf01d3dbe4a834f8003aea051f5366))
* implement Claude command system with task orchestration and validation workflow ([302a146](https://github.com/el-j/omni-cad/commit/302a146ad0ab176e4629e43defae9c2d1edf423e))
* implement MCP setup flow, add render scaling UI, and update E2E test scenarios ([e2397e1](https://github.com/el-j/omni-cad/commit/e2397e17e12c75a3bae6022af2933eb7496a985a))
* remove version specification for pnpm action setup in CI workflows ([4d1a4a8](https://github.com/el-j/omni-cad/commit/4d1a4a8d0b12dc33c5236f442a1d52c5a3ddfb1f))
* update video files for landing page ([d3f33d9](https://github.com/el-j/omni-cad/commit/d3f33d90f363dfe07bf9322c9562eb376c4376a3))

# [1.3.0-beta.1](https://github.com/el-j/omni-cad/compare/v1.2.0...v1.3.0-beta.1) (2026-05-09)


### Bug Fixes

* add .env to .gitignore to prevent environment file from being tracked ([7802a53](https://github.com/el-j/omni-cad/commit/7802a53a59197de69a9f5d525ffeae2b141dc595))
* adjust test coverage thresholds and improve waitForLoadState handling in e2e tests ([7e46349](https://github.com/el-j/omni-cad/commit/7e46349050d9e86d6fa1a08c33b2df46f7fc0eb4))
* **ci:** replace actions/core with actions/setup-node in docs workflow ([8b37ea2](https://github.com/el-j/omni-cad/commit/8b37ea26fe00cff69d1052556055cccb9b8928cf))
* **docs:** serve stable root site and keep beta/alpha channels beside it ([0380fc2](https://github.com/el-j/omni-cad/commit/0380fc22caf978c3cae4d93320b93a12f803bb2f))
* **e2e:** harden CI launcher for headless xvfb-run environments ([ee0c535](https://github.com/el-j/omni-cad/commit/ee0c5359d8fc6a88d20e7faa3064a42661769953))
* **release,e2e:** custom prepare script for workspace deps + increase test timeouts ([6e5ef9f](https://github.com/el-j/omni-cad/commit/6e5ef9f05faf6456003fb2d9ca3ebc2ac412813e))
* **release:** disable github issue comments and fix PR template placeholder ([ab38d76](https://github.com/el-j/omni-cad/commit/ab38d76ce0a3d498efc0ba574700c312a5928988)), closes [#123](https://github.com/el-j/omni-cad/issues/123)
* **release:** remove stale json config so semantic-release uses js config ([2d025c0](https://github.com/el-j/omni-cad/commit/2d025c03940a74e9b7e6d24d795ece9ff81131f6))
* **release:** replace npm plugin with custom version plugin for monorepo ([0c4a9a6](https://github.com/el-j/omni-cad/commit/0c4a9a69f9ac8d2d2294417832682ddd20739701))
* **release:** update debug step to load .releaserc.js instead of .json ([aef74c3](https://github.com/el-j/omni-cad/commit/aef74c3269d750ed39d6f2e019f8028d73e49d6b))
* update pretest and pretest:e2e scripts to include shared-types build ([31568e4](https://github.com/el-j/omni-cad/commit/31568e4296da605d482cf787b2d50efad755c3b8))
* update release configuration to specify channels for branches and add VSCode settings ([cd0771c](https://github.com/el-j/omni-cad/commit/cd0771c07f74389155a402f80eb0b62293537691))
* update validation for MCP setup story to ensure proper command usage ([edec6af](https://github.com/el-j/omni-cad/commit/edec6afabb6644ffb2a67e1ffe1e8fc1cfa3824d))


### Features

* add branch-based semver channels and roadmap docs ([00aaf01](https://github.com/el-j/omni-cad/commit/00aaf01ef45dd4e083a22b1d56140b33a8ab3aa8))
* add icon and enhance package metadata for VS Code extension ([99a27d7](https://github.com/el-j/omni-cad/commit/99a27d7880ea6d2590056e5f65343554bf22a5ce))
* add landing page, e2e tests, and workspace configuration for monorepo support ([d0fc5e6](https://github.com/el-j/omni-cad/commit/d0fc5e692bc96c10b2dba4897191521fe82b2ad8))
* add orchestration plan for FreeCAD rendering E2E and update release workflow for production environment ([08bb632](https://github.com/el-j/omni-cad/commit/08bb63227b5f1618a7560b9ab0072cf0c6ed4f77))
* add semantic release configuration and improve test scripts formatting ([b437d2e](https://github.com/el-j/omni-cad/commit/b437d2e7652873b3e7d1478261a885bdaf9e1504))
* add status banner for export process updates and success messages in webview ([c9a4898](https://github.com/el-j/omni-cad/commit/c9a48983bb94d40dd0e29d53d5560b4fdf5fab0a))
* enhance CAD engine adapters with detailed documentation and capabilities ([6b15a6e](https://github.com/el-j/omni-cad/commit/6b15a6e6cd46ee767900d980bae6c6e36420a3a1))
* enhance command documentation and add new commands for agent bootstrap, conflict resolution, and marketplace release ([3fca656](https://github.com/el-j/omni-cad/commit/3fca65654a610d846e75da369dd4d5a510d00ab3))
* enhance documentation processes and update related commands for user-visible changes ([4d5bbc9](https://github.com/el-j/omni-cad/commit/4d5bbc94079b2ec4c217b8cafe6be35f436689db))
* enhance export functionality and add tests for export flow ([08f4844](https://github.com/el-j/omni-cad/commit/08f4844fd63c50f216d20cdedc344fc7a199898d))
* enhance FreeCAD export capabilities to support STEP and IGES formats, update documentation and tests ([7162e27](https://github.com/el-j/omni-cad/commit/7162e279275dff674b61a1bb364514fe3051aa1c))
* implement 7-second start and loop offset for video players and update related assets ([a3fecd2](https://github.com/el-j/omni-cad/commit/a3fecd232adf01d3dbe4a834f8003aea051f5366))
* implement Claude command system with task orchestration and validation workflow ([302a146](https://github.com/el-j/omni-cad/commit/302a146ad0ab176e4629e43defae9c2d1edf423e))
* implement MCP setup flow, add render scaling UI, and update E2E test scenarios ([e2397e1](https://github.com/el-j/omni-cad/commit/e2397e17e12c75a3bae6022af2933eb7496a985a))
* remove version specification for pnpm action setup in CI workflows ([4d1a4a8](https://github.com/el-j/omni-cad/commit/4d1a4a8d0b12dc33c5236f442a1d52c5a3ddfb1f))
* update video files for landing page ([d3f33d9](https://github.com/el-j/omni-cad/commit/d3f33d90f363dfe07bf9322c9562eb376c4376a3))

# [1.3.0-alpha.4](https://github.com/el-j/omni-cad/compare/v1.3.0-alpha.3...v1.3.0-alpha.4) (2026-05-09)


### Bug Fixes

* **docs:** serve stable root site and keep beta/alpha channels beside it ([0380fc2](https://github.com/el-j/omni-cad/commit/0380fc22caf978c3cae4d93320b93a12f803bb2f))

# [1.3.0-alpha.3](https://github.com/el-j/omni-cad/compare/v1.3.0-alpha.2...v1.3.0-alpha.3) (2026-05-09)


### Bug Fixes

* **e2e:** harden CI launcher for headless xvfb-run environments ([ee0c535](https://github.com/el-j/omni-cad/commit/ee0c5359d8fc6a88d20e7faa3064a42661769953))
* **release:** remove stale json config so semantic-release uses js config ([2d025c0](https://github.com/el-j/omni-cad/commit/2d025c03940a74e9b7e6d24d795ece9ff81131f6))


### Features

* add semantic release configuration and improve test scripts formatting ([b437d2e](https://github.com/el-j/omni-cad/commit/b437d2e7652873b3e7d1478261a885bdaf9e1504))

# [1.3.0-alpha.2](https://github.com/el-j/omni-cad/compare/v1.3.0-alpha.1...v1.3.0-alpha.2) (2026-05-09)


### Bug Fixes

* **release:** disable github issue comments and fix PR template placeholder ([ab38d76](https://github.com/el-j/omni-cad/commit/ab38d76ce0a3d498efc0ba574700c312a5928988)), closes [#123](https://github.com/el-j/omni-cad/issues/123)

# [1.3.0-alpha.1](https://github.com/el-j/omni-cad/compare/v1.2.0...v1.3.0-alpha.1) (2026-05-09)


### Bug Fixes

* add .env to .gitignore to prevent environment file from being tracked ([7802a53](https://github.com/el-j/omni-cad/commit/7802a53a59197de69a9f5d525ffeae2b141dc595))
* adjust test coverage thresholds and improve waitForLoadState handling in e2e tests ([7e46349](https://github.com/el-j/omni-cad/commit/7e46349050d9e86d6fa1a08c33b2df46f7fc0eb4))
* **release,e2e:** custom prepare script for workspace deps + increase test timeouts ([6e5ef9f](https://github.com/el-j/omni-cad/commit/6e5ef9f05faf6456003fb2d9ca3ebc2ac412813e))
* **release:** replace npm plugin with custom version plugin for monorepo ([0c4a9a6](https://github.com/el-j/omni-cad/commit/0c4a9a69f9ac8d2d2294417832682ddd20739701))
* **release:** update debug step to load .releaserc.js instead of .json ([aef74c3](https://github.com/el-j/omni-cad/commit/aef74c3269d750ed39d6f2e019f8028d73e49d6b))
* update pretest and pretest:e2e scripts to include shared-types build ([31568e4](https://github.com/el-j/omni-cad/commit/31568e4296da605d482cf787b2d50efad755c3b8))
* update release configuration to specify channels for branches and add VSCode settings ([cd0771c](https://github.com/el-j/omni-cad/commit/cd0771c07f74389155a402f80eb0b62293537691))
* update validation for MCP setup story to ensure proper command usage ([edec6af](https://github.com/el-j/omni-cad/commit/edec6afabb6644ffb2a67e1ffe1e8fc1cfa3824d))


### Features

* add branch-based semver channels and roadmap docs ([00aaf01](https://github.com/el-j/omni-cad/commit/00aaf01ef45dd4e083a22b1d56140b33a8ab3aa8))
* add icon and enhance package metadata for VS Code extension ([99a27d7](https://github.com/el-j/omni-cad/commit/99a27d7880ea6d2590056e5f65343554bf22a5ce))
* add landing page, e2e tests, and workspace configuration for monorepo support ([d0fc5e6](https://github.com/el-j/omni-cad/commit/d0fc5e692bc96c10b2dba4897191521fe82b2ad8))
* add orchestration plan for FreeCAD rendering E2E and update release workflow for production environment ([08bb632](https://github.com/el-j/omni-cad/commit/08bb63227b5f1618a7560b9ab0072cf0c6ed4f77))
* add status banner for export process updates and success messages in webview ([c9a4898](https://github.com/el-j/omni-cad/commit/c9a48983bb94d40dd0e29d53d5560b4fdf5fab0a))
* enhance CAD engine adapters with detailed documentation and capabilities ([6b15a6e](https://github.com/el-j/omni-cad/commit/6b15a6e6cd46ee767900d980bae6c6e36420a3a1))
* enhance command documentation and add new commands for agent bootstrap, conflict resolution, and marketplace release ([3fca656](https://github.com/el-j/omni-cad/commit/3fca65654a610d846e75da369dd4d5a510d00ab3))
* enhance documentation processes and update related commands for user-visible changes ([4d5bbc9](https://github.com/el-j/omni-cad/commit/4d5bbc94079b2ec4c217b8cafe6be35f436689db))
* enhance export functionality and add tests for export flow ([08f4844](https://github.com/el-j/omni-cad/commit/08f4844fd63c50f216d20cdedc344fc7a199898d))
* enhance FreeCAD export capabilities to support STEP and IGES formats, update documentation and tests ([7162e27](https://github.com/el-j/omni-cad/commit/7162e279275dff674b61a1bb364514fe3051aa1c))
* implement 7-second start and loop offset for video players and update related assets ([a3fecd2](https://github.com/el-j/omni-cad/commit/a3fecd232adf01d3dbe4a834f8003aea051f5366))
* implement Claude command system with task orchestration and validation workflow ([302a146](https://github.com/el-j/omni-cad/commit/302a146ad0ab176e4629e43defae9c2d1edf423e))
* implement MCP setup flow, add render scaling UI, and update E2E test scenarios ([e2397e1](https://github.com/el-j/omni-cad/commit/e2397e17e12c75a3bae6022af2933eb7496a985a))
* remove version specification for pnpm action setup in CI workflows ([4d1a4a8](https://github.com/el-j/omni-cad/commit/4d1a4a8d0b12dc33c5236f442a1d52c5a3ddfb1f))
* update video files for landing page ([d3f33d9](https://github.com/el-j/omni-cad/commit/d3f33d90f363dfe07bf9322c9562eb376c4376a3))

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
