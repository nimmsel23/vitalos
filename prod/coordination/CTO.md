# CTO — Stehendes Technik-Bild (VitalOS)

Zustaendig: Codex als Org-CTO (Owner-Entscheidung 2026-11-08). Dieses
Dokument ist das Stehbild der Technik-Linie. Der bestehende WS3-Vibe-Runner
bleibt als technischer Tagesablauf separat bestehen; seine Laufzeitkonfiguration
wird durch die Rollenuebernahme nicht automatisch geaendert. Tagesgedaechtnis
und Detailfindings liegen additiv in
`~/.local/state/vitalos-cto/CTO.md` (privat, unversioniert); dieses Dokument
wird vom CTO — auch automatisch in der täglichen 06:40-Runde — fortgeführt:
Stehbild strafft, Überschriften behalten, Neuerscheinendes einsortieren.

Stand: 2026-11-10, ca. 08:15 CET (AL 9/9 cursor OK; SmartLog 5f09bbb1 + Dependabot-/prod 7df12a13 done; #13/#38 gemergt; rot: fitness tip biome, Meta esbuild-security, coach backend/fuel Dep; Nacht: eeb9d722/175b5162/49499dfb; Details state-CTO.md).

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
             vos-docs-dirty list, vos-al-log --audit
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

- claude/codex: bis 11.11. limitiert; Läufe laufen über Reserve (vibe).
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

## Offene Punkte (kommende Runden)

1. M1-RC SmartLog-Beweis (Org-Task 5f09bbb1): Fix 5f2f694 DEPLOYED (CEO 08.11.);
   Beleg = Emulator 13:00 heute. Danach Client-Haertung eeb9d722.
2. Shell-CI Lockfile (767c02ad): journal-app lucide-react/tailwind-merge Drift
   vs Root-Lockfile — Deploy 42527809554 rot; Aktiv in NEXT.md.
3. Dependabot Meta Root-only (uuid 7df12a13): yml lokal auf directory=/ ;
   Verifikation naechster Mo-Lauf (keine prod vite/zod misconfigured_tooling).
   vitalos #13 node-forge bleibt Owner-Gate.
4. 6pack vite-8 #38 rot (uuid a80cb883): Fix analog fitness 87d349c.
5. coach Catchup unpushed (uuid 7cd93f79): nur eigene 4 Commits pushen.
6. C-007 Merge-Agent-Regel (uuid 4b2781de): Vorschlag Patch/Minor-only bis
   2027-02-07 — wartet CEO-Ack; Drafts #42/#43/#10 rebasen.
7. C-001/C-002/C-003/C-004 Dispatch-Hits: Play-Console, Geraeteabnahme,
   4-Deposit-Lueckenliste, Sichtbarkeit — AL/Live bzw. CTO.
8. Security-Buendel (uuid 3e4b583d, due 12.11.).
9. WAYLAND-Import-Ursache (uuid 5870061d); Abhilfe headless-Drop-in steht.
   Kitty-Pilot bewertet/geschlossen (20ba0446): headless Standard.
10. AUTOMATION-Inventur: erste Zeilen Mo (relax 2, fitness 1) — Aggregation
    weiterfuehren.
11. gog CEO-Mailbox Auth (refresh-token) — Owner/CEO-Handgriff.
12. Engine-Credits agy: Nachtwelle tot; Catchup-Bias cursor bleibt Reserve.

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
