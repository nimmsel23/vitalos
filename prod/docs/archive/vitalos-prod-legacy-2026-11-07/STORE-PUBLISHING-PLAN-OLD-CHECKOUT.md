# Plan: Veröffentlichung im Apple App Store und bei Google Play

> **Aktueller Prüfstand, 6. November 2026:** Die nachfolgenden Abschnitte enthalten historische Bestandsaufnahmen. Das Android-SDK ist inzwischen vorhanden; das Fitness-TWA-Debug-APK wurde gebaut und auf `emulator-5554` installiert. Ein funktionsfähiger App-Durchlauf ist nicht nachgewiesen: Die Systemoberfläche des Emulators reagierte nicht, und `https://vitalos-fitness-prod.web.app/` lieferte bei der aktuellen Prüfung HTTP 404. Für die gemeinsame VitalOS-App ist damit kein Android- oder iOS-Releasekandidat belegt. Der manuelle Habits-Transaktionstest besteht, prüft jedoch keinen Offline-Ablauf; `runTransaction` benötigt eine Verbindung. Die Einträge in `PRODUCT-CHECKOUT.md` beschreiben neuere Produkt-Auth- und Hosting-Schritte als die historischen Angaben unten.

Stand: 3. November 2026. Status: Zukunftsplan; keine Store-Veröffentlichung gestartet.

> **Aktualisierung vom 4. November:** Die folgenden ursprünglichen Bestandsangaben sind teilweise überholt. Die Produkt-Firestore-Regeln wurden für `vitalos-prod` ausgerollt und gegen die bereitgestellte Quelle geprüft. Ein Fitness-VOS-TWA-Projekt mit vorläufiger Paketkennung `at.vitalos.fitness`, Debug-APK und unsigniertem Release-AAB wurde lokal gebaut; eine Geräteabnahme, Signierung, Digital Asset Links und Store-Veröffentlichung fehlen. Android-SDK und Build-Tools sind installiert. Der Produkt-Hosting-Build ist noch nicht veröffentlicht. Aktuelle technische Details und verbleibende Freigaben stehen in [PRODUCT-CHECKOUT.md](PRODUCT-CHECKOUT.md); insbesondere sind die neuen Skill-Stände noch nicht in den Produkt-Gitlinks enthalten. Die ältere Beschreibung unten dokumentiert den damaligen Stand und ist keine aktuelle Release-Freigabe.

## Ziel und Ausgangslage

VitalOS schrittweise als eigenständig nutzbares Produkt veröffentlichen und den React-/Firebase-Unterbau weiterverwenden. Die gemeinsame Observe-/Operate-Shell bleibt das langfristige Produktziel. Als möglicher erster Android-Store-Pilot wurde Fitness-VOS solo als TWA vorgeschlagen; das wäre eine separate, klar abgegrenzte Produktschiene und ersetzt weder die private VitalOS-PWA noch die langfristige VitalOS-Shell.

Die bisher geprüften package.json-Dateien von VitalOS, Habit und Journal enthalten Web-/PWA-Builds mit Vite und Firebase. Ein nativer Store-Build ist darin noch nicht eingerichtet. Dies ist kein vollständiger Audit aller Apps oder vorhandener Entwicklerkonten.

Produktvorgabe für den Pilot: VitalOS mit den Editionen **Observe** (kostenlos) und **Operate** (Premium). Beide teilen dieselbe Produktbasis und denselben Skill Stack. Der festgelegte Funktionsunterschied ist das KI-Smart-Logging-Kontingent; Planner, The Voice, The Game und manuelle Tracker bleiben zugänglich. Observe enthält einen erfolgreichen Smart Log pro ISO-Woche; Operate erhält ein serverseitig konfiguriertes höheres Kontingent. Preis und Premium-Limit sind noch offen.

Für Observe und Operate bleibt ein gemeinsamer VitalOS-Eintrag die bisherige Empfehlung: ein Premium-Abo erhöht nur das KI-Kontingent. Zwei separate Observe-/Operate-Listings hätten bei gleichem Skill Stack ein Duplikat-/Repetitive-Content-Risiko. Davon getrennt ist die vorgeschlagene Fitness-VOS-solo-TWA als möglicher erster Android-Pilot. Die vorhandene `vos-fitness/`-PWA besitzt bereits einen eigenen Pulse-Einstieg und ein Manifest, aber im geprüften Stand noch kein TWA-Android-Projekt und keine Digital-Asset-Links-Verknüpfung. Eine TWA benötigt die verifizierte Zuordnung zwischen Android-App und kontrollierter Website. Die private `vitalos.web.app`-PWA bleibt auf `fitness-aos`; die bestehende `vos-fitness/`-Deploymentkonfiguration zeigt ebenfalls auf `fitness-aos` und muss für einen Store-Build getrennt werden. `vitalos-prod` stellt derzeit `https://vitalos-prod.web.app` als separates Hosting-Ziel bereit. Ein TWA-Einstieg wäre Android-only; der iOS-App-Store-Pfad für VitalOS bleibt davon unabhängig.

