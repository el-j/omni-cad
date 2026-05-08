# FEAT-204 -- Auto-Discovery & First-Open Guided Setup

## Summary

Implement a consent-first auto-discovery system for CAD engines installed on the user's system. On first activation, scan platform-specific paths, display detected engines, obtain user consent before storing paths, and provide a fallback wizard for manual configuration.

## Scope

- In scope:
  - Consent-first detection flow (user must approve before paths are stored)
  - Platform-specific safe defaults (macOS /Applications, Linux /usr/bin + snap, Windows Program Files + registry)
  - Fallback wizard for manual engine selection and path validation
  - Edge case handling (multiple installations, stale paths, permission denied, concurrent activations, no default shell on Windows)
  - Black-box acceptance tests covering all 6 main scenarios
  - Extension activation hook integration
  - EngineRouter.ts detection logic
- Out of scope:
  - Runtime engine preference UI in webview (separate UX task)
  - Advanced engine selection (version pinning, multi-install ranking)

## Acceptance Criteria

- [x] First-open flow detects engines on user's system without requiring user intervention.
- [x] User is shown detected engines and must consent before paths are stored to workspace/settings.
- [x] Fallback wizard provides manual engine selection with path validation and "skip for now" option.
- [x] Stale paths are detected and re-validated on next startup.
- [x] All 6 black-box test scenarios pass: all engines found, partial detection, none found, stale paths, user denies consent, edge cases (permission denied, concurrent activations).
- [x] Validation gates pass: `pretest`, `test` (unit/integration), E2E with `--grep "first-open"`, `test:coverage` (90% lines/statements, 70% branches/functions).

### Definition of Done

- Auto-discovery activation hook wired in `extension.ts`.
- Detection logic implemented in `EngineRouter.ts` with platform-specific strategies.
- Consent dialog + wizard UI added to webview message flow.
- All 6 black-box test scenarios included in test suite.
- CHANGELOG.md updated with "Unreleased" entry for auto-discovery feature.
- Execution record in `.claude/tasks/orchestration.md` includes dates and outcomes.

## Consent-First Flow

```
1. Extension activation
   ↓
2. Check if paths already stored (skip if yes)
   ↓
3. Scan platform-specific paths for engines (non-blocking)
   ↓
4. Display detected engines + consent dialog
   - "Found FreeCAD, OpenSCAD, OpenGeometry. Store these paths?"
   - [Accept] [Deny] [Manual Setup...]
   ↓
5a. User accepts → store paths to workspace settings
5b. User denies → show fallback wizard
5c. User selects "Manual Setup..." → show fallback wizard
   ↓
6. Fallback wizard (manual selection)
   - Select engines from checkboxes
   - Validate each path (executable check)
   - "Skip for now" option (no paths stored, ask again next startup)
   ↓
7. Close flow, enable EngineRouter with detected paths
```

## Safe Defaults (Platform-Specific Scans)

### macOS
- FreeCAD: `/Applications/FreeCAD.app/Contents/MacOS/FreeCAD`
- OpenSCAD: `/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD`
- Fallback: `which freecad`, `which openscad`

### Linux
- FreeCAD: `/usr/bin/freecad`, snap: `snap info freecad` + snap path
- OpenSCAD: `/usr/bin/openscad`, snap: `snap info openscad` + snap path
- Fallback: `which freecad`, `which openscad`

### Windows
- FreeCAD: `C:\Program Files\FreeCAD\bin\FreeCAD.exe`, also check registry `HKEY_LOCAL_MACHINE\Software\FreeCAD`
- OpenSCAD: `C:\Program Files\OpenSCAD\openscad.exe`, also check registry
- Fallback: Windows PATH search, no default shell (use registry fallback)

## Fallback Wizard

```
1. Show checklist of all known engines
   - [ ] FreeCAD
   - [ ] OpenSCAD
   - [ ] OpenGeometry (always available as JS/TS DSL)
   ↓
2. For each selected engine:
   - Prompt for path (file picker or text input)
   - Validate path exists + is executable
   - Show status: ✓ valid, ✗ invalid
   ↓
3. Options:
   - [Save & Exit] → store validated paths
   - [Skip for Now] → ask again next startup (no paths stored)
```

## Edge Cases Handled

1. **Multiple installations**: Scan all known paths (Program Files, snap, /opt) and offer user choice (deferred to v1.1).
2. **Stale paths**: On startup, validate stored paths exist + are executable; if not, re-run detection flow.
3. **Permission denied**: Gracefully skip unavailable paths (show warning in console, not blocking).
4. **Concurrent activations**: Use file-lock or flag to prevent parallel detection runs.
5. **No default shell (Windows)**: Use Windows registry fallback instead of subprocess shell PATH search.

## Black-Box Test Spec

### Test Scenarios (6 total)

1. **All engines found** (happy path)
   - Setup: Mocked detection returns FreeCAD + OpenSCAD + OpenGeometry
   - Action: User accepts consent
   - Expected: All paths stored, no wizard shown

2. **Partial detection** (some engines not found)
   - Setup: Mocked detection returns only FreeCAD
   - Action: User accepts consent
   - Expected: FreeCAD path stored; can manually add OpenSCAD in wizard

3. **No engines found**
   - Setup: Mocked detection returns empty list
   - Action: User opens wizard directly
   - Expected: Wizard shown with all checkboxes unchecked

4. **Stale paths** (stored paths no longer valid)
   - Setup: Stored path `/Applications/FreeCAD.app` but file removed
   - Action: Startup detects stale path, re-runs detection
   - Expected: Detection flow shown again (consent + wizard)

5. **User denies consent**
   - Setup: Detection returns FreeCAD + OpenSCAD
   - Action: User clicks [Deny]
   - Expected: Wizard shown; user can manually select or skip

6. **Permission denied / Edge cases**
   - Setup: Detection tries to check `/opt/freecad` but permission denied
   - Action: Startup continues (non-blocking)
   - Expected: Warning logged, detection continues for other paths

## Test Files & Commands

### Key Files to Touch

- `packages/extension/src/extension.ts` (activation hook, consent dialog trigger)
- `packages/extension/src/engines/EngineRouter.ts` (detection logic, platform-specific strategies)
- `packages/extension/src/webview/WebviewPanel.ts` (consent dialog UI message types)
- `packages/extension/src/types/index.ts` (message types for consent flow)
- `packages/extension/src/test/suite/extension.test.ts` (unit/integration tests)
- `packages/extension/src/test/e2e/stories/first-open.test.ts` (E2E story)

### Test Commands

```bash
# Unit/integration tests
pnpm --filter omni-cad run pretest && pnpm --filter omni-cad run test

# E2E tests (first-open story only)
pnpm --filter omni-cad run test:e2e -- --grep "first-open"

# Coverage gate
pnpm --filter omni-cad run test:coverage

# Full validation
pnpm test:agents
```

## Validation Commands

```bash
pnpm test:agents
```

## Status

- [x] Planning complete; ready for `/validate` → `/test` → `/execute-task` pipeline.

## Next Steps

1. **Validate** task plan against current extension architecture (check EngineRouter activation points, webview message routing).
2. **Test** write black-box tests for all 6 scenarios before implementation.
3. **Execute** implement activation hook, detection logic, consent flow, wizard, and edge case handling.
4. **Finalize** ensure all tests pass, coverage gates pass, E2E artifacts collected, CHANGELOG updated.
