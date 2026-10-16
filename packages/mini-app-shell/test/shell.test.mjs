import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import vm from "node:vm";
import { injectSplash, splashSnippets } from "../splash.mjs";
import { buildSw } from "../sw.mjs";
import { injectRegister } from "../register.mjs";
import { stampApp, stampSplash } from "../stamp.mjs";

const HTML = `<!doctype html><html><head><title>X</title></head><body><div id="root"></div></body></html>`;

test("Splash: idempotent, Name wird escaped, Pflichtfelder", () => {
  const a = injectSplash(HTML, { name: 'Pl"an', accent: "#fff" });
  const b = injectSplash(a, { name: 'Pl"an', accent: "#fff" });
  assert.equal(a, b);
  assert.equal(a.match(/vos-splash:start/g).length, 2); // head + body
  assert.ok(a.includes("Pl&quot;an"));
  assert.throws(() => splashSnippets({ name: "x" }), /Pflicht/);
});

test("Splash: Skript-Teil ist gültiges JS", () => {
  const { body } = splashSnippets({ name: "Fuel", accent: "#0f0", rootId: "app" });
  const js = body.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(() => new vm.Script(js));
  assert.ok(js.includes('getElementById("app")'));
});

test("SW: generiert gültiges JS, Config + Extra eingesetzt, kein Platzhalter übrig", () => {
  const src = buildSw({
    appId: "fuel",
    version: "abc",
    sw: { api: { swr: ["/fuel"] }, sync: { tag: "fuel-flush", db: "aos-offline-fuel" } },
    extra: "self.__extra = '$&'",
  });
  assert.doesNotThrow(() => new vm.Script(src));
  assert.ok(src.includes('"cache": "vos-fuel-vabc"'));
  assert.ok(src.includes("self.__extra = '$&'")); // $-Muster bleiben unverändert
  assert.ok(!src.includes("__VOS_"));
});

test("SW: install/activate/fetch laufen in einer Sandbox", async () => {
  const src = buildSw({ appId: "t", version: "1", sw: { api: { swr: ["/api"] } } });
  const handlers = {};
  const store = new Map();
  const caches = {
    open: async () => ({ addAll: async () => {}, put: async (r, v) => store.set(r.url ?? r, v), match: async (r) => store.get(r.url ?? r) }),
    keys: async () => ["vos-t-v0", "vos-t-v1", "other-app"],
    delete: async (k) => { deleted.push(k); },
    match: async () => undefined,
  };
  const deleted = [];
  const ctx = {
    self: { registration: { scope: "https://x.test/app/" }, location: { origin: "https://x.test" }, addEventListener: (t, f) => (handlers[t] = f), skipWaiting() {}, clients: { claim: async () => {} } },
    caches, URL, Response, Request, fetch: async () => new Response("{}"), indexedDB: {}, setTimeout, clearTimeout, console,
  };
  vm.runInNewContext(src, ctx);
  assert.deepEqual(Object.keys(handlers).sort(), ["activate", "fetch", "install", "message", "notificationclick"]);
  let p; handlers.activate({ waitUntil: (x) => (p = x) });
  await p;
  assert.deepEqual(deleted, ["vos-t-v0"]); // alte Version weg, fremde App + aktuelle bleiben
  // Nicht-GET wird nicht abgefangen
  let responded = false;
  handlers.fetch({ request: { method: "POST", url: "https://x.test/app/api" }, respondWith: () => (responded = true) });
  assert.equal(responded, false);
  // API unter Präfix /app → swr greift auf "/api" (Scope-relativ)
  handlers.fetch({ request: { method: "GET", url: "https://x.test/app/api", mode: "cors" }, respondWith: () => (responded = true) });
  assert.equal(responded, true);
});

test("Register: idempotent vor </body>", () => {
  const a = injectRegister(HTML, {});
  assert.equal(a, injectRegister(a, {}));
  assert.ok(a.indexOf("serviceWorker") < a.indexOf("</body>"));
});

