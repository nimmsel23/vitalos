## 2026-10-23 — Journal-Rules als Modul, Lockfile-Check und Build-Fixes (Fitness/VOS-Fitness)

Aus einer journal-dev-Session: Die Firestore-Rules für `journal/{uid}/**` liegen jetzt als Modul-Fragment im Journal-Repo und werden von vitalos eingebettet. Dazu CI-Reparaturen (Lockfile, Solo-Stub, VOS-Fitness-Plan-Imports). Rules-Deploy per `workflow_dispatch` wurde in dieser Session nicht ausgelöst; Browser-/Handy-Test der TaskChampion-Config steht aus.

- **`scripts/build-rules.mjs` (`81714f8`):** bettet `journal-app/firestore.rules.part` in `firestore.rules` ein (Marker `// >>> module:` / `// <<< module`); `--check` prüft Aktualität (Exit 1 bei Abweichung). Rules inhaltlich unverändert, nur der Block ist umgezogen. Aktuell 2 Module eingebettet (journal, plan). In keinen Deploy-Schritt oder `package.json`-Script verdrahtet.
- **`pnpm-lock.yaml` (`52f9ab5`):** für `@firebase/rules-unit-testing` in `plan-app` nachgezogen; behebt `ERR_PNPM_OUTDATED_LOCKFILE` in Shell-/Journal-/Plan-/Fitness-Deploys. Nach dem Push waren Shell- und Plan-Deploy grün.
- **`bin/vos-release` (`fa5e0b8`):** neuer Lockfile-Check (`pnpm install --frozen-lockfile --lockfile-only`) vor `commit_parent_bumps`; bricht vor dem `master`-Push ab. Positivfall getestet (griff im echten `journal-release`-Lauf), Fehlerfall nicht erzwungen; im Dry-Run oder ohne `pnpm` übersprungen.
- **`fitness-app/vite.config.js` (`403e2f1`, Pointer `2bbfe77`):** Solo-Stub-Regel trifft nur noch den View-Einstieg (`index`), nicht mehr `Session/useTodayGateWatcher.js` (Fehler „not exported by src/solo-stub.jsx“ im `atlas`-Modus). Solo-Builds `training`/`atlas` und `pnpm run build` lokal grün; `Deploy Fitness PWA` grün.
- **`vos-fitness/vite.config.cjs` (`50d4259`):** Fallback für `planVersions.js` auf das Submodul `fitness-app/plan` (wie in der Shell-Config). Lokaler Build grün, `Deploy VOS Fitness PWA` grün.
- **Release:** `journal-release --yes` lief durch (`journal-app` `276a37c`, vitalos `fd97cc3`); `deploy:all` aus journal-dev (vom User gestartet) deployte alle sechs Journal-Hosting-Sites ohne Fehler.

---

## 2026-10-22 — Push-Functions und CI-Rechte reparieren

Die drei Reminder-Sender bekommen eindeutige Function-IDs und Firebase-Codebases (vitalos/fitness/journal). Ein eigener manueller CI-Workflow deployt alle oder einen gezielten Sender; Hosting bleibt unabhängig. Journal liest Push-Einstellungen aus dem tatsächlichen Pfad fitness/{uid}/settings/push statt einer nicht vorhandenen push-CollectionGroup. Der Regressionstest führt die echten Handler gegen isolierte SDK-/Firestore-Doubles aus und prüft, dass aktivierte fremde App-Lanes keinen Push auslösen. Bestehende 6Pack-Reminders und andere Fitness-Functions sind keine Deploy-Ziele.

Migration und eng begrenzte IAM-Reparatur: siehe docs/PUSH-FUNCTIONS.md. Der alte Journal-Scheduler wird vor dem Ersatz pausiert und erst nach bestätigtem Ersatz entfernt. Keine manuellen Testnachrichten an echte Benutzer.

