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
   (nur Service Worker + Manifest-Version, ohne Splash/Icons/HTML: `cli.mjs sw dist --app <id>` — so läuft der Fitness-Haupt-SW;
   nur Splash + Update-Loader in die index.html: `cli.mjs splash dist --app <id>` — für Haupt-Apps, die Manifest und SW-Registrierung selbst verwalten, z. B. Fitness und Fuel)

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
`notificationClick: false` (eingebauten Klick-Handler abschalten, wenn die App ihren eigenen per `extraFile` liefert, z. B. Fuel), `assetFallback: "none"` (offline kein `index.html` für nicht gecachte Assets, sondern Netzwerkfehler),
`neverCache` (Pfade, die der SW gar nicht anfasst, z. B. `/api/`), `navTimeoutMs` (Default 4000; `null` = unbegrenzt aufs Netz warten),
`sync.conflicts` / `sync.conflictMessage` (HTTP 409 in der Queue → als `conflict` markieren, Seiten benachrichtigen),
`notificationLink`, `workoutLink`, `file` (SW-Dateiname, Default `sw.js`), `precacheAssets` (Default `true`: alle `/assets/*` beim Installieren laden; mit `false` abwählbar),
`extras` (Bausteine aus `extras/`, z. B. `"workout-notifications"`), `extraFile` (eigener SW-Code, wird angehängt).
App-Ebene: `html`, `manifest` (Dateiname), `register: true | {expose: true}` (`expose` setzt `window.__swRegistration` + feuert `sw-update-available`).

## Verhalten

- Splash bleibt bis `#root` Inhalt hat (min. 700 ms, Failsafe 12 s); zeigt „Update wird geladen …“ nur in den ersten 10 s.
- SW: Navigation Netz-zuerst (4 s Timeout) → Cache-Fallback; `/assets/*` Cache-zuerst; Skip-Waiting + `GET_VERSION`-Message.
- Jeder Build bekommt einen Zeitstempel (`<prefix>v<build>`), dadurch erkennt der Browser den neuen SW.
- Stempeln ist idempotent (Blöcke zwischen `vos-splash`/`vos-sw-register`-Markern werden ersetzt).

## Umstellung eines bestehenden SW prüfen (Parität)

Alten SW archivieren, Config in `mini-app.json` anlegen, dann:
`node scripts/mini-app-shell/cli.mjs parity --app <id> --old <alter-sw.js> [--ignore Navigation,POST]`
Der alte und der generierte SW laufen in einer `vm`-Sandbox gegen dieselben Szenarien (aus der Config abgeleitet: API-Pfade, Assets, Navigation, POST, Bilder, Fremd-Hosts, Install/Activate/Messages/Listener-Anzahl) und werden verglichen. `--ignore` markiert gewollte Abweichungen. Nicht abgedeckt: Push/Notification-Inhalte und der Queue-Konfliktpfad — die braucht ein eigener Funktionstest (Beispiel: Fuel-Push-Smoke-Test in `~/fuel-dev/RESULTS.md`).
Stand: fitness (`fitness`, `frontend`) und fuel (`fuel`) sind so umgestellt.

## Überblick über alle Repos

`vos-overview` (in `~/vitalos/bin`) zeigt Klone, Pointer, Service Worker und Mini-App-Shell-Drift; Push-Reihenfolge: `vos-overview --plan`.

## Drift

Die Kopien sind generiert: nie in `scripts/mini-app-shell/` editieren, sondern hier ändern und neu `vendor`en.
Prüfen: `node ~/vitalos/packages/mini-app-shell/cli.mjs vendor <ordner> --check` (Exit 1 bei Abweichung).
Tests: `node --test test/`.

## Offline bei Updates

Öffentliche API-Antworten aus `api.swr`/`api.networkFirst` liegen in einem
versionsunabhängigen `<prefix>offline-data-v1`-Cache. Beim ersten Wechsel werden
passende alte API-Antworten übernommen. `neverCache`, Authorization und no-store
bleiben ausgeschlossen. IndexedDB/localStorage werden nicht verändert.
Build-Assets werden standardmäßig vorgeladen. Schlägt die Installation fehl,
bleibt der bisherige Worker aktiv. Alte Build-Caches werden erst nach erfolgreicher
Installation entfernt. Daten- und Bild-Caches bleiben erhalten.
Browser-Speicherlöschung, Quota und nicht zuvor geladene API-Daten sind damit
nicht abgedeckt. Private Daten gehören in die kontogebundene App-Datenschicht.

## Gemeinsamer Changelog-Screen

`vos-changelog-screen.mjs` ersetzt den bisherigen 6Pack-Pilot durch einen
frameworkunabhängigen Dialog. `vos-changelog-vite.mjs` bindet ihn mit einem
Plugin ein, in Dev sowie allen Build-Modi:

```js
import { vosChangelog } from './scripts/vos-changelog/vos-changelog-vite.mjs';
// In plugins:
vosChangelog({ appId: 'habits', appName: 'Habits', accent: '#fb923c' })
```

Standalone-Repos erhalten nur die drei Changelog-Module mit:

```sh
node ~/vitalos/packages/mini-app-shell/cli.mjs vendor-changelog scripts/vos-changelog
node ~/vitalos/packages/mini-app-shell/cli.mjs vendor-changelog scripts/vos-changelog --check
```

Der vollständige `vendor`-Befehl enthält diese Module ebenfalls. Die Shell
nutzt die Quelle direkt; Habits und 6Pack nutzen vendorte Kopien. Andere
Apps können mit demselben Plugin angebunden werden. Kein Laufzeit-React,
Tailwind oder Nachbar-Checkout nötig.

Die Daten stammen aus dem Git-HEAD des gebauten Repos. Ein GitHub-Push-Event
wird nur bei passendem Repository und SHA genutzt; in anderen Fällen
werden die letzten zehn Nicht-Merge-Commits angezeigt. Parent-CI-SHAs
werden dadurch nicht auf Submodule übertragen. Die Daten sind im Build
eingebettet, zusätzlich entsteht `release-info.json`; kein Fetch einer
neueren JSON neben einem älteren gecachten Bundle. Kein Git-HEAD: kein Dialog.

Beim ersten Start und jeder neuen Release-ID erscheint der Dialog.
„Weiter“ oder Escape bestätigt ihn in `<appId>:seen-release`, optional
über `storageKey` überschreibbar. 6Pack behält `sixpack:seen-release`.
Native Dialog-Semantik hält den Tastaturfokus im Dialog; beim Schließen
kehrt er zurück. Blockierter localStorage verhindert die Anzeige nicht.
Texte werden als Text gerendert, Repository-Links nur mit HTTPS.

Tests: `node --test test/`; Integration zusätzlich über die App-Builds prüfen.
