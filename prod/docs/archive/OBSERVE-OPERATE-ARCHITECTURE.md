# Observe / Operate — Architekturstand und Umsetzungsplan

> Archiviert 2026-11-05: Historische Bestandsaufnahme mit `*-dev`-Quellpfaden und `fitness-aos`-Live-Audit; die beschriebenen fail-closed-Produkt-Guards gelten weiter, viele Gitlink- und Live-Angaben sind überholt. Aktueller Produktstand: `docs/PRODUCT-CHECKOUT.md` und `docs/STORE-PUBLISHING-PLAN.md`.

Stand: 2026-11-03. Dieses Dokument beschreibt den lokal geprüften Stand, nicht einen veröffentlichten Produktvertrag.

## Aktueller Bestand

| Bereich | Tatsächlicher Stand | Lücke zum Ziel |
|---|---|---|
| Quellcode | `journal-dev` unter `/home/alpha/dev/journal-dev` ist die Journal-Quelle auf `dev`; aktueller lokaler Stand `c9fd4d8` (14 Commits vor `origin/dev`). `vitalos/journal-app` ist ein Integrations-Submodul auf `vitalos` und steht auf dem älteren Gitlink `adc22d9`. | Journal-Commits müssen über den vorgesehenen Release-Weg integriert werden, bevor ein sauberer Shell-Checkout dieselben Smart-Log-Funktionen baut. |
| Produktvarianten | `vitalos/vos-observe` bleibt ein eigenständiger Check-in-Prototyp. `vos-operate` ist kein eigenes Verzeichnis. Im Feature-Worktree gibt es gebrandete Observe-/Operate-PWA-Builds und zusätzlich einen generischen Store-Build mit Laufzeitumschaltung der Oberfläche. Ein manueller, an `master` gebundener Workflow kann jeweils genau eine Edition auf eine getrennte Firebase-Hosting-Site deployen. | IDs und Secret für das neue Produktprojekt fehlen noch als GitHub-Variablen/Secret; ein natives Capacitor-/Store-Paket ist nicht eingerichtet. |
| Visuelle Eigenständigkeit | Observe startet in der Journal-Chronik mit horizontaler, heller Bereichsnavigation. Operate startet in Daily Four mit vertikaler, dunkler Aktionsnavigation. Name, Akzentfarben, Icon, Manifest und Service-Worker-Präfix sind editionsspezifisch; Skills und Datenpfade bleiben gemeinsam. | Die Shell-Einstiege unterscheiden sich deutlich. Die tieferen Fachansichten sind noch überwiegend gemeinsame Views und brauchen Browser-/Geräteabnahme. |
| Daten und Auth | Journal speichert in `fitness/{uid}/journal`; Habit-Records und Nutrition-Logs liegen in `fitness/{uid}/habitRecords` und `nutrition/{uid}/logs`. Firebase Auth ist die Nutzergrenze. Relax besitzt `relax/{uid}/sessions`. Fitness und Plan haben eigene Session-/Plan-CRUDs. | Ein gemeinsamer, expliziter Skill-Datenvertrag und Provenienzfelder fehlen. |
| Manueller Produktkern | Journal v2 bietet Tages-/Wochen-/Monats-/Jahresansicht, Tags, Habits und Skill-Einstiege. Einträge können manuell geschrieben werden. Observe/Operate zeigen Journal v2 als Hauptansicht und lassen zur bisherigen Tagesliste wechseln. | Die historischen PWA-Verzeichnisse sind noch nicht auf diese gemeinsame Shell migriert. |
| Smart-Log-Eingabe | `JournalV2View` und `AiLogVosView` rufen `analyzeSmartJournal` und `applySmartAnalysis` aus `journal-dev` auf. In den beiden Edition-Builds liegt Journal v2 im gemeinsamen Shell-Router. Analyse startet nur durch ausdrückliche Aktion. | Der reproduzierbare Shell-Gitlink ist noch älter als der lokale Smart-Log-Quellstand; die Release-Integration steht aus. |
| KI | `analyzeSmartLog` ist jetzt eine Firebase Callable Function in der Journal-Codebase (Node 22, `europe-west1`) und ruft Gemini 2.5 Flash serverseitig auf. Der Client sendet nur nach explizitem Smart-Log-Aufruf. |
| KI-Berechtigung | Firestore-Entitlement und Wochenkontingent werden ausschließlich mit Admin SDK gelesen/geschrieben. Observe hat standardmäßig 1 erfolgreichen Lauf pro ISO-Woche in `Europe/Vienna`; `operate` braucht ein aktives Server-Entitlement und ein explizites `weeklyLimit`. |
| Analyse-Schema | Server validiert Felder, Typen, Größen, Mahlzeitenzeiten und Habit-Namen strikt; Originaltext, Tags und Request-ID werden serverseitig aus der Eingabe ergänzt. Geschätzte Makros bleiben markiert, unbekannte Werte `null`. |
| Vorschau | Journal-v2 zeigt Originaltext und bearbeitbare Vorschläge; der AI-Fehler kann manuell umgangen werden. |
| Apply / Wiederholung | Der Journal-Apply-Kern nutzt stabile IDs/Quellverknüpfungen, Status und wiederholbare Nutrition-Transaktionen. Smart-KI-Requests werden serverseitig pro Request-ID gecacht; parallele Duplikate starten keine zweite Analyse. |
| Skill-Abdeckung | Implementiert: Journal, Nutrition, bekannte Habits, Fitness-Sessions und Relax-Sessions. Planner-Vorschläge können nach Review als private Google-Kalendertermine angelegt und am Journaleintrag verknüpft werden. Der dev-Code verlangt `calendar.events.owned`. | Im alten Projekt müssen bestehende Google-Verbindungen diesen Schreib-Scope ausdrücklich neu autorisieren; terminierte Events warten auf eine explizite Dauer. |
| Server-Code | Callable und Smart-Log-Adapter liegen in `journal-dev/functions`; Provider-Key ist als Secret `GEMINI_API_KEY` vorgesehen. Der Code speichert Google-Refresh-Tokens im Server-Firestore und gibt dem Browser nur kurzlebige Access-Tokens. |
| Firebase/Live | `.firebaserc` behält `fitness-aos` als privates lokales Defaultziel. Die Produkt-Workflows auf diesem Feature-Branch verwenden eigene Projekt-/Site-Variablen, Firebase-Webkonfiguration und VAPID-Key und verweigern `fitness-aos`; die übrigen bestehenden privaten Workflows sind nicht migriert. Der neue Produktstack existiert noch nicht. |
| Neuer Produkt-Stack | Das aktive Cloud-Konto ist `nimmdaniel@gmail.com`; dessen sichtbare Projektliste enthält derzeit kein VitalOS-Projekt. Ein frisches Projekt, Hosting-Sites, Auth-Einträge, Functions-Secrets und Release-Workflows sind noch nicht eingerichtet. | Projekt-ID und Firestore-Standort müssen vor Erstellung feststehen; Projekt-ID und Firestore-Standort sind nachträglich nicht änderbar. Es gibt keine pauschale Migration privater `fitness-aos`-Nutzerdaten. |
| Tests | Journal: 21/21 Testdateien bestanden; Schema-, Kontingent-, Apply-, Kalender-Event- und Request-ID-Retry-Tests. Habits: 3/3 Testdateien bestanden. Edition-Einstiegsroute: Routentest bestanden. Beide Produkt-Firebase-Builds erfolgreich. |

