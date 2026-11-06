import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../platforms/fitness-twa/', import.meta.url);
const read = (name) => readFileSync(new URL(name, root), 'utf8');

test('Fitness TWA wraps the separate product origin with Android 16 target', () => {
  const manifest = JSON.parse(read('twa-manifest.json'));
  const gradle = read('app/build.gradle');
  const android = read('app/src/main/AndroidManifest.xml');
  assert.equal(manifest.host, 'vitalos-fitness-prod.web.app');
  assert.equal(manifest.startUrl, '/');
  assert.equal(manifest.packageId, 'at.vitalos.fitness'); // provisional until confirmed
  assert.match(gradle, /targetSdkVersion 36/);
  assert.ok(gradle.includes(manifest.host));
  assert.ok(gradle.includes(manifest.packageId));
  assert.match(android, /android\.support\.customtabs\.trusted\.DEFAULT_URL/);
  assert.deepEqual(manifest.fingerprints, []);
});
