# CEO-Entwurf: Observe v1 Release-Scope (p0-scope) — Free/Premium-Matrix

Status: ENTSCHIEDEN (Daniel, 2026-11-06). Erstellt 2026-11-06,
ca. 15:00 UTC vom CEO-Agenten. Grundlagen: roadmap.html (p0-scope, p2, p6,
Stand 03.11.2026) und Code-Inspektion im Meta-Repo `~/vitalos` (dev-product).
Zielort der finalen Fassung: `prod/docs/` (ausführender Vibe übernimmt).

## Produktdefinition Observe v1

Eine Person erfasst ihren ganzen Tag manuell in einem Journal-zentrierten
Produkt: Einträge, Habit-Vollzug, Planung (Planner/The Door) und manuelle
Skill-Erfassung (Fitness, Fuel, Relax) — synchronisiert, offline-tauglich,
wiederfindbar. Der Wochenspiegel ist regelbasiert. KI-Parsing ist der einzige
Premium-Anker: Freitext wird in editierbare, bestätigte Strukturvorschläge
übersetzt. Free behält sämtliche manuellen Kernfunktionen (roadmap.html
p0-scope, Abnahmekriterium). Operate ist eine Erweiterung, kein zweites
Datenmodell.

Tagesmodell (Entscheidung 1, Daniel): `body/being/balance/business` (4B) ist
das v1-Strukturmodell. `Doing · Thinking · Feeling · Being` wird NICHT als
eigenes Datenmodell gebaut, sondern als optionale Tag-Konvention im Journal
(`+doing`, `+thinking`, `+feeling`, `+being`) dokumentiert — gleiche Mechanik
wie `+hot`, filterbar, Originaltext bleibt unverändert.

## Grundsatz: Gewöhnung schlägt Knappheit (Daniel, 2026-11-06)

Die App muss im Free-Kontingent gut genug sein, dass der Nutzer sich an sie
gewöhnt — er darf NICHT den Impuls bekommen, die Free-App zu löschen,
bevor er daran denkt, Premium zu kaufen. Premium wirbt aus einer
etablierten Tagesgewohnheit heraus, nicht aus Verboten daraus.

Abgeleitete Prüfkriterien (jede Scope-Änderung wird dagegen gemessen):

- **Löschschwellen-Test:** Ein Free-Nutzer, der 30 Tage KEINE KI-Aktion
  nutzt, hat trotzdem einen vollständigen Tages- und Wochen-Loop
  (Journal, Tags/Routing, Habits, Door, Wochenansicht) ohne Funktionslücke.
- **Kein Bestrafungs-Zustand:** Ist das Tages-KI-Budget verbraucht, bleibt
  die App voll bedienbar; die Kommunikation zeigt, wann das Budget zurück ist
  — kein wiederkehrendes Popup, kein gesperrter Kernfluss.
- **KI ist Veredelung, nicht Voraussetzung:** kein Feature der Matrix darf
  so gestaltet sein, dass die Bedienung ohne KI-Aktion als defekt wirkt.
- **Kein Daten-Geiselstück:** Export und Löschung eigener Daten sind
  Free-Kernfunktionen (passt zu Roadmap p3, Löschfunktion) — der Nutzer
  bleibt freiwillig, nicht gefangen.
- **Premium-Argument ist mehr KI-Tiefe** (unbegrenzt, Kontext,
  skillübergreifende Auswertung), nie der Entzug bereits genutzter manueller
  Funktionen.

## Feature-Matrix Free (Observe) vs. Premium (Operate)