## Gemeinsame Produktbasis

Die bestehende VitalOS-Shell ist die gemeinsame Produktbasis; `journal-dev` liefert Journal-CRUD, Journal-v2, Smart-Log-UI und Apply-Adapter. Observe und Operate werden als Edition-Builds derselben Shell erzeugt, nicht als getrennte Skill-Kopien. Beide behalten denselben manuellen Stack; die KI-Berechtigung und das Kontingent prüft der Server. Alte Nutzerbestände bleiben in ihren jetzigen Firestore-Pfaden.

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
- Vor dem Start des Provider-Aufrufs fehlgeschlagene Requests geben die Reservierung frei. Sobald der Gemini-Aufruf begonnen hat, bleiben Request und Kontingent bei jedem unklaren Fehler dauerhaft gesperrt; ein Wiederholungsversuch mit derselben ID ruft Gemini nicht erneut auf. Das ist die gewählte Schutzregel gegen eine mögliche Doppelberechnung. Eine Freigabe braucht eine bewusste administrative Prüfung.
- Observe-Standard ist 1 erfolgreiche Analyse pro Woche. Operate wird nur bei aktivem Admin-Entitlement und gesetztem `weeklyLimit` zugelassen; es wurde keine Premiumzahl festgelegt.
- `GEMINI_API_KEY` muss vor Deployment als Firebase Secret eingerichtet werden. Kein Client-Fallback ist vorgesehen.
- Verifiziert: 19/19 Tests, Syntaxprüfung der Functions und Firebase-Build. Kein Push, Deploy, Live-Funktionscheck oder echter Kontingenttest gegen Firebase.

