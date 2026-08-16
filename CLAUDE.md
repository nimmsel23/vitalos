# VitalOS Shell

VitalOS ist die übergreifende App-Shell die alle VOS-Module (fitness-app, fuel-app, journal-app, habit-app, learn-dev) zusammenhält.

**Port Dev:** 9190 (`npm run dev`)
**Build:** `npm run build` (local) / `npm run build -- --mode firebase` (Firebase PWA)

---

## src/ Struktur

`src/` ist der shared Layer — er kennt alle Sub-Repos und hält sie zusammen.

```
vitalos/src/
├── coach/              ← lokale DB + API (kein Firebase-Import)
│   ├── db.js           → re-exportiert @fitness-db + @journal + @habits
│   └── api.js
├── cloud/              ← Firebase only (kein lokaler Code)
│   ├── db.firestore.js
│   └── firebase.js
├── shell/              ← vitalorisierte App-Shell (SSOT)
│   ├── layout/         Navigation, Sidebar, MobileShell
│   ├── Settings/       Settings-Tab (vitalos-eigener SOT)
│   ├── themes.js       Theme-Registry SSOT (bg/accent je Theme, 40 Themes)
│   ├── *App.jsx        Pro Sub-Repo ein App-Wrapper
│   └── VitalOSApps.js  Tab-Registry
├── fitness/
│   └── Dashboard.jsx   Einstiegs-Dashboard (@view/dashboard)
├── components/         vitalos-eigene UI (WeightChart, common/)
│   └── dashboard/       Dashboard-Widgets (Header, Heatmap, MuscleBody, …)
├── lib → (symlink)     → fitness-app/src/lib (via @lib Alias)
├── App.jsx             React Entry + Auth-Gate
├── main.jsx
└── styles.css
```

Kein `src/shared/` Unterordner nötig — `src/` selbst ist der shared Layer.

---

## Build-Mode Trennung: coach vs. firebase

`@db` Alias wählt per Build-Mode:
- **local** (`npm run build`): `@db` → `src/coach/db.js` — kein Firebase-SDK im Bundle
- **firebase** (`--mode firebase`): `@db` → `src/shell/db/index.js` — kein lokaler Code

```js
// vite.config.js
'@db': resolve(VITALOS_SRC, isFirebase ? 'shell/db/index.js' : 'coach/db.js')
```

### shell/db/ — Doppelwrapper (seit 2026-07-09)

`src/shell/db/` ersetzt den Monolithen `src/cloud/db.firestore.js`: die Shell
konsumiert die **modularen** Firestore-Layer der Sub-Repos direkt beim Build,
plus Shell-eigene Module:

| Modul | Quelle |
|---|---|
| `fitness.js` | `@fitness-db/index.firestore.js` → `fitness-app/src/lib/db/firestore/*` (komplett) |
| `fuel.js` | `@fuel/lib/db/firestore/*` (selektiv, Kollisionsnamen umbenannt: `getNutritionJournal`) |
| `profile.js` | `users/{uid}` — Shell-eigen |
| `push.js` | `fitness/{uid}/settings/push` — Shell-eigen |

Firebase-Init ist **einmalig**: `src/cloud/firebase.js`. Ein `enforce:'pre'`
resolveId-Plugin in `vite.config.js` (`vitalos:subrepo-firebase-redirect`)
leitet die firebase.js der Sub-Repos im Firebase-Build darauf um.

Identisches Muster wie fitness-app (`db.js` vs. `db.firestore.js`) und fuel-app (`api.local.js` vs. `api.cloud.js`).

---

## Vite Alias Map

