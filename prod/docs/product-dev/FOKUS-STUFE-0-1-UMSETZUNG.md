# Fokus-Sperre Stufe 0 und 1 — Umsetzungsstand (Worktree `focus-stufe-0-1`, Woche 3, 2026-11-06)

Entwurf auf Basis von `~/vitalos-prod/docs/product-dev/ANDROID-FOKUS-STUFE-0-1.md` und
`FOKUS-SPERRMODUS.md` (beide nur gelesen). Ursprünglicher Bezugsstand: Worktree
`/dev/shm/wt-focus` (Branch `focus-stufe-0-1`, Basis `dev-product`, Stand `fd78eda`).

**Aktualisiert am 2026-11-06 auf dem Haupt-Checkout `/home/alpha/vitalos` (`dev-product`):**
Der Groundwork-Stand `acd9906` ist in `dev-product` aufgegangen; danach landeten
`9bd71c9` (Local-Notifications-Deklaration, gemeinsames Lockfile, `POST_NOTIFICATIONS`)
und `b8e7f84` (`reminderRunner` mit injiziertem Plugin/Speicher). Die Branches
`focus-stufe-0-1`, `focus-notifications` und `focus-runner` sind vollständig in
`dev-product` gemerged. Android-Build, `cap sync`, Gerätetest und Deploy laufen
weiterhin nicht (siehe „Offen“).

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

