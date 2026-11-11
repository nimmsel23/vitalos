# CTO — Stehendes Technik-Bild (VitalOS)

Zustaendig: Codex als Org-CTO (Owner-Entscheidung 2026-11-08). Dieses
Dokument ist das Stehbild der Technik-Linie. Der bestehende WS3-Vibe-Runner
bleibt als technischer Tagesablauf separat bestehen; seine Laufzeitkonfiguration
wird durch die Rollenuebernahme nicht automatisch geaendert. Tagesgedaechtnis
und Detailfindings liegen additiv in
`~/.local/state/vitalos-cto/CTO.md` (privat, unversioniert); dieses Dokument
wird vom CTO — auch automatisch in der täglichen 06:40-Runde — fortgeführt:
Stehbild strafft, Überschriften behalten, Neuerscheinendes einsortieren.

**Simplicity (Owner 2026-11-11):** Meta-`vitalos` + alle `*-dev` so simpel
wie möglich. **Einzige Ausnahme: `vitalos/prod`.** Neue CI/Infra nur bei
echtem Schmerz; sonst weglassen. SOT: `.dotfiles/docs/CI.md` (Kopf).

Stand: 2026-11-11, ca. 08:15 CET (AL 9/9 cursor OK; Live-Smoke 42799838824=setup-node transient, Tip gruen; Engine-Pin cursor off→auto; Teilergebnisse fuel/relax unpushed → Hits c545486f/ed94e4cd; automerge-retarget 0e25e4c4; Details state-CTO.md).

## Derzeitiges Systembild (Tageszyklus)

```
02:10–06:11  AL-Läufe je Repo (abteilung@*.service, Runner ~/.dotfiles/bin/abteilung-run;
             vor Lauf: AL-LOG.md-Sektion mechanisch vorbefüllt via vos-al-log;
             coach-dev läuft als KITTY-PILOT: persistente interaktive
             session im kitty statt headless, ABTEILUNG_MODE=kitty, headless = Fallback;
             ab 08.11. erzwingt Drop-in 10-ui-headless.conf ABTEILUNG_UI=headless für
             ALLE geplanten Läufe — der Coach-Pilot-Zweig läuft davor und bleibt unberührt)
08:15        CTO-Runde (vitalos-cto.timer, seit 2026-11-09): Abnahme der Nacht,
             Technik-Inventar, Hygiene (u. a. ~/.git darf nicht existieren),
             Aufträge +go, Rückkanal 3-Zeiler + Mail an nimmdaniel+cto;
             liest: state-CTO.md, Koordinationsfläche, AL-Logtails,
             vos-docs-dirty list, vos-al-log --audit;
             Dev-Dashboard: `vos-portal --all --check` — bei Drift `vos-portal`
             + `portal/dev-status.json` (Auth/Gate/ROT) nachziehen
             (SOT docs/DEV-DASHBOARD.md, Pages …/dev-dashboard.html)
             Codex-Flags: nur --approve-for-me --skip-git-repo-check (kein -s)
             Live-Gate: Heartbeat einer Live-Session ersetzt den Timer NICHT
             (Owner: Timer bleibt die verlässliche Tagesrunde)
07:30        thin-results (vitalos-thin-results.service): RESULTS der Meta-
             Submodule dünnen, Destillat in Doku-Dateien, Dünne-Grenze ans Ende
07:45        vitalos-roadmap (gebaut, Timer NOCH nicht aktiviert): Drilldown-
             Sync roadmap.html — Enable nach CEO-Erstlaufabnahme des Diff 42faa43a
```

Der CTO läuft tagsüber als Live-Session: 20-Min-Wachschleife (CEO-Status-Docs +
Alpha/Betta-Berichte, mtime-Delta) setzt den Heartbeat, solange die Session lebt.

## Doku-Verantwortung (Owner-Regel seit 2026-11-07)

- Der AKTIVE Agent, der committet, zieht RESULTS.md/NEXT.md sofort mit
  eigenem Kontext nach — niemand liest später Session-Transkripte.
  Erinnerung + Docs-Inventar via post-commit-Hook (`vos-docs-dirty`,
  dotfiles) in allen 18 Produkt-Checkouts (9 dev-Repos, 9 Meta-Submodule).
  Docs-Commits räumen den Marker still ab; liegen gebliebene Marker = CTO-
  Auftrag an die Linie.
- Entsteht RESULTS.md in leeren Ordnern: AGENTS.md MIT anlegen (AL-Drilldown).
- thin-results hinterlässt eine datierte Dünne-Grenze; Neues kommt darüber.
- Nächtlicher Doc-Bau existiert nicht mehr (fill-session-docs deaktiviert;
  docs-sync.mjs nur noch manuelles CTO-Rückfallwerkzeug).

## Release-Pipeline (Standardweg, Owner-Entscheidung „PRs sind zum Releasen da")

