import test from 'node:test';
import assert from 'node:assert/strict';
import { fitnessAssetLinks } from '../scripts/fitness-assetlinks.mjs';

const fingerprint = Array(32).fill('ab').join(':');
test('creates a Digital Asset Links entry for the supplied Android identity', () => {
  const links = fitnessAssetLinks('at.example.fitness', `${fingerprint},${fingerprint.toUpperCase()}`);
  assert.deepEqual(links, [{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: 'at.example.fitness', sha256_cert_fingerprints: [fingerprint.toUpperCase()] } }]);
});
test('rejects missing and malformed package names or fingerprints', () => {
  for (const name of ['', 'fitness', '../private.app', 'At.Example', 'at.example;bad']) assert.throws(() => fitnessAssetLinks(name, fingerprint));
  for (const hash of ['', 'xx:22', Array(31).fill('AA').join(':'), 'A'.repeat(64)]) assert.throws(() => fitnessAssetLinks('at.example.fitness', hash));
});
