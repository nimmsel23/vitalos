# Plan: Veröffentlichung im Apple App Store und bei Google Play

Stand: 15. Oktober 2026. Status: Zukunftsplan; keine Store-Veröffentlichung gestartet.

## Ziel und Ausgangslage

Eine bestehende VitalOS-App als eigenständig nutzbare iOS- und Android-App veröffentlichen. Den React-/Firebase-Unterbau möglichst weiterverwenden. Anschließend den erprobten Ablauf auf weitere Apps übertragen.

Die bisher geprüften package.json-Dateien von VitalOS, Habit und Journal enthalten Web-/PWA-Builds mit Vite und Firebase. Ein nativer Store-Build ist darin noch nicht eingerichtet. Dies ist kein vollständiger Audit aller Apps oder vorhandener Entwicklerkonten.

Vorschlag für den Pilot: Habit, zunächst kostenlos, ohne In-App-Käufe. Auswahl und Geschäftsmodell sind noch offen. Auch eine kostenlose App muss sämtliche einschlägigen Datenschutz- und Store-Anforderungen erfüllen.

## 1. Umfang und Verantwortlichkeit festlegen

- [ ] Pilot-App und deren eigenständigen Funktionsumfang wählen.
- [ ] Entscheiden: einzelne App oder gesamte VitalOS-Shell als Store-Produkt.
- [ ] App-Name, Anbieter, Support-Adresse, Zielgruppe und Veröffentlichungsländer festlegen.
- [ ] Privatperson oder Organisation als Kontoinhaber bestimmen; Verifizierung und gegebenenfalls D-U-N-S einplanen.
- [ ] Geschäftsmodell entscheiden. Bei digitalen Käufen/Abos die zu diesem Zeitpunkt geltenden Store-Zahlungsregeln vor Implementierung prüfen.
- [ ] Quellrepo und Eigentümer der nativen Projekte bestimmen; keine zweite unabhängig gepflegte Kopie der App erzeugen.

Ergebnis: kurzer Produktsteckbrief mit verbindlichem Umfang für Version 1.

## 2. Konten, Geräte und Budget vorbereiten

| Voraussetzung | Apple | Google |
| --- | --- | --- |
| Entwicklerkonto | Apple Developer Program; derzeit 99 USD/Jahr | Play Console; derzeit 25 USD einmalig |
| Build-Umgebung | Mac mit unterstütztem Xcode oder geeigneter macOS-Build-Dienst | Android Studio, JDK und Android SDK |
| Testgeräte | echtes iPhone; iPad bei angebotener Unterstützung | echtes Android-Gerät; weitere Geräte/Emulatoren nach Zielgruppe |
| Vorabverteilung | TestFlight | interner und geschlossener Test |

- [ ] Konten und Identität verifizieren; Zwei-Faktor-Authentifizierung und Wiederherstellungszugang sichern.
- [ ] Für EU-Vertrieb Händlerstatus und erforderliche Anbieterangaben in den jeweiligen Konsolen klären.
- [ ] Signierschlüssel, Zertifikate und Zugriffsrechte sicher verwalten; keine Geheimnisse ins Git-Repo.
- [ ] Laufende Kosten für Backend, Domain, Support und gegebenenfalls Build-Dienst kalkulieren.
- [ ] Bei neuem persönlichen Google-Konto die Testgruppe früh organisieren: Für nach dem 13. November 2023 erstellte Konten derzeit mindestens 12 durchgehend angemeldete Tester über mindestens 14 Tage; anschließend Produktionszugang beantragen. Erfüllung der Frist allein garantiert keine Freigabe.

## 3. Technische Machbarkeit prüfen

Bevor ein Wrapper eingebaut wird, die gewählte App vollständig auf einem fremden Mobilgerät und mit einem neuen Nutzerkonto durchgehen.

- [ ] Alle Funktionen und Abhängigkeiten inventarisieren: Firebase, lokale APIs, KI-Dienste, Uploads, Export, Erinnerungen und externe Links.
- [ ] Lokale Rechner, localhost, private Netzwerke und persönliche Laufzeitdaten als Voraussetzung ausschließen oder eine klar definierte öffentliche Alternative bereitstellen.
- [ ] Firebase-Regeln und Backend-Authentifizierung auf Nutzertrennung prüfen; fremde Konten dürfen keine Daten lesen oder schreiben.
- [ ] Registrierung, Login, Passwort-/Kontowiederherstellung, Abmelden und Löschung prüfen.
- [ ] Offline-Verhalten, Synchronisation, Konflikte und Wiederanlauf nach Prozessende bestimmen.
- [ ] Eigenständigen App-Build ohne unnötige Module der gesamten Shell sicherstellen.

