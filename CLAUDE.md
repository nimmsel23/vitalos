# VitalOS Shell

> Aktuelle gemeinsame Produktstruktur (2026-11-06): Root-PWA und getracktes
> `prod/` verwenden gemeinsame App-Submodule und ein Root-Lockfile. Aktuelle
> Branch-/Edit-Regeln: [AGENTS.md](AGENTS.md). Orientierung:
> [README.md](README.md), [Produktstruktur](docs/UNIFIED-PRODUCT.md).
> Historische Abschnitte unten zu Deploy-Audits, `~/*-dev` und verschachtelten
> Fitness-Submodulen sind keine aktuellen Arbeitsanweisungen. Keine alten
> Copy-/Deploy-Schritte allein aus diesen Abschnitten ausführen.


## Org-Rolle Claude: CPO

Wenn Claude in der Org als CPO arbeitet, nutze den [CPO-Wissensanker](prod/migration/unified-product/coordination/CPO.md). Der geteilte Skill-Stack umfasst `product-strategy`, `opportunity-solution-tree`, `prioritization-frameworks` und — sobald dessen Plugin/MCP aktiv ist — Claude-mem fuer Memory-Arbeit. Produktpriorisierung bleibt auf Produktentscheidungen begrenzt und richtet die Umsetzung an CEO-freigegebenen Game Maps und Tent-Verdikten aus. Berichte an CEO/CPO/CTO folgen REAL * RAW * RELEVANT * RESULTS; bei Rueckfragen gilt STOP * SUBMIT (Facts + Feelings + Fokus + Fruits). Dieses Dokument bleibt die Shell-/Architektur-Referenz; Produktportfolio und Org-Rollen sind dort nur verlinkt, nicht doppelt beschrieben.


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

### Pointer-Bump fuel-app / fitness-app

Maßgeblicher Ablauf: `dev` → `master` (PR, `vos-release-pr <modul>`) → `vos-release` → Push `~/vitalos` (`docs/DEPLOYMENT.md`). Der alte Schritt-für-Schritt-Ablauf inkl. Stolpersteinen (detached HEAD in `plan/coach-dev`, Mini-Apps nicht mitbumpen, Pre-Build-Test) steht in `docs/POINTER-BUMP-LEGACY.md`.

### Gemeinsamer User-Kontext in Firestore (seit 2026-10-17)

Alles zum Menschen liegt unter `users/{uid}/…` (Rules: `match /users/{uid}/{document=**}`),
App-Daten bleiben in `nutrition|supplements|fitness|relax/{uid}/…`.

| Pfad | Inhalt | Schreiber |
|---|---|---|
| `users/{uid}/meta/profile` | **app-übergreifende** Stammdaten: `gender` (`m`/`f`), `age`, `heightCm`, `weightKg`, `chronicConditions`, `medications` | fuel, fitness, vitalos (Merge-Write) |
| `users/{uid}/meta/settings` | nur fuel-eigene Einstellungen (Ziele, Reminder, …) — Dokument wird bei jedem Save **komplett überschrieben**, deshalb nichts App-Fremdes hineinlegen | fuel |
| `users/{uid}/devices/{deviceId}` | Geräteliste: `app` (`fuel`/`fitness`/`vitalos`), `label`, `registered_at`, `last_seen_at`, `prefs.<app>` (fuel: `prefs.fuel.frontdoor` = Schnelleinstieg) | jede App für ihr Gerät |
| `users/{uid}` (Root-Dokument) | vitalos-Altbestand (Anamnese, split, …) — wird weitergeschrieben | vitalos |
| `fitness/{uid}/profile/metadata` | fitness-Altbestand + Coach-Daten (`clientStatus`, Anamnese) — Coach-Panel liest hier | fitness |

Regeln:
- Lesen: `meta/profile` gewinnt; fehlende Felder werden einmalig aus dem Altbestand der jeweiligen
  App übernommen (Backfill). Schreiben: `meta/profile` **und** Write-through auf den Altbestand
  (fitness, vitalos), solange Coach-Tools dort lesen. fuel schreibt die Felder nur noch ins Profil.
- Die Geräte-ID liegt im localStorage und gilt **pro Origin**: dasselbe Telefon hat in fuel und
  fitness zwei Einträge. Gelöschter Browserspeicher = neues Gerät (fuel fragt dann den
  Schnelleinstieg neu ab, `FrontdoorChooser`).
- Neues geteiltes Feld → in allen drei Apps gleichzeitig aufnehmen
  (`fuel-dev/src/client/lib/db/firestore/profile.js`, `fitness-dev/src/lib/db/firestore/user.js`
  inkl. der Kopien in `frontend/`, `coach/`, `plan/`, `plan/coach-dev/`, und
  `vitalos/src/shell/db/settings.js`).

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

