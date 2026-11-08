# Wochenplan (Takt: eine Woche, ein Schwerpunkt)

## Aufgabengruppen (schlicht nach Aufgabe benannt)
| Gruppe | Aufgabe | Ausführender |
|---|---|---|
| Frontend-Review | Älteste Oberflächen prüfen, Refactor-Vorschläge mit Aufwand und Risiko liefern | Claude Code |
| Android-Kern | Capacitor/TWA, Build, Signierung, später Fokus-Sperre (natives Plugin) | Vibe |
| Produkt/Scope | Free/Premium-Matrix, Strategie-Drilldown, Store-Texte | Claude Code + Daniel |
| Backend/KI | Smart-Log-Parsing, Kontingent, Billing-Entitlements, Firestore-Rules | Vibe |
| Prüfung | Release-Testmatrix, Datenschutz/Data-Safety | Claude Code, Daniel (Geräte) |

## Wochen
- **Woche 1 (ab 2026-11-06): Docs + Frontend-Review.** Persistente Docs (diese Dateien), Review-Reihenfolge festlegen, erste Reviews (Journal-Eingabe, Habits).
- **Woche 2: Review-Umsetzung + Scope-Freigabe.** Freigegebene Refactors in den `-dev`-Repos; Daniel entscheidet die 4 offenen Fragen aus `CEO-SCOPE-OBSERVE-V1.md`.
- **Woche 3: Android-Basis.** Interner Test-Build auf echten Geräten (AAB liegt laut PRODUCT-CHECKOUT vor), Login/Sync/Löschen verifizieren.
- **Woche 4: Trust.** Rules-Emulator-Tests, Kontolöschung, Datenschutz, Data Safety.
- **Woche 5–6: Closed Test** (12 Tester, 14 Tage, falls neues persönliches Konto), parallel Fokus-Sperre Stufe 1 (siehe Konzept).
- **Woche 7+: Public Release Observe v1**, danach Operate Premium (KI-Kontingent, Play Billing).

## Wochenprotokoll
### Woche 1 (2026-11-06)
- Ziel gesetzt, Arbeitsort `~/vitalos-prod` von Daniel freigegeben, Start mit Docs + Frontend-Review.
- Docs angelegt (README, WOCHENPLAN, FOKUS-SPERRMODUS, FRONTEND-REVIEWS).
- Offen: Entscheidungen für Daniel (siehe unten).

### Woche 2 (2026-11-06, Fortsetzung)
- Entscheidungen 1–4 von Daniel bestätigt (unten).
- Claude: `journal-dev` `a3bb65c` (Labels/44px in Habits und JournalForm), Reviews 1–3 in `FRONTEND-REVIEWS.md`.
- Vibe A: `fuel-dev` `4828901`, `relax-dev` `4895b67` (gleiches Muster); `plan-dev` `1911fd46`. CI auf `dev` grün (Check + Preview), von Claude gegen `gh run list` nachgeprüft. Bewusst ausgelassen: dichte Stepper/Chip-Reihen (Fehltipp-Risiko). Befund: `plan-dev` `dev` baut standalone nicht (`src/main.jsx` importiert fehlendes `contexts/SettingsContext.jsx`, `SessionHeader` fehlendes `useDayStrip`; lösen nur im fitness-Overlay auf) — vorbestehend, offen.
- Vibe B: `journal-dev` `9edb12a`, `hasMinimumLogToday` (`src/lib/focus/minimumLog.js`, 8 Tests grün auch in 3 Zeitzonen), noch ohne UI-Anbindung.
- Noch nicht auf `master`: alles liegt auf `dev` (Preview). Gerätetest durch Daniel steht aus.
- Vibe C (neu, Worktree-Branch `focus-stufe-0-1` aus dev-product, kein Push): Stufe-0-Logik `shouldRemindNow` (Commit `acd9906`, lokaler Branch `focus-stufe-0-1` in `~/vitalos`, nicht gepusht; 9/9 Tests von Claude nachgelaufen), Kotlin-Skizze `UsageStatsPlugin.kt` (nicht gebaut), Umsetzungsdoku `prod/docs/product-dev/FOKUS-STUFE-0-1-UMSETZUNG.md`. Befund: `@capacitor/local-notifications` fehlt in `prod/package.json`, Manifest ohne `POST_NOTIFICATIONS`; `9edb12a` noch nicht in der journal-app-Pointer-Linie. Übernahme in `dev-product` entscheidet die Android-Linie/Daniel.
- Offen: Fuel-Minimalfelder (Entscheidung), Habits-Ziel-Layout (`DailyFourLayout` vorgeschlagen), Gerätetest der Trefferflächen.