| Alias | Zeigt auf | Herkunft |
|---|---|---|
| `@db` | `src/coach/db.js` oder `src/shell/db/index.js` | build-time swap |
| `@shell` | `src/shell/` | vitalos |
| `@coach` | `src/coach/` | vitalos |
| `@cloud` | `src/cloud/` | vitalos |
| `@lib` | `fitness-app/src/lib/` | fitness-app |
| `@utils` | `fitness-app/src/lib/utils.js` | fitness-app |
| `@components` | `fitness-app/src/components/` | fitness-app |
| `@constants` | `fitness-app/src/constants/` | fitness-app |
| `@fitness-db` | `fitness-app/src/lib/db/` | fitness-app |
| `@fitness` | `fitness-app/` | fitness-app |
| `@habits` | `habit-app/src/` | habit-app |
| `@journal` | `journal-app/src/` | journal-app |
| `@learn` | `learn-dev/src/` | learn-dev |
| `@fuel` | `fuel-app/src/client/` | fuel-app |
| `@view/*` | je Tab-Herkunft | siehe vite.config |
| `@firebase-config` | `firebase.config.js` | vitalos root |

---

## Git Submodules

Alle Sub-Repos sind als Git Submodules eingebunden. Lokaler Ordnername (in
vitalos) und Remote-Repo-Name laufen seit der Umbenennung 2026-07-20
bewusst auseinander — die GitHub-Remotes heißen weiterhin `*-dev`
(`.gitmodules`-Sektionsname folgt dem Remote-Namen, NICHT dem lokalen Pfad):

| Lokaler Pfad | Submodule-Name (`.gitmodules`) | Remote | Typ |
|---|---|---|---|
| `fitness-app` | `fitness-dev` | `git@github.com:nimmsel23/fitness-dev.git` | GitHub (remote) |
| `fuel-app` | `fuel-dev` | `git@github.com:nimmsel23/fuel-dev.git` | GitHub (remote) |
| `journal-app` | `journal-dev` | `git@github.com:nimmsel23/journal-dev.git` | GitHub (remote) |
| `habit-app` | `habits-dev` | `git@github.com:nimmsel23/habits-dev.git` | GitHub (remote) |
| `learn-dev` | `learn-dev` | `git@github.com:nimmsel23/learn-dev.git` | GitHub (remote) |
| `relax-app` | `relax-dev` | `git@github.com:nimmsel23/relax-dev.git` | GitHub (remote) |

**Wichtig:** `git submodule`-Befehle (`status`, `update --remote`, ...)
matchen auf den **lokalen Pfad**, nicht auf den Submodule-Namen — also
`git submodule update --remote fitness-app`, nicht `fitness-dev`.

```bash
git submodule update --init          # alle initialisieren
git submodule update --remote        # alle auf neuesten Stand bringen
git submodule update --remote fitness-app   # einzelnes updaten
```

Änderungen in einem Submodule → dort committen, auf `origin` pushen, dann erst in `~/vitalos` den neuen Pointer committen.

Die festen `dev`-Arbeitskopien leben bewusst außerhalb des Meta-Repos unter
`~/fitness-dev`, `~/fuel-dev`, `~/journal-dev`, `~/habits-dev`, `~/learn-dev`
und `~/relax-dev`. `~/vitalos/*-app` sind die integrierten Submodule-Checkouts
für Build/CI und Pointer-Management, nicht die primären `dev`-Worktrees.

### Submodule-Regel
* Pointer im Meta-Repo dürfen nie auf lokale-only Submodule-Commits zeigen, sonst scheitert CI mit `fatal: not our ref`.
* Standard im Meta-Repo ist `push.recurseSubmodules=on-demand`: normales `git push` aus `~/vitalos` pusht referenzierte Submodule automatisch vorab.
* Detached-HEAD-Commits in Submodulen vermeiden. Falls doch nötig: explizit auf einen echten Zielbranch pushen, z. B. `git push origin HEAD:master`.

---

## CI/CD: Dezentrale Deploy-Workflows (`.github/workflows/deploy-master.yml`)

Seit 2026-07-16 nutzen **alle 4 Apps** (`vitalos`, `fitness-app`, `fuel-app`, `journal-app`, `habit-app`) vollständig eigenständige CI/CD-Pipelines:
- **Trigger:** `push` auf `master` deployt in den `live` Channel, `push` auf `dev` erstellt einen `preview` Channel (gültig für 1h).
- **Checkout-Strategie:** Die Workflows checken immer das `vitalos` Meta-Repo aus, laden via HTTPS+Token die Submodule und biegen dann den betroffenen App-Ordner (z.B. `journal-app`) hart auf den ausgelösten `$GITHUB_SHA` um.
- So können alle Apps unabhängig voneinander deployt werden, haben aber beim Build Zugriff auf die Cross-Repo Imports der Geschwister-Module (Workspaces).