**Node-Backends sind ausgelagert (Stand 2026-11-04):** Sie liegen nicht mehr in den Modul-Repos und damit nicht mehr im vitalos-Dependency-Baum (fastify, hono, better-sqlite3, firebase-admin, pino, web-push). Neue Repos, privat, Branch `main`, lokal unter `~/dev/`:
`~/dev/fuel-backend` (aus `fuel-dev/src/server`), `~/dev/fitness-backend`, `~/dev/plan-backend`, `~/dev/fuel-frontend` (aus `fuel-dev/frontend`).
Sie finden ihr Modul über Geschwisterordner (`../fuel-dev`) oder per `FUEL_ROOT`/`FITNESS_ROOT`/`PLAN_ROOT`/`FUEL_BACKEND_DIR`/`FUEL_FRONTEND_DIR`.
`fuel-dev/deploy.sh` rsynct das Backend aus `../fuel-backend` ins Staging. Der Python-Teil (`coach-api` :9150, `fitness-api`) macht alles außer Firestore/Firebase.
Neue Backend-Dependencies gehören in diese Repos, nicht in `~/vitalos/package.json`/Modul-`package.json`. Details: `fuel-dev/AGENTS.md` → „Ausgelagerte Teile“.

---

## Wichtige Regeln

- **Kein Doppel-Code.** Alles was in fitness-app / fuel-app / habit-app existiert wird via Alias importiert, nicht kopiert.
- **`src/shell/` ist SSOT** für Navigation, Settings, Sidebar — nicht fitness-app.
- **Setup-Invariante:** Im Shell-Betrieb hat keine App einen eigenen Settings-Einstieg über App-Spezifisches hinaus — Generisches (Auth, Theme, SW, Profil) nur im VitalOS-Setup-Tab (Details: `src/shell/CLAUDE.md`).
- **`src/components/`** nur für vitalos-eigene UI (WeightChart, UserProfile, ErrorBoundary). fitness-app Components → via `@components`.
- Vor Edits in shell/: prüfen ob Komponente wirklich vitalos-spezifisch ist oder aus einem Sub-Repo kommen sollte.
- **Immer committen, nie fragen.** Sobald eine Aufgabe (eigene oder die eines Subagents) einen funktionierenden Zwischen- oder Endstand erreicht hat: sofort committen (Submodule zuerst, dann Meta-Repo-Pointer-Bump), ohne vorher nachzufragen. Grund: verlorene Arbeit, wenn der Agent-Context vor dem Commit endet (2026-08-06 Vorfall). Das überschreibt die generelle "nie ohne Erlaubnis committen"-Regel für dieses Repo. **Push bleibt separat** — nur committen, NICHT pushen, außer der User sagt es explizit.

---

## Historischer Deploy-Flow (Audit 2026-07-15/16)

**Firebase-Projekt für ALLES: `fitness-aos`.** Jede App hat eine eigene
Hosting-*Site* im selben Projekt (alle `.firebaserc` → `fitness-aos`):

| Repo | Hosting-Site | Deploy-Pfad |
|---|---|---|
| vitalos (Shell) | `vitalos` → vitalos.web.app | CI `deploy-shell.yml` |
| fitness-app | `fitness-aos` → fitness-aos.web.app | CI `deploy-fitness.yml` |
| vos-fitness (Ordner) | `fitness-vos` → fitness-vos.web.app | CI `deploy-vos-fitness.yml` (seit 2026-10-17) + lokal via `vos-fitness/firebase.json`, automatisiert seit 2026-10-13 über `.githooks/pre-push` (siehe unten) |
| fuel-app | `fuel-vos` → fuel-vos.web.app | CI `deploy-fuel.yml` / `fuel-app/firebase.json` |
| fuel-os | `fuel-os` → fuel-os.web.app | lokal via `fuel-os/firebase.json` |
| fuel-app (Mini-Apps, seit 2026-10-16) | `vos-fuel-log`, `vos-fuel-supplements`, `vos-fuel-mikros`, `vos-fuel-protokoll` → je `<site>.web.app` | aus **demselben** Repo fuel-dev (Targets `log`/`supplements`/`mikros`/`protokoll` in `firebase.json`, Build `VITE_SOLO=<tab>`, `pnpm run deploy:solo:<x>`); Hosting-Target der vollen App heißt jetzt `client` (`--only hosting:client`). Lokale Checkouts als Submodule `vos-fuel-<x>-app` (alle vier = Klon von fuel-dev, Branch `vitalos`, `ignore = untracked`; bewusst NICHT in `pnpm-workspace.yaml`) — Arbeitskopie bleibt `~/fuel-dev` (Branch `dev`). **Bewusst KEINE CI-Deploys** für die vier Mini-Apps: stable-prod-/Fallback-Apps, die nie durch einen versehentlichen Pointer-Bump oder Push überschrieben werden dürfen; Deploy nur manuell und gewollt (`pnpm run deploy:solo:<x>` in fuel-dev). `deploy-fuel.yml` deployt ausschließlich `hosting:client` |
| journal-app / habit-app / learn-dev | je eigene Site | CI `deploy-journal/habits/learn.yml` |