## Entscheidungen (Daniel, 2026-11-06; nachträglich änderbar)
1. Tagesmodell: `body/being/balance/business` (4B) eingefroren. Daniel: inhaltlich dasselbe wie health / wealth / relations / self; Doing/Thinking/Feeling/Being wird nicht neu gebaut.
2. „The Voice reflektieren“: **Free**.
3. KI-Kontingent Free: ~~1 Eintrag/Woche~~ **überholt, von Daniel bestätigt (2026-11-06, „ja 1 KI-Analyse pro Tag für Free-User“):** Der CEO der Android-Linie dokumentiert eine spätere Präzisierung von Daniel (CEO-TODO „Free-KI-Budget täglich statt wöchentlich“, 2026-11-06 15:40 UTC): **1 KI-Analyse pro Tag**, Smart-Log und The Voice teilen sich dasselbe Tagesbudget; Optimalnutzung = ganzer Tag in einem Eintrag. Quelle: `migration/unified-product/coordination/CEO-SCOPE-OBSERVE-V1.md`.
4. Fokus-Sperre: **Stufe 0 und 1 zuerst** (Erinnerung, Nutzungsmessung); Overlay-Sperre (Stufe 2) erst nach Closed Test und Policy-Prüfung.
5. Fuel-Mahlzeit (Skill-Stack-Minimalfelder): **aktuelles Formular unverändert** in v1; keine Vereinfachung.
6. Habits-Ziel-Layout: **`DailyFourLayout`**. Ist im Code bereits der Default (`index.jsx`, `layoutMode` Default `"daily-four"`, gemerkt in localStorage `habits-layout-mode`); kein Umbau nötig. Offen: `Core4Layout` später reduzieren; die Umschalt-Icons in `DailyFourLayout`-Kopf haben nur `title`, kein `aria-label`.
7. Branch `focus-stufe-0-1` nach `dev-product` übernommen (fast-forward, `acd9906`, nicht gepusht).
8. Plugin `@capacitor/local-notifications` 8.3.1 und `POST_NOTIFICATIONS` in `dev-product` (`9bd71c9`, Lockfile frozen geprüft, nicht gepusht; kein `cap sync`, kein Android-Build).
9. `prod/src/focus/reminderRunner.js` (`runReminderCheck`, Plugin und Speicher injiziert, 15/15 Tests mit Fakes) in `dev-product`, nicht gepusht.
10. Kein Android-Gerät vorhanden, nur Emulator (AVD `Medium_Phone_API_37.0`): Daniel hat der Android-Linie das Stufe-0/1-Doc übergeben; die Android-Linie baut und testet. Vibe D wurde deshalb sofort wieder beendet (keine Parallelarbeit). Emulator-Testrezept: `~/dev/HANDOFF-woche3-emulator-stufe0-REZEPT.md`.
11. Emulator-Versuch (Claude, 2026-11-06 ~18:20): Fremd-Installation `com.vitalos.app` entfernt (mit Daniels „ja go“), Android-Linie-APK `57d0bbd8…` (Hash stimmt mit `0828f12`) installiert, `POST_NOTIFICATIONS` per `adb` erteilt (`granted=true`), App startete bis zum Login-Screen (von Daniel gesehen); Debug-Panel-Chunk `DebugReminderPanel-*.js` ist in der APK. **Benachrichtigung nicht ausgelöst:** Emulator bei knappem RAM (System UI und Digital Wellbeing reagierten nicht), `uiautomator` lieferte `null root`, Screenshot schwarz. Emulator wieder beendet. Wiederholung bei freiem RAM; Auslösen über „Erinnerung testen“ im Panel.
Offen: Gerätetest der Trefferflächen (Handy oder Emulator-Browser); `cap sync` + Android-Build + Verdrahtung der Erinnerung (Android-Linie); Anbindung `hasMinimumLogToday` (journal-app-Pointer auf `9edb12a` heben).
