# Data Safety — `com.vitalos.app` Release versionCode 1

Auftrag C-015, geprüft 2026-11-11 gegen Meta-Stand `f314d0f`.
Ziel: die Antworten für das Play-Console-Formular **Data safety** des
Closed-Test-Release. Dieses Dokument füllt die Console nicht aus, lädt kein
Bundle hoch und legt kein Konto an.

App: Android/Capacitor, `applicationId` `com.vitalos.app`, `versionCode` 1,
`versionName` `0.1.0`, `minSdk` 24, `targetSdk` 36, `compileSdk` 36.
Produktprojekt der Daten: Firebase `vitalos-prod`.
Der native Web-Build ist `pnpm run product:build:native`
(`VITE_VOS_PRODUCT_BUILD=1`, `VITE_VOS_EDITION=store`,
`VITE_VOS_NATIVE_BUILD=1`, Vite-Modus `firebase`, Ausgabe `prod/dist-native`).

## Kurzantwort für das Formular

| Formularpunkt | Antwort |
| --- | --- |
| Werden die abgefragten Nutzerdaten erhoben oder weitergegeben? | Ja, erhoben. Weitergabe an Dritte: Nein. |
| Verschlüsselung bei der Übertragung | Ja, für alle erhobenen Arten (HTTPS/TLS zu Firebase). |
| Können Nutzer die Löschung verlangen? | Ja. URL `https://vitalos.web.app/konto-loeschen` (C-013, auf master). |
| Werbung | No. Kein Ad-SDK im Release-Build. |
| Konto in der App | Ja. Prüferweg ist E-Mail und Passwort, nicht Google. |

Verarbeiter der erhobenen Daten ist Google Firebase für `vitalos-prod`
(Authentication, Firestore, bei eingeschaltetem Push auch Cloud Messaging).
Das ist Auftragsverarbeitung für die App-Funktion. Die Produkt-Rules setzen
`isCoach()` auf `false` (`prod/firestore.product.rules`); ein Coach liest die
Produktdaten nicht. Es gibt keinen Verkauf und keine Werbenutzung.

Open Food Facts (2026-11-12, fuel-dev d02cf0b): Lebensmittel-Textsuche und
Barcode-Abfrage senden nur Suchbegriff/Barcode-Nummer (plus technisch die IP)
an openfoodfacts.org — keine Konto- oder Gesundheitsdaten. Das ist keine
Weitergabe einer Data-Safety-Datenart; in der Datenschutzerklärung genannt.
Google Fonts (2026-11-12): Journal/Door-CSS lädt Archivo/Martian Mono von
fonts.googleapis.com — nur Schrift-CSS/Dateien + IP, keine Kontodaten; in der
Datenschutzerklärung genannt.
KI: Fuel (`AI_ENABLED`), Relax und Shell rufen im Store-Build keine KI auf.

Lösch-Function `deleteOwnAccount` ist seit 2026-11-12 in `vitalos-prod`
(europe-west1) live und per Wegwerfkonto End-to-End geprüft (HTTP 200, Auth +
`users/`/`journal/` weg).

Die Lösch-URL und den In-App-Weg liefert C-013 (Seite
`prod/public/konto-loeschen/index.html`, Callable `deleteOwnAccount` in
`prod/functions`). Die Function geht nicht mit dem Shell-Deploy raus. Die URL erst in
die Console eintragen, wenn `https://vitalos.web.app/konto-loeschen` ohne
Login antwortet. Die Löschung muss das Firebase-Auth-Konto und die
uid-gebundenen Firestore-Bäume umfassen: `users/{uid}`, `fitness/{uid}`,
`nutrition/{uid}`, `supplements/{uid}`, `relax/{uid}`, `journal/{uid}`,
`skillsUsers/{uid}`, `planResponses/{uid}`, `sixpackSelfies/{uid}`.

## Was der Release-Build ist

`@db` zeigt im Firebase-Modus auf `prod/src/shell/db/index.js` und von dort
auf die gepinnten App-Checkouts. `prod/src/cloud/db.firestore.js` ist nicht
dieser Pfad. `prod/fuel-os` liegt außerhalb des Shell-Builds
(`docs/UNIFIED-PRODUCT.md`).

Gepinnte App-Stände, an denen die Schreibpfade gelesen wurden:

| Gitlink | Commit |
| --- | --- |
| `journal-app` | `992e40bdc120a9238393b80f21b2a31b30f14ade` |
| `fitness-app` | `292e61541d7df439e743af3bc48a3312f7aa3f12` |
| `fuel-app` | `59ca3dc17a588179e705a2261ae7284b81391952` |
| `habit-app` | `1995f1a771e043c515b7b0a22710828bd046b138` |
| `relax-app` | `33997ea8069eeef600ec56eec8de09051ca29926` |
| `6pack-app` | `be9c01f72ee282d145603e5040cdb2d3dedba99a` |
| `skills-app` | `c475d86eb00cf16d25f73bbcd75282950ca9762f` |
| `plan-app` | `6340baac4b6e224a0b07833185a82566a624d2cf` |
| `learn-app` | `e5b867fae853e4e8038b53c548a2be71e941520f` |

