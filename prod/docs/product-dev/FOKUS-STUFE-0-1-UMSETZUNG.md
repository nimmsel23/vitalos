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

Tests: `prod/tests/focus-remind.test.mjs`, `node --test`, lokal im
Worktree ausgeführt (Node v26.13.0, UTC-unabhängig konstruiert).

### `explainReminderDecision` (reason-erhaltende Variante)

```js
explainReminderDecision(minimumLogMet, now, settings) // => { remind: boolean, reason: string }
```

Gleiche Entscheidung wie `shouldRemindNow` (das delegiert seitdem daran), zusätzlich
mit stabil geordnetem Grund für UI/Debugging/Controller:

| reason | Bedeutung |
|---|---|
| `minimum-log-met` | Log erfüllt — nie erinnern |
| `invalid-now` | ungültige Uhrzeit — konservativ nicht erinnern |
| `before-remind-hour` | vor `remindHour` |
| `quiet-time` | in der Ruhezeit |
| `already-reminded-today` | `lastRemindedOn` ist heute |
| `remind` | alle Bedingungen erfüllt — feuern |

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
(Entries, Firestore-Timestamps etc. bleiben im Journal-Baustein). Der Controller
(`src/focus/controller.js`) nimmt den Adapter als injizierte Funktion
`getMinimumLogMet(now)` — siehe Abschnitt 2.

## 2. Web-Nähte für die Integration (Meta-eigen, implementiert und getestet)

Alle Dateien unter `prod/src/focus/`, reine Module ohne Capacitor-/Registert-importe;
Abhängigkeiten werden injiziert, damit die Logik heute ohne Install/Gerät läuft:

| Modul | Aufgabe |
|---|---|
| `settings.js` | Defaults (`DEFAULT_FOCUS_SETTINGS`), `normalizeFocusSettings` (defensiv, verwirft Ungültiges), `read/writeFocusSettings(storage)` mit injiziertem Storage (localStorage oder Capacitor Preferences), `createMemoryStorage` für Tests |
| `remind.js` | Entscheidung (Abschnitt 1), zusätzlich `localDateKey` exportiert |
| `controller.js` | `createReminderController({ getMinimumLogMet, loadSettings, saveSettings, sendNotification, now })` → `checkToday(): { sent, reason, settings }` |
| `usageStats.js` | Stufe-1-Webseite: `normalizeUsageReport` (defensiv gegen kaputte Plugin-Daten), `usageStatsStep` (UI: unavailable/needs-permission/ready), `getUsageToday(plugin)` (nie Throw), `evaluateDailyLimit` (nur Status, setzt noch keine Sperre durch) |
| `notifications.js` | Adapter-Entwurf: `createNotificationAdapter(plugin)` — das echte `@capacitor/local-notifications`-Modul wird ÜBERGEBEN, nicht importiert (Registry-Regel); ohne Plugin `available: false`, `send()` bleibt `false` |

Controller-Ablauf (Fehler-Philosophie: konservativ, kein Reminder-Spam):

```
checkToday()
  → loadSettings + normalize
  → getMinimumLogMet(now)            | Adapter-Fehler → reason 'minimum-log-unavailable', NICHT erinnern
  → explainReminderDecision          | Grund-Durchreichung aus remind.js
  → sendNotification({title, body})  | false/Throw → 'notification-failed',
                                      |   KEIN Schreiben von lastRemindedOn (Retry später am Tag)
  → saveSettings(lastRemindedOn=heute) | Schreibfehler annulliert die gestellte
                                      |   Benachrichtigung nicht (schlimmstenfalls morgen erneut)
  → { sent: true, reason: 'sent' }
```

Geplante Verdrahtung in der App (eine Stelle, nach Installation des Plugins):

