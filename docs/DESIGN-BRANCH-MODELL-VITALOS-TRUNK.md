# Design-Entwurf: Branch-Modell „nur vitalos" (Trunk-Pinning)

**Status: ENTWURF / KEINE ENTSCHEIDUNG.** Diskussion vom 2026-11-05. Umsetzung nur
nach expliziter Freigabe. Erst nach einem Freeze abschätzen (z.B. diesem Release-Zyklus).

## Ausgangslage

Status quo pro Modul: `dev` (Arbeitsbranch, Preview-Workflow) → `master`
(Standalone-Prod, PR + Auto-Merge) → `vitalos` (Shell-Staging, gemerged im
`*-app`-Checkout via `vos-release`) → Gitlink-Pin im Meta-Repo (Shell-Build).

Beobachtete Reibung:

- Drei Branches, zwei davon mit uneinheitlicher Rollenverteilung
  (Fitness: Prod = `vitalos`; Fuel: Prod = `master` — zwei Namen für dieselbe Rolle).
- `vos-release` ist eine Merge-Maschine (origin/master → `*-app`-Checkout auf
  Branch `vitalos`), die bei Abweichungen Konflikte produziert (Beispiel
  journal `28cec44`/`auth.js`, manuelles Auflösen am 2026-11-05 nötig).
- Die `*-app`-Checkouts sind als Merge-Fläche gebaut — ein Aufwand, der
  wegfällt, sobald keine Branch-Merge-Akrobatik mehr nötig ist.

Die zwei echten Gates, unabhängig von Branch-Anzahl:

1. **Qualitäts-Gate:** Checks laufen, bevor Stoff Produktionsmaterial wird —
   heute PR `dev → master` mit Auto-Merge-Checks.
2. **Adoptions-Gate:** Die Shell nimmt bewusst einen Stand auf — heute der
   Gitlink-Bump (`vos-release`), immer ein separater, intendierter Schritt.

## Optionen

| | A: Status quo | B: Pin auf master, dev bleibt | C: nur vitalos (Trunk) |
|---|---|---|---|
| Dauer-Branches | 3 | 2 | 1 |
| PR-Pfad | dev → master | dev → master | Feature-Branch → vitalos |
| Shell-Aufnahme | Merge + Bump | Bump | Bump |
| Staging-Puffer App↔Shell | ja (bewusst) | nein | nein (bewusste Entscheidung beim Bump) |
| `*-app`-Checkout als Merge-Fläche | nötig | entfällt → materialisierter Pin | entfällt → materialisierter Pin |
| Preview | dev-Push | dev-Push | PR-Channel (existiert je PR schon) |
| Konfliktquelle `vos-release` | bleibt | halbiert | eliminiert |
| WIP-Akkumulation | auf dev | auf dev | auf kurzlebigen Feature-Branches |
| Migration-Aufwand | — | klein (Branch-Retarget + Tooling) | mittel (+Alle Apps auf neue Trunk-Namen) |

## Empfehlung (Diskussionsstand)

Variante C mit zwei unverzichtbaren Guardrails:

- **PR-Gate bleibt Totschutz:** Agenten (Auto-Commit-Policy!) und Features pushen
  ausschliesslich kurzlebige Branches; Trunk nur via PR mit gruenen Checks
  (Auto-Merge wie heute). Direkter Trunk-Push durch Agenten ist verboten —
  ein fehlgeleiteter Agent-Stand darf nie Produktionsmaterial werden.
- **Pin-Gate bleibt Adoptions-Ritual:** Shell-Push nur via Pointer-Bump
  (`vos-release` schrumpft auf bump + meta-commit + push).

Konsequenz: Die `*-app`-Checkouts degenerieren zu materialisierten Pins —
in ihnen passiert nie wieder etwas, das ist die Rolle, die sie ohnehin
nur noch spielen (siehe Diskussion 2026-11-05: „macht ja keinen Unterschied,
ob in vitalos drin oder daneben" — richtig, sobald die Merge-Fläche wegfällt).

## Migrationsreihenfolge (pro Repo, ein Changeset pro Schritt)

1. **Werkzeug:** `vos-release` abfragen auf Pin-Ziel `vitalos`-Trunk (kein Merge),
   `vos-release-pr` retargeten (Base `vitalos`), `vos-overview` anpassen.
2. **Pilot-Repo:** eines mit wenig Traffic (Vorschlag: `skills-dev`, keine
   besonderen Verdrahtungen). Trunk `vitalos` anlegen/rebasen, `dev`/`master`
   schliessen (Archiv-Branch), CI-Retargeting (Preview auf PR, Deploy auf
   `vitalos`-Push mit required Checks), Pre-Push-Hooks anpassen
   (plan→fitness Pre-Push-Hook beachten!).
3. **Rollout** Reihenfolge restlicher Repos: relax, learn, 6pack, plan, fuel,
   journal, habits. **fitness zuletzt** (Plan-Sync-Hook, catalog-ui, meiste
   Verdrahtung).
4. **Meta:** Submodule-Branch-Eintrag in `.gitmodules` (`branch = vitalos`
   bleibt, aber jetzt ist es der Trunk), `deploy-shell.yml` und
   `CI-DEPLOY-PR-FLOW.md`/`DEPLOYMENT.md` aktualisieren; Fitness' Prod-Branch
   auf `vitalos` vereinheitlichen.
5. **Rapprocher:** Nach 2-3 stabilen Releases alle dev/master-Branches
   löschen (origin), `vos-trackers`-Systeme und Dashboards anpassen
   (BOOT-Report/Portal).

## Offene Fragen (vor Freigabe klären)

- Preview-Kanäle: reichen PR-Channels je PR, oder braucht es einen
  dev-artigen Dauer-Preview-Channel?
- WIP: Wie wird Work-in-Progress gehandhabt — Feature-Branches leben dann
  unter Namenskonvention (`feat/*`, Muster existiert mit
  `fix/journal-standalone-build-36`).
- `vitalos`-Branch der `*-app`-Checkouts: beim Rollout auf `{{Trunk}}`-Name
  umbenennen oder Name behalten?
- Dependabot: Retargeting der base (heute zeigte der Okt-31-Setup-PR
  base `master`).

## Rollback

Da Trunk-Pinning nur Branch-Rollen verschiebt, ist ein Rollback pro Repo
ein Rollback von `vos-release` (Merge-Modus reaktivieren) plus
Branch-Retargeting zurück — dieselbe Aenderungsform, kein Datenverlust.
