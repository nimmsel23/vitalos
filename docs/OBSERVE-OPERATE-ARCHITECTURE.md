# Observe / Operate — Architekturstand und Umsetzungsplan

Stand: 2026-11-03. Dieses Dokument beschreibt den lokal geprüften Stand, nicht einen veröffentlichten Produktvertrag.

## Aktueller Bestand

| Bereich | Tatsächlicher Stand | Lücke zum Ziel |
|---|---|---|
| Quellcode | `journal-dev` unter `/home/alpha/dev/journal-dev` ist die Journal-Quelle auf `dev`. `vitalos/journal-app` ist ein Integrations-Submodul auf `vitalos`; sein Gitlink (`adc22d9`) weicht vom lokalen Journal-Commit (`f65c06b`) ab. | Änderungen müssen im Journal-Quellrepo landen und später über den vorgesehenen Release-Weg integriert werden. |
| Produktvarianten | `vitalos/vos-observe` ist ein neuer eigenständiger PWA-Prototyp mit eigenem UI/Hosting-Konfig. `vos-operate` ist im aktuellen Checkout weder ein Verzeichnis noch ein Git-Tree-Pfad. | Observe ist noch nicht die gemeinsame Journal-/Skill-Anwendung; Operate fehlt. Kein nativer Store-Build oder veröffentlichtes Hosting ist nachgewiesen. |
| Daten und Auth | Journal speichert in `fitness/{uid}/journal`; Habit-Records und Nutrition-Logs liegen in `fitness/{uid}/habitRecords` und `nutrition/{uid}/logs`. Firebase Auth ist die Nutzergrenze. Relax besitzt `relax/{uid}/sessions`. Fitness und Plan haben eigene Session-/Plan-CRUDs. | Ein gemeinsamer, expliziter Skill-Datenvertrag und Provenienzfelder fehlen. |
| Manueller Produktkern | Journal v2 bietet Tages-/Wochen-/Monats-/Jahresansicht, Tags, Habits und Skill-Einstiege. Einträge können manuell geschrieben werden. | Der Observe-Prototyp stellt diese bestehenden Ansichten/Skills derzeit nicht bereit. |
| Smart-Log-Eingabe | `JournalV2View` und `AiLogVosView` rufen beide `analyzeSmartJournal` und `applySmartAnalysis` aus `journal-dev` auf. Smart-Modus ist derzeit eine lokale `localStorage`-Einstellung. | Keine Kontingent- oder Produktvariante; keine serverseitige Feature-Konfiguration. |
| KI | `smartJournalLogger.js` nutzt Firebase AI Logic / Vertex AI (`gemini-2.5-flash`) direkt im Browser und wiederholt fehlgeschlagene Generierungen bis zu zwei Mal. | Keine serverseitige Berechtigungsprüfung oder verbindliche Quoten. Schlüssel-/Providergrenze ist nicht austauschbar konfiguriert. |
| Analyse-Schema | Firebase-Antwortschema verlangt Journaltext, Mahlzeiten und Habits; Wasser ist nicht verpflichtend. Der Parser wandelt fehlerhafte Zahlen teils still in `0` um und korrigiert unbekannte Meal-Typen zu `snack`. | Validierung ist nicht als eigenständiger, getesteter Vertrag umgesetzt; unbekannte/falsche Felder können unbemerkt verfälscht werden. |
| Vorschau | Vorschau zeigt KI-Journalzusammenfassung, Mahlzeiten, Wasser und Habits vor „Übernehmen“. | Felder lassen sich nicht korrigieren. Die Zusammenfassung ersetzt aktuell den ursprünglichen Freitext. |
| Apply / Wiederholung | Apply schreibt Journal, Nutrition-Log und Habit-Records nacheinander. Habit-Record-IDs sind bereits deterministisch (`habitId_date`). | Journal verwendet Auto-IDs; Mahlzeiten verwenden `Date.now()`. Wiederholung kann Duplikate erzeugen. Es gibt keine durchgängige Apply-ID, keine Status-/Rückverfolgung und keine Wiederaufnahme nach Teilfehler. |
| Skill-Abdeckung | Implementiert: Journal, Nutrition (Meal/Wasser) und bekannte Habit-Records. | Keine Smart-Log-Übernahme in Fitness-Sessions, Relax-Sessions oder Planner. |
| Server | Journal Functions enthalten Google-Verbindung und Reminder-Funktionen, aber keinen Smart-Log-Endpunkt. | Serverseitiger KI-Adapter, Kontingentdaten und atomare Zugriffskontrolle fehlen. |
| Tests | Journal nutzt `node --test tests/*.test.mjs`; bestehende Tests decken Router, Offline-Logik, Google- und Hilfsfunktionen ab. | Kein gezielter Test für Smart-Schema, Apply, Provenienz, Wiederholung oder Kontingente. |

## Gemeinsame Produktbasis

Die tragfähige gemeinsame Quelle ist zunächst `journal-dev`: dort liegen Journal-CRUD, Journal-v2, Smart-Log-UI und die vorhandenen adapterspezifischen Zugriffe. `vos-observe` und das noch anzulegende `vos-operate` sollen dünne Marken-/Konfigurationshüllen werden, keine unabhängigen Kopien der Skill-Logik. Beide sollen Journal und manuelle Skills dauerhaft nutzen können; nur serverseitige KI-Berechtigung und KI-Kontingent unterscheiden sich. Alte Nutzerbestände bleiben in ihren jetzigen Firestore-Pfaden.

