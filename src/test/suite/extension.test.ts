import * as assert from 'assert';
import * as fs from 'fs';
import { EngineRouter } from '../../engines/EngineRouter';
import { OpenGeometryAdapter } from '../../engines/OpenGeometryAdapter';
import { FreeCadAdapter } from '../../engines/FreeCadAdapter';
import { OpenScadAdapter } from '../../engines/OpenScadAdapter';

const freecadExecutable = '/Applications/FreeCAD.app/Contents/Resources/bin/freecadcmd';
const windpowerHelixStation = '/Users/rex-fab-alt/Documents/code/playground/windpower-3d/src/base/helix_station.py';

suite('OmniCAD Extension Tests', () => {
  suite('EngineRouter', () => {
    let router: EngineRouter;

    setup(() => {
      router = new EngineRouter();
    });

    teardown(() => {
      router.dispose();
    });

    test('routes .ts to OpenGeometryAdapter', () => {
      const engine = router.get('.ts');
      assert.ok(engine, 'engine should exist for .ts');
      assert.strictEqual(engine?.id, 'opengeometry');
    });

    test('routes .js to OpenGeometryAdapter', () => {
      const engine = router.get('.js');
      assert.ok(engine, 'engine should exist for .js');
      assert.strictEqual(engine?.id, 'opengeometry');
    });

    test('routes .py to FreeCadAdapter', () => {
      const engine = router.get('.py');
      assert.ok(engine, 'engine should exist for .py');
      assert.strictEqual(engine?.id, 'freecad');
    });

    test('routes .fcmacro to FreeCadAdapter', () => {
      const engine = router.get('.fcmacro');
      assert.ok(engine, 'engine should exist for .fcmacro');
      assert.strictEqual(engine?.id, 'freecad');
    });

    test('routes .scad to OpenScadAdapter', () => {
      const engine = router.get('.scad');
      assert.ok(engine, 'engine should exist for .scad');
      assert.strictEqual(engine?.id, 'openscad');
    });

    test('returns undefined for unknown extension', () => {
      const engine = router.get('.xyz');
      assert.strictEqual(engine, undefined);
    });

    test('is case-insensitive', () => {
      const engine = router.get('.TS');
      assert.ok(engine, 'should handle uppercase extensions');
      assert.strictEqual(engine?.id, 'opengeometry');
    });
  });

  suite('OpenGeometryAdapter', () => {
    const adapter = new OpenGeometryAdapter();

    test('compile returns success with a mesh', async () => {
      const result = await adapter.compile('// test code');
      assert.strictEqual(result.success, true);
      assert.ok(result.meshes && result.meshes.length > 0, 'should have at least one mesh');
      assert.ok(result.computeTimeMs >= 0);
    });

    test('compile mesh has vertices and indices', async () => {
      const result = await adapter.compile('// test');
      const mesh = result.meshes![0];
      assert.ok(mesh.vertices.length > 0, 'vertices should be non-empty');
      assert.ok(mesh.indices.length > 0, 'indices should be non-empty');
    });

    test('getBrepMetadata returns expected structure', async () => {
      const meta = await adapter.getBrepMetadata('// test');
      assert.ok(typeof meta.volume === 'number');
      assert.ok(typeof meta.boundingBox.xMin === 'number');
      assert.ok(typeof meta.topology.faces === 'number');
    });

    test('export returns a Buffer', async () => {
      const buf = await adapter.export('// test', 'STL');
      assert.ok(Buffer.isBuffer(buf));
      assert.ok(buf.length > 0);
    });
  });

  suite('FreeCadAdapter', () => {
    const adapter = new FreeCadAdapter('nonexistent_freecad_cmd');

    test('compile returns failure when FreeCAD is not installed', async () => {
      const result = await adapter.compile('import FreeCAD');
      assert.strictEqual(result.success, false);
      assert.ok(result.errors && result.errors.length > 0);
    });

    test('compile returns a renderable mesh when FreeCAD is available', async function () {
      if (!fs.existsSync(freecadExecutable)) {
        this.skip();
      }

      const workingAdapter = new FreeCadAdapter(freecadExecutable);
      const result = await workingAdapter.compile([
        'import FreeCAD as App',
        'import Part',
        'doc = App.newDocument("Smoke")',
        'box = doc.addObject("Part::Feature", "Box")',
        'box.Shape = Part.makeBox(1, 2, 3)',
      ].join('\n'));

      assert.strictEqual(result.success, true);
      assert.ok(result.meshes && result.meshes.length === 1, 'should export one mesh');
      assert.ok(result.meshes![0].vertices.length > 0, 'mesh should contain vertices');
      assert.ok(result.meshes![0].indices.length > 0, 'mesh should contain indices');
    });

    test('compile preserves sourcePath so windpower scripts can resolve project-relative imports', async function () {
      if (!fs.existsSync(freecadExecutable) || !fs.existsSync(windpowerHelixStation)) {
        this.skip();
      }

      const workingAdapter = new FreeCadAdapter(freecadExecutable);
      const code = fs.readFileSync(windpowerHelixStation, 'utf8');
      const result = await workingAdapter.compile(code, { sourcePath: windpowerHelixStation });

      assert.strictEqual(result.success, true, result.errors?.join('\n'));
      assert.ok(result.meshes && result.meshes.length === 1, 'windpower script should produce a mesh');
      assert.ok(result.meshes![0].vertices.length > 300, 'windpower mesh should be non-trivial');
    });
  });

  suite('OpenScadAdapter', () => {
    const adapter = new OpenScadAdapter('nonexistent_openscad_cmd');

    test('compile returns failure when openscad is not installed', async () => {
      const result = await adapter.compile('cube([1,1,1]);');
      assert.strictEqual(result.success, false);
      assert.ok(result.errors && result.errors.length > 0);
    });
  });
});
