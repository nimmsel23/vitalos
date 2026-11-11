# AGENTS.md — gemeinsames VitalOS-Meta-Repo

## Architektur und Zuständigkeit

`~/vitalos` enthält private PWA und Store-Produkt. Die private Shell liegt in
`src/`, die Produkt-Shell in `prod/src/`. `prod/` ist normal getrackt, besitzt
kein eigenes Git-Repo und keine App-Submodule. Beide Shells verwenden die neun
App-Submodule im Root und das gemeinsame `pnpm-lock.yaml`.

Owner-Metapher (2026-11-11): `src/` = Shell-Quellcode; `prod/` = Play-/App-
Store- und Klienten-Gewand derselben Kombi (Analogie `fitness-dev` →
`vos-fitness`). Store-User und private Klienten teilen Quellcode, nicht
Firebase-Projekt/Account — Details und Account-Trennung in
[docs/UNIFIED-PRODUCT.md](docs/UNIFIED-PRODUCT.md) („Owner-Klarstellung
2026-11-11“).

`master` ist Default und private Produktion. Der frühere Umbau-Zweig
`dev-product` (integriert 2026-11-06 als `2fe70f3`) ist nach `master` gemergt
und entfernt. Der Produkt-Importer steht seit `e9ec5e9` im gemeinsamen Lockfile.

**Git-Disziplin (Owner 2026-11-09):** Git-Historie reicht als Versionierung.
Keine Parallel-Branches und keine Extra-Worktrees „zur Sicherheit“ oder für
Agenten-Isolation — außer der Owner fordert es ausdrücklich oder es ist für
einen klaren, kurzen Zweck unvermeidlich (dann sofort wieder aufräumen).
Standard: direkt auf `master` arbeiten, committen, pushen.

`~/vitalos/prod` ist die kanonische Produktquelle. Der frühere lokale Checkout
ist unter `~/vitalos-prod-legacy-2026-11-07` archiviert; lokale Änderungen,
Konfiguration, native Artefakte und Worktrees bleiben dort erhalten.
`~/vitalos-prod` ist ein lokaler Symlink auf `~/vitalos/prod`. Das private
GitHub-Repo gleichen Namens bleibt ein separates mögliches Release-Ziel.

Einstieg: `README.md`, `docs/UNIFIED-PRODUCT.md`,
`prod/docs/PRODUCT-CHECKOUT.md`, `prod/docs/FIREBASE.md` und
`prod/docs/STORE-PUBLISHING-PLAN.md`. Freigegebene Strategie:
`VitalOS-Produktstrategie-V1.3.0.md` (Owner-Abnahme 2026-11-08, E1 Ja).
V1.2.1 und V1.2.0 bleiben als historische Fassungen samt HTML-Export erhalten;
Feature-Freeze Fitness/Fuel/Relax/Plan/6Pack bis 2027-02-07 (E2 Ja): Wartung
nur bei Nutzerbezug, keine neuen Features. Coaching/Patreon als zweite
Umsatzspur parallel freigegeben (E3 Ja) — Start bleibt Owner-Ausführung.
die Android-Roadmap unter
`~/dev/coach-dev/public-coach/vitalos-android-roadmap.html`
ist Planung, kein Nachweis eines Builds oder Releases.

## Edit-Orte und Zusammenarbeit

- Private Shell: `~/vitalos/src`; Produkt-Shell und native Produktkonfiguration:
  `~/vitalos/prod`. Quelländerungen standardmäßig auf `master`.
- App-Quellcode: jeweiliges `~/dev/*-dev`-Repository (dort der jeweilige
  Integrationsbranch, i. d. R. `dev`). Die `*-app`-Ordner sind
  Merge-/Integrations-Checkouts, keine zweiten Entwicklungsquellen.
- Keine `.bak`-Dateien anlegen (Git ist die Historie; `*.bak*` ist gitignored).
  Nur eigene Pfade committen. Fremde uncommitted Arbeit nicht anfassen — aber
  dafür keine neuen Worktrees anlegen.
- Laufende Services nicht killen oder neu starten. Kein sudo. AlphaOS bleibt
  ein eigenständiges Projekt und ist kein Ziel dieses Umbaus.

## Commit- und Gitlink-Regeln

**Funktionierende Zwischen- und Endstände sofort committen, ohne nachzufragen.**
Thematisch passende Doku gehört in denselben Commit.

Ein Parent-Commit speichert die App-Commits als Gitlinks. `branch =` in
`.gitmodules` steuert nur Updates mit `--remote`; es ersetzt keinen Gitlink.
Lokaler Branchname, konfigurierter Integrationsbranch und gespeicherter Commit
sind getrennte Angaben. Detached HEAD ist bei gepinnten Checkouts zulässig.

