# Observe v1 Release-Scope — Free (Observe) / Premium (Operate)

Status: ENTSCHIEDEN (Daniel, 2026-11-06). Finalisierte Fassung der CEO-Vorlage
(`migration/unified-product/coordination/CEO-SCOPE-OBSERVE-V1.md`) mit
abgeschlossenen Prüf-Aufträgen P1/P2 und nachgetragenen Lücken B/C.
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

## Feature-Matrix Free (Observe) vs. Premium (Operate)

| # | Funktion | Free (Observe) | Premium (Operate) | Realstand (Beleg) |
| --- | --- | --- | --- | --- |
| 1 | Journal: Anlegen/Editieren/Löschen, Sortierung, Dauerhaftigkeit | ja (Kern) | ja | `journal-app/src/views/v2/JournalV2View.jsx`, `src/lib/db/journal.js` |
| 2 | Tags + Door-Routing (`+hot/+potential/+door` → Potential/Hotlist), Originaltext bleibt | ja | ja | `journal-app/src/lib/door/hotFromJournal.js` (HOT_TAGS, Titel-Extraktion) |
| 3 | Habits + Habit-Vollzug aus dem Journal heraus | ja | ja | `JournalV2Habits.jsx`, `habitsModel.js`, `onSetHabitCompletion` |
| 4 | Planner / The Door (Hotlist, Quellen) | ja (Tagesvollzug bleibt Free) | ja | `journal-app/src/views/door/`, Door v2 |
| 5 | Skill Stack manuell: Fitness-Session, Fuel, Relax | ja — Journal-Einträge mit Smart Tags statt Pflichtformularen: keine Pflichtfelder, nichts scheitert an fehlenden Angaben; Autoerkennung schlägt Struktur vor; Datum im Zweifelsfall Zeitpunkt des Loggings (Entscheidung 4) | ja | fitness/fuel/relax-app über `@view/*`-Aliase; Tag-Mechanik nach `hotFromJournal.js`-Muster |
| 6 | Verlauf/Suche/Filter (p2-timeline) | **teils — Lücke (siehe unten)** | **teils — Lücke** | `JournalV2Range.jsx` (Tag/Woche/Monat/Jahr-Raster), `JournalV2Cal`; Freitextsuche über Inhalte und Skill/Tag-Filter existieren noch nicht (`journal.js` filtert technisch nur `e.text`-Existenz) |
| 7 | Wochenübersicht | ja, regelbasiert (keine KI-Reports) | ja (+ später generative Auswertung, p6) | `JournalV2Range.jsx` |
| 8 | Smart-Log-KI-Parsing (Freitext → Vorschläge: Habit-Completion, Mahlzeit/Makros, Tags) | Kontingent 1 Eintrag/Woche (Entscheidung 3, `observeWeeklyLimit ?? 1`) | höheres Wochenlimit via Entitlement | `journal-app/functions/smart-log.js` (gemini-2.5-flash, `quotaPolicy`, `smartLoggingEntitlements`); Produkt-Deploy-Pfad: `prod/firebase.product-journal.json` (Guard `check-product-journal.mjs`) |
| 9 | Bestätigung vor Speichern (p6-confirm): KI-Vorschlag nie automatisch gespeichert | ja (beide Tier) | ja | Edit-Flow in `JournalV2View.jsx` (`startEdit`); serverseitig `requestId`-Dedup |
| 10 | Serverseitige Rechteprüfung (Entitlement/Quota am Server, nie nur UI) | ja | ja | `smart-log.js`: HttpsError `permission-denied`, uid-Check, Firestore-Transaktion |
| 11 | „The Voice reflektieren“-Einstieg im Journal-Eintrag | ja — v1 = strukturierte, clientseitige Reflexion (kein KI-Call, siehe P1) | später: KI-Kanal, Budget nach P2-Design | `JournalV2View.jsx:557` (Button) → `main.jsx:87` `startVoiceFromJournal` (SessionContext, Navigation auf Tab `voice-v2`) → `views/voice/VoicePanel.jsx` + `voiceData.js` (feste Phasen-Prompts; Speicherung via `saveJournal`, Settings via localStorage) |
| 12 | Skillübergreifende KI-Zuordnung (p6-link) | nein | später (nicht v1-Blocker) | offen |

## Getroffene Entscheidungen (Daniel, 2026-11-06)

1. **Tagesmodell:** 4B einfrieren; DTFB nur als optionale Tag-Konvention
   (`+doing/+thinking/+feeling/+being`), kein Neubau.
