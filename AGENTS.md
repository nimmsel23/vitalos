# AGENTS.md — VitalOS

## Gemeinsame Produktstruktur (integriert 2026-11-06)

Der gemeinsame Produktumbau ist im aktiven Checkout umgesetzt: Branch
`dev-product` (Merge-Commit `2fe70f3`, Lockfile-Importer `e9ec5e9`, Basis
master `240a66a`). `prod/` ist ein normal getrackter Ordner dieses
Meta-Repos und nutzt die vorhandenen App-Submodule im Root — kein eigenes
Git, keine Gitlinks, kein zweites Lockfile. Produkt-Shell-Edits in `prod/`
erfolgen auf `dev`-Strängen. Master bleibt Produktionsbranch der privaten
Shell; der bisherige private Releaseweg ändert sich nicht. Der alte
Produkt-Fork `/home/alpha/vitalos-prod` bleibt unberührt bis zur
finalen Freigabe. Siehe `docs/UNIFIED-PRODUCT.md`; ältere Fork-Pfadangaben
unten sind überholt.

## Produktstrategie und Android-Roadmap

- Produktstrategie: `/home/alpha/vitalos/VitalOS-Produktstrategie-V1.2.0.md`; die lesbare HTML-Fassung liegt daneben als `VitalOS-Produktstrategie-V1.2.0.html`.
- Interaktive Android-Roadmap: `/home/alpha/Vitaltraining/daniel-vitaltrainer-firebase/src/vitalos-android-roadmap.html` (Homepage-Quelle). Sie ist ein Plan; tatsächlichen Repo-, Build- und Release-Stand vor Umsetzung prüfen.
- Gemeinsamer Produkt-Checkout: `/home/alpha/vitalos-prod`; Firebase-Projekt `vitalos-prod`. Observe und Operate sind Varianten desselben Store-Produkts.

## Paketmanager für Apps
pnpm 

- In `*-dev`-Checkouts kann die Codex-Sandbox den globalen pnpm-Engine-Store
  (`~/.local/share/pnpm/package-manager-store`) schreibgeschützt einbinden.
  Dann scheitert die Auflösung der in `package.json` gepinnten pnpm-Version mit
  `ERR_PNPM_STORE_DIR_OPEN_OPERATION_LOCK`. pnpm-Befehle in diesen Checkouts
  mit Schreibzugriff außerhalb der Sandbox ausführen; den Package-Manager-Pin
  beibehalten und den Build nicht durch direkten Aufruf von Vite umgehen.

## Commit-Regel (verbindlich)

**Immer committen, nie fragen.** Sobald eine Aufgabe — egal ob vom Hauptagenten
oder einem Subagenten ausgeführt — einen funktionierenden Zwischen- oder
Endstand erreicht hat: sofort committen, ohne vorher um Erlaubnis zu fragen.

- Bei Submodule-Änderungen (fitness-app, fuel-app, journal-app, habit-app,
  learn-dev, relax-app): erst im Sub-Repo committen **und pushen**, danach
  im Meta-Repo (`vitalos`) den Submodule-Pointer bumpen und committen.
- Der Submodule-Push ist zwingend, weil der Meta-Repo-Pointer sonst auf einen
  lokalen-only Commit zeigt und CI mit `fatal: not our ref` scheitert
  (siehe `CLAUDE.md` → Submodule-Regel).
- **pnpm-lock.yaml muss immer synchron sein:** Wenn ein Submodule neue
  Abhängigkeiten bekommt, muss `pnpm install` im vitalos-Root ausgeführt
  und das aktualisierte `pnpm-lock.yaml` im selben Commit wie der
  Submodule-Pointer mitgeführt werden. Reihenfolge:
  1. Sub-Repo: `pnpm add <paket>` → committen + pushen
  2. vitalos-Root: `pnpm install` (aktualisiert Root-Lockfile)
  3. `git add <submodule-path> pnpm-lock.yaml && git commit`
  Der pre-push Hook fängt vergessene Lockfile-Updates automatisch ab
  (amended den letzten Commit), ist aber kein Ersatz für bewusstes Vorgehen.
- **Push des Meta-Repos bleibt separat** — nur committen, NICHT pushen, außer
  der User fordert es explizit an.

## Edit-Orte und Branch-Regel

