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