```
push dev → Check grün → automerge-pr.yml (Dependabot-Squash auf dev,
             Majors-Sperre) → Auto-Promote (FF master) → Live-Deploy master
```

- Aktiv in fitness/fuel/journal/plan/relax/skills/6pack; learn + habits
  dormant bis Promote-Migration (Alt-Gen).
- Beleg: journal-dev, Dependabot-PRs #30/#31/#34/#35/#37 automatisch gemergt,
  Kette bis Live grün (2026-11-06).
- Dokumentiert in `~/.dotfiles/docs/CI.md` §8 (Auto-Merge-Politik).
- Offen (CTO-Liste, aus CI.md): Promote-Race-S2-Retry je Repo; Push-Freigabe-
  Tokens in AL-Guides (S4); Auto-Promote-Restrepo-Liste; E-Mail-Rollen-Labels.

### Externe Agenten-Inputs — 2026-11-08

- Sweep AI wurde als moeglicher CI-Agent und Alpha/Betta-Ersatz genannt. Der
  aktuell belegte Sweep-Auftritt beschreibt ein JetBrains Coding-Plugin, keine
  einsatzfertige Org-CI-Lane. Keine Installation oder Runner-Ablosung erfolgt.
- Pythagora wurde ebenfalls als Kandidat genannt. Das oeffentliche GPT-Pilot-
  Repo markiert sich als nicht mehr gepflegt; ein aktueller CI-Runner fuer die
  Org ist nicht belegt. Keine alte GPT-Pilot-Installation aufsetzen.
- Vor einer Entscheidung Anbieterprodukt, Kosten/API-Key, GitHub-Umfang,
  Rollen- und Taskwarrior-Handoffs sowie sichere PR-Gates konkret pruefen.

### CI-Agenten und Coach Pages — 2026-11-07

- Gemini-CI-Agenten in `6pack-dev`, `skills-dev`, `plan-dev`, `fitness-dev`,
  `fuel-dev`, `relax-dev`, `journal-dev` und `coach-dev` eingerichtet. Der
  neue `GEMINI_API_KEY` liegt als Actions-Secret; Git-Operationen verwenden
  den kurzlebigen, workflow-beschränkten `GITHUB_TOKEN` statt `SYNC_TOKEN`.
- Alle zuletzt geprüften Agent-Runs waren grün; Modul-Checks, Auto-Promote
  und Live-Deploys ebenfalls. Bisher waren die Agent-Entscheidungen No-op auf
  grünen Läufen — ein echter Gemini-Reparaturlauf auf einem roten Code-Check
  ist noch nicht belegt.
- Coach GitHub Pages: Root-README und `index.html` waren bereits vorhanden.
  Ursache waren rekursive Checkout-Fehler an lokalen/veralteten Submodul-
  Gitlinks. Pages nutzt jetzt einen nicht-rekursiven Actions-Workflow, der
  ausschließlich `docs/` veröffentlicht; `docs/index.md` ist der Einstieg.
  Pages-Run `42409890141` grün, Live-URL lieferte HTTP 200.
- Separater offener Befund: Coachs `Preview (Fitness dev)`-Workflow lief für
  Coach-Commit `378673dc` rot, weil er diesen SHA als Fitness-App-Commit holen
  wollte (`42409360631`). Coachs eigener `Deploy Coach` blieb grün; den
  veralteten Preview-Workflow separat prüfen.

## Engine-Lage

- Ab 2026-11-11: AL-Default `auto` (vibe→cursor→claude→codex). Cursor-Pin
  Drop-in `20-engine-cursor.conf` deaktiviert (`.disabled-20261111`).
- claude/codex: Fenster ab 11.11. offen (Script-Defaults AVAILABLE_AFTER).
- agy bleibt PM-Engine, nicht im AL-Pool.
- Auto-Doc-Engine-Kette: claude/haiku → codex/gpt-6-luna → vibe
  (Fix 2026-11-07: Modell heißt gpt-6-luna, nicht luna).

## Linien-Karte (wo arbeitet wer, wo liegt das Gedächtnis)

