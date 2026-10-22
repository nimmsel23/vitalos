# Push-Functions

Alle Sender liegen in `fitness-aos`, Region `europe-west1`. Sie teilen das
Laufzeitkonto `fitness-aos@appspot.gserviceaccount.com`, aber keine Function-ID.

| App | Codebase | Function | Quelle |
| --- | --- | --- | --- |
| VitalOS | vitalos | scheduledVitalosPushReminders | functions/ |
| Fitness | fitness | scheduledFitnessPushReminders | fitness-app/functions/ |
| Journal | journal | scheduledJournalPushReminders | journal-app/functions/ |

`firebase.push.json` bündelt diese Quellen für den gezielten CI-Deploy.
`Deploy app push functions` kann alle drei oder einen Sender veröffentlichen.
Die Einstellung `verify_only` zeigt nur das verwendete Servicekonto.
Geheimnisse und temporäre Zugangsdaten gehören weder in Logs noch Artefakte.
Hosting und andere Fitness-Functions sind keine Ziele dieses Workflows.

## IAM

Das CI-Konto benötigt `iam.serviceAccounts.actAs` auf dem Laufzeitkonto.
Die Reparatur verwendet dafür `roles/iam.serviceAccountUser` als Binding auf
genau diesem Servicekonto, nicht als projektweite Rolle. Das Deploy-Konto
wird aus der tatsächlich verwendeten CI-Credential ermittelt.
Cloud Build verwendet zusätzlich
`842575255284-compute@developer.gserviceaccount.com` als bestätigtes
Build-Konto. Auch darauf erhält nur das CI-Konto ein ressourcenbezogenes
`roles/iam.serviceAccountUser`-Binding; ohne dieses scheitert CreateFunction
bereits vor dem Build mit `iam.serviceaccounts.actAs`.
Bestätigter Actor: `fitness-pwa-deploy@fitness-aos.iam.gserviceaccount.com`.
Seine vorhandene Firebase-Admin-Rolle erlaubt Function-Deploys, aber keine
Scheduler-Verwaltung. Die eigene Rolle `vitalosPushSchedulerDeployer` ergänzt
nur Job-Create/Get/Update/Delete und `serviceusage.services.use` auf Projektebene;
die Definition liegt in `.github/iam/push-scheduler-deployer.yaml`.

## Migration des alten gemeinsamen Namens

Der alte `scheduledPushReminders`-Stand war der Journal-Sender. Sein Scheduler
liegt in `us-central1` und heißt
`firebase-schedule-scheduledPushReminders-europe-west1`.

1. Alten Scheduler pausieren, damit zwei Journal-Sender nicht parallel laufen.
2. Neue Sender über CI veröffentlichen; nur konkrete Codebase/Function-Filter.
3. Aktive Functions, passende Pub/Sub-Topics, Scheduler und App-Lanes prüfen.
4. Alten gemeinsamen Sender, Job und Topic entfernen, sobald Journal ersetzt ist.

Bei einem Fehlschlag vor dem Ersatz lässt sich der alte Job wieder aktivieren.
Die Function-Quellen bleiben in Git erhalten. `scheduledSixpackReminders`
und die anderen Fitness-Functions werden bei dieser Migration nicht verändert.

## Live-Abschluss 2026-10-22

Alle drei neuen Sender wurden über das reparierte CI-Konto deployed und sind
`ACTIVE`, mit eigener Codebase, eigenem Pub/Sub-Topic und aktiviertem
Fünf-Minuten-Scheduler in `us-central1`. Die heruntergeladenen Live-Quellen
stimmen mit den gepinnten Git-Quellen überein. Der alte gemeinsame Sender,
sein pausierter Job und sein Topic wurden nach bestätigtem Journal-Ersatz
entfernt. Journal hat einen regulären Lauf mit Status `ok` abgeschlossen.

Die VitalOS-Abfrage benötigt außerdem einen Collection-Group-Index auf
`settings.apps.vitalos.enabled`. Dieser ist in `firestore.indexes.json`
definiert; die drei vorhandenen Collection-Indizes des Felds bleiben erhalten.
Bei der Migration wurde ausschließlich dieses Feld über die Firestore-API
aktualisiert, ohne Rules oder andere Indizes zu veröffentlichen.
Index-Aufbau abgeschlossen (`READY`). Reguläre Ausführungen nach der
Migration: Journal 04:36 UTC, Fitness 04:41 UTC und VitalOS 04:44 UTC jeweils
mit Status `ok`. Keine manuellen Test-Pushs ausgelöst.

## Prüfung ohne Benachrichtigungen

`node scripts/test-push-function-isolation.mjs` lädt die drei tatsächlichen
Exports mit isolierten SDK-/Firestore-Doubles. Geprüft werden eindeutige IDs,
Codebases, Region, Zeitplan und App-Lanes. Aktivierte fremde App-Einstellungen
dürfen keinen Push des geprüften Senders auslösen. Es werden keine echten
Benutzer oder Tokens gelesen und keine Testnachrichten versendet.
