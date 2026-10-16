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

## Migriert (alles committed auf den kanonischen `dev`-Branches, NICHTS gepusht)

Kanonisch ist je Modul `~/<m>-dev` auf `dev` (so arbeitet `vos-release`). Die Kopien unter `~/fitness-dev/{6pack,coach,plan}`
(nested Submodule, Branch `master`) sind Nebenlinien auf alter Basis — siehe „Wildwuchs“ unten.

| Repo (Branch) | Commit(s) | Stand |
|---|---|---|
| `~/fitness-dev` (dev) | `d71ddcb`, `5b461b5` | training/atlas: `stamp-training.mjs` → `stampApp` (SW bleibt Haupt-SW, `mode: keep`); `solo-splash.mjs` = Shim; vendored Paket aktuell |
| `~/6pack-dev` (**dev**, nicht der WIP-Branch `agent/photo-auth`) | `34a2c8c`, `7049696` | Splash/Register/SW generiert, `npm run build` stempelt; via temporärem Worktree auf `dev` gebracht, damit die fremde Arbeit in `~/6pack-dev` unberührt blieb. Lokales `dev` dafür auf `origin/dev` vorgespult |
| `~/coach-dev` (dev) | `7500de0` | `coach-sw.js` (Dateiname + Präfix `vos-coach-` bleiben), Precache aller Assets, Register mit `window.__swRegistration`; Build geprüft |
| `~/plan-dev` (dev) | `67e3c8f` | `plan-sw.js` (Name + Präfix bleiben), Cache jetzt pro Build versioniert (vorher statisch `vos-plan-v1` → Updates nicht erkennbar), Workout-Notifications-Extra; Build geprüft |

Alle vier Repos: gebaut, `node --check` auf den generierten SW, Splash/Register im `index.html` genau einmal.

## Wildwuchs (Befund, mit `vos-overview` jederzeit prüfbar)

Jedes Modul existiert bis zu **dreimal**:
`~/<m>-dev` (dev, kanonisch) · `~/vitalos/<m>-app` (Branch `vitalos`, Build/CI) · nur 6pack/coach/plan zusätzlich `~/fitness-dev/<m>` (nested, `master`).
Mein erster Anlauf für plan/coach landete versehentlich auf den nested-Kopien (alte Basis; die echte Plan-/Coach-Arbeit von gestern liegt in
`~/plan-dev`/`~/coach-dev`). Auf User-Wunsch sind die nested Kopien jetzt **lokale Branches**: Branch `lokal` (ohne Upstream) trägt je 1 Commit (`6pack 59f832a`, `coach 92414ca`, `plan 5bd9dd1`, überholt aber erhalten);
`master` zeigt wieder auf `origin/master`. Nichts davon wird gepusht; `vos-overview` meldet `lokal*` als gewollt.

## vos-release für plan/coach (wie fitness: dev → vitalos)

Flow unverändert: `dev` pushen → in `~/vitalos/<m>-app` `origin/dev` in `vitalos` mergen → push → Pointer bumpen. Neu in `vos-release`:
- **Preflight** vor dem ersten Push (`git merge-tree`, lesend): Konflikte werden vorab gemeldet, bei unlösbaren wird nichts gepusht.
- Konflikte in `.githooks/*` löst es zugunsten von **dev** ("-dev nach -app"); sonst `git merge --abort` statt halb gemergtem Submodul.
- Befund: plan und coach haben genau EINEN Konflikt (`.githooks/pre-push`; die `vitalos`-Variante ist app-spezifisch, die dev-Variante bei plan eine Kopie des Fitness-Hooks inkl. KB-Push). Nach dem ersten Release gewinnt dev; der Fitness-spezifische KB-Block läuft dann auch aus plan-app — ggf. in plan-dev bereinigen.

## Neu: `~/vitalos/bin/vos-overview` (nur lesen)

Adlerblick über alle Klone (Branch, Sync, Dirty, geteilte .git), Pointer (ok/stale/**local-only** = CI-Falle „not our ref“), Branch-Verhältnis
dev/master/vitalos, alle Service Worker (Kopien erkannt, mini-app-shell-Drift) und eine abgeleitete Push-Reihenfolge. `--sw`, `--plan`, `--fetch`, `--json`.
Ausführen tut es nichts — das bleibt `vos-release` (existiert schon, deckt alle 9 Module ab).

## Offen

1. **Pushen** (wartet auf den User, 6pack-Push = Live-Deploy). Reihenfolge laut `vos-overview --plan`; `fitness-dev` ist durch fremde WIP (`backend/pusher/` u. a.) für `vos-release` blockiert; `~/6pack-dev` steht auf `agent/photo-auth`.
2. **fuel-dev** hat das Paket schon vendored (Kollege) — Stand jetzt veraltet → `node ~/vitalos/packages/mini-app-shell/cli.mjs vendor <fuel-dev>/scripts/mini-app-shell` (oder `vos-overview --sw` zeigt „Drift“).
3. **SW abstimmen:** `vos-overview --sw` zeigt 6 identische Kopien des Fitness-Haupt-SW (u. a. `plan-dev/public/sw.js`, `coach-dev/public/sw.js`, in den nested Kopien) und mehrfach `fitness-v0`/`fuel-v0` als Cache-Präfix. Nächster Schritt: Haupt-SW von fitness selbst auf `sw-template` + Extras umstellen, fuel (`fuel-dev/public/sw.js`, `frontend/public/sw.js`, `vitalos/fuel-os`) anbinden, tote `public/sw.js` in plan/coach entfernen.
4. relax / habits / journal / learn bleiben bei workbox / `useRegisterSW` (Lean Apps, laut `vitalos/CLAUDE.md` bewusst).
5. Nicht auf Gerät getestet — vor dem Push SW-Update einmal an einer installierten PWA prüfen.
