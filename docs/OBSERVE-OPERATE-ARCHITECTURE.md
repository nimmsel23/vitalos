# Observe / Operate — Architekturstand und Umsetzungsplan

Stand: 2026-11-03. Dieses Dokument beschreibt den lokal geprüften Stand, nicht einen veröffentlichten Produktvertrag.

## Aktueller Bestand

| Bereich | Tatsächlicher Stand | Lücke zum Ziel |
|---|---|---|
| Quellcode | `journal-dev` unter `/home/alpha/dev/journal-dev` ist die Journal-Quelle auf `dev`. `vitalos/journal-app` ist ein Integrations-Submodul auf `vitalos`; sein Gitlink (`adc22d9`) weicht vom lokalen Journal-Commit (`f65c06b`) ab. | Änderungen müssen im Journal-Quellrepo landen und später über den vorgesehenen Release-Weg integriert werden. |
| Produktvarianten | `vitalos/vos-observe` ist ein eigenständiger PWA-Prototyp mit eigenem UI/Hosting-Konfig. `vos-operate` ist im aktuellen Checkout weder Verzeichnis noch Git-Tree-Pfad. | Observe ist noch nicht die gemeinsame Journal-/Skill-Anwendung; Operate fehlt. Kein nativer Store-Build oder veröffentlichtes Hosting ist nachgewiesen. |
| Daten und Auth | Journal speichert in `fitness/{uid}/journal`; Habit-Records und Nutrition-Logs liegen in `fitness/{uid}/habitRecords` und `nutrition/{uid}/logs`. Firebase Auth ist die Nutzergrenze. Relax besitzt `relax/{uid}/sessions`. Fitness und Plan haben eigene Session-/Plan-CRUDs. | Ein gemeinsamer, expliziter Skill-Datenvertrag und Provenienzfelder fehlen. |
| Manueller Produktkern | Journal v2 bietet Tages-/Wochen-/Monats-/Jahresansicht, Tags, Habits und Skill-Einstiege. Einträge können manuell geschrieben werden. | Der Observe-Prototyp stellt diese bestehenden Ansichten/Skills derzeit nicht bereit. |
| Smart-Log-Eingabe | `JournalV2View` und `AiLogVosView` rufen beide `analyzeSmartJournal` und `applySmartAnalysis` aus `journal-dev` auf. Smart-Modus ist derzeit eine lokale `localStorage`-Einstellung. | Keine Kontingent- oder Produktvariante; keine serverseitige Feature-Konfiguration. |
| KI | `analyzeSmartLog` ist jetzt eine Firebase Callable Function in der Journal-Codebase (Node 22, `europe-west1`) und ruft Gemini 2.5 Flash serverseitig auf. Der Client sendet nur nach explizitem Smart-Log-Aufruf. |
| KI-Berechtigung | Firestore-Entitlement und Wochenkontingent werden ausschließlich mit Admin SDK gelesen/geschrieben. Observe hat standardmäßig 1 erfolgreichen Lauf pro ISO-Woche in `Europe/Vienna`; `operate` braucht ein aktives Server-Entitlement und ein explizites `weeklyLimit`. |
| Analyse-Schema | Server validiert Felder, Typen, Größen, Mahlzeitenzeiten und Habit-Namen strikt; Originaltext, Tags und Request-ID werden serverseitig aus der Eingabe ergänzt. Geschätzte Makros bleiben markiert, unbekannte Werte `null`. |
| Vorschau | Journal-v2 zeigt Originaltext und bearbeitbare Vorschläge; der AI-Fehler kann manuell umgangen werden. |
| Apply / Wiederholung | Der Journal-Apply-Kern nutzt stabile IDs/Quellverknüpfungen, Status und wiederholbare Nutrition-Transaktionen. Smart-KI-Requests werden serverseitig pro Request-ID gecacht; parallele Duplikate starten keine zweite Analyse. |
| Skill-Abdeckung | Implementiert: Journal, Nutrition, bekannte Habits, Fitness-Sessions und Relax-Sessions. Planner-Vorschläge können nach Review als private Google-Kalendertermine angelegt und am Journaleintrag verknüpft werden. | OAuth-Einwilligung muss den zusätzlichen Schreib-Scope erhalten; terminierte Events warten auf eine explizite Dauer. |
| Server | Callable und Smart-Log-Adapter liegen in `journal-dev/functions`; Provider-Key ist als Secret `GEMINI_API_KEY` vorgesehen. Live-Secret, Live-Funktion und Firebase-Auth blieben ungeprüft. |
| Tests | 20/20 Testdateien bestanden; Schema-, Kontingent-, Apply- und Kalender-Event-Modelltests. Firebase-Build erfolgreich. |

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
- Verifiziert: komplette Journal-Testsuite (19/19) und `pnpm run build:firebase` erfolgreich. Kein Firebase-Deploy, keine Änderung an echten Firestore-Nutzerdaten.

