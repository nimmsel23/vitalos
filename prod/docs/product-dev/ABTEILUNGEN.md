# ABTEILUNGEN — Vertragsentwurf (Stand 2026-11-06, Entwurf vom Manager-Claude, zur Abnahme durch den CEO)

Ziel: VitalOS rausbringen, ein Mensch allein. Der CEO-Agent ist die einzige Instanz, die mit dem User spricht und
entscheidet. Darunter arbeiten Abteilungsleiter (1 pro Repo) und Angestellte (Subagents pro Tab/Bereich).
Dieses Dokument legt nur die **Verträge zwischen den Ebenen** fest. Gebaut ist davon noch nichts.

## 1. Ebenen

```
User ↔ CEO                       Gespräch, Entscheidungen. Legt seinen Skill/Service selbst an.
        ↓ Tasks (Taskwarrior)    ↑ Zusammenfassung (thin-results / Inbox)
     Abteilungsleiter            1 pro Repo, wöchentlich, kitty/foot (wenn Session da) sonst headless
        ↓ Unter-Tasks            ↑ Ergebnis als Annotation + done
     Angestellte                 Subagent pro Tab (nur bei größerer Frontend-Arbeit)
```

Regeln:
- Abteilungsleiter und Angestellte haben **keinen eigenen Kommunikationsweg zum User**. Nur Berichte nach oben.
- Entscheidungen trifft ausschließlich der CEO. Der Manager-Claude baut Infrastruktur, entscheidet nicht.
- Standard-Rechte Abteilungsleiter: lesen, berichten, Tasks vorschlagen/zerlegen. Code ändern nur auf
  CEO-Auftrag (Task mit `+go`), und nur in `~/dev/<m>-dev`, nie in `~/vitalos/<m>-app`.
- Kein sudo, keine laufenden Server anfassen, kein Deploy ohne User-Bestätigung (Kernregeln aus CLAUDE.md gelten).

## 2. Aufgabenverteilung: Taskwarrior (nach unten)

Ist-Zustand geprüft: `hooks=0`, UDAs `alphatype/domain/...` vorhanden, kein Owner-/Repo-UDA, `taskopen` installiert
(Konfiguration fast leer). Bestehende Projekte (Haushalt, HotList, VitalOS, ...) bleiben unberührt.

- **Projekt = Abteilung/Repo** (Owner-Konvention 2026-11-07, GLOBALE Org-Task-DB):
  `project:<repo>` für ein Repo, `project:<repo>.<tab>` für den Angestellten.
  Beispiel: `coach-dev`, `coach-dev.klienten-tab`. Ein Abteilungsleiter filtert `project:coach-dev`. Rolle läuft über Tags (+al/+cto/+ceo/+pm).
- **Description:** ein Satz im Imperativ mit klarem Ergebnis.
- **Annotation:** Pfad auf Detaildatei (Spec/Ticket/Log), damit `taskopen` sie öffnet. Beim Erledigen schreibt der
  Agent das Ergebnis als Annotation dazu.
- **Tags:** `+ceo` (Entscheidung nötig), `+go` (CEO hat Umsetzung freigegeben), `+blocked`, `+review`.
- **depends:** für Reihenfolgen.
- **`TODO.md`** (vom telegram-todo-bot gefüllt) bleibt Inbox; der CEO sortiert daraus in Tasks ein.

Offen (CEO entscheidet): UDA `owner` nötig, oder reicht der Projektpfad? Vorschlag: reicht der Projektpfad.

## 3. Gedächtnis und Berichte: md-Dateien (nach oben)

- **`ABTEILUNG.md` pro Repo** (Pendant zu `KLIENT.md` beim matthias-check): Stand, offene Punkte, Blocker, letzte
  Zusammenfassung. Wird bei jedem Lauf gelesen und **additiv** fortgeschrieben, nie überschrieben, kein Rohprotokoll.
  Dient als Gedächtnis, damit ein Absturz (Akku, Limit, Netz) nichts kostet.
