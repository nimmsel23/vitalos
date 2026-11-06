# Observe v1 Release-Scope — Free (Observe) / Premium (Operate)

Status: ENTSCHIEDEN (Daniel, 2026-11-06). Finalisierte Fassung der CEO-Vorlage
(`migration/unified-product/coordination/CEO-SCOPE-OBSERVE-V1.md`, Stand des
CEO-Reviews 17:35 UTC) einschließlich der Updates 305660f (Tag-Semantik),
5d295fa (Tagesbudget) und a5c7713 (Gewöhnungs-Grundsatz).
Grundlagen: Android-Roadmap (p0-scope, p2, p6; Stand 03.11.2026) und
Code-Inspektion im Meta-Repo `~/vitalos` (`dev-product`). Dieses Dokument ist
Scope-Freigabe, kein Build-/Deploy-Nachweis.

## Produktdefinition Observe v1

Eine Person erfasst ihren ganzen Tag manuell in einem Journal-zentrierten
Produkt: Einträge, Habit-Vollzug, Planung (Planner/The Door) und manuelle
Skill-Erfassung (Fitness, Fuel, Relax) — synchronisiert, offline-tauglich,
wiederfindbar. Der Wochenspiegel ist regelbasiert. KI-Parsing ist der einzige
Premium-Anker: Freitext wird in editierbare, bestätigte Strukturvorschläge
übersetzt. Free behält sämtliche manuellen Kernfunktionen. Operate ist eine
Erweiterung, kein zweites Datenmodell.

Tagesmodell (Entscheidung 1): `body/being/balance/business` (4B) ist das
v1-Strukturmodell. `Doing · Thinking · Feeling · Being` wird NICHT als
eigenes Datenmodell gebaut, sondern als optionale Tag-Konvention im Journal
(`+doing`, `+thinking`, `+feeling`, `+being`) dokumentiert — gleiche Mechanik
wie `+hot`, filterbar, Originaltext bleibt unverändert.

## Grundsatz: Gewöhnung schlägt Knappheit (Daniel)

Die App muss im Free-Kontingent gut genug sein, dass der Nutzer sich an sie
gewöhnt — er darf NICHT den Impuls bekommen, die Free-App zu löschen, bevor
er daran denkt, Premium zu kaufen. Premium wirbt aus einer etablierten
Tagesgewohnheit heraus, nicht aus Verboten daraus.

Abgeleitete Prüfkriterien (jede Scope-Änderung wird dagegen gemessen):

- **Löschschwellen-Test:** Ein Free-Nutzer, der 30 Tage KEINE KI-Aktion nutzt,
  hat trotzdem einen vollständigen Tages- und Wochen-Loop (Journal, Tags/
  Routing, Habits, Door, Wochenansicht) ohne Funktionslücke.
- **Kein Bestrafungs-Zustand:** Ist das Tages-KI-Budget verbraucht, bleibt
  die App voll bedienbar; die Kommunikation zeigt, wann das Budget zurück
  ist — kein wiederkehrendes Popup, kein gesperrter Kernfluss.
- **KI ist Veredelung, nicht Voraussetzung:** kein Feature der Matrix darf so
  gestaltet sein, dass die Bedienung ohne KI-Aktion als defekt wirkt.
- **Kein Daten-Geiselstück:** Export und Löschung eigener Daten sind
  Free-Kernfunktionen (Roadmap p3) — der Nutzer bleibt freiwillig.
- **Premium-Argument ist mehr KI-Tiefe** (unbegrenzt, Kontext, skillübergreifende
  Auswertung), nie der Entzug bereits genutzter manueller Funktionen.

## Feature-Matrix Free (Observe) vs. Premium (Operate)

