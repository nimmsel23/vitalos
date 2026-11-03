# VitalOS Store-Vorbereitung

Stand: 3. November 2026. Keine native Store-Version gebaut, signiert, verteilt,
eingereicht oder veröffentlicht.

**Nachtrag:** Der inzwischen saubere Edition-Worktree enthält auf `73f1384`
einen gemeinsamen Store-Modus. Sein neuerer Projekt-Audit unterscheidet das
bisherige private Firebase-Projekt `fitness-aos` vom Zielkonto
`nimmdaniel@gmail.com`, für das dort noch kein VitalOS-Projekt sichtbar war.
Die unten erwähnte Abfrage von `fitness-aos` bestätigt daher kein geeignetes
Store-Backend. Ein neues Projekt darf nicht ohne den Kontoinhaber angelegt oder
mit privaten Bestandsdaten befüllt werden.

## Produkt- und Quellstand

- Ziel ist **ein** Store-Eintrag „VitalOS“. Observe und Operate sind Free- und
  Premium-Zugänge desselben Produkts; sie begründen keine getrennten App-IDs.
- Das Meta-Repo steht auf `master`. Sein `journal-app`-Gitlink ist
  `adc22d91b0728c6df00d0774e356d0a5da394fbe`.
- Der Journal-Quellcheckout `/home/alpha/dev/journal-dev` steht auf `dev`, Commit
  `c9fd4d8321050e8f6d43fd9c4ca9e51f5c9313dd` (14 Commits vor `vitalos`). Der
  erfolgreiche Webbuild unten stammt von diesem Dev-Stand, nicht vom im
  Meta-Repo gepinnten Commit.
- Der eigenständige `vos-observe`-Prototyp ist eine Vite-/Firebase-PWA. Im
  `master`-Checkout gibt es keinen `vos-operate`-Pfad. Ein separater
  `feat/vos-observe-operate`-Worktree liegt bei Commit
  `8d230815ecb908dba5d1266954947c51144ae543`, hat lokale Änderungen und
  generierte `dist-observe`-/`dist-operate`-Verzeichnisse. Diese Arbeit wurde
  nicht verändert.
- Weder `journal-dev` noch `vos-observe` enthalten ein Capacitor-Android- oder
  iOS-Projekt. Ein anderes VitalOS-Produkt (`6Pack`) verwendet Capacitor 8.5.3
  und Android Target SDK 36; dessen App-ID `at.vitalos.sixpack` gehört nicht zu
  VitalOS und wird nicht wiederverwendet. Für VitalOS ist noch keine
  registrierte Bundle-ID/Application-ID nachgewiesen.

## Geprüfte lokale Builds und Grenzen

- `CI=true pnpm test` in `/home/alpha/dev/journal-dev`: **140/140 Tests grün**.
  Darunter Smart-Log-Schema, Request-Wiederholung, Kontingent, Apply-Idempotenz,
  offlinefähige Datenpfade und Habit-Datenlogik.
- `CI=true pnpm run build:firebase` im selben Checkout: **erfolgreicher
  Firebase-Webbuild** (`dist-firebase`, 61 Precache-Einträge).
- Firestore verwendet persistente lokale IndexedDB-Caches. Das belegt die
  technische Offline-Grundlage, aber noch keinen vollständigen angemeldeten
  Durchlauf auf einem Telefon oder Emulator.
- Die vorhandene Anmeldung ruft `signInWithPopup` für Google auf. Eine native
  OAuth-Rückkehr, Sign in with Apple und eine In-App-Kontolöschung sind in den
  geprüften Quellen nicht implementiert. Firebase-App-Registrierungen konnten
  wegen abgelaufener lokaler CLI-Credentials nicht abgefragt werden.
- Dieser Linux-Rechner hat kein `xcodebuild`, Android SDK, `adb` oder Gradle im
  PATH; es wurde kein Gerät gefunden. Daher ist hier weder ein AAB noch ein
  iOS-Archiv erzeugt oder auf einem Gerät getestet worden.

## Empfohlener Releaseweg

Ein einzelnes Capacitor-Projekt soll den gemeinsamen VitalOS-Webbuild verpacken.
Observe/Operate-Zugang und Smart-Log-Kontingent bleiben accountgebunden. Zuerst
müssen App-ID und OAuth-Rückkehr feststehen; danach folgen Android und iOS als
getrennte native Builds. Der Web-Checkout wird nicht als Premium-Kaufweg in die
Store-App übernommen.

Für neue Google-Play-Einreichungen ist derzeit Android 16 / API 36 erforderlich.
Neue persönliche Play-Developer-Konten, die nach dem 13. November 2023 angelegt
wurden, benötigen vor Produktionszugang einen geschlossenen Test mit mindestens
12 durchgehend angemeldeten Testern über 14 Tage. Apple verlangt bei
Account-Erstellung eine leicht auffindbare In-App-Kontolöschung und bei
Google-Login einen gleichwertigen Login-Dienst mit privater E-Mail-Option.
Store-Anforderungen unmittelbar vor Einreichung erneut prüfen.

Digitale Premium-Funktionen müssen grundsätzlich über Google Play Billing bzw.
Apple In-App Purchase angeboten werden, vorbehaltlich der jeweiligen
regionalen Ausnahmen. Ein Coaching-Angebot ist ein eigener Service; der
Store-Eintrag darf nicht unbesehen auf Patreon als alternativen Kaufweg für
App-Funktionen verweisen.