Produktentscheidung: Abgebrochene `processing`-Requests bleiben nach unklarem Provider-Ausgang gesperrt und halten ihre Kontingentreservierung; es gibt keine automatische Wiederholung oder Fristfreigabe. Retention der gecachten Analyseergebnisse muss vor Produktivbetrieb festgelegt werden.

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

## Meilenstein 4 — Wiederaufnahme nach Teilfehlern

Lokal in `journal-dev/dev` umgesetzt, Commit `9e83f4a`:

- Beim Start der Übernahme wird ein versioniertes, validiertes Retry-Payload am Journal-Quellrecord abgelegt. Der Originaltext bleibt nur im normalen Journalfeld; Tags werden aus dem Quellrecord rekonstruiert.
- Bei `applying` nach Reload oder bei `partial` nach Teilfehler erscheint am Eintrag eine Aktion zum erneuten Übernehmen. Sie verwendet dieselbe Request-ID und damit dieselben deterministischen IDs in Nutrition, Habits, Fitness und Relax; Kalender-Events werden über denselben Schlüssel idempotent bestätigt.
- Nach vollständiger Übernahme wird das Retry-Payload wieder entfernt. Es wird nur während eines offenen/unterbrochenen Ablaufs gespeichert.
- Unbekannte Retry-Schema-Versionen werden nicht ausgeführt.
- Verifiziert: 20/20 Testdateien, `git diff --check` und `pnpm run build:firebase` erfolgreich. Kein Push oder Deploy.

## Priorisierter Plan

1. **Gemeinsamer Apply-Kern:** Journal, Nutrition, Habits, Fitness, Relax und Planner sind angebunden; Retry-Payload und Resume-Aktion für offene oder teilweise übernommene Einträge sind umgesetzt.
2. **Skill-Adapter vervollständigen:** Fitness und Relax sind angebunden. Planner-Ziel ist Google Kalender; OAuth-Reautorisierung und Live-Test stehen aus.
3. **Server-KI und Berechtigungen:** Callable, Observe-Kontingent und Operate-Entitlement umgesetzt; offen bleiben Secret-/Live-Einrichtung, Retention und Umgang mit hängenden Requests. Keine automatische Verarbeitung; manuelle Journal-/Skill-Schreibvorgänge bleiben unabhängig vom KI-Kontingent.
4. **Observe/Operate-Hüllen:** Gemeinsame Shell-Editionen und PWA-Builds sind im Feature-Worktree umgesetzt. Offen bleiben der Release-Gitlink auf den aktuellen Journal-Quellstand, Hosting-/Auth-Konfiguration und die schrittweise Ablösung des alten Observe-Prototyps.
5. **Release-/Betriebsnachweis:** Tests und Builds, Firebase Hosting-Sites/Auth-Domains, Store-Datenschutzangaben und optional native Verpackung getrennt verifizieren. Kein Deploy oder Store-Publish ohne passenden Release-Auftrag.