| # | Funktion | Free (Observe) | Premium (Operate) | Realstand (Beleg) |
| --- | --- | --- | --- | --- |
| 1 | Journal: Anlegen/Editieren/Löschen, Sortierung, Dauerhaftigkeit | ja (Kern) | ja | `journal-app/src/views/v2/JournalV2View.jsx`, `src/lib/db/journal.js` |
| 2 | Tags + Door-Routing (`+hot/+potential/+door` → Potential/Hotlist), Originaltext bleibt | ja | ja | `journal-app/src/lib/door/hotFromJournal.js` (HOT_TAGS, Titel-Extraktion) |
| 3 | Habits + Habit-Vollzug aus dem Journal heraus | ja | ja | `JournalV2Habits.jsx`, `habitsModel.js`, `onSetHabitCompletion` |
| 4 | Planner / The Door (Hotlist, Quellen) | ja (Tagesvollzug bleibt Free) | ja | `journal-app/src/views/door/`, Door v2 |
| 5 | Skill Stack manuell: Fitness-Session, Fuel, Relax | ja — Journal-Einträge mit Smart Tags statt Pflichtformularen: KEINE Pflichtfelder, nichts scheitert an fehlenden Angaben; Datum im Zweifelsfall Zeitpunkt des Loggings (Entscheidung 4). Tag-Semantik: `+fuel` usw. bedeutet NUR Zuordnung des Eintrags zum jeweiligen Skill-Journal — kein Formularzwang, kein Parsing-Auslöser, keine Makro-Schätzung, keine simulierten Statistiken | ja | fitness/fuel/relax-app über `@view/*`-Aliase; Tag-Mechanik nach `hotFromJournal.js`-Muster |
| 6 | Verlauf/Suche/Filter (p2-timeline) | ja — **umgesetzt in der Quelle** (journal-dev `e2ee028`: Modus „Suche“ mit Freitext-AND-Suche, `+tag`-Filter, Zeitfenster 30/90/365 Tage bzw. bis 500) | ja (+ dieselbe Quelle) | `JournalV2Search.jsx`, `src/lib/journalSearch.js`, `JournalV2Range.jsx` (Tag/Woche/Monat/Jahr-Raster); Meta-Pin publiziert erst mit dem nächsten Journal-Release |
| 7 | Wochenübersicht | ja, regelbasiert (keine KI-Reports) | ja (+ später generative Auswertung, p6) | `JournalV2Range.jsx` |
| 8 | Smart-Log-KI-Parsing (Freitext → Vorschläge: Habit-Completion, Mahlzeit/Makros, Tags) — liest den Nutzertext, benötigt KEINE Tags | Kontingent: **1 Analyse/Tag** (Update Daniel, ersetzt frühere 1/Woche). Optimalnutzung: den ganzen Tagesablauf in EINEN Eintrag formulieren — die Analyse erfasst ihn vollständig (MAX_INPUT 12000 deckt einen Tageseintrag); kein künstliches Kleinschneiden der Eingabe | höheres/entbundenes Limit via Entitlement | `journal-app/functions/smart-log.js` (gemini-2.5-flash, `quotaPolicy`, `smartLoggingEntitlements`); Tagesbudget umgesetzt in der Backend-Quelle (`~/dev/backend` `213d5c9`: `days/{YYYY-MM-DD}`-Zählung, `observeDailyLimit`), Frontend-Meldungen synchronisiert (journal-dev `19f0bb6`) |
| 9 | Bestätigung vor Speichern (p6-confirm): KI-Vorschlag nie automatisch gespeichert | ja (beide Tier) | ja | Edit-Flow in `JournalV2View.jsx` (`startEdit`); serverseitig `requestId`-Dedup |
| 10 | Serverseitige Rechteprüfung (Entitlement/Quota am Server, nie nur UI) | ja | ja | `smart-log.js`: HttpsError `permission-denied`, uid-Check, Firestore-Transaktion |
| 11 | „The Voice reflektieren“-Einstieg im Journal-Eintrag | ja — v1 ist die vorhandene regelbasierte, clientseitige Reflexion: KEIN KI-Call, kein Budgetverbrauch (P1-Befund: `views/voice/` ohne fetch/Callable/API-Key, feste Phasen-Prompts, `saveJournal` + localStorage) | später: echter KI-Kanal als Premium-Anker, Budget nach Kanal-Design | `JournalV2View.jsx:557` → `main.jsx` `startVoiceFromJournal` → `views/voice/VoicePanel.jsx`, `voiceData.js` |
| 12 | Skillübergreifende KI-Zuordnung (p6-link) | nein | später (nicht v1-Blocker) | offen |

## Zwei getrennte Mechaniken (Klarstellung Daniel)

Tags und KI sind verschiedene Ligen. Tags sind rein manuelles Routing des
Nutzers. Die KI-Analyse (Smart-Log) braucht KEINE Tags — sie liest, was der
Nutzer schreibt, und schlägt Struktur vor (inkl. Makros/Habit-Vorschlägen; im
Kontingent, Bestätigung vor Speichern). Ein Eintrag kann getaggt sein, ohne
dass Analyse stattfand — und analysiert werden, ohne dass je ein Tag
existierte.

