# CTO — Stehendes Technik-Bild (VitalOS)

Zuständig: CTO (WS3-Vibe). Dieses Dokument ist das öffentliche Stehbild der
Technik-Linie — der CEO (und jede Linie per Drilldown) liest hier den
aktuellen Stand. Tagesgedächtnis und Detailfindings liegen additiv in
`~/.local/state/vitalos-cto/CTO.md` (privat, unversioniert); dieses Dokument
wird vom CTO — auch automatisch in der täglichen 06:40-Runde — fortgeführt:
Stehbild strafft, Überschriften behalten, Neuerscheinendes einsortieren.

Stand: 2026-11-08, ca. 08:45 CET (CTO-Live-Runde 06:40-Nachlauf: AL-Nacht 8/9 OK — fitness turn_limit mit inzwischen grünem Check; SmartLog-500 = M1-RC-Letzblocker, Fix über Alpha-Linie unterwegs; Dienste nach Symlink-Konsolidierung grün verifiziert; UI-Modus der Nachtläufe auf headless zurückgestellt (s. Abschnitt UI-Modus); Details STATUS.md/TODO.md-CTO-SEKTION).

## Derzeitiges Systembild (Tageszyklus)

```
02:10–06:11  AL-Läufe je Repo (abteilung@*.service, Runner ~/.dotfiles/bin/abteilung-run;
             vor Lauf: AL-LOG.md-Sektion mechanisch vorbefüllt via vos-al-log;
             coach-dev läuft als KITTY-PILOT: persistente interaktive
             session im kitty statt headless, ABTEILUNG_MODE=kitty, headless = Fallback;
             ab 08.11. erzwingt Drop-in 10-ui-headless.conf ABTEILUNG_UI=headless für
             ALLE geplanten Läufe — der Coach-Pilot-Zweig läuft davor und bleibt unberührt)
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

1. M1-RC-LETZTBLOCKER smart_log_failed (Org-Task 5f09bbb1): Ursache verifiziert
   — Gemini antwortete, validateResult warf schema_meal (Nicht-HttpsError) →
   Catch-all-500 + klemmender Tages-Lock; KEIN Provider-Fehler. Fix steht:
   backend-dev 5f2f694 (fail-closed-Mapper + Kontingent-Freigabe bei
   entschiedenem Outcome; Proben 5/5). Deploy = Owner-Gate via CEO; zudem
   Alt-Sperre des Emulator-Testkontos klären (Owner-Aktion oder Nachweis nach
   Tageswechsel). Belegfenster: Emulator-Lauf 13:00.
2. Journal-Client-Haertung (Org-Task eeb9d722): Mapping an die HttpsError-
   Codes des Backend-Fixes anpassen, sobald dieser deployed ist.
3. fitness HOTLIST-115 ship: Check dev GRUEN (fca8d65, Runs 42441867294/67309),
   _origin-Badge implementiert (b6e2b74); Release-Kette (Promote+Live-Deploy)
   anstossen/verifizieren, danach Org-Task 20 schliessen — Auftrag Mo-Nacht
   (Org-Task 7bf1db9e, +hit).
4. Skills-dev-Blocker 57f615f7: CTO-Freigabe steht (cherry-pick 217c8fb,
   docs-only, auf dev; danach Patch-Erhalt-Nachweis + local-master-Sync) —
   Auftrag Mo-Nacht (Org-Task 1c3b5b4f).
5. Merge-Agent-Drafts der Owner-Linie (fitness #92, journal #42, plan #43,
   coach #10): repair-fail auf PR-Branches (Alt-Kopie, token-Input) — Empfehlung
   rebasen steht; Owner-Linie entscheidet (via CEO).
6. Dependabot-Major-Umstellung (Org-Task bd20f24d, Owner-Pauschalfreigabe
   07.11.): Betta setzt journal+fuel zuerst um, Rest gestaffelt; Rollback =
   revert-Squash auf dev; fitness/habits/learn bleiben bewusst gesperrt.
7. WAYLAND-Import-Ursache systemd-Manager-Umgebung klaeren (Org-Task 5870061d);
   Abhilfe steht (Drop-in 10-ui-headless.conf).
8. Kitty-Pilot-Bewertung Mo (Org-Task 20ba0446): Pilot-Zweig griff in der
   ersten Nacht nicht (vermutlich kein @kitty-Socket im Service-Kontext);
   Bewertung mit CEO — Soll: kitty NUR coach als persistente Session.
9. Security-Buendel (Org-Task 3e4b583d, +hit, faellig 12.11.): Vorbereitung
   in der Montag-Runde.
10. AUTOMATION-Inventur (Stehenderauftrag): Anker seit 08.11. in allen 9
    Guides; erste AL-Zeilen erwartet ab Montag-Nacht — CTO-Aggregation
    danach (SO-Frist um eine Nacht verschoben; Tent-Argument heute
    qualitativ: automerge/merge-agent/ci-scan/roadmap/thin-results/Detektor).
11. Door-Erinnerung: scheduledDoorReminders ohne Cloud-Scheduler-Job —
    Anlage bei der Deploy-Linie anordnen (aus der Invoker-Diagnose).
12. vitalos #13 (node-forge, prod/functions) bleibt Owner-Gate; Meta-Dep-PR-
    Modell (manuell vs. dev-Zweig) liegt als Optionen beim CEO.
13. vitalos-cto fish-Profil ergaenzen (CEO-Hinweis Skelett); Python-Werkzeuge
    nach Oracle-Konsolidierung ins EINE Org-venv ~/.venv; bash/node ohne.

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
