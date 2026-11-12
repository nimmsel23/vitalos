# C-010 — Owner-Klickliste Closed Test `com.vitalos.app`

Stand: 2026-11-10. CEO-Dispatch 2026-11-10 #003, Auftrag C-010.
C-015 (2026-11-11) setzt die Punkte 7, 11 und 12 auf „bereit zur Freigabe“
und ergänzt Punkt 13 um das lokale AAB-Verfahren. Der Console-Klick bleibt
beim Owner.
Ziel: erster Closed-Test-Release der bestehenden Play-Console-App `com.vitalos.app`.
Diese Liste ist eine Klickanleitung. Sie legt keinen Track an, lädt kein AAB hoch
und ändert nichts in der Play Console.

Die App existiert laut Auftrag in einem privaten persönlichen Play-Console-Konto
(C-001 erledigt). Ob der Closed-Test-Track schon existiert, ist unbekannt.
In den Repos gibt es keinen Beleg für einen Track, eine Testerliste oder ein
eingereichtes Store-Formular. Der letzte Repo-Vermerk dazu steht in
`prod/coordination/TODO.md` (C-001, 2026-11-09): vom Laptop war die Console
nicht einsehbar.

Geprüft am 2026-11-10 gegen die Play-Console-Hilfe:

- [App-Testanforderungen für neue persönliche Konten](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Open-, Closed- oder Internal-Test einrichten](https://support.google.com/googleplay/android-developer/answer/9845334)
- [App für die Prüfung vorbereiten (App content)](https://support.google.com/googleplay/android-developer/answer/9859455)
- [App anlegen und Store-Eintrag](https://support.google.com/googleplay/android-developer/answer/9859152)
- [Vorschaugrafiken](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Zielgruppe und App-Inhalte](https://support.google.com/googleplay/android-developer/answer/9867159)
- [Kontolöschung](https://support.google.com/googleplay/android-developer/answer/13327111)
- [Target-API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)

## Was vor dem ersten Closed-Upload gilt

Ein Closed Test startet erst nach abgeschlossenem App-Setup. Dazu gehören
Store-Eintrag, Datenschutz-URL, Data Safety, Content Rating, Zielgruppe,
Werbedeklaration und App-Zugang, wenn die App einen Login hat. Data Safety
gilt für Closed-, Open- und Production-Tracks. Ein reiner Internal-Track ist
davon ausgenommen und zählt nicht als Closed Test.

Der Opt-in-Link erscheint nur, wenn der App-Status „Published“ ist. „Draft“
und „Pending publication“ zeigen keinen Link. Nach der ersten Veröffentlichung
eines Tests kann der Link mehrere Stunden brauchen.

Neue Apps werden beim ersten Bundle-Upload automatisch in Play App Signing
mit von Google erzeugten Schlüsseln eingeschrieben (quantum-ready hybrid
signing). Der lokale Keystore signiert das Upload-Bundle. Die Fingerabdrücke
des Google-Schlüssels müssen danach bei Firebase liegen, sonst scheitert
Google-Login auf der Store-Installation.

Seit dem 31. August 2026 müssen neue Apps und Updates Android 16 (API 36)
zielen. `prod/android/variables.gradle` setzt `targetSdkVersion = 36`.

## 12 Tester und 14 Tage

Die Regel gilt für persönliche Play-Console-Konten, die nach dem
13. November 2023 angelegt wurden. Mindestens 12 Tester müssen beim
Produktionsantrag durchgehend für die vorangegangenen 14 Tage im Closed Test
angemeldet (opted-in) sein. Wer austritt, unterbricht seine Serie. Ein
Wiedereintritt beginnt bei Tag 0. Danach stellt der Owner im Dashboard
„Apply for production“ und beantwortet die drei Abschnitte zum Closed Test,
zur App und zur Produktionsreife.

Persönliche Konten, die vor dem 13. November 2023 angelegt wurden, fallen
laut Google nicht unter diese Testpflicht. Das Anlagedatum dieses Kontos
steht in keinem Repo. Der Owner liest es in der Console, bevor er sich auf
eine Ausnahme verlässt.

Die 14 Tage sind die Voraussetzung für den Produktionszugang. Sie sind keine
Voraussetzung für das Anlegen des Tracks oder den ersten Upload. Der erste
Closed-Upload am Freitag startet die Uhr erst, nachdem die Tester den
Opt-in-Link bestätigt haben.

## Klickliste (15)

Status meint den Beleg in den Repos: vorhanden, fehlt, teilweise,
bereit zur Freigabe oder AAB offen. Der Console-Klick bleibt beim Owner.

| # | Klick | Repo-Beleg | Status | Liefert |
| --- | --- | --- | --- | --- |
| 1 | Closed Testing öffnen (`Test and release` → `Testing` → `Closed testing`). Den von Google angelegten initialen Track prüfen. Fehlt er, Track anlegen. Noch kein extra benannter Zweit-Track. | Kein Track, keine Tester, kein Release in den Repos. `prod/coordination/TODO.md` (C-001) hält nur fest, dass die Console vom Laptop nicht einsehbar war. | fehlt | Owner |
| 2 | Tester hinterlegen: E-Mail-Liste (bis 2.000 Adressen je Liste) oder Google Group (`name@googlegroups.com`). Feedback-URL oder Feedback-E-Mail eintragen. Opt-in-Link kopieren und verschicken, sobald der Status „Published“ ist. Für die 12/14-Regel mindestens 12 Personen, die eingeloggt bleiben. | Keine Testerliste, keine Google Group, keine Feedback-Adresse im Repo. | fehlt | Owner |
| 3 | Store-Texte eintragen. Name höchstens 30 Zeichen, Kurzbeschreibung höchstens 80, Beschreibung höchstens 4.000. Entwurf kürzen und vom Owner freigeben, bevor er in die Console kommt. | Produktentwurf `prod/docs/STORE-LISTING-DRAFT.md`: Name „VitalOS – Journal & Gewohnheiten“ hat 32 Zeichen (en dash zählt), Kurzbeschreibung 50 Zeichen, Beschreibung vorhanden. Älterer Entwurf nur „VitalOS“ in `docs/STORE-RELEASE-STATUS.md`. Beides ist Arbeitsentwurf, keine freigegebene Store-Aussage. | teilweise | PM/CPO (Text), Owner (Freigabe und Klick) |
| 4 | Pflichtgrafiken hochladen: App-Icon 512×512 PNG mit Alpha, höchstens 1024 KB; Feature Graphic 1024×500 JPEG oder 24-bit-PNG ohne Alpha; mindestens zwei Screenshots (JPEG oder 24-bit-PNG, kurze Seite mindestens 320 px, lange Seite höchstens 3840 px und höchstens doppelt so lang wie die kurze). Vier Screenshots ab 1080 px sind eine Empfehlung, keine Pflicht zum Veröffentlichen. | 512-px-Kandidaten `prod/branding/observe/icons/icon-512.png` (35 KB) und `prod/branding/operate/icons/icon-512.png` (40 KB), dazu maskable Varianten. Launcher unter `prod/android/app/src/main/res/mipmap-*` endet bei 192 px und ist kein Store-Icon. `prod/docs/STORE-PUBLISHING-PLAN.md` („Fehlt-Liste“) verlangt ein eigenes Store-Icon und eine Feature Graphic. Keine Feature Graphic und keine Screenshots im Repo. | teilweise | PM/CPO (Grafiken), Owner (Upload) |
| 5 | Kategorie und Tags, öffentliche Kontakt-E-Mail, Länder und Regionen der Tester. Länder gelten für alle Tracks. Tester außerhalb der gewählten Länder können den Closed Test nicht installieren. | In den Store-Entwürfen als offene Owner-Bestätigung genannt (`prod/docs/STORE-LISTING-DRAFT.md`, Abschnitt „Kontoinhaber-Bestätigung“). Öffentliche Kontakt-E-Mail: `nimmdaniel@gmail.com` (Owner 2026-11-12). Kategorie und Länderliste weiter offen. | teilweise | PM/CPO (Vorschlag), Owner (Klick) |
| 6 | Datenschutz-URL unter App content eintragen. Die Seite ist öffentlich per `https`, weltweit ohne Login und ohne Geo-Sperre, eine normale Webseite (kein PDF) und beschreibt Erhebung, Nutzung und Weitergabe inklusive der beteiligten Stellen. Dieselbe URL gehört in den Store-Eintrag und in die App. | C-013: `prod/public/datenschutz/index.html`, gleiche Datei in `public/datenschutz/index.html` für den Shell-Deploy. Rewrites in `firebase.json` und `prod/firebase.json` stehen vor `**`. Der Service Worker lässt `/datenschutz` durch (`navPassthrough`). URL `https://vitalos.web.app/datenschutz`. Nach dem Merge prüft `curl -sI https://vitalos.web.app/datenschutz` HTTP 200 ohne Login. Der Wortlaut ist der Sachstand des Release-Builds und darf durch C-014 ersetzt werden. Kontaktadresse im Quelltext: `nimmdaniel@gmail.com`, Ort 1030 Wien, Österreich. Die Live-Seite zeigt das erst nach dem Shell-Hosting-Deploy. | teilweise | CTO (Seite und Hosting), PM/CPO (C-014-Text und Kontaktadresse), Owner (URL in der Console) |
| 7 | Data-Safety-Formular ausfüllen und einreichen, inklusive der Fragen zur Datenlöschung. Auch eine App ohne erhobene Daten muss das Formular abschließen und eine Datenschutz-URL nennen. SDKs im ausgelieferten Bundle mitzählen (Firebase Auth, Firestore, Google Sign-In; Smart-Log/Gemini nur, wenn dieser Build es wirklich aufruft). | Antworten für versionCode 1 in `prod/docs/DATA-SAFETY-ANSWERS.md` (C-015, geprüft 2026-11-11). Erhoben: E-Mail, Nutzer-ID, optional Name, Gesundheits- und Fitnessdaten, Journal- und sonstige Nutztexte, Geräte-UUID. Nicht erhoben in diesem Build: Gemini, Werbung, Standort, Fotos, Kalender, Absturzlogs. Lösch-URL `https://vitalos.web.app/konto-loeschen` (C-013, auf master). Die URL erst eintragen, wenn die Seite ohne Login antwortet. | bereit zur Freigabe | CTO (Inventar), Owner (Formular) |
| 8 | Kontolöschung: In-App-Weg (oder deutlich gesetzter Link aus der App) plus Web-URL, über die jemand die Löschung beantragen kann, ohne die App neu zu installieren. Die Web-URL kommt ins Data-Safety-Formular. Die Live-Shell zeigt „Account erstellen“, damit fällt die App unter die Pflicht. | C-013: In der App Tab Setup, Bereich Konto, „Konto löschen“ (`prod/src/shell/Settings/AccountSection.jsx`). Dieselben Links auf dem Login und im Körperprofil. Callable `deleteOwnAccount` in `prod/functions` löscht nur die Firestore-Bäume der aufrufenden uid und danach den Auth-Nutzer. Webseite `prod/public/konto-loeschen/index.html`, URL `https://vitalos.web.app/konto-loeschen`, ebenfalls HTTP 200 ohne Login nach dem Shell-Deploy. Prüfung im Repo: `pnpm --filter @vitalos/product run test:account-deletion`. Danach nur ein neues Wegwerfkonto in `vitalos-prod`, nie ein bestehendes Personenkonto. Die Function veröffentlicht der Shell-Deploy nicht mit. | teilweise | CTO (In-App-Weg und Function), PM/CPO (Webtext C-014), Owner (URL, Function-Deploy, Wegwerfkonto) |
| 9 | Content-Rating-Fragebogen abschließen, damit die App nicht „Unrated“ bleibt. | Kein Fragebogen und keine Freigabe im Repo. Die Entwürfe nennen Altersfreigabe als Owner-Bestätigung. | fehlt | PM/CPO (Inhaltsfakten), Owner (Fragebogen) |
| 10 | Target audience and content: Altersgruppen angeben. Enthält die Zielgruppe Kinder, gilt die Families Policy. Vorher müssen Werbedeklaration, App-Zugang und Datenschutz-URL stehen. | Keine festgelegte Altersgruppe. `prod/docs/STORE-LISTING-DRAFT.md` lässt die Zielgruppe beim Kontoinhaber. Der Entwurf beschreibt ein Journal ohne Diagnose. | fehlt | PM/CPO (Vorschlag Erwachsene), Owner (Klick) |
| 11 | App access / Sign-in details: funktionierende Zugangsdaten und kurze Schritte, damit die Prüfung den Login erreicht. Bis zu fünf Sätze. Sonderfälle (zweites Feld, Einmalcode) ins Feld „Any other instructions“. | Anleitung ohne Zugangsdaten in `prod/docs/DATA-SAFETY-ANSWERS.md`, Abschnitt „App-Zugang für die Prüfung“. Prüferweg: Anmeldebildschirm, E-Mail und Passwort, Button „Anmelden“. Nicht „Mit Google anmelden“. Der Owner legt das Konto in `vitalos-prod` an und trägt E-Mail und Passwort nur in der Console ein. Im Repo stehen die Platzhalter `<nur in der Play Console>`. | bereit zur Freigabe | Owner (Konto anlegen und in die Console schreiben) |
| 12 | Werbedeklaration: Yes oder No. Yes bei Banner, Interstitial, Native Ads und Ad-SDKs. Ein schlichter „More Apps“-Hinweis ohne Werbeformat ist No. Eine falsche Angabe ist ein Policy-Verstoß. | Antwort No. Beleg und der genaue `rg`-Aufruf in `prod/docs/DATA-SAFETY-ANSWERS.md`, Abschnitt „Werbedeklaration: No“. Suche am 2026-11-11 in `prod/` ohne Docs, `node_modules`, `public` und Markdown: keine Treffer auf AdMob, AdSense und die genannten Ad-SDKs. Gradle hängt kein `play-services-ads` ein. | bereit zur Freigabe | Owner (Klick No) |
| 13 | Signiertes Android App Bundle hochladen. `versionCode` höher als jeder schon hochgeladene Stand, `targetSdk` 36, Signatur mit dem Upload-Key (RSA mindestens 2048 Bit). Play App Signing übernimmt den App-Signaturschlüssel. Nach dem Upload die angezeigten SHA-1/SHA-256, bei Hybrid-Signing alle genannten Schlüssel, in Firebase unter `com.vitalos.app` eintragen. Den privaten Keystore nicht hochladen und nicht committen. | Config geprüft (C-015): `versionCode` 1, `versionName` `0.1.0`, `targetSdkVersion` 36, Release-Signatur nur bei vorhandener gitignorierter `prod/android/keystore.properties`. Kopierbares Verfahren im Abschnitt „AAB lokal bauen (C-015)“. Pfad: `prod/android/app/build/outputs/bundle/release/app-release.aab`. SHA-256: `<nach lokalem signiertem bundleRelease eintragen>`. Diese Prüfung hat das Bundle nicht gebaut. | AAB offen | Owner auf der Maschine mit Keystore (signiertes Bundle und Hash), danach Upload |
| 14 | Release auf dem Closed Track anlegen: Bundle, Release Notes, Länder aus Punkt 5, zur Prüfung senden, ausrollen. Danach den Status lesen. Der Opt-in-Link aus Punkt 2 erscheint bei „Published“. Der erste Link kann mehrere Stunden brauchen. | Kein Release, keine Release Notes, kein Console-Status im Repo. | fehlt | Owner |
| 15 | Kontodatum prüfen. Liegt die Kontoeröffnung nach dem 13. November 2023: 12 Tester aus Punkt 2 müssen 14 aufeinanderfolgende Tage opted-in bleiben. Danach im Dashboard „Apply for production“. Liegt sie davor, gilt diese Testpflicht laut Google nicht. | Kein Kontodatum, keine Testerzahl und kein Opt-in-Nachweis im Repo. | fehlt | Owner |

## AAB lokal bauen (C-015)

Geprüft am 2026-11-11, ohne das Bundle zu erzeugen. `versionCode` 1 und
`versionName` `0.1.0` stehen in `prod/android/app/build.gradle`.
`targetSdkVersion` 36 steht in `prod/android/variables.gradle`.
`signingConfigs.release` liest `keystore.properties` über `rootProject` und
wird nur angehängt, wenn `prod/android/keystore.properties` existiert. Die
Datei ist gitignored. Ohne sie signiert Gradle das Release-Bundle nicht, und
Play nimmt es nicht an.

Der Keystore und `prod/.product-config/product.env` bleiben lokal. Nichts
davon ausgeben oder committen. JDK 21 ist der Gradle-Runner für diesen Stand
(Gradle 8.14.3, Plugin `capacitor-local-notifications`). Die Befehle laufen
im Meta-Repo-Root.

```bash
set -a
source prod/.product-config/product.env
set +a
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/share/jvm/jdk-21.0.13+9}"

pnpm run product:build:native
pnpm --dir prod exec cap sync android
( cd prod/android && ./gradlew bundleRelease )
sha256sum prod/android/app/build/outputs/bundle/release/app-release.aab
```

`product:build:native` schreibt die Web-Assets nach `prod/dist-native`.
`cap sync android` kopiert sie ins native Projekt. `bundleRelease` schreibt
das signierte Bundle, sobald `keystore.properties` vorliegt.

Pfad: `prod/android/app/build/outputs/bundle/release/app-release.aab`

SHA-256: `<nach lokalem signiertem bundleRelease eintragen>`

Das Artefakt nicht committen (`*.aab` ist gitignored). Nach dem Upload die
in der Console gezeigten SHA-1/SHA-256 in Firebase unter `com.vitalos.app`
eintragen. Den privaten Keystore nicht hochladen.

In der Prüfungsumgebung von C-015 fehlten Android-SDK, `node_modules`, die
ausgecheckten App-Submodule, `product.env` und `keystore.properties`.
`bundleRelease` wurde dort nicht gestartet.

## Nur wenn die Console die Kachel zeigt

Diese Punkte sind keine eigenen Zeilen, weil die Console sie nur bei passendem
Bundle oder passender Kategorie einblendet. Der Owner beantwortet dann genau
die Kachel unter `Needs attention`:

- Permissions Declaration, wenn Play nach dem AAB danach fragt. Das Manifest
  `prod/android/app/src/main/AndroidManifest.xml` enthält `INTERNET` und
  `POST_NOTIFICATIONS`, keine SMS- oder Call-Log-Permission.
- News, Government, Financial features oder Health, sobald die Kachel erscheint.
  Der Listing-Entwurf beschreibt ein persönliches Journal ohne Diagnose. Die
  Antwort muss zum ausgelieferten Build passen.

## Reihenfolge am Freitag

1. Punkte 3 bis 12 vorbereiten, soweit der Status „fehlt“ oder „teilweise“ ist.
2. Punkt 13: frisches AAB, dann Upload. Signing-Fingerabdrücke danach in Firebase.
3. Punkte 1, 2 und 14: Track, Tester, Release, auf „Published“ warten, Link schicken.
4. Punkt 15 startet mit dem ersten bestätigten Opt-in und entscheidet den
   späteren Produktionsantrag. Er hält den Freitag-Upload nicht auf.

Kein Store-Upload, kein Console-Klick und keine Ausgabe in diesem Auftrag.