## Getroffene Entscheidungen (Daniel, 2026-11-06)

1. **Tagesmodell:** 4B einfrieren; DTFB nur als optionale Tag-Konvention
   (`+doing/+thinking/+feeling/+being`), kein Neubau.
2. **The Voice:** v1 ist die vorhandene regelbasierte Reflexion — gratis,
   unbudgetiert, ohne Server-Call (P1-Befund). Daniels „1×/Tag KI-Analyse“
   bezieht sich damit vollständig auf Smart-Log (Entscheidung 3-Update).
   Ein echter Voice-KI-Kanal bleibt ein späterer Premium-Anker nach
   Kanal-Budget-Design.
3. **Kontingent-Default:** zunächst `observeWeeklyLimit = 1` bestätigt;
   **Update (gleiche Sitzung, abgelöst):** der Free-User erhält **1 KI-Analyse
   pro Tag**. Das Tagesbudget gilt für Smart-Log — in v1 der einzige
   KI-Kanal; The Voice ist regelbasiert und verbraucht nichts. Optimalnutzung
   ist ausdrücklich gewünscht: der ganze Tagesablauf detailliert in EINEM
   Eintrag. **Umgesetzt** in der Backend-Quelle (`~/dev/backend` `213d5c9`):
   Tagesschlüssel `smartLoggingQuotas/{uid}/days/{YYYY-MM-DD}`,
   `observeDailyLimit`, operate über `entitlements.dailyLimit` (fail-closed);
   Frontend-Meldungen in journal-dev synchronisiert (`19f0bb6`). Vor einem
   Deploy: `smartLoggingConfig/default` um `observeDailyLimit` und
   bestehende Operate-Entitlements um `dailyLimit` ergänzen; der Meta-Pin
   (journal-app) publiziert den Tagesbudget-Stand erst mit dem nächsten
   Journal-Release.
4. **Skill Stack:** Journal mit Smart Tags, keine Pflichtfelder, keine
   fehlschlagende Eingabe; Datum = Zeitpunkt des Loggings als Fallback.
   Tag-Semantik: Ein Skill-Tag (`+fuel`, `+fitness`, `+relax`) ist nur ein
   Zuordnungsmerkmal — der Eintrag gehört zum jeweiligen Skill-Journal.
   Mit der Zuordnung ist NICHTS abgeleitet: keine Makro-Schätzung, keine
   berechneten Werte, keine Zusatzverarbeitung.

## Kanal-Budget-Design (P2-Notiz, kein Refactor ohne Folgeschritt)

Ein einziges Tagesbudget, kanalübergreifend (aktuell nur Smart-Log):
Konfiguration `observeDailyLimit` in `smartLoggingConfig`; Zählschlüssel =
Kalendertag + Kanaltyp (künftige Kanäle, z. B. Voice-KI, teilen dasselbe
Tagesbudget statt eigener Wochen-/Tageslimits); Entitlement-Prüfung für
Operate unverändert; fail-closed am Server (unbekannter Kanaltyp oder
fehlende Konfiguration → `permission-denied`/`failed-precondition`).
The Voice braucht kein eigenes Budget, solange kein KI-Call existiert.
**Umgesetzt** in der Backend-Quelle (`~/dev/backend` `213d5c9`): Tages-Doc
mit `byChannel`-Attribution (`smartLog`-Zähler im selben Tagesbudget),
`channel` am Request-Protokoll; ein künftiger Voice-KI-Kanal zählt im selben
Dokument mit, ohne eigene Sammlung.

## Prüfungsergebnisse (ehemalige Restpunkte P1/P2)

- **P1 — The-Voice-Backend-Ort: geklärt.** `views/voice/` enthält keinen
  KI-Aufruf: kein fetch, kein Callable, kein API-Key in `VoicePanel.jsx`,
  `voiceData.js` (feste Phasen-Prompts Stop/Submit/Struggle/Strike, generiert
  aus `~/aos/voice/phases.py`) oder `voiceContext.js`. Einträge werden als
  sessionStorage-Context übergeben; Ergebnisse laufen über `saveJournal` ins
  Journal bzw. localStorage-Settings. In v1 gibt es keinen Kanal, der über
  `vitalos-prod` geöffnet werden müsste.