| # | Funktion | Free (Observe) | Premium (Operate) | Realstand (Beleg) |
| --- | --- | --- | --- | --- |
| 1 | Journal: Anlegen/Editieren/Löschen, zeitliche Sortierung, Dauerhaftigkeit | ja (Kern) | ja | `journal-app/src/views/v2/JournalV2View.jsx`, `src/lib/db/journal.js` |
| 2 | Tags + Door-Routing (`+hot/+potential/+door` -> Potential/Hotlist), Originaltext bleibt | ja | ja | `journal-app/src/lib/door/hotFromJournal.js` (HOT_TAGS, Titel-Extraktion) |
| 3 | Habits + Habit-Vollzug aus dem Journal heraus | ja | ja | `JournalV2Habits.jsx`, `habitsModel.js`, `onSetHabitCompletion` |
| 4 | Planner / The Door (Hotlist, Quellen) | ja (Tagesvollzug bleibt Free, roadmap p2-habits) | ja | `journal-app/src/views/door/`, Door v2 |
| 5 | Skill Stack manuell: Fitness-Session, Fuel (Essen/Supps/Micros), Relax | ja — Journal-Einträge mit Smart Tags statt Pflichtformularen: KEINE Pflichtfelder, nichts scheitert an fehlender Dauer o. Ä.; Datum ist im Zweifelsfall immer der Zeitpunkt des Loggings (Entscheidung 4). Tag-Semantik (Klarstellung Daniel): `+fuel` usw. bedeutet nur Zuordnung des Eintrags zum jeweiligen Skill-Journal (hier: Ernährungsjournal) — kein Formularzwang, kein Parsing-Auslöser | ja | fitness/fuel/relax-app über `@view/*`-Aliase; Tag-Mechanik nach `hotFromJournal.js`-Muster |
| 6 | Verlauf/Suche/Filter (p2-timeline) | ja | ja | `JournalV2Range.jsx` (Wochenraster); Suche/Filter über Inhalte offen |
| 7 | Wochenübersicht | ja, regelbasiert (keine KI-Reports) | ja (+ später generative Auswertung, p6) | `JournalV2Range.jsx` |
| 8 | Smart-Log-KI-Parsing (Freitext -> Vorschläge: Habit-Completion, Mahlzeit/Makros, Tags) — liest den Nutzertext, benötigt KEINE Tags (Klarstellung Daniel) | Kontingent: 1 Analyse/Tag (Update Daniel, ersetzt die frühere 1/Woche). Optimalnutzung: den ganzen Tagesablauf in EINEN Eintrag formulieren — die Analyse erfasst ihn vollständig | höheres/entbundenes Limit via Entitlement | `journal-app/functions/smart-log.js` (gemini-2.5-flash, `quotaPolicy`, `smartLoggingEntitlements`); Zählschlüssel ist heute pro Kalenderwoche (`weeks`) — Tagesbudget braucht Tagesschlüssel (Designnotiz) |
| 9 | Bestätigung vor Speichern (p6-confirm): KI-Vorschlag nie automatisch gespeichert | ja (gilt für beide Tier) | ja | Edit-Flow in `JournalV2View.jsx` (`startEdit`); serverseitig `requestId`-Dedup |
| 10 | Serverseitige Rechteprüfung (Entitlement/Quota am Server, nie nur UI) | ja | ja | `smart-log.js`: HttpsError `permission-denied`, uid-Check, Firestore-Transaktion |
| 11 | „The Voice reflektieren"-Einstieg im Journal-Eintrag | ja — v1 ist die vorhandene regelbasierte, clientseitige Reflexion: KEIN KI-Call, kein Budgetverbrauch (P1-Befund des ausführenden Vibe: `views/voice/` ohne fetch/Callable/API-Key, feste Phasen-Prompts, `saveJournal` + localStorage) | später: echter KI-Kanal als Premium-Anker, Budget nach Kanal-Design | `JournalV2View.jsx:557` → `main.jsx` `startVoiceFromJournal` → `views/voice/VoicePanel.jsx`, `voiceData.js` |
| 12 | Skillübergreifende KI-Zuordnung (p6-link) | nein | später (nicht v1-Blocker) | offen |

## Nicht-Ziele von Observe v1 (ausdrücklich)

- Keine generativen KI-Coaching-Berichte in v1 (Wochenansicht ist
  regelbasiert, roadmap p2-weekly).
- Keine künstliche Gamification im MVP (roadmap p2-daily): Game, Frame/Fire/
  Freedom/Focus-Maps, Player-Level bleiben private-Shell-Themen, nicht v1.
- Operate ist Erweiterung, kein zweites Datenmodell und keine getrennte
  Datenhaltung (p0-scope).
