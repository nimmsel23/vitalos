# REPORT — Mini-App-Shell (Splash + Service Worker universalisiert)

Stand 2026-10-16, Claude (Pane rechts oben) → Kollege (Pane links). Auftrag des Users: SW und Splash der gestern
aus Fitness ausgelagerten Mini-Apps (training, atlas, 6pack, plan, coach) universalisieren, damit weitere Mini-Apps
aus fitness / fuel / relax (und mehr) sie ohne Kopieren bekommen.

## Was jetzt da ist

**SSOT:** `~/vitalos/packages/mini-app-shell/` (`@vos/mini-app-shell`, ohne Dependencies, Node-ESM). Doku: `README.md`.

| Datei | Zweck |
|---|---|
| `splash.mjs` | Splash + Update-Loader (aus `fitness-dev/scripts/solo-splash.mjs` verallgemeinert; Optionen bg/fg/rootId/minMs/…; Name HTML-escaped; Einsetzen jetzt wirklich idempotent) |
| `sw-template.js` + `sw.mjs` | generischer SW, gespeist aus `mini-app.json` (Navigation Netz-zuerst, Assets Cache-zuerst, API swr/networkFirst, Bilder-Cache, optional Background-Sync, notificationclick, SKIP_WAITING/GET_VERSION, `extraFile` für App-Spezifisches) |
| `register.mjs` | SW-Registrierung, Reload nur bei Update |
| `stamp.mjs` | `stampApp()`: Icons, Manifest, Titel `<short> - VitalOS`, iOS-Meta, Splash, Register, sw.js — nur im Build-Output |
| `cli.mjs` | `stamp <outDir> --app <id>` und `vendor <ziel> [--check]` |
| `test/shell.test.mjs` | 6 Tests (`node --test test/`), u. a. SW in vm-Sandbox, Idempotenz |

## Warum „vendor“ statt Import aus vitalos

Consumer-Repos bauen standalone (6pack deployt per GitHub Action nur aus dem eigenen Repo, `npm ci`, **ohne** vitalos).
Ein Import aus `~/vitalos/packages` würde den Live-Deploy brechen — das Muster von `cross-app-aliases` (nur nested sichtbar)
trägt hier nicht. Deshalb: Paket wird per `cli.mjs vendor <ordner>` ins Repo kopiert, `--check` meldet Drift.
Das ist bewusste, kontrollierte Duplizierung (vitalos-Regel „Kein Doppel-Code“ → Ausnahme, hier dokumentiert).
Das Paket ist **nicht** in `pnpm-workspace.yaml` eingetragen (würde Lockfile-Drift in der CI auslösen).

## Migriert (committed, NICHT gepusht)

- **6pack** (`~/fitness-dev/6pack`, Commit `59f832a`): `scripts/mini-app-shell/` + `mini-app.json`; `npm run build` stempelt Splash,
  Register und generierten `sw.js` (`vos-6pack-v<build>`); Inline-Splash/-Register aus `index.html` entfernt; alter
  `public/sw.js` → `docs/archive/sw.static-v1.js`. Build grün (`npm run build`), `dist/sw.js` Syntax ok.
  Unterschied zum alten SW: `activate` räumt nur Caches mit Präfix `vos-6pack-` (vorher alle fremden).
- **fitness-dev Solo-Builds training/atlas** (Commit `d71ddcb`): `scripts/stamp-training.mjs` ruft `stampApp` (SW bleibt der
  Haupt-SW → `mode: "keep"`, `stamp-sw.mjs` versioniert ihn weiter); `scripts/solo-splash.mjs` ist Shim mit altem Import-Pfad.
  An Kopie von `dist-atlas` getestet (Manifest, Icons, Splash identisch zu vorher bis auf Kommentar/Quote-Stil).
  `package.json`-Scripts in fitness-dev unverändert. Dabei nur eigene Dateien gestaged — die ungestagte Arbeit im Repo
  (`backend/pusher/`, `NEXT.md`, `RESULTS.md`, `NotificationsSection.jsx`, `pyproject.toml`) ist **nicht** von mir.

## Offen / nicht gemacht

1. **Pointer-Bump:** `fitness-dev` zeigt noch auf den alten 6pack-Commit (`6pack`-Submodul → `59f832a`); danach ggf. `vitalos` bumpen. Push/Merge wartet auf den User (AGENTS.md: nie auto-push; 6pack-Push = Live-Deploy).
2. **plan / coach** (`fitness-dev/plan`, `coach`) haben noch ihre kopierten 235-Zeilen-SWs und eigene Inline-Splashes (`coach.html`). Nicht migriert, weil sie den Haupt-SW samt Push-/Workout-Code duplizieren — Kandidaten für `sw.extraFile` + `stampApp`. Erst klären, was davon wirklich gebraucht wird.
3. **fuel / relax:** noch nicht angebunden. fuel-dev hat einen eigenen 54-Zeilen-SW (`frontend/public/sw.js`, API-Pfade `/fuel/ /nutrition/ /supplements/` → `sw.api.networkFirst`), relax-dev nutzt `vite-plugin-pwa`/workbox (SW dort generiert → nur Splash + Stamp mit `sw: {mode:"keep"}` sinnvoll). Lean Apps (journal/habit/fuel-app) laufen laut `vitalos/CLAUDE.md` bewusst mit `useRegisterSW()`; nicht überschreiben.
4. **Icon-Generator:** `fitness-dev/scripts/solo-icons.py` ist weiter fitness-lokal (Icons je Mini-App). Wäre der nächste Schritt zum Mitverallgemeinern.
5. **Nicht im Browser getestet:** SW-Verhalten ist per vm-Sandbox + Syntaxcheck geprüft, nicht auf einem Gerät. Vor Push von 6pack einmal `npm run preview` und Update-Szenario (zweiter Build über installierte PWA) ansehen.
6. Das Paket selbst ist in `~/vitalos` committed (nur `packages/mini-app-shell/`), nicht gepusht.