2. **The Voice:** Einstieg im Journal bleibt in v1. Da kein KI-Backend
   existiert (P1), ist v1 die vorhandene regelbasierte Reflexion. Der
   KI-Kanal wird als Premium-Anker nach dem P2-Design angebaut
   (`voiceDailyLimit` neben `smartLogWeeklyLimit`); bis dahin gibt es
   kein Voice-Budget und keinen Server-Call. Der regelbasierte Fallback
   bleibt damit der v1-Zustand selbst, nicht nur eine Alternative.
3. **Kontingent-Default:** `observeWeeklyLimit = 1` — bestätigt. Wirkung im
   Closed Test (p4) beobachten; Wert serverseitig konfigurierbar.
4. **Skill Stack:** Journal mit Smart Tags, keine Pflichtfelder, keine
   fehlschlagende Eingabe; Autoerkennung schlägt Struktur vor; Datum =
   Zeitpunkt des Loggings als Fallback.

## Prüfungsergebnisse (ehemalige Restpunkte P1/P2, Lücken B/C)

- **P1 — The-Voice-Backend-Ort: geklärt.** `views/voice/` enthält keinen
  KI-Aufruf: kein fetch, kein Callable, kein API-Key in
  `VoicePanel.jsx`, `voiceData.js` (generiert aus `~/aos/voice/phases.py`,
  vier Phasen Stop/Submit/Struggle/Strike mit festen Prompts) oder
  `voiceContext.js`. Der Journaleintrag wird nur als lokaler Context
  (sessionStorage) in die Session übergeben; Ergebnisse laufen über
  `saveJournal` ins Journal bzw. localStorage-Settings. Es gibt daher
  für v1 keinen Kanal, der über `vitalos-prod` geöffnet werden müsste;
  ein Missbrauchs-Risiko über fremde Firebase-Projekte besteht nicht,
  weil kein KI-Endpoint angerufen wird.
- **P2 — Kanal-Budget-Design (Notiz, kein Refactor):** Das smart-log-
  Quota-Muster wird verallgemeinert: Kanaltyp im Firestore-Schlüssel
  (`smartLoggingQuotas` → z. B. `aiChannelQuotas/{uid}/{channel}/{week}` mit
  `channel ∈ {smartLog, voice}`; Smart-Log behält seine bestehenden
  Schlüssel), Limits konfigurierbar (`observeWeeklyLimit` /
  `voiceDailyLimit ?? 1`), Entitlement-Prüfung für Operate unverändert,
  fail-closed am Server (unbekannter Kanaltyp → `permission-denied`).
  Architekturantrag an dieser Stelle: eigene Callable je Kanal statt
  Generika-Endpoint. Kein Umbau ohne ausdrücklichen Auftrag.
- **Lücke B — Suche/Filter: bestätigt offen.** Journal v2 hat
  Datumsraster (Tag/Woche/Monat/Jahr) und Kalender; Freitextsuche über
  Ein-Inhalte sowie Filter nach Skill/Tag existieren nicht. Matrix-Zeile 6
  ist damit teils erfüllt und bleibt v1-Umsetzungsauftrag (p2-timeline).
- **Lücke C — Matrix-Gating: Serverseite erfüllt, UI-Kommunikation offen.**
  `getSmartLogQuota`/`analyzeSmartLog` prüfen Entitlement und Kontingent
  serverseitig fail-closed und liegen im Produkt-Deploy-Pfad
  (`prod/firebase.product-journal.json`, Predeploy-Guards; Details im
  Root-`docs/UNIFIED-PRODUCT.md`). Die UI muss dem Nutzer die Free-Grenzen
  (verbleibende Smart-Log-Nutzungen, 1×/Tag Voice nach Kanal-Anbau)
  verständlich anzeigen; diese Kommunikation ist noch nicht gebaut und
  kein v1-Blocker für die Abnahme des Backend-Pfads, wohl aber für den
  Launch.

## Umsetzungslücken (Aufträge)

- **Lücke A — Produkt-Functions-Komposition: gelöst (Doku).** Smart-Log
  gelangt über die Journal-Codebase aus der gemeinsamen Quelle in den
  Produkt-Deploy; kein Kopieren, kein zweiter Pin. Abschnitt „Produkt-
  Functions“ im Root-`docs/UNIFIED-PRODUCT.md` ist maßgeblich. Vor einem
  echten Deploy fehlen Secrets/Parameter in `vitalos-prod`
  (`GEMINI_API_KEY`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_CLIENT_ID`).
- **Lücke B — Suche/Filter:** v1-Umsetzungsauftrag (siehe oben).
- **Lücke C — UI-Gating-Kommunikation:** mit Kanal-Anbau (P2) bzw. vor
  Launch umsetzen.

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
  hier gefällten Entscheidungen zu synchronisieren, sobald deren Repo-Ruhe
  es erlaubt.
