# Shell-Service-Worker + Splash

Aus `CLAUDE.md` ausgelagert.

### Shell-Service-Worker + Splash (seit 2026-10-16)

- `public/sw.js` gibt es nicht mehr (archiviert: `docs/archive/sw.vitalos-main-v1.js`). Der SW wird beim Build aus **`mini-app.json`** (App `vitalos`) und `packages/mini-app-shell` erzeugt (`pnpm run build:firebase` / `build` → `stamp:sw`: `cli.mjs sw` + `cli.mjs splash`); dabei kommt auch die SW-Registrierung samt `window.__swRegistration` und `sw-update-available` (Settings-Update-Banner) in die `index.html` — die Inline-Registrierung im Quell-HTML ist entfernt.
- Gefundene Fehler des alten Shell-SW (Kopie des Fitness-SW): (1) `STATIC` enthielt `/offline-queue.js`, das in der Shell nicht existiert → `cache.addAll` schlug immer fehl, die Shell wurde nie vorab gecacht; (2) `activate` löschte bei jedem Update den Übungsbilder-Cache `fitness-exercise-images` (Atlas-Spiegel, ~100 MB) und der SW lieferte ihn nie aus; (3) Workout-Benachrichtigungen (`SHOW_WORKOUT_TIMER_NOTIFICATION` aus den eingebetteten Fitness-Views) und `notificationclick` fehlten; (4) `window.__swRegistration`/`sw-update-available` wurden nie gesetzt → Update-Banner und „App aktualisieren" ohne Wirkung; (5) kein `no-cache`-Header für `/sw.js` und `manifest.json` in `firebase.json`.
- Paritätstest alt↔neu: `node packages/mini-app-shell/cli.mjs parity --app vitalos --old docs/archive/sw.vitalos-main-v1.js --ignore activate,install-Precache,Listener,offline-queue.js,"Bild cdn.jsdelivr.net","Workout-Notification (alt)"` → 0 ungewollte Abweichungen (die ignorierten sind genau die behobenen Fehler). Nicht auf einem Gerät getestet.
- Splash: Icon `/icon-192.png`, Akzent `#6ee7b7`, Hintergrund `#0b0e14`.
- `bin/vos-authdomains`: gleicht die Firebase-Auth-Domains mit allen Hosting-Sites/aktiven Preview-Channels ab (`--apply` fügt nur hinzu; Wildcards gibt es nicht). Nach jedem neuen Preview-Channel-Namen laufen lassen.
