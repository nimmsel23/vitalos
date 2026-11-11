# TODO — VitalOS

- [x] 2026-10-19: VitalOS- und Fitness-Pushes nach App getrennt; VitalOS nutzt
  eigenen Worker, Scope und Token-Lane. Lokal geprüft, noch nicht released.

- [x] Eingebettetes 6pack auf aktuellen Cloud-Sync bringen und vorhandenen Shell-Login weiterreichen.

- [x] 2026-10-17: Nutzer-Abnahme für Selfie-Sync Handy → Laptop und erfolgreiche Production-Veröffentlichung dokumentieren.

- [x] Offline-Cache über App-Updates erhalten: gemeinsame SW-Strategie, API-Migration, vollständiges Asset-Precache und sichere Installation.

- [x] 2026-10-17: Skills aus Fitness-Gitlink auf Production veröffentlichen (eigene Skills-PWA plus Fitness-Host).

- [x] 2026-10-21: 6Pack-Changelog universalisieren, gemeinsame Quelle für VitalOS/Habits/6Pack und Vendor-CLI bereitstellen.

- [x] 2026-10-21: Im Shell-Betrieb einen gemeinsamen VitalOS-Changelog mit App-Änderungen und zentraler Bestätigung nutzen.


## 2026-10-30 — Fuel-Scanner-Release: Firebase-Messaging-Vertrag

- [x] Fehlenden `messaging`-Export im gemeinsamen Shell-Firebase-Layer für eingebettetes Fuel ergänzen, Browserunterstützung vor Initialisierung prüfen und bestehenden asynchronen Getter erhalten.
- [x] Regressionstest für unterstützten Browser, fehlende Unterstützung und fehlschlagende Support-Prüfung; im Shell-CI-Workflow ausführen.
- [x] Vollständiger lokaler `pnpm run build:firebase` erfolgreich.
- [x] Shell-CI 41051683942 mit Fix 2e69ba3 erfolgreich; Live-Bundle enthält Foto-Warteliste/Etikett/Katalogübernahme, frischer Browser rendert ohne unbehandelte JS-Fehler.

## 2026-11-01 — Coach ship

- [x] vos-ship coach ergänzen, standalone Coach mit veröffentlichtem Plan-Pin ausliefern, gemeinsame App-Rules aus VitalOS deployen und Live-SHA prüfen.

## 2026-11-10 — CEO-Dispatch #003

- [ ] C-010 Play Console Closed-Test-Track `com.vitalos.app`: Owner-Klickliste (15 Punkte, Status, Lieferant) in `prod/docs/PLAY-CLOSED-TEST-CLICKLIST.md`. Track-Existenz unbekannt. Kein Console-Klick und kein Upload aus diesem Auftrag.
- [ ] C-011 Live-Smoke nach Live-Deploy (Shell, Journal, 6Pack, Fitness): Tabelle und Regel in `docs/LIVE-SMOKE.md`. Smoke-PRs blockieren keinen Merge und sind erst nach Merge aktiv. Journal-Live ist bei der Probe rot (Syntaxfehler, leeres Root), letzter Deploy-Lauf war grün.

## 2026-11-11 — C-013 Datenschutz und Kontolöschung

- [x] Öffentliche Seiten `/datenschutz` und `/konto-loeschen` (statisches HTML in `prod/public` und `public`, Rewrites vor dem SPA-Fangnetz, Links auf Login, im Körperprofil und im Setup-Bereich Konto).
- [x] Callable `deleteOwnAccount` in `prod/functions` löscht nur die Firestore-Bäume der aufrufenden uid und danach den Auth-Nutzer. Tests mit nachgebautem Firestore, kein Lauf gegen echte Daten.
- [ ] Blocker: keine öffentliche Kontaktadresse im Repo. Platzhalter `KONTAKT-FOLGT@example.invalid`. C-014 ersetzt den Datenschutz-Wortlaut.
- [ ] Blocker: Function-Deploy nach `vitalos-prod` gehört nicht zum Shell-Auto-Deploy. Ohne ihn hat der In-App-Knopf keine Serverwirkung. Nur ein neues Wegwerfkonto prüfen, nie bestehende Personenkonten.

## 2026-11-11 — C-015 Data Safety und AAB

- [ ] C-015 Data Safety und signiertes AAB `com.vitalos.app` (versionCode 1, targetSdk 36), Frist Do 2026-11-12 20:00 Europe/Vienna: Antworten, Werbe-Beleg und Prüferanleitung ohne Zugangsdaten in `prod/docs/DATA-SAFETY-ANSWERS.md`. Klickliste 7, 11 und 12 sind bereit zur Freigabe. Punkt 13 enthält das lokale Verfahren; Pfad `prod/android/app/build/outputs/bundle/release/app-release.aab`, SHA-256 `<nach lokalem signiertem bundleRelease eintragen>`. Offen ist der signierte `bundleRelease` auf der Maschine mit `prod/android/keystore.properties`. Kein Play-Upload aus diesem Auftrag.
