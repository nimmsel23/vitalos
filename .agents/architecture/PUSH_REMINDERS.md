# .agent/architecture/PUSH_REMINDERS.md

# Push Reminder Architecture

## Status

Die Firebase-Push-Infrastruktur wurde zuletzt in folgenden Commits erweitert:

```text
fitness/master
1d191e1 Add Firebase push worker and multi-device settings

vitalos/master
c51d906 Wire fitness Firebase push reminders
```

Die Änderungen wurden committed und gepusht.

Der Firebase-/CI-Live-Deploy sowie ein echter End-to-End Push auf ein Gerät wurden im damaligen Agent-Run jedoch nicht bestätigt.

Daher:

```text
IMPLEMENTED: yes
PUSHED: yes
BUILD VERIFIED: yes
LIVE DEPLOY VERIFIED: unknown
REAL DEVICE PUSH VERIFIED: no evidence
```

---

# Komponenten

## Fitness Frontend

Relevante Dateien:

```text
src/hooks/usePushNotifications.js
src/lib/db/firestore/user.js
src/lib/db/local/user.js
src/views/Settings/NotificationsSection.jsx
public/firebase-messaging-sw.js
```

Aufgaben:

* Notification Permission
* FCM Token Registration
* mehrere Geräte pro User
* Service Worker für Web/PWA Push
* Push Settings UI

---

# Persistenz

Push Settings liegen unter ungefähr:

```text
fitness/{uid}/settings/push
```

Relevante Felder:

```text
enabled
reminderTime
types
token
tokens
last_sent_at
last_sent_date
last_sent_kind
```

`tokens` unterstützt mehrere Geräte.

`token` existiert weiterhin als kompatibles Primary-/Legacy-Feld.

---

# Firebase Function

Die Scheduler-Logik lebt im VitalOS Parent Repo:

```text
functions/index.js
```

Die Function:

```text
scheduledPushReminders
```

läuft geplant alle:

```text
5 Minuten
```

und prüft das Reminder-Zeitfenster.

---

# Reminder-Arten

Aktuell vorgesehen:

```text
workout
habit
coverage
restday
```

Zuletzt implementierte Logik umfasst insbesondere:

## Workout

Reminder, wenn heute noch keine abgeschlossene Trainingssession erkannt wurde.

Dabei soll nicht nur ein simples:

```text
workout.done
```

geprüft werden.

Stattdessen werden tatsächliche Training-Signale aus Exercises berücksichtigt, z.B.:

```text
done
sets
reps
weight
rpe
duration
setsArray
```

---

## Habits

Prüft offene Habits des Tages anhand von:

```text
habits
habitRecords
```

und `completion == DONE`.

---

## Restday / Inaktivität

Reminder bei mindestens:

```text
4 Tagen
```

ohne erkannte abgeschlossene Trainingssession.

---

# Multi-Device

Ein User kann mehrere FCM Tokens besitzen.

Neue Geräte sollen bestehende Tokens nicht überschreiben.

Ungültige oder deregistrierte Tokens werden nach FCM-Fehlern aus der Liste entfernt.

---

# Web / PWA

Der Web-Push läuft über:

```text
public/firebase-messaging-sw.js
```

Die Firebase Function sendet für Web möglichst eine Data Payload.

Der Service Worker übernimmt die sichtbare Notification, damit nicht gleichzeitig Firebase und Worker dieselbe Notification rendern.

---

# Wichtig: Noch zu verifizieren

Die Existenz des Codes bedeutet nicht, dass Push tatsächlich funktioniert.

Vor Abschluss der Push-Aufgabe muss ein Agent einen echten End-to-End-Test durchführen.

## Verification Checklist

* [ ] VitalOS CI nach `c51d906` erfolgreich
* [ ] Firebase Function tatsächlich deployed
* [ ] Scheduler existiert und läuft
* [ ] Firestore Push Settings werden gefunden
* [ ] gültiger FCM Token ist gespeichert
* [ ] mehrere Tokens bleiben erhalten
* [ ] Reminder-Time Matching funktioniert
* [ ] Function erzeugt tatsächlich FCM Send
* [ ] Android/PWA erhält Notification
* [ ] Klick öffnet den vorgesehenen VitalOS/Fitness Tab
* [ ] keine doppelte Notification
* [ ] `last_sent_*` verhindert Wiederholungen
* [ ] ungültige Tokens werden entfernt

---

# Besonders prüfen

## 1. Zeitzone

Im bisherigen Code wurde verwendet:

```text
Europe/Berlin
```

Das Projekt-/Nutzerumfeld ist Wien.

Prüfen, ob konsequent:

```text
Europe/Vienna
```

verwendet werden sollte.

Berlin und Wien haben üblicherweise dieselbe Zeit, aber semantisch sollte die gewünschte Zeitzone explizit sein.

---

## 2. Scheduler vs Reminder Window

Die Function läuft alle 5 Minuten.

`isReminderDue()` verwendet ebenfalls ein 5-Minuten-Fenster.

Prüfen, dass Scheduling-Jitter nicht dazu führen kann, dass ein Reminder komplett verpasst wird.

---

## 3. Reminder-Priorität

`buildReminderMessage()` liefert offenbar nur einen Reminder pro Lauf/User.

Die aktuelle Reihenfolge ist ungefähr:

```text
workout
→ habit
→ restday
```

Dadurch können andere Reminder-Arten für denselben Zeitpunkt verdrängt werden.

Prüfen, ob dies beabsichtigt ist.

---

## 4. `coverage`

`coverage` existiert als Reminder Type.

Im zuletzt sichtbaren `buildReminderMessage()` war jedoch keine erkennbare Coverage-Branch implementiert.

Das explizit untersuchen.

---

## 5. Firestore CollectionGroup

Die Function sucht:

```text
collectionGroup("settings")
```

und filtert anschließend:

```text
doc.id === "push"
```

Prüfen:

* ob dadurch auch Settings anderer Apps gefunden werden,
* ob der Parent tatsächlich immer der erwartete Fitness-User ist,
* ob eine präzisere Datenstruktur sinnvoll wäre.

---

# Definition of Done

Push Reminders sind erst abgeschlossen, wenn:

```text
settings
→ FCM token
→ deployed scheduler
→ Firestore state evaluation
→ FCM send
→ service worker/device
→ visible notification
→ correct navigation
```

einmal real erfolgreich nachgewiesen wurde.

Ein erfolgreicher JavaScript-Syntaxcheck oder Frontend-Build allein reicht dafür nicht.
