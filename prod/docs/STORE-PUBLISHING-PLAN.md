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
- Schritt 4 (Gradle-Build) am 2026-11-06 erstmals aus diesem Workspace
  erledigt — Debug-APK und signierte Release-AAB gebaut, Nachweise unter
  „Artefaktnachweis“. JDK-Befund korrigiert (2026-11-06): Die frühere
  Aussage „benötigt exakt JDK 21; JBR 25 zu neu (Classfile 69)“ war
  falsch. Richtig ist: JDK 17 kennt das Source-Level 21 der
  Capacitor-8-Module nicht, und JDK 27 scheitert an der jlink-
  Transformation von `android-36/core-for-system-modules.jar` — aber das
  mitgelieferte Runtime des lokalen Android Studio genügt: mit
  `/opt/android-studio/jbr` (JBR 25.0.4+) liefen `assembleDebug` und
  `bundleRelease --rerun-tasks` inklusive `:app:signReleaseBundle`
  jeweils `BUILD SUCCESSFUL`. Das Archiv belegt, dass JBR 25 bereits im
  alten Checkout baute; ein separater JDK-Download ist nicht nötig.
  Alternativ verifiziert: Temurin JDK 21 unter
  `~/.local/share/jvm/jdk-21.0.13+9`.
- Der native Web-Build `dist-native` wurde aus gemeinsamen Quellen (Stand
  `afbdda9` inkl. Import-Korrektur) erzeugt; APK/AAB aus diesem Workspace
  existieren seit dem 2026-11-06 (Quellstand `cb4a55b`, Nachweise unten).

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
   erfordert Billing-Freigabe durch den Owner). Stand 2026-11-06: die
   Identity-Platform-API `identitytoolkit` ist laut
   `gcloud services list --project vitalos-prod` aktiviert; der konkrete
   Provider-Status ist per CLI nicht abfragbar (Google-Sensitive-Scope-
   Beschränkung für ADC-Token) — Console-Sicht/Gerät bleibt maßgeblich.
2. Unter der Android-App `com.vitalos.app` den Release-SHA-1 registrieren
   (für Entwicklungsgeräte zusätzlich den Debug-SHA-1); danach die neu
   gezogene `google-services.json` committen — erst dann ist ein nativer
   Google Sign-In OAuth-Client vorhanden. Erledigt 2026-11-06: beide SHA-1
   (Release-Draft B2:61:28:... und Debug 8A:07:CC:...) sind registriert;
   die neu gezogene `google-services.json` mit zwei `client_type 1`-Clients
   ist als `b1a3c26` committet.
3. Google als Sign-In-Provider aktivieren und die authorized domains gegen
   das spätere Produkt-Hosting prüfen.
4. VAPID-Paar prüfen: seit 2026-11-05 Console-verwaltet; Registrierung des
   öffentlichen Schlüssels bestätigen (siehe FIREBASE.md).
5. Vor erstem Store-Upload entscheiden: Play App Signing oder eigener
   Upload-Key. Der lokale Draft-Keystore ist bis zum ersten Upload austausch-
   bar, danach identitätsbestimmend; nie committen.

### Fehlt-Liste: erste vermarktbare Edition (core/store)

Bestandsaufnahme 2026-11-06 (Inventar, kein Build/Auftrag):

| Baustein | Stand | Fehlt |
| --- | --- | --- |
| Paketkennung | `com.vitalos.app` konsistent in Capacitor/Manifest/google-services | endgültige Bestätigung durch Owner (derzeit Draft-Status) |
| Signatur | Draft-Release-Keystore, SHA-1 registriert, signierte AAB gebaut (Artefaktnachweis) | Entscheidung Play App Signing vs. eigener Key; bei Keywechsel erneute SHA-Registrierung |
| Brand-Assets | nur observe/operate-Icons in `prod/branding/` | eigenes Store-Edition-Icon-Set (maskable 512, adaptive foreground/background) und Feature-Grafik |
| Splash | mini-app-shell-Splash-Generierung vorhanden (`stamp`/`splash`) | Store-Edition-Splash-Quellen hinterlegen/prüfen |
| Store-Texte | `STORE-LISTING-DRAFT.md` als Basis | finale Texte, Datenschutzerklärung, Support, Kontolöschung — passend zum ausgelieferten Produkt |
| Anmeldung | OAuth-Clients (`client_type 1`) und Identity-Platform-API stehen | Google-Provider-Aktivierung in der Console prüfen; digitale Abnahme am Gerät offen |
| Push | öffentlicher VAPID-Schlüssel in der lokalen Produktkonfiguration | Registrierung des Paars in der Console bestätigen (FIREBASE.md) |

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

