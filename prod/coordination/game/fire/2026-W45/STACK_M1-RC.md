# STACK_M1-RC — Domino Door der Woche 2026-W45

War Stack nach Chapter 28 (AlphaOS). SSOT: [STACK_M1-RC.yaml](STACK_M1-RC.yaml).
Autor: oracle, 2026-11-07 · Domains: Business / Production. · Taskwarrior-Anker: Org-Task 5 (project vitalos-prod, +ceo +br +fire) — Verwaltung bleibt beim CEO. Kaskade: Org-Task 3 (Nov-Mission) → Org-Task 2 (Q4-Fokus) → Org-Task 1 (Freedom-Goal bis 2027-11-07).

## Reflexive Inquiry — die unbequemen Fragen

**Domino Door:** M1-RC rauslassen — SmartLog-Invoker-Binding entschieden, Emulator-Testdienst grün mit aktivem Timer, dann der RC-Ruf für Observe v1.

**Trigger:** Emulator-Runde 3 ist weitgehend grün, zwei Testuser warten freiwillig, die p2-Serie ist komplett live — und trotzdem steht M1-RC still, weil genau ein Befund (SmartLog-Kontingent/Analyse) auf eine Owner-Weiterentscheidung wartet.

**Narrative (ehrlich statt Schonung):** Die Vermeidungsgeschichte lautet „Ohne Owner-Weiter kann ich nichts tun". Die wahre Fassung: Warten ist hier bequem. Ursachendiagnose des Findings und die Timer-Vorbereitung liegen mitten in der CEO-/Ausführungslinie — nur die Endgenehmigung ist Daniels.

**Validation:** RC ist der Wendepunkt vom Bauen zum Testen. Die End-to-End-Annahme (echte Geräte, grüne Checkliste) verliert ihren Nachweiswert, solange keine RC-Deklaration folgt. Freiwillige Testuser sind ein Geschenk mit Verfallsdatum.

**Impact on Opening:** M1-RC öffnet M2 (Testzyklus mit Debug-APK) und hebt den Meta-Release der Shell-Serie — der erste produktive Reifegrad-Nachweis für vitalos-prod.

**Consequences of Inaction:** Emulator-Feed rostet, Findings bleiben unbestätigt, Testuser-Herbst, CEO-Rangfolge verliert ihr Wort.

## Die 4 Hits (Fact · Obstacle · Strike · Responsibility)

1. **Fact:** SmartLog-Finding diagnostiziert; Daniel bekommt eine 3-Zeilen-Entscheidungsvorlage (Weiter / Beobachten / Anpassen).
   **Obstacle:** Diagnose kann auf Server-Rechte stoßen, die die Linie ohne Owner nicht ändern darf.
   **Strike:** Präzisen Diagnoseauftrag an die Ausführungslinie; Rechte-Grenzen klar benennen statt improvisieren; Vorlage mit Optionen + Empfehlung.
   **Verantwortlich:** CEO (Vorlage) + Ausführungslinie (Diagnose bis Di./Mi.).

2. **Fact:** Emulator-Testdienst Erstlauf GRÜN (Beleg-Log archiviert), Timer enabled (13:00 CET).
   **Obstacle:** RAM-Gate braucht >5 GB freien RAM — Tageslast kann das Fenster killen.
   **Strike:** Erstlauf ins ruhige Frühfenster legen, Trockenlauf vorausschicken, RAM-Lage im Tages-Digest protokollieren.
   **Verantwortlich:** Ausführungslinie (Lauf) + CEO (Abnahme + erst nach grünem Erstlauf Timer-enable).

3. **Fact:** A11y-/Kosmetik-Findings abgearbeitet oder klassifiziert (fix / bewusst RC-akzeptiert), sichtbar im RC-Ruf.
   **Obstacle:** Ohne gefilterte Nicht-Ziele werden Trivialitäten zum Fake-Blocker und schieben den RC auf.
   **Strike:** Findings gegen SCOPE-OBSERVE-V1 filtern; im Scope fixen, außerhalb als „kein RC-Gate" markieren.
   **Verantwortlich:** Ausführungslinie (Umsetzung) + CEO (Filter/Klassifizierung).

4. **Fact:** RC-Ruf dokumentiert in TODO.md-CEO-Sektion (grüne Checkliste + Invoker-Entscheidung + Restpunkte) und an Daniel raus.
   **Obstacle:** Stellvertreter-Release-Optik verletzt die Freigabe-Regel (keine Freigaben stellvertretend für Daniel).
   **Strike:** RC-Ruf als Empfehlung formulieren, Beschluss nicht vorwegnehmen, Beleglinks bündeln.
   **Verantwortlich:** CEO.

## Maschinenlesbar

```yaml
week: 2026-W45
title: M1-RC — Domino Door W45/W46
inquiry: {domain: Production, subdomain: Systems}
domino_door: M1-RC (Invoker-Binding entschieden -> Emulator grün -> RC-Ruf)
hits:
  1: {fact: SmartLog-Finding diagnostiziert + 3-Zeilen-Owner-Vorlage, responsibility: CEO+Ausführung}
  2: {fact: Emulator-Erstlauf grün + Timer enabled, responsibility: Ausführung+CEO}
  3: {fact: A11y-/Kosmetik-Findings fix oder klassifiziert, responsibility: Ausführung+CEO}
  4: {fact: RC-Ruf in TODO.md-CEO-Sektion an Daniel raus, responsibility: CEO}
```

Import in die Org-DB (Chapter-28-Sequenz), sobald taskrc die uda.*-Deklarationen hat (siehe STATUS-REPORT 2026-11-07):

```
aos door plan warstack-import --dry-run <diese-yaml>   # nur validieren
TASKRC=~/.local/state/vitalos-ceo/taskrc AOS_DOOR_DIR=<org-data-dir> \
  aos door plan warstack-import <diese-yaml> --source-uuid <org-task-uuid> --author oracle
```