**Fuel-Mini-Apps als Wrapper `vos-fuel-mini/` (seit 2026-10-17):** Ein Ordner statt vier Klonen — analog `vos-fitness`.
Code kommt unverändert aus `fuel-app` (`VITE_SOLO=log|supplements|micros|report`); `vos-fuel-mini/vite.config.cjs` lädt
`../fuel-app/vite.config.cjs` und biegt nur `root`/`outDir` um (Output `vos-fuel-mini/dist-<app>/`), `scripts/build.mjs`
baut + stempelt (mini-app-shell) wie `fuel-app/scripts/stamp-solo.mjs`. Eigene `firebase.json`/`.firebaserc`
(Targets `log`/`supplements`/`mikros`/`protokoll` → Sites `vos-fuel-<x>`). Deploy manuell, bewusst keine CI:
`cd vos-fuel-mini && npm run deploy:<log|supplements|mikros|protokoll>` bzw. `npm run deploy:all`.
Stand der Mini-Apps = Submodule-Pointer von `fuel-app`. Die vier Submodule `vos-fuel-*-app` (Klone von fuel-dev) sind damit
überflüssig, aber noch nicht entfernt.

**Stand 2026-11-04 (ersetzt die Aussagen zu den vier Fuel-Mini-Apps oben):** Die Submodule `vos-fuel-*-app` und der Wrapper `vos-fuel-mini/` sind entfernt.
Die vier Mini-Apps (`vos-fuel-log|supplements|mikros|protokoll`) deployt jetzt die CI von fuel-dev tabellengesteuert (`scripts/miniapps.json`,
`.github/workflows/deploy-miniapps.yml`, Push auf master per Diff, `automerge.yml` dispatcht nach dem Release-Merge) — wie die Fitness-Mini-Apps.
Die frühere Regel „bewusst keine CI“ gilt nicht mehr. Geplant: `vos-fuel/` als Wrapper (Site `fuel-vos`) analog `vos-fitness`, `fuel-os` bleibt der alte fuelctx-Stand.

**Fitness-Rollen sind absichtlich getrennt:** `~/fitness-dev` ist der OG-Source-Code
und primäre Dev-Worktree; `~/vitalos/fitness-app` ist der in VitalOS integrierte
Shell-Teil/Submodule-Checkout und deployed nach `fitness-aos.web.app`;
`~/vitalos/vos-fitness` ist die separate, schlanke VOS-Standalone-Variante und
deployed nach `fitness-vos.web.app`. `vos-fitness` importiert absichtlich nur
die noetigen Bausteine aus `fitness-app` und soll schlank bleiben, statt die
volle `fitness-app`-Shell zu duplizieren. Zweck: eine live Fitness-Variante,
die einfach funktioniert, auch wenn die VitalOS-Shell oder die AOS-Version
gerade nicht gesund ist. Diese drei Pfade nicht zusammenziehen.

