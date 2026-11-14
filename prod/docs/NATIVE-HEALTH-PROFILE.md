# Native Profilübernahme aus Health

Stand 2026-11-14. Produktquelle `~/vitalos/prod`, kein PWA-Health-Zugriff.

Nach dem ersten Login pro Konto und Installation erscheint ein freiwilliges
Angebot. „Manuell / später“ schließt es ohne Systemabfrage. Erneuter Import
ist im Körperprofil möglich. Es gibt keine dauerhafte Verbindung und keinen
Hintergrundsync: jeder Import wird ausdrücklich gestartet und bestätigt.

## Daten und native Anbindung

- Android: `@capgo/capacitor-health` 8.12.1 (Capacitor 8) liest Health Connect.
  Nur `height` und `weight`; keine Schreibrechte. Die History-Berechtigung
  erlaubt ältere Größen-/Gewichtswerte auf unterstützten Providern. Ohne sie
  wird nur ein 29-Tage-Fenster abgefragt und die Begrenzung erklärt.
  Alle Seiten werden gelesen und zeitlich sortiert: der Adapter begrenzt
  sonst vor dem Sortieren und könnte einen alten Wert als neuesten liefern.
- iOS: `VitalOSHealthProfilePlugin` in der bereits kompilierten
  `SceneDelegate.swift`, Registrierung durch `HealthBridgeViewController`.
  Eine HealthKit-Freigabe für Größe/Gewicht und auf Wunsch Geburtsdatum;
  kein Schritt-/Geschlechts-/Trainings-/Schlafzugriff. Query jeweils neuester
  Wert bis jetzt, Größe in cm, Gewicht in kg. HealthKit unterscheidet für
  Leser absichtlich nicht zwischen verweigerten und fehlenden Angaben.
- Android-Mindestversion steigt durch den Health-Adapter von API 24 auf 26.
  Provider-Verfügbarkeit wird vor der Freigabe geprüft. Kein OAuth-Client,
  kein API-Key und kein Entwickler-Setup pro Nutzer.
- `App.entitlements`, beide Xcode-Build-Konfigurationen und die HealthKit-
  Capability sind gesetzt. Apple-Provisioning muss HealthKit unterstützen.

## Profil und Schutz gegen Überschreiben

Native Resultate bleiben nur im Arbeitsspeicher bis „Bestätigen & speichern“.
Messdatum und Werte sind sichtbar. Verwerfen und Überspringen schreiben
nichts. Nur vorhandene, validierte Angaben ersetzen Profilwerte; fehlende
Angaben bekommen keine erfundenen Defaults. Werte folgen den bestehenden
Profilgrenzen (120–230 cm, 30–300 kg, 15–99 Jahre).

Die Speicherung nutzt den vorhandenen `updateUserProfile`-Weg, jetzt als
atomaren Firestore-Batch nach UID-Prüfung: `users/{uid}` und gemeinsames
`users/{uid}/meta/profile`. Herkunft/Importzeit/Messzeiten liegen im Root als
`healthProfileImport`; das optionale `birthDate` liegt auch im gemeinsamen
Profil. Der Shell-Store wird erst nach erfolgreichem Commit aktualisiert.
Cloud-Hydration muss vor dem Onboarding fertig sein; alte Account-Antworten
werden verworfen. Der aktuelle Alterswert wird beim Import berechnet,
nicht als laufender Geburtstagssync.

## Datenschutz und Release

Die Bestätigung benennt die Speicherung im VitalOS-Cloudkonto und das
Ersetzen der betroffenen Angaben. Health-Connect-Rationale lädt offline
`public/privacypolicy.html` aus den nativen Assets. Widerruf in den
Systemeinstellungen stoppt weitere Zugriffe; bereits importierte Werte
bleiben bis Profiländerung oder Kontolöschung bestehen.

Vor Veröffentlichung: öffentliche Datenschutzerklärung mit lokalem Zusatz
abgleichen; Play Health-Connect-Erklärung/Data Safety und App-Store-Angaben
auf Größe/Gewicht sowie optional Geburtsdatum aktualisieren. Nächste
Store-Version braucht eigenen versionCode/Buildnummer. Kein Upload oder
Deployment aus dieser Umsetzung ableiten.

## Prüfung

- `node --test prod/src/native/healthProfile.test.mjs` (aus Meta-Root).
- Mit vorhandener Produktumgebung: `pnpm run product:native:sync`.
- Android: aus `prod/android`, Temurin 21, `ANDROID_USER_HOME=$HOME/.android`,
  `./gradlew --no-daemon --max-workers=1 -Dorg.gradle.jvmargs=-Xmx1536m assembleDebug`.
- Nach Build das zusammengeführte Manifest auf genau drei Health-READ-
  Berechtigungen und vorhandene Rationale-Activity prüfen.

Geräteabnahme offen: Android mit/ohne Provider, partielle/abgelehnte Freigabe,
alte Größenmessung mit/ohne History, iPhone mit optionalem Geburtsdatum,
Bestätigung und Profil nach erneutem Login, Accountwechsel und Offline-
Speicherfehler. Linux kann keinen Xcode-/iOS-Build nachweisen.