## Meilenstein 1 — gemeinsamer Apply-Kern

Umgesetzt in `journal-dev/dev` (lokal, noch nicht in den VitalOS-Submodul-Gitlink integriert):

- Die Analyse trägt eine Request-ID, den ursprünglichen Freitext und die erkannten Nutzertags. Vorschau und Apply speichern den Originaltext; die KI-Zusammenfassung bleibt eine separate, bearbeitbare Notiz am Eintrag.
- Ein expliziter Schema-Validator weist unbekannte Felder, falsche Typen, negative/unplausible Werte und ungültige Zeiten zurück. Unbekannte Makros bleiben `null`; Schätzungen sind pro Makro gekennzeichnet.
- Meal-Records verwenden deterministische IDs und `sourceJournalId`/`sourceRequestId`. Der Nutrition-Apply läuft in einer Firestore-Transaktion und erhält auch Alt-Einträge ohne IDs.
- Wasser wird als requestbezogener Beitrag mit Journal-Referenz gespeichert und addiert. Derselbe Request wird nicht erneut addiert; getrennte 500-ml-Requests ergeben 1.000 ml.
- Habit-Records bleiben über ihre bestehende deterministische `habitId_date`-ID idempotent und erhalten Provenienzfelder.
- Apply-Status wird am Journal-Quellrecord als `applying`, `applied` oder `partial` geführt. AI-Fehler lassen die normale Journal-Speicherung über einen eigenen Fallback zu.
- Vorschläge für Zusammenfassung, Meals, Zeit, Makros, Wasser und Habits sind in der Journal-v2-Vorschau korrigierbar oder entfernbar.
- Verifiziert: komplette Journal-Testsuite (18/18) und `pnpm run build:firebase` erfolgreich. Kein Firebase-Deploy, keine Änderung an echten Firestore-Nutzerdaten.

Noch offen in diesem Meilenstein: Fitness-, Relax- und Planner-Adapter; wiederaufnehmbare UI nach Reload; serverseitige Analyse/Berechtigung; Observe/Operate als gemeinsame Produkt-Einstiege. Ein Apply kann nach lokal/offline gespeichertem Original bei einem abgeleiteten Ziel fehlschlagen; `partial` bewahrt die Quelle, aber ein sichtbarer gezielter Resume-Button steht noch aus.

## Priorisierter Plan

1. **Gemeinsamer Apply-Kern:** Rohtext und Nutzertags erhalten; KI-Ausgabe gegen ein explizites Schema validieren; Analyse-ID/Journal-ID stabil halten; abgeleitete Records mit `sourceJournalId` verknüpfen; Apply-Status und Teilergebnisse sichtbar machen; bestehende Nutrition-/Habit-Apply idempotent machen. Tests für Schema, Wiederholung und Teilfehler. Keine Datenmigration.
2. **Skill-Adapter vervollständigen:** Fitness, Nutrition, Relax und Planner über vorhandene Owner-CRUDs anbinden. Unsichere/mehrdeutige Vorschläge bleiben unbearbeitet; jede Änderung wird vor Apply geprüft/korrigiert. Tests gegen die echten Zielschemas.
3. **Server-KI und Berechtigungen:** genau einen Provider zunächst über Firebase Callable Function anbinden; automatische Verarbeitung standardmäßig aus und nur auf ausdrückliche Aktion/Einstellung. Free: ein erfolgreicher KI-Lauf pro ISO-Woche; manuelle Journal-/Skill-Schreibvorgänge bleiben unbegrenzt. Operate: konfigurierbares Kontingent ohne vorweggenommene Preis-/Limitentscheidung. Atomare Transaktion/Lock gegen parallele Überschreitung; Fehlversuche und technische Retries verbrauchen kein Kontingent, erfolgreiche Analyse genau eines. Schlüssel verbleibt serverseitig.
4. **Observe/Operate-Hüllen:** `journal-dev` bleibt gemeinsame Produkt-/Skill-Basis; Feature-Konfiguration, Branding und serverseitig geprüfte entitlement unterscheiden die Einstiege. Observe bekommt manuelles Journal + Skills + Free-KI-Kontingent. Operate bekommt denselben Kern + konfigurierbare Premium-KI-Berechtigung. Kein künstliches Sperren von Planner/Habits.
5. **Release-/Betriebsnachweis:** Tests und Builds, Firebase Hosting-Sites/Auth-Domains, Store-Datenschutzangaben und optional native Verpackung getrennt verifizieren. Kein Deploy oder Store-Publish ohne passenden Release-Auftrag.

## Offene technische Abhängigkeiten

- Verifizieren, welcher Firebase Functions-Codebestand für Journal-Smart-Logging künftig zuständig sein soll: `journal-dev/functions` (Codebase `journal`) oder die VitalOS-Functions. Keine doppelte Callable-Definition veröffentlichen.
- Provider-Secret und Service-Account-IAM für serverseitiges Gemini/Vertex existieren nicht als verifizierte Einrichtung. Der Code darf bis zur Einrichtung keine Client-Key-Ausweichroute aktivieren.
- `observe-vos` ist bisher nur in `vos-observe/firebase.json` als Ziel eingetragen; die tatsächliche Firebase Hosting-Site und der Firebase-Auth-Authorized-Domain-Eintrag sind nicht verifiziert.
- Das vorhandene Journal-Submodul muss zum Release-Zeitpunkt nach dem aktuellen PR-/Merge-Weg aus `journal-dev/dev` integriert werden; der aktuelle lokale Gitlink ist älter als der Journal-Quellcheckout.
