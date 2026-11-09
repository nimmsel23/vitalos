# CEO-Konzept: Agenten-Organisation (CEO / Abteilungsleiter / Angestellte)

Datum: 2026-11-06, abends. Status: VOM OWNER GEWUENSCHT, Architektur entschieden;
Umsetzung offen. Autor: CEO-Agent (Vibe, foot-Terminal).
Infra-Partner: Claude-Session im Kitty (entwirft die Vertraege und baut die
Abteilungsebene; nennt sich selbst Junior/Senior-CEO und Multiagent-Manager,
ist aber NICHT der zweite Entscheider — Entscheidungen bleiben beim CEO und
Daniel, wie die Session es auch selbst so formuliert hat).

## Befehlspipeline (entschieden)

Du (Daniel)
  ↕  nur Gespraech und Entscheidungen
CEO (diese Rolle; existiert als Skill `~/.vibe/skills/vitalos-ceo/SKILL.md`,
     aktive Session im foot-Terminal, stuendlicher Loop per cron)
  ↓ TODO.md (Koordinations-SOT)         ↑ Zusammenfassungen, Abnahmen
Abteilungsleiter (1 pro Repo, WOECHENTLICH per systemd-Timer,
     im sichtbaren kitty/foot-Terminal, Fallback headless)
  ↓ Tickets (Taskwarrior + md)          ↑ Ergebnisse (thin-results-Strom)
Angestellte (Subagenten pro Tab/Bereich innerhalb des AL-Laufs,
     vor allem fuer groessere Frontend-Arbeiten)

- Abteilungsleiter haben KEINEN direkten Draht zu Daniel — nur
  Zusammenfassungen an den CEO (Owner-Vorgabe).
- Standhaltung in Dateien, nicht im Session-Kontext (Crash-Festigkeit,
  Lehrgeld vom heutigen Stromausfall): Der AL-Lauf liest und schreibt
  ABTEILUNG.md seines Repos (Stand, offene Punkte, Blocker, letzte
  Zusammenfassung) — matthias-check-Muster, nur mit Input Repo-Zustand statt
  wacli-Nachrichten: git log/branches/PRs/CI, Firebase-Stand, Android-Build,
  TODOs, Docs.
- thin-results-Anschluss (vitalos-thin-results-Systemdienst, Fill+Thin): Der
  Ergebnis-Strom der Angestellten speist sich in md-Dateien ein, die der
  Prozess abarbeitet; jede Ebene verdichtet weiter (Angestellter Details,
  AL Zusammenfassung, CEO sieht nur Zusammenfassungen).
- beteiligte Vorlagen: matthias-check (Timer/Skript/KLIENT.md-Struktur),
  KOLLEGE-LAUF.md (harte Grenzen des woechentlichen Kopflosen-Laufs),
  vitalos-thin-results (Guards), HANDOFF-QUEUE-Muster, Android-Linie
  (Auftragsdatei + Launcher).

## Taskwarrior-Konvention (Vertrags-Zwischenstand, CEO-Akzeptanz offen)

- project-Hierarchie = Befehlsweg: `vitalos.<repo>` fuer den Abteilungsleiter,
  `vitalos.<repo>.<tab>` fuer den Angestellten eines Tabs.
- description: ein Satz im Imperativ mit klarem Ergebnis.
- Annotation: Pfad auf Detaildatei (taskopen-faehig); Ergebnis als Annotation
  bei done.
- Tags: +ceo (Entscheidung noetig), +blocked, +review. depends fuer
  Reihenfolgen.
- Vor Festlegung prueft der Infra-Claude den Bestand in ~/.taskrc/task
  projects und lehnt sich daran an, statt ihn zu ueberschreiben.

## CEO-Schnittstellen-Anforderungen (Abnahmekriterien fuer das Vertrag)

1. **Auftraege runter:** weiter ueber
   `/home/alpha/vitalos/prod/coordination/TODO.md`
   (append-only CEO-Sektionen). Das Vertrag definiert, wie der AL daraus
   seinen Repo-Anteil ableitet (Adressierung: Taskwarrior-Ast plus
   Annotation auf die TODO-Sektion).
2. **Berichte rauf:** eine Inbox-Datei im Koordinationsordner (z. B.
   `DEPT-INBOX.md` oder Unterordner `departments/`), die der CEO beim Start
   und stuendlich liest; AL-Zusammenfassungen haengen sich dort an. Abgenommenes
   rueckt der CEO ein (Sektion oder Vermerk). Keine Direkt-Nachrichten an
   Daniel aus der AL-Ebene.
3. **ABTEILUNG.md pro Repo** am jeweiligen Repo-Wurzelverzeichnis (tracked
   oder untracked je Repo-Konvention — legt der Infra-Claude fest und schreibt
   es ins Vertrag).
4. **Guards uebernehmen** aus KOLLEGE-LAUF und vitalos-thin-results: nur
   saubere Worktrees, kein master-Push, kein Deploy/Store/sudo/Emulator,
   Timeouts pro Lauf, keine Secrets, keine Freigaben stellvertretend fuer
   Daniel.
5. **CEO-Skill referenzieren, nicht duplizieren:** `vitalos-ceo` (global)
   ist die HOW-Quelle der CEO-Ebene.

## Offene Punkte (Owner: Daniel)

- Rechte-Rahmen (Claude-Vorschlag: lesen, berichten, Tickets vorschlagen; Code
  aendern nur auf CEO-Anweisung) — CEO-Position: zustimmen; Commits scoped nach
  Repo-AGENTS, Owner-Gates unangetastet.
- Pilot-Repo: Infra-Claude nannte coach-dev. CEO-Anmerkung: coach ist
  unabhaengig; fuer die VITALOS-Produktlinie waere journal-dev der
  naheliegendere Pilot (dort laufen p2-weekly und Journal-Release). Letztlich
  entscheidet Daniel.
- Engine je Repo (vibe/claude/codex) und RAM/Zeitfenster-Budget (Laptop-Lage).
- Parallelitaet: wie viele Laeufe gleichzeitig maximal.

## Was der CEO selbst noch anlegt (nach Freigabe)

Auf Daniels Anordnung soll der CEO auch als systemd-Service existieren. Die
aktive Session haelt den Loop per cron; ein Timer-getriebener Aufwach-CEO
braeuchte ein eigenes Design (Vibe noninteraktiv im Timer, foot-Fenster nur bei
Wayland-Session) — erst NACH dem Vertrag, mit Owner-Vorgabe zur Laufzeit.
