// v5: Unterpfad-Mini-Apps (fitness-vos.web.app/<id>/) werden nicht angefasst: sonst landet ihr HTML als Pulse-index.html im Cache.
// v4: index.html war cache-first und blieb in installierten iOS-Web-Apps auf altem Stand;
// nach einem Deploy fehlten dann die alten Chunk-Hashes (schwarzer Bildschirm beim ersten
// Tab-Wechsel). Neuer Name löscht den alten Cache beim Activate.
const CACHE = "fitness-vos-v5";
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const withBase = (path) => `${BASE_PATH}${path}`;
const STATIC_ASSETS = [withBase("/"), withBase("/index.html"), withBase("/manifest.json")];
const API_PATHS = ['/session', '/coverage', '/fitness/weekly', '/fitness/body', '/plan/today', '/blocks', '/health'];

// Mini-Apps als Unterpfade derselben Origin haben einen eigenen SW (Scope /<id>/); hier komplett raus.
const SUBAPPS = /^\/(training|logbuch|review|atlas|touren|setup|anamnese|fokus)(\/|$)/;

const stripBase = (pathname) => {
  if (pathname.startsWith(BASE_PATH + "/")) return pathname.slice(BASE_PATH.length);
  if (pathname === BASE_PATH) return "/";
  return pathname;
};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (e) => {
  if (!e.data) return;
  if (e.data.type === "SKIP_WAITING") self.skipWaiting();
  if (e.data.type === "GET_VERSION" && e.source) {
    e.source.postMessage({ type: "VERSION", version: CACHE });
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const cleanPath = stripBase(url.pathname);
  if (SUBAPPS.test(cleanPath)) return;
  const isApi = API_PATHS.some((p) => cleanPath.startsWith(p));

  if (isApi) {
    event.respondWith(fetch(event.request).then((response) => {
      if (event.request.method === "GET" && response.ok) {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request)));
  } else if (event.request.mode === "navigate" || cleanPath === "/" || cleanPath === "/index.html" || cleanPath === "/manifest.json") {
    // HTML immer zuerst vom Netz (aktueller Chunk-Stand), Cache nur als Offline-Fallback.
    event.respondWith(fetch(event.request).then((response) => {
      if (event.request.method === "GET" && response.ok) {
        const clone = response.clone();
        const isHtml = cleanPath !== "/manifest.json";
        caches.open(CACHE).then((cache) => cache.put(isHtml ? withBase("/index.html") : event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request).then((c) => c || caches.match(withBase("/index.html")))));
  } else {
    // Gehashte Assets sind unveränderlich: Cache zuerst. Nur echte Treffer cachen — eine
    // HTML-Antwort (Hosting-Rewrite) auf eine fehlende JS-Datei darf nicht gespeichert werden.
    event.respondWith(caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const type = response.headers.get("content-type") || "";
        const isAsset = /\.(js|css|woff2?|png|svg|json)$/.test(cleanPath);
        if (event.request.method === "GET" && response.ok && !(isAsset && type.includes("text/html"))) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }));
  }
});