Quellcode wird ausschließlich in `~/vitalos/src` oder im jeweiligen `~/dev/*-dev/src` bearbeitet, ausschließlich auf einem `dev`-Branch und immer mit anschließendem Commit. Auf anderen Branches, insbesondere dem Produktionsbranch `master`, wird kein Quellcode direkt editiert. `*-app`-Submodule bleiben lokale Merge-/Integrations-Checkouts und werden nicht direkt editiert.

## Repo- und Deploy-Rollen

- `~/vitalos` ist die VitalOS-Shell. `master` ist ihr Produktionsbranch; `deploy-shell.yml` deployed die Shell. Das Meta-Repo hat keinen `dev`-Branch.
- Die `*-dev` Repos sind die Entwicklungsquellen. Qualifizierende Änderungen auf ihren `dev`-Branches starten die Preview-Workflows.
- Die `*-app` Submodule in diesem Meta-Repo sind lokale Staging-/Integrations-Checkouts für Git-Merges und liefern Quellcode für die VitalOS-Subapps. Sie sind nicht zum direkten Editieren da: Änderungen werden im jeweiligen `*-dev`-Quellrepo vorgenommen und über den vorgesehenen Merge-/Release-Weg in den App-Checkout übernommen. Der Parent speichert pro Submodule einen Gitlink auf einen konkreten Commit.
- `branch = vitalos` in `.gitmodules` bestimmt, welchem Remote-Branch `git submodule update --remote` folgt. Der gespeicherte Gitlink wird dadurch nicht automatisch verschoben.
- Die eigenständigen App-Produktions-Branches unterscheiden sich: Fitness nutzt derzeit `vitalos`; Fuel nutzt derzeit `master`. Vor einem Release den aktiven Workflow im jeweiligen App-Repo prüfen.

## Release-Regel

- Release-Weg (seit 2026-10-29): **`dev` → `master` → `vitalos`**. Schritt 1 `dev` → `master` ist ein PR (`vos-release-pr <modul>`); nach grünem `Check` mergt der Auto-Merge, der CI-Workflow des App-Repos deployed die Standalone-App. Schritt 2 `master` → `vitalos` macht `vos-release <modul>` (mergt `origin/master` in den `vitalos`-Branch des `*-app`-Checkouts). Ausführlich: `docs/DEPLOYMENT.md`.
- VitalOS-Shell: den gewünschten App-Quellstand im jeweiligen `*-app` Submodule pinnen und den Pointer im Meta-Repo auf `master` committen (macht `vos-release`). Ein autorisierter Push auf `master` löst den Shell-CI-Deploy aus. `vos-release` mergt vor dem Push `origin/master` ein und gleicht Submodul-Checkouts an die Pointer an.
- Ein App-Branch-Push aktualisiert den Meta-Repo-Gitlink nicht. Standalone-App-Release und Shell-Release sind getrennte CI-Ziele.
- `main` ist für diese Branch-Aufteilung nicht erforderlich; keine Branch-Rolle allein aus dem Namen ableiten.

## Plan-Integration für Fitness

- Plan-Änderungen für Fitness starten in `~/plan-dev` auf `dev`. Der Plan-Pre-Push-Hook synchronisiert `src/views/Plan/` nach `~/fitness-dev/src/views/Plan/` und committet/pusht `fitness-dev/dev`; Fitness-Preview läuft dort per CI.
- Der integrierte Fitness-Produktionsweg ist `fitness-dev/dev` -> `master` (PR) -> `fitness-app` auf Branch `vitalos` -> `fitness-app`-Gitlink in `~/vitalos` auf `master`. Das Fitness-Repo deployt seine Standalone-Produktion; der VitalOS-Parent deployt die Shell. `fitness-dev/plan` ist nicht mehr der Plan-Quellpfad.

**Grund:** Ein Agent hat am 2026-08-06 seinen Context aufgegeben, bevor
committed wurde — die Arbeit ging verloren, der User musste manuell
nachfassen. Diese Regel überschreibt für dieses Repo das generelle
"nie ohne explizite Erlaubnis committen"-Verhalten.

## Coach ownership (2026-10-20)

Coach is independent in `~/dev/coach-dev`; do not add it as a VitalOS app/submodule. `vos-ship coach` delegates to Coach-owned CI and verifies the live source SHA. Coach does not build the optional historical `vitalos/` checkout. Coach owns `firestore.rules.part`; import a published commit with `node scripts/import-coach-rules.mjs`, then compose with `node scripts/build-rules.mjs`. All app rules deploy together from this repository. No per-app rules deploy or Coach-driven Shell pointer bump.
