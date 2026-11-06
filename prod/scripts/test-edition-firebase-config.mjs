import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createEditionFirebaseConfig } from './edition-firebase-config.mjs';

const base = JSON.parse(fs.readFileSync(new URL('../firebase.json', import.meta.url), 'utf8'));
for (const edition of ['observe', 'operate']) {
  const config = createEditionFirebaseConfig(base, edition);
  assert.equal(config.hosting.target, edition);
  assert.equal(config.hosting.public, `dist-${edition}`);
  assert.deepEqual(config.hosting.rewrites, base.hosting.rewrites);
  assert.deepEqual(config.hosting.headers, base.hosting.headers);
}
assert.throws(() => createEditionFirebaseConfig(base, 'core'), /observe or operate/);
console.log('PASS edition Firebase configs isolate targets and build directories');
