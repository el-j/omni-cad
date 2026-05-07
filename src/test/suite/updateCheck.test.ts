import * as assert from 'assert';
import { isNewerVersion } from '../../updateCheck';

suite('updateCheck', () => {
  suite('isNewerVersion', () => {
    test('returns false when versions are equal (no prefix)', () => {
      assert.strictEqual(isNewerVersion('1.2.0', '1.2.0'), false);
    });

    test('returns false when versions are equal (v prefix on latest)', () => {
      assert.strictEqual(isNewerVersion('v1.2.0', '1.2.0'), false);
    });

    test('returns true when latest has higher patch', () => {
      assert.strictEqual(isNewerVersion('1.2.1', '1.2.0'), true);
    });

    test('returns true when latest has higher minor', () => {
      assert.strictEqual(isNewerVersion('1.3.0', '1.2.9'), true);
    });

    test('returns true when latest has higher major', () => {
      assert.strictEqual(isNewerVersion('2.0.0', '1.99.99'), true);
    });

    test('returns false when current is ahead of latest (patch)', () => {
      assert.strictEqual(isNewerVersion('1.2.0', '1.2.1'), false);
    });

    test('returns false when current is ahead of latest (minor)', () => {
      assert.strictEqual(isNewerVersion('1.2.0', '1.3.0'), false);
    });

    test('returns false when current is ahead of latest (major)', () => {
      assert.strictEqual(isNewerVersion('1.0.0', '2.0.0'), false);
    });

    test('handles v prefix on latest tag', () => {
      assert.strictEqual(isNewerVersion('v2.1.3', '2.1.2'), true);
    });

    test('returns false for malformed latest version', () => {
      assert.strictEqual(isNewerVersion('not-a-version', '1.0.0'), false);
    });

    test('returns false for malformed current version', () => {
      assert.strictEqual(isNewerVersion('2.0.0', 'broken'), false);
    });
  });
});