- **Bericht an den CEO:** Der Abteilungsleiter legt am Ende des Laufs eine kurze Zusammenfassung ab
  (Ort: offen, Vorschlag `~/.local/state/abteilungen/inbox/<repo>-<datum>.md`). Der CEO liest die Inbox beim Start.
- **Anbindung an bestehende Mechanik:** `RESULTS.md`/`NEXT.md` je Repo werden weiter durch den PreCompact-Hook
  (Claude) und `fill-session-docs.mjs` (Vibe) gefüllt; `thin-results` (täglich 07:30) destilliert sie. Die Abteilungsleiter
  **lesen** diese Dateien als Eingang, sie ersetzen sie nicht.

## 4. Lauf-Mechanik (Vorlage: matthias-daily-check)

Vorlage ist `~/vital/Klienten/bin/matthias-daily-check.sh` + `.timer`/`.service` (User-Units):
- systemd-User-Timer, wöchentlich, `Persistent=true`.
- Skript startet `claude` aus `$HOME` (dort ist der Workspace getrustet, sonst greifen `permissions.allow` nicht).
- Prompt: erst `ABTEILUNG.md` lesen, dann Eingang prüfen (git log/Branches/PRs/CI, offene Tasks, `RESULTS/NEXT.md`),
  additiv fortschreiben, Tasks anlegen/zerlegen, Zusammenfassung in 2 Sätzen.
- Ergebnis über `lib/agent-notify.sh` / Inbox.
- Abteilungsleiter müssen **volle** `claude`-Sessions sein (nicht nur `-p` mit Minimal-Tools), damit sie
  Subagents für die Angestellten starten dürfen.
- Terminal-Variante: kitty/foot nur wenn eine Wayland-Session läuft, sonst headless. Der Timer muss das erkennen.

## 5. Ist-Stand der Sessions (zum Übernehmen, geprüft 2026-11-06)

- **plan-dev** (abgestürzt 19:45, `EAI_AGAIN`): Auftrag „sync dann auch die neue roadmap in coach-dev" ist **offen**.
- **fitness-dev** (Limit erreicht): Zurück-Taste im Tab-Sheet + Notch-Abstand gebaut, `87e8b91` auf `dev`, Lint/Build grün,
  **nicht auf echtem Handy getestet**.
- **skills-dev**: `vos-ship skills` durch, APK `skills-app-debug.apk` im Release `android-latest` ersetzt
  (Debug, keine Play-Signierung).
- coach-dev / vitalos / vitalos-prod: nur Headless-Doku-Läufe, keine echte offene Arbeit gefunden.
- Der CEO-Verlauf (Transcript im Home-Projekt) wurde vom Manager **nicht** gelesen.

## 6. Vorschlag Pilot

plan-dev + coach-dev (dort ist etwas Konkretes offen: Roadmap-Sync). Danach fitness-dev, skills-dev, fuel-dev, relax,
klienten, vitalos (Release/Meta-Repo).

## 7. Offene Fragen an den CEO

1. Repo-Liste und Zuschnitt der Abteilungen bestätigen (Vorschlag: eine Abteilung pro `~/dev/*-dev` + vitalos als Release).
2. Rechte: reicht „lesen/berichten/vorschlagen", Code nur mit `+go`?
3. Inbox-Ort und -Format für Berichte.
4. Taskwarrior: Projekt = Repo (Owner-entschieden 2026-11-07), Rolle via Tag, Urgency ordnet — keine Routine-Tasks planen.
5. Takt: wöchentlich für alle, oder Pilot zunächst täglich zum Testen?
6. Wer legt `ABTEILUNG.md` je Repo erstmalig an (Manager bootstrappt aus `RESULTS.md`/`NEXT.md`)?

## Nächste Schritte nach Freigabe (Manager)

1. Namensraum + Tag-Konvention in Taskwarrior/`taskopen` eintragen (nur konfigurieren, bestehende Tasks nicht anfassen).
2. `ABTEILUNG.md`-Vorlage + Bootstrap für das Pilot-Repo.
3. Skript + Timer/Service nach matthias-Muster für plan-dev/coach-dev (nicht aktivieren, bevor der User bestätigt).
4. Probelauf manuell, Ergebnis dem CEO melden.