Live verifiziert: CI-Lauf 39722742884 veröffentlicht Journal erfolgreich; Lauf 39722974187 veröffentlicht alle drei getrennten Sender erfolgreich. Alle drei Functions ACTIVE, Live-Quellen identisch mit Git, drei eigene aktivierte Scheduler/Topics. Legacy-Function, Job und Topic entfernt. Journal hat einen regulären Lauf mit Status ok abgeschlossen. CI erhält actAs gezielt auf Laufzeit- und tatsächlichem Cloud-Build-Konto sowie die minimale eigene Scheduler-Rolle. Fehlenden VitalOS-Collection-Group-Index ergänzt und im zentralen Index-Manifest festgehalten. Shell-CI und wiederholter Skills-Deploy erfolgreich.

Abschluss: VitalOS-Index READY. Reguläre Läufe von Journal (04:36 UTC), Fitness (04:41 UTC) und VitalOS (04:44 UTC) jeweils Status ok, ohne manuelle Testnachrichten.

## 2026-10-21 — Universeller Changelog in allen Apps

Gemeinsamen Vite-Plugin in Fitness, Fuel, Journal, Learn, Relax, Plan und Skills eingebunden; Habits/6Pack auf den aktuellen gemeinsamen Stand gebracht. Skills verwendet keine separate React-UpdateNotes-/Fetch-Lösung mehr. Mini-Apps erhalten eigene IDs/Namen. VOS Fitness verwendet die Release-Metadaten des tatsächlichen Fitness-Checkouts. Die Shell behält genau einen gebündelten Dialog mit allen eingebetteten App-Versionen. CI-Deploys umfassen auch Training/Atlas, vier Fuel-Mini-Apps und alle sechs Journal-Targets.

Stand vor Veröffentlichung: neun App-Builds erfolgreich; Journal origin/dev-Divergenz mit eigenständigem Build integriert und erneut geprüft. Browserprüfung bei 320px/390px bestätigt Standalone-Anzeige, Unterdrückung eingebetteter Dialoge, genau einen Shell-Dialog, gemeinsame Bestätigung, sicheren Text und Fokus. Fitness generiert auch die vom neuen Plan-Submodul benötigten KB-Daten; Learn findet dev- und app-Checkouts. Journal vendort die gemeinsamen Kontextmenüs für seinen eigenständigen Build.

## 2026-10-21 — Ein gemeinsamer Shell-Changelog

VitalOS sammelt die Änderungen von Shell und neun eingebundenen Apps,
einschließlich Skills, in einem Dialog mit Abschnitten und passenden
Repository-Links. Eine gemeinsame Release-ID berücksichtigt alle gebauten
Repo-Stände; vitalos:seen-release bestätigt den gesamten Stand. Der Shell-
Marker im HTML-Head und die Frame-Prüfung unterdrücken eigene App-Dialoge
im eingebetteten Betrieb. Standalone-Dialoge bleiben unabhängig. Leere
Submodule erben keine Parent-Git-Metadaten.

Geprüft: fünf isolierte Metadaten-/Plugin-Tests, bestehende Shell-Tests,
VitalOS-Firebase- und Habits-Client-Build, alle zehn Gruppen im Build-JSON,
Vendor-Parität. Browser bei 320/390px: ein Dialog, App-Links, gemeinsame
Bestätigung, Unterdrückung vor/nach Schließen und Standalone-Verhalten.
Kein Push/Deployment oder Pointer-Bump; bestehender 6pack-app-Stand erhalten.

## 2026-10-21 — Gemeinsamer VitalOS-Changelog

6Pack-Pilot in drei wiederverwendbare Module überführt: vos-changelog-screen.mjs,
vos-release-info.mjs und vos-changelog-vite.mjs unter packages/mini-app-shell.
Die Shell nutzt den Plugin direkt, Habits und 6Pack vendorte Kopien. CLI mit
vendor-changelog für eine minimale Standalone-Kopie ergänzt. App-spezifische
Browser-Bestätigung erst beim Schließen; nativer modaler Dialog, Text statt
HTML und HTTPS-Links. Release-Daten im jeweiligen Build eingebettet, GitHub-
Events nur bei passendem Repo/HEAD, sonst jüngste zehn Nicht-Merge-Commits.