**vos-fitness Auto-Deploy (Ordner bis 2026-10-17 `fitness-vos/`, Site-ID bleibt `fitness-vos`; `vos-fitness` ist bei Firebase global vergeben) (seit 2026-10-13):** `.githooks/pre-push` löst bei
jedem Push nach `master`, der Dateien unter `vos-fitness/` ändert (außer
`.md`/`.bak`/eigenem Build-Output `dist-firebase/`/`.firebase/`), automatisch
`cd vos-fitness && npm run firebase` aus (Build + `firebase deploy --only
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

### 6pack: Standalone-Deploy kommt aus `6pack-dev` (seit 2026-10-24)

`vos-6pack.web.app` (Hosting-Target `sixpack`) wird **nicht** mehr aus dem Meta-Repo deployt:
`deploy-6pack.yml` liegt archiviert in `.github/workflows.disabled/`. Ein Push auf den Branch `vitalos` in
`6pack-dev` löst dort „6Pack deploy (preview + standalone)“ aus (Schritt „Standalone 6Pack (live)“, Secret
`FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS`) — das ist das Release. Der Pointer `6pack-app` bleibt im Meta-Repo,
weil die Shell `6pack-app/SixPackPromiseCard.jsx` einbindet (6Pack-Tab); `deploy-shell.yml` läuft bei jedem
Master-Push außer reinen Doku-Änderungen und baut ihn mit. Vorher deployten zwei Pipelines dieselbe Site.

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

### Release-Stolpersteine (2026-11-04)

- Nach Änderungen an Modul-`package.json` scheitert `vos-release` am Lockfile: `pnpm install --no-frozen-lockfile --lockfile-only` im Root, `pnpm-lock.yaml` committen. `pnpm update <pkg>` bläht das Lockfile auf, ohne zu fixen.
- `relax-app`/`plan-app`: Der pre-push-Hook versucht ein lokales `firebase deploy` und scheitert mit Permission-Fehler. Dort `git push --no-verify` (Deploy läuft über die CI) — nur wenn der User es weiß.
- Automerge der Release-PRs schlägt manchmal fehl: manuell `gh pr merge <nr> --merge -R nimmsel23/<repo>`.
- Shell-CI prüfen: `gh run list --workflow "Deploy VitalOS Shell" --limit 3`.
- `functions/package-lock.json` (npm) ist ein eigenes Lockfile neben `pnpm-lock.yaml`; Dependabot-Zahlen sinken erst nach dem Rescan.

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

### Bekannte Baustellen

Liste (Stand 2026-08-16, teils überholt) in `docs/BEKANNTE-BAUSTELLEN.md`.

## `bin/vlog` / `bin/vos-firestore` (seit 2026-10-16)

- `vlog fitness|relax|fuel|day …` loggt ohne laufende Server; `vos-firestore status|push|pull fuel|fitness|relax|alle [KLIENT…] [--dry-run]` gleicht lokale Daten mit Firestore ab (Pull-Quelle Firestore, **kein Push** für Journal/Habits; nur Operator + Klienten-UIDs).
- Details, Fallen (Import-Reihenfolge, UID-Schutz, Daemon-Ablösung): `docs/CLI-VLOG-VOS-FIRESTORE.md`.

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

`public/sw.js` existiert nicht mehr: SW und Splash werden beim Build aus `mini-app.json` + `packages/mini-app-shell` erzeugt (`stamp:sw`). `bin/vos-authdomains` gleicht Auth-Domains ab (`--apply`). Fehlerhistorie des alten SW, Paritätstest und Splash-Werte: `docs/SHELL-SERVICE-WORKER.md`.

## Org-Taskwarrior (global) — gilt fuer alle Agenten der VitalOS-Org

Verbindlich fuer alle Agenten (Vibe, Claude, Codex, Gemini) in Org-Kontexten
(Owner-Weisung 2026-11-07):

1. EINE globale Org-Task-DB — KEINE eigenen Rollen- oder Repo-DBs mehr:
   `TASKRC=~/.local/state/vitalos-org/taskrc` (DB liegt daneben in `task/`).
   Alte Repo-DBs sind archiviert unter `~/.local/state/vitalos-org/archive-repodb/`.
2. Daniels private Taskwarrior-DB (`~/.task`, u. a. Hotlist `+hot`) bleibt
   TABU fuer Schreibzugriffe — nur lesend (CEO-Runde: Task `status:pending +hot`).
3. Rolle = Tag: Jeder Agent taggt seine eigenen Aufgaben mit seiner Rolle:
   `+ceo`, `+cto`, `+al`, `+pm`, `+alpha`, `+betta` …
4. Abteilung/Repo = project: `project:fitness-dev`, `project:journal-dev`,
   `project:vitalos-prod`, `project:dotfiles`, `project:aos` …
5. Prio-Encoder (in der Org-taskrc verankert):
   - `+hit` und `+br` sind EIN Tier (Hits = Big Rocks, Koeffizient 8.0) —
     hoechste Dringlichkeit, `+hit` = `+br`.
   - `+lr` 2.0 (Little Rocks).
   - `+hot` 1.0 — NUR Potential/Sichtbarkeit, wird NIE automatisch ausgefuehrt;
     ob ein Potential jetzt anfaellt, entscheidet der Door War (Sonntagsrunde).
   - `+s` -1.0 (Sand, Zeitverschwendungsroutine).
   - `+go` ist KEINE Prioritaet und bewirkt nichts — Freigaben laufen ueber
     die Rollen (CTO-Freigabeprozess), nicht ueber Urgency.
6. Aufgaben IMMER per UUID anfassen (`task <uuid> modify|done|info`), NIE per
   ID — IDs renummerieren sich nach jedem `done` (Fehltreffer-Gefahr).
7. Guard: orgsh und die Runner verweigern den Lauf, wenn die Org-taskrc fehlt —
   kein stiller Rueckfall auf die Privat-DB.
8. Uebersicht/Rang: `TASKRC=~/.local/state/vitalos-org/taskrc \
   ~/.org/venv/bin/python ~/aos/bin/aos door plan quadrants --json`
   (Eisenhower-Sicht Q1–Q4).
