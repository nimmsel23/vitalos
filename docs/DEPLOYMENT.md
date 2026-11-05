# Deployment — Branch-Modell und Release-Weg

Stand: 2026-10-30. Löst die Beschreibung in `CLAUDE.md` („Deploy-Flow Gesamtbild“, „Der EINZIGE aktive Deploy-Pfad
ist die CI im Meta-Repo“) für die App-Repos ab; die Shell bleibt beim Meta-Repo. Historie und Befund des
PR-Umbaus: `CI-DEPLOY-PR-FLOW.md`.

## Release-Weg: dev → master → vitalos

```
dev ──(PR, vos-release-pr)──▶ master ──(vos-release)──▶ vitalos-Branch + Pointer ──▶ Shell
 │                             │                                                      │
 Edits, Previews              Standalone-Prod (nur CI)                               stable Prod
```

| Branch | Rolle | Lokal? | Deploy |
|---|---|---|---|
| `dev` | Edits und Previews | ja (`~/<modul>-dev`, fest auf `dev`) | Push → Preview-Channel `dev` (24 h), PR → PR-Channel; `Check (<App>)` auf PRs |
| `master` | **Standalone-Prod** der App (z. B. `journal-vos.web.app`) | nein, muss nicht existieren | Push auf `master` → `Live Deploy (<App> master)`, **nur per CI** |
| `vitalos` | Stand der App **für die Shell** (`~/vitalos/<x>-app` ist darauf ausgecheckt) | als `-app`-Checkout im Meta-Repo | kein eigenes Deploy; der Pointer im Meta-Repo wird von der Shell-CI gebaut |

`master` ist der Default-Branch aller neun Repos (journal, fuel, habits, learn, relax, plan, 6pack, skills, fitness).

Die Standalone-Apps sind gegenüber der Shell **Staging**: `master` darf der `vitalos`-Stand vorauslaufen, die
Shell kann auf einem älteren Commit stehen, solange sie zuverlässig läuft. Die Shell (`vitalos.web.app`) ist die
stable Prod — das, was später an Premium-Abonnenten ausgeliefert werden kann.

## 1. dev → master (Standalone-Prod)

```bash
vos-release-pr <modul>            # PR dev -> master öffnen (oder vorhandenen zeigen)
vos-release-pr <modul> --status   # Checks und Mergebarkeit
```

Module: `fitness fuel habits journal learn relax plan 6pack skills`. Voraussetzung: `dev` ist gepusht und
konfliktfrei gegen `origin/master`.

Ablauf in der CI (je Repo, `.github/workflows/`):

1. `check.yml` — `Check (<App>)`: Build (und Tests, soweit vorhanden) ohne Deploy, ohne Firebase-Secrets.
2. `preview-dev.yml` — Preview-Channel mit PR-Kommentar.
3. `automerge.yml` — nach grünem Check mergt der Workflow den Release-PR `dev → master` mit **Merge-Commit**
   (kein Squash, sonst läuft `dev` von `master` weg). Ein Merge mit `GITHUB_TOKEN` löst keinen Push-Trigger aus,
   deshalb startet der Workflow danach `deploy-master.yml` per `workflow_dispatch` (6pack: `deploy.yml`).
   Rot bleibt liegen. Der Workflow läuft als `workflow_run` und wirkt nur, wenn er im Default-Branch liegt.
4. `deploy-master.yml` — `Live Deploy (<App> master)`: checkt das Meta-Repo `vitalos` (Ref `master`) mit
   Submodulen aus (liefert die Nachbar-Repos für die Cross-Repo-Aliase), setzt `<x>-app` auf `$GITHUB_SHA`,
   installiert mit `pnpm install --no-frozen-lockfile` (Standalone-Prod darf dem Lockfile des Meta-Repos
   vorauslaufen), baut und deployt dieselben Hosting-Targets wie früher der Meta-Workflow.