---

## Nachtrag 2026-11-07 — Ist-Stand (gewinnt bei Widerspruch zu den Abschnitten oben)

Anlass: Betrieb der Abteilungen aufgenommen (Timer aktiv), Übergabebericht des Advisory-Claude
(`~/vitalos-prod/docs/product-dev/BERICHT-AN-MANAGER-ABTEILUNGEN.md`). Verantwortlich für Abteilungsebene,
Runner, Units und Anleitungen: Manager-Claude.

### Takt und Zeiten (täglich, nicht wöchentlich — Owner-Vorgabe)
Runner `~/.dotfiles/bin/abteilung-run <repo>` über `abteilung@.service` + `abteilung-<repo>.timer`, seriell per
`flock`, `timeout 40m`, Notbremse `~/.abteilung-stop`. Zeiten: journal-dev 02:10, fuel-dev 02:40, relax-dev 03:10,
vitalos 03:40, fitness-dev 04:10, skills-dev 04:40, plan-dev 05:10, 6pack-dev 05:40, coach-dev 06:10
(thin-results-Fenster ab 07:30 bleibt frei). `Persistent=false`: verpasste Läufe werden nicht nachgeholt.
Ohne eigenen AL: habits (in journal-dev), learn (in fitness-dev `apps/learn`), klienten-dev (Klientendaten).

### Berichtskanal (Ist): Log, nicht Inbox
Der AL gibt am Ende 3 Zeilen aus (erledigt / rot / braucht CEO). Der Runner schreibt sie nach
`~/.local/state/abteilung/<repo>.log`; der CEO liest die Log-Tails in der Stundenrunde. Zusätzlich schickt der
Runner eine Kurzmeldung per `tele` (Betriebssignal, vom Owner toleriert). Die Inbox `~/.local/state/abteilungen/inbox/`
aus Abschnitt 3 ist NICHT in Betrieb; sie wird nur eingeführt, wenn der CEO sie will. Anleitungen und Vertrag sind
damit konsistent.

### Aufgabenverteilung: Task-DB je Repo, kein Spiegel
Jedes Repo hat eine eigene, untracked Task-DB `<repo>/.task` (lokal per `.git/info/exclude`). Der Runner setzt
`TASKDATA` selbst; AL ruft einfach `task ...` auf (erlaubt: `task`, `gh run list/view`, `gh pr list`,
`gh release view`). Keine Spiegelung in die globale Taskwarrior-DB. Tags: `+ceo`, `+go`, `+blocked`, `+review`.
Der Namensraum `vos.<repo>` ist abgeschafft (Owner-Konvention 2026-11-07): Projekt = Repo in der GLOBALEN Org-Task-DB.

### Kommunikation
- ALs haben keinen wacli-Kontakt und schreiben nicht an Daniel (nur das Runner-`tele`).
- Der WhatsApp-Selbstchat (`wacli … --allow-self`) gehört ausschließlich dem CEO der Android-Linie; Messenger-Regel
  wird im CEO-Skill verankert (Aufgabe des CEO).

### Rechte (Startphase)
Lesen, berichten, Task-DB führen. Code ändern, committen, pushen nur mit CEO-`+go`. Dependabot-PRs sind laut
`~/vitalos-prod/CLAUDE.md` zum Mergen da; die ALs bekommen dafür (noch) kein `gh pr merge` — Mergen bleibt CEO/`+go`.

### Bekannte Lücken
- Der Schreibweg (Worktree → Commit → Push auf `dev` → CI-Prüfung) ist nie real getestet; nur zwei lesende Testläufe
  (journal-dev, claude + vibe) sind belegt. Vor dem ersten `+go` einen Schreib-Testlauf mit harmlosem Task machen.
- Unter systemd `--user` kein Shell-PATH, kein SSH-Agent (Schlüssel ohne Passphrase, Push ungeprüft).
- `vibe -p --auto-approve` hat keine Tool-Liste: nur lesend einsetzen.
- Offen: die vier Ergänzungen des CEO zum Vertrag liegen mir nicht vor.

