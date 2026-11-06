# Fokus-Sperre Stufe 0 und 1 — Umsetzungsstand (Worktree `focus-stufe-0-1`, Woche 3, 2026-11-06)

Entwurf auf Basis von `~/vitalos-prod/docs/product-dev/ANDROID-FOKUS-STUFE-0-1.md` und
`FOKUS-SPERRMODUS.md` (beide nur gelesen). Alles in diesem Dokument bezieht sich auf
den Worktree `/dev/shm/wt-focus` (Branch `focus-stufe-0-1`, Basis `dev-product`,
Stand `fd78eda`). Kein Android-Build, kein Gerätetest, kein Deploy (siehe „Offen“).

## 1. Web-/TS-Teil: `shouldRemindNow` (Meta-eigen, implementiert und getestet)

`prod/src/focus/remind.js` — reine Funktion ohne Imports:

```js
shouldRemindNow(minimumLogMet, now, settings) // => boolean
```

Regeln (alle zusammen, siehe Modulkopf für Details):

- `minimumLogMet === true` → nie erinnern (Log fehlt ist Bedingung).
- Nur ab `settings.remindHour` (volle Stunde 0–23, Nutzer wählt, Default 10).
- Nicht in der Ruhezeit (`quietStartHour`/`quietEndHour`; Fenster über Mitternacht
  zulässig, z. B. 22–7; unvollständiges Paar deaktiviert die Ruhezeit).
- Höchstens einmal pro Tag: `settings.lastRemindedOn === 'YYYY-MM-DD'` (heute) → nein.
  Der Aufrufer schreibt `lastRemindedOn` nach dem Feuern selbst zurück
  (Geräte-Einstellung, z. B. Capacitor Preferences; kein Backend).
- Ungültiges `now` → konservativ `false` (niegrundlos erinnern).
- Maßgeblich ist die lokale Zeitzone des Geräts (wie im Journal-Baustein).

Tests: `prod/tests/focus-remind.test.mjs`, `node --test`, 9 Tests, lokal im
Worktree ausgeführt: 9 pass, 0 fail (Node v26.13.0, UTC-unabhängig konstruiert).

### Eingabe aus dem Web-Teil: `hasMinimumLogToday` (journal-dev, Commit `9edb12a`)

Wird importiert, NICHT kopiert. Schnittstelle (aus
`git -C ~/dev/journal-dev show 9edb12a:src/lib/focus/minimumLog.js`, rein, 8 Tests im
Quell-Repo):

```js
hasMinimumLogToday(entries, habitCompletions, now, options)
// options.rule: 'journal' | 'habit' | 'any' (Default 'any')
// options.requiredBeforeHour: 0–23 oder undefined (z. B. Regel „4B vor 10 Uhr")
// => true, wenn heute lokal ≥1 Journal-Eintrag mit Text ODER ≥1 Habit-Vollzug
//    (completion === 'DONE') existiert; requiredBeforeHour verlangt zusätzlich
//    prüfbare, vor dieser volle Stunde angelegte Zeitstempel.
```

Geplanter Importweg (Status: **noch nicht verdrahtet**, `src/lib/focus/minimumLog.js`
fehlt im `journal-app`-Integrations-Checkout auf `dev-product` — dort liegt `9edb12a`
noch nicht):

1. journal-dev (Entwicklungsquelle, `~/dev/journal-dev`) merged/integriert den Commit.
2. `journal-app` (Integrations-Checkout im Meta-Repo) nimmt ihn auf
   (ohne Editieren des Modul-Codes von außen).
3. prod verdrahtet über einen Vite-Alias nach dem dortigen Muster (vgl.
   `prod/vite.config.js`, `JOURNAL_DEV`-Auflösung, z. B.
   `'@journal-focus': resolve(JOURNAL_DEV, 'src/lib/focus/minimumLog.js')`)
   oder importiert direkt relativ:
   `'../../journal-app/src/lib/focus/minimumLog.js'`.
4. Adapter im Aufrufer:

```js
import { hasMinimumLogToday } from '@journal-focus'; // nach Schritt 3
const met = hasMinimumLogToday(entries, habitCompletions, now, { rule: 'any' });
if (shouldRemindNow(met, now, settings)) fireReminder();
```

Bis dahin ist `minimumLogMet` in `shouldRemindNow` bewusst ein boolescher Input:
die Erinnerungslogik hängt nur an einem `boolean`, nicht an den Journal-Datenformen
(Entries, Firestore-Timestamps etc. bleiben im Journal-Baustein).

## 2. Stufe 0: Capacitor-Local-Notifications-Anbindung (Entwurf, geprüfter Stand)

Befund am Worktree-Stand `fd78eda`:

- `@capacitor/local-notifications` ist NICHT in `prod/package.json` deklariert —
  auch nicht im restlichen Produkt-Importer. Im gemeinsamen `pnpm-lock.yaml`
  existiert `@capacitor/local-notifications@8.3.1` (Capacitor 8), aber nur über die
  Importer `fitness-app` und `6pack-app` (Meta-Root, private PWA), nicht über `prod`.
