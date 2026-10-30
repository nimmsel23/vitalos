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
- [ ] Erneuten Live-Deploy prüfen (erster Lauf 41051151490 scheiterte am fehlenden Export).