## Meilenstein 5 — gemeinsame Observe-/Operate-PWA-Editionen

Lokal im Feature-Worktree `feat/vos-observe-operate` umgesetzt:

- Die bestehende VitalOS-Shell ist die gemeinsame Produktbasis. `VITE_VOS_EDITION=observe|operate` wählt Produktname, Oberfläche/Theme, Icon, PWA-Manifest und eigenen Service-Worker-Präfix; es gibt keine zweite Kopie der Skill-Apps. Observe nutzt eine eigene horizontale Navigation und öffnet ohne Deep Link die Chronik; Operate nutzt die Aktionsnavigation und öffnet Daily Four.
- Beide Editionen behalten dieselben Shell-Routen und Datenzugriffe für Journal, Fitness, Fuel/Nutrition, Relax, Habits, Plan und die bestehenden Door-/Game-Module. Die kommerzielle Grenze steckt nicht in einer clientseitigen Skill-Sperre; die Callable prüft das Account-Entitlement serverseitig.
- In Observe und Operate öffnet der Journal-Einstieg Journal v2 samt Smart-Log-Schalter; die bisherige Tagesliste bleibt als Wechseloption verfügbar. Eingebettete Journal-Links gehen über die Shell-Navigation.
- `pnpm run build:firebase:observe` und `pnpm run build:firebase:operate` erzeugen `dist-observe/` und `dist-operate/` mit getrennten Icons, Manifesten, Seitentiteln und Service-Workern.
- Für einen gemeinsamen Store-Eintrag gibt es jetzt `pnpm run build:firebase:store`: Das gebrandete VitalOS-Artefakt startet als Observe, lässt zwischen Observe- und Operate-Oberfläche wechseln und speichert diese Gerätepräferenz lokal. Der Wechsel sperrt keine Skills; nur die serverseitige Smart-Log-Berechtigung bestimmt das KI-Kontingent. Das native Capacitor-Projekt selbst ist noch nicht angelegt.
- Beide Editionen wurden mit dem aktuellen lokalen Journal-Stand `c9fd4d8` und Habits-Stand `56ad2db` gebaut. Die integrierten UI-Textmodule für Daily Four, Nutrition, Relax, Fitness und The Voice sind in beiden Bundles vorhanden. Danach wurden die Gitlink-Checkouts auf die vorherigen Integrationsstände `habit-app=09623a8` und `journal-app=adc22d9` zurückgesetzt.
- Verifiziert: nach der editionsspezifischen Navigation `pnpm run build:firebase:observe` und `pnpm run build:firebase:operate` erfolgreich, jeweils 6.888 Module; beide PWA-Stamp-Schritte liefen durch. `node --test packages/mini-app-shell/test/product-edition.test.mjs` besteht. Der vorangegangene gemeinsame Shell-Build mit denselben App-Quellen war ebenfalls erfolgreich. Habits: 3/3 Testdateien bestanden, darunter sieben Daily-Execution-Modelltests und zwei Skill-Datensatzmodelltests. Journal: 21/21 Testdateien bestanden.
- Die resultierende größte JavaScript-Datei ist rund 6,5 MB (1,72 MB gzip); Vite meldet die bestehende große Bundle-Größe. Noch kein Browser-/Gerätetest, keine eingerichteten Hosting-Sites oder Firebase-Auth-Origins, kein Store-Paket und kein Deploy.

## Meilenstein 9 — editionsgetrennter Hosting-Releasepfad

Im Feature-Worktree vorbereitet:

- `.github/workflows/deploy-vos-edition.yml` ist ausschließlich manuell startbar und bricht ab, wenn der ausgewählte Ref nicht `master` ist. Observe und Operate werden einzeln gebaut; der Deploy-Befehl zielt auf genau `hosting:observe` oder `hosting:operate` und führt weder Functions noch Firestore-Regeln aus. Er verweigert außerdem explizit `fitness-aos` als Zielprojekt.
- Projekt-ID, Shell-/Edition-Site-IDs, Webkonfiguration, VAPID-Key und Service-Account kommen ausschließlich aus GitHub-Variablen/Secret (`VOS_FIREBASE_PROJECT_ID`, `VOS_SHELL_SITE_ID`, `VOS_OBSERVE_SITE_ID`, `VOS_OPERATE_SITE_ID`, `VOS_FIREBASE_WEB_CONFIG`, `VOS_FIREBASE_VAPID_KEY`, `VOS_FIREBASE_SERVICE_ACCOUNT`). Produkt-Builds übernehmen damit auch die Firebase-Identität der App statt nur auf eine andere Hosting-Site zu deployen; `fitness-aos` wird fail-closed abgewiesen.
- `scripts/edition-firebase-config.mjs` erzeugt je Edition eine kurzlebige Hosting-Konfiguration aus den vorhandenen Rewrite-/Header-Regeln. Die `target:apply`-Zuordnung geschieht nur im CI-Checkout; generierte Konfigurationen sind ignoriert und werden nicht committed.
- Verifiziert: Generator-Test prüft beide Editionen, getrennte Build-Verzeichnisse, gemeinsame Hosting-Rewrites/Header und Ablehnung ungültiger Editionen; `node --check` und YAML-Parsing bestanden. Kein Projektzugriff, Site-Setup, Push oder Deploy.
- Offen: Hosting-Sites und GitHub-Variablen/Secret im neuen Projekt einrichten; danach GitHub Actions gegen genau dieses Projekt abnehmen. Der Workflow selbst wurde hier nicht remote ausgeführt.

## Meilenstein 11 — Produkt-Firebase-Konfiguration für Shell und Editions

- `firebase.config.js` behält das private Projekt nur für unqualifizierte lokale Builds. Produkt-Builds müssen explizit `VITE_VOS_PRODUCT_BUILD=1` setzen und eine vollständige Firebase-Webkonfiguration, passende Projekt-ID sowie den eigenen VAPID-Key liefern. Fehlende, widersprüchliche oder auf `fitness-aos` zeigende Werte brechen den Build ab.
- Der Firebase-Build leitet auch relative Konfigurationsimporte aus Habit-, Journal-, Fitness-, Fuel-, Relax- und Plan-Modulen auf dieselbe Shell-Konfiguration um; damit bleiben Auth, Firestore und Push nicht teilweise am privaten Projekt hängen.
- `deploy-shell.yml` und `deploy-vos-edition.yml` nutzen die neuen `VOS_FIREBASE_*` GitHub-Werte, prüfen die Zielprojekt-ID und Service-Account-Projektzuordnung und verweigern `fitness-aos`. Die Shell-Site wird über `VOS_SHELL_SITE_ID` auf das Zielprojekt gemappt.
- Noch nicht möglich: ein echter Produkt-Build/Deploy ohne neues Firebase-Projekt und die genannten Variablen/Secret. `.firebaserc` bleibt lokal auf das private Projekt ausgerichtet; andere legacy/private Workflows wurden nicht pauschal umgestellt.

## Meilenstein 12 — Firebase-Isolation als Build-Gate

