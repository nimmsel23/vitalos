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
* `.githooks/pre-commit` ruft `bin/vos-sync-submodule-pointers --stage` auf und staged erreichbare Submodule-Pointer automatisch mit.
* `.githooks/pre-push` ruft `bin/vos-sync-submodule-pointers --check-push` auf und blockt nur noch lokal-only Pointer in `HEAD`.
* **Seit 2026-08-25:** `vos-sync-submodule-pointers --stage` prüft beim Staging jedes Pointer-Bumps zusätzlich, ob sich `package.json` im betroffenen Submodul geändert hat (`git diff <alter> <neuer Commit> -- package.json`). Falls ja, läuft automatisch `npm install --package-lock-only` im Root und `package-lock.json` wird mitgestaged — behebt strukturell das Lockfile-Drift-Problem unten (war zuvor reine Merkregel, jetzt Automatismus). Bricht `npm install` dabei, stoppt der Commit mit Fehlermeldung statt eines halb-synchronisierten Lockfiles.

### Pointer-Bump fuel-app / fitness-app: Schritt für Schritt (Stand 2026-10-17, aus einem Durchlauf mit Stolpersteinen)

Die Arbeit passiert in `~/fuel-dev` / `~/fitness-dev` (Branch `dev`). Die Submodule
`fuel-app` / `fitness-app` tracken den Branch **`vitalos`**, der per Merge aus
`origin/dev` entsteht (Commit-Text `Merge origin/dev into vitalos`). Reihenfolge — von
innen nach außen, jede Stufe erst pushen, wenn die darunter auf `origin` liegt:

1. **Geschachtelte Teil-Repos zuerst** (nur fitness-dev): `coach/` (→ `coach-dev`, Branch `master`),
   `plan/` (→ `plan-dev`, Branch `master`), `plan/coach-dev/` (→ `coach-dev`, Branch `dev`).
   Dort committen, **auf einen echten Branch**, pushen.
   - `plan/coach-dev` steht oft im **Detached HEAD**. Ein Commit dort hängt dann in der Luft
     und `origin/dev` ist meist weit voraus (Non-Fast-Forward). Richtig:
     `git checkout -b <name> origin/dev && git cherry-pick <commit> && git push origin <name>:dev`.
   - Danach in `plan/`: `git add coach-dev && git commit` → `git push origin master`;
     `coach/`: `git push origin master`.
2. **fitness-dev**: Pointer `plan`/`coach` committen (`git add plan coach`), `git push origin dev`.
   Der Pre-Commit-Hook baut (`dist/`, `dist-versions/`), der Push deployt Staging
   (`fitness-preview.service` :8100) — das ist erwartet, kein Prod.
3. **fuel-dev**: `git push origin dev` (Staging nach `~/.local/fuel`, kein laufender Service).
4. **Submodul-Branches `vitalos`**:
   - `cd ~/vitalos/fitness-app && git fetch origin && git merge --no-edit origin/dev`
     (analog `fuel-app`). Ohne vorheriges Push von `dev` gibt es nichts zu mergen —
     vorher nur lokal testen: `git fetch ~/fitness-dev dev && git merge FETCH_HEAD`.
   - **Nur fitness-app:** danach stehen `coach`, `plan` und `plan/coach-dev` als
     „modified“, weil die Arbeitskopien noch auf dem alten Commit sind. Je Teil-Repo:
     `want=$(git ls-tree HEAD <sub> | awk '{print $3}'); git -C <sub> fetch origin; git -C <sub> checkout $want`
     (für `plan/coach-dev` mit `git -C plan ls-tree HEAD coach-dev`).
   - `git push origin vitalos` (in jedem Submodul).
5. **Meta-Repo** `~/vitalos`: `git add fitness-app fuel-app && git commit` →
   `git push origin master`. Der Push löst `Deploy Fitness PWA` / `Deploy Fuel PWA` /
   `Deploy VitalOS Shell` aus (nur Hosting; Status: `gh run list --limit 5`).
   `push.recurseSubmodules=on-demand` pusht referenzierte Submodule-Commits zwar mit,
   fängt aber **nicht** die Teil-Repos aus Schritt 1 ab — die vorab selbst pushen.

