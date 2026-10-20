# AGENTS.md — VitalOS

## Paketmanager für Apps
pnpm 

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
- **Push des Meta-Repos bleibt separat** — nur committen, NICHT pushen, außer
  der User fordert es explizit an.

## Repo- und Deploy-Rollen

- `~/vitalos` ist die VitalOS-Shell. `master` ist ihr Produktionsbranch; `deploy-shell.yml` deployed die Shell. Das Meta-Repo hat keinen `dev`-Branch.
- Die `*-dev` Repos sind die Entwicklungsquellen. Qualifizierende Änderungen auf ihren `dev`-Branches starten die Preview-Workflows.
- Die `*-app` Submodule in diesem Meta-Repo sind Staging-/Integrations-Checkouts und liefern Quellcode für die VitalOS-Subapps. Der Parent speichert pro Submodule einen Gitlink auf einen konkreten Commit.
- `branch = vitalos` in `.gitmodules` bestimmt, welchem Remote-Branch `git submodule update --remote` folgt. Der gespeicherte Gitlink wird dadurch nicht automatisch verschoben.
- Die eigenständigen App-Produktions-Branches unterscheiden sich: Fitness nutzt derzeit `vitalos`; Fuel nutzt derzeit `master`. Vor einem Release den aktiven Workflow im jeweiligen App-Repo prüfen.

## Release-Regel

- Standalone-App: Änderungen aus `dev` erst prüfen, dann in den für diese App aktiven Produktionsbranch übernehmen. Der CI-Workflow des App-Repos deployed die Standalone-App. Ein Meta-Repo-Push kann je nach Workflow zusätzlich einen App-Deploy auslösen.
- VitalOS-Shell: den gewünschten App-Quellstand im jeweiligen `*-app` Submodule pinnen und den Pointer im Meta-Repo auf `master` committen. Ein autorisierter Push auf `master` löst den Shell-CI-Deploy aus.
- Ein App-Branch-Push aktualisiert den Meta-Repo-Gitlink nicht. Standalone-App-Release und Shell-Release sind getrennte CI-Ziele.
- `main` ist für diese Branch-Aufteilung nicht erforderlich; keine Branch-Rolle allein aus dem Namen ableiten.

**Grund:** Ein Agent hat am 2026-08-06 seinen Context aufgegeben, bevor
committed wurde — die Arbeit ging verloren, der User musste manuell
nachfassen. Diese Regel überschreibt für dieses Repo das generelle
"nie ohne explizite Erlaubnis committen"-Verhalten.
