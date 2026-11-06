# Store-Plan — vom gemeinsamen Quellstand zum Produktrelease

## Auslieferungswege

| Produktweg | Quellen unter `prod/` | Identität | Benötigtes Ergebnis |
| --- | --- | --- | --- |
| VitalOS Observe / Operate, Capacitor | `src/`, `android/`, `ios/` | `com.vitalos.app` | eigener Android-/iOS-Build aus Produkt-Webassets |
| Fitness-TWA-Pilot | `vos-fitness/`, `platforms/fitness-twa/` | vorläufig `at.vitalos.fitness` | Produkt-Hosting plus zugehörige Android-App und Asset Links |

Die nativen Projekte der gemeinsamen App-Submodule sind separate App-Produkte.
Ihre Paketkennungen, Signaturen und fertigen APKs werden nicht in die VitalOS-
Shell umbenannt. Die benötigten Quellen bleiben über die gemeinsamen Gitlinks
verfügbar. Observe und Operate sind Varianten des gemeinsamen Store-Unterbaus.

## Erreichter Schritt

Die Quellzusammenführung ist umgesetzt: getracktes `~/vitalos/prod`, gemeinsame
Apps, gemeinsames Lockfile mit Produkt-Importer. Der dokumentierte Abschluss
`164e6a3` bestätigt die Struktur und ein Quellmanifest als Release-Kandidaten.
Ein früherer APK-/AAB-Build im alten Checkout ist kein Build aus diesem neuen
Workspace. Die laufende Folgearbeit muss ihre Artefakte und Commits separat nennen.

Android-Vorlaufstand 2026-11-06 (Schritte 1-3 der Reihenfolge erledigt):

- Workspace vollständig installiert; `pnpm install` benötigte erhöhten
  `--fetch-timeout` (Registry-Timeouts, keine Policy-Änderung).
- `pnpm run product:build:native` aus dem neuen Workspace erfolgreich:
  `prod/dist-native` (ca. 7 MB), Firebase-Isolation bestanden, Service-Worker
  gestempelt. Voraussetzung: `. prod/.product-config/product.env` in der Shell.
- `cap sync android` erfolgreich; ein Plugin (`@capacitor-firebase/authentication`
  8.6.0) erkannt; `prod/android/local.properties` (gitignored) zeigt auf
  `~/Android/Sdk`. Nach Sync muss `capacitor.settings.gradle` mitunter auf den
  committierten stabilen Pfaden gehalten werden (`git checkout --`).
- Schritt 4 (Gradle-Build) offen und vom Nutzer zurückgestellt. Technischer
  Befund: `./gradlew assembleDebug` (Gradle 8.14.3, AGP 8.13, compileSdk 36)
  benötigt exakt ein JDK 21. JDK 17 kennt das Source-Level 21 von
  Capacitor-8-Modulen nicht; JDK 27 scheitert an der jlink-Transformation
  von `android-36/core-for-system-modules.jar`; JBR 25 ist für Gradle
  8.14.3 zu neu (Classfile 69). Ohne sudo bleibt z. B. ein lokaler
  Temurin-21-Tarball nach `~/jdks`; danach `JAVA_HOME=<jdk21-Verzeichnis>`
  setzen. Danach:
  `cd prod/android && ./gradlew assembleDebug` bzw. `bundleRelease`.
- Der native Web-Build `dist-native` wurde aus gemeinsamen Quellen (Stand
  `afbdda9` inkl. Import-Korrektur) erzeugt; APK/AAB aus diesem Workspace
  existieren noch nicht.

## Reihenfolge bis Android

1. Gewünschten gemeinsamen Quellstand auf einem Dev-Strang committen. Der alte
   Dev-Abgleich ist in `6b088d9` dokumentiert; Apps und Root-Lockfile zusammenhalten.
2. Workspace-Abhängigkeiten bereitstellen. Produktwerte laden und im Root
   `pnpm run product:build:native` ausführen. Ausgabe: `prod/dist-native`.
3. Aus `prod/` Capacitor für Android synchronisieren; iOS getrennt behandeln.
   Der Root-Befehl `product:native:sync` enthält selbst einen erneuten Web-Build.
4. Aus `prod/android` das native Android-Projekt bauen. Debug-APK und
   Release-AAB mit Pfad, Buildkommando und Quellcommit dokumentieren. Ein
   unsigned AAB ist kein uploadbereites Release.
5. Installation, Anmeldung, Kontobindung und den vorgesehenen Kernablauf als
   separate Abnahme planen. Diese Liste beauftragt keine Kontenerstellung,
   Testausführung oder Geräteaktion ohne passenden Arbeitsauftrag.

Für den TWA-Weg: Root `product:build:twa` bereitet Webassets und Asset Links vor;
das Gradle-Projekt liegt unter `prod/platforms/fitness-twa`. Paketkennung,
Produkt-Hosting-Origin und tatsächliche Signing-Fingerprints müssen zusammenpassen.
Der vorbereitete Root-Workflow `product-twa.yml` baut unsigned Artefakte manuell.
Eine TWA-Webvorbereitung ist noch keine gebaute oder veröffentlichte Android-App.

## Release vorbereiten

### Signing und Anmeldung — lokal vorbereitet am 2026-11-06