Ergebnis: dokumentierte Lückenliste. Erst danach Aufwand und Zieltermin schätzen.

## 4. Native App erstellen

Vorgeschlagener Ansatz: Capacitor für den vorhandenen Web-Unterbau. Die Entscheidung nach dem Machbarkeitstest bestätigen; ein vollständiger Rewrite ist vorerst nicht geplant.

- [ ] Unterstützte Capacitor-/Plugin-Versionen auswählen und iOS-/Android-Projekte im festgelegten Quellrepo anlegen.
- [ ] Gebaute Web-Assets im App-Paket ausliefern; Update-Verhalten und Service Worker im nativen Container ausdrücklich prüfen.
- [ ] Dauerhafte Bundle-ID/Android applicationId, Versionsschema und Build-Nummern festlegen.
- [ ] Icons, Startbildschirm, Safe Areas, Tastaturverhalten und Android-Zurücknavigation umsetzen.
- [ ] Firebase-Projekt um die passenden Plattform-Registrierungen ergänzen; Bundle-IDs, Signatur-Fingerprints und Rücksprung-URLs korrekt konfigurieren.
- [ ] Login für den nativen Container umsetzen; Browser-Popup-Verhalten nicht ungeprüft übernehmen.
- [ ] Bei Social Login Apples Richtlinie 4.8 prüfen; gegebenenfalls Sign in with Apple als gleichwertige Alternative integrieren.
- [ ] Deep Links, externe Browserlinks, Freigaben und Dateiexporte auf beiden Plattformen testen.
- [ ] Berechtigungen nur für tatsächlich genutzte Funktionen anfordern und begründen.
- [ ] Falls Erinnerungen Teil des Produkts sind: lokale Benachrichtigungen und Zeitzonen testen; Push separat planen.
- [ ] Signierten iOS-Archiv-Build und Android App Bundle (AAB) reproduzierbar erstellen.

Abnahme: Installation und Kernfunktionen funktionieren auf echten Geräten ohne Entwicklerrechner.

## 5. Datenschutz und Store-Konformität herstellen

- [ ] Dateninventar erstellen: Datenarten, Zwecke, Speicherung, Aufbewahrung, Löschung und Drittanbieter einschließlich aller SDKs.
- [ ] Öffentliche Datenschutzerklärung und Support-Seite bereitstellen; Anbieterangaben und gegebenenfalls erforderliche Einwilligungen prüfen.
- [ ] Kontolöschung innerhalb der App anbieten, wenn Konten angelegt werden können. Zugehörige Daten mit abdecken, nicht nur Firebase Auth löschen.
- [ ] Für Google zusätzlich einen öffentlich erreichbaren Web-Weg zur Beantragung der Kontolöschung bereitstellen.
- [ ] Apple App Privacy und Google Data Safety passend zum tatsächlichen Verhalten ausfüllen.
- [ ] Apple Privacy Manifests, Required Reason APIs und eingesetzte SDKs prüfen; Tracking-Erlaubnis nur bei einschlägigem Tracking vorsehen.
- [ ] Bei Google die Health apps declaration ausfüllen; Gesundheits-/Fitnessfunktionen korrekt zuordnen.
- [ ] Bei Fitness, Fuel oder gesundheitsbezogenen Inhalten zusätzliche Anforderungen prüfen; medizinische Aussagen und sensible Daten bewusst bewerten.
- [ ] Altersfreigabe und Zielgruppe festlegen; zusätzliche Anforderungen bei Kindern oder nutzergenerierten Inhalten prüfen, sofern zutreffend.
- [ ] Apple-Mindestfunktionalität prüfen: eigenständiger Nutzen und gute mobile Bedienung. Ein Wrapper oder eine einzelne native Funktion garantieren keine Annahme.

## 6. Beta und Veröffentlichung

Gemeinsame Abnahme für beide Plattformen:

- [ ] Neuinstallation, Update und Datenmigration funktionieren.
- [ ] Neuer Nutzer, bestehender Nutzer und mindestens zwei getrennte Konten getestet.
- [ ] Login-Rücksprung, Token-Erneuerung und erneute Anmeldung nach App-Neustart funktionieren.
- [ ] Kernablauf mit und ohne Netz sowie nach Hintergrundbetrieb getestet.
- [ ] Berechtigung verweigern/widerrufen und Fehlerzustände ergeben verständliche Rückmeldungen.
- [ ] Datenspeicherung, Export und vollständiger Löschablauf geprüft.
- [ ] Bedienung mit großer Schrift und Screenreader sowie kleine Displays geprüft.
- [ ] Keine bekannten blockierenden Fehler; Support- und Fehlerdiagnoseweg vorhanden.