## PWA & Service Worker Update-Verhalten

- **Fat Shell (`vitalos` / `fitness-app`):** Nutzen einen manuellen Service Worker (`public/sw.js`). Ein neuer Build ändert das Datum im SW. Das Frontend hört auf das Event `sw-update-available` und zeigt global (unabhängig vom aktuellen Tab) einen schwebenden Update-Banner am unteren Bildschirmrand.
- **Lean Apps (`journal-app`, `habit-app`, `fuel-app`):** Diese verzichten auf komplexe Background-Syncs und nutzen rein `vite-plugin-pwa` (via `useRegisterSW()`). Bei einem Update erscheint im Header (neben dem App-Namen) automatisch ein goldener Update-Button. Es gibt keinen erzwungenen Auto-Reload mehr, der User entscheidet.

**BEHOBEN (2026-07-12, `6abbfb7`): CI war mehrere Pushes rot** — `npm ci`
scheiterte mit `EUSAGE`, weil `package-lock.json` nicht synchron zu
`package.json` war (`Missing: vite-plugin-pwa@1.3.0 from lock file`,
Verursacher: learn-dev-Bump auf ^1.3.0 ohne Root-`npm install`). Seit dem
Lockfile-Sync läuft die CI grün. **Merkregel:** Nach jedem
Dependency-Bump in einem Workspace `npm install` im vitalos-Root laufen
lassen und das Lockfile mitcommitten, sonst bricht `npm ci` für ALLE
folgenden Pushes. `gh run view <id> --log-failed` liefert aktuell `403: Must have
admin rights to Repository` — Logs sind über die CLI mit dem aktuellen
Token nicht einsehbar, nur der Job-Step-Status (`gh run view <id>`).

---

## Hidden Chambers (Sub-Repos)

| Modul | Pfad | Standalone Port | Rolle |
|---|---|---|---|
| habit-app | `@habits` | 9002 | Tägliche Gewohnheiten |
| journal-app | `@journal` | — | Journal + Fuel-Tabs |
| learn-dev | `@learn` | — | Fitness-Wissen |

---

## Domain Extensions (Knowledge Bases)

Einige Hauptmodule werden durch eigenständige Knowledge Base (KB) Repositories erweitert. Diese KBs werden als **Git Subtrees** direkt in das jeweilige Domain-Repo integriert, um den Code untrennbar mit dem Modul zu deployen:

| Hauptmodul | Knowledge Base | Beschreibung |
|---|---|---|
| `fitness-app` | `anatomy-kb` | Anatomie Wissensdatenbank |
| `relax-app` | `physio-dev` | Physiologie Wissensdatenbank |

Die Tempel (fitness-app, fuel-app, relax-app) haben eigene Backends und sind eigenständig deployed. VitalOS embeddet sie via Aliases, ohne Code zu duplizieren.

---

## Wichtige Regeln

- **Kein Doppel-Code.** Alles was in fitness-app / fuel-app / habit-app existiert wird via Alias importiert, nicht kopiert.
- **`src/shell/` ist SSOT** für Navigation, Settings, Sidebar — nicht fitness-app.
- **Setup-Invariante:** Im Shell-Betrieb hat keine App einen eigenen Settings-Einstieg über App-Spezifisches hinaus — Generisches (Auth, Theme, SW, Profil) nur im VitalOS-Setup-Tab (Details: `src/shell/CLAUDE.md`).
- **`src/components/`** nur für vitalos-eigene UI (WeightChart, UserProfile, ErrorBoundary). fitness-app Components → via `@components`.
- Vor Edits in shell/: prüfen ob Komponente wirklich vitalos-spezifisch ist oder aus einem Sub-Repo kommen sollte.
- **Immer committen, nie fragen.** Sobald eine Aufgabe (eigene oder die eines Subagents) einen funktionierenden Zwischen- oder Endstand erreicht hat: sofort committen (Submodule zuerst, dann Meta-Repo-Pointer-Bump), ohne vorher nachzufragen. Grund: verlorene Arbeit, wenn der Agent-Context vor dem Commit endet (2026-08-06 Vorfall). Das überschreibt die generelle "nie ohne Erlaubnis committen"-Regel für dieses Repo. **Push bleibt separat** — nur committen, NICHT pushen, außer der User sagt es explizit.

