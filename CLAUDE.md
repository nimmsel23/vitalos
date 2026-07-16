# VitalOS Shell

VitalOS ist die übergreifende App-Shell die alle VOS-Module (fitness-dev, fuel-dev, journal-dev, habits-dev, learn-dev) zusammenhält.

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
│   ├── Dashboard.jsx
│   ├── *App.jsx        Pro Sub-Repo ein App-Wrapper
│   └── VitalOSApps.js  Tab-Registry
├── components/         vitalos-eigene UI (WeightChart, common/)
├── lib → (symlink)     → fitness-dev/src/lib (via @lib Alias)
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
| `fitness.js` | `@fitness-db/index.firestore.js` → `fitness-dev/src/lib/db/firestore/*` (komplett) |
| `fuel.js` | `@fuel/lib/db/firestore/*` (selektiv, Kollisionsnamen umbenannt: `getNutritionJournal`) |
| `profile.js` | `users/{uid}` — Shell-eigen |
| `push.js` | `fitness/{uid}/settings/push` — Shell-eigen |

Firebase-Init ist **einmalig**: `src/cloud/firebase.js`. Ein `enforce:'pre'`
resolveId-Plugin in `vite.config.js` (`vitalos:subrepo-firebase-redirect`)
leitet die firebase.js der Sub-Repos im Firebase-Build darauf um.

Identisches Muster wie fitness-dev (`db.js` vs. `db.firestore.js`) und fuel-dev (`api.local.js` vs. `api.cloud.js`).

---

## Vite Alias Map

| Alias | Zeigt auf | Herkunft |
|---|---|---|
| `@db` | `src/coach/db.js` oder `src/shell/db/index.js` | build-time swap |
| `@shell` | `src/shell/` | vitalos |
| `@coach` | `src/coach/` | vitalos |
| `@cloud` | `src/cloud/` | vitalos |
| `@lib` | `fitness-dev/src/lib/` | fitness-dev |
| `@utils` | `fitness-dev/src/lib/utils.js` | fitness-dev |
| `@components` | `fitness-dev/src/components/` | fitness-dev |
| `@constants` | `fitness-dev/src/constants/` | fitness-dev |
| `@fitness-db` | `fitness-dev/src/lib/db/` | fitness-dev |
| `@fitness` | `fitness-dev/` | fitness-dev |
| `@habits` | `habits-dev/src/` | habits-dev |
| `@journal` | `journal-dev/src/` | journal-dev |
| `@learn` | `learn-dev/src/` | learn-dev |
| `@fuel` | `fuel-dev/src/client/` | fuel-dev |
| `@view/*` | je Tab-Herkunft | siehe vite.config |
| `@firebase-config` | `firebase.config.js` | vitalos root |

---

## Git Submodules

Alle Sub-Repos sind als Git Submodules eingebunden:

| Submodule | Remote | Typ |
|---|---|---|
| `fitness-dev` | `git@github.com:nimmsel23/fitness-dev.git` | GitHub (remote) |
| `fuel-dev` | `git@github.com:nimmsel23/fuel-dev.git` | GitHub (remote) |
| `journal-dev` | `git@github.com:nimmsel23/journal-dev.git` | GitHub (remote) |
| `habits-dev` | `git@github.com:nimmsel23/habits-dev.git` | GitHub (remote) |
| `learn-dev` | `git@github.com:nimmsel23/learn-dev.git` | GitHub (remote) |
| `relax-dev` | `git@github.com:nimmsel23/relax-dev.git` | GitHub (remote) |

```bash
git submodule update --init          # alle initialisieren
git submodule update --remote        # alle auf neuesten Stand bringen
git submodule update --remote fitness-dev   # einzelnes updaten
```

Änderungen in einem Submodule → dort committen, dann in vitalos den neuen Commit-Pointer committen.

---

## CI/CD: Dezentrale Deploy-Workflows (`.github/workflows/deploy-master.yml`)

Seit 2026-07-16 nutzen **alle 4 Apps** (`vitalos`, `fitness-dev`, `fuel-dev`, `journal-dev`, `habits-dev`) vollständig eigenständige CI/CD-Pipelines:
- **Trigger:** `push` auf `master` deployt in den `live` Channel, `push` auf `dev` erstellt einen `preview` Channel (gültig für 1h).
- **Checkout-Strategie:** Die Workflows checken immer das `vitalos` Meta-Repo aus, laden via HTTPS+Token die Submodule und biegen dann den betroffenen App-Ordner (z.B. `journal-dev`) hart auf den ausgelösten `$GITHUB_SHA` um.
- So können alle Apps unabhängig voneinander deployt werden, haben aber beim Build Zugriff auf die Cross-Repo Imports der Geschwister-Module (Workspaces).