Ein direkter Push auf `master` deployt ebenfalls (`push: branches: [master]`) — gedacht für Hotfixes, normal ist der PR.

Produktions-Sites (Projekt `fitness-aos`): journal → `journal`, `v2`, `door`, `voice`, `game`, `tent`
(`journal-vos`, `vos-journal`, `vos-door`, `vos-voice`, `vos-game`, `vos-tent`); fuel → `fuel-vos`; fitness →
`fitness-aos` (+ Training/Atlas); plan → `vos-plan`; 6pack → `vos-6pack`; skills → `vos-skills`; learn, habits, relax
je eigene Site. `fuel-os.web.app` hat weiterhin einen eigenen Standalone-Weg.

## 2. master → vitalos (Shell-Promotion)

```bash
vos-release [modul ...]       # oder --all; --dry-run zeigt nur, was passieren würde; --yes überspringt Rückfragen
vos-overview                  # vorher: Klone, Sync, Pointer (nur lesen)
```

Pro Modul:

1. Preflight (lesend, `git merge-tree`): lässt sich `origin/master` ohne Konflikt nach `vitalos` mergen? Erlaubte
   Konflikte: Backup-Dateien, Hooks, Doku (`master` gewinnt). Alles andere bricht ab, **bevor** irgendetwas
   gepusht wird.
2. Im `-app`-Checkout (`~/vitalos/<x>-app`, fest auf `vitalos`): `origin/master` holen, nach `vitalos` mergen,
   `vitalos` pushen. `master` wird nie lokal gebraucht — es reicht der Fetch.
3. Am Ende: Lockfile-Check (`pnpm install --frozen-lockfile --lockfile-only`); hat sich `pnpm-lock.yaml`
   geändert, wird es **mitcommittet**. Dann Pointer-Bump aller geänderten `-app`-Ordner in einem Commit und Push
   von `master` im Meta-Repo → `deploy-shell.yml` baut die Shell.

Das Meta-Repo deployt nur noch: Shell (`deploy-shell.yml`), Firestore-Rules (manuell), Push-Functions,
`vos-fitness`. Die früheren App-Deploys (`deploy-fitness/fuel/habits/journal/learn/relax/plan/skills.yml`) liegen in
`.github/workflows.disabled/` und werden nicht mehr ausgeführt.

## Fitness, Plan, 6Pack, Skills

`fitness-dev` trägt Plan, 6Pack und Skills **nicht mehr als Gitlinks**. Der Fitness-Build (und Shell, Habits, Learn,
vos-fitness) löst sie über die Nachbar-Checkouts auf: `../plan-app` | `../plan-dev`, `../6pack-app` | `../6pack-dev`,
`../skills-app` | `../skills-dev` (Resolver `vite-miniapp-submodules.mjs`; CSS-Importe über die Aliase
`@vos-6pack/…` und `@vos-skills/…`; Tailwind-Quellen und `build:plan-data` ebenso). Die drei sind normale Module
wie die anderen. Alte verschachtelte Checkouts: `~/.bak-nest-submodules/`.

## Regeln

- `~/<modul>-dev` stehen fest auf `dev`, `~/vitalos/<x>-app` fest auf `vitalos` (siehe `CLAUDE.md`).
- Agent-/Feature-Branches als Worktree: `git -C ~/<modul>-dev worktree add .worktrees/<name> <branch>`.
- Vor jedem Release `vos-overview`. Beim Shell-Release gehen alle lokal unpushed Commits im Meta-Repo mit raus.
- Firestore-Rules nur aus `~/vitalos` (`deploy-firestore-rules.yml` oder lokal), nie aus einem App-Repo.
- Fuel-Mini-Apps (`vos-fuel-*`) laufen nie per CI, nur manuell.

## Fehlerbilder