---

## Deploy-Flow Gesamtbild (Audit 2026-07-15/16)

**Firebase-Projekt für ALLES: `fitness-aos`.** Jede App hat eine eigene
Hosting-*Site* im selben Projekt (alle `.firebaserc` → `fitness-aos`):

| Repo | Hosting-Site | Deploy-Pfad |
|---|---|---|
| vitalos (Shell) | `vitalos` → vitalos.web.app | CI `deploy-shell.yml` |
| fitness-app | (eigene Site, siehe deren firebase.json) | CI `deploy-fitness.yml` |
| fuel-app | `fuel-vos` | CI `deploy-fuel.yml` |
| journal-app / habit-app / learn-dev | je eigene Site | CI `deploy-journal/habits/learn.yml` |

**Der EINZIGE aktive Deploy-Pfad ist die CI im Meta-Repo** (seit 2026-07-15,
siehe Hook-Bereinigung unten). Ablauf für eine Sub-App:

1. Im Sub-Repo committen + zu `origin master` pushen.
2. In vitalos den Submodule-Pointer bumpen und committen
   (`chore(submodules): ...`) + pushen.
3. Der Pointer-Push triggert im Meta-Repo per `paths:`-Filter (z.B.
   `fitness-app/**`, `habit-app/**`) den passenden `deploy-<sub>.yml` — der deployt **nur
   Hosting** (Service-Account-Secret, `firebase-tools` non-interactive).
   Shell-Änderungen (`src/`, `public/`, Root-Configs) triggern
   `deploy-shell.yml` (ebenfalls nur Hosting). Firestore-Rules deployt
   KEIN Workflow automatisch — nur manuell via
   `deploy-firestore-rules.yml` (workflow_dispatch) oder lokal aus
   `~/vitalos`.
   **Rules-SSOT:** `~/vitalos/firestore.rules` + `firestore.indexes.json`
   (Root). Firestore-Rules sind PROJEKT-global (fitness-aos) — per-App-Rules
   überschrieben sich gegenseitig und brachen am 16.07.2026 die Exercise-
   Suche (journal-Rules ohne `fitness/kb`). Deshalb haben die Sub-Repo-
   `firebase.json` seit 2026-07-18 KEINEN `firestore`-Block mehr — dort kann
   niemand mehr Rules deployen, auch nicht versehentlich.
4. `pr-preview.yml` baut Preview-Channels — bewusst NUR für Shell-Dateien.

### Preview-CI in den Sub-Repos (seit 2026-07-16)

Jedes Sub-Repo (fitness/fuel/journal/habits/learn) hat
`.github/workflows/preview-dev.yml`: **dev-Push → 24h-Channel `dev`**,
**PR → eigener PR-Channel**, danach Telegram-Link (Secrets `TELEGRAM_TO`,
`TELEGRAM_TOKEN`, Service-Account `FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS`).
Trick gegen das Cross-Repo-Alias-Problem (weshalb die alten Workflows in
`workflows.disabled/` liegen): der Workflow checkt **vitalos mit Submodules**
aus, setzt das eigene Submodule auf den ausgelösten Commit und baut nur
diesen Workspace (`npm run build:firebase --workspace=<sub>`).
relax-app ist standalone und hat seinen eigenen
`firebase-hosting-dev-preview.yml` (baut ohne Meta-Repo).
Die lokale Pipeline (`npm run deploy:preview`) existiert parallel und
sendet den Link seit 2026-07-16 über die **tele-CLI** (`~/.local/bin/tele`,
Ideapad-Bot, hartkodierter Token — kein .env nötig); schlägt tele fehl,
Fallback auf TELEGRAM_TOKEN/CHAT_ID aus `~/.env/fitness.env` (alle 5
Skripte nutzen bewusst fitness.env, vereinheitlichte Fassung).

