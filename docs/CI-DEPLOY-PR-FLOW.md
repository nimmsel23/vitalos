# CI-Deploy über Pull Requests – ein Weg für alle VitalOS-Module

Stand: 2026-10-28. Auftrag: der PR-/CI-Weg, den `fitness-dev` und `vitalos` nutzen, soll für alle
anderen Module gelten. Dieses Dokument hält Befund, Soll-Muster, Reihenfolge und Ausnahmen fest.

**Wichtig vorweg:** Alle hier beschriebenen neuen Workflows sind nur committet, nicht gepusht und
nicht auf GitHub gelaufen. Syntaktisch geprüft ist ausschließlich das YAML (`yq`); `actionlint` ist
auf dem Rechner nicht installiert. Ob sie funktionieren, zeigt erst der erste Lauf auf GitHub.

---

## 1. Das Referenzmuster (fitness-dev)

Der Default-Branch von `fitness-dev` ist `vitalos` (nicht `dev`). Die Workflows liegen auf
`origin/vitalos`; die lokale `dev`-Arbeitskopie kennt `check.yml`, `automerge.yml` und
`dependabot.yml` noch nicht (kommen erst mit dem nächsten Merge `vitalos` -> `dev`).

| Baustein | Datei (fitness-dev) | Auslöser | Wirkung |
|---|---|---|---|
| Check | `check.yml` | PR nach `vitalos`/`dev`, Push `dev` | Lint + Build ohne Deploy, ohne Firebase-Secrets |
| Preview | `preview-dev.yml` | Push `dev` -> Channel `dev` (24h); PR -> eigener PR-Channel + Kommentar | Firebase-Action, Telegram-Link |
| Release-PR | `bin/vos-release-pr fitness` (in `~/vitalos/bin`) | von Hand | öffnet PR `dev` -> `vitalos`, prüft vorher Konflikte |
| Auto-Merge | `automerge.yml` | `workflow_run` nach grünem `Check (Fitness)` | Release-PR mit Merge-Commit mergen, danach `deploy-vitalos.yml` per `workflow_dispatch` starten (Merge mit `GITHUB_TOKEN` löst keinen Push-Trigger aus) |
| Live | `deploy-vitalos.yml` | Push auf `vitalos` (oder Dispatch) | baut über Meta-Repo-Checkout, deployt `hosting:client` live |
| Abhängigkeiten | `.github/dependabot.yml` | wöchentlich Mo 07:00 Wien | PRs nach `dev`, Majors einzeln |

