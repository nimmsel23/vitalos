# Frontend-Reviews (älteste, nie refaktorierte Oberflächen)

Methode: pro Frontend Datei-/Größen-/Alterswerte aus Git, dann Lesen der Hauptdateien, Review mit
Befunden (Struktur, Zustand, Zugänglichkeit, Mobile/ADHS-Tauglichkeit, Tailwind 4), Aufwand/Risiko, Reihenfolge.
Umsetzung nur nach Freigabe, in `~/dev/<modul>-dev`. Gemessen am 2026-11-06 (letzte Änderung je Datei, Commits je Datei, Zeilen):

| Priorität | Frontend/Datei | Letzte Änderung | Commits | Zeilen | Bemerkung |
|---|---|---|---|---|---|
| 1 | journal-dev `components/Journal/JournalForm.jsx` | 2026-10-11 | 6 | 250 | Kern-Eingabe von Observe v1 |
| 1 | journal-dev `components/Journal/JournalEntry.jsx` / `JournalModal.jsx` | 2026-10-20 | 17 | 271 / 318 | alte Journal-Schicht neben `views/v2` |
| 1 | journal-dev `components/Journal/JournalTimeline.jsx` | — | — | 794 | größte Journal-Datei |
| 2 | habits (jetzt in journal-dev `apps/habits`) `HabitWidget.jsx`, `Core4Layout.jsx` | 2026-07-02 / 08-25 | 1 / 3 | 164 / 591 | älteste Habits-Dateien, Tagesmodell |
| 3 | fuel-dev `Micros/MicrosSuperfoodRadar.jsx`, `Settings/*` | 2026-07/08 | 1–4 | 415 / 163 / 187 | seit Monaten unberührt |
| 3 | fuel-dev `Log/LogView.jsx` | — | — | 878 | größte Fuel-Datei |
| 4 | relax-dev `views/Ausbildung.jsx` | 2026-11-03 | 119 | 1248 | nicht „alt“, aber Monolith |
| 4 | fitness/plan `ExerciseInsightModal.jsx` | — | — | 1093 / 1084 | doppelt vorhanden (Duplikat prüfen) |

## Review-Reihenfolge
1. Woche 1: Journal-Eingabe (Form/Entry/Modal/Timeline) gegen `views/v2` — gibt es Doppelungen/tote Pfade?
2. Woche 2: Habits (Tagesmodell 4B), Fuel-Settings/Micros.
3. Danach Relax `Ausbildung.jsx`, `ExerciseInsightModal` (Duplikat Fitness/Plan).

## Ergebnisse
(wird pro Review ergänzt: Datum, Befunde, Vorschlag, Aufwand, Freigabe ja/nein)

### Review 1 — Journal-Eingabeschicht (journal-dev), 2026-11-06 (nur Lesen, Code nicht geändert)
Belegt per Grep/Lesen in `~/dev/journal-dev`:
- **Struktur ist gewollt konsolidiert:** `components/Journal/JournalTimeline.jsx` (794 Z.) ist der gemeinsame Kern für fitness (`views/Journal` re-exportiert), fuel (`JournalVosView` als Wrapper) und journal-Standalone. `JournalForm/Entry/Modal/Calendar/Header/Settings` werden ausschließlich von der Timeline importiert, sind also nicht tot.
- **Zwei parallele Journal-Oberflächen:** Timeline-Kern (klassisch) und `views/v2/JournalV2View.jsx` (661 Z., eingebunden über `AiLogVosView`, KI-Log). Für Observe v1 ist nicht definiert, welche die Standard-Eingabe ist (Doku-Lücke, Entscheidung für Daniel/CEO-Scope Zeile 1/6).
- **Zugänglichkeit:** In `components/Journal/*.jsx` kein einziges `aria-label` (grep 0); Icon-Buttons (`X`, `ImagePlus`, `Calendar` in `JournalForm`) sind für Screenreader unbenannt. Touch-Zielgröße nicht geprüft.
- **Zustand:** `JournalForm` hat 9 `useState/useEffect`, davon drei Effekte, die sich über `editingEntry`/`saving`/`text` gegenseitig auslösen (Zuklappen nach dem Sichern hängt an `wasSaving`+leerem Text). Fragil: wird der Text vom Elternteil nicht geleert, bleibt der Composer offen. Vorschlag: Zuklappen explizit über Rückgabe von `onSubmit`.
- **Hygiene:** 5 `*.bak`-Dateien im Quellordner (untracked), `JournalV2View.jsx.bak*` ebenso. Aufräumen per `mv` ins Archiv.
- **ADHS-Tauglichkeit (Zielbild):** Einladungskarte mit Tagesprompt ist gut (niedrige Einstiegshürde). Fehlt: ein Ein-Tipp-Schnell-Log (Stimmung/4B-Check-in ohne Text) als Auslöser für die Sperr-Freischaltung (siehe `FOKUS-SPERRMODUS.md`).