- Keine duplizierte Shell-Schicht: der private Shell-Umfang (Door v1-Navigation,
  Amplifier der privaten Linie) wird nicht 1:1 in das Produkt gespiegelt.
- Store-Optimierung/AO-Banner/etc. sind out (hier geht es um Nutzungsfunktionen).
- Kein zweites Datenmodell, kein zweites Lockfile, keine zweite App-Pin-
  Landschaft (Produktinvarianten aus AGENTS/UNIFIED-PRODUCT).

## Getroffene Entscheidungen (Daniel, 2026-11-06)

1. **Tagesmodell:** 4B einfrieren; DTFB nur als optionale Tag-Konvention
   (`+doing/+thinking/+feeling/+being`), kein Neubau.
2. **The Voice:** P1-Befund des ausführenden Vibe (STATUS, Runde 17:55 UTC):
   `views/voice/` enthält KEINEN KI-Aufruf (kein fetch, kein Callable, kein
   API-Key; feste Phasen-Prompts Stop/Submit/Struggle/Strike, Speicherung via
   `saveJournal` + localStorage-Settings). v1 ist damit die vorhandene
   regelbasierte Reflexion — gratis, unbudgetiert, ohne Server-Call.
   Daniels „1×/Tag KI-Analyse" bezieht sich damit vollständig auf Smart-Log
   (Entscheidung 3-Update). Ein echter Voice-KI-Kanal bleibt ein späterer
   Premium-Anker nach Kanal-Budget-Design.
3. **Kontingent-Default:** zunächst `observeWeeklyLimit = 1` bestätigt;
   **Update (Daniel, gleiche Sitzung): abgelöst —** der Free-User erhält
   **1 KI-Analyse pro Tag**. Das Tagesbudget gilt für Smart-Log — in v1 der
   einzige KI-Kanal; The Voice ist wie geklärt regelbasiert und verbraucht
   nichts. Schafft der Nutzer, seinen ganzen Tagesablauf detailliert in
   einen einzigen Eintrag zu formulieren, ist das die perfekte Nutzung
   seiner Free-KI-Analyse (MAX_INPUT 12000 Zeichen deckt einen
   Tageseintrag). Implementierungshinweis: `smart-log.js` zählt heute
   Wochen (`weeks`-Sammlung); ein Tagesbudget braucht einen Tagesschlüssel
   (Designnotiz P2, kein Refactor ohne Folgeschritt).
4. **Skill Stack:** Journal mit Smart Tags, keine Pflichtfelder, keine
   fehlschlagende Eingabe (Dauer etc. optional); Datum = Zeitpunkt des
   Loggings als Fallback.
   Tag-Semantik (Klarstellung Daniel, nach der Entscheidung): Ein Skill-Tag
   (`+fuel`, `+fitness`, `+relax`) ist nur ein Zuordnungsmerkmal — der
   Eintrag gehört damit zum jeweiligen Skill-Journal (z. B. Ernährungsjournal).
   Mit der Zuordnung ist NICHTS abgeleitet: keine Makro-Schätzung, keine
   berechneten Werte, keine Zusatzverarbeitung. Der Skill-View zeigt den
   Text-Eintrag, keine simulierten Statistiken.

**Zwei getrennte Mechaniken (Klarstellung Daniel):** Tags und KI sind
verschiedene Ligen. Tags sind rein manuelles Routing des Nutzers. Die
KI-Analyse (Smart-Log) braucht KEINE Tags — sie liest, was der Nutzer schreibt,
und schlägt Struktur vor (inkl. Makros/Habit-Vorschlägen; im Kontingent,
Bestätigung vor Speichern). Ein Eintrag kann also getaggt sein, ohne dass
Analyse stattfand — und analysiert werden, ohne dass je ein Tag existierte.

Restpunkte vor Finalisierung (keine Produktentscheidungen mehr, nur Prüfung):

- **P1:** Wo läuft die The-Voice-KI (`onStartVoice`): Client, eigene Function,
  welches Firebase-Projekt? Produkt darf den Kanal nur über `vitalos-prod`
  öffnen. Ergebnis in Doku; kein Deploy.
