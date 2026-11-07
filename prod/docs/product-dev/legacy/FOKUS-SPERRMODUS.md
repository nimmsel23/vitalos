# Fokus-Sperrmodus („erst loggen, dann Apps“) — Konzept

Zweck: ADHS-nahe Nutzer halten Fokus auf Ziele durch Basisgewohnheiten und Schreiben. Kernmechanik wie
populäre Blocker-Apps: Ohne Log des Tages sind ausgewählte Apps gesperrt. Das ist eine Produkteigenschaft von VitalOS
(Observe), kein separates Produkt. Premium-Hebel: KI-Auswertung der Logs, optional strengere Sperren.

## Regel
Täglicher „Mindest-Log“ (z. B. 1 Journal-Eintrag oder 4B-Check-in vor 10 Uhr) schaltet die Sperre bis Tagesende frei.
Nutzer wählt selbst die gesperrten Apps und die Freischalt-Bedingung (Selbstbindung, kein Zwang durch Dritte).

## Technische Stufen (Android, nativ per Capacitor-Plugin, Kotlin)
| Stufe | Mechanik | Berechtigung | Play-Risiko |
|---|---|---|---|
| 0 | Erinnerung: Push/Notification, wenn bis Uhrzeit X kein Log | POST_NOTIFICATIONS | gering |
| 1 | Nutzung messen und anzeigen (Bildschirmzeit je App) | Nutzungszugriff (`PACKAGE_USAGE_STATS`, vom Nutzer in Systemeinstellungen) | mittel (Sensible Nutzung offenlegen, Data Safety) |
| 2 | Sperre: Foreground-Service erkennt App im Vordergrund (UsageStats), blendet Sperr-Overlay mit „Jetzt loggen“ ein | Overlay (`SYSTEM_ALERT_WINDOW`), Foreground-Service-Typ | mittel–hoch (Overlay-Policy prüfen) |
| 3 | Eigener ablenkungsfreier Modus (Launcher-/Kiosk-ähnlich, App-Whitelist) | evtl. Lock-Task/Launcher-Rolle | hoch, später |
Nicht empfohlen: AccessibilityService für das Blocken. Laut Play-Hilfe zählen Blocker/Monitoring nicht als Accessibility-Tool,
es sind Deklaration und gesonderte, deutliche Einwilligungsanzeige nötig; Fehlverwendung führt zu Sperrung ([Play-Richtlinie](https://support.google.com/googleplay/android-developer/answer/10964491)).
Entwicklerberichte nennen UsageStats statt Accessibility als gangbaren Weg (anekdotisch).

## Voraussetzungen und Reihenfolge
1. Observe v1 läuft stabil auf Android (Woche 3–4). Sperre erst danach.
2. Stufe 0 und 1 zuerst (geringes Risiko, liefert Daten, welche Apps Ablenkung sind).
3. Stufe 2 erst nach Closed Test und geprüfter Policy (Overlay, Foreground-Service-Typ, Data Safety, Datenschutzerklärung).
4. Notfall-Ausgang immer vorhanden (Pause 15 Minuten, deutlich sichtbar, protokolliert) — Sicherheits- und Policy-Gründe.

## Offen / zu prüfen (nicht angenommen)
- Aktuelle Play-Regeln für `SYSTEM_ALERT_WINDOW` und Foreground-Service-Typen (API 36), vor Umsetzung gegen Play-Console-Hilfe prüfen.
- Herstellerspezifische Akku-Optimierung beendet Hintergrunddienste (Samsung/Xiaomi) — auf echten Geräten testen.
- iOS: gleichwertige Sperre über Screen-Time-API (FamilyControls) braucht Apple-Entitlement; eigener Block, später.