- Jeder Firebase-Produktbuild (`core`, `store`, `observe`, `operate`) prüft das erzeugte Bundle vor dem PWA-Stamping. Der Build schlägt fehl, wenn private API-Key-, Storage-, Sender-, App- oder VAPID-Werte beziehungsweise eine private `authDomain`-/`projectId`-Konfiguration gefunden werden.
- Der Guard prüft auch, dass alle Werte der konfigurierten Produkt-Web-App und der Produkt-VAPID-Key tatsächlich im Artefakt vorhanden sind.
- Verifiziert: vollständiger `pnpm run build:firebase:store` mit isolierten Dummy-Werten, einschließlich Daten-Assets und Messaging-Service-Worker-Umschreibung; der Guard bestand. Validator-Tests, Edition-Konfigurationstest und Syntaxprüfungen bestanden.
- In vorhandenem Fitness-Code bleibt eine reine Hostname-Prüfung auf frühere `fitness-aos`-Domains für den Legacy-API-Routingpfad. Das ist kein Firebase-Konfigurationsobjekt; die privaten Web-App- und Push-Werte werden vom Bundle-Gate geprüft und ausgeschlossen.
- Kein Projektzugriff, echter Auth-Test, Push, Deploy oder Geräte-Test.

## Meilenstein 10 — ein Store-Build mit zwei Oberflächen

- `VITE_VOS_EDITION=store` ist ein einzelnes VitalOS-Artefakt mit Observe als Standardmodus. Nutzer können die Observe-/Operate-Oberfläche über dieselbe sichtbare Umschaltung in Anmeldung und Shell wechseln; die Auswahl wird im lokalen Gerätespeicher wiederhergestellt.
- Moduswahl und Premium-Entitlement sind getrennt: Die Ansichtsumschaltung ändert nur Navigation, Einstieg, Marke und Theme. Sie verleiht kein Operate-KI-Kontingent; das bleibt in der Callable serverseitig.
- Die festen `observe`- und `operate`-PWA-Builds bleiben jeweils eigenständig gebrandet und werden durch eine gespeicherte Store-Auswahl nicht überschrieben.
- Verifiziert: komplette Shell-Testsuite (34/34), inklusive Store-Standard, Wiederherstellung und gesperrter Überschreibung in festen Edition-Builds; `pnpm run build:firebase:store` erfolgreich (5.651 Module), generisches `VitalOS`-Manifest, Modus-Schalter und lokaler Speicher-Key im gebauten Bundle. Noch kein Browser-/Gerätetest oder nativer Build.

`vos-observe/` im Meta-Repo bleibt bis zu einer späteren Migration der bisherige unabhängige Check-in-Prototyp. Ein eigenständiges Verzeichnis `vos-operate/` wurde nicht angelegt; die neue Variante ist ein Build derselben Shell.

## Meilenstein 6 — Edition-Builds gegen den aktuellen Journal-Quellstand

- Die vorherigen Edition-Builds belegten bereits Request-ID-Retry und den Google-Kalender-Schreib-Scope. Die aktuellen Builds enthalten außerdem die serverseitige Sperre für unklare Gemini-Ergebnisse und den kontextbezogenen The-Voice-Einstieg.
- Vite meldet weiter eine größte JS-Datei von rund 6,5 MB (1,72 MB gzip) sowie bestehende dynamisch/statische Importwarnungen.
- Live-Audit des bisherigen privaten Projekts `fitness-aos` (read-only, Firebase-Konto `nimmsel23@gmail.com`): Google-Verbindungs-Functions sind aktiv; Secret Manager führt `GOOGLE_OAUTH_CLIENT_SECRET`. `analyzeSmartLog` ist dort nicht aktiv; `GEMINI_API_KEY` ist nicht vorhanden.
- Das Zielkonto `nimmdaniel@gmail.com` hat in der sichtbaren Google-Cloud-Projektliste noch kein VitalOS-Projekt. Das lokale Firebase-CLI-Konto ist nun auf dieses Zielkonto gesetzt. Kein Projekt angelegt, keine Secrets geändert, keine Sites oder Functions deployed.
- Ein offizielles Produktprojekt kann daher nicht den Live-Pfad des privaten `fitness-aos` übernehmen. Vor dem ersten Produkt-Deploy müssen feste Projekt-ID und Firestore-Standort gewählt, das Projekt eingerichtet und Hosting, Auth, OAuth, Secrets, IAM und CI darauf ausgerichtet werden.