Geprüft: gemeinsame Node-Tests, VitalOS-Firebase-Build, Habits in beiden Modi,
6Pack-Vite-Build und Vendor-Parität. Isolierter Browser bei 320/390px: erste/neue
Version, Bestätigung, Escape, Fokus, Links, Layout und blockierter localStorage.
Keine Veröffentlichung, keine Submodule-Pointer geändert; vorhandene Änderung
an 6pack-app unberührt.

## 2026-10-21 — Hub Fuel-Einstiege und App-Kontextmenüs

Fuel Tap Board, Shutter und Tagesfaden sind unter den Fuel-Karten im Home-Hub eingebettet; Klassisch öffnet Fuel. Der gemeinsame Hub-QueryClient aktualisiert Dashboard und Durchschnitte nach Logs. Die vier App-Buttons bieten ihre Unterbereiche per Rechtsklick, Long Tap, Menütaste oder Shift+F10 an. Gemeinsame Menü-/Tastaturbausteine in `packages/mini-app-shell/react/` werden auch von journal-dev v1 genutzt. Direkte Fitness-Ziele umgehen die Hub-Auswahl; Stärke führt zu Lernen. Pfeiltasten, Pos1/Ende, Buchstabensuche, Escape und Fokusrückgabe sind geprüft.

Validierung: VitalOS- und Journal-Firebase-Build erfolgreich; isolierte Browserprüfung bei exakt 320px und 390px für Rechtsklick, Tastatur, Long Tap, Scroll-Abbruch, Menüränder und alle drei Journal-Buttons bestanden. Kein Push/Deploy; journal-dev ist noch nicht in journal-app integriert. Bestehende 6Pack-Änderung bleibt unberührt.

## 2026-10-20 — Coach owns the client Shell

Removed direct `coach-app` gitlink, workspace/lockfile importer and Coach deployment workflow. Removed Coach from VitalOS release/pointer/overview inventories; compatibility `coach-release` delegates to Coach. Branch `coach` starts from this cleaned Shell. Existing unrelated submodule changes are excluded. Old Coach checkout retained locally under `~/coach-dev/.worktrees/legacy-vitalos-coach`. No push or deploy.

## 2026-10-18 — Journal-v2-Rules, CI-Reparaturen und coach-Submodul-Fix

Fortsetzung des Journal-v2-Pointer-Bumps (siehe nächster Eintrag): Firestore-Rules für die Raster-Apps, Lockfile-/Workflow-Fehler beim Push und ein defekter Submodul-Pointer. `~/vitalos` ist komplett gepusht; die Journal-Seiten waren zuvor direkt per `deploy:all` aus `~/journal-dev` ausgeliefert worden. Nicht im Browser oder auf einem Gerät getestet.

- **`firestore.rules` (`876a0d3`):** neuer Block `match /journal/{uid}/{document=**}` nur für den Besitzer (Frame Map je Domain unter `journal/{uid}/frame/{domain}`, Door-Quellenwahl unter `journal/{uid}/settings/door`; Coach bewusst ausgenommen). Rules per `firebase deploy --only firestore:rules --project fitness-aos` ausgerollt.
- **`journal-app`-Pointer-Bumps:** Fire × Google Calendar, Frame Map + Quellenwahl `journal/`, Freedom/Focus Maps + Fire-Woche, Potential-Wischen (Quadranten per Swipe), `+hot`/`+profit` aus dem Journal, TaskChampion-Härtung. Das Lockfile `pnpm-lock.yaml` im Submodul wird nicht mehr getrackt (CI nutzt das Root-Lockfile).
- **`fitness-app` (`1f16bda`):** `coach`-Submodul entfernt (Coach lebt als `coach-app` in vitalos); behebt den CI-Checkout-Fehler `not our ref` (der referenzierte Commit `a190434` war zuvor nach `origin master` von coach gepusht worden).
- **`pnpm-lock.yaml` (Root, `701b2e8`):** neu erzeugt, weil `fflate` (journal-app) fehlte und `--frozen-lockfile` in der CI abbrach.
- **`.github/workflows/deploy-journal.yml` (`1c6022a`):** `firebase deploy --only hosting:journal` statt `--only hosting`, da `journal-app` jetzt sechs Hosting-Targets hat und der Workflow nur `journal` baut. CI „Deploy Journal PWA“ und Shell danach grün.

