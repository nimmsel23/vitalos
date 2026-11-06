# AGENTS.md — gemeinsames VitalOS-Meta-Repo

## Architektur und Zuständigkeit

`~/vitalos` enthält private PWA und Store-Produkt. Die private Shell liegt in
`src/`, die Produkt-Shell in `prod/src/`. `prod/` ist normal getrackt, besitzt
kein eigenes Git-Repo und keine App-Submodule. Beide Shells verwenden die neun
App-Submodule im Root und das gemeinsame `pnpm-lock.yaml`.

Der Umbau wurde am 2026-11-06 auf `dev-product` integriert (`2fe70f3`); der
Produkt-Importer steht seit `e9ec5e9` im gemeinsamen Lockfile. `master` ist der
private Produktionsbranch. Der ältere lokale `dev`-Strang und weitere Worktrees
sind separate Arbeitsstände und dürfen nicht zurückgesetzt oder pauschal
übernommen werden. Branch und Status vor jeder Änderung tatsächlich prüfen.

`~/vitalos-prod` bleibt bis zur abgeschlossenen Ablösung erhalten. Dort können
exklusive lokale Änderungen, Konfiguration und native Artefakte liegen.
Das GitHub-Repo gleichen Namens kann als späteres Release-Ziel erhalten bleiben.
Die geteilte Produktquelle ist jetzt `~/vitalos/prod`.

Einstieg: `README.md`, `docs/UNIFIED-PRODUCT.md`,
`prod/docs/PRODUCT-CHECKOUT.md`, `prod/docs/FIREBASE.md` und
`prod/docs/STORE-PUBLISHING-PLAN.md`. Strategie: `VitalOS-Produktstrategie-V1.2.0.md`;
die Android-Roadmap unter
`~/dev/coach-dev/public-coach/vitalos-android-roadmap.html`
ist Planung, kein Nachweis eines Builds oder Releases.

## Edit-Orte und Zusammenarbeit

- Private Shell: `~/vitalos/src`; Produkt-Shell und native Produktkonfiguration:
  `~/vitalos/prod`. Quelländerungen auf einem passenden Dev-Strang; derzeit
  wird der gemeinsame Umbau auf `dev-product` bearbeitet. Kein direktes
  Quellcode-Editieren auf `master`.
- App-Quellcode: jeweiliges `~/dev/*-dev`-Repository. Die `*-app`-Ordner sind
  Merge-/Integrations-Checkouts, keine zweiten Entwicklungsquellen.
- Andere lokale Branches, Worktrees, vorgemerkte Änderungen und laufende
  Agent-Arbeit erhalten. Vor Edits Backup anlegen. Nur eigene Pfade committen.
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
Meta-Repo-Push nur nach ausdrücklichem Auftrag.

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
Build, native Synchronisierung, APK/AAB, Installation, Anmeldung, Signing und
Veröffentlichung sind getrennte Nachweise. Kein erfolgreicher Teil ersetzt die
übrigen Schritte. Details und Arbeitsverzeichnisse: `docs/UNIFIED-PRODUCT.md`.

## Private App-/Shell-Releases

Der bestehende App-Weg bleibt `dev -> master -> vitalos`; die tatsächlichen
App-Workflows vor einer Veröffentlichung prüfen. `vos-release-pr`, `vos-ship`
und `vos-release` gehören zum privaten Release-Weg und sind keine Produkt-
Store-Veröffentlichung. Ein autorisierter Push von `master` kann die private
Shell-CI auslösen. Ein App-Push verschiebt den Parent-Gitlink nicht automatisch.

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