Vorschlag (Aufwand/Risiko): (1) Standard-Eingabe für Observe v1 festlegen — Entscheidung, 0 Aufwand. (2) `aria-label`/Touch-Ziele in Form/Entry/Modal ergänzen — klein, risikoarm. (3) Composer-Zuklapplogik entkoppeln — klein, mittleres Regressionsrisiko, braucht Gerätetest. (4) Schnell-Check-in-Komponente — mittel, hängt an Tagesmodell-Entscheidung (4B). Freigabe: offen.

### Review 2 — Habits (jetzt `journal-dev/apps/habits`), 2026-11-06 (nur Lesen)
- **Ort:** Habits liegt nach der Zusammenlegung in `journal-dev/apps/habits` (eigene PWA, Commit `e6d5762`). Die Datei `Core4Layout.jsx` hat 591 Zeilen, `index.jsx` 738.
- **Tagesmodell (Entscheidung 1):** `utils.js` nutzt Kategorien `body`/`being`/`balance`/(`business`). Passt zur Freigabe: 4B bleibt, Anzeige-Labels können health/wealth/relations/self heißen, falls gewünscht (Label-Änderung statt Datenmigration, Keys unverändert lassen).
- **Zugänglichkeit:** Nur 3 Dateien in der Habits-App nutzen `aria-label` (6 in `DailyFourLayout`, 1 in `HabitJournalModal`). In `Core4Layout.jsx` sind Icon-Buttons (Kommentar `MessageSquare`, Bearbeiten `Pencil`, Ziehgriff `GripVertical`) ohne Namen und mit ca. 13px-Icons in `p-1.5`-Buttons, also deutlich unter dem 44px-Touchziel. Für eine Fokus-App mit täglichem Abhaken ist das die größte Reibung auf dem Handy.
- **Interaktion:** Abhaken (`core4-theme-task-chip`) ist gut als Ein-Tipp-Muster; Journal/Bearbeiten daneben sind zu klein und zu dicht (Fehltipps). Drag-Griff und Check liegen in derselben Zeile.
- **Struktur:** zwei konkurrierende Layouts (`Core4Layout` 591 Z., `DailyFourLayout` 300 Z.) plus `HabitSidebar`; nicht belegt, welches das Ziel-Layout für Observe v1 ist. Vorschlag: `DailyFourLayout` als Standard (hat bereits `aria-label`), `Core4Layout` danach reduzieren.
- **Vorschlag (Aufwand/Risiko):** (1) Icon-Buttons benennen und auf 44px Trefferfläche vergrößern, ohne Optik zu ändern (`min-h/min-w`, Padding) — klein, risikoarm. (2) Ziel-Layout festlegen — Entscheidung. (3) `Core4Layout` zerlegen — mittel, erst nach (2). Freigabe: offen, Umsetzung in `~/dev/journal-dev` (Woche 2).