test("stampApp: Manifest, Titel, Splash, SW, Icons im Build-Output", () => {
  const dir = mkdtempSync(join(tmpdir(), "vos-shell-"));
  const out = join(dir, "dist");
  const icons = join(dir, "icons");
  mkdirSync(out); mkdirSync(icons);
  writeFileSync(join(out, "index.html"), HTML.replace("<title>X</title>", '<title>X</title><link rel="apple-touch-icon" href="/a.png">'));
  writeFileSync(join(out, "manifest.webmanifest"), JSON.stringify({ name: "alt", icons: [] }));
  for (const f of ["icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "icon.svg"]) writeFileSync(join(icons, f), "x");
  const app = { id: "plan", name: "VitalOS Plan", short: "Plan", accent: "#5b8cff", iconDir: "icons", register: true };
  stampApp({ outDir: out, app, root: dir, log: () => {} });
  const m = JSON.parse(readFileSync(join(out, "manifest.webmanifest"), "utf8"));
  assert.equal(m.short_name, "Plan");
  assert.equal(m.icons.length, 3);
  const html = readFileSync(join(out, "index.html"), "utf8");
  assert.ok(html.includes("<title>Plan - VitalOS</title>"));
  assert.ok(html.includes("./icon-180.png") && html.includes("vos-splash") && html.includes("sw.js"));
  assert.ok(existsSync(join(out, "sw.js")) && existsSync(join(out, "favicon.svg")));
  // zweiter Lauf ändert die Struktur nicht (keine doppelten Snippets)
  stampApp({ outDir: out, app, root: dir, log: () => {} });
  const html2 = readFileSync(join(out, "index.html"), "utf8");
  assert.equal(html2.match(/vos-splash:start/g).length, 2);
  assert.equal(html2.match(/vos-sw-register:start/g).length, 1);
});

test("SW: extra workout-notifications eingebunden + lauffähig, Build-Optionen nicht in der Config", async () => {
  const src = buildSw({ appId: "p", version: "1", sw: { extras: ["workout-notifications"], file: "x.js", precacheAssets: true } });
  assert.doesNotThrow(() => new vm.Script(src));
  assert.ok(src.includes("SHOW_WORKOUT_TIMER_NOTIFICATION"));
  const cfg = src.slice(src.indexOf("const CFG = {"), src.indexOf("const CACHE"));
  assert.ok(!cfg.includes("precacheAssets") && !cfg.includes("extras") && !cfg.includes('"file"'));
  assert.throws(() => buildSw({ appId: "p", version: "1", sw: { extras: ["gibt-es-nicht"] } }), /nicht gefunden/);
});

test("Register: expose setzt window.__swRegistration, Reload nur im Startfenster", () => {
  const a = injectRegister(HTML, { exposeRegistration: true, swUrl: "./coach-sw.js" });
  assert.ok(a.includes("window.__swRegistration") && a.includes("sw-update-available") && a.includes("coach-sw.js"));
  const js = a.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(() => new vm.Script(js));
  assert.ok(a.includes("> 10000"));
  assert.ok(!injectRegister(HTML, {}).includes("__swRegistration"));
});

test("stampApp: eigener SW-Dateiname, fremdes Manifest, Precache der Assets, Start/Scope nur wenn gesetzt", () => {
  const dir = mkdtempSync(join(tmpdir(), "vos-shell-"));
  const out = join(dir, "dist");
  mkdirSync(join(out, "assets"), { recursive: true });
  writeFileSync(join(out, "index.html"), HTML);
  writeFileSync(join(out, "assets", "a-123.js"), "x");
  writeFileSync(join(out, "coach-manifest.webmanifest"), JSON.stringify({ name: "alt", start_url: "/", scope: "/" }));
  const app = { id: "coach", name: "VitalOS Coach", short: "Coach", accent: "#a78bfa", manifest: "coach-manifest.webmanifest", register: { expose: true },
    splash: { icon: "./coach-icon-192.png" }, sw: { file: "coach-sw.js", prefix: "vos-coach-", precacheAssets: true, shell: ["./index.html"] } };
  stampApp({ outDir: out, app, root: dir, log: () => {} });
  const m = JSON.parse(readFileSync(join(out, "coach-manifest.webmanifest"), "utf8"));
  assert.equal(m.short_name, "Coach");
  assert.equal(m.start_url, "/"); // unverändert
  const sw = readFileSync(join(out, "coach-sw.js"), "utf8");
  assert.ok(sw.includes("./assets/a-123.js") && sw.includes('"prefix": "vos-coach-"'));
  assert.ok(!existsSync(join(out, "sw.js")));
  const html = readFileSync(join(out, "index.html"), "utf8");
  assert.ok(html.includes("coach-sw.js") && html.includes("coach-icon-192.png"));
});

test("stampSplash: nur Splash in index.html, idempotent, eigenes Icon", () => {
  const dir = mkdtempSync(join(tmpdir(), "vos-shell-"));
  writeFileSync(join(dir, "index.html"), HTML);
  const app = { short: "Fuel", accent: "#fb923c", splash: { icon: "./icons/icon-192.png" } };
  stampSplash({ outDir: dir, app, log: () => {} });
  const once = readFileSync(join(dir, "index.html"), "utf8");
  stampSplash({ outDir: dir, app, log: () => {} });
  assert.equal(once, readFileSync(join(dir, "index.html"), "utf8"));
  assert.ok(once.includes("./icons/icon-192.png") && once.includes("Fuel") && once.includes("vos-splash"));
  assert.ok(!once.includes("serviceWorker.register")); // keine SW-Registrierung — das macht die App selbst
  assert.throws(() => stampSplash({ outDir: dir, app: { short: "X" }, log: () => {} }), /Pflicht/);
});
