# CTO — Stehendes Technik-Bild (VitalOS)

Zuständig: CTO (WS3-Vibe). Dieses Dokument ist das öffentliche Stehbild der
Technik-Linie — der CEO (und jede Linie per Drilldown) liest hier den
aktuellen Stand. Tagesgedächtnis und Detailfindings liegen additiv in
`~/.local/state/vitalos-cto/CTO.md` (privat, unversioniert); dieses Dokument
wird vom CTO — auch automatisch in der täglichen 06:40-Runde — fortgeführt:
Stehbild strafft, Überschriften behalten, Neuerscheinendes einsortieren.

Stand: 2026-11-07, ca. 21:16 CET (CEO-Auftragspaket umgesetzt; CI-Agenten in sieben Modul-Repos und Coach eingerichtet; Coach Pages auf docs-only Actions umgestellt und live verifiziert; Details STATUS.md-CTO-Sektion/TODO.md).

## Derzeitiges Systembild (Tageszyklus)

```
02:10–06:11  AL-Läufe je Repo (abteilung@*.service, Runner ~/.dotfiles/bin/abteilung-run;
             vor Lauf: AL-LOG.md-Sektion mechanisch vorbefüllt via vos-al-log;
             coach-dev läuft als KITTY-PILOT: persistente interaktive Session
             im kitty statt headless, ABTEILUNG_MODE=kitty, headless = Fallback)
06:40        CTO-Runde (vitalos-cto.timer): Abnahme der Nacht, Technik-Inventar,
             Hygiene (u. a. ~/.git darf nicht existieren), Aufträge +go, Rückkanal
             3-Zeiler; liest: state-CTO.md, Koordinationsfläche, AL-Logtails,
             vos-docs-dirty list, vos-al-log --audit
             Live-Gate: Laeuft der CTO als Live-Session (WS3), setzt seine
             Wachschleife den Heartbeat → systemd-Lauf ruht (< 60 min frisch)
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

1. Erste CTO-Runde abnehmen: relax-Zweitsession, vitalos-AL-ohne-Runner
   (Alt-Beobachtung), neue BELEG-Blöcke der ALs, erste Dünne-Grenzen,
   liegen gebliebene vos-docs-dirty-Marker, vos-al-log --audit (Erstlauf
   AL-LOG heute Nacht).
2. CEO-Erstlaufabnahme Roadmap-Drilldown (Diff coach-dev 42faa43a) → danach
   Push (Betta auf Zuruf) und Enable vitalos-roadmap.timer (07:45).
3. ALPHAOS-Server-Restart-Termin mit Daniel — aktiviert das +hot-Repo-
   Routing (aos 61773a0); kein Autostart, bewusst koordiniert.
4. fitness #87 (Vite 6→8): dev rot, Reparatur laeuft bei Alpha (Betta-
   Major-Wache: eine Mail, live gruen); vitalos #13 (node-forge) Owner-Gate.
5. Kitty-Pilot coach-dev: erster Lauf heute Nacht 02:10 (persistente kitty-
   Session statt headless); Bewertung nach ~2 Laeufen zusammen mit CEO.
6. Shell-Hilfen-Regel + venv-Konvention + Rollen-Tag/project=Repo: in allen
   9 AL-Guides verankert (a67caf3) — Befolgung in der naechsten
   AL-Runde stichprobenweise pruefen.
7. Door-Erinnerung: scheduledDoorReminders ohne Cloud-Scheduler-Job —
   Anlage bei der Deploy-Linie anordnen (aus der Invoker-Diagnose).
8. journal-dev Client-Haertung: Rohfehler „INTERNAL [0]" auf fail-closed-
   Hinweis mappen — Auftrag an die Journal-AL in der naechsten Runde.
9. AL-Guides auf Promote-Fluss umstellen (+go erteilt, Umsetzung ausstehend).
10. vitalos-cto fish-Profil ergaenzen (CEO-Hinweis Skelett); Python-Werkzeuge
    nach Oracle-Konsolidierung ins EINE Org-venv ~/.venv (nicht mehr eigene
    Rollen-venv); bash/node bleibt ohne.
11. Tag-Migration +go→+hit (CEO-REGEL 2026-11-07 abends, Org-taskrc
    verbindlich): taskrc-al nachgefuehrt (+hit 8.0/+br 8.0/+hot 1.0/+lr 2.0/
    +s -1.0, +go entfaellt), 9 AL-Guides + Runner-Bootstrap umgestellt,
    offene +go-Tasks (journal Haertung, 6pack AGENTS-Doku) zu +hit umgetaggt.
    Kuenftige CTO-/AL-Auftraege heissen +hit, nie +go.

## CI-Nachprüfung und Pages-Landingpages — 2026-11-07

- Die grünen Gemini-Agentenläufe waren No-op, nicht Code-Reparaturen. Coach Pages Run `42409955564`: `REPORT_ACTION=noop`, Publish übersprungen. 6Pack Run `42409237376` erkannte den Gemini-Key, sperrte aber wegen fehlendem `SYNC_TOKEN` vor Repair/Push.
- 6Pack PR #36 ist ein absichtlicher Red-Test und bleibt rot. PR #35 enthält den GITHUB_TOKEN-Repair-Fix; Check, Preview und Merge-Agent waren grün, PR ist aber Draft und nicht aktiv auf `master`.
- Veraltete Coach-Kopie `.github/workflows/preview-dev.yml` entfernt. Sie setzte den Coach-SHA als Fitness-App-Ref; die Fitness-Pipeline bleibt im Fitness-Repo.
- `docs/README.md` mit Jekyll-Landingpage in allen acht Modul-/Coach-Repos auf `dev` ergänzt. Pages-Settings für sieben Repos konnten über den aktuellen GitHub-Connector nicht gesetzt/geprüft werden; Coach nutzt seinen bestehenden Actions-Pages-Workflow. Keine Seitenveröffentlichung für die sieben behauptet.