- `prod/android` ist ein reguläres Capacitor-Android-Projekt (Package
  `com.vitalos.app`, `MainActivity.java` = leeres `BridgeActivity`);
  `capacitor.settings.gradle` enthält kein Local-Notifications-Plugin → ein
  `cap sync` heute würde es NICHT in den Android-Build bringen.
- `prod/android/app/src/main/AndroidManifest.xml` deklariert nur `INTERNET`;
  `POST_NOTIFICATIONS` fehlt (wird vom Plugin-Manifest gemerged, sobald installiert).

Umsetzungsschritte (offen — erfordern Registry/Install, hier nicht ausgeführt):

1. `@capacitor/local-notifications` (Version aus dem gemeinsamen Lockfile: 8.3.1,
   passend zu Capacitor 8.6.0) in `prod/package.json` aufnehmen und im PrimeCheckout
   installieren (Voll-Install über die langsame Registry bewusst vermieden);
   Lockfile mitführen.
2. `pnpm --filter @vitalos/product run native:sync` (cap sync) im Haupt-Checkout.
3. Vorab-Hinweistext („wofür?“) anzeigen, dann
   `LocalNotifications.requestPermissions()` — Android 13+ verlangt
   `POST_NOTIFICATIONS` zur Laufzeit.
4. Feuern entweder (a) beim App-Öffnen per Polling: `shouldRemindNow(...)` prüfen
   und `LocalNotifications.schedule({ allowWhileIdle: true, ... })` feuern, oder
   (b) vorgeplant pro Tag — Empfehlung (a) für Stufe 0: kein Alarm-Management,
   kein Reboot-Handling; das Prüfkriterium „feuert nach Neustart und im Doze-Modus“
   bleibt dadurch ausdrücklich offen und ist nur auf einem echten Gerät prüfbar.
5. Erfolgsfall: `settings.lastRemindedOn` = heutiger lokaler Tag schreiben.
   Erfüllten Log nie benachrichtigen (Ruhezeit + Deckelung regelt `shouldRemindNow`).

Keine Server-Abhängigkeit, kein Backend-Deploy (Konzept Stufe 0 eingehalten).

## 3. Stufe 1: `UsageStatsPlugin` (Kotlin-Skizze, angelegt, NICHT gebaut)

Datei: `prod/src/native/focus/UsageStatsPlugin.kt` — bewusst außerhalb des
Gradle-Source-Sets (`android/app/src/main/java`), damit der Android-Build der
Android-Linie unberührt bleibt. Skizze enthält Endintegrations-Schritte im Kopf:

- Design: `@CapacitorPlugin(name = "UsageStats")`; Methoden `hasPermission`,
  `requestPermission`, `getTodayUsage` (Top-5 je App + Tages-Summe in Minuten,
  eigene App ausgeschlossen, `UsageStatsManager.queryAndAggregateUsageStats`
  über den heutigen lokalen Kalendertag).
- Manifest: `PACKAGE_USAGE_STATS` als `ProtectedPermissions`-Eintrag.

Berechtigungsfluss (dokumentiert, umsetzbar; Ablehnung bleibt absturzfrei):

1. Web-Start: `UsageStats.hasPermission()` → AppOpsManager-Prüfung (`OPSTR_PACKAGE_USAGE_STATS`, `Process.myUid()`), liefert `{ granted: boolean }` ohne Crash.
2. Falls nicht erlaubt: UI erklärt Zweck (Nutzungsmessung, lokal), dann
   `UsageStats.requestPermission()` → `Settings.ACTION_USAGE_ACCESS_SETTINGS`;
   der Nutzer erteilt die Berechtigung selbst in den Systemeinstellungen
   (kein Runtime-Dialog — besondere App-Ops-Berechtigung).
3. Rückkehr in die App: `handleOnActivityResult` prüft erneut und löst den
   gespeicherten Call auf (`USER_DENIED`, falls weiter verweigert).
4. `getTodayUsage()` ohne Berechtigung → kontrollierter Rejection-Fehler
   (`PERMISSION_DENIED`), kein Absturz.
5. Daten bleiben lokal; Data Safety + Datenschutzerklärung sind vor Release
   anzupassen (Roadmap p3) — hier nur vermerkt.

Registrierung bei der Endintegration: eine Zeile in
`MainActivity.java` (`register(UsageStatsPlugin.class)`); konkrete Capacitor-8-
Signatur beim Build gegen die lokale Android-Ausstattung prüfen.

## Explicit-open list (nicht als erledigt melden!)

- Android-Build / Gradle-Sync wurde NICHT ausgeführt (auch kein `cap sync`).
- Keine nativen Tests, kein Gerätetest, kein Neustart-/Doze-/Ablehnungs-Praxistest.
- `minimumLog` ist auf `dev-product` noch nicht in `journal-app` integriert;
  Importweg oben dokumentiert, nicht umgesetzt — Journal-Modul-Code nicht editiert.
- `@capacitor/local-notifications` NICHT installiert (bewusst, Registry-Regel);
  daher kein Test der nativen Benachrichtigung möglich.
- Messwert-Vergleich mit Digital Wellbeing offen (nur auf echtem Gerät möglich).
- Signierter Release-Build offen.