## PWA & Service Worker Update-Verhalten

- **Fat Shell (`vitalos` / `fitness-dev`):** Nutzen einen manuellen Service Worker (`public/sw.js`). Ein neuer Build ändert das Datum im SW. Das Frontend hört auf das Event `sw-update-available` und zeigt global (unabhängig vom aktuellen Tab) einen schwebenden Update-Banner am unteren Bildschirmrand.
- **Lean Apps (`journal-dev`, `habits-dev`, `fuel-dev`):** Diese verzichten auf komplexe Background-Syncs und nutzen rein `vite-plugin-pwa` (via `useRegisterSW()`). Bei einem Update erscheint im Header (neben dem App-Namen) automatisch ein goldener Update-Button. Es gibt keinen erzwungenen Auto-Reload mehr, der User entscheidet.

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
| habits-dev | `@habits` | 9002 | Tägliche Gewohnheiten |
| journal-dev | `@journal` | — | Journal + Fuel-Tabs |
| learn-dev | `@learn` | — | Fitness-Wissen |

---

## Domain Extensions (Knowledge Bases)

Einige Hauptmodule werden durch eigenständige Knowledge Base (KB) Repositories erweitert. Diese KBs werden als **Git Subtrees** direkt in das jeweilige Domain-Repo integriert, um den Code untrennbar mit dem Modul zu deployen:

| Hauptmodul | Knowledge Base | Beschreibung |
|---|---|---|
| `fitness-dev` | `anatomy-kb` | Anatomie Wissensdatenbank |
| `relax-dev` | `physio-dev` | Physiologie Wissensdatenbank |

Die Tempel (fitness-dev, fuel-dev, relax-dev) haben eigene Backends und sind eigenständig deployed. VitalOS embeddet sie via Aliases, ohne Code zu duplizieren.

---

## Wichtige Regeln

- **Kein Doppel-Code.** Alles was in fitness-dev / fuel-dev / habits-dev existiert wird via Alias importiert, nicht kopiert.
- **`src/shell/` ist SSOT** für Navigation, Settings, Sidebar — nicht fitness-dev.
- **Setup-Invariante:** Im Shell-Betrieb hat keine App einen eigenen Settings-Einstieg über App-Spezifisches hinaus — Generisches (Auth, Theme, SW, Profil) nur im VitalOS-Setup-Tab (Details: `src/shell/CLAUDE.md`).
- **`src/components/`** nur für vitalos-eigene UI (WeightChart, UserProfile, ErrorBoundary). fitness-dev Components → via `@components`.
- Vor Edits in shell/: prüfen ob Komponente wirklich vitalos-spezifisch ist oder aus einem Sub-Repo kommen sollte.

---

## Deploy-Flow Gesamtbild (Audit 2026-07-15/16)

**Firebase-Projekt für ALLES: `fitness-aos`.** Jede App hat eine eigene
Hosting-*Site* im selben Projekt (alle `.firebaserc` → `fitness-aos`):

| Repo | Hosting-Site | Deploy-Pfad |
|---|---|---|
| vitalos (Shell) | `vitalos` → vitalos.web.app | CI `deploy-shell.yml` |
| fitness-dev | (eigene Site, siehe deren firebase.json) | CI `deploy-fitness.yml` |
| fuel-dev | `fuel-vos` | CI `deploy-fuel.yml` |
| journal-dev / habits-dev / learn-dev | je eigene Site | CI `deploy-journal/habits/learn.yml` |

**Der EINZIGE aktive Deploy-Pfad ist die CI im Meta-Repo** (seit 2026-07-15,
siehe Hook-Bereinigung unten). Ablauf für eine Sub-App:

1. Im Sub-Repo committen + zu `origin master` pushen.
2. In vitalos den Submodule-Pointer bumpen und committen
   (`chore(submodules): ...`) + pushen.
3. Der Pointer-Push triggert im Meta-Repo per `paths:`-Filter
   (`<sub>-dev/**`) den passenden `deploy-<sub>.yml` — der deployt Hosting
   **plus** `firestore:rules,indexes` der Sub-App (Service-Account-Secret,
   `firebase-tools` non-interactive). Shell-Änderungen (`src/`, `public/`,
   Root-Configs) triggern `deploy-shell.yml`.
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
relax-dev ist standalone und hat seinen eigenen
`firebase-hosting-dev-preview.yml` (baut ohne Meta-Repo).
Die lokale Pipeline (`npm run deploy:preview`) existiert parallel und
sendet den Link seit 2026-07-16 über die **tele-CLI** (`~/.local/bin/tele`,
Ideapad-Bot, hartkodierter Token — kein .env nötig); schlägt tele fehl,
Fallback auf TELEGRAM_TOKEN/CHAT_ID aus `~/.env/fitness.env` (alle 5
Skripte nutzen bewusst fitness.env, vereinheitlichte Fassung).

