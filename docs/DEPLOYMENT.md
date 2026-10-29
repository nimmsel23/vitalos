# Deployment — Branch-Modell und Release-Weg

Stand: 2026-10-29. Löst die Beschreibung in `CLAUDE.md` („Deploy-Flow Gesamtbild“, „Der EINZIGE aktive Deploy-Pfad
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
- **`Private Skills submodule access` bricht ab:** `SKILLS_DEPLOY_KEY` fehlt. Die Action
  (`.github/actions/skills-submodule-auth`) überspringt den Key seit 2026-10-29, weil `skills-dev` öffentlich ist.
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