```js
const storage = Capacitor Preferences oder localStorage;       // Naht aus settings.js
const controller = createReminderController({
  getMinimumLogMet: (now) => Promise.resolve(hasMinimumLogToday(entries, habitCompletions, now, { rule: 'any' })),
  loadSettings: () => readFocusSettings(storage),             // settings.js
  saveSettings: (s) => writeFocusSettings(storage, s),
  sendNotification: (n) => createNotificationAdapter(LocalNotifications).send(n), // nach Install
  now: () => new Date(),
});
```

Tests (alle `node --test`, ausgeführt im Worktree, **36 pass / 0 fail** gesamt):
`focus-remind.test.mjs` (13, inkl. Explain-Gründe und Null-Stunden-Regression),
`focus-settings.test.mjs` (6), `focus-controller.test.mjs` (7),
`focus-usage.test.mjs` (10, inkl. Notification-Adapter-Entwurf).

Gefundene und gefixte Randfälle als Dauer-Regressionstests:

- `Number(null) === 0`: fehlende `quietStartHour`/`quietEndHour` wurde zu
  Mitternachtsstunde 0 verbogen (halbe Paare bauten ein Ruhezeit-Fenster ab
  `quietStart` statt zu deaktivieren). Beide `hourOr`-Implementierungen
  (remind.js, settings.js) behandeln null now explizit.
- Doppelt normalisieren ist idempotent (read → normalize → write → read).
- Grenzwert `totalMinutes === limitMinutes` gilt als `over` (dann wird gewarnt/gesper).

## 3. Stufe 0: Capacitor-Local-Notifications-Anbindung (Entwurf, geprüfter Stand)

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

Die Schritte 3–5 greifen nach Installation direkt auf den fertigen Adapter
`src/focus/notifications.js` zurück: `createNotificationAdapter(LocalNotifications)`
kapselt `checkPermissions`/`requestPermissions` (inkl. `prompt`-Übergang) und
`schedule` mit `allowWhileIdle`; API-Annahmen sind im Modulkopf für die
Verifikation gegen 8.3.1 markiert. Der Controller (Abschnitt 2) konsumiert nur
`send({title, body})`.

Keine Server-Abhängigkeit, kein Backend-Deploy (Konzept Stufe 0 eingehalten).

## 4. Stufe 1: `UsageStatsPlugin` (Kotlin-Skizze, angelegt, NICHT gebaut)

Datei: `prod/src/native/focus/UsageStatsPlugin.kt` — bewusst außerhalb des
Gradle-Source-Sets (`android/app/src/main/java`), damit der Android-Build der
Android-Linie unberührt bleibt. Skizze enthält Endintegrations-Schritte im Kopf:

- Design: `@CapacitorPlugin(name = "UsageStats")`; Methoden `hasPermission`,
  `requestPermission`, `getTodayUsage` (Top-5 je App + Tages-Summe in Minuten,
  eigene App ausgeschlossen). Messweg überarbeitet: Ereignis-Stitching per
  `UsageStatsManager.queryEvents` (`MOVE_TO_FOREGROUND` öffnet, `MOVE_TO_BACKGROUND`/
  `ACTIVITY_STOPPED` schließt ein Intervall, offene Intervalle werden an `now`
  geklemmt), weil `UsageStats.totalTimeInForeground` System-/Lockscreen-Zeiten
  überzeichnen kann; Fallback auf `queryAndAggregateUsageStats` mit
  `approximate: true` im Ergebnis, falls heute noch keine Events vorliegen.
  Web-Seite: `src/focus/usageStats.js` normalisiert das
  `{ totalMinutes, approximate, apps }`-Ergebnis defensiv und wertet es gegen
  `settings.dailyMinutesLimit` aus (Abschnitt 2).
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
- Die 36 grünen node:test-Fälle (Abschnitt 2) prüfen ausschließlich die reinen
  JS-Module mit injizierten Fakes — sie sind KEIN Nachweis für natives Verhalten,
  Plugin-Wirklichkeit oder Geraeteverhalten.