Noch offen in diesem Meilenstein: Fitness-, Relax- und Planner-Adapter; wiederaufnehmbare UI nach Reload; serverseitige Analyse/Berechtigung; Observe/Operate als gemeinsame Produkt-Einstiege. Ein Apply kann nach lokal/offline gespeichertem Original bei einem abgeleiteten Ziel fehlschlagen; `partial` bewahrt die Quelle, aber ein sichtbarer gezielter Resume-Button steht noch aus.

## Meilenstein 2 — serverseitige KI und Kontingent

Umgesetzt lokal in `journal-dev/dev` (noch nicht gepusht oder integriert):

- `analyzeSmartLog` prüft Auth, Request-ID und Eingabe und ruft Gemini ausschließlich im Server auf. Die bestehende Client-Vorlage enthält keinen Provider-Aufruf oder Schlüssel mehr.
- Pro Nutzer und ISO-Woche wird eine Firestore-Transaktion für Kontingent und Request-Lock verwendet. Erfolgreiche, validierte Antworten zählen einmal; Wiederholung derselben ID liefert den gespeicherten Erfolg zurück. Gleichzeitige Wiederholung während Verarbeitung wird abgewiesen, statt eine zweite Gemini-Anfrage auszulösen.
- Provider-/Validierungsfehler geben die Reservierung frei und zählen nicht. Es gibt keine automatischen Provider-Retries. Ein neuer bewusster Analyseversuch bekommt eine neue Request-ID.
- Observe-Standard ist 1 erfolgreiche Analyse pro Woche. Operate wird nur bei aktivem Admin-Entitlement und gesetztem `weeklyLimit` zugelassen; es wurde keine Premiumzahl festgelegt.
- `GEMINI_API_KEY` muss vor Deployment als Firebase Secret eingerichtet werden. Kein Client-Fallback ist vorgesehen.
- Verifiziert: 19/19 Tests, Syntaxprüfung der Functions und Firebase-Build. Kein Push, Deploy, Live-Funktionscheck oder echter Kontingenttest gegen Firebase.

Offen: abgebrochene `processing`-Requests bleiben bis zur manuellen/administrativen Behandlung gesperrt; dies verhindert doppelte kostenpflichtige Analyse nach unklarem Provider-Ausgang. Retention der gecachten Analyseergebnisse muss vor Produktivbetrieb festgelegt werden.

## Meilenstein 3 — Fitness-/Relax-Adapter und Skill-Vorschau

Lokal in `journal-dev/dev` umgesetzt, noch nicht in den VitalOS-Gitlink integriert:

- Die KI kann abgeschlossene Fitness- und Relax-Einheiten strukturiert vorschlagen. Relatives Datum wird gegen das vom Nutzer ausgewählte Journaldatum aufgelöst.
- Fitness schreibt in das bestehende `fitness/{uid}/sessions`-Modell; Relax ergänzt `relax/{uid}/sessions/{date}.items`. Beide behalten `sourceJournalId` und `sourceRequestId` und nutzen requestbasierte IDs für Wiederholungen.
- Vorschläge sind im Journal-v2-Review bearbeitbar oder entfernbar. Planner-Vorschläge bleiben im Review bearbeitbar und werden nach Apply im verknüpften Journal als Vorschlag angezeigt.
- Planner erzeugt bestätigte private Google-Kalendertermine im primären Kalender. Eine gehashte Request-ID verhindert Duplikate; Quelljournal und Request-ID stehen als private Event-Metadaten, der Event-Link wird am Journal-Vorschlag angezeigt.
- Das UI verlangt für zeitgebundene Termine eine Dauer, statt sie zu erfinden. Wenn Kalenderberechtigung/Datum/Dauer fehlt, bleibt der Vorschlag sichtbar und kann nach Korrektur mit derselben Request-ID erneut angewendet werden.
- Die bestehende Fitness-Split-/Übungserfassung wird nicht mit erfundenen Übungen befüllt. Ein erkannter Krafttrainingseintrag wird als Session mit Block und Dauer abgelegt.
- Verifiziert: 20/20 Testdateien, Functions-Syntax und Firebase-Build erfolgreich. Keine echten Nutzerdaten verändert.

Offen: Google-Reautorisierung für den Schreib-Scope und Live-Test mit echtem Kalender. Bestehende Google-Verbindungen haben den neu hinzugefügten Schreib-Scope noch nicht autorisiert.

## Priorisierter Plan

1. **Gemeinsamer Apply-Kern:** umgesetzt für Journal, Nutrition und Habits; wiederaufnehmbare UI nach Offline-/Teilfehlern bleibt offen.
2. **Skill-Adapter vervollständigen:** Fitness und Relax sind angebunden. Planner-Ziel ist Google Kalender; OAuth-Reautorisierung und Live-Test stehen aus.
3. **Server-KI und Berechtigungen:** Callable, Observe-Kontingent und Operate-Entitlement umgesetzt; offen bleiben Secret-/Live-Einrichtung, Retention und Umgang mit hängenden Requests. Keine automatische Verarbeitung; manuelle Journal-/Skill-Schreibvorgänge bleiben unabhängig vom KI-Kontingent.
4. **Observe/Operate-Hüllen:** `journal-dev` bleibt gemeinsame Produkt-/Skill-Basis; Feature-Konfiguration, Branding und serverseitig geprüfte entitlement unterscheiden die Einstiege. Observe bekommt manuelles Journal + Skills + Free-KI-Kontingent. Operate bekommt denselben Kern + konfigurierbare Premium-KI-Berechtigung. Kein künstliches Sperren von Planner/Habits.
5. **Release-/Betriebsnachweis:** Tests und Builds, Firebase Hosting-Sites/Auth-Domains, Store-Datenschutzangaben und optional native Verpackung getrennt verifizieren. Kein Deploy oder Store-Publish ohne passenden Release-Auftrag.

## Offene technische Abhängigkeiten

- `journal-dev/functions` (Codebase `journal`) ist als einzige Quelle der Smart-Log-Callable gewählt. Vor Release weiterhin den Live-Funktionsbestand prüfen, damit kein zweiter Callable-Owner entsteht.
- Provider-Secret und Service-Account-IAM für serverseitiges Gemini existieren nicht als verifizierte Einrichtung. Der Code hat keine Client-Key-Ausweichroute.
- Google Calendar benötigt für das Schreiben den zusätzlichen OAuth-Scope `calendar.events.owned`; bestehende Verbindungen müssen diesen Scope nach ausdrücklicher Einwilligung neu autorisieren. Für öffentlichen Store-Betrieb sind Googles OAuth-Verifikation und die finalen Consent-Angaben zu prüfen.
- `observe-vos` ist bisher nur in `vos-observe/firebase.json` als Ziel eingetragen; die tatsächliche Firebase Hosting-Site und der Firebase-Auth-Authorized-Domain-Eintrag sind nicht verifiziert.
- Das vorhandene Journal-Submodul muss zum Release-Zeitpunkt nach dem aktuellen PR-/Merge-Weg aus `journal-dev/dev` integriert werden; der aktuelle lokale Gitlink ist älter als der Journal-Quellcheckout.
