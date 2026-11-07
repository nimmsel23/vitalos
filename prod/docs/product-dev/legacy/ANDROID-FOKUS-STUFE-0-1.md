# Auftrag Android-Linie: Fokus-Sperre Stufe 0 und 1 (Woche 3, Entwurf 2026-11-06)

Vorgabe von Daniel (2026-11-06): zuerst Stufe 0 (Erinnerung) und Stufe 1 (Nutzungsmessung); Overlay-Sperre erst nach Closed Test und Policy-Prüfung. Konzept: `FOKUS-SPERRMODUS.md`. Ort der Umsetzung: Produktquelle `~/vitalos/prod` (Meta-Repo, Branch `dev-product`) — gehört der Android-Linie, nicht mir; dieser Auftrag ist eine Übergabe.

## Eingabe aus dem Web-Teil
`journal-dev` `src/lib/focus/minimumLog.js`, Commit `9edb12a`: `hasMinimumLogToday(entries, habitCompletions, now, options)` mit `options.rule` ('journal'|'habit'|'any') und `options.requiredBeforeHour`. Rein, ohne Imports, 8 Tests. Noch nicht in der App verdrahtet.

## Stufe 0: Erinnerung
- Täglich zur Uhrzeit X (Nutzer wählt, Default 10:00) prüft die App, ob der Mindest-Log erfüllt ist; wenn nicht → lokale Benachrichtigung „Noch kein Log heute“ (Capacitor Local Notifications, keine Server-Abhängigkeit, kein Backend-Deploy).
- Keine Benachrichtigung, wenn erfüllt; Ruhezeiten respektieren; Einstellung pro Gerät.
- Zielplattform Android 13+: `POST_NOTIFICATIONS` zur Laufzeit, Hinweistext vorab.

## Stufe 1: Nutzungsmessung
- Natives Capacitor-Plugin (Kotlin) liest `UsageStatsManager` (Berechtigung `PACKAGE_USAGE_STATS`, Nutzer erteilt sie in den Systemeinstellungen; App führt dorthin).
- Anzeige: Bildschirmzeit je App (Top 5) und Summe, gegen den Mindest-Log-Status des Tages.
- Daten bleiben lokal; Data Safety und Datenschutzerklärung vor Release anpassen (siehe Roadmap p3).

## Abgrenzung
Kein AccessibilityService, kein Overlay, kein Foreground-Service-Blocker in dieser Stufe. Notfall-Ausgang erst relevant ab Stufe 2.

## Prüfkriterien (nur belegen, was real getestet ist)
Erinnerung feuert auf einem echten Gerät nach Neustart und im Doze-Modus; Berechtigungsflow ohne Absturz bei Ablehnung; Messwerte stimmen mit Digital Wellbeing grob überein; Release-Build signiert.