---

## Nachtrag 2026-11-07 — CTO-Ebene (Owner-Chat-Entscheidung + CEO-Freeze f810a18)

Anlass: CTO-Claude limitiert (bis 11.11. keine Engine); Owner hat dem Vibe auf WS3 die CTO-Rolle
übergeben (Takt taeglich, volles +go, sofort scharf). CEO hat die Org-Aenderung im Delta-Ledger
eingefroren und die Uebergabe in der Koordinations-TODO.md (Sektion „CTO-Uebergabe") dokumentiert.

### Ebenen (neu)

User ↔ CEO                       Strategie, Priorisierung, Abnahme, Daniel-Kontakt
        ↕ Koordinationsflaeche (TODO.md-Sektionen, CTO.md, AL-Logs)
      CTO                          taeglich 06:40 (nach den AL-Laeufen, vor thin-results):
                                   Architektur, Workflows, Guides der ALs, technisches +go
        ↓ +go-Tasks in den Repo-DBs · Guide-Aenderungen
     Abteilungsleiter              (unveraendert, Abschnitte 1-4 gelten weiter)

- **CTO-Instanz:** Skill `~/.vibe/skills/vitalos-cto/SKILL.md` + Runner `~/.dotfiles/bin/cto-run`
  + Units `vitalos-cto.service/.timer` (taeglich 06:40, Persistent=true), Engine vibe,
  Notbremse `~/.abteilung-stop` (gemeinsam mit AL und CEO). Gedaechtnis:
  `~/.local/state/vitalos-cto/CTO.md` (additiv).
- **Rechte:** volles +go auf fachliche Tasks in den Repo-DBs; AL-Anleitungen
  (`~/vitalos-prod/docs/product-dev/abteilungen/*.md`) und Workflow-/Architektur-Entscheidungen
  sind CTO-Zustaendigkeit. Nicht CTO: produktweite Priorisierung, Richtungsgespraeche mit Daniel,
  Deploy/Release/Store/Geraete/prod-Funktionen (Owner-Gates ueber den CEO).
- **Veto:** Der CEO hebt jede CTO-Entscheidung auf (Sektion in der Koordinations-TODO.md +
  Delta-Ledger); im Konflikt gewinnt der CEO bis zur Owner-Entscheidung.
- **Berichtslinie:** CTO schreibt Daniel nie direkt an; Status bleibt im lokalen Log und in der Koordinationsfläche.
  3-Zeilen-Bericht (erledigt/rot/braucht CEO) ins cto-run.log, Gedaechtnis in CTO.md,
  CEO-Fragen als eigene Sektion in die Koordinations-TODO.md APPENDEN.

---

## Owner-Klarstellung 2026-11-07 — PM-Delegation, AL-Sicht und Nutzerkanal

Dieser Nachtrag gilt vor aelteren Vertragsentwuerfen und Guide-Saetzen, die
ihm widersprechen.

- **CEO:** einziger Kommunikationskanal zum Owner; setzt Produktziele,
  Gesamt-Rangfolge und Owner-Gates. Uebertraegt dem PM die laufende
  Produktkoordination innerhalb dieser Leitplanken.
- **PM:** darf aktive Arbeit aus dem CEO-abgenommenen Backlog konkretisieren,
  prioritaetsgetreu ordnen, direkt mit app-dev-ALs abstimmen und in deren
  Repo-Task-DB mit `+go` beauftragen. Keine Einzelfreigabe pro Paket oder
  Teilschritt. Ausdruecklich wartende Owner-Gates und Vorschlaege sind
  ausgenommen. Neue Ziele,
  Rangfolgewechsel, Scope-Ausweitung oder Owner-Gates eskaliert der PM an
  den CEO. PM braucht keinen eigenen Timer oder separate Berichtskette.
- **CTO:** fuehrt Technik/Infra/Runner und AL-Standards. Technische oder
  infrastrukturelle Auftraege und Architekturkonflikte bleiben CTO-Linie;
  PM und CTO stimmen sich direkt ab. CEO-Veto bleibt bestehen.
- **AL:** fuehrt im app-dev-Repo aus. Benoetigt nur den konkreten Auftrag,
  das Ziel, Abnahmekriterium und Repo-Regeln; muss keine internen
  CEO-Abwaegungen oder gesamte Org-Hierarchie kennen. Produktfragen direkt
  mit PM klaeren; technische Blocker an CTO, Owner-/Scope-Fragen an CEO.
- **Berichte/Tokenbudget:** ein vom Runner vorstrukturierter Tageslog mit
  knappen Feldern Erledigt, Offen/Blocker, Naechster Schritt und automatisch
  ergaenzten Commit-/CI-Belegen. Keine parallelen narrativen Reports.
- **Owner-Kanal:** nur der CEO sendet regulaere Nachrichten an Daniel.
  Agenten und Runner berichten intern; normale AL-Sweeps erzeugen keine
  direkten tele-/Messenger-Nachrichten an Daniel.
- **Release:** CI.md ist die maschinen-/repo-uebergreifende Referenz.
  Wo Auto-Promote gilt, kein zusaetzlicher dev->master-PR. Kein PR bleibt
  unzugewiesen oder ohne naechste Aktion liegen; Major-/Owner-Gates werden
  explizit eskaliert statt durch manuelle Zwischen-PRs vervielfacht.
- **Runner-Protokoll (CTO-Auftrag, umgesetzt 2026-11-07):** AL-Runner max-turns 60, timeout 45m,
  Turn-Limit-Abbrueche markiert FEHLER-turn_limit (nicht OK), je Lauf getrennte Belege im Log
  (Abschluss / Commit+Push auf dev / Check / Promote / Live-Deploy). Push-Verankerung: laeuft
  headless (Belege: fuel- und plan-AL-Pushes in der Nacht 06./07.11.).

---

## Owner-Klarstellung 2026-11-09 — AL arbeitet Repo-TODO ohne CEO-Sperre

Gewinnt bei Widerspruch zu aelteren Saetzen („Code nur mit CEO-`+hit`/`+go`“,
„Startphase: nur beobachten“, Inventur-only).

- **Kein Freigabe-Gate vor AL-App-Arbeit:** Der CEO legt dem Abteilungsleiter
  keine `+hit`/`+go`-Sperre vor Repo-Arbeit auf. AL braucht keinen
  Einzelauftrag vom CEO, um im eigenen app-dev-Repo Code zu aendern und
  auf `dev` zu committen/pushen.
- **Repo-Queues (Prioritaet):** `FIRE.md` (dringend, Wochen-Hits) **vor**
  `TODO.md` (Rest-Queue). `HOT.md` = spontane Einfälle/Ideen (Potential) —
  AL baut daraus **nichts automatisch**; erst nach Heben nach Fire/TODO.
  Steht etwas in `FIRE.md`, arbeitet der AL das zuerst ab; erst wenn Fire
  leer oder blockiert, `TODO.md`. Fehlt beides, gilt `NEXT.md` ersatzweise.
  Optional spaeter: `FOCUS.md` / `FREEDOM.md` / `FRAME.md` (Game-Kaskade,
  Lesen/Kontext — Fire bleibt Ausfuehrung).
  AL: Temp-Worktree auf `origin/dev`, Checks, Commit, Push `dev` sofern
  CI-Weg greift; erledigt abhaken, Folgepunkte nachziehen.

- **Harte Gates bleiben:** kein `master`/`main`-Push/Merge, kein `--force`,
  kein Deploy/Store/Emulator/Functions ohne Owner-Bestaetigung, keine
  laufenden Server anfassen, fremde Sessions/WIP nicht einsammeln.
  Echte Scope-/Produkt-Fragen → `+ceo` markieren und melden, nicht raten.
- **Guides nachziehen:** AL-Anleitungen unter
  `~/vitalos-prod/docs/product-dev/abteilungen/*.md` duerfen die alte
  Inventur-Sperre nicht mehr enthalten; CTO haelt sie deckungsgleich.