- **Alle Deploys rot im Schritt „Install“:** `ERR_PNPM_OUTDATED_LOCKFILE` — `pnpm-lock.yaml` im Meta-Repo passt nicht
  zu einer `package.json` eines Moduls (2026-10-29: `pino` in `fuel-app`). Der Lockfile-Check in `vos-release`
  committet das Lockfile jetzt mit; manuell: `pnpm install --no-frozen-lockfile`, committen, pushen. Meta-Workflows
  haben keinen Pfadfilter auf das Lockfile — nach dem Fix den Shell-Push abwarten bzw. betroffene Workflows per
  `gh workflow run` starten.
- **Standalone-Live-Deploy rot, `ERR_PNPM_OUTDATED_LOCKFILE`, direkt nach einem Release mit Dependency-Änderungen:** erwartet
  (Reihenfolge, siehe „Stand 2026-11-01"). `vos-ship` zieht den Root-Lockfile nach und startet den Run neu; manuell:
  `pnpm install --lockfile-only --no-frozen-lockfile` in `~/vitalos`, nur `pnpm-lock.yaml` committen, `vos-release`
  wiederholen, dann `gh workflow run "Live Deploy (<App> master)" -R nimmsel23/<repo> --ref master`.
- **`Deploy VitalOS Shell` rot mit `Could not resolve "../../<app>/…" from "src/shell/…"`:** Ein Modul hat eine von der Shell
  importierte Datei entfernt oder verschoben. Shell-Import anpassen (Beispiel 2026-11-01 oben). Prüfen, bevor man pusht:
  alle `../../<x>-app/…`-Importe unter `src/` und `vos-fitness/` müssen am neuen Pointer existieren.
- **Fitness-Dependabot scheitert beim Skills-Checkout:** `fitness-dev` braucht `SKILLS_DEPLOY_KEY` als Dependabot-Secret; der passende öffentliche Schlüssel muss in `skills-dev` als read-only Deploy Key hinterlegt sein. `Permission denied (publickey)` bedeutet meist, dass beide Schlüssel nicht zusammenpassen.
- **Firebase-Preview für Dependabot:** Der Preview-Deploy benötigt einen Firebase-Service-Account. Diesen nicht als Dependabot-Secret freigeben; Fitness-PR [#15](https://github.com/nimmsel23/fitness-dev/pull/15) überspringt den Preview-Deploy für Dependabot, während der separate Check Lint und Build ausführt. Bis PR #15 gemergt ist, ist diese Ausnahme noch nicht aktiv.
- **Habits-/Learn-Build findet `views/SixPack/workoutDoc.js` nicht:** Der Resolver `miniAppSubmodulePlugin` fehlt oder
  zeigt auf einen Quellbaum ohne Nachbar-Checkout. Habits bindet ihn zusätzlich für `~/vitalos/fitness-app` ein.
- **Logs:** `gh run list -R nimmsel23/<repo>`, `gh run view <id> --log-failed`; Stand der Live-Sites am
  `Last-Modified` von `https://<site>.web.app/sw.js` (Build-Stempel `vos-<app>-v<build>`).

## Changelog / Release-Dialog

Die Release-Notizen („Was ist neu“) kommen aus `vos-release-info.mjs` (SSOT `packages/mini-app-shell`, in den Repos als
`scripts/vos-changelog/` bzw. `scripts/mini-app-shell/` vendored: `node ~/vitalos/packages/mini-app-shell/cli.mjs
vendor-changelog <ordner>`, Drift prüfen mit `--check`). Es zählen nur Commits, die Dateien unter `src/views`
(bzw. `src/client/views`) ändern. **Nicht** in den Changelog gelangen: Merge-Commits, Commits mit den Präfixen
`docs`, `chore`, `ci`, `build`, `test`, `refactor` sowie `fix|feat|perf|style` mit Scope `deps`, `ci`, `build`,
`release`, `tooling`, `tests` — und damit alle reinen Doku-/Markdown-Änderungen (Stand 2026-10-29, in allen neun Repos
neu vendored; vorher hatten die Kopien den Filter nicht).

## Stand 2026-11-01 — `vos-ship`, Lockfile, Standalone-Zielbild, Shell-Kopplung

**Ein Befehl:** `vos-ship <modul>` (Kurzaufruf `fitness-ship`) macht `dev` → `master` (PR) → `vitalos` in einem
Lauf: Preflight → PR → CI-Checks → Auto-Merge → Live-Deploy → `vos-release <modul>` → Nachlauf. `--functions` hängt
für `journal` oder `fitness` den app-isolierten Push-Functions-Deploy samt Run-Warten an. `bin/gh-run-check` wartet
auf einen Actions-Run per ID/URL oder sucht den letzten Run eines Workflows und meldet Abschluss sowie fehlgeschlagene
Schritte kompakt. Beispiel: `vos-ship journal --functions --yes` veröffentlicht zusätzlich die Journal-Push-Function.
`--dry-run` ändert nichts,
`--yes` nur nach ausdrücklicher Freigabe. Bisher nur mit `fitness --dry-run` gegen die echte Umgebung gelaufen; die
Wartepunkte (Schritte 2–5, 7), Lockfile-Wiederholung und Functions-End-to-End-Strecke wurden nicht in einem kompletten
`vos-ship`-Lauf durchlaufen. `gh-run-check` wurde gegen einen echten fehlgeschlagenen Functions-Run geprüft.
`vos-release-pr` brach bei mehr als 30 Commits mit Exit 141 ab (SIGPIPE durch `git log | head` unter `pipefail`) — behoben.
`vos-release` toleriert im `-app`-Worktree eine reine `link:`-Umschreibung in `pnpm-lock.yaml` (pnpm schreibt relative
`link:`-Pfade je nach Standort um); echte Lockfile-Änderungen blockieren weiter.

**Wann laufen die Meta-Workflows?**

- `deploy-shell.yml`: bei **jedem** Push auf `master`, ausgenommen reine Doku (`*.md`, `*.mdx`, `*.txt`, `**/AGENTS.md`,
  `**/docs/**`). Installiert mit `--frozen-lockfile` gegen die **gepinnten** Submodule. Ein Lockfile-Push mit neuen
  Dependencies, solange der Pointer noch auf das alte Modul zeigt, macht ihn rot → **Lockfile und Pointer gehören in einen
  Push** (so arbeitet `vos-release`).
- `deploy-vos-fitness.yml`: laut Daniel Altlast aus der Zeit vor den Master-Checkouts der Standalone-Apps. Läuft nur bei
  `vos-fitness/**`, dem `fitness-app`-Pointer, `firebase.config.js` oder der Workflow-Datei. Noch nicht abgeschaltet.
- Die Standalone-Live-Deploys (`Live Deploy (<App> master)`) checken **heute noch dieses Meta-Repo** aus und installieren
  gegen den Root-Lockfile — der PR-Merge löst sie vor dem Lockfile-Sync aus. Folge: bei geänderten Dependencies ist der
  erste Run einmal rot (`vos-ship` startet ihn nach dem Sync neu).

**Zielbild (Entscheidung Daniel, 2026-11-01): Alle Standalone-Deploys laufen aus den `master`-Checkouts der eigenen Repos,
nicht mehr aus dem Meta-Repo.** Das Meta-Repo gehört der Shell. Umsetzung für Fitness: `fitness-dev/.github/workflows/
deploy-standalone.yml` (siehe `fitness-dev/docs/DEPLOY.md`, Abschnitt 4); Build-Test auf `dev` grün, **Umschaltung der
Live-Pipeline steht aus**. Voraussetzung für jedes Modul: Es muss auf `master` mit `pnpm install --frozen-lockfile`
standalone installierbar sein. Geprüft (frische Klone): `6pack-dev`, `skills-dev`, `learn-dev`, `relax-dev` ok;
`plan-dev` war defekt und ist auf `dev` behoben; `coach-dev` (Paket nicht im Lockfile, 19 Dateien mit Aliasen) und
`habits-dev` (14 Dateien) nutzen `@vos/cross-app-aliases` wirklich und brauchen eine eigene Entscheidung.

**`@vos/cross-app-aliases` in Standalone-Repos nicht (wieder) einführen:** ein relatives `link:`/`workspace:*` macht den
Lockfile abhängig vom Installationsort und lässt sich außerhalb dieses Workspaces nicht installieren. Entfernt aus
`fitness-dev` (nur `@relax`/`@learn` gebraucht) und `plan-dev` (nur `@learn`); beide lösen über `siblingDir()` in
`vite.config.js` auf.

**Shell-Kopplung:** Die Shell importiert alle Apps als Submodule auf ihrem `vitalos`-Branch (stabiler Stand nach `master`).
Shell-Code im Meta-Repo verweist mit Pfaden wie `../../fitness-app/src/lib/…` in die Apps. Entfernt ein Modul eine dort
importierte Datei, bricht der Shell-Build erst nach dem Push — obwohl das Modul-Release grün ist. Vorfall 2026-11-01:
`fitness-dev` entfernte `src/lib/sixpackPush.js` (6Pack-Push gehört nur der 6Pack-App), `src/shell/SixPackApp.jsx`
importierte sie weiter → `Could not resolve …`, `Deploy VitalOS Shell` rot (Live-Shell blieb auf dem letzten grünen
Stand). Fix: Import und `enablePush` aus der Shell entfernt (die 6Pack-Karte zeigt einen Hinweis).
`6pack-dev/standaloneSync.js::enableSixpackPush` ist **nicht** für die Shell geeignet (eigene Firebase-Instanz, doppelt das
Bundle); die saubere Lösung ist ein shell-taugliches Push-Modul aus `6pack-dev` (Release dort vor dem Shell-Import).

## Hook-Tipps

Die Pre-Push-Hooks (journal, fuel, habits, fitness, relax) zeigen beim Push von `dev` den Weg: `vos-release-pr <modul>`
(dev → master) und `<modul>-release` (master → vitalos). Die `*-release`-Wrapper in `~/vitalos/bin` rufen
`vos-release <modul>` auf, das ist die Shell-Promotion — nicht der Weg nach `master`.

## Branch-Schutz (seit 2026-10-29)

- **`master` der neun App-Repos:** Required Check `check` (Job-Name aus `check.yml`, Workflow „Check (<App>)"), Force-Push und
  Löschen gesperrt, keine Pflicht-Reviews, `enforce_admins` aus (Hotfix-Push durch den Owner bleibt möglich), **kein**
  „Branch muss aktuell sein" (`strict` aus) — `dev` liegt durch Merge-Commits immer etwas hinter `master`, mit `strict`
  käme der Auto-Merge nie durch. Kein „Linear history", der Auto-Merge nutzt Merge-Commits.
- **Meta-Repo `vitalos` `master`:** nur Force-Push und Löschen gesperrt (`vos-release` pusht den Pointer-Bump direkt).
- **Ohne Schutz:** `dev` und die `vitalos`-Branches der App-Repos (`vos-release` pusht dort direkt).
- Getestet mit skills PR #5: Check grün → Auto-Merge → `Live Deploy (Skills master)` grün.
- Zurücknehmen: `gh api -X DELETE repos/nimmsel23/<repo>/branches/master/protection`.

## Noch offen

- ~~Branch-Schutz auf `master`~~ — gesetzt am 2026-10-29, siehe „Branch-Schutz".
- Weg PR → Auto-Merge → Deploy ist nur mit `skills-dev` durchgespielt (PR #1, 2026-10-29); die anderen Module sind
  gleich aufgebaut, aber ungetestet.
- `dev` kennt die `master`-Workflows teils noch nicht; sie kommen beim ersten Release-PR über den Merge.
- Lokale Pre-Push-Hooks einzelner Repos (z. B. `plan-dev`) können beim Push auf `vitalos` lokal deployen — prüfen.
- Stand der Offline-first-Umbauten: nicht im Browser getestet (siehe `~/OFFLINE-FIRST.md`).
- **Standalone-Deploys auf die eigenen Repos umstellen** (Zielbild oben): Fitness-Workflow ist vorbereitet, Umschaltung von
  `deploy-master.yml` auf `deploy-standalone.yml` steht aus; danach dieselbe Umstellung für die übrigen Module.
- **`coach-dev`, `habits-dev`:** `@vos/cross-app-aliases` wird wirklich genutzt (19 bzw. 14 Dateien) — Standalone-Install auf
  `master` klären (Paket im Lockfile / Aliase über `siblingDir()`).
- **`plan-dev`-Release:** Fix liegt auf `dev` (`8097ef5`), `master` fehlt noch; auf `dev` warten 13 Feature-Commits mit.
- **Option C:** vor dem Push von `vitalos master` prüfen, dass alle App-Importe der Shell am neuen Pointer existieren.
- **6Pack-Push in der Shell:** shell-taugliches Push-Modul aus `6pack-dev` bereitstellen; bis dahin ist `enablePush` in
  `src/shell/SixPackApp.jsx` aus.
- **`deploy-vos-fitness.yml`** prüfen und ggf. abschalten (Altlast).
- `vos-ship` in einem echten Release (nicht nur `--dry-run`) erproben.

## Coach standalone (2026-11-01)

`vos-ship coach --yes` delegates to `~/dev/coach-dev/bin/coach-release`, dispatches the Coach-owned workflow for published `dev`, waits and verifies its live SHA. Coach is not a VitalOS app/submodule and does not require a Shell pointer bump. `--dry-run` is read-only. Source must be published before shipping; local uncommitted changes are excluded.

Rules stay central: Coach owns its `firestore.rules.part`. Run `node scripts/import-coach-rules.mjs [coach-checkout] [published-commit]`, then `node scripts/build-rules.mjs`; commit the imported fragment and composed rules. Plan/Skills/Journal fragments continue to be imported from their pinned sources. Deploy all rules via `deploy-firestore-rules.yml` in this repository. No per-app rules deployment and no Coach application build dependency.

## Update 2026-11-05 — Standalone-Live-Deploys laufen aus den eigenen master-Checkouts

Relax, Plan, Habits, Journal, Fuel und Skills deployen wie Fitness: `deploy-master.yml` checkt **nur das eigene
Repo** (`fetch-depth: 0`, damit der Changelog bei `workflow_dispatch` `git log <parent>..HEAD` lesen kann) und die
benötigten Nachbarn als `master`-Klone daneben, jeweils mit eigenem Lockfile (`--frozen-lockfile --ignore-scripts`),
baut und deployt im eigenen Ordner. Das Meta-Repo `vitalos` wird für Standalone-Deploys nicht mehr ausgecheckt;
Branch `vitalos` und die Submodul-Pfade (`fitness-app`, `plan-app`, …) bleiben unverändert der Shell-Weg.

| App | Nachbarn (master) | Besonderheit |
|---|---|---|
| Relax, Skills | – | Skills: `--ignore-workspace` |
| Plan | relax, learn, fitness | `publicHoistPattern: ['*']` in `pnpm-workspace.yaml` (preserveSymlinks) |
| Habits | fitness, fuel, relax, 6pack, plan, skills | eigenes Submodul `journal/` extra installieren; `build:kb-data` in fitness-dev |
| Journal | fitness, fuel, relax, habits, 6pack, plan | `build:kb-data` in fitness-dev |
| Fuel | fitness, habits, journal, relax, 6pack, plan | `build:kb-data`, Firebase-Config aus Secret |

Build-Test vor dem Merge: `git push origin dev:ci-test/<name>` (Nachbarn von `dev`, kein Deploy). Der frühere
Meta-Repo-Workflow liegt je Repo als `deploy-master.yml.bak-meta` daneben.