**Ohne Pointer-Bump im Meta-Repo wird NICHTS deployed.** Ein Push nur im
Sub-Repo erreicht Firebase nicht mehr.

### Git-Hooks: Ist-Zustand + Historie

Meta-Repo und fitness-dev/fuel-dev haben `core.hooksPath = .githooks`
(→ `.git/hooks/` ist dort WIRKUNGSLOS). journal/habits/learn/relax-dev haben
KEIN hooksPath gesetzt — dort liegende `.githooks/post-commit`-Dateien laufen
nie (bewusst so belassen, Stand 2026-07-16).

| Repo | Hook | Status |
|---|---|---|
| vitalos | `.githooks/post-commit` | aktiv, nur Info-Ausgabe (harmlos) |
| vitalos | `.githooks/post-push.bak` | **2026-07-16 deaktiviert** — war totes Skript (Git kennt keinen post-push-Hook, nichts rief ihn auf; referenzierte zudem ein nicht existierendes npm-Script `deploy:firebase`). CI deckt den Fall ab. |
| vitalos | `.git/hooks/post-commit` | tot (hooksPath überschreibt) |
| fitness-dev | `.githooks/pre-commit`, `post-commit` | aktiv |
| fitness-dev | `.githooks/pre-push.bak` | **2026-07-15 deaktiviert** (war lokaler Firebase-Deploy bei Push auf master → doppelte Arbeit zur CI) |
| fuel-dev | `.githooks/post-commit` | aktiv |
| fuel-dev | `.githooks/pre-push.bak` | **2026-07-15 deaktiviert** (dito) |

Die deaktivierten pre-push-Hooks hatten einen Selbst-Trigger-Schutz
(SKIP für `public/sw.js`, `public/manifest.json`, `dist-firebase/` —
Build-Outputs des vorherigen Laufs). Falls je reaktiviert: dieses Pattern
beibehalten, sonst Endlos-Bump-Spirale.

`git` ist systemweit ein Wrapper (`~/aos/bin/git`): blockt `git restore` und
`git checkout --` (Datenverlust-Schutz), Override via `AOS_GIT_ALLOW_DISCARD=1`.
Er ruft KEINE Hooks auf.

### Branch-Konventionen

- Überall ist **`master`** der Deploy-/Hauptbranch.
- Sub-Repos (außer relax-dev) haben zusätzlich `dev` mit Upstream
  `origin/dev`. Stand 2026-07-16: `dev` == `master` in allen fünf (0/0
  divergiert). Workflow: auf `dev` arbeiten, nach master mergen, pushen,
  Pointer bumpen. relax-dev hat keinen dev-Branch (bekannt, offen).
- `.gitmodules` hat bewusst KEIN `branch=`-Feld — Submodule-Stand wird
  ausschließlich über manuell gebumpte Commit-Pointer kontrolliert.
  `git submodule update --remote` daher nur gezielt einsetzen.
- Meta-Repo-Altlasten: lokale Branches `merge` und
  `mobile/mobile-optimizations-safe-area` (letzter auch auf origin) —
  Status ungeklärt, vor Löschung Merge-Stand prüfen.

### Bekannte Baustellen (Stand 2026-07-16)

- **learn-dev:** `dist-firebase/` und `node_modules/` sind teilweise
  eingecheckt bzw. tauchen im `git status` auf — unsauberste Stelle im
  Setup; gehören in die `.gitignore` + aus dem Index.
- fuel-dev/learn-dev: `.firebase/hosting.*.cache` ändert sich bei jedem
  lokalen Deploy → Dauer-Dirty der Submodules im Meta-Repo (` m`-Marker).
- `.bak`-Workflows in `.github/workflows/` (Meta + Sub-Repos) sind
  deaktivierte Historie (per-Repo-CI konnte wegen Cross-Repo-Aliases nie
  bauen, deshalb zentralisiert 2026-07-03). GitHub ignoriert `.yml.bak`.
- Hook-Bereinigung Punkte 1/2/4/5 aus dem Audit (post-push archivieren,
  hooksPath-Inkonsistenz, .bak-Workflows, alte Branches) noch offen.