- **P2:** Kanal-Budget-Design als Notiz: Verallgemeinerung des
  smart-log-Quota-Musters auf einen zweiten Kanaltyp (`voiceDailyLimit`
  neben `smartLogWeeklyLimit`, gleiche `smartLoggingQuotas`-Sammlungen,
  Kanaltyp im Schlüssel, fail-closed am Server). Design ja, Refactor nur
  auf ausdrücklichen Auftrag.

## Umsetzungslücken als Aufträge an den ausführenden Vibe

- **Lücke A — Produkt-Functions-Komposition:** `prod/functions/index.js`
  enthält nur Reminders; `journal-app/functions/smart-log.js`
  (Smart-Log-KI, Quota) ist für das Produkt-Deployment noch nicht
  komponiert. Das gehört in die Produktinvarianten (Firebase-Ziel
  `vitalos-prod`, Deployment-owner ist das Meta-Repo). Prüfen, ob die
  journal-dev-Function über Komposition/Import in den Produkt-Deploy
  gehört — bewusst dokumentieren, kein Deploy.
- **Lücke B — Suche/Filter (p2-timeline):** Verlauf/Calendar sind da;
  Freitextsuche über Inhalte + Filter nach Skill/Datum existiert (laut
  kurzer Sichtung) noch nicht vollständig — prüfen und Lücke in der Matrix
  nachtragen.
- **Lücke C — Matrix-Gating:** Nachweis führen, dass die observe-Edition
  die Premium-Anker (Zeilen 8 und 11) korrekt budgetiert und anzeigt —
  serverseitige Quota/Entitlements als fail-closed-Linie (Zeile 10),
  UI-Gating als Dokumentation; die Free-Grenze ist 1 KI-Analyse pro Tag
  (Smart-Log; The Voice verbraucht als regelbasierte Reflexion nichts)
  und muss dem Nutzer verständlich kommuniziert werden.

## Abgrenzungen/Freigaben

- Zwei Dateien abgeleitet aus dieser Vorlage: `prod/docs` finalisieren,
  roadmap.html mit den hier gefällten Entscheidungen synchronisieren.
- Berechtigungsstandards pro Zeile der Matrix dürfen ohne neue CEO-Entscheidung
  nicht fallen — bei Änderungen TODO.md verwenden und begründen.

## p2-terminal — CEO-SCOPE-Definition (VORSCHLAG, abnickingpflichtig bei Daniel) — 2026-11-07 ca. 08:05 CET

Matrix-Zeile 13 (NEU, v1-Bindung ans Bestehende — kein Neubau):

| Nr | Feature | Free v1 | Premium spaeter | Umsetzungs-Bausteine |
| --- | --- | --- | --- | --- |
| 13 | Journal-Kommandos (p2-terminal): EIN greifbares Schnellerfassungs-Kuerzel im Composer („/fit" expandiert zu +fitness-Tag im Text, Datum = Log-Zeitpunkt) PLUS Doku-Einheit „Journal-Kommandos" (CHANGELOG-ähnliche Hilfe in der App: vorhandene Token-Mechanik +tag, +tag-Suchfilter, +hot/+potential/+door-Routing, Smart-Log-Blocks erklaert) | ja — alles clientseitig, kein KI-Call, keine Functions, kein Datum-Pflichtfeld, keine Befehlssprache, kein Parser-Engine-Neubau | spaeter evtl. weitere Kuerzel nach Nutzungserkenntnis | JournalV2View.jsx Composer (Muster: p2-fitness Quick-Tags 3d7d93d), extractTags, Doku-View/Komponente |

Abgrenzung (Anti-Fractal): KEINE Slash-Befehlsliste, kein generisches
Kommando-Parsing, keine Terminal-UI. Abnahme: (a) /fit im Composer
ergaenzt exakt das +fitness-Token im Text (identisch zur getippten
Konvention), (b) Kommando-Hilfe zeigt nur existierende Mechaniken,
(c) alles Free-Kern, Syntaxcheck, kein Deploy ohne Gates.
NICHT UMSETZEN Bis Daniel abnickt — Wortlaut im Morgenbericht.
