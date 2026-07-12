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

## CI/CD: Deploy-Workflow (`.github/workflows/deploy-shell.yml`)

**Trigger:** `push` auf `master` (+ `workflow_dispatch`). Deployt **immer frisch** —
kein Wiederverwenden von altem `dist-firebase/`:
1. Checkout ohne Submodule, dann `git submodule update --init --recursive`
   über HTTPS+Token (alle Sub-Repos sind seit 2026-07-03 public, `GITHUB_TOKEN`
   reicht — kein SSH-Deploy-Key nötig).
2. `npm ci` (npm workspaces — ein `ci` installiert fitness/fuel/journal/
   habits/learn zusammen, `.npmrc` hat `legacy-peer-deps` wg. eslint@10-Konflikt
   in fitness-dev).
3. `npm run build:firebase` — kompletter Vite-Build aus den aktuellen
   Submodule-Ständen (den Commit, der in vitalos für jedes Submodule
   eingecheckt ist, nicht zwangsläufig dessen neuester `HEAD`).
4. Deploy via `FirebaseExtended/action-hosting-deploy@v0` → Projekt
   `fitness-aos`, Channel `live`.

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
- **`src/components/`** nur für vitalos-eigene UI (WeightChart, UserProfile, ErrorBoundary). fitness-dev Components → via `@components`.
- Vor Edits in shell/: prüfen ob Komponente wirklich vitalos-spezifisch ist oder aus einem Sub-Repo kommen sollte.