Native Plugins im Android-Projekt (`prod/android/app/capacitor.build.gradle`,
`prod/android/capacitor.settings.gradle`): `capacitor-android`,
`@capacitor-firebase/authentication` 8.6.0, `@capacitor/local-notifications`
8.3.1. Das Manifest `prod/android/app/src/main/AndroidManifest.xml` enthält
`INTERNET` und `POST_NOTIFICATIONS`.

Die Anmeldung, die der Button wirklich aufruft, ist der Re-Export aus
`fitness-app` `src/lib/db/firestore/core.js`: E-Mail über
`signInWithEmailAndPassword` / `createUserWithEmailAndPassword`, Google über
`signInWithPopup` mit Fallback `signInWithRedirect`. Der native Aufruf
`FirebaseAuthentication.signInWithGoogle` steht nur in der nicht verdrahteten
Datei `prod/src/cloud/db.firestore.js`. Das Plugin liegt im APK, der
Anmeldebutton ruft es in diesem Release nicht auf.

## Datenarten, die anzukreuzen sind

Pflicht heißt: die App lässt sich ohne diese Angabe nicht nutzen. Optional
heißt: das Konto funktioniert auch ohne die Angabe, die Person liefert sie
beim Benutzen eines Bereichs. Alle Zeilen: erhoben Ja, weitergegeben Nein,
Übertragung verschlüsselt Ja, Löschung über die URL oben Ja.

| Play-Art | Pflicht oder optional | Zweck | Wohin es geht |
| --- | --- | --- | --- |
| Personenbezogene Daten → E-Mail-Adresse | Pflicht | App-Funktionalität, Kontoverwaltung | Firebase Authentication. Beide Anmeldewege führen eine E-Mail. |
| Personenbezogene Daten → Nutzer-IDs | Pflicht | App-Funktionalität, Kontoverwaltung | Firebase-UID. Hängt an jedem Firestore-Dokument unter der UID. |
| Personenbezogene Daten → Name | Optional | App-Funktionalität, Kontoverwaltung | Anzeigename aus dem Google-Konto oder aus dem Körperprofil (`users/{uid}`, Feld `displayName`). E-Mail-Kontozwang enthält keinen Namen. Die Profilbild-URL des Google-Kontos (`photoURL`) bleibt im Auth-Profil und wird nur angezeigt. |
| Gesundheit und Fitness → Gesundheitsdaten | Optional | App-Funktionalität | Körperprofil in `users/{uid}` und `users/{uid}/meta/profile`: Geschlecht, Alter, Größe, Gewicht (`prod/src/shell/Settings/ProfileSection.jsx`, `prod/src/shell/db/settings.js`). Ernährung und Supplements unter `nutrition/{uid}` und `supplements/{uid}`. |
| Gesundheit und Fitness → Fitnessdaten | Optional | App-Funktionalität | Training unter `fitness/{uid}` (Sessions, Plan), Gewohnheiten und Habit-Records, Relax-Sitzungen unter `relax/{uid}/sessions` (Datum, Einträge, Minuten), Skill-Ereignisse unter `skillsUsers/{uid}/events`, 6Pack-Programm über `getSixpackProgram` / `saveSixpackProgram`. |
| App-Aktivitäten → Sonstige vom Nutzer erstellte Inhalte | Optional | App-Funktionalität | Journaltext unter `fitness/{uid}/journal` (`journal-app` `src/lib/db/journal.js`: `date`, `text`, `tags`). Door-, Game- und Voice-Einträge, Plan-Text, Freitextnotizen. Die Suche liest diese Einträge im Client und legt kein eigenes Suchprotokoll an. |
| Geräte- oder andere IDs | Pflicht, sobald ein Konto benutzt wird | App-Funktionalität | Nach dem Login schreibt `registerShellDevice` (`prod/src/shell/db/settings.js`, Aufruf in `prod/src/App.jsx`) `users/{uid}/devices/{id}`: zufällige UUID plus grobes Label wie „Android · Chrome“, dazu `last_seen_at`. Das FCM-Token unter `fitness/{uid}/settings/push` entsteht nur, wenn die Person Push einschaltet (`prod/src/hooks/usePushNotifications.js`). |

Lokale Benachrichtigungen (`@capacitor/local-notifications`) bleiben auf dem
Gerät. Sie sind keine eigene Datenart.