Produktionsvorgabe: Offizielle VitalOS-Releases laufen über `nimmdaniel@gmail.com` und das separate Projekt `vitalos-prod`. `fitness-aos` bleibt die private PWA und wird nicht umbenannt oder als Produkt-Release-Projekt wiederverwendet. `vitalos-prod` ist mit Firebase verknüpft, hat die Default-Hosting-Site `vitalos-prod.web.app`, die Web-App `VitalOS Product Web` sowie eine `(default)`-Firestore-Datenbank in `eur3` (Standard-Edition, Löschschutz aktiv). Firestore-Regeln sind noch geschlossen; Auth-/Hosting-Buildwerte, ein projektbezogener FCM-VAPID-Key und ein Deploy fehlen. Billing wurde nicht aktiviert. Die TWA-Appkennung bleibt offen. Nutzer verbinden Google Kalender einmal ausdrücklich; der Refresh-Token wird serverseitig gespeichert und erneuert. Seit `journal-dev`-Commit `4cf5781` verweigern offizielle VitalOS-Produktbuilds den kurzlebigen Popup-Fallback und verwerfen vorhandene Popup-Tokens; ohne erreichbare serverseitige Token-Function gilt die dauerhafte Verbindung als nicht eingerichtet. Ein OAuth-Consent-Screen im Status „Testing“ ist kein dauerhafter Produktivbetrieb: Google lässt dessen Refresh-Tokens nach sieben Tagen ablaufen. OAuth-Client, benötigte Scopes, Consent-Screen-Status und gegebenenfalls Googles OAuth-Verifikation müssen im Produktprojekt eingerichtet werden. Beim Wechsel vom privaten Projekt zum Produktprojekt braucht jeder betroffene Nutzer einmal eine neue Einwilligung; Refresh-Tokens werden nicht zwischen Projekten migriert.

## 1. Umfang und Verantwortlichkeit festlegen