**Ohne Pointer-Bump im Meta-Repo wird NICHTS deployed.** Ein Push nur im
Sub-Repo erreicht Firebase nicht mehr.

### Git-Hooks: Ist-Zustand + Historie

**Update 2026-08-16:** journal-app und habit-app haben inzwischen ebenfalls
`core.hooksPath = .githooks` gesetzt. Einziges Repo ohne `hooksPath` UND
ohne `.githooks/`-Verzeichnis ist **relax-app** — offener Punkt.

| Repo | Hook | Status |
|---|---|---|
| vitalos | `.githooks/post-commit` | aktiv, nur Info-Ausgabe |
| vitalos | `.githooks/pre-push` | nicht vorhanden; Schutz läuft über `push.recurseSubmodules=on-demand` |
| vitalos | `.git/hooks/*` | wirkungslos, weil `core.hooksPath=.githooks` |
| fitness-app | `.githooks/pre-commit`, `post-commit`, `pre-push`, `post-checkout`, `post-merge` | aktiv |
| fuel-app | `.githooks/post-commit` | aktiv |
| journal-app | `.githooks` | aktiv (Stand 2026-08-16) |
| habit-app | `.githooks` | aktiv (Stand 2026-08-16) |
| learn-dev | `.githooks` | aktiv (Stand 2026-08-16) |
| relax-app | — | kein hooksPath, kein `.githooks/`-Ordner — offen |

`git` ist systemweit ein Wrapper (`~/aos/bin/git`): blockt `git restore` und
`git checkout --` (Datenverlust-Schutz), Override via `AOS_GIT_ALLOW_DISCARD=1`.
Er ruft KEINE Hooks auf.

### Branch-Konventionen

- Überall ist **`master`** der Deploy-/Hauptbranch.
- Sub-Repos haben zusätzlich `dev` mit Upstream `origin/dev` — inzwischen
  **auch relax-app** (Stand 2026-08-16, seit 2026-07-16 nachgezogen).
  Workflow: auf `dev` arbeiten, nach master mergen, pushen, Pointer bumpen.
- `.gitmodules` hat bewusst KEIN `branch=`-Feld — Submodule-Stand wird
  ausschließlich über manuell gebumpte Commit-Pointer kontrolliert.
  `git submodule update --remote` daher nur gezielt einsetzen.

### Bekannte Baustellen (Stand 2026-08-16)

- fuel-app/learn-dev: `.firebase/hosting.*.cache` ändert sich bei jedem
  lokalen Deploy → Dauer-Dirty der Submodules im Meta-Repo (` m`-Marker).
- `.bak`-Workflows (`workflows.disabled/`) in allen 5 Sub-Repos sind
  deaktivierte Historie (per-Repo-CI konnte wegen Cross-Repo-Aliases nie
  bauen, deshalb zentralisiert 2026-07-03). GitHub ignoriert sie, aber
  Aufräumen steht noch aus.
- relax-app hat weder `core.hooksPath` noch ein `.githooks/`-Verzeichnis
  (siehe Git-Hooks-Tabelle oben) — einziges Sub-Repo ohne Hook-Absicherung.
- Hub.jsx zeigt für Journal/Habits/Learn bewusst keine Live-Stats, weil
  `@habits-db` hart `@fitness-db/index.firestore.js` importiert (auch im
  Coach/Local-Build) — 3 von 6 Tempeln ohne sauberen eigenen Datenpfad zum
  Hub (siehe `src/shell/CLAUDE.md`).
- Behoben seit 2026-07-16 (aus dieser Liste entfernt): learn-dev hatte
  `dist-firebase/`/`node_modules/` eingecheckt (jetzt 0 getrackte Dateien).
- Meta-Repo-Branch-Leichen `merge` (0 commits ahead, voll gemerged),
  `mobile/mobile-optimizations-safe-area` (uralter Snapshot vor der
  fitness-vos → fitness-app Umbenennung, klar überholt) und
  `rename/local-app-dirs` (identisch zu master) — Löschung ausstehend,
  User-Bestätigung angefragt (2026-08-16).
