# Design: Branch-Modell — Pin auf master (Variante B)

**Status: ENTSCHIEDEN / TEILUMGESETZT (2026-11-09).**

Owner-Entscheidung: Shell-Pins zeigen auf `origin/master`. Der App-Branch
`vitalos` ist kein Pin-Ziel mehr. `dev` bleibt Arbeits-/Preview-Branch.
Trunk-only (Variante C: nur ein Dauer-Branch) bleibt spätere Option.

## Ist-Zustand nach dem Schnitt

| | Rolle |
|---|---|
| `dev` | Alltag, Previews, Check, Dependabot |
| `master` | Standalone-Live **und** Shell-Pin-Quelle |
| `vitalos` | Legacy remote (darf noch existieren); nicht mergen/pushen für Shell |

`.gitmodules`: `branch = master`. `vos-release` / `vos-ship` / `vos-overview`
und `docs/DEPLOYMENT.md` folgen dem Pin-Modell.

## Was bewusst offen bleibt

- [x] Remote-Branches `vitalos` in den Modul-Repos gelöscht (2026-11-09).
- [x] CI-Workflows/merge-agent bereinigt (kein origin/vitalos-Vorspulen).
- Ob später Variante C (nur noch ein Dauer-Branch) kommt — eigene Entscheidung.

## Rollback

Meta-`.gitmodules` wieder auf `branch = vitalos`, Pins auf `origin/vitalos`,
`vos-release` Merge-Modus aus Git-Historie wiederherstellen.