---

## 2026-10-18 — journal-app: Journal v2 / Door v2 per Pointer-Bump nach vitalos

Die Arbeit an Journal v2 passierte in `~/journal-dev` (Branch `dev`); in `~/vitalos` wurde sie über mehrere Merges und Pointer-Bumps nachgezogen. Nicht im Browser oder auf einem Gerät getestet.

- **`journal-app` (Branch `vitalos`):** mehrfach `origin/dev` hineingemergt — v2-Ansicht (Raster, Woche/Monat, gcal), Splash/Auto-Updater, iPad-Vollbild, Habits-Ansicht im Raster-Design, Service-Worker-Font-Caching, Doku Journal v2, Door v2 / Door-App (`vos-door`), Google Tasks, Fire-Map-Kalender. Beim ersten Merge blieb `package.json` mit `workspace:*` (vitalos-Workspace); `pnpm-lock.yaml`/`pnpm-workspace.yaml` aus dev gehören nicht ins Submodul.
- **`pnpm-lock.yaml` (Root):** per `pnpm install --frozen-lockfile --lockfile-only` nachgezogen (`workbox-window` für journal-app).
- **Meta-Repo-Commits:** Pointer-Bumps `journal-app: v2-Ansicht …`, `journal-app: Service Worker Font-Caching`, `journal-app: Hosting-Target v2, deploy:v2`, `journal-app: Doku Journal v2`, `journal-app: Door v2, Door-App, Google Tasks, Fire-Map-Kalender`, `journal-app: Doku Door v2 / Door-App`.

---

## 2026-10-17 — vos-fitness: Build repariert, Ordner umbenannt, eigene CI

Der Ordner `fitness-vos/` baute nicht mehr; er wurde repariert, in `vos-fitness/` umbenannt und bekam einen eigenen CI-Deploy. Die Hosting-Site-ID `vos-fitness` ist bei Firebase global an ein anderes Projekt vergeben, deshalb bleibt die Site `fitness-vos` (`fitness-vos.web.app`, Auth-Domains unverändert). Live deployt; nicht im Browser oder auf einem Gerät getestet.

- **`vos-fitness/` Build-Fix (`47e6c7c`):** Das lokale `NavigationItems.js`-Override exportierte `IS_SOLO` nicht (von fitness-app seit 15.10. gebraucht); `@cloud` zeigte auf eine `firebase.js` ohne `httpsCallable`. Override und toter Code (`App.jsx`, `App.Premium.jsx`, `vite.config.js`, `public/index.html`, `public/v1.html`) entfernt; `vite.config.cjs`, `tailwind.config.cjs`, `AGENTS.md`, `public/sw.js` angepasst.
- **Ordner-Rename (`5b05f0b`):** `fitness-vos/` → `vos-fitness/`; `.githooks/pre-push`, `CLAUDE.md`, `package.json`/`package-lock.json` und `AGENTS.md` auf den neuen Pfad umgestellt.
- **`.github/workflows/deploy-vos-fitness.yml`:** neuer CI-Deploy nach `fitness-vos`, Trigger auf `vos-fitness/**` und den `fitness-app`-Pointer. Erster Lauf scheiterte (fehlende generierte KB-/6pack-Daten, `vite` nicht gefunden); mit `c1f75ce` baut er mit generierten Daten und Root-vite und läuft grün.

---

## 2026-10-17 — Privater Skills-Checkout in CI

Skills bleibt privat. Nach ausdrücklicher Nutzerfreigabe liest VitalOS-CI das neue verschachtelte Submodule über einen separaten Nur-Lese-Deploy-Key (SKILLS_DEPLOY_KEY). Die gemeinsame Composite-Action konfiguriert ausschließlich den Skills-Repository-SSH-Pfad; Hostkeys stammen aus GitHubs HTTPS-Metadaten. Alle 12 rekursiven Checkout-Jobs verwenden sie vor dem Submodule-Update. YAML, Shell-Syntax und Schritt-Reihenfolge geprüft. Der Firebase-Service-Account unter ~/.env/firebase-fitness.json gehört zum Projekt fitness-aos; der vorhandene CI-Service-Account wird weiterverwendet.