Stolpersteine:
- Die vier Mini-App-Submodule `vos-fuel-{log,supplements,mikros,protokoll}-app` zeigen auf
  denselben Fuel-Commit, werden aber **bewusst nicht** mitgebumpt (stabile Fallbacks, nur
  manuell deployen).
- `git push origin dev` in fuel-dev/fitness-dev veröffentlicht **alle** dort noch ungepushten
  Commits, nicht nur die eigenen — vorher `git log origin/dev..dev` ansehen.
- Vor dem Pointer-Commit beide vitalos-Builds probieren, ohne `dist/` zu überschreiben:
  `npx vite build --mode firebase --outDir <scratch> --emptyOutDir` und ohne `--mode`.
- Firestore-Rules brauchen für neue Unterpfade unter `users/{uid}/**` keinen Deploy
  (`match /users/{uid}/{document=**}` deckt sie ab); Rules weiterhin nur aus `~/vitalos`.
- Gemeinsame Namen in den `export *`-Barrels (`shell/db/index.js` zieht fuel + fitness mit):
  neue Exporte in `shell/db/settings.js` eindeutig benennen (`registerShellDevice` statt
  `registerDevice`), sonst werden sie als mehrdeutig verworfen. Neue `@db`-Funktionen, die
  Views aus `fitness-app` importieren, brauchen auch einen Stub in `src/coach/db.js`
  (lokaler Build).

---

## CI/CD: Dezentrale Deploy-Workflows (`.github/workflows/deploy-master.yml`)

Seit 2026-07-16 nutzen **alle 4 Apps** (`vitalos`, `fitness-app`, `fuel-app`, `journal-app`, `habit-app`) vollständig eigenständige CI/CD-Pipelines:
- **Trigger:** `push` auf `master` deployt in den `live` Channel, `push` auf `dev` erstellt einen `preview` Channel (gültig für 1h).
- **Checkout-Strategie:** Die Workflows checken immer das `vitalos` Meta-Repo aus, laden via HTTPS+Token die Submodule und biegen dann den betroffenen App-Ordner (z.B. `journal-app`) hart auf den ausgelösten `$GITHUB_SHA` um.
- So können alle Apps unabhängig voneinander deployt werden, haben aber beim Build Zugriff auf die Cross-Repo Imports der Geschwister-Module (Workspaces).

## PWA & Service Worker Update-Verhalten

- **Fat Shell (`vitalos` / `fitness-app`):** Nutzen einen manuellen Service Worker (`public/sw.js`). Ein neuer Build ändert das Datum im SW. Das Frontend hört auf das Event `sw-update-available` und zeigt global (unabhängig vom aktuellen Tab) einen schwebenden Update-Banner am unteren Bildschirmrand.
- **Lean Apps (`journal-app`, `habit-app`, `fuel-app`):** Diese verzichten auf komplexe Background-Syncs und nutzen rein `vite-plugin-pwa` (via `useRegisterSW()`). Bei einem Update erscheint im Header (neben dem App-Namen) automatisch ein goldener Update-Button. Es gibt keinen erzwungenen Auto-Reload mehr, der User entscheidet.

**Wiederkehrendes Problem, seit 2026-08-25 automatisiert behoben:** `npm ci`
in der CI scheitert mit `EUSAGE`, wenn `package-lock.json` nicht synchron zu
einem Workspace-`package.json` ist. Bisher dreimal aufgetreten:
- 2026-07-12 (`6abbfb7`): learn-dev-Bump auf `vite-plugin-pwa@^1.3.0` ohne
  Root-`npm install` → `Missing: vite-plugin-pwa@1.3.0 from lock file`.