Lokales Signing (Draft, nie committen): `prod/android/keystore.properties`
(gitignored) referenziert den Draft-Release-Keystore (RSA 4096, Alias
`vitalos`) unter `prod/.product-config/android/`. `app/build.gradle` nutzt
ihn nur, wenn die Properties-Datei existiert — sonst bleibt der
Release-Build unsigned; der Standard-Debug-Keystore ist davon unberührt.
Versionierung: `versionCode 1`, `versionName 0.1.0` (am Product-Manifest
`@vitalos/product` 0.1.0 ausgerichtet).

Fingerabdrücke für die Console-Registrierung (öffentlich teilbar):

| Keystore | SHA-1 | SHA-256 |
| --- | --- | --- |
| Release (Draft, Alias `vitalos`) | `B2:61:28:DA:F8:95:94:A1:EC:EA:B3:5A:98:9C:5D:31:18:CE:A3:EF` | `3D:4F:62:E0:10:47:08:4E:51:75:A1:FE:67:C8:71:D0:4C:26:BB:7B:CC:30:1B:66:64:1A:45:CC:39:C6:EB:A7` |
| Debug (`androiddebugkey`) | `8A:07:CC:FA:F6:3E:C1:09:48:27:52:2D:F0:2B:DE:28:6F:0D:9E:9D` | `77:75:CF:01:33:72:75:43:58:56:7A:0F:83:55:D0:BB:56:D1:68:8B:00:67:DE:BA:20:82:4B:A7:4F:EF:24:E1` |

Owner-Checkliste nativer Google-Login (Console-Aktionen, Stand der Prüfung
2026-11-06; `google-services.json` hat bislang nur einen `client_type 3`
OAuth-Client, keinen Android-Client mit Fingerabdruck):

1. Firebase Console → Authentication/Identity Platform im Projekt
   `vitalos-prod` ermöglichen (Stand 2026-11-05: `SERVICE_DISABLED`;
   erfordert Billing-Freigabe durch den Owner).
2. Unter der Android-App `com.vitalos.app` den Release-SHA-1 registrieren
   (für Entwicklungsgeräte zusätzlich den Debug-SHA-1); danach die neu
   gezogene `google-services.json` committen — erst dann ist ein nativer
   Google Sign-In OAuth-Client vorhanden.
3. Google als Sign-In-Provider aktivieren und die authorized domains gegen
   das spätere Produkt-Hosting prüfen.
4. VAPID-Paar prüfen: seit 2026-11-05 Console-verwaltet; Registrierung des
   öffentlichen Schlüssels bestätigen (siehe FIREBASE.md).
5. Vor erstem Store-Upload entscheiden: Play App Signing oder eigener
   Upload-Key. Der lokale Draft-Keystore ist bis zum ersten Upload austausch-
   bar, danach identitätsbestimmend; nie committen.

### Weitere Release-Vorgaben

- Dauerhafte Paketkennung, Versionscode und Signing-/Upload-Verantwortung festlegen.
- Aktuelle Play-/Apple-Anforderungen unmittelbar vor Einreichung aus den
  offiziellen Quellen prüfen; ältere SDK-/Gebührenangaben nicht fortschreiben.
- Tatsächliches Datenverhalten, Datenschutzerklärung, Support und Kontolöschung
  dokumentieren. Store-Formulare müssen zum ausgelieferten Produkt passen.
- Produkt-Firebase, Auth, Rules, Functions und Push anhand ihrer eigenen
  Nachweise einordnen; Web-Popup-Erfolg ist keine native Login-Abnahme.
- Einen geprüften Meta-Repo-Commit als Produktstand festhalten. Ein `product-*`-
  Tag pinnt auch alle App-Gitlinks und das gemeinsame Lockfile.
- Release-Mirror, Hosting, Store-Upload und Veröffentlichung ausdrücklich
  beauftragen. Keine bestehende Produkt-Historie durch Force-Push ersetzen.

Für iOS sind Synchronisierung und ein tatsächlicher Xcode-Archiv-Build getrennt.
Ein Android-Build bestätigt keine iOS-Veröffentlichungsfähigkeit. Vorhandene
Entwicklerkonten, Signing-Materialien und notwendige externe Freigaben frisch
prüfen; dieser Plan setzt sie nicht voraus.

## Artefaktnachweis

Zu jedem späteren Kandidaten festhalten: Meta-Commit/Tag, App-Pins, Lockfile-Hash,
Buildmodus und Produktziel, Toolchain, Artefaktpfad/Hash und Signing-Status.
Installation, Anmeldung und Veröffentlichung mit eigenem Datum/Ergebnis nennen.
Fehlende Nachweise bleiben offen, auch wenn ein früherer Teilschritt grün war.

## Quellen und Historie

- [Produkt-Firebase](FIREBASE.md)
- [Aktueller Produktstand](PRODUCT-CHECKOUT.md)
- [Gemeinsame Befehle und Pinning](../../docs/UNIFIED-PRODUCT.md)
- [Historischer vollständiger Store-Plan](archive/STORE-PUBLISHING-PLAN-BEFORE-UNIFICATION-2026-11-06.md)
- [Capacitor-Dokumentation](https://capacitorjs.com/docs)
- [Google Play Target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)
- [Apple Einreichungsanforderungen](https://developer.apple.com/app-store/submitting/)
- [Apple Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

Die externen Seiten wurden für diese reine Doku-Überarbeitung nicht neu geprüft.
Der historische Plan bleibt als datierte Entscheidungsgrundlage erhalten.