| Linie | Arbeitsgebiet | Gedächtnis / State |
|---|---|---|
| CEO (WS1, Codex) | `~/vitalos-prod` (+ Koordinationsfläche darin) | `~/.local/state/vitalos-ceo` |
| Alpha + Betta (persistente CTO-Subagents, ehemals WS2-Fenster) | Alpha: Features/Doku in `~/dev`-Repos + Meta-Worktree `~/dev/.vitalos`; Betta: Git-/PR-Mechanik, Sweeps, Bots, Release-Routen | Session-Artefakte in `~/dev` (ALPHA.md, BETTA.md, HANDOFF-QUEUE-A/B, Alpha_Betta.md, LOGBUCH-foot-agents.md); Auftrag/Abnahme/Eskalation: CTO |
| CTO (WS3, Vibe, dieser Text) | Produkt-Meta `~/vitalos`, Runner/Skripte `~/.dotfiles`, AlphaOS-Server-Betreuung; Vorgesetzter von Alpha/Betta; tagsüber Live-Session mit 20-Min-Wachschleife + Heartbeat | `~/.local/state/vitalos-cto` (+ dieses Stehbild) |
| PM (Stabsrolle, persistenter CEO-Subagent auf WS1) | Produktübersicht: Ziele, App-Backlogs, Abhängigkeiten, Abnahme-Kriterien — KEIN eigener Runner/Timer; spricht fachlich DIREKT mit den ALs (liest: PRODUKT-BACKLOG.md, schreibt Vorlagen über die Koordinationsfläche, liest AL-Tageslogs `AL-LOG.md` je Repo) | `~/.local/state/vitalos-pm/PM.md` (+ PRODUKT-BACKLOG.md auf der Koordinationsfläche) |
| Abteilungsleiter | je `~/dev/<repo>-dev` | `~/.local/state/abteilung/<repo>.log`, `ABTEILUNG.md` im Repo |

## Ansprech- und Eskalationswege

- Technisches + Umgebungs-Signale → CTO (Einlauf, ordnet selbst zu ALs an).
- Strategie/Priorisierung/Freigaben/Milestone → CEO (Veto über allem).
- Produktziele/Backlog-Ordnung/Abnahme-Vorbereitung → PM (Stabsrolle beim
  CEO; delegierter Arbeitsraum gemaess Owner-Klarstellung im
  PRODUKT-BACKLOG). PM konkretisiert und ordnet freigegebene Produktarbeit,
  darf aktive Backlog-Arbeit ohne Einzelfreigabe direkt an app-dev-ALs geben
  und dort `+go` setzen. Ausdruecklich wartende Owner-Gates und Vorschlaege
  bleiben ausgenommen; CEO-Rangfolge gilt. Neue Ziele, Rangfolgewechsel und
  Scope-Ausweitungen bleiben beim CEO. PM<->AL stimmt Produktfragen direkt ab; AL-Tageslog ist die
  einmalige Statusquelle fuer PM und CTO. Technische Architektur-, Infra-
  und Runner-Entscheidungen bleiben CTO-Linie. Kein Direktkanal an Daniel.
- Deploy/Store/Geräte/prod-Functions → Owner-Gate über CEO.
- Kommunikation: Koordinationsfläche und lokale Runner-Logs. Nur der CEO
  sendet reguläre Nachrichten an Daniel; AL-/CTO-Runner melden nicht per tele.

## Dev-Dashboard (Owner-Pflicht CTO)

- Generator: `~/vitalos/bin/vos-portal` → `portal/index.html`,
  `docs/dev-dashboard.html`, je Repo `docs/apps.html`.
- Kuratiert: `portal/dev-status.json` (authMode, loginGate, rot).
- Hosting-Kanon: `docs/HOSTING-TARGETS.md` + `portal/hosting-targets.json`
  — Ziel überall `vos-<slug>.web.app`; Suffix-Hauptapps (`fuel-vos`,
  `journal-vos`, …) und `fitness-aos` migrieren; keine neuen `*-vos`-Sites.
- PM-Link: `PRODUCT.md` § Dev-Dashboard. Keine zweite manuelle Apps-Liste.

## Offene Punkte (kommende Runden)

1. Teilergebnis-Pushes: fuel `c545486f`, relax `ed94e4cd` (Nacht 11./12.11.).
2. Fuel Mini OAuth redirect URIs (`redirect_uri_mismatch`) — GCP Console;
   Dashboard-ROT in `portal/dev-status.json` bis erledigt.
3. automerge base=master→dev Retarget SSOT journal `0e25e4c4` / Tracking
   `c1f9b6ce`; danach Port auf Schwester-Repos.
4. fuel Stabilitätswache `6a0eeebc` bis echter Dependabot-Merge-Beleg.
5. fitness Haupt-Checkout-Sync `903f1fbe` (vos-al-log Prefill/Worktree).
6. C-001b Closed-Test-Track `358d9335` — Owner/Play-Console-Fakt.
7. Security-Buendel `3e4b583d` (Owner-Gate).
8. Cloud-CTO-Design `c63fad5d/ee2fb0de/8929c32b/0a771e65` (nicht Bau-Welle).
9. gog CEO-Mailbox Auth (refresh-token) — Owner/CEO-Handgriff.
10. Meta Dependabot esbuild-security Noise (AL-Befund `fdd8b7fd`); Draft
   journal #42 unberührt.
11. WAYLAND-Import-Ursache `5870061d`; Abhilfe headless-Drop-in steht.
12. AUTOMATION-Inventur weiterfuehren (Door-War).