Der optionale Smart-Log-Tipp sendet den Journalentwurf an die Callable
`analyzeSmartLog` in `europe-west1`
(`journal-app` `src/lib/smartJournalLogger.js`). Dieselbe Inhaltsart ist oben
schon als Nutzerinhalt geführt. Der Zweck bleibt App-Funktionalität.

## Gemini in diesem Release

Gemini ist für versionCode 1 keine eigene Verarbeitung und wird im Formular
nicht als Empfänger angekreuzt.

- Produktbuilds setzen `vertexAI` auf `null`, bevor `getAI` läuft
  (`prod/src/cloud/firebase.js`, `prod/src/cloud/firebaseVertexaiCompat.js`,
  Flag `VITE_VOS_PRODUCT_BUILD=1`).
- Fuel-KI wirft in `assertLegacyAiAvailable`, bevor `getGenerativeModel`
  aufgerufen wird (`fuel-app` `src/client/lib/aiAvailability.js` am Pin
  `59ca3dc1`). Foto-Scan und Mahlzeittext erreichen das Modell nicht.
- `analyzeSmartLog` und `getSmartLogQuota` sind im Journal-Client vorhanden.
  Die Journal-Functions sind im Produkt-Deploy nicht enthalten
  (`docs/UNIFIED-PRODUCT.md`, Owner-Entscheid 2026-11-07). `vitalos-prod`
  hatte keinen Functions-Deploy dieser Callables. Der Tipp scheitert, Gemini
  sieht den Text nicht.
- `prod/fuel-os` mit eigenen Gemini-Aufrufen ist nicht der Shell-Build.

Wird die Callable vor dem Upload nach `vitalos-prod` deployt, ist diese
Antwort veraltet: dann geht Journaltext an Gemini und das Formular braucht
eine eigene Zeile.

## Im Formular nicht ankreuzen

| Play-Art | Warum sie in diesem Release fehlt |
| --- | --- |
| Standort, ungefähr und genau | `AndroidManifest.xml` hat keine Standortberechtigung. Der Session-Start in `fitness-app` `src/views/Session/useSessionGateController.js` würde bei einem Fix Breite und Länge in die Session schreiben und an Overpass/Nominatim senden. Ohne Manifest-Recht liefert das WebView keinen Fix. Kommt die Berechtigung später ins Manifest, wird Standort zur Pflichtzeile. |
| Fotos und Videos | Die Shell mountet `SixPackPromiseCard`, nicht `SelfiesScreen`. Der Selfie-Upload nach `sixpackSelfies/{uid}/photos` (JPEG-Data-URL) hängt an `6pack-app/SixPackApp.jsx` und ist im Release-Tab nicht eingehängt. Der Fuel-Scan bricht vor dem Netzaufruf ab. Das Manifest hat kein `CAMERA`. |
| Audio, Dateien, Kontakte, SMS | Keine Berechtigung, kein Aufruf. |
| Kalender | `journal-app` `src/lib/google/auth.js` kennt Kalender- und Tasks-Scopes. Im Produktbuild ist `allowPopupFallback` aus (`VITE_VOS_PRODUCT_BUILD !== "1"` ist falsch). Die Link-Functions `googleLink*` sind nicht nach `vitalos-prod` deployt. Ohne Token liest `gcal.js` keinen Kalender. |
| Nachrichten | Kein Nutzerchat im Store-Pfad. Der Coach-Eintrag ist in der Shell auf Local-Mode, eine Alpha-E-Mail oder eine feste UID beschränkt. |
| Finanzdaten | Kein Play-Billing und kein Zahlungs-SDK. Door/Game speichert Planstext, keine Kartendaten. |
| App-Interaktionen, Absturzprotokolle, Diagnose | Kein `getAnalytics`, kein Crashlytics, kein Performance-Aufruf, kein Sentry in `prod/src` und in den Pins von Journal, Fitness und Fuel. `@firebase/analytics`, `@firebase/performance` und `web-vitals` stehen als Pakete in `prod/package.json`, weil das Firebase-Meta-Paket sie mitbringt. Der Release-Code importiert sie nicht. Ein ungenutztes Paket ist keine Erhebung. |
| Installierte Apps | `prod/src/focus/usageStats.js` ist ein Adapter ohne eingebundenes Plugin. Im Android-Baum gibt es kein `PACKAGE_USAGE_STATS` und keine Kotlin-Quelle dafür. |
| App-Aktivitäten → Suchverlauf | Die Journal-Suche filtert bereits gespeicherte Einträge auf dem Gerät. |
| Werbung und Marketing als Zweck | Für keine Zeile. |

## Werbedeklaration: No

Console-Antwort: **No**. Keine Banner, keine Interstitials, keine nativen
Anzeigen, kein Ad-SDK.