- **P2 — Kanal-Budget-Design:** siehe eigene Notiz oben (ein Tagesbudget,
  Tagesschlüssel statt Wochenschlüssel; Status: Design entscheidungsgemäß).

## Umsetzungsaufträge

- **Lücke A — Produkt-Functions-Komposition: gelöst (Doku).** Smart-Log
  gelangt über die Journal-Codebase aus der gemeinsamen Quelle in den
  Produkt-Deploy; kein Kopieren, kein zweiter Pin. Abschnitt „Produkt-
  Functions“ im Root-`docs/UNIFIED-PRODUCT.md` ist maßgeblich. Vor einem
  echten Deploy fehlen Secrets/Parameter in `vitalos-prod` (`GEMINI_API_KEY`,
  `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_CLIENT_ID`).
- **Tagesbudget (Folgeschritt): umgesetzt in der Quelle.** `smart-log.js`
  zählt auf Tagesschlüssel mit `observeDailyLimit` (Backend `213d5c9`,
  journal-dev-Meldungen `19f0bb6`). Ausstehend: Firestore-Konfiguration vor
  Deploy (siehe Entscheidung 3), Journal-Release zur Publikation, Test-
  Adaptation (vom User aufgeschoben).
- **Lücke B — Suche/Filter (p2-timeline): umgesetzt in der Quelle.** Modus
  „Suche“ in Journal v2 (journal-dev `e2ee028`): Freitext-AND-Suche über
  Einträge, `+tag`-Token filtert nach Tags (Skill-Filter = `+fitness/+fuel/
  +relax`), Zeitfenster 30 Tage/90 Tage/1 Jahr/Alles (bis 500 Einträge,
  cache-first also offline-tauglich), Treffer gruppiert nach Tag mit
  Sprung in die Tag-Ansicht. Ausstehend: Journal-Release zur Publikation.
- **Lücke C — UI-Gating-Kommunikation: umgesetzt.** Tag-Modus mit
  eingeschaltetem Smart-Log zeigt laufend Tier, `remaining`/`limit`
  („heute verfügbar. Tageswechsel: Mitternacht, Zeitzone Wien.") und
  Reservierungshinweis (`JournalV2View.jsx`, Disclosure-Block). Prüfkriterien:
  (a) sichtbar VOR der ersten Nutzung — `getSmartLogQuota` ist serverseitig
  eine reine Lese-Transaktion (`getQuotaStatus`, kein Verbrauch), Abfrage
  aktiviert allein durch den Smart-Toggle; (b) der Suche-Modus enthält
  keine KI-Aktion und keine Quota-Aussage — keine Widersprüche; (c) kein
  Bestrafungs-Zustand: erschöpftes Budget zeigt nur den Hinweis „ohne KI
  im Journal speichern" samt Reset-Zeitpunkt, kein Sperrzustand, kein
  wiederkehrendes Popup, Nicht-Nutzung erzeugt keinen Hinweis-Druck
  (Gewöhnungs-Grundsatz). Backend-Zeitzone Europe/Vienna deckt die
  Mitternachts-Zusage.

## Nicht-Ziele von Observe v1 (ausdrücklich)

- Keine generativen KI-Coaching-Berichte (Wochenansicht regelbasiert).
- Keine künstliche Gamification im MVP (Game, Maps, Player-Level bleiben
  private-Shell-Themen).
- Operate ist Erweiterung, kein zweites Datenmodell, keine getrennte
  Datenhaltung.
- Keine duplizierte Shell-Schicht (Door v1-Navigation, Amplifier der
  privaten Linie werden nicht 1:1 gespiegelt).
- Kein zweites Datenmodell, kein zweites Lockfile, keine zweite App-Pin-
  Landschaft.

## Abgrenzungen

- Berechtigungsstandards pro Matrix-Zeile dürfen ohne neue CEO-Entscheidung
  nicht fallen; Änderungen über die CEO-Koordination (TODO.md) begründen.
- Roadmap.html (maßgebliche Kopie:
  `~/dev/coach-dev/public-coach/vitalos-android-roadmap.html`) ist mit den
  hier getroffenen Entscheidungen zu synchronisieren, sobald deren Repo-Ruhe
  es erlaubt.
