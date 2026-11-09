# p2-weekly Bestandsaufnahme (Schritt 1) — abgenommen durch CEO

Datum: 2026-11-07, ca. 00:45 UTC. Ausfuehrung: CEO-Subagent
(p2weekly-bestandsaufnahme, Nur-Lesen). Auftrag: TODO.md-Sektion
„CEO-Abnahme: Luecke C geschlossen — p2-weekly aktiv mit Webbestand-Delta".

## 1. Ist-Kapazitaet des bestehenden Woche-Modus

**Datenquellen (vollstaendig vorhanden):**
- Eintraege der Woche via `getJournalRange` (JournalV2View.jsx:169-175 →
  lib/db/journal.js:97-110), cache-first, offline-tauglich; `normalizeEntry`
  (journal.js:34-42): id, text (vollstaendig), date, time, tags, smartLog?,
  startDate/endDate?
- Habits via `getHabitsRange` (View:137-150, habitsDb.js:11-27 mit
  hasRecord-Closure), bereits 119 Tage rueckwirkend geladen
- Google-Termine via `fetchEvents` (View:187ff.), gruppiert in eventsByDate
  (View:219-220)

**WeekView rendert (JournalV2Range.jsx:31-67):** 7 Zeilen Mo-So (ISO-Woche,
rangeFor Z. 24-25), Datum/Wochentag, Heute-Markierung (Z. 35-43); pro Tag nur
erste Zeile des LETZTEN Eintrags (firstLine Z. 20-22, 49) + Zaehler „N
Eintraege · K Termine" (Z. 52-55); Habit-Streifen 1 Punkt/Habit (Z. 59-61).
Modus „woche" in MODES (View:64), Kopf mit getISOWeek + Bereich (View:
416-417), Wochen-Navigation addWeeks (View:407-408), Sprung in Tag-Ansicht
per pick (View:411).

**HTML-Befund: Es existiert KEINE Aggregation.** Keine Wochensummen, kein
Durchschnitt, keine Tag-/Skill-Verteilung, keine Zusammenfassung.
„Auswerten" im Phase-02-Gate-Sinn ist NICHT abgedeckt; „erfassen" und
„wiederfinden" (Raster, Suche) sind abgedeckt.

## 2. Delta-Liste (alles clientseitig reine reduce/Darstellungslogik, KEINE neue Query)

| # | Delta-Punkt | Datenlage | Fehlt nur |
|---|---|---|---|
| D1 | Wochenkopf-Statistik (Gesamt eintraege, Tage mit/ohne Eintrag, Durchschnitt) | range.data (date je Eintrag) | compute + Anzeige |
| D2 | Habit-Wochenbilanz pro Habit („4/7") | habits.data + hasRecord(date), bereits geladen | reduce ueber 7 Tage + Zeile/Streifen |
| D3 | Tag-/Skill-Verteilung (+fitness/+fuel/+relax …) | entry.tags persistiert (journal.js:167, 196) — NICHT Text re-parsen | reduce ueber e.tags + Chip-/Balken-UI |
| D4 | Termin-Bilanz der Woche | eventsByDate vorhanden | Summierung + Anzeige |
| D5 | Wochenspiegel: regelbasierte Exzerpte/Titelzeilen pro Tag | entry.text vollstaendig; splitEntry existiert (View:52-56) | kompakte aufklappbare Exzerptliste — KEINE KI |
| D6 | smartLog-Angaben anzeigen (optional) | journal.js:160-162, 171 | nur Anzeige; entbehrlich fuer erstes Delta |

Explizit NICHT im Delta (per Auftrag): keine Functions-Aggregation, kein neuer
SOT, keine KI-Reports (Nicht-Ziel SCOPE:126), keine Datenveraenderung.
getJournalHistory nicht noetig — Wochenrange via getJournalRange genuegt.

## 3. Empfehlung: minimale Umsetzung (clientseitig, sortiert)

1. **(klein) D1 + D4 Wochenkopf-Statistik** — compute ueber bestehende
   Props (entries, habits, events), Summary-Zeile ueber/am Kopf; ~30-50
   Zeilen inkl. CSS. Null neue Queries.
2. **(klein) D2 Habit-Wochenbilanz** — pro Habit „N/7" via
   hasRecord(iso(d)); eine Zeile unter der Wochenliste, HABIT_LIMIT=5
   (View:26) bleibt.
3. **(klein-mittel) D3 Tag-/Skill-Verteilung** — reduce ueber e.tags,
   sortierte Zaehlerliste, Chips im Stil der jv2-tag-Klasse (Muster:
   JournalV2Range.jsx:55). Nur persistierte Tags (SCOPE-Matrix-Zeile 5).
4. **(mittel) D5 Wochen-Spiegel** — aufklappbare Exzerptliste pro Tag
   (Titelzeile via splitEntry, firstLine-Max 80 wie vorhanden); 1-2 Zeilen
   pro Tag, nicht generativ; ~60-120 Zeilen. Ermoeglicht „auswerten".
5. **(klein, Pflicht im selben Zug) Meta-Doku** — Feststellung in STATUS.md
   vor Implementierung (Auftrag TODO:471-472); SCOPE-Matrix-Zeile p2-weekly
   nachziehen („Wochenuebersicht ja, regelbasiert", SCOPE:126-127).

Nicht empfohlen: KI-Zusammenfassungen, Functions-Aggregation,
Trend-Vergleichswoche (neue Range-Query, kein Gate-Bedarf), smartLog-Anzeige
(D6, spaeter kostenlos).

**Kernsatz:** Die Woche-Ansicht kann zeigen, aber nicht auswerten — saemtliche
Auswertungs-Rohdaten (Text, Tags, Habit-Records, Termine) liegen bereits im
Client; das gesamte Delta ist reine Lese-/Darstellungslogik.