### Review 3 — Fuel (`fuel-dev`, `origin/dev`), 2026-11-06 (nur Lesen)
- **`Log/LogView.jsx`** (882 Z.): eine Komponente `LogView` ab Zeile 138 mit 10 `useState`, Hilfsfunktionen (`checkJournalAgainstLog`, `buildSavePlan`, `loadForEdit`) im selben File. Das ist die Mahlzeit-Eingabe, also der Fuel-Kern von Observe v1. Nur 4 `aria-`-Attribute bei 11 Klick-Handlern. Vorschlag: Eingabeformular, Liste und Journal-Abgleich (`checkJournalAgainstLog` ruft das Journal) in drei Dateien trennen; zuerst Tests für `buildSavePlan` (reine Logik), dann zerlegen. Aufwand mittel, Risiko mittel.
- **`Micros/MicrosSuperfoodRadar.jsx`** (416 Z.): seit 2026-07-30 unverändert, 1 Commit, 1 Klick-Handler, 1 `aria-`. Wenig Interaktion, geringes Risiko; Priorität niedrig (Premium-Nähe unklar).
- **`Settings/*`**: 12 Dateien, fast ohne `aria-`-Attribute (nur `BackupCard` 1). `SettingsView.jsx` ist ein dünner Wrapper (39 Z.). Die Rollout-Arbeit (Labels, Trefferflächen) hat Vibe A übernommen (`HANDOFF-woche2-frontend-a11y.md`).
- **Minimalfelder Fuel für Observe v1 (offene Scope-Frage):** aus dem Code nicht ableitbar ohne Lesen des Formulars (`emptyForm`, Zeile 105); Vorschlag: Zeit, Name/Text, Kalorien optional. Entscheidung für Daniel, bevor das Formular vereinfacht wird.
- **Empfohlene Reihenfolge:** a11y (läuft) → Tests für `buildSavePlan` → LogView zerlegen.

### Review 4 — Relax `views/Ausbildung.jsx` (`relax-dev` `origin/dev`), 2026-11-06 (nur Lesen)
- **Umfang:** 1248 Zeilen, 119 Commits (am häufigsten angefasste Datei der Review-Liste), 18 `useState` in der Hauptkomponente `Ausbildung` (ab Zeile 582), 12 `aria-`-Attribute.
- **Aufbau:** Ab Zeile 9 steht eine ~500 Zeilen lange Konstante `METHODS` (Inhaltsdaten, kein UI) im selben File; danach Hilfsfunktionen (`emptyCasePlan`, CSV-Export `csvCell`, `normalizeModuleBackup`, `restoreDelivery`, `readTrainingRoute`) und erst dann die Komponente. Daten, Export/Backup-Logik und UI sind vermischt; 20 Fundstellen für `localStorage`/`setDoc`/`fetch` direkt in der View.
- **Vorschlag (in dieser Reihenfolge, jeweils eigener Commit):** (1) `METHODS` in eine Datenmodul-Datei auslagern (`data/ausbildungMethods.js`) — mechanisch, kaum Risiko, nimmt ~40 % der Zeilen. (2) Backup/Export (`csvCell`, `normalizeModuleBackup`, `restoreDelivery`) in ein Modul mit Tests — reine Funktionen. (3) Zustand in Hooks gruppieren (Fallplan, Training, Backup). (4) Persistenz aus der View in einen Store ziehen.
- **Produktbezug:** Ausbildung ist Vitaltrainer-Inhalt, nicht Observe-v1-Kern; Priorität nach Journal/Habits/Fuel, aber Schritt (1) ist billig und senkt das Änderungsrisiko für die am häufigsten editierte Datei.
- Freigabe: offen; Umsetzung durch Vibe A möglich (kein Registry-Voll-Install nötig, esbuild-Syntaxcheck genügt für Schritt 1).

**Nachtrag Review 4 (2026-11-06, später am Tag):** Schritt (1) ist auf `relax-dev` `origin/dev` bereits umgesetzt (`4d09746`, „Inhaltsdaten ausgelagert“): `Ausbildung.jsx` hat jetzt 781 Zeilen, `Ausbildung.data.js` 470 Zeilen. Mein Review basierte auf dem Stand kurz davor; die Empfehlung ist damit erledigt. Offen bleiben (2) Backup/Export-Funktionen mit Tests, (3) Zustand in Hooks, (4) Persistenz in einen Store.

### Review 5-Nachtrag — Habits-Kopf-Buttons
`habits/src/views/Habits/index.jsx`: alle 11 Icon-Buttons mit nur `title` haben jetzt ein gleichlautendes `aria-label` (`journal-dev` `6252c62`, `dev`, Syntax per esbuild geprüft, Check/Preview noch nicht ausgewertet).

**Fuel LogView-Zerlegung (Stand 2026-11-06):** Schritt 1 `mealSavePlan.js` (`fuel-dev` `1a2022a`, 5 Tests), Schritt 2 `mealForm.js` (`fc57032`, 3 Tests). Nächster Kandidat: Journal-Abgleich `checkJournalAgainstLog` (async, KI-nah) als eigenes Modul, danach Mahlzeitenliste/Formular als Komponenten.