- [x] Produktumfang: VitalOS-Shell mit Observe (kostenlos) und Operate (Premium nur für mehr KI-Smart-Logging) als gemeinsamer Skill Stack.
- [x] Gemeinsamer VitalOS-Store-Build mit wählbarer Observe-/Operate-Oberfläche; die Ansichtsumschaltung paywallt keine Skills.
- [ ] Native Paketierung und Store-Produkt einrichten. Separate Listings nur bei substanziell eigenständigem Funktionsumfang und vorheriger Richtlinienprüfung erwägen. [Apple 4.3](https://developer.apple.com/app-store/review/guidelines/), [Google Repetitive Content](https://support.google.com/googleplay/android-developer/answer/9899034).
- [ ] App-Name, Anbieter, Support-Adresse, Zielgruppe und Veröffentlichungsländer festlegen.
- [ ] Privatperson oder Organisation als Kontoinhaber bestimmen; Verifizierung und gegebenenfalls D-U-N-S einplanen.
- [ ] Preis, Abrechnungszeitraum und höheres Operate-Kontingent entscheiden; keine festen Werte sind derzeit autorisiert.
- [ ] Premium-Kauf für native Apps integrieren: Apple In-App Purchase und Google Play Billing sind für digitale In-App-Funktionen der Regelweg. Abweichende regionale Programme/Entitlements müssen für Zielregion und Einreichungszeitpunkt konkret geprüft werden. Siehe [Apple Guideline 3.1](https://developer.apple.com/app-store/review/guidelines/) und [Google Play Payments](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en).
- [ ] Kaufstatus serverseitig validieren und als VitalOS-Account-Entitlement bereitstellen, das die Smart-Log-Callable prüft. Ablauf, Kündigung, Erstattung, Wiederherstellung und Geräte-/Plattformwechsel abbilden; Clientzustand allein darf Operate nicht freischalten.
- [ ] Quellrepo und Eigentümer der nativen Projekte bestimmen; keine zweite unabhängig gepflegte Kopie der App erzeugen.
- [x] Produktionskonto festgelegt: `nimmdaniel@gmail.com`; Ziel ist ein frisches VitalOS-Firebase-Projekt, getrennt von `fitness-aos`.
- [x] Projekt-ID `vitalos-prod` unter `nimmdaniel@gmail.com` anlegen und Firebase aktivieren; die Default-Hosting-Site ist vorhanden.
- [x] Firestore-Standort `eur3` gewählt und `(default)`-Datenbank in Standard-Edition mit Löschschutz angelegt.
- [x] Gemeinsame Firebase-Web-App `VitalOS Product Web` registriert.
- [ ] Firestore-Regeln, Auth-Domains, erforderliche APIs/Functions, OAuth und CI ausschließlich für das Produktprojekt konfigurieren. Die Workflows erwarten `VOS_FIREBASE_PROJECT_ID`, `VOS_SHELL_SITE_ID`, `VOS_OBSERVE_SITE_ID`, `VOS_OPERATE_SITE_ID`, `VOS_FIREBASE_WEB_CONFIG`, `VOS_FIREBASE_VAPID_KEY` und `VOS_FIREBASE_SERVICE_ACCOUNT`; bis diese Produktwerte gesetzt sind, verweigern sie einen Live-Deploy.
- [ ] Fitness-VOS-solo-TWA als Android-Pilot technisch anlegen: endgültige Paketkennung festlegen, PWA auf einer getrennten Produkt-Hosting-Origin bereitstellen, Bubblewrap/TWA-Projekt erzeugen und Digital Asset Links mit dem endgültigen Play-App-Signierschlüssel veröffentlichen. Nicht `fitness-aos` als Store-Ziel verwenden.
- [ ] Google-Kalender-Verbindung für den neuen Stack produktionsreif einrichten: serverseitige Refresh-Token-Functions, dauerhaft konfigurierte OAuth-Zustimmung (nicht „Testing“), Kalender-Lese-/Schreib-Scopes und erneute Nutzereinwilligung im neuen Projekt verifizieren.

Ergebnis: Store- und Billing-Steckbrief mit verbindlichem App-Schnitt, Tarifmodell und Ende-zu-Ende-Entitlement-Vertrag.

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

### Lokale Bestandsaufnahme (2026-11-03)

- Die VitalOS-Shell (`package.json`, Feature-Worktree `feat/vos-observe-operate`) hat bereits Capacitor 8.6.0, `capacitor.config.json` mit `com.vitalos.app`, `android/`- und `ios/`-Projekte sowie einen `build:native`-Pfad. Das ist ein lokaler Capacitor-Unterbau für die gemeinsame VitalOS-Shell; es ist keine TWA und kein nachgewiesenes Store-Artefakt.
- Die bestehende `vos-fitness/`-PWA ist ein eigenständiger Fitness-VOS-Einstieg mit Pulse-Oberfläche und Manifest. Ein Android-TWA-Projekt, die endgültige Paketkennung und Digital Asset Links sind dafür noch nicht eingerichtet. Die TWA-Idee für Fitness-VOS solo ist ein separater Android-Pilot und darf nicht mit dem Capacitor-Projekt `com.vitalos.app` verwechselt werden.
- Im getrennten Submodul `6pack-app` gibt es einen nutzbaren technischen Präzedenzfall: Capacitor `8.5.3`, `android/` und `ios/App`, `build:native`, `cap sync` und einen manuell startbaren CI-Build für Debug-APK/iOS-Simulator. Das ist ein eigenständiges 6Pack-Produkt mit eigener `appId` (`at.vitalos.sixpack`) und eigenem Build; keine dieser Projekte oder IDs darf als VitalOS-Produkt übernommen werden.
- Die Shell initialisiert Firebase zentral in `src/cloud/firebase.js`; `src/cloud/db.firestore.js` verwendet Google-Popup-Login für die Firebase-Identität. Google-Kalender-OAuth ist davon getrennt: Im offiziellen VitalOS-Produktbuild verlangt `journal-dev` seit Commit `4cf5781` den serverseitigen Refresh-Token-Modus und erlaubt keinen kurzlebigen Popup-Fallback. Fitness hält zusätzlich einen Redirect-Fallback für blockierte Popups. Das ist noch kein Nachweis für Google-OAuth in einem Capacitor-WebView. Die native 6Pack-Dokumentation weist ausdrücklich nur E-Mail-/Passwort-Login aus und schließt natives Google-OAuth aus.
- Die lokale Entwicklungsumgebung hat Java/Javac, aber in dieser Sitzung keine auffindbaren Befehle `adb`, `sdkmanager`, `gradle` oder `xcodebuild`. Native Android-/iOS-Gerätebuilds können deshalb lokal nicht abgenommen werden. Der bestehende 6Pack-CI-Workflow ist eine mögliche Vorlage für getrennte native Build-Jobs.
- Das separate Produkt-Firebase-Projekt `vitalos-prod` ist angelegt und mit Firebase verknüpft. Die lokale `.firebaserc` zeigt weiterhin auf `fitness-aos`, das für die private PWA bestehen bleibt. Vor einem Produktbuild muss die Zielkonfiguration explizit auf `vitalos-prod` zeigen. Eine native Artefakt-/Login-Abnahme gibt es noch nicht.

**Folgerung:** Der gemeinsame Capacitor-Unterbau für VitalOS ist lokal vorhanden, aber noch nicht als APK/IPA oder mit echtem Login auf Geräten abgenommen. Als möglicher erster Play-Store-Schritt wird stattdessen Fitness-VOS solo als TWA geprüft, mit eigener Android-Paketkennung und eigener Produkt-Hosting-Origin. Das verkleinert den Android-Pilot, ohne das längerfristige Observe-/Operate-Produkt zu ersetzen. Für iOS bleibt der Capacitor-Pfad relevant. Der TWA-Pfad braucht sein eigenes Android-Projekt und Digital Asset Links; dafür werden weder 6Pack-Kennung noch `com.vitalos.app` übernommen.

### Native Auth-Integrationsvertrag

Die offizielle [Capawesome Firebase Authentication Dokumentation](https://capawesome.io/docs/sdks/capacitor/firebase/authentication/) unterscheidet zwischen nativer und Web-SDK-Anmeldung. Eine Anmeldung nur auf der nativen Ebene reicht für VitalOS nicht, weil die Shell Firestore über das Firebase-JavaScript-SDK nutzt. Der dokumentierte Übergang ist: nativer Provider-Login mit `skipNativeAuth: true`, Google-ID-Token in ein `GoogleAuthProvider`-Credential umwandeln und dieses mit `signInWithCredential` am gemeinsamen Web-SDK-Auth anmelden. Auf Capacitor wird für die JS-Session `initializeAuth` mit `indexedDBLocalPersistence` empfohlen; Abmeldung muss beide Ebenen berücksichtigen, falls nativer Auth statt `skipNativeAuth` genutzt wird. [Plugin-Beispiel für Firebase JS SDK](https://github.com/capawesome-team/capacitor-firebase/blob/main/packages/authentication/docs/firebase-js-sdk.md)

Dieser Auth-Vertrag ist im Shell-Code umgesetzt: `src/cloud/firebase.js` initialisiert auf nativen Plattformen Firebase JS Auth mit IndexedDB-Persistenz; `src/cloud/db.firestore.js` meldet Google nativ an, übergibt das ID-Token an die gemeinsame Firebase-JS-Auth und meldet beide Ebenen ab. Im Web bleibt der bestehende Popup-Login aktiv. Firebase `^12.6.0`, Capacitor Core/CLI/iOS/Android `8.6.0` und `@capacitor-firebase/authentication` `8.6.0` sind Root-Abhängigkeiten. Die Produktkonfiguration `capacitor.config.json` setzt derzeit `com.vitalos.app`, `dist-native` und `skipNativeAuth: true`.

Die SDK-Kompatibilität wurde für den Capacitor-Unterbau angepasst: Der VitalOS-Root verwendet Firebase `^12.6.0`; `@capacitor-firebase/authentication` 8.6.0 verlangt laut [offiziellem Paketmanifest](https://github.com/capawesome-team/capacitor-firebase/blob/main/packages/authentication/package.json) Firebase `^12.6.0` und Capacitor 8. Der gemeinsame Shell-Build wurde damit lokal geprüft.

Die isolierten Läufe gegen Firebase 13.1.0 und exakt Firebase 12.6.0 zeigen beide, dass `firebase/vertexai` in diesen Versionen fehlt. Google beschreibt den Übergang als Import aus `firebase/ai` mit `getAI` und `getGenerativeModel` in der [offiziellen Migrationsanleitung](https://firebase.google.com/docs/ai-logic/migrate-to-latest-sdk). Für den bisherigen Vertex-Endpunkt bleibt `VertexAIBackend("us-central1")` gesetzt.

Die Migration ist lokal umgesetzt: VitalOS `src/cloud/firebase.js` verwendet jetzt `getAI`/`VertexAIBackend`; Fuel hat seine SDK-Aufrufe, Vite-Aliase, Abhängigkeit und den Test-Mock in `fuel-dev` migriert (Commit `6e92a88`, nur lokal, nicht gepusht). Fuel-Cloud-Build und alle 121 Unit-Tests bestehen. Der reguläre VitalOS-Store-Build mit Test-Firebase-Konfiguration und Isolationsprüfung besteht gegen Firebase 12.6.0. Zusätzlich besteht ein isolierter vollständiger Shell-Build, der das aktuelle Fuel-Dev-Quellverzeichnis einbindet (7.128 Module) und danach die Produkt-Firebase-Isolationsprüfung besteht. Beim Übergangsbau für den noch alten Fuel-Gitlink wird ein markierter Vite-Adapter für `firebase/vertexai` verwendet; der aktuelle Fuel-Dev-Code nutzt `firebase/ai`. Der Root-Lockfile ist jetzt auf Firebase 12.6.0 und die Capacitor-Pakete synchronisiert.

`pnpm run build:native` erzeugt `dist-native` mit relativen Asset-Pfaden und besteht die Produkt-Firebase-Isolationsprüfung. Capacitor-Android- und iOS-Projekte sowie der native Auth-Bridge-Code liegen vor. Ein APK-/IPA-Build und echte Google-Anmeldung sind noch nicht nachgewiesen: Android-SDK-Werkzeuge und Xcode fehlen auf diesem Rechner. `vitalos-prod` ist mit Firebase verknüpft, enthält eine registrierte Web-App und eine Firestore-Datenbank in `eur3`; Produktregeln, Auth-/Hosting-Buildwerte und VAPID-Konfiguration fehlen noch. Google-Kalender-Refresh-Tokens dürfen in Produktbuilds erst nach Einrichtung und Prüfung der serverseitigen Functions genutzt werden. Der Root-Peer-Check meldet außerdem einen bestehenden Konflikt von `plan-app`'s `@firebase/rules-unit-testing@6` mit dessen Firebase-11-Testinstanz; der Store-Webbuild selbst besteht.

Der Fuel-Submodule-Pointer in diesem VitalOS-Worktree ist weiterhin auf dem älteren integrierten Stand. Die lokalen Quelländerungen wurden nicht gepusht und nicht in `fuel-app` übernommen. Vor einem Capacitor-Geräte-Login müssen die passende Android-/iOS-App im Projekt `vitalos-prod` registriert und Google OAuth samt Android-SHA-1s/iOS-URL-Scheme eingerichtet werden. Fitness-VOS-TWA braucht getrennt davon eine eigene Android-Paketkennung sowie eine eigene Hosting-Origin samt Digital Asset Links. Danach sind die jeweiligen Builds und echten Anmelde-/Abmeldeabläufe auf Geräten zu prüfen. Den nativen Auth-Bridge-Code und die Store-Webbuilds nicht als Gerätefreigabe werten. Keine zweite Firebase-Auth-Instanz neben der Shell einführen.

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

Noch offen: native Paketierung, Preis und Abo-Zeitraum, Premium-Kontingent, Anbieteridentität, Mac-/iPhone-Verfügbarkeit, vorhandene Entwicklerkonten, Zielregionen, Purchase-Validation-Ansatz und konkrete Backend-Lücken. Dieser Plan beauftragt keine Kontoeröffnung, Zahlung, Bereitstellung privater Daten oder Store-Einreichung.


### Verifizierte Plattformanforderungen (6. November 2026)

- **Google Play:** Ab 31. August 2026 müssen neue Apps und Updates Android 16 / API 36 oder höher targeten. Der gemeinsame Shell-Build verwendet Target API 36; das erfüllt diese konkrete API-Schwelle. Das allein belegt weder Store-Konformität noch Uploadfähigkeit. Quelle: [Google Play Target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-AU).
- **Apple App Store:** Seit 28. April 2026 müssen Uploads mit Xcode 26 oder neuer und einem iOS 26 SDK oder neuer gebaut werden. Das iOS-Projekt ist mit Bundle-ID `com.vitalos.app` und Mindestziel iOS 15 synchronisiert, aber noch nicht auf einem Mac gebaut. Vor Upload muss der Mac-Build daher Xcode 26+ und das iOS 26 SDK verwenden. Quelle: [Apple upcoming SDK minimum requirements](https://developer.apple.com/news/upcoming-requirements/?id=04282026a).

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