### Erste Artefakte aus dem gemeinsamen Workspace (2026-11-06, lokal)

- Quellstand: Meta-Commit `cb4a55b` auf `dev-product` (Release-Kandidat ohne
  Tag). Layout-Guard PASS (neun App-Pins), `release-manifest.mjs` läuft
  (`releaseCandidate: true`, Lockfile SHA-256
  `1a8ada5d8992c225a3bbe671395fac999746c519d99b175e2d2ca41203ef280b`),
  `build-product-rules.mjs --check` PASS (transformationstimme Produkt-Rules).
- Toolchain: Gradle 8.14.3 (Wrapper), AGP 8.13, compileSdk 36; JDK: Temurin
  JDK 21.0.13+9 (`JAVA_HOME=~/.local/share/jvm/jdk-21.0.13+9`) für die
  Erstbauten, für den Wiederholungsbau verifiziertes Android-Studio-Runtime
  `/opt/android-studio/jbr` (JBR 25.0.4+). `sdk.dir=/home/alpha/Android/Sdk`
  (build-tools 36.0.0). Buildkommando aus `prod/android` mit geladenem
  `../.product-config/product.env`:
  `JAVA_HOME=<jdk> ./gradlew assembleDebug` bzw. `bundleRelease`.
- Debug-APK: `prod/android/app/build/outputs/apk/debug/app-debug.apk`,
  8 120 168 Bytes, SHA-256
  `3c73c07445583c9295f1ab0551fc9bad06d24ad7ef2a32e7a583449a73b5d813`
  (Wiederholungsbau mit JBR 25.0.4, `assembleDebug`, `BUILD SUCCESSFUL in
  41s`; Erstbau unter Temurin 21 ergab SHA-256
  `8a6f8bbb37e6ecee442e9dc695aab30a5d2efe713c0edd3946156b1c92c13581`,
  `BUILD SUCCESSFUL in 51s`). Signatur: `apksigner verify` OK, Standard-
  Debug-Keystore (`CN=Android Debug`, SHA-256
  `77:75:CF:01:33:72:75:43:58:56:7A:0F:83:55:D0:BB:56:D1:68:8B:00:67:DE:BA:20:82:4B:A7:4F:EF:24:E1`).
- Release-AAB: `prod/android/app/build/outputs/bundle/release/app-release.aab`,
  6 266 712 Bytes, SHA-256
  `06cca969a553cf1e7c755ee63d851fa9303717f5987af6eb67956bae5d5795f5`
  (Wiederholungsbau mit JBR 25.0.4 aus `/opt/android-studio/jbr`,
  `bundleRelease --rerun-tasks`, `BUILD SUCCESSFUL in 39s`, 156 Tasks;
  Erstbau unter Temurin 21 ergab SHA-256
  `817a60e7da0929f9b76f607a7ed2492416e29a480f538aeccb24a8d1eaf748ad`).
  Signatur: `jarsigner -verify` bestätigt („JAR-Datei verifiziert.“; die
  JarFile/JarInputStream-Hinweise sind das bekannte jarsigner-Artefakt
  bei Play-Bundles), Signer `CN=VitalOS Product, O=VitalOS`
  (SHA384withRSA, 4096 Bit), Zertifikats-SHA-256
  `3D:4F:62:E0:10:47:08:4E:51:75:A1:FE:67:C8:71:D0:4C:26:BB:7B:CC:30:1B:66:64:1A:45:CC:39:C6:EB:A7`
  — identisch mit dem registrierten Draft-Release-Fingerprint (Alias
  `vitalos`). Signiert als Upload-Bundle; Play App Signing entscheidet erst
  beim ersten Upload (siehe Checkliste unten).
- Signing-Konfiguration: `keystore.properties` (gitignored) hatte einen
  falschen `keyPassword`-Eintrag; im PKCS12-Keystore ist der Key mit dem
  Store-Passwort geschützt. Nach lokaler Angleichung läuft `:app:signReleaseBundle`.
  Kein Secret in Doku oder Commit übernommen.
- Nicht belegt durch diese Builds: Installation auf einem Gerät, native
  Anmeldung, Store-Upload. Die Console-Aktionen des Owners (Identity
  Platform aktivieren, Release-/Debug-SHA-1 registrieren,
  `google-services.json` neu ziehen) bleiben offen.

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