## 2026-10-17 — Skills-Videos und gemeinsame Release-Quelle

Fitness/Skills ist ein direktes skills-dev-Submodule auf Branch fitness. Der neue Production-Workflow deploy-skills.yml baut denselben gepinnten verschachtelten Checkout separat nach vos-skills.web.app; deploy-fitness.yml baut den Host. Tailwind der VitalOS-Shell erfasst die Skills-Root-UI-Dateien. Keine parallele UI-Kopie mehr.

## 2026-10-17 — Gemeinsames Profil + Geräteliste in der Shell, Pointer-Bump fuel-app/fitness-app deployt

- **`src/shell/db/settings.js`:** Shell liest/schreibt das app-übergreifende Profil `users/{uid}/meta/profile` (`gender` m/f, `age`, `heightCm`, `weightKg`, `chronicConditions`, `medications`). Lesen: Profil gewinnt, fehlende Felder werden einmalig aus `users/{uid}` übernommen (Backfill); Schreiben: Profil plus Write-through auf `users/{uid}` (Coach-Tools lesen dort). Geräte-Registrierung unter `users/{uid}/devices/{deviceId}` mit `app=vitalos` (Commit `353dcbb`).
- **Pointer-Bump:** `fuel-app` (`dc0c7c8`) und `fitness-app` (`f784df6`) enthalten jetzt dasselbe Profil-/Geräte-Schema (Commits `d029182`, `6b22bd9`). Reihenfolge von innen nach außen gepusht: Teil-Repos `coach`/`plan`/`plan/coach-dev`, dann `fitness-dev`/`fuel-dev` `dev`, dann Submodul-Branches `vitalos`, zuletzt Meta-Repo `master`. Die vier `vos-fuel-*-app`-Mini-Apps bewusst nicht mitgebumpt.
- **`plan/coach-dev`:** Commit hing im Detached HEAD, `origin/dev` war 47 Commits weiter — per Cherry-Pick auf `origin/dev` gelegt und als Fast-Forward gepusht.
- **Mitgepusht:** Die Pushes von `fuel-dev`/`fitness-dev` nahmen auch fremde, bis dahin ungepushte Commits mit (5 bzw. 11); Staging-Hooks liefen (Fitness-Preview :8100, Fuel nach `~/.local/fuel`), kein Prod-Deploy außerhalb der CI.
- **CI:** `Deploy Fitness PWA`, `Deploy Fuel PWA`, `Deploy VitalOS Shell` für `2fe37d0` mit `success`. Alle sieben Builds (fuel cloud, fitness lokal/firebase, vitalos lokal/firebase) liefen durch; im Browser mit echten Firestore-Daten nicht getestet.
- **`CLAUDE.md`:** Neue Abschnitte „Pointer-Bump fuel-app / fitness-app: Schritt für Schritt“ und „Gemeinsamer User-Kontext in Firestore“ (Tabelle der Pfade, Backfill-/Write-through-Regeln, Geräte-ID pro Origin).
- Firestore-Rules unverändert (`users/{uid}/{document=**}` deckt die neuen Dokumente ab).

---

## 2026-10-17 — Selfie-Sync vom Nutzer auf zwei Geräten bestätigt

