import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildSw } from '../sw.mjs';
import { stampSw } from '../stamp.mjs';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function browser() {
  const stores = new Map();
  const caches = {
    open: async name => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return { keys: async () => [...store.keys()].map(url => new Request(url)), addAll: async () => {}, match: async r => store.get(r.url || r)?.clone(), put: async (r, v) => store.set(r.url || r, v.clone()) };
    },
    keys: async () => [...stores.keys()],
    delete: async name => stores.delete(name),
  };
  function worker(version, fetch) {
    const handlers = {};
    const self = { registration: { scope: 'https://app.test/' }, location: { origin: 'https://app.test' }, addEventListener: (k, v) => handlers[k] = v, skipWaiting() {}, clients: { claim() {} } };
    vm.runInNewContext(buildSw({ appId: 'test', version, sw: { api: { swr: ['/data'], networkFirst: ['/other'] }, neverCache: ['/data/private'] } }), { self, caches, URL, Response, fetch, setTimeout, clearTimeout });
    return handlers;
  }
  return { stores, caches, worker };
}

test('public API reads survive worker replacement; private requests bypass cache', async () => {
  const b = browser();
  const first = b.worker('1', async () => new Response('saved'));
  const request = async (worker, path, options) => {
    let result;
    worker.fetch({ request: new Request('https://app.test' + path, options), respondWith: p => result = p });
    return result;
  };
  for (const path of ['/data', '/other']) assert.equal(await (await request(first, path)).text(), 'saved');
  const legacy = await b.caches.open('vos-test-v1');
  await legacy.put(new Request('https://app.test/data/legacy'), new Response('legacy'));
  await legacy.put(new Request('https://app.test/data/private'), new Response('private'));
  const second = b.worker('2', async () => { throw Error('offline'); });
  let activation;
  second.activate({ waitUntil: p => activation = p });
  await activation;
  assert.equal(b.stores.has('vos-test-v1'), false);
  assert.equal(await (await request(second, '/data/legacy')).text(), 'legacy');
  assert.equal(await (await b.caches.open('vos-test-offline-data-v1')).match(new Request('https://app.test/data/private')), undefined);
  for (const path of ['/data', '/other']) assert.equal(await (await request(second, path)).text(), 'saved');
  for (const options of [{ headers: { Authorization: 'Bearer token' } }, { cache: 'no-store' }]) assert.equal(await request(second, '/data', options), undefined);
  assert.equal(await request(second, '/data/private'), undefined);
});

test('failed installation never skips waiting', async () => {
  let skipped = false, installation;
  const handlers = {};
  vm.runInNewContext(buildSw({ appId: 'test', version: '2' }), {
    URL, self: { registration: { scope: 'https://app.test/' }, addEventListener: (k,v) => handlers[k] = v, skipWaiting: () => skipped = true },
    caches: { open: async () => ({ addAll: async () => { throw Error('download failed'); } }) },
  });
  handlers.install({ waitUntil: p => installation = p });
  await assert.rejects(installation, /download failed/);
  assert.equal(skipped, false);
});

test('build precaches assets by default', () => {
  const out = mkdtempSync(join(tmpdir(), 'vos-offline-'));
  mkdirSync(join(out, 'assets'));
  writeFileSync(join(out, 'assets', 'lazy-123.js'), 'export {}');
  stampSw({ outDir: out, app: { id: 'test', sw: {} }, log() {} });
  assert.match(readFileSync(join(out, 'sw.js'), 'utf8'), /\.\/assets\/lazy-123.js/);
});
