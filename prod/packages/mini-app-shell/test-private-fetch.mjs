import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildSw } from './sw.mjs';
const listeners = {};
const sw = buildSw({ appId: 'private-test', version: 'test', sw: { cacheAllSameOrigin: true } });
vm.runInNewContext(sw, {
  self: { registration: { scope: 'https://app.invalid/fitness/' }, location: { origin: 'https://app.invalid' }, addEventListener: (name, callback) => { listeners[name] = callback; } },
  URL,
});
for (const options of [{ headers: { Authorization: 'Bearer private' } }, { cache: 'no-store' }]) {
  let intercepted = false;
  listeners.fetch({ request: new Request('https://app.invalid/fitness/api/sixpack/photos', options), respondWith: () => { intercepted = true; } });
  assert.equal(intercepted, false, 'private fetch must bypass the complete service-worker cache');
}
console.log('Private photo/auth requests bypass service-worker caches.');