- 2026-08-25 (`058e7b4`): habit-app-Bump auf `@dnd-kit/modifiers@^9.0.0` +
  `@dnd-kit/sortable@^10.0.0` ohne Root-`npm install` → 4 Deploy-Workflows
  (Shell/Fitness/Fuel/Habits) liefen mehrere Pushes rot; `@vos/cross-app-aliases`
  fiel zusätzlich aus dem Lockfile, weil es in `habit-app`/`fuel-app` per
  `file:../vitalos/packages/cross-app-aliases` referenziert wird, in
  `fitness-app`/`journal-app`/Root aber per reiner Versionsangabe `1.0.0` —
  die inkonsistente Referenzform macht die Auflösung bei jeder
  Workspace-`package.json`-Änderung neu nötig.

**Root Cause behoben, nicht nur der Symptomfix:** `bin/vos-sync-submodule-pointers`
(siehe "Submodule-Regel" oben) läuft automatisch als `pre-commit`-Hook und
zieht `package-lock.json` jetzt selbst nach, sobald ein gestageter
Pointer-Bump eine geänderte `package.json` mitbringt — die frühere
"Merkregel, nach jedem Dependency-Bump manuell `npm install` im Root
laufen lassen" ist damit kein reines Disziplinproblem mehr. `gh run view <id>
--log-failed` liefert aktuell `403: Must have admin rights to Repository` —
Logs sind über die CLI mit dem aktuellen Token nicht einsehbar, nur der
Job-Step-Status (`gh run view <id>`).

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
| fitness-app | `fitness-aos` → fitness-aos.web.app | CI `deploy-fitness.yml` |
| fitness-vos | `fitness-vos` → fitness-vos.web.app | lokal via `fitness-vos/firebase.json`, automatisiert seit 2026-10-13 über `.githooks/pre-push` (siehe unten) |
| fuel-app | `fuel-vos` → fuel-vos.web.app | CI `deploy-fuel.yml` / `fuel-app/firebase.json` |
| fuel-os | `fuel-os` → fuel-os.web.app | lokal via `fuel-os/firebase.json` |
| fuel-app (Mini-Apps, seit 2026-10-16) | `vos-fuel-log`, `vos-fuel-supplements`, `vos-fuel-mikros`, `vos-fuel-protokoll` → je `<site>.web.app` | aus **demselben** Repo fuel-dev (Targets `log`/`supplements`/`mikros`/`protokoll` in `firebase.json`, Build `VITE_SOLO=<tab>`, `pnpm run deploy:solo:<x>`); Hosting-Target der vollen App heißt jetzt `client` (`--only hosting:client`). Lokale Checkouts als Submodule `vos-fuel-<x>-app` (alle vier = Klon von fuel-dev, Branch `vitalos`, `ignore = untracked`; bewusst NICHT in `pnpm-workspace.yaml`) — Arbeitskopie bleibt `~/fuel-dev` (Branch `dev`). **Bewusst KEINE CI-Deploys** für die vier Mini-Apps: stable-prod-/Fallback-Apps, die nie durch einen versehentlichen Pointer-Bump oder Push überschrieben werden dürfen; Deploy nur manuell und gewollt (`pnpm run deploy:solo:<x>` in fuel-dev). `deploy-fuel.yml` deployt ausschließlich `hosting:client` |
| journal-app / habit-app / learn-dev | je eigene Site | CI `deploy-journal/habits/learn.yml` |

**Fitness-Rollen sind absichtlich getrennt:** `~/fitness-dev` ist der OG-Source-Code
und primäre Dev-Worktree; `~/vitalos/fitness-app` ist der in VitalOS integrierte
Shell-Teil/Submodule-Checkout und deployed nach `fitness-aos.web.app`;
`~/vitalos/fitness-vos` ist die separate, schlanke VOS-Standalone-Variante und
deployed nach `fitness-vos.web.app`. `fitness-vos` importiert absichtlich nur
die noetigen Bausteine aus `fitness-app` und soll schlank bleiben, statt die
volle `fitness-app`-Shell zu duplizieren. Zweck: eine live Fitness-Variante,
die einfach funktioniert, auch wenn die VitalOS-Shell oder die AOS-Version
gerade nicht gesund ist. Diese drei Pfade nicht zusammenziehen.

**fitness-vos Auto-Deploy (seit 2026-10-13):** `.githooks/pre-push` löst bei
jedem Push nach `master`, der Dateien unter `fitness-vos/` ändert (außer
`.md`/`.bak`/eigenem Build-Output `dist-firebase/`/`.firebase/`), automatisch
`cd fitness-vos && npm run firebase` aus (Build + `firebase deploy --only
hosting --project fitness-aos`) — analog zum bestehenden Pre-Push-Hook in
`~/fitness-dev`. Schlägt der Build/Deploy fehl, bricht der Push ab (kein
halb-deployter Stand), Override via `git push --no-verify`. User hat
Claude Code für Deploy-Schritte an `fitness-vos` ausdrücklich freie Hand
gegeben (2026-10-13) — abweichend von der generellen Deploy-Bestätigungspflicht
weiter oben.

**VOS-Doppelstruktur:** Die `~/vitalos/*-app`-Checkouts sind die integrierten
Standalone-App/Submodule-Handoffs fuer Firebase; die `~/vitalos/*-vos`-Ordner
sind zusaetzliche entschlackte Live-Varianten innerhalb von VitalOS. Alles, was
aus `~/vitalos/` heraus nach Firebase gebaut wird, gehoert bewusst zu dieser
Live-Schiene. Der Localhost-Betrieb bleibt getrennt und kommt aus den externen
`~/fitness-dev`, `~/fuel-dev` usw. Dev-Branches, die die eigentlichen Git-Repos
und primaeren lokalen Arbeitskopien sind.

**Fuel-Rollen sind analog getrennt:** `~/fuel-dev` ist der OG-Source-Code und
primäre Localhost-/Dev-Worktree; `~/vitalos/fuel-app` ist der Firebase-Handoff
fuer die volle Fuel-App und deployed nach `fuel-vos.web.app`; `~/vitalos/fuel-os`
ist die separate, schlanke Wrapper-Variante. Die schlanke Variante darf `fuel-vos`
nicht ueberschreiben, solange sie nicht als stabil verifiziert ist.

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
| vitalos | `.githooks/pre-commit` | aktiv; staged erreichbare Submodule-Pointer automatisch |
| vitalos | `.githooks/pre-push` | aktiv; blockt nur lokal-only Submodule-Pointer in `HEAD` |
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

- **Korrigiert 2026-10-13** (vorherige Version dieses Abschnitts war veraltet/
  falsch — `master` war mal überall der Hauptbranch, ist es nicht mehr):
  Alle 9 Submodule-Checkouts unter `~/vitalos/*-app` laufen auf einem eigenen
  **`vitalos`**-Branch (Rename von `master`), nicht auf `master` selbst.
  `journal-app`/`learn-app` standen bis 2026-10-13 noch auf `master` bzw.
  waren kurzzeitig falsch dokumentiert als "bewusste Ausnahme" — das war
  schlicht Checkout-Drift, kein Designentscheid, und wurde gefixt (beide
  jetzt korrekt auf `vitalos`).
- `.gitmodules` deklariert **sehr wohl** `branch = vitalos` pro Submodule
  (frühere Notiz "bewusst KEIN branch=-Feld" war falsch/veraltet) — Submodule-
  Stand wird trotzdem weiterhin über manuell gebumpte Commit-Pointer
  kontrolliert, `branch=` ist nur die Checkout-Referenz für `git submodule
  update --remote`, nicht automatischer Auto-Pull.
- Sub-Repos haben zusätzlich `dev` mit Upstream `origin/dev` — ihr jeweiliger
  Standalone-Arbeitsbranch (inkl. relax-app, seit 2026-07-16/08-16).
  Workflow: auf `dev` arbeiten, per `vos-release` nach `vitalos` mergen,
  pushen, Pointer in `~/vitalos` bumpen.

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
  Fitness-Pfadtrennung) und `rename/local-app-dirs` (identisch zu master) —
  Löschung ausstehend, User-Bestätigung angefragt (2026-08-16).

---

## `bin/vlog` — Fitness + Relax + Fuel loggen ohne Server (seit 2026-10-16)

Ein typer-Skript (`~/vitalos/bin` ist im PATH), das Tages-Logs schreibt, ohne dass
`fitness-api` (:9150), Fuel-Node (:9000) oder Relax-API (:9123) laufen müssen.

```bash
vlog fitness "Kreuzheben 60" "Back Squat 3x5@60" --block Legs --art Kraft --ort "Fitness First, 1030 Wien" --zeit 13-14
vlog relax Sauna 20 --note "nach Workout"
vlog fuel "360g Käseleberkäse, 3 Semmeln" --zeit 14:30
vlog day "<Freitext>"      # Gemini zerlegt → Vorschau als vlog-Kommandos → Rückfrage → schreibt
```

- **fitness:** re-exec't in die uv-venv `~/.local/share/uv/tools/fitness-agent` und ruft dieselben
  Funktionen wie `POST /session` (`_freeze_snapshot`, `_write_json`, `_sync_session_to_db`,
  `mirror_session`, `_queue_unreviewed_enrichment`) im eigenen Prozess auf. Identische
  Übung+Sätze werden übersprungen (`--nochmal` hängt an). Firestore-Mirror braucht Netz, keinen
  Server (`--offline` überspringt ihn). `import http.client` + `firebase_admin` MÜSSEN vor
  `fitness.*` importiert werden, sonst überschattet `fitness/http.py` das stdlib-`http`.
- **relax / fuel:** dünne Wrapper um `relax-add` bzw. `fuel-meal log`. `relax-add` setzt Stimmung
  3→4 als Default, wenn `--vorher/--nachher` fehlen.
- **day:** schreibt nie bei offenen Rückfragen (Exit 2); Gemini darf nichts erfinden, Unklares
  (z.B. „360dag") kommt als Rückfrage. Key aus `~/.env/gemini.env`.
- Test ohne echte Daten: `HOME=<scratch> VLOG_FITNESS_ENV=1 <fitness-venv-python> -I vlog fitness … --uid x --offline --no-enrich`
  (Pfade folgen `$HOME`; SQLite-History liegt dann ebenfalls im Scratch).

---

## `bin/vos-firestore` — lokale VOS-Daten ↔ Firestore ohne Server (seit 2026-10-16)

```bash
vos-firestore status
vos-firestore push fuel|fitness|relax|alle [--uid U] [--dry-run]
vos-firestore pull fuel|fitness|relax|alle [--uid U] [--dry-run]
```

- Läuft in der fitness-agent-uv-venv, nutzt `fitness.firestore.*` aus fitness-dev (kein Fork).
- **pull** (Fitness/Fuel) spielt die Handler des `fitness-firestore-daemon` einmalig als
  ADDED-Replay ab (`mirror.on_session/on_journal/on_habits/on_habit_records/on_habit_journals/
  on_nutrition/on_supplements/on_supplements_catalog`) — gleiche rev-Konfliktprüfung,
  `owner_uid`-Schutz und SQLite-Gateway wie der Daemon beim Start. Der Daemon selbst
  (Echtzeit) startet/stoppt mit `fitness-log console` (`console/daemon.py`).
  Nicht enthalten: Katalog-Listener (`inbox`, `kb/exercises` — gehören zum :9150-Prozess).
- **push** nutzt `fitness.firestore.sync.push` / `fuel.push_fuel` / eigenen Relax-Push.
- **UID-Schutz:** nur Operator + `~/vital/Klienten/*/client.json`-UIDs; andere Ordner
  (z.B. `~/.aos/fitness/users/matthias`) und Test-UIDs in Firestore werden gemeldet, übersprungen.
- **Relax:** schreibt im PWA-Format nach `relax/{operator-uid}/sessions/{date}` im Projekt
  `fitness-aos`. Das alte `relax-firestore.py` schrieb nach `relax/default/...` mit einem
  Service-Account des Projekts `relax-aos` und erreichte die PWA nie.
- Bekannt: `sync.push` schreibt bei fehlendem Firestore-Vorsprung immer alles neu (kein
  Skip bei Gleichstand); `remote_wins` bricht bei Simon mit `str > dict` ab (`saved_at` als
  Dict) — pro UID abgefangen. Für einen Stunden-Timer beides vorher beheben.

**Update 2026-10-16 (Daemon-Ablösung):** Fitness-**Sessions** gehen jetzt über das neue Backend
(`python -m backend sync pull|push sessions`, fitness-dev) — `vos-firestore push fitness` ruft
`sync push sessions --uid U` (ohne `--dry-run` mit `--apply`), `pull fitness` ruft
`sync pull sessions --uid …` (Lock + `decide()`). Journal, Habits, Habit-Records und Habit-Journals
zieht `pull fitness` weiter über die Handler des alten Daemons (das neue Backend kennt nur Sessions);
Fuel-Pull nutzt die Daemon-Handler für den Operator und `pull_fuel` für Klienten. Live-Sync während
der Console: `fitness-sync.service` (siehe `fitness-dev/fitness/log/console/CLAUDE.md`).

**Klienten-Namen statt UIDs (2026-10-16):** `vos-firestore pull|push fuel|fitness [KLIENT…]` — Name,
Slug oder Vorname aus `~/vital/Klienten/*/client.json` (z.B. `vos-firestore pull fitness jakob matthias`);
`ich`/`operator`/`coach` = Operator. Trefferreihenfolge exakt → Präfix → Teilstring; mehrdeutig oder
unbekannt bricht mit Liste der bekannten Klienten ab. Relax akzeptiert nur den Operator. `--uid` bleibt
als exakte Alternative.

**Journal & Habits als eigene Pull-Bereiche (2026-10-16):** `vos-firestore pull journal|habits [KLIENT…] [--dry-run]`;
`pull fitness` = Sessions + Journal + Habits. Handler des alten Mirrors schreiben (Format-SOT), aber die
„bereits gesehen"-Listen werden geleert (später in Firestore geänderte Einträge kommen an), eine leere/kaputte
`habits/definitions.json` wird als `.bak-<zeit>` beiseitegelegt (lag als 0-Byte-Datei vor), der Dry-Run läuft auf
einer Kopie und listet exakt neue (+) und geänderte (~) Dateien. Es wird nie lokal gelöscht. **Kein Push:**
Firestore ist die Quelle; ein Push lokaler Reste (z.B. die beiden gelöschten Test-Einträge vom 2026-05-20) würde
in Firestore gelöschte Einträge wiederbeleben.

---

## Repo-Landschaft & Mini-Apps (seit 2026-10-16)

- **`bin/vos-overview`** (nur lesen): Adlerblick über alle Klone/Pointer/Service Worker + abgeleitete Push-Reihenfolge
  (`--plan`, `--sw`, `--fetch`, `--json`). Ausführen tut `vos-release`. Vor jedem Push/Release zuerst `vos-overview`.
- **Kanonisch ist `~/<m>-dev` auf `dev`** (hier arbeitet man, hier pusht `vos-release`). `~/vitalos/<m>-app` (Branch `vitalos`) ist der
  Build-/CI-Checkout. `~/fitness-dev/{6pack,coach,plan}` (nested Submodule) sind **lokale Branches** (`lokal`, kein Upstream; `master` = `origin/master`) — nicht dort
  arbeiten, nicht pushen. Release-Flow für alle Module einheitlich: `vos-release` = dev pushen → `-dev` nach `-app` (Branch `vitalos`) mergen → Pointer bumpen
  (Preflight prüft Konflikte vorab; `.githooks/*`-Konflikte gewinnt dev).
- **`packages/mini-app-shell`** (`@vos/mini-app-shell`): Splash, generischer Service Worker, SW-Register, Stamp-/Vendor-CLI für alle
  Mini-Apps (training/atlas/6pack/plan/coach, später fuel/relax). Consumer bauen standalone (GitHub Actions ohne vitalos) → Paket wird per
  `node packages/mini-app-shell/cli.mjs vendor scripts/mini-app-shell` ins Repo kopiert, `--check` meldet Drift. Bewusste Ausnahme von
  „Kein Doppel-Code“; nicht in `pnpm-workspace.yaml` eintragen (Lockfile-Drift). Doku: `packages/mini-app-shell/README.md`, Stand/Übergabe: `REPORT.md`.

### Branch-Regel für Checkouts (User-Vorgabe 2026-10-16)

- `~/<m>-dev` stehen **fest auf `dev`**, `~/vitalos/<m>-app` **fest auf `vitalos`** — `vos-release` bricht sonst ab, `vos-overview` meldet Abweichungen als „Regel-Verstoß“.
- Agent-/Feature-Branches nie im `~/<m>-dev`-Hauptordner auschecken, sondern als **Worktree**: `git -C ~/<m>-dev worktree add .worktrees/<name> <branch>` (Muster existiert in `~/fitness-dev/.worktrees/`). `.worktrees/` stört `vos-release` nicht.
- Nested Kopien in `~/fitness-dev/{6pack,coach,plan}` stehen auf `master` (= veröffentlichter Pointer), eigene Commits darauf nur in `lokal`.
- `vos-release` ignoriert für die Sauber-Prüfung: Doku (`*.md`, `docs/`), `.claude/`, Firebase-Cache/-Logs, `.worktrees/`. Nie `vos-release` editieren, solange ein Release läuft (Bash liest Skripte stückweise).

### Shell-Service-Worker + Splash (seit 2026-10-16)

- `public/sw.js` gibt es nicht mehr (archiviert: `docs/archive/sw.vitalos-main-v1.js`). Der SW wird beim Build aus **`mini-app.json`** (App `vitalos`) und `packages/mini-app-shell` erzeugt (`pnpm run build:firebase` / `build` → `stamp:sw`: `cli.mjs sw` + `cli.mjs splash`); dabei kommt auch die SW-Registrierung samt `window.__swRegistration` und `sw-update-available` (Settings-Update-Banner) in die `index.html` — die Inline-Registrierung im Quell-HTML ist entfernt.
- Gefundene Fehler des alten Shell-SW (Kopie des Fitness-SW): (1) `STATIC` enthielt `/offline-queue.js`, das in der Shell nicht existiert → `cache.addAll` schlug immer fehl, die Shell wurde nie vorab gecacht; (2) `activate` löschte bei jedem Update den Übungsbilder-Cache `fitness-exercise-images` (Atlas-Spiegel, ~100 MB) und der SW lieferte ihn nie aus; (3) Workout-Benachrichtigungen (`SHOW_WORKOUT_TIMER_NOTIFICATION` aus den eingebetteten Fitness-Views) und `notificationclick` fehlten; (4) `window.__swRegistration`/`sw-update-available` wurden nie gesetzt → Update-Banner und „App aktualisieren" ohne Wirkung; (5) kein `no-cache`-Header für `/sw.js` und `manifest.json` in `firebase.json`.
- Paritätstest alt↔neu: `node packages/mini-app-shell/cli.mjs parity --app vitalos --old docs/archive/sw.vitalos-main-v1.js --ignore activate,install-Precache,Listener,offline-queue.js,"Bild cdn.jsdelivr.net","Workout-Notification (alt)"` → 0 ungewollte Abweichungen (die ignorierten sind genau die behobenen Fehler). Nicht auf einem Gerät getestet.
- Splash: Icon `/icon-192.png`, Akzent `#6ee7b7`, Hintergrund `#0b0e14`.
- `bin/vos-authdomains`: gleicht die Firebase-Auth-Domains mit allen Hosting-Sites/aktiven Preview-Channels ab (`--apply` fügt nur hinzu; Wildcards gibt es nicht). Nach jedem neuen Preview-Channel-Namen laufen lassen.