Suche am 2026-11-11, Arbeitsverzeichnis Meta-Repo-Root. Markdown, `docs/`,
`node_modules/` und `public/` waren ausgenommen, damit die Klickliste das
Wort AdMob nicht selbst als Treffer zählt:

```bash
rg -n -i -g '!**/docs/**' -g '!**/node_modules/**' -g '!**/public/**' -g '!*.md' \
  'admob|adsense|applovin|ironsource|unityads|unity-ads|play-services-ads|com\.google\.android\.gms\.ads|facebook-audience|@admob|capacitor-community/admob|startapp|chartboost|vungle|inmobi|mopub' \
  prod
```

Ergebnis: keine Treffer.

Gradle-Abhängigkeiten des App-Moduls und der beiden Plugin-Zeilen:
`androidx.appcompat`, `androidx.coordinatorlayout`, `androidx.core:core-splashscreen`,
`project(':capacitor-android')`, `project(':capacitor-cordova-android-plugins')`,
`project(':capacitor-firebase-authentication')`,
`project(':capacitor-local-notifications')`. Classpath nur AGP `8.13.0` und
`com.google.gms:google-services:4.4.4`. Kein `play-services-ads`.

## App-Zugang für die Prüfung

Die App ist hinter der Anmeldung. Für die Console gilt „Alle oder einige
Funktionen sind eingeschränkt“. Zugangsdaten stehen nur in der Play Console,
nicht in Git.

So legt der Owner das Prüferkonto an:

1. In Firebase `vitalos-prod` den Provider E-Mail/Passwort eingeschaltet lassen.
2. Den Store-Build oder die Produkt-Web-Anmeldung öffnen. Auf dem
   Anmeldebildschirm „Neu hier? Account erstellen“ wählen, eine eigene
   Prüferadresse und ein Passwort setzen. Dieselbe Anlage geht in der
   Firebase-Console unter Authentication.
3. Einmal mit „Anmelden“ (E-Mail und Passwort, nicht Google) prüfen, dass
   Observe öffnet und das Journal erreichbar ist.
4. Adresse und Passwort nur unter Play Console → App content → App access
   eintragen. Nichts davon committen, in diese Datei kopieren oder in einen
   Chat stellen.

Platzhalter, absichtlich ohne Werte: Nutzername `<nur in der Play Console>`,
Passwort `<nur in der Play Console>`.

**Stand 2026-11-12:** Das Prüferkonto ist angelegt (`vitalos-prod`, E-Mail/Passwort,
Anmeldung im Store-Build verifiziert). Zugangsdaten liegen lokal in
`prod/.product-config/play-reviewer.txt` (gitignored) — von dort in die Console kopieren.

Text für das Feld „Anweisungen“ (keine Geheimnisse):

> Die App öffnet einen Anmeldebildschirm. E-Mail und Passwort des Prüferkontos eintragen und auf Anmelden tippen. Die Schaltfläche Mit Google anmelden nicht verwenden. Es gibt kein weiteres Feld und keinen Einmalcode. Danach ist Observe geöffnet; Journal und die übrigen Bereiche brauchen kein zweites Konto.

Google bleibt ein angebotener Weg für normale Konten und ist oben bei Name
und E-Mail berücksichtigt. Für die Prüfung ist er der falsche Weg: der Button
nutzt das Web-Popup, und das Prüfergerät hätte dann das Google-Konto der
prüfenden Person statt des vorbereiteten Kontos.

## Release-Signatur, die hier nicht gebaut werden kann

`prod/android/app/build.gradle`: `versionCode` 1, `versionName` `"0.1.0"`.
`signingConfigs.release` liest `prod/android/keystore.properties` nur, wenn
die Datei existiert, und hängt `signingConfig` nur dann an `release`. Die
Datei ist in `prod/android/.gitignore` (`keystore.properties`). Ohne sie
bleibt `bundleRelease` unsigniert. Der Keystore liegt lokal und wird nicht
committet.

`prod/android/variables.gradle`: `minSdkVersion` 24, `compileSdkVersion` 36,
`targetSdkVersion` 36.

Das signierte AAB entsteht auf der Maschine, die `product.env` und
`keystore.properties` hat. Ablauf, Ausgabe und SHA-256-Platzhalter stehen in
`prod/docs/PLAY-CLOSED-TEST-CLICKLIST.md`, Abschnitt „AAB lokal bauen (C-015)“.
In der Umgebung dieser Prüfung fehlten Android-SDK, `node_modules`, die
ausgecheckten App-Submodule, `prod/.product-config/product.env` und
`keystore.properties`. Deshalb wurde `bundleRelease` hier nicht ausgeführt.
Ein Lauf ohne diese Werte wäre kein Nachweis des Release-Builds.
