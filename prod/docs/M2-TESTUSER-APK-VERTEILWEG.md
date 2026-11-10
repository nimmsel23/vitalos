# M2 — APK-Verteilweg für Simon & Matthias

Stand: 2026-11-10. Org-Task `c3315277` (+alpha +hit, AL-Lauf).
Ziel: Installer-Weg bereit + kurze Anleitung; Ausgabe an CEO für Owner-Handoff.
Kein Store-Upload, kein Geräteanfassen in diesem Auftrag.

## Artefakt (direkt, jetzt nutzbar)

| Feld | Wert |
| --- | --- |
| Paket | `com.vitalos.app` |
| versionName / versionCode | `0.1.0` / `1` (`prod/android/app/build.gradle`) |
| Datei | `prod/android/app/build/outputs/apk/debug/app-debug.apk` |
| Größe | 7,9M |
| Gebaut | 2026-11-06 23:56 CET |
| SHA-256 | `ad47e50d2e75603b5b047d0148d26b4eee4e7fea0f49a288fda53ec507531db5` |
| Signatur | Debug (nicht Play App Signing) |

Begleit-AAB (nur Play/Internal; nicht per Datei-Share installierbar):
`prod/android/app/build/outputs/bundle/release/app-release.aab` (6,0M, 2026-11-06,
SHA-256 `06cca969a553cf1e7c755ee63d851fa9303717f5987af6eb67956bae5d5795f5`).

Kein Release-APK im Workspace. Frischer Build nur auf Owner-/CTO-Auftrag
(`prod/android`, nicht in diesem Task).

## Gewählter Verteilweg (v1)

**Direkte APK-Installation (Sideload).** Play Internal/Closed Track ist noch
kein lieferbarer Weg: Track-Existenz unbekannt, Console-Klicks Owner-only
(`prod/docs/PLAY-CLOSED-TEST-CLICKLIST.md`, C-010; CTO-Fakt C-001b offen).

1. Owner legt die Debug-APK an einen privaten Share (Drive/Link nur für Simon
   und Matthias; nicht öffentlich, nicht in Git).
2. Empfänger: Datei aufs Android-Gerät, „unbekannte Apps“/Dateien-Install
   erlauben, APK tippen, installieren.
3. App öffnen → Google-Login → ein Journal-Eintrag → Sync prüfen
   (DoD wie C-002, auf dem Gerät der Tester).
4. Feedback an Owner/CEO; keine Store-Bewertung nötig.

## Kurz-Anleitung (Copy an Simon / Matthias)

> VitalOS-Testbuild (`com.vitalos.app`, Debug, Version 0.1.0).
> 1. APK vom privaten Link laden (kein Play Store).
> 2. Installation aus dieser Quelle erlauben, APK installieren.
> 3. App starten, mit Google anmelden.
> 4. Einen kurzen Journal-Eintrag speichern und kurz warten (Sync).
> 5. Kurz rückmelden: Install ok? Login ok? Eintrag sichtbar nach Neustart?

## Grenzen / nächster Schritt

- Debug-Signatur: Updates später nur mit derselben Debug-Key oder Neuinstallation.
- Google-Login auf Sideload kann SHA-Abweichungen zeigen — dann Fingerabdrücke
  in Firebase/`com.vitalos.app` nachziehen (CTO/Owner), nicht die Tester.
- Play Internal/Closed: erst nach Owner-Klickliste C-010 + C-001b; dann AAB statt
  Debug-APK.
- C-002 Geräteabnahme (`3c55e958`) bleibt separat (Live-Gerät/Emulator-Freigabe).
