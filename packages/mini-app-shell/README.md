# @vos/mini-app-shell

Ein gemeinsamer Baustein für alle VitalOS-Mini-Apps (fitness: training/atlas/6pack/plan/coach, später fuel, relax, …):
**Splash + Update-Loader**, **generischer Service Worker**, **SW-Register-Snippet**, **Stamp-CLI** (Manifest, Titel, Icons).
Keine Abhängigkeiten, reines Node-ESM. Wirkt nur auf den Build-Output, nie auf `public/`.

## Neue Mini-App anbinden (3 Schritte)

1. Paket ins Repo kopieren (Consumer bauen standalone, z. B. per GitHub Action ohne vitalos):
   `node ~/vitalos/packages/mini-app-shell/cli.mjs vendor scripts/mini-app-shell`
2. `mini-app.json` im Repo-Root:
   ```json
   { "apps": { "relax-timer": {
       "name": "VitalOS Relax Timer", "short": "Timer", "accent": "#7c5cff",
       "iconDir": "solo-icons/relax-timer", "register": true,
       "sw": { "api": { "swr": ["/relax/today"] }, "shell": ["./", "./index.html", "./manifest.json", "./icon-192.png"] }
   } } }
   ```
3. Build-Script: `vite build && node scripts/mini-app-shell/cli.mjs stamp dist --app relax-timer`

Der HTML-Root-Container muss `id="root"` haben (sonst `splash: { "rootId": "app" }`).

## Konfiguration (`apps.<id>`)

| Feld | Bedeutung |
|---|---|
| `name`, `short`, `accent` | Pflicht. Manifest-Name, Kurzname (Titel `<short> - VitalOS`, Splash), Akzentfarbe |
| `iconDir` | Ordner mit `icon-180/192/512.png`, `icon-maskable-512.png`, `icon.svg`; fehlt er, bleiben vorhandene Icons |
| `start`, `scope` | Default `./`; Firebase-Sites am Root: `"/#session"`, `"/"` |
| `register` | `true` → SW-Registrierung (Reload nur bei Update, nicht bei Erstinstallation) einsetzen |
| `splash` | `false` = aus, Objekt = Overrides (`bg`, `fg`, `rootId`, `minMs`, `failsafeMs`, `updateText`) |
| `sw` | `false`/`{mode:"keep"}` = vorhandenen SW lassen; sonst generieren (s. u.) |

`sw`-Optionen: `prefix` (Default `vos-<id>-`; nur solche Caches räumt activate ab), `shell`, `api.swr` / `api.networkFirst`
(Pfade relativ zum Scope), `imageCaches` (`[{cache, hosts}]`, überlebt Updates), `keepCaches`, `assetsPath`,
`cacheAllSameOrigin`, `navTimeoutMs`, `sync` (`{tag, db}` → Background-Sync der IndexedDB-Queue),
`notificationLink`, `workoutLink`, `file` (SW-Dateiname, Default `sw.js`), `precacheAssets` (alle `/assets/*` beim Installieren laden),
`extras` (Bausteine aus `extras/`, z. B. `"workout-notifications"`), `extraFile` (eigener SW-Code, wird angehängt).
App-Ebene: `html`, `manifest` (Dateiname), `register: true | {expose: true}` (`expose` setzt `window.__swRegistration` + feuert `sw-update-available`).

## Verhalten

- Splash bleibt bis `#root` Inhalt hat (min. 700 ms, Failsafe 12 s); zeigt „Update wird geladen …“ nur in den ersten 10 s.
- SW: Navigation Netz-zuerst (4 s Timeout) → Cache-Fallback; `/assets/*` Cache-zuerst; Skip-Waiting + `GET_VERSION`-Message.
- Jeder Build bekommt einen Zeitstempel (`<prefix>v<build>`), dadurch erkennt der Browser den neuen SW.
- Stempeln ist idempotent (Blöcke zwischen `vos-splash`/`vos-sw-register`-Markern werden ersetzt).

## Überblick über alle Repos

`vos-overview` (in `~/vitalos/bin`) zeigt Klone, Pointer, Service Worker und Mini-App-Shell-Drift; Push-Reihenfolge: `vos-overview --plan`.

## Drift

Die Kopien sind generiert: nie in `scripts/mini-app-shell/` editieren, sondern hier ändern und neu `vendor`en.
Prüfen: `node ~/vitalos/packages/mini-app-shell/cli.mjs vendor <ordner> --check` (Exit 1 bei Abweichung).
Tests: `node --test test/`.
