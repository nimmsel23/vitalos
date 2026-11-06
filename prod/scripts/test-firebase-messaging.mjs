import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { transformWithEsbuild } from 'vite';

const source = await readFile(new URL('../src/cloud/firebase.js', import.meta.url), 'utf8');
const { code } = await transformWithEsbuild(source.replace(/^import .*;\n/gm, ''), 'firebase.js', { format: 'cjs' });
for (const support of [true, false, 'error']) {
  const instance = {};
  const app = {};
  let initialized = 0;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, config: {},
    getApps: () => [app], getApp: () => app,
    initializeApp: () => { throw Error('must reuse shell Firebase'); },
    getFirestore: () => ({}), getAuth: () => ({}),
    GoogleAuthProvider: class {}, browserLocalPersistence: {},
    setPersistence: async () => {}, createVertexAI: () => ({}),
    isSupported: async () => {
      if (support === 'error') throw Error('IndexedDB unavailable');
      return support;
    },
    getMessaging: supplied => {
      assert.equal(supplied, app);
      initialized++;
      return instance;
    },
  });
  assert.equal(module.exports.messaging, null, 'instance starts empty while support is checked');
  // Let the eager compatibility initialization resolve, including its catch.
  await new Promise(resolve => setImmediate(resolve));
  if (support === true) {
    assert.equal(module.exports.messaging, instance, 'Fuel receives the supported instance through a live export');
    assert.equal(await module.exports.getMessagingIfSupported(), instance);
    assert.equal(initialized, 1, 'shell and Fuel share one instance');
  } else {
    assert.equal(module.exports.messaging, null);
    assert.equal(initialized, 0, 'unsupported browsers never initialize messaging');
    if (support === false) assert.equal(await module.exports.getMessagingIfSupported(), null);
    else await assert.rejects(module.exports.getMessagingIfSupported(), /IndexedDB/);
  }
}
console.log('Shell/Fuel messaging export: supported, unsupported and rejected-support cases pass');
