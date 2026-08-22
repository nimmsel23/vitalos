# AGENTS.md — VitalOS

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

## Release-Regel

- Standardweg für VOS-Releases: `bin/vos-release`.
- Interaktiv ohne Argumente oder gezielt z. B. `vos-release fitness fuel`.
- `fitness-release` ist nur noch der schmale Alias für `vos-release fitness`.
- Zweck: Standalone-Repo pushen, in `vitalos/<app>` nach `master` mergen, dann
  im Parent-Repo den Submodule-Pointer bumpen.
- Parent-`git commit` zieht per `.githooks/pre-commit` und
  `bin/vos-sync-submodule-pointers --stage` erreichbare
  Submodule-Pointer automatisch mit in den Commit.
- Parent-`git push` prüft per `.githooks/pre-push` nur noch, dass der bereits
  committete Pointer nicht auf einen lokal-only Submodule-Commit zeigt.

**Grund:** Ein Agent hat am 2026-08-06 seinen Context aufgegeben, bevor
committed wurde — die Arbeit ging verloren, der User musste manuell
nachfassen. Diese Regel überschreibt für dieses Repo das generelle
"nie ohne explizite Erlaubnis committen"-Verhalten.
