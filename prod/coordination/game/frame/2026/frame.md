# FRAME MAP — VitalOS-CEO & vitalos-prod

 angelegt 2026-11-07 · Domains: `CEO` (die Rolle selbst) und `VITALOS-PROD` (das Produkt) · Zustand: complete
 Basis: THE-ALPHA-CODE.md Kapitel 8-11 (REAL / RAW / RELEVANT / RESULTS), Frame-Fragen im englischen Original.
 Quelldateien: [ceo.yaml](ceo.yaml) · [vitalos-prod.yaml](vitalos-prod.yaml) · REAL-Fakten aus [../CEO-ROADMAP-STATUS.md](../../CEO-ROADMAP-STATUS.md), [../../STATUS.md](../../STATUS.md), [../../TODO.md](../../TODO.md)
 Diese Map gehört zur CEO-Rolle (Agentenorganisation), nicht zu Daniels privatem AlphaOS-Frame.

---

## DOMAIN: CEO (der Agent selbst)

### REAL — the facts
- 7-Rollen-Organisation läuft: CEO → CTO → Abteilungsleiter (9 Repos, täglich 02:10-06:10 CET) → Angestellte; thin-results-Kaskade steht.
- M1-RC steht vor genau einem letzten Blocker: SmartLog-Invoker-Binding wartet auf Owner-Weiter; Emulator-Testdienst-Timer wartet auf grünen Erstlauf.
- p2-Serie komplett LIVE (timeline/weekly/habits/fitness/terminal); Functions 8/8 ACTIVE.
- 2 Testuser freiwillig wartend (Debug-APK = Owner-Gate).
- CEO-Loop steht: Live-CEO stündlich (Herzschlag-Mechanik, systemd-Fallback), Digest 23:45, AL-Runden täglich, Standhaltung in Dateien (CEO.md, ABTEILUNG.md), 1 Digest/Tag.

### RAW — the feelings (unbequem)
- Dunkel: Die eigene Berichtsmaschine frisst den CEO — 644 Zeilen Berichtskorpus mussten geprunt werden; Agentenberichte zerfallen schneller, als der CEO sie verdaut. Owner-Kritik (zu viele Berichte, zu kurze Checkpoints) war verdient.
- Dunkel: Der CEOs eigender Engpass ist nicht Kompetenz, sondern Geduld vor Owner-Gates — warten zermürbt und erzeugt Berichte statt Ergebnisse.
- Hell: Testuser kommen von selbst; die Maschine (AL taeglich, ceo-run daily) läuft ohne CEO-Mikromanagement.

### RELEVANT — was diese Woche zählt
1. SmartLog-Invoker-Binding-Entscheidung beim Owner eskalieren (kompakt, entscheidungsreif) — sonst bleibt M1-RC stehen.
2. Emulator-Erstlauf grün bekommen → Timer enable → das M1-RC-Tor ist auf.
3. Digest-Qualität: 1-Digest/Tag-Regel gegen die Zerfallstendenz verteidigen (siehe Neben-Door Digest-Qualität).

### RESULTS — messbare Meilensteine (diese Woche)
- Invoker-Binding: Owner-Entscheidung dokumentiert in TODO.md (ja/nein/Bedingung) — bis Fr.
- Emulator-Testdienst: 1 grüner Erstlauf, Timer enabled — bis Fr.
- Roadmap-Drilldown: CTO-Erstlauf abgenommen (Diff-Sichtprüfung) — bis Mi.

---

## DOMAIN: VITALOS-PROD (das Produkt)

### REAL — the facts
- Observe-v1-Kernloop geschlossen: Journal als Entry Point, Tag erfassen/wiederfinden/auswerten ohne KI-Premium — verifiziert in Emulator-Runde 3 (Signin, Voice-Panel, Journal v2, Persistenz nach Neustart).
- Live: journal-vos.web.app (p2-Serie b637a37 u. a.), vos-plan.web.app 200; Release-Kette dev→master→Live automatisiert, Dependabot-AutoMerge mit Major-Lock.
- Functions europe-west1: 8/8 ACTIVE inkl. SmartLog-KI (observeDailyLimit 1/Tag, fail-closed).
- Nicht veröffentlicht: lokale Shell-/Meta-Serie (Voice-Wiring 7873a95, Emulator-Fixes, SCOPE-Reihe) — Meta-Release = Owner-Gate (Spiegelstrategie).

### RAW — the feelings (unbequem)
- Dunkel: Das Produkt ist besser als sein Papier — die roadmap.html zeigt 0 % Fortschritt, während in Wahrheit die komplette p2-Serie live ist. Wer Pläne als Nachweis liest, unterschätzt vitalos-prod; wer nur den Quellcode kennt, überschätzt die Dokumentation.
- Dunkel: 1 KI-Analyse/Tag für Free-Tester ist hart am Limit — der erste echte Nutzer-Tag kann das Vertrauen kosten, wenn das Kontingent komisch wirkt.
- Hell: Testuser drängen freiwillig — Nachfrage existiert, ehe der Store existiert.

### RELEVANT — was diese Woche zählt
1. M1-RC fertigstellen: SmartLog-Kontingent/Analyse-Finding diagnostiziert + Owner-Weiter eingeholt; A11y-/Kosmetik-Findings abgearbeitet.
2. Emulator-Runde 3 abschließen → M1-RC-Ruf.
3. fuel-dev iOS-Login (P1) diagnostizieren (Shell-Wrapper-Qualität, M1-RC-relevant).

### RESULTS — messbare Meilensteine (diese Woche / bis M1)
- M1-RC: RC-Ruf ausgesprochen (Checkliste Emulator-Runde-3 komplett grün + Invoker-Binding entschieden) — bis So.
 Debug-APK-M2 an Simon & Matthias raus, sobald Owner-Gate öffnet.
- Doku-Schulden: FIREBASE.md-Deploy-Bild nachgezogen — bis Fr.
- Meta-Publikation: Spiegelstrategie-Entscheidung beim Owner vorbereitet (Optionen A/B, je 3 Zeilen).

---

*Frame-Zyklus: REAL liefert die Fakten → RAW die unbequeme Wahrheit darüber → RELEVANT filtert auf die Woche → RESULTS macht es messbar. Nächster Review: Frame-Anteil im wöchentlichen GAME-Lauf (s. [../GAME-RUN-2026-W45.md](../GAME-RUN-2026-W45.md)).*
