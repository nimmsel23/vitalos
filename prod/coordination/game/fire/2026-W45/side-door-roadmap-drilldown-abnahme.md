# Neben-Door 2026-W45: Roadmap-Drilldown-Abnahme

Kein War Stack — Neben-Door mit klarer Wochenabnahme. Grundlage: CEO-Auftrag „Roadmap-Drilldown an CTO" (TODO.md, 2026-11-07) mit Erstlauf-Abnahmekriterium „Diff-Sichtprüfung durch CEO VOR Timer-enable".

**Door:** Der erste CTO-Drilldown der roadmap.html (M1-RC-Meilenstein-Block, M2-Testuser-Eintrag, p2-Serie als done-Felder — NICHT als BESTAETIGT/Häkchen) ist abgenommen und der vitalos-roadmap.service-Timer ist danach aktiv.

**Akzeptanz bis Mi:**
- Drilldown läuft schema-treu: NUR verifiziert dokumentierte Stände (M1/M2 ja, M3 weggelassen — existiert nur als Richtung ohne Delta-Ledger-Eintrag).
- CEO-Diff-Sichtprüfung vor dem Timer-enable: keine Regression im unberührten HTML-Bereich, keine BESTAETIGT-Häkchen gesetzt (localStorage-Konvention bleibt Nutzer-bei).
- Nach grünem CEO-Befund: Timer-enable vermerkt im CTO-Stehbild (coordination/CTO.md) mit Datum.

**Nicht-Ziel:** keine Roadmap-Neuerfindung, kein Sync von Fortschritts-Ständen, die nicht belegt sind — Der Plan ist kein Nachweis (AGENTS-Regel).

**Zuständig:** CTO (Drilldown + Service-Bau), CEO (Diff-Sichtprüfung + Timer-Enable-Freigabe).