Vor Einreichung sind außerdem Googles Data-Safety-Formular und Health-Apps-
Erklärung sowie Apples App-Privacy-Angaben anhand des tatsächlichen Datenflusses
und aller eingebundenen SDKs auszufüllen. Apple prüft auch Mindestfunktionalität;
ein nativer Web-Container allein ist kein Abnahmenachweis.

Offizielle Quellen, geprüft am 3. November 2026:

- [Google Play: Target-API-Anforderungen](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Testanforderungen für neue persönliche Konten](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: Zahlungen und digitale In-App-Funktionen](https://support.google.com/googleplay/android-developer/answer/10281818)
- [Google Play: Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Google Play: Health-Apps-Erklärung](https://support.google.com/googleplay/android-developer/answer/14738291)
- [Apple: App Review Guidelines, insbesondere 3.1.1, 4.2 und 4.8](https://developer.apple.com/app-store/review/guidelines/)
- [Apple: Kontolöschung in der App](https://developer.apple.com/support/offering-account-deletion-in-app/)
- [Apple: App-Privacy-Angaben](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy)

## Listing-Entwurf

**Name:** VitalOS

**Google-Play-Kurzbeschreibung:** Journal, Tagesgewohnheiten und nächste
Schritte für deinen Alltag.

**Apple-Untertitel:** Journal und Gewohnheiten

**Beschreibung:**

VitalOS hilft dir, deine eigenen Vorhaben im Alltag im Blick zu behalten.
Schreibe Journaleinträge, verfolge selbst gewählte Tagesgewohnheiten und nutze
deine Notizen, um einen nächsten Schritt festzuhalten.

- Erfasse Gedanken und Ereignisse in deinem persönlichen Journal.
- Ordne Einträge bei Bedarf deinen Gewohnheiten und Vitalitäts-Skills zu.
- Prüfe erkannte Smart-Log-Vorschläge und bearbeite sie, bevor du sie
  übernimmst.
- Nutze manuelle Einträge und Tags unabhängig von der Smart-Log-Nutzung.

Smart Logging startet nur auf deine ausdrückliche Aktion. Dabei wird der
ausgewählte Text serverseitig von Gemini verarbeitet. KI-Zuordnungen sind
Vorschläge und müssen vor der Übernahme geprüft werden. VitalOS ist ein
persönliches Journal- und Organisationswerkzeug und stellt keine Diagnose.

Dieser Text ist ein Entwurf, keine freigegebene Store-Aussage. Vor Einreichung
müssen Oberfläche, Datenfluss, Kontolöschung, Support- und Datenschutzseiten,
App-Privacy-/Data-Safety-Angaben und verfügbare Entitlements mit dem finalen
integrierten Build abgeglichen werden. Store-Screenshots fehlen; sie müssen aus
dem getesteten Build mit echten, freigegebenen Beispieldaten erstellt werden.

## Homepage-Downloadbereich

Die Quelle der Vitaltrainer-Seite ist
`/home/alpha/Vitaltraining/daniel-vitaltrainer-firebase/src/vitalos.html`.
Der Abschnitt direkt über dem Footer wurde dort ergänzt. Die zentralen
Store-URLs stehen in `src/vitalos-store-links.mjs` und sind vorerst leer, da
keine öffentlichen VitalOS-Store-Produktseiten gefunden wurden. Der Abschnitt
bleibt dadurch verborgen und kann Android und iOS unabhängig anzeigen.

Der Website-Check (`npm run check`) und Tests für keinen Store, nur Android,
nur iOS, beide Stores sowie ungültige Links waren in einer temporären Kopie des
aktuellen Website-Arbeitsstands erfolgreich. Die Homepage-Datei hatte bereits
uncommittete Änderungen; diese wurden erhalten und nicht committed oder
gepusht.

## Nächste externe Voraussetzungen

1. Im interaktiven Terminal `firebase login --reauth` ausführen; danach
   `firebase apps:list --project fitness-aos` erneut abfragen, um bestehende
   Android-/iOS-Registrierungen und IDs zu bestätigen.
2. Vor dem Festlegen der dauerhaften VitalOS-App-ID bestätigen, ob in Play
   Console oder App Store Connect bereits ein VitalOS-App-Eintrag existiert.
3. Für Android ein Android-SDK plus Emulator oder Testgerät bereitstellen.
   Nach Einrichtung von Capacitor und bestätigter App-ID lautet der native
   Buildpfad: `pnpm exec cap add android`, `pnpm exec cap sync android`, dann
   `cd android && ./gradlew bundleRelease`.
4. Für iOS Zugriff auf macOS mit unterstütztem Xcode und ein echtes iPhone
   bereitstellen. Nach Einrichtung des Capacitor-Projekts folgt auf dem Mac
   `pnpm exec cap add ios`, `pnpm exec cap sync ios`, dann Archivierung und
   Signing in Xcode.
5. Kontolöschung, native OAuth-/Deep-Link-Rückkehr und Store-konforme Käufe
   implementieren und anschließend den vollständigen Online-/Offline-Ablauf
   auf beiden Plattformen prüfen.

Die folgenden Übergänge sind getrennte Releasezustände: gebaut, auf Emulator/
Gerät geprüft, signiert, intern verteilt, eingereicht und öffentlich gelistet.
Eine Store-Einreichung oder Veröffentlichung ist nicht beauftragt.
