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

