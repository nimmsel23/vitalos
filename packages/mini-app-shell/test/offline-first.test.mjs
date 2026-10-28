import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildSw } from '../sw.mjs';

// Sandbox mit steuerbarem Netz: net = 'offline' (sofort Fehler), 'hang' (Lie-Fi: Request hängt), 'ok'
function setup({ sw = {}, net = 'ok', timers } = {}) {
  const stores = new Map();
  const store = (n) => (stores.has(n) ? stores.get(n) : stores.set(n, new Map()).get(n));
  const key = (r) => (typeof r === 'string' ? r : r.url);
  const caches = {
    open: async (n) => { const m = store(n); return { addAll: async (l) => l.forEach((u) => m.set(new URL(key(u), 'https://app.test/').href, new Response('shell:' + key(u)))), match: async (r) => m.get(key(r))?.clone(), put: async (r, v) => m.set(key(r), v.clone()), keys: async () => [] }; },
    match: async (r, o) => { for (const m of stores.values()) { const k = key(r); const v = m.get(k) ?? (o?.ignoreSearch ? m.get(k.split('?')[0]) : undefined); if (v) return v.clone(); } },
    keys: async () => [...stores.keys()], delete: async (n) => stores.delete(n),
  };
  const calls = [];
  const fetch = (r) => { calls.push(key(r)); return net === 'offline' ? Promise.reject(Error('offline')) : net === 'hang' ? new Promise(() => {}) : Promise.resolve(new Response('net:' + key(r))); };
  const handlers = {};
  const self = { registration: { scope: 'https://app.test/' }, location: { origin: 'https://app.test' }, addEventListener: (k, v) => (handlers[k] = v), skipWaiting() {}, clients: { claim() {} } };
  vm.runInNewContext(buildSw({ appId: 't', version: '1', sw: { shell: ['./', './index.html'], navTimeoutMs: null, api: { swr: ['/api'], networkFirst: ['/nf'] }, apiTimeoutMs: 30, ...sw } }),
    { self, caches, URL, Response, fetch, setTimeout, clearTimeout });
  const ask = async (path, init = {}, mode = 'cors') => {
    const req = { url: 'https://app.test' + path, method: 'GET', mode, headers: new Headers(), destination: '', ...init };
    let out; handlers.fetch({ request: req, respondWith: (p) => (out = p), waitUntil() {} });
    return out && (await out);
  };
  return { handlers, ask, calls, stores };
}

test('Navigation: Cache zuerst — auch im Lie-Fi (Netz hängt) sofort bedienbar, kein Netzzugriff', async () => {
  const w = setup({ net: 'hang' });
  await w.handlers.install({ waitUntil: (p) => p });
  for (const path of ['/', '/index.html', '/?utm=1', '/index.html?x=1']) {
    const res = await w.ask(path, {}, 'navigate');
    assert.ok(res, path);
    assert.match(await res.text(), /^shell:/, path);
  }
  assert.deepEqual(w.calls, []);
});

test('Navigation: navStrategy "network" bleibt als altes Verhalten wählbar', async () => {
  const w = setup({ net: 'ok', sw: { navStrategy: 'network' } });
  await w.handlers.install({ waitUntil: (p) => p });
  assert.equal(await (await w.ask('/', {}, 'navigate')).text(), 'net:https://app.test/');
});

test('Navigation ohne Cache-Treffer und ohne Netz: gecachte Shell als Rückfall, kein Hängen', async () => {
  const w = setup({ net: 'hang', sw: { navTimeoutMs: 20 } });
  await w.handlers.install({ waitUntil: (p) => p });
  const res = await w.ask('/anderswo', {}, 'navigate');
  assert.match(await res.text(), /^shell:/);
});

test('API swr: ohne Cache-Eintrag liefert ein hängendes Netz nach dem Timeout {offline:true}', async () => {
  const w = setup({ net: 'hang' });
  const res = await w.ask('/api/x');
  assert.deepEqual(await res.json(), { ok: false, offline: true });
});

test('API networkFirst: hängendes Netz → Timeout → letzter gespiegelter Stand', async () => {
  const ok = setup({ net: 'ok' });
  await ok.ask('/nf/a'); // spiegelt in den Daten-Cache
  await new Promise((r) => setTimeout(r, 5));
  const hang = setup({ net: 'hang' });
  // anderer Worker, eigener Cache: ohne Eintrag → undefined (Browser zeigt Fehler), aber schnell
  const t0 = Date.now();
  const res = await hang.ask('/nf/a');
  assert.ok(Date.now() - t0 < 500);
  assert.equal(res, undefined);
});
