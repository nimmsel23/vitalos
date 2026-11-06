# Gen2-Migration: scheduledVitalosPushReminders

**Status: LIVE und verifiziert (2026-11-05/06, Mitternachts-Tick).** Diese Funktion dokumentiert Ablauf, Fallstricke und meine Perspektive der Migration.

## Ausgangslage

- Gen1-Funktion `scheduledVitalosPushReminders` (europe-west1, every 5 minutes, Europe/Berlin),tigt über App-Engine-Cron.
- firebase-admin/functions waren im Zuge der Dependabot-Sanierung bereits auf admin ^14 / functions ^7 gehoben; dabei wurde die Gen1-Definition bewusst per `firebase-functions/v1` gepinnt, weil firebase-tools keinen In-Place-Gen-Wechsel unter gleichem Namen duldet. Die Migration wurde vertagt bis heute (Zeitfenster-Abwägung: kein Ticker-Verlust in einer Reminder-Fenster).

## Migrationsform

- `onSchedule({ schedule: "every 5 minutes", timeZone: "Europe/Berlin", region: "europe-west1" }, handler)` aus `firebase-functions/v2/scheduler`.
- Logging auf `firebase-functions/logger` — schreibt unter Gen2 strukturiertes jsonPayload (nicht textPayload; bei Log-Recherchen beachten).
- Isolationstest (`scripts/test-push-function-isolation.mjs`) hat generische v2-Scheduler-Mocks und einen eigenen logger-Mock — läuft gegen alle drei Apps grün.

## Durchlauf — inklusive Stolpersteine

1. **Versuch 1** (bb3fd04, Lauf 42124845762): reines Deploy mit `--force` — firebase-tools verweigert kategorisch ("Upgrading from 1st Gen to 2nd Gen is not yet supported"). `--force` übersteuert das nicht. Kein Schaden.
2. **Lösung**: `replace_gen1`-Option im Deploy-Workflow (557b07a). Wenn gesetzt, läuft vor dem Deploy `functions:delete --force` im selben Lauf — Löschung und Neuaufbau in einem Atemzug, Scheduler-Lücke minimal.
3. **Versuch 2** (Lauf 42125146195): Delete scheiterte mit 403 auf `pubsub.topics.delete` — der Deploy-SA hatte nie Lösch-Rechte. Abbruch vor jeder destruktiven Wirkung, Gen1 tickte ungestört weiter (Sonden-Deploy 42125380619 bestätigte das: "Upgrade not supported" = Gen1 noch da).
4. **IAM-Erweiterung** des Deploy-SAs `fitness-pwa-deploy@fitness-aos.iam.gserviceaccount.com` über gcloud (Owner-Account nimmsel23): `roles/cloudfunctions.developer`, `roles/pubsub.editor`, `roles/eventarc.admin`, `roles/run.developer`, `roles/artifactregistry.writer`, plus `roles/iam.serviceAccountUser` auf der Compute-Runtime-Identität. Die bestehende Custom-Rolle `vitalosPushSchedulerDeployer` (Cloud Scheduler) blieb unangetastet.
5. **Versuch 3** (Lauf 42127547329): Erfolg. 23:10:54 Gen1-Löschung, 23:11:05 bestätigt, 23:11:15 Gen2-Build, **23:12:21 scharf — Ausfall 76 Sekunden**.

## Verifikation (alle live, nicht nur deploy-grün)

| Prüfung | Ergebnis |
|---|---|
| Funktionsstatus | ACTIVE, nodejs22, Cloud-Run-Service |
| Cloud-Scheduler-Job | `firebase-schedule-scheduledVitalosPushReminders-europe-west1`, every 5 minutes, ENABLED (Gen2-Verdrahtung; Gen1 hatte keinen Cloud-Scheduler-Job) |
| Erster Tick | 00:17 MEZ: `{"message": "Push check started", "date": "2026-11-06", "time": "00:17"}` — Zeitzonen- und Datum-Rollover korrekt |

## Meine Perspektive

**Warum dieser Weg**: Der einzige base-gefährliche Moment ist die Lücke zwischen Gen1-Löschung und Gen2-Scharfschaltung. Statt einer Console-Delete + separat getriggertem Deploy (Lücke = Minuten bis Stunden, je nach Aufmerksamkeit) habe ich Löschung und Aufbau in denselben Workflow-Lauf gezwungen — 76 Sekunden, entfernt vom 18:00-Default-Fenster. Das Dedup (`last_sent_date`/`last_sent_kind`) fängt zusätzlich jeden verlorenen Tick am Folgetag ab: Der Design-Fail-State der Migration ist "ein User verliert heute maximal eine Erinnerung", nicht "die Funktion verschwindet".

**Warum die IAM-Erweiterung schädlich aussieht, aber richtig ist**: Der Deploy-SA war bewusst minimal permissioniert (Custom-Rolle + firebase.admin). Er war nie auf Lösch- und Cloud-Run-Operationen ausgerichtet. Die jetzt vergebenen Rollen sind Developer/Editor-Tier und exakt die von Google für Gen2-Deploys dokumentierte Menge — kein Admin-Worstcase. Der SA bleibt ein Werkzeugkonto ohne Interaktionsrechte; die Angriffsfläche wächst um "kann Funktionen löschen und Services publishen", was einem Deploy-Konto ohnehin inhärent ist.