## CI-Nachprüfung und Pages-Landingpages — 2026-11-07

- Die grünen Gemini-Agentenläufe waren No-op, nicht Code-Reparaturen. Coach Pages Run `42409955564`: `REPORT_ACTION=noop`, Publish übersprungen. 6Pack Run `42409237376` erkannte den Gemini-Key, sperrte aber wegen fehlendem `SYNC_TOKEN` vor Repair/Push.
- 6Pack PR #36 ist ein absichtlicher Red-Test und bleibt rot. PR #35 enthält den GITHUB_TOKEN-Repair-Fix; Check, Preview und Merge-Agent waren grün, PR ist aber Draft und nicht aktiv auf `master`.
- Veraltete Coach-Kopie `.github/workflows/preview-dev.yml` entfernt. Sie setzte den Coach-SHA als Fitness-App-Ref; die Fitness-Pipeline bleibt im Fitness-Repo.
- `docs/README.md` mit Jekyll-Landingpage in allen acht Modul-/Coach-Repos auf `dev` ergänzt. Pages-Settings für sieben Repos konnten über den aktuellen GitHub-Connector nicht gesetzt/geprüft werden; Coach nutzt seinen bestehenden Actions-Pages-Workflow. Keine Seitenveröffentlichung für die sieben behauptet.

## Gemini-CI-Agent: gemeinsamer Exit-1-Fix — 2026-11-07

- Journal-Run [42416606547](https://github.com/nimmsel23/journal-dev/actions/runs/42416606547) zeigte `Unknown JSON field: baseRepository` aus `gh pr list --json`; der Agent beendete die Analyse mit Exit 1, bevor Gemini aufgerufen wurde.
- Den ungültigen Feldsatz in `.github/ci-agent/repair.mjs` auf allen acht Modul-/Coach-Repos auf `dev` entfernt. PR-Suche filtert jetzt Head-Owner:Branch und nutzt nur unterstützte Felder. Die Module liefen durch Check, Promotion und Live-Deploy grün; Coach-Fix liegt auf `dev`.
- Abnahme ist erst mit einem echten roten Code-Check vollständig: Gemini-Diagnose, Reparaturcommit, neu gestarteter Check und der vorgesehene Deploy. Erfolgreiche Agent-Runs auf grünen Checks belegen nur No-op-Verhalten.

## UI-Modus der Nachtläufe — 2026-11-08

- BEFUND: `WAYLAND_DISPLAY` steht in der systemd-Manager-Umgebung (Import-Ursache offen, Org-Task 5870061d) — dadurch liefen am 08.11. ALLE 9 AL-Läufe (02:10–06:11) im generischen kitty-Pfad (BELEG: `ui=kitty` je Log), NICHT im Coach-Pilot-Zweig. Ausgang: 8x OK, 1x FEHLER-turn_limit (fitness, unabhängig vom UI), kein UI-bedingter Fehlschlag.
- GEGENMASSNAHME (CTO): Drop-in `~/.config/systemd/user/abteilung@.service.d/10-ui-headless.conf` erzwingt `ABTEILUNG_UI=headless` für alle geplanten Läufe. Bestandsentscheidung bleibt: headless Standard, kitty NUR als coach-dev-Pilot; manuelle Shell-Starts in der Wayland-Session unberührt.

## Merge-Agent (Owner-Linie) — Verifikation 2026-11-08

- Kein Doppel-Merge-Race: merge-agent.yml (fasst nur `vitalos master` an) und automerge-pr.yml (nur Dependabot->dev) haben disjunkte Basen; Draft-PRs werden gesprungen (isDraft-Filter); concurrency-Gruppe serialisiert eigene Cron+PR-Läufe. Belege: Org-Task d0ee4de2.
- 4 Owner-Draft-PRs offen (fitness #92, journal #42, plan #43, coach #10): deren repair-Schritte failen auf den PR-Branches an Alt-Kopien der ci-agent-Workflows (`Input required and not supplied: token`, z. B. journal-Run 42393768790). Empfehlung an die Owner-Linie (via CEO): vor Publish auf dev rebasen. 6pack #35/#37 bereits gemergt.
- SYNC_TOKEN fehlt in allen 5 Repos; GITHUB_TOKEN-Merges feuern keine Push-Workflows (Architektur-Folge dokumentiert in Org-Task d0ee4de2).

## Simplicity-Umsetzung 2026-11-11

- Fleet-weit aus `*-dev` entfernt: `gemini-ci-repair.yml`, `merge-agent.yml`.
- Spine: Check → automerge-pr → automerge → Deploy. SOT `.dotfiles/docs/CI.md` §1.
- `vos-pr-wave` bleibt lokal als Fangnetz für Non-Dependabot-PRs.
- `vitalos/prod` unverändert (einzige erlaubte Komplexitätszone).

