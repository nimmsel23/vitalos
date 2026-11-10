# C-011 — Live-Smoke nach jedem Live-Deploy

Stand: 2026-11-10. CEO-Dispatch 2026-11-10 #003, Auftrag C-011.
Ziele: Shell (`vitalos`), Journal, 6Pack, Fitness. Zusätzlich die zweite
Fitness-Live-Site `fitness-vos`, weil sie aus diesem Meta-Repo deployt.

Ein roter Smoke blockiert keinen Merge. Er färbt den Deploy-Lauf nicht um.
Der CTO-Tagesbericht liest den eigenen Workflow:

```bash
gh run list --repo <repo> --workflow "Live Smoke (…)" --limit 5
```

## Regel

Im Repo gibt es zwei verschiedene „Smoke“-Begriffe.

`tooling/README.md` beschreibt den Paket-Smoke `scripts/smoke.test.mjs`
(mindestens `engines` und `name`). Der läuft im Check vor dem Promote und
darf damit einen Merge aufhalten. Er öffnet keine Seite und sieht keinen
Blackscreen.

Keiner der Live-Deploy-Workflows unten prüft nach dem Deploy, ob die Seite
lädt, ob `#root` leer bleibt oder ob der Browser einen unbehandelten
JS-Fehler wirft. Der 6Pack-Blackscreen (6pack-dev `edd7436`, Vite 8 /
Rolldown, behoben) war genau diese Lücke: der Deploy bleibt grün, die Seite
ist schwarz.

Der Live-Smoke für C-011 folgt deshalb dieser engen Regel:

1. Eigener Workflow `.github/workflows/live-smoke.yml`. Auslöser ist
   `workflow_run` nach einem erfolgreichen Live-Deploy auf `master`
   (`push` oder `workflow_dispatch`).
2. Er hängt nicht an `check.yml` und nicht an `automerge.yml`. Er ist kein
   PR-Check. Required Checks bleiben unberührt.
3. Prüfung in `scripts/live-smoke.mjs` mit Playwright, nur im Runner
   installiert, ohne Lockfile-Änderung: HTTP-Status unter 400, `#root` oder
   `#app` hat nach dem Laden mindestens ein Kind, keine `pageerror`, keine
   `unhandledrejection`. Ein Login-Schirm mit Text ist grün. Ein leeres Root
   ist rot.
4. Rot ist der Smoke-Lauf selbst. Der Tagesbericht meldet ihn. Niemand rollt
   den Merge zurück, nur weil der Smoke rot ist.
5. Der Workflow läuft erst, wenn die Datei auf dem Default-Branch des
   jeweiligen Repos liegt. Dieser Auftrag mergt nicht.

## Stand der Läufe

„Smoke vorhanden“ gilt für den Default-Branch am 2026-11-10, vor dem Merge
der PRs. „Letzter Lauf“ ist der letzte Live-Deploy-Workflow, nicht ein
Smoke-Lauf. Einen Smoke-Lauf gibt es noch nicht.