Apple:

- [ ] Aktuelle Xcode-/SDK-Mindestversion und Review-Richtlinien unmittelbar vor Upload erneut prüfen.
- [ ] TestFlight-Build verteilen; bei externem Test gegebenenfalls Beta App Review durchlaufen.
- [ ] Store-Eintrag mit Screenshots, Beschreibung, Altersfreigabe, Datenschutz und Support vervollständigen.
- [ ] Funktionierendes Review-Konto und konkrete Prüfanleitung hinterlegen; Backend erreichbar halten.
- [ ] Zur Prüfung einreichen; Rückfragen und Ablehnungen bearbeiten.
- [ ] Nach Freigabe ersten Release bewusst veröffentlichen und Funktion live prüfen.

Google:

- [ ] Aktuelle Target-API-, Signierungs- und Plattformanforderungen prüfen; bei nativen Bibliotheken auch geltende Kompatibilitätsvorgaben berücksichtigen.
- [ ] Play App Signing einrichten und Upload-Schlüssel sichern.
- [ ] AAB intern testen; anschließend erforderlichen geschlossenen Test durchführen.
- [ ] Soweit erforderlich Produktionszugang beantragen.
- [ ] Store-Eintrag, App-Zugang für Reviewer, Data Safety, Health-Erklärung und Inhaltsfreigaben vervollständigen.
- [ ] Zur Prüfung einreichen; nach Freigabe veröffentlichen und Store-Installation live prüfen.

## 7. Release und Betrieb dauerhaft organisieren

- [ ] Pro Release Quellcommit, native Build-Nummer, Konfiguration und Store-Status dokumentieren.
- [ ] Vorhandenen Quell-/Integrationsweg über `bin/vos-release` beibehalten. Dieser ersetzt weder native Builds noch TestFlight-/Play-Uploads.
- [ ] Bei Submodule-Änderungen zuerst im Subrepo committen und pushen, danach Parent-Pointer committen. Parent-Push bleibt separat.
- [ ] Signierte Artefakte und Debug-Symbole sicher aufbewahren; Geheimnisse über Secret-Verwaltung bereitstellen.
- [ ] Update-Kompatibilität des Backends mit älteren installierten App-Versionen sicherstellen.
- [ ] Fehler nach Release beobachten, Support beantworten und bei Problemen Rollout stoppen beziehungsweise korrigierten Build liefern. Installierte Store-Versionen lassen sich nicht wie ein Web-Deploy einfach zurücksetzen.
- [ ] Regelmäßig SDKs, Store-Fristen, Datenschutzangaben und Kontoverlängerungen prüfen.

## Empfohlene Reihenfolge und offene Entscheidungen

1. Pilot auswählen und technischen Veröffentlichungscheck durchführen.
2. Konten, Geräte und Google-Testgruppe parallel vorbereiten.
3. Gemeinsamen Capacitor-Unterbau und vollständigen Kernablauf auf iPhone und Android nachweisen.
4. Datenschutz und Kontolöschung abschließen.
5. TestFlight und Google-Test durchführen; Veröffentlichung je nach Bereitschaft separat freigeben.
6. Nach dem ersten stabilen Release weitere Apps übernehmen.

Noch offen: Pilot-App, Anbieteridentität, Mac-/iPhone-Verfügbarkeit, vorhandene Entwicklerkonten, Geschäftsmodell, Zielregionen und konkrete Backend-Lücken. Dieser Plan beauftragt keine Kontoeröffnung, Zahlung, Bereitstellung privater Daten oder Store-Einreichung.

## Offizielle Quellen

Anforderungen ändern sich. Gebühren und Testvorgaben wurden für diesen Plan recherchiert; sämtliche konkreten Anforderungen zum Implementierungs- und Einreichungszeitpunkt erneut prüfen.

- [Capacitor: Überblick](https://capacitorjs.com/docs) und [Entwicklungsumgebung](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Apple Developer Program und Gebühren](https://developer.apple.com/programs/)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple: aktuelle Einreichungsanforderungen](https://developer.apple.com/app-store/submitting/)
- [Apple: Kontolöschung](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
- [Apple: Datenschutzangaben](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple: EU-Händlerstatus](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/)
- [Google: Entwicklerkonto und Gebühren](https://support.google.com/googleplay/android-developer/answer/6112435)
- [Google: Testanforderungen für neue persönliche Konten](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google: Kontolöschung](https://support.google.com/googleplay/android-developer/answer/13327111)
- [Google: Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Google: Health apps declaration](https://support.google.com/googleplay/android-developer/answer/14738291)
- [Google: Target-API-Anforderungen](https://support.google.com/googleplay/android-developer/answer/11926878)