Geplanter Importweg (Status: **noch nicht verdrahtet** — `src/lib/focus/minimumLog.js`
fehlt im `journal-app`-Integrations-Checkout auf `dev-product`; `9edb12a` ist im
Quellrepo `~/dev/journal-dev` auf `origin/dev` gepusht, aber noch nicht auf der
`vitalos`-Gitlink-Branche, über die `journal-app` integriert):

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
| `minimumLogAdapter.js` | `createMinimumLogAdapter({ hasMinimumLogToday, loadEntries, loadHabitCompletions, options })` — liefert dem Controller `getMinimumLogMet(now)` als echten boolean (Truthy-Coercion), reicht Options/Daten durch, wirft bewusst bei fehlender Verdrahtung → Controller reason 'minimum-log-unavailable' |
| `usageStats.js` | Stufe-1-Webseite: `normalizeUsageReport` (defensiv gegen kaputte Plugin-Daten, reicht `approximate` des Kotlin-Fallbacks durch), `usageStatsStep` (UI: unavailable/needs-permission/ready), `getUsageToday(plugin)` (nie Throw), `evaluateDailyLimit` (nur Status, setzt noch keine Sperre durch; `no-limit` reicht die Messwerte durch) |
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
  getMinimumLogMet: createMinimumLogAdapter({                  // minimumLogAdapter.js
    hasMinimumLogToday,                                         // Import siehe Abschnitt 1, sobald 9edb12a integriert
    loadEntries: () => Journal-Store-lädt,                      //  z. B. Firestore-Snapshot der heutigen Entries
    loadHabitCompletions: () => Habit-Store-lädt,
    options: { rule: 'any' },
  }),
  loadSettings: () => readFocusSettings(storage),               // settings.js
  saveSettings: (s) => writeFocusSettings(storage, s),
  sendNotification: (n) => createNotificationAdapter(LocalNotifications).send(n), // nach Install
  now: () => new Date(),
});
```

Tests (alle `node --test`, ausgeführt im Worktree, **40 pass / 0 fail** gesamt):
`focus-remind.test.mjs` (13, inkl. Explain-Gründe und Null-Stunden-Regression),
`focus-settings.test.mjs` (6), `focus-controller.test.mjs` (10, inkl. MinimumLog-Adapter),
`focus-usage.test.mjs` (11, inkl. Notification-Adapter-Entwurf und approximate-Flag).

Gefundene und gefixte Randfälle als Dauer-Regressionstests:

- `Number(null) === 0`: fehlende `quietStartHour`/`quietEndHour` wurde zu
  Mitternachtsstunde 0 verbogen (halbe Paare bauten ein Ruhezeit-Fenster ab
  `quietStart` statt zu deaktivieren). Beide `hourOr`-Implementierungen
  (remind.js, settings.js) behandeln null now explizit.
- Doppelt normalisieren ist idempotent (read → normalize → write → read).
- Grenzwert `totalMinutes === limitMinutes` gilt als `over` (dann wird gewarnt/gesper).

## 3. Stufe 0: Capacitor-Local-Notifications-Anbindung (Entwurf, geprüfter Stand)

Stand nach `9bd71c9` (Dep/Manifest/Lockfile, 2026-11-06) und dem Sync-Nachtrag auf
`dev-product` (gleicher Tag):

- `@capacitor/local-notifications@8.3.1` ist in `prod/package.json` deklariert und
  über den `prod`-Importer im gemeinsamen `pnpm-lock.yaml` aufgelöst. Das Paket lag
  bereits im pnpm-Store (Importer `fitness-app`/`6pack-app` im Meta-Root), die
  Verlinkung lief offline: `pnpm install --offline --filter @vitalos/product`
  (Root) — kein Registry-Zugriff nötig.
- `POST_NOTIFICATIONS` steht seit `9bd71c9` in
  `prod/android/app/src/main/AndroidManifest.xml`.
- `cap sync android` wurde ausgeführt: `capacitor.settings.gradle`/
  `capacitor.build.gradle` binden `:capacitor-local-notifications` (cap-Ausgabe:
  „Found 2 Capacitor plugins for android“, Kopie der Assets nach
  `android/app/src/main/assets/public`, gitignored). Zugrundeliegender Web-Build:
  `pnpm run build:native` mit Firebase-Isolation PASS für `dist-native`.

Umsetzungsschritte (Planung von `fd78eda`, erledigte markiert):

1. [erledigt] Plugin deklarieren, offline installieren, Lockfile mitführen
   (`9bd71c9`; Offline-Verlinkung wie oben).
2. [erledigt] Web-Build + `cap sync android` im Haupt-Checkout (2026-11-06).
3. [erledigt, minimal] Vorab-Hinweistext („wofür?“) und
   `LocalNotifications.requestPermissions()` — im Debug-Schalter
   `prod/src/focus/DebugReminderPanel.jsx` (nur bei Builds mit
   `VITE_FOCUS_DEBUG=1` im Bundle, siehe unten): fragt die Berechtigung erst
   beim Knopfdruck an und ruft danach `runReminderCheck` mit dem echten Plugin
   auf. Android 13+ verlangt `POST_NOTIFICATIONS` zur Laufzeit.
4. [Stub für Stufe 0] Feuern beim App-Öffnen: das Debug-Panel deckt den
   Emulator-/Abnahmebeweis ab; die echte Anbindung (Aufruf beim App-Start mit
   Nutzerwerten) bleibt offen. Empfehlung (a) Polling bleibt Stand der Planung —
   kein Alarm-Management, kein Reboot-Handling; das Prüfkriterium „feuert nach
   Neustart und im Doze-Modus“ bleibt ausdrücklich offen und ist nur auf einem
   echten Gerät/Emulator prüfbar (Handoff-Rezept
   `~/dev/HANDOFF-woche3-emulator-stufe0-REZEPT.md`).
5. [teilweise] Erfolgsfall: `settings.lastRemindedOn` schreibt der Runner erst
   nach erfolgreichem Planen selbst. Debug-Panel nutzt einen localStorage-Adapter
   als Speicher; die echte Settings-UI (remindHour/Ruhezeit, Speicherwahl,
   Capacitor Preferences) ist offen. Erfüllten Log nie benachrichtigen (regeln
   `shouldRemindNow` und der Test-Schalter „Mindest-Log heute erfüllt“).

Die Schritte 3–5 greifen nach Installation direkt auf den fertigen Adapter
`src/focus/notifications.js` zurück: `createNotificationAdapter(LocalNotifications)`
kapselt `checkPermissions`/`requestPermissions` (inkl. `prompt`-Übergang) und
`schedule` mit `allowWhileIdle`; API-Annahmen sind im Modulkopf für die
Verifikation gegen 8.3.1 markiert. Der Controller (Abschnitt 2) konsumiert nur
`send({title, body})`.

Keine Server-Abhängigkeit, kein Backend-Deploy (Konzept Stufe 0 eingehalten).

### Debug-Schalter (Minimal-UI, nur Debug-Builds, Android-Linie)

`prod/src/focus/DebugReminderPanel.jsx` + Gate in `prod/src/main.jsx`:
Eingebaut nur, wenn zur Build-Zeit `VITE_FOCUS_DEBUG=1` gesetzt ist
(React.lazy-Chunk, im Web-Build sichtbar als `assets/DebugReminderPanel-*.js`).
Ohne das Flag existiert das Panel nicht im Bundle; Release-Builds sind
unberührt. Der Schalter „Mindest-Log heute erfüllt“ setzt `minimumLogMet` für
den Test; Standort des Panels: fixe Overlay-Box unten links (über Auth-Gate
montiert, damit sie vor der Anmeldung erreichbar ist). Ruft `runReminderCheck`
(`reminderRunner.js`, Android-Linie) mit dem echten Plugin auf; der Controller
(Abschnitt 2, Vibe C) ist die produktive Gegenseite derselben Logik.

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

## Explicit-open list (Stand 2026-11-06, Haupt-Checkout `dev-product`)

Läuft und ist belegt:

- `@capacitor/local-notifications@8.3.1` deklariert, offline verlinkt, `cap sync android`
  ausgeführt (`capacitor.settings.gradle`/`capacitor.build.gradle` binden das Plugin).
- Web-Build `dist-native` mit Debug-Flag: Firebase-Isolation PASS, Panel als eigener
  Chunk (`assets/DebugReminderPanel-DRJHmj2J.js`), kopiert nach
  `android/app/src/main/assets/public`.
- Debug-APK gebaut (2026-11-06, aus `dev-product`, Quellstand inkl. Fokus-Commits
  bis `b8e7f84`):
  `prod/android/app/build/outputs/apk/debug/app-debug.apk`,
  8 140 679 B, SHA-256
  `57d0bbd876415014ca39b351544426cf4ca55030101833cc78395dd133ec003b`,
  apksigner verify OK — Signer = registrierter Debug-Key
  (`8A:07:CC:FA:F6:3E:C1:09:48:27:52:2D:F0:2B:DE:28:6F:0D:9E:9D`).
  Buildkommando:
  `cd prod/android && JAVA_HOME=<Temurin 21 / JDK 21> ANDROID_USER_HOME=$HOME/.android ./gradlew assembleDebug`.
  Toolchain: Gradle 8.14.3/AGP 8.13, JDK 21 (`~/.local/share/jvm/jdk-21.0.13+9`);
  der Android-Studio-JBR 25 scheitert hier an `Unsupported class file major
  version 69` (Gradle läuft nicht auf Java 25 — Gradle-Runner und Kotlin- -
  /AGP-Level sind getrennte Angaben).
- **Debug-Keystore-Falle (beim Bau festgestellt):** Ohne `ANDROID_USER_HOME=$HOME/.android`
  signiert AGP 8.13 Debug-Builds mit `~/.config/.android/debug.keystore`
  (SHA-1 `2C:E6:E1:0B:…`, XDG-Auflösung) statt dem in Firebase registrierten
  `~/.android/debug.keystore` (`8A:07:CC:…`). Erst mit der env-Variable passt die
  Debug-Signatur zur Registrierung (Google Sign-In im Debug bleibt nutzbar).

Bewusst offen (nicht als erledigt melden):

- Emulatorbefund (2026-11-06, `emulator-5554`, API 37): Installation des
  Debug-APK belegt — Erstversuch scheiterte erwartbar an
  `INSTALL_FAILED_UPDATE_INCOMPATIBLE` (Vorgänger-Build von 03:22, versionName
  1.0, andere Signatur), danach Deinstallieren und `adb install -r` Success
  (versionName 0.1.0) sowie `adb shell pm grant … POST_NOTIFICATIONS` →
  `granted=true` (dumpsys geprüft). Der Emulatorprozesse wurde danach abnormal
  beendet, BEVOR die Benachrichtigung über das Debug-Panel ausgelöst wurde;
  ein zweiter Start wurde aus Rücksicht auf die Maschinenauslastung bewusst
  abgebrochen. FEUER-NACHWEIS (Benachrichtigung sichtbar, `dumpsys notification`,
  Screenshot, Zweittag-Überspringen) fehlt damit weiterhin —
  `~/dev/HANDOFF-woche3-emulator-stufe0-REZEPT.md` bleibt der Weg dorthin.
- Der Runner ist nur über das Debug-Panel erreichbar; echte Anbindung beim
  App-Start mit Nutzerwerten (remindHour/Ruhezeit, Speicherwahl Preferences
  vs. localStorage) fehlt.
- `minimumLog` ist auf `dev-product` noch nicht in `journal-app` integriert;
  `9edb12a` liegt auf `origin/dev` (journal-dev), nicht auf der vitalos-Gitlink-
  Branche. Journal-Modul-Code nicht editiert.
- Messwert-Vergleich mit Digital Wellbeing offen (nur auf echtem Gerät möglich).
- Signierter Release-Build dieses Fokus-Stands offen (die dokumentierte Release-
  AAB ist älter als dieser Stand); kein Deploy, kein Store-Upload, kein Push.
- Die grünen node:test-Fälle (Reminder-Logik, Web-Nähte, Controller/Settings/
  Usage, inkl. der 36 aus dem Vibe-C-Strang) prüfen ausschließlich die reinen
  JS-Module mit injizierten Fakes — sie sind KEIN Nachweis für natives
  Verhalten, Plugin-Wirklichkeit oder Gerätverhalten.