## Offene technische Abhängigkeiten

- `journal-dev/functions` (Codebase `journal`) ist als einzige Quelle der Smart-Log-Callable gewählt. Vor Release weiterhin den Live-Funktionsbestand prüfen, damit kein zweiter Callable-Owner entsteht.
- Das lokale Firebase-CLI-Konto ist auf `nimmdaniel@gmail.com` gesetzt. Das bisherige private Projekt `fitness-aos` bleibt davon getrennt; seine existierenden Sites/Functions und privaten Daten werden nicht ungefragt umgezogen.
- Das neue VitalOS-Projekt ist noch nicht angelegt. Die Shell und mehrere bestehende Workflows haben `fitness-aos` weiterhin hart als Projektziel; das muss vor dem offiziellen Build-/Deploy-Weg explizit auf das neue Produktprojekt ausgerichtet werden.
- `analyzeSmartLog` und `GEMINI_API_KEY` fehlen im Live-Projekt `fitness-aos`. Für das neue Projekt sind Callable-Deployment, Secret, IAM, Kontingent-Konfiguration und Store-Auth-Domains einzurichten.
- Google Calendar benötigt für das Schreiben den zusätzlichen OAuth-Scope `calendar.events.owned`; bestehende Verbindungen müssen diesen Scope nach ausdrücklicher Einwilligung neu autorisieren. Für öffentlichen Store-Betrieb sind Googles OAuth-Verifikation und die finalen Consent-Angaben zu prüfen.
- `observe-vos` ist bisher nur in `vos-observe/firebase.json` als Ziel eingetragen; die tatsächliche Firebase Hosting-Site und der Firebase-Auth-Authorized-Domain-Eintrag sind nicht verifiziert.
- Das vorhandene Journal-Submodul muss zum Release-Zeitpunkt nach dem aktuellen PR-/Merge-Weg aus `journal-dev/dev` integriert werden; der aktuelle lokale Gitlink ist älter als der Journal-Quellcheckout.

## Meilenstein 7 — Smart-Log-Request an Eingabe binden

Lokal in `journal-dev/dev`, Commit `3580ce4`:

- Jede serverseitige Request-ID wird mit einem SHA-256-Fingerprint aus Freitext, Datum, Tags und Habit-Auswahl gebunden.
- Ein Aufruf mit derselben ID, aber geändertem Inhalt wird vor Cache-Rückgabe oder neuer Gemini-Verarbeitung mit `smart_log_request_id_conflict` abgewiesen. Damit kann eine zwischengespeicherte Analyse nicht versehentlich einem geänderten Entwurf zugeordnet werden.
- Bereits vorhandene Request-Dokumente ohne Fingerprint bleiben lesbar; neue beziehungsweise erneut verarbeitete Requests erhalten den Fingerprint.
- Verifiziert: vollständige Journal-Testsuite, 21/21 Testdateien bestanden; `git diff --check` erfolgreich. Keine Live-Daten verändert, kein Push oder Deploy.

## Meilenstein 8 — Observe-Wochenkontingent regressionssicher prüfen

Lokal in `journal-dev/dev`, Commit `7d95e3e`:

- Ein zusätzlicher Test bestätigt, dass nach einem erfolgreichen Observe-Smart-Log in derselben ISO-Woche ein neuer Request vor dem Gemini-Aufruf mit `resource-exhausted` abgelehnt wird.
- Der Test prüft zugleich, dass der Provider für den abgelehnten zweiten Request nicht aufgerufen wird. Normale Journal-Speicherung liegt weiterhin außerhalb dieses Callable-Kontingentpfads.
- Verifiziert: vollständige Journal-Testsuite, 21/21 Testdateien bestanden; `git diff --check` erfolgreich. Keine Live-Daten verändert, kein Push oder Deploy.