**Was ich nicht getan habe und warum**: Keine Migration von fitness/journal im selben Zug. Die laufen produktiv auf Gen1 mit identischer Codebasis — die Rezeptur (v2-Mock Change + `replace_gen1=true` + IAM) ist jetzt bewiesen, die Migrationsläufe sollten aber einzeln und bewusst getimet werden, damit nie zwei Ticker gleichzeitig weg sind.

**Rest-Risiken**: (1) Gen2 hat andere Kosten- und Kaltstart-Phänomene als Gen1 (Cloud-Run-Revisionen) — bei einem 5-Minuten-Scheduler mit winzigem Handler irrelevant, aber beobachtenswert. (2) Das `replace_gen1`-Flag ist scharf: Wer es mit `app=all` feuert, reißt alle drei Gen1-Funktionen nacheinander weg und redeployt sie — fitness/journal würden damit als Gen1 neu gebaut (Churn, kein Datenverlust, aber unnötig). Die Input-Beschreibung warnt davor; ggf. später auf eine App-Whitelist einschränken. (3) Log-Navigation: Gen2-Logs brauchen jsonPayload-Filter, alte textPayload-Rezepte laufen ins Leere.

**Rollback-Fall** (der hoffentlich nie eintritt): `git revert` der Gen2-Commits + erneuter `replace_gen1`-Lauf baut die Funktion als Gen1 zurück — derselbe Mechanismus, keine Sonderbehandlung nötig.

## Bezugspunkte

- Migration-Commits: bb3fd04 (Gen2-Code + logger-Mock), 557b07a (replace_gen1-Option)
- Erfolgreicher Lauf: 42124845762 / 42125146195 / 42127547329 ( Attempt 3)
- Folgeschulden: fitness/journal Gen1→Gen2 nach derselben Rezeptur, je einzeln und außerhalb der Reminder-Runde

## Addendum 2026-11-06: fitness + journal nachgezogen — alle drei Reminder auf Gen2

**Fitness** (Release-PR #76, Lauf 42130097000, erfolgreich): identische Rezeptur, Löschung 23:32:46, Gen2 scharf 23:34:04 — **Lücke 78 Sekunden**. Ticks verifiziert ab 23:44 im sauberen 5-Minuten-Raster (HTTP 200, `Push reminders: 0 sent, 0 failed`). Die übrigen Fitness-Functions (onCoachFeedback, onClientWorkout, sendTestPush) bleiben bewusst Gen1 (Gemischte Generationen in einer Codebasis werden von firebase-tools unterstützt).

**Journal** (Release-PRs #22/#23/#24, Lauf 42133793020, erfolgreich) — drei Stolperstufen mehr:

1. **Secret-IAM 403**: firebase-tools liest beim Build die Secrets ALLER Funktionen der Codebase (u.a. `GOOGLE_OAUTH_CLIENT_SECRET` von scheduledDoorReminders) — auch wenn nur eine Funktion deployt wird. Dem Deploy-SA wurden `secretmanager.viewer` + `secretmanager.secretAccessor` auf den Secrets fehlten. Nachgezogen auf GOOGLE_OAUTH_CLIENT_SECRET und GEMINI_API_KEY.
2. **Fehlendes Secret**: `GEMINI_API_KEY` (defineSecret in journal index.js) existierte im Projekt gar nicht — Secret Manager meldet das als 403. Secret angelegt mit Platzhalter-Version `unset` (füllbar per `gcloud secrets versions add`, der analyzeSmartLog-Pfad hat einen try/catch für fehlenden Provider). **Offen: echter Gemini-API-Key muss noch hinterlegt werden.**
3. **pnpm-Build ohne Framework**: journal-app/functions trägt (für den CI-Frozen-Lock) ein pnpm-lock.yaml; Cloud Build wählt damit den pnpm-Pfad, und dort injiziert Google das Functions Framework NICHT. Fix: `@google-cloud/functions-framework` ^5.0.5 deklariert, pnpm-lock UND npm-lock (npm ci im Deploy-Workflow verlangt Sync) regeneriert.

Downtime Journal: 23:40 Gen1-Löschung → 00:03 Gen2 scharf, **23 Minuten** — Ursache war die sequentielle Entdeckung der Secret/Framework-Baustellen nach bereits vollzogener Löschung. Lehre für künftige Drittmigrationen: Secret-Enumeration und Lockfile-Inventur VOR dem replace_gen1-Lauf prüfen. Tick-Verifikation: 00:08 HTTP 200 + `Push reminders: 0 sent, 0 failed`.

**GitHub-Zwischenfall 05./06.11.** (`fatal error in commit_refs_rules`): Account-weit wurden git-/Repository-Endpoints in dieser Nacht unregelmäßig abgelehnt (Plattform-Vorfall, community discussions #212105/#212107, Statusseite grün). Sämtliche Schritte der Kette (git push, PR, Merge) liefen über einfachen Retry mit wenigen Minuten Abstand erfolgreich durch — kein Datenverlust, kein Arbeitsverlust.

**Verbleibend Gen1** (bewusst): journal scheduledDoorReminders (Secrets-RunWith), journal Callable-API (getSmartLogQuota, analyzeSmartLog, googleLink\*), fitness onCoachFeedback/onClientWorkout/sendTestPush. Der journal _functions_-Baum läuft administrativ noch auf admin ^12 / functions ^5 (deploybar und funktional; die transitive Verwundbarkeitsliste des npm-Locks ist vorbestehend) — die admin-14-Übernahme ist die gleiche Maschine wie coach-dev (eigener Batch).