Meta-Repo `vitalos`: PRs für Tooling (#2 `vos-llm-doctor`, #3 `vos-sync-submodule-pointers`,
#4 `vos-release-pr`) wurden per PR nach `master` gemergt; jeder Push auf `master` löst
`deploy-shell.yml` (und je nach Pfad `deploy-<app>.yml`) aus. `pr-preview.yml` gibt PRs nach `master`
einen Preview-Channel, aber nur für Shell-Dateien. Es gibt im Meta-Repo **keinen** allgemeinen Check
für PRs (siehe Lücken).

### Gemeinsame Randbedingungen

- Firebase-Projekt für alles: `fitness-aos`; jede App hat eine eigene Hosting-Site/ein Target.
- Firebase-Action bekommt `FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS || FIREBASE_SERVICE_ACCOUNT`.
- Das Skills-Submodul braucht beim Checkout über das Meta-Repo `SKILLS_DEPLOY_KEY`
  (`.github/actions/skills-submodule-auth` im Meta-Repo).
- Firestore-Rules deployt **kein** Modul-Workflow, nur `~/vitalos` (`deploy-firestore-rules.yml`, manuell).
- Die vier Fuel-Mini-Apps (`vos-fuel-log|supplements|mikros|protokoll`) laufen **nie** per CI.

---

## 2. Befund pro Repo (vorher)

Verifiziert am 2026-10-28 mit Dateien, `gh run list`, `gh secret list`. Secrets nur als Namen.

| Repo | Art | Default-Branch | Preview bei PR? | Check? | Auto-Merge Release-PR? | Live-Weg | Secrets im Repo |
|---|---|---|---|---|---|---|---|
| fitness-dev | Hosting, Meta-Checkout | `vitalos` | ja | ja | ja | eigener `deploy-vitalos.yml` + Meta-`deploy-fitness.yml` | FIREBASE_CONFIG, FIREBASE_SERVICE_ACCOUNT, SKILLS_DEPLOY_KEY, TELEGRAM_TO, TELEGRAM_TOKEN |
| vitalos (Meta) | Shell + Pointer-Deploys | `master` | nur Shell-Pfade (`pr-preview.yml`) | nein | nein | Push `master` -> `deploy-*.yml` | FIREBASE_SERVICE_ACCOUNT, SKILLS_DEPLOY_KEY |
| fuel-dev | Hosting standalone (pnpm) | `master` | ja | nein | nein | `deploy-master.yml` (master -> fuel-os) + Meta-`deploy-fuel.yml` (fuel-vos) | FIREBASE_CONFIG_JS, FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS, FIREBASE_SERVICE_ACCOUNT_FUEL_AOS(+_B64), TELEGRAM_TO, TELEGRAM_TOKEN |
| journal-dev | Hosting standalone (pnpm, Tests) | `master` | ja | nein | nein | `deploy-master.yml` (master -> Target journal) + Meta-`deploy-journal.yml` | FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS, TELEGRAM_TO, TELEGRAM_TOKEN |
| habits-dev | Hosting, Meta-Checkout | `master` | ja, **aber rot**: Schritt „Submodules via HTTPS + Token“ scheitert (letzte Läufe 2026-10-21 und 2026-10-26) | nein | nein | `deploy-master.yml` + Meta-`deploy-habits.yml` | FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS, TELEGRAM_TO, TELEGRAM_TOKEN (**SKILLS_DEPLOY_KEY fehlt**) |
| learn-dev | Hosting, Meta-Checkout | `master` | ja, **aber rot**, gleicher Schritt | nein | nein | nur Meta-`deploy-learn.yml` | wie habits-dev |
| relax-dev | Hosting standalone (npm) | `master` | **nein** (nur dev-Push), letzter Lauf 2026-08-23 im Firebase-Schritt rot | nein | nein | nur Meta-`deploy-relax.yml` | FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS, TELEGRAM_TO, TELEGRAM_TOKEN |
| plan-dev | Hosting standalone (pnpm, Sonderinstall) | `coach` | **nein** (nur dev-Push, CLI-Aufruf ohne Kommentar) | nein | nein | nur Meta-`deploy-plan.yml` | FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS |
| 6pack-dev | Hosting standalone (pnpm) | `dev` | **nein** (nur Push `dev`/`vitalos`) | nein | nein | eigener Live-Schritt bei Push `vitalos` (vos-6pack.web.app) | FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS |
| skills-dev | Hosting standalone (pnpm) | `dev` | **nein** (nur dev-Push) | nein | – (kein `origin/vitalos`) | nur Meta-`deploy-skills.yml` | FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS |
| coach-dev | Hosting, Sonderfall (zieht Plan-Workflow aus plan-dev) | `dev` | nein | nein | nein | `deploy-coach.yml` (Push `dev`, Produktion nur per Dispatch) | FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS |
| klienten-dev | Node/Hono-Backend + Vite-UI | – | – | – | – | **kein GitHub-Remote** (`git remote -v` leer, `nimmsel23/klienten-dev` existiert nicht) | – |
| vital | Node-Server (Coach 8800 / Klient 4200), enthält Klientendaten | `main` (privat) | – | – | – | läuft lokal, kein Hosting | – |
| physio-dev | Wissens-/Python-Repo (`server.py`, kein `package.json`, kein `firebase.json`) | – | – | – | – | **kein GitHub-Remote**; der Workflow `firebase-hosting-dev-preview.yml` kann nie bauen | – |

Weitere Beobachtungen:

- `fitness-dev` PR #12: `Preview (Fitness dev)` war in beiden Läufen rot, `Check (Fitness)` einmal rot, einmal grün
  (2026-10-28). Das ist Referenz-Repo; nicht angefasst, nur gemeldet. Logs per `gh run view --log-failed` liefern 403.
- Doppelte Live-Wege, die es schon vor diesem Auftrag gab: Fitness (`deploy-vitalos.yml` und Meta-`deploy-fitness.yml`),
  Journal (`deploy-master.yml` und Meta-`deploy-journal.yml`), Habits (`deploy-master.yml` und Meta-`deploy-habits.yml`).
  Nicht verändert; bei Gelegenheit klären, welcher Weg gilt.
- Branch-Schutz: keiner der Repos hat Branch-Protection auf `master` (API: „Branch not protected“); `vital` (privat) kann
  ohne GitHub Pro keine abrufen. Required-Checks sind also nirgends gesetzt.
- Nicht in dieser Liste, weil Backend/Docker statt Firebase-Frontend: `fuel-dev/backend` (FastAPI, `/opt/fuel-python`),
  `klienten-python`, `fitness-api`. Dafür gilt ein anderes Modell, siehe Abschnitt 6.

---

## 3. Soll-Muster für Firebase-Hosting-Module

Jedes Modul mit Hosting-Frontend bekommt dieselben vier Bausteine, in dieser Benennung:

1. `check.yml` – Name `Check (<Modul>)`. Auslöser: Push `dev`, PR nach `vitalos`/`master`/`dev`. Baut mit den Schritten
   der Preview, ohne Firebase, ohne Pfadfilter. Tests und Lint nur, wenn der Preview-Lauf sie schon hat (sonst wird der
   Check dauerhaft rot und der Auto-Merge feuert nie).
2. `preview-dev.yml` (bei plan-dev `deploy-plan.yml`, bei 6pack-dev `deploy.yml`, bei skills-dev `deploy.yml`, unverändert
   benannt) – Push `dev` -> Channel `dev`, PR -> PR-Channel mit Kommentar. Job-Rechte `pull-requests: write`.
3. `automerge.yml` – Auto-Merge des Release-PR `dev` -> `vitalos` per Merge-Commit bei grünem Check. Nur dort mit
   Deploy-Dispatch, wo das Repo selbst live deployt (6pack-dev). Bei allen anderen läuft der Live-Deploy über den
   Pointer-Bump im Meta-Repo.
4. Live: entweder eigener Workflow auf dem Branch `vitalos` (nur fitness-dev, 6pack-dev) oder Meta-Repo `deploy-<app>.yml`
   nach Pointer-Bump (alle anderen). Das ist der bestehende Weg und bleibt.

Nicht Teil des Musters: `dependabot.yml` (in fitness-dev vorhanden). Wäre ein weiterer Schritt (Abschnitt 7), erzeugt aber
wöchentlich PRs in jedem Repo.

### Warum der Pointer-Bump nicht automatisiert ist

Der Bump in `~/vitalos` (`vos-sync-submodule-pointers`) braucht lokale Prüfungen (Lockfile, erreichbare Commits) oder ein
Token mit Schreibrecht auf das Meta-Repo. Letzteres gibt es als Secret nicht (Meta-Repo kennt nur
`FIREBASE_SERVICE_ACCOUNT` und `SKILLS_DEPLOY_KEY`). Deshalb bleibt der Bump bewusst ein manueller Schritt, der danach
`deploy-<app>.yml` auslöst.

---

## 4. Was geändert wurde (nur Dateien unter `.github/workflows/`, lokal committet, **nicht gepusht**)

Alle Commits liegen auf dem jeweiligen `dev`-Branch.

| Repo | Commit | Preview-PR vorher -> nachher | Neu |
|---|---|---|---|
| fuel-dev | `d27295f` | ja -> ja (Basis `vitalos` ergänzt, Rechte für Kommentar) | `check.yml`, `automerge.yml` |
| journal-dev | `d1da921` | ja -> ja (Basis `vitalos` ergänzt) | `check.yml`, `automerge.yml` |
| habits-dev | `33d066b` | ja (rot) -> ja, Schritt `skills-submodule-auth` ergänzt | `check.yml`, `automerge.yml` |
| learn-dev | `d9ed0255` | ja (rot) -> ja, Schritt `skills-submodule-auth` ergänzt | `check.yml`, `automerge.yml` |
| relax-dev | `091a95d` | nein -> ja (neuer `preview-dev.yml`, alter Workflow per `git mv` nach `workflows.disabled/`) | `check.yml`, `automerge.yml` |
| plan-dev | `c597377` | nein -> ja (`deploy-plan.yml`: PR-Trigger, Firebase-Action statt CLI, Concurrency pro Ref) | `check.yml`, `automerge.yml` |
| 6pack-dev | `ba329200` | nein -> ja (`deploy.yml`: PR-Trigger, Live-Schritt nur ohne `pull_request`, Concurrency pro Ref) | `check.yml`, `automerge.yml` (mit Dispatch von `deploy.yml`) |
| skills-dev | `f9eb3bc` | nein -> ja (`deploy.yml`: PR-Trigger) | `check.yml` (kein Auto-Merge: kein `origin/vitalos`) |

Vor dem Edit wurden `*.bak.pre-pr-flow`-Kopien der geänderten Workflows angelegt (in den Repos meist ignoriert, nicht committet).

### Bewusste Abweichungen vom fitness-dev-Muster

- **Kein Lint in den Checks** (außer wo der Preview es schon macht): fitness-dev hat `lint`; fuel/journal/habits/learn/relax/
  6pack/skills/plan haben keins im CI-Weg. Ein neuer Lint-Zwang würde den Check dauerhaft rot machen.
- **Kein `--no-frozen-lockfile`** wie in fitness-dev: das gilt nur dort, weil das Meta-Repo-Lockfile und die dev-`package.json`
  gewollt auseinanderlaufen. Habits/Learn benutzen wie ihre Previews `--frozen-lockfile`.
- **plan-dev** installiert mit Sonderschritt (`@vos/cross-app-aliases` aus `package.json` entfernen, `hoisted`-Linker),
  wie schon im bestehenden Preview.
- **relax-dev** nutzt npm (`package-lock.json`), alle anderen pnpm.
- **Auto-Merge ohne Dependabot-Zweig** (nur Release-PR `dev` -> `vitalos`), da in diesen Repos keine `dependabot.yml` existiert.

---

## 5. Nicht umgesetzt / ausstehend

| Repo | Grund |
|---|---|
| coach-dev | steht lokal auf `integrate-klienten` statt `dev` (Regel: `~/<m>-dev` fest auf `dev`), also nicht angefasst. Sonderfall: `deploy-coach.yml` zieht einen Workflow aus `plan-dev` und deployt Produktion nur per Dispatch. |
| klienten-dev | kein GitHub-Remote, lokal dirty (gelöschte `hono-server.mjs`, Archivordner). Zuerst Repo anlegen/Remote setzen, dann CI. Backend + Vite-UI: Check = `npm ci` + `vite build`, Hosting-Frage offen (siehe Abschnitt 6). |
| vital | Node-Server mit Klientendaten im Repo (privat), läuft nur lokal. Kein Hosting-Frontend, daher kein Preview-/Deploy-Weg; höchstens Syntax-/Test-Check, bisher kein Test vorhanden. |
| physio-dev | kein Remote, kein `package.json`/`firebase.json`: der vorhandene Workflow `firebase-hosting-dev-preview.yml` ist ein Kopie-Rest (Telegram-Text „Journal“, `npm ci` ohne `package.json`) und kann nie laufen. Empfehlung: nach `.github/workflows.disabled/` verschieben, solange es kein Remote gibt. Nicht angefasst (kein Push-Ziel, kein Schaden). |
| fitness-dev, vitalos | Referenz, nicht umgebaut. Lücke im Meta-Repo: kein `check.yml` für PRs (Build aller Workspaces). |
| Fuel-Mini-Apps (`vos-fuel-*`, `vos-fuel-mini`) | bewusst keine CI-Deploys, nur manuell (`pnpm run deploy:solo:<x>`). In keinem neuen Workflow enthalten; die Fuel-Workflows deployen nur `client` bzw. `fuelos`. |
| `vos-fitness` | Ordner im Meta-Repo, hat bereits `deploy-vos-fitness.yml`. |

---

## 6. Bewusst nicht per Hosting-CI: Backends und lokale Dienste

`fuel-dev/backend` (FastAPI, `/opt/fuel-python`, `fuel-python.service`), `klienten-python`, `fitness-api`,
`coach-api`, `vital`-Server laufen als lokale/Docker-Dienste auf dem Rechner `Alpha`. Ein Firebase-Preview-Channel passt
dort nicht. Sinnvoll wäre höchstens ein reiner Check (Syntax/Tests) bei PRs – ohne Deploy. Das ist eine eigene
Entscheidung und nicht Teil dieses Auftrags.

---

## 7. Was nur der User tun kann (Checkliste)

### 7.1 GitHub-Secrets (Name -> wofür)

| Repo | Secret | Wofür | Status |
|---|---|---|---|
| habits-dev | `SKILLS_DEPLOY_KEY` | Zugang zum Skills-Submodul beim Meta-Repo-Checkout (Preview und Check) | **fehlt**, Preview ist deshalb rot |
| learn-dev | `SKILLS_DEPLOY_KEY` | dasselbe | **fehlt** |
| habits-dev, learn-dev | `FIREBASE_CONFIG` (optional) | echte Firebase-Config statt Platzhalter aus dem Meta-Repo | optional; Workflows fallen auf `firebase.config.js` des Meta-Repos zurück |
| 6pack-dev, plan-dev, skills-dev | `TELEGRAM_TO`, `TELEGRAM_TOKEN` (optional) | Link-Nachricht nach Preview | optional; nur 6pack-dev/skills-dev senden, mit Bedingung |
| alle neuen Check-Workflows | – | keine Secrets nötig | – |

Vorhanden und ausreichend: `FIREBASE_SERVICE_ACCOUNT_FITNESS_AOS` in fuel, journal, habits, learn, relax, plan, 6pack, skills.

Hinweis zu `SKILLS_DEPLOY_KEY`: `gh repo view` zeigt `skills-dev` als öffentlich; trotzdem authentifiziert fitness-dev das Submodul
per Deploy-Key, und die rot laufenden Habits-/Learn-Previews scheitern genau im Submodul-Schritt. Die Ursache ist deshalb nicht
bewiesen (Logs nicht lesbar, 403). Falls der Key nicht der Grund ist, bleibt der Schritt rot und der Fehler muss im
GitHub-Log gelesen werden.

### 7.2 Repo-Einstellungen

- **Default-Branch / Auto-Merge:** `automerge.yml` läuft als `workflow_run` und wirkt nur, wenn die Datei im **Default-Branch** liegt.
  fitness-dev hat `vitalos` als Default. Für fuel, journal, habits, learn, relax (Default `master`) und plan (`coach`) heißt das:
  entweder den Default-Branch auf `vitalos` stellen (wie fitness-dev) oder die Workflow-Dateien auch nach `master` bzw. `coach`
  bringen. 6pack-dev hat `dev` als Default, dort greift es nach dem Push von `dev` sofort.
- **Actions -> Workflow permissions:** auf „Read and write“ (Auto-Merge, PR-Kommentar). Die Workflows setzen ihre Rechte
  zusätzlich selbst im Job.
- **Branch-Protection / Required Checks:** bisher nirgends gesetzt. Empfehlung `vitalos` und `master` mit Required Check
  `Check (<Modul>)`. Hängt am GitHub-Plan bei privaten Repos; die öffentlichen Repos können es.
- **Environment-Freigaben:** keine in Verwendung; nicht nötig.
- **Firebase-Service-Account:** Rolle „Firebase Hosting Admin“ im Projekt `fitness-aos` für das Secret. PR-Channels brauchen
  keine zusätzliche Berechtigung. Nach neuen Preview-Channels `bin/vos-authdomains` laufen lassen (Auth-Domains).
- **Push:** sämtliche Commits sind lokal. Reihenfolge-Vorschlag: pro Repo `git log origin/dev..dev` ansehen (es gehen alle
  ungepushten Commits mit raus, z. B. 5 in 6pack-dev und 3 in journal-dev, jeweils inkl. der CI-Commits), dann `git push origin dev`.

### 7.3 Dev-Tooling (nicht Teil der Workflow-Dateien)

- `bin/vos-release-pr` kennt nur `fitness`. Für die anderen Module wäre je ein Eintrag in `CFG` nötig:
  `[fuel]="nimmsel23/fuel-dev|$HOME/fuel-dev|dev|vitalos"` und analog für journal, habits, learn, relax, plan, 6pack.
  Der Text im PR-Body nennt `deploy-vitalos.yml`; der gilt nur für fitness (und sinngemäß 6pack: `deploy.yml`).
- Nach einem Auto-Merge liegt `vitalos` im Remote vor dem lokalen Branch: `git -C ~/vitalos/<m>-app pull`, dann
  Pointer-Bump wie gewohnt; `vos-overview` vorher prüfen.
- Optional: `dependabot.yml` aus fitness-dev übernehmen; `ops/vos-llm-doctor/repos.conf` kennt bisher nur fitness-dev und müsste
  die Repos ergänzen, damit der Doctor rote PRs dort repariert.

---

## 8. Reihenfolge fürs Einschalten

1. Secrets: `SKILLS_DEPLOY_KEY` in habits-dev und learn-dev.
2. Pro Repo `dev` pushen -> Preview und Check laufen lassen; erst wenn grün, weiter. Mit den Repos beginnen, die bereits grün
   liefen: journal-dev, fuel-dev, skills-dev, plan-dev, 6pack-dev. Danach relax-dev (neuer Workflow), zuletzt habits-dev/learn-dev.
3. Default-Branch bzw. Workflow-Dateien für den Auto-Merge klären (7.2).
4. `vos-release-pr` auf die Module erweitern (7.3), dann einen Release-PR pro Modul als Probelauf (Fuel zuerst: kein Live-Effekt
   im Repo selbst, Deploy folgt erst beim Pointer-Bump).
5. Branch-Protection mit Required Check setzen.