| Ziel | Smoke vorhanden | Letzter Lauf |
| --- | --- | --- |
| Shell `https://vitalos.web.app` | nein | grün — [Deploy VitalOS Shell](https://github.com/nimmsel23/vitalos/actions/runs/42763706276), 2026-11-10 05:41 UTC, `d76517f`, Workflow `.github/workflows/deploy-shell.yml` |
| Journal `https://journal-vos.web.app` | nein | grün — [Live Deploy (Journal master)](https://github.com/nimmsel23/journal-dev/actions/runs/42734642729), 2026-11-10 01:16 UTC, `5aef043`, Workflow `journal-dev/.github/workflows/deploy-master.yml` |
| 6Pack `https://vos-6pack.web.app` | nein | grün — [6Pack deploy (preview + standalone)](https://github.com/nimmsel23/6pack-dev/actions/runs/42763805914), 2026-11-10 05:42 UTC, `master` / `32c581c`, Workflow `6pack-dev/.github/workflows/deploy.yml` |
| Fitness `https://fitness-aos.web.app` | nein | grün — [Live Deploy (Fitness master)](https://github.com/nimmsel23/fitness-dev/actions/runs/42748261937), 2026-11-10 03:15 UTC, `1b17504`, Workflow `fitness-dev/.github/workflows/deploy-master.yml` |
| Fitness VOS `https://fitness-vos.web.app` | nein | grün — [Deploy VOS Fitness PWA](https://github.com/nimmsel23/vitalos/actions/runs/42755855196), 2026-11-10 04:26 UTC, `86d4017`, Workflow `.github/workflows/deploy-vos-fitness.yml` |

`nimmsel23/fitness` ist die Knowledge Base und hat keinen Hosting-Deploy
(Workflow-Datei `.github/workflows/enrich-inbox.yml`). Die Fitness-Live-Site
ist `fitness-dev`.

Die Deploy-Workflows schicken bei Erfolg Telegram und prüfen davor Tests oder
den Build. Sie laden die Live-URL nicht im Browser.

## Manuelle Probe am 2026-11-10

Dieselbe Prüfung wie `scripts/live-smoke.mjs`, lokal mit Playwright 1.65.0,
weil der CI-Smoke noch nicht auf `master` liegt.

| URL | Ergebnis |
| --- | --- |
| `https://vitalos.web.app` | grün, HTTP 200, Login-Text, Root mit Kind |
| `https://vos-6pack.web.app` | grün, HTTP 200, Workout-Text, Root mit Kind |
| `https://fitness-aos.web.app` | grün, HTTP 200, App-Text, Root mit Kind |
| `https://fitness-vos.web.app` | grün, HTTP 200, Login-Text, Root mit Kind |
| `https://journal-vos.web.app` | rot, HTTP 200, sichtbarer Text nur „VITAL-JOURNAL“, `#root` ohne Kind, `pageerror: missing ) after argument list` |

Das Journal-Bundle `assets/index-BweuB8sT.js` enthält das Rolldown-Preload-Muster
`[]` plus Hash direkt vor `.then`. Dieselbe Klasse wie der behobene
6Pack-Blackscreen (`fixRolldownPreloadMarker` in `6pack-dev`, beschrieben in
`6pack-dev/AGENTS.md`). Der letzte Journal-Deploy ist trotzdem grün. Der
Smoke würde diesen Stand rot melden, ohne den Merge zu blockieren.

Follow-up für den Journal-AL: Preload-Marker im Journal-Vite-Build analog
6Pack schließen. Dieser Auftrag deployt den Fix nicht.

Weitere Live-Ziele desselben Journal-Deploys (`vos-journal`, `vos-door`,
`vos-voice`, `vos-game`, `vos-tent`, `habit-vos`) und das Learn-Hosting aus
dem Fitness-Deploy (`learn-vos`) haben keinen eigenen Smoke. Der erste Smoke
trifft die Haupt-URL des jeweiligen Auftrags.

## Wo der Smoke liegt

| Repo | Branch | Dateien | Auslöser |
| --- | --- | --- | --- |
| `nimmsel23/vitalos` | `codex/c010-c011-closed-test-smoke` | `scripts/live-smoke.mjs`, `.github/workflows/live-smoke.yml` | `Deploy VitalOS Shell` → `vitalos.web.app`; `Deploy VOS Fitness PWA` → `fitness-vos.web.app` |
| `nimmsel23/journal-dev` | `codex/c011-smoke` | dieselben zwei Dateien | `Live Deploy (Journal master)` → `journal-vos.web.app` |
| `nimmsel23/6pack-dev` | `codex/c011-smoke` | dieselben zwei Dateien | `6Pack deploy (preview + standalone)` auf `master` → `vos-6pack.web.app` |
| `nimmsel23/fitness-dev` | `codex/c011-smoke` | dieselben zwei Dateien | `Live Deploy (Fitness master)` → `fitness-aos.web.app` |