App-Änderungen zuerst im zuständigen Quellrepo committen und den benötigten
App-Stand veröffentlichen, bevor ein neuer Parent-Gitlink darauf zeigt.
Ein lokal-only Commit darf kein CI-Gitlink werden. Quellveröffentlichung und
Parent-Push bleiben bewusste Schritte im autorisierten Release-Auftrag.

Bei geänderten App-Abhängigkeiten das gemeinsame Lockfile im Root mit pnpm
aktualisieren und mit dem Gitlink committen. Kein zweites Produkt-Lockfile.
Hooks können Pointer zusätzlich stagen oder beim Push Lockfiles ändern;
ihren tatsächlichen Inhalt prüfen und nicht als Freigabeersatz behandeln.
Meta-Repo-Push nur nach ausdrücklichem Auftrag. Grundlage dafür
(verifiziert 2026-11-06): `origin` ist das öffentliche Repo
`nimmsel23/vitalos`, und `prod/android/app/google-services.json` ist hier
getrackt — jedes Pushen ohne gelöste Spiegelstrategie würde Firebase- und
Produktwerte in den öffentlichen Ast bringen. Remote `product`
(nimmsel23/vitalos-prod) existiert nur als Definition und braucht für
jede Nutzung einen eigenen Auftrag; `product-*`-Tags nur nach
freigegebenem, dokumentiertem Release.

## Paketmanager und Build-Ziele

Pin `pnpm@11.3.0` beibehalten. Bei
`ERR_PNPM_STORE_DIR_OPEN_OPERATION_LOCK` den pnpm-Schreibzugriff in der
zulässigen Umgebung ermöglichen; keinen direkten Vite-Aufruf als Ersatz.
Supply-Chain-Prüfung kann dauern. Registry-Fehler konkret melden, nicht mit
unbegrenzten Installationsschleifen oder abgeschalteten Policies übergehen.

Private Root-Builds und `product:*`-Befehle haben unterschiedliche Ziele.
Produkt-Builds verlangen `vitalos-prod` und ihre eigene Firebase-Konfiguration.
Geheimnisse bleiben in ignoriertem `prod/.product-config/` oder der Build-
Umgebung. Nichts davon ausgeben, kopieren in Doku oder committen.
**Owner 2026-11-11:** Wenn Produkt-CI Secrets in GitHub fehlen und lokal
`prod/.product-config/product.env` plus
`vos-product-firebase-service-account.json` vorliegen, setzt der Agent sie
selbst per `gh secret set` auf `nimmsel23/vitalos` (Namen:
`VITE_VOS_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_VITALOS_PROD`) — Werte nie
loggen oder committen. Das private Secret `FIREBASE_SERVICE_ACCOUNT`
(`fitness-aos`) nicht überschreiben.
Build, native Synchronisierung, APK/AAB, Installation, Anmeldung, Signing und
Veröffentlichung sind getrennte Nachweise. Kein erfolgreicher Teil ersetzt die
übrigen Schritte. Details und Arbeitsverzeichnisse: `docs/UNIFIED-PRODUCT.md`.

## Private App-/Shell-Releases

App-Weg: `dev → master` (Standalone-Live) und Shell-Pin auf `origin/master`
via `vos-release` / `vos-ship` (kein `vitalos`-Branch als Pin-Ziel; `.gitmodules`
`branch = master`). `vos-release-pr`, `vos-ship` und `vos-release` gehören zum
privaten Release-Weg, nicht zur Store-Veröffentlichung. Ein autorisierter Push
von Meta-`master` löst die Shell-CI aus. Ein App-Push verschiebt den Parent-
Gitlink nicht automatisch.

Produkt-Releases pinnen den gesamten Meta-Repo-Stand, optional mit `product-*`-
Tag. Der Remote `product` ist nur eine Verbindung, keine automatische
Synchronisierung oder Push-Freigabe. Kein Force-Push zur Ablösung der alten
Produkt-Historie. Produkt-Hosting, Rules, Functions und Store-Uploads benötigen
ihren jeweiligen expliziten Veröffentlichungsauftrag.

## Plan, Mini-Apps und Coach

Plan-Quellen liegen in `~/dev/plan-dev`, 6Pack und Skills in ihren eigenen
Dev-Repos. Fitness löst diese über Nachbar-Checkouts (`*-app` / `*-dev`) auf;
es besitzt keine eigenen verschachtelten Gitlinks dafür. Keine alten
Anweisungen zum Kopieren nach `fitness/src/views/Plan` übernehmen.

Coach ist unabhängig in `~/dev/coach-dev`, kein VitalOS-App-Submodul.
Coach besitzt `firestore.rules.part`; nur veröffentlichte Quellen importieren
und Regeln im zuständigen Meta-Repo zusammensetzen. Private Rules und
Produkt-Rules bleiben unterschiedliche Deployment-Ziele. Kein Coach-bedingter
Shell-Pointer-Bump. Details: `prod/docs/FIREBASE.md` und `docs/DEPLOYMENT.md`.

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