- Nutzer bestätigt nach Upload eines Fotos am Handy die erfolgreiche Anzeige am Laptop mit demselben Konto. Der reale geräteübergreifende Upload-/Lese-Ablauf funktioniert; frühere Hinweise „Geräte-Sync noch ungeprüft“ sind für diesen Ablauf erledigt.
- Finaler Stand: 6pack 21c804d, Shell-Fix 42e1168; bestehender VitalOS-Login wird wiederverwendet. Production-CI erfolgreich: [VitalOS](https://github.com/nimmsel23/vitalos/actions/runs/39028533456), [6pack](https://github.com/nimmsel23/vitalos/actions/runs/39028533446). Live-Bundles einschließlich Shell-UID-Anbindung geprüft.
- Speicher: `sixpackSelfies/{uid}/photos/{photoId}`, nur Eigentümer; normaler Sync benötigt keinen Laptop-Dienst. Dokumentation und Abnahme ebenfalls in 6pack README/RESULTS und Fitness docs/6pack-integration.md/RESULTS festgehalten.
- Die Nutzerbestätigung deckt keine zusätzlichen Offline-/Altbestand-/HEIC-Gerätetests ab. Persönliche Fotos oder Tokens wurden nicht für die Dokumentation ausgelesen.

## 2026-10-17 — 6pack übernimmt den VitalOS-Login

- Ursache: Der eigenständige Shell-Tab importierte noch 6pack-app b3e070b und übergab keine UID. Der bereits veröffentlichte Fitness-Release nutzte dagegen den neuen 6pack-Stand. Deshalb zeigte die Shell trotz Anmeldung die alte Login-Sperre.
- 6pack-app auf 21c804d (vereinigter Photo-Auth/Cloud-Sync, identisch zur Fitness-Integration) aktualisiert. Shell übergibt user.uid; Account-Wechsel remountet 6pack. Die neue Foto-Auth verwendet die vorhandene Firebase-App und deren Sitzung.
- Tailwind scannt die flachen 6pack-Quellen beider Einbindungen gezielt statt deren node_modules rekursiv einzulesen.
- Firebase-Shell-Build erfolgreich; Auth-Regression läuft zusätzlich in Production-/PR-Preview-CI.
- Regressionstest führt den tatsächlichen Shell-Views-Code und den Photo-Auth-Adapter aus: UID für zwei Konten/abgemeldet, Remount-Key, Navigation und bestehende Firebase-Sitzung ohne zweite initializeApp. Cloud-/Import-Regression ebenfalls grün.

# RESULTS.md

Session-Log mit datierten Ergebnis-Bullets (vitalos Meta-Repo). Wird vom globalen PreCompact-Hook
(`~/.claude/hooks/pre-compact-docs.sh`) fortgeschrieben, wenn eine Session hier gearbeitet hat.

## 2026-10-16: Fuel-Mini-Apps im Meta-Repo nachgezogen

- **`.github/workflows/deploy-fuel.yml`:** Deploy nur noch `--only hosting:client` — `fuel-dev` hat jetzt fünf
  Hosting-Targets (`client`=`fuel-vos`, `log`, `supplements`, `mikros`, `protokoll`); ein nacktes
  `--only hosting` würde sie alle deployen und an den fehlenden `dist-solo-*` scheitern.
- **`CLAUDE.md`:** Deploy-Tabelle um die vier Mini-App-Sites `vos-fuel-<x>` ergänzt (gebaut/deployt aus
  `fuel-dev`, nicht aus eigenen Submodulen).
- **Release:** `fuel-release --yes` → `fuel-app` auf `vitalos` gemergt, Pointer-Bump `5f93106`, `master` gepusht.
- **Nicht gebaut:** Mini-App-CI im Meta-Repo (Workflows `deploy-fuel-<x>.yml`) — berührt Workspace/Lockfile.

---

## 2026-10-16: Plan Strong-Workflow und Fitness-Backend veröffentlicht

Plan-Feature und Backend-Verträge nach dev gemergt und gepusht; über
`vos-release --yes plan fitness` in die jeweiligen vitalos-Release-Branches
übernommen, verschachtelte Submodule initialisiert, Firebase-Hosting veröffentlicht
und beide Parent-Gitlinks mit `bd551c8` gepusht. Plan-Release: `31f6595`;
Fitness-Release: `0cc9e6a`. Der Hook-Konflikt im Plan-Release betraf ausschließlich
`.githooks/pre-push` und wurde vom Release-Wrapper mit der dev-Fassung aufgelöst.

Erfolgreiche GitHub-Actions-Läufe für Parent `bd551c8`: Plan `38959199587`,
Fitness `38959199831`, VitalOS Shell `38959199908`. Auch Plan-dev-Preview
`38958876264` sowie Fitness-dev/vitalos `38959101504`/`38959189447` erfolgreich.
Plan unter https://vos-plan.web.app live; ausgeliefertes Hauptbundle auf neue
Coach-Verwaltung, Planbereitstellung, Vorlagenaktualisierung und Yuhonas geprüft.
Der CI-Rebuild hat eigene Asset-Hashes; kein bytegleicher Vergleich zum lokalen
Vor-CI-Build behauptet. Authentifizierter Coach-/Klienten-Cloud-Durchlauf bleibt offen.

Lokales Fitness-Staging ist auf :8100 erfolgreich aktualisiert und healthy.
:6100, :9100 und :9150 waren beim Abschluss nicht aktiv; diese separaten Dienste
wurden nicht gestartet. Der Firebase-Release und die lokalen Dienst-Owner bleiben
getrennt. Paketmanager-bedingte supports-color-Peer-Normalisierung im Plan-Lockfile
wurde gesichert und aus den Arbeitskopien entfernt; keine neue Dependency-Version
oder Lockfile-Änderung wurde in den Release aufgenommen.

Das anschließende Coach-Upgrade liegt separat als geprüfter Entwicklungscommit
`af1f4cd` in coach-dev (gemeinsamer Plan-Editor und Klientenablauf). Es ist nicht
Teil dieses bereits ausgeführten Plan-/Fitness-Releases.


## 2026-10-16: Coach Strong-Workflow veröffentlicht

Coach-Upgrade `af1f4cd` über dev in den vitalos-Release-Branch übernommen;
finaler Coach-Stand `5a0d012`, Parent-Verweis `b419ff9`, alle Branches gepusht.
Firebase Hosting unter https://vos-coach.web.app erfolgreich veröffentlicht.
Vorlageneditor, Trainingsplanbereitstellung, Yuhonas-Auswahl und Workout-Ergebnisse
im ausgelieferten JavaScript sowie gemeinsame Plan-Dialogklassen im Live-CSS
geprüft. Authentifizierte reale Coach-/Klienten-Cloud-Schreibvorgänge bleiben
unverifiziert; der isolierte Browser-Durchlauf verwendete Testdaten.

Der erste Upload scheiterte am Netzwerk und wurde erfolgreich wiederholt.
Zusätzlich Tailwind auf die eingebundenen Plan-Quellen erweitert. Preview-CI
repariert: vollständiger Plan-Commit statt Kurz-ID, pnpm statt npm für die
Standalone-Installation und explizite temporäre Workspace-Konfiguration.
Preview `38965346842` erfolgreich. Produktions-CI Coach `38964936285` und
`38965094966` sowie Shell `38964936288` und `38965094970` erfolgreich.
Der abschließende Parent-Sync übernimmt ausschließlich die weiteren CI- und
Dokumentationskorrekturen; die veröffentlichte Produktfunktion bleibt gleich.

## 2026-10-17 — Offline-Cache bei Updates
Gemeinsame mini-app-shell erweitert bzw. aktualisiert: versionsunabhängiger öffentlicher API-Cache mit Migration, Asset-Precache standardmäßig aktiv, fehlgeschlagene Installation ersetzt bestehenden Worker nicht. IndexedDB/localStorage bleiben unverändert. Geprüft: 13 Shell-/Update-Tests, Private-Request-Test, Vendor-Parität. Kein Push/Release; kein physischer Geräte-Test.
## 2026-10-19 — VitalOS-eigener Push-Worker

VitalOS registriert `/vitalos-messaging-sw.js` auf `/vitalos-push/` und nutzt
`apps.vitalos` für Geräte-Tokens und Einstellungen. VitalOS-Funktionen senden
mit `app: "vitalos"`; sein Worker ignoriert Nachrichten anderer Apps.
Aktivierte Altgeräte migrieren beim nächsten Öffnen automatisch in die eigene
Token-Lane. Fitness verwendet parallel die Fitness-Lane und den separaten
Worker/Scope.

Statische Syntax-, JSON- und Diff-Prüfungen erfolgreich. Kein Produktions-
Deploy; der lokale VitalOS-Stand enthält außerdem Änderungen im Habit-Submodul.

