# Produktentwicklung Play-Store-Premium (Wochenrhythmus)

Ziel (User, 2026-11-06): Die Einnahmen aus Play-Store-Premium-Verkäufen und/oder Abos sollen die
laufenden Kosten für Claude und Vibe tragen. Entwickelt wird **VitalOS (Produkt-Fork `vitalos-prod`)**,
keine neue App. ADHS-Fokus, Nutzungssperre und KI-Auswertung sind Eigenschaften dieses Produkts.

## Persistente Dokumente (Quelle der Wahrheit, in dieser Reihenfolge lesen)
1. `~/business/vitalos-android-roadmap.html` — 7 Phasen, Arbeitspakete, Prüfkriterien (Status im Browser-localStorage, Export per Button).
2. `~/vitalos/VitalOS-Produktstrategie-V1.2.0.html` — Produktstrategie, im Drilldown fortzuführen.
3. `prod/coordination/` — CEO-Scope (`CEO-SCOPE-OBSERVE-V1.md`), Roadmap-Status, TODO, STATUS.
4. Dieses Verzeichnis: `WOCHENPLAN.md` (Takt und Verantwortliche), `FOKUS-SPERRMODUS.md` (Konzept), `FRONTEND-REVIEWS.md` (Review-Reihenfolge und Ergebnisse).
5. Aktueller Produktstand: `~/vitalos/prod/docs/PRODUCT-CHECKOUT.md` (Meta-Repo, Branch `dev-product`, fremder Bereich: nur lesen).

## Abgrenzung zum CEO der Android-Linie
Es gibt einen **eigenen CEO-Agenten der Android-Linie** (Foot-Terminal ws1, stündlicher Loop). Er führt `prod/coordination/STATUS.md` und `TODO.md` für die Android-Linie/den Produktwrapper (`~/vitalos/prod`). Er ist **nicht** mein Vorgesetzter und ich nicht seiner: Dieses Verzeichnis gehört dem Claude-Code-Strang (Frontend-Reviews in den `-dev`-Repos, Wochenprotokoll, Fokus-Sperren-Konzept). Wir stimmen uns über die Dateien ab; Entscheidungen trifft Daniel. Seine Rangfolge (Lücke C, p2-weekly, p2-timeline, Emulator statt Gerät) lese ich als Eingabe, nicht als Weisung.

## Regeln
- Jede Woche endet mit einem datierten Eintrag in `WOCHENPLAN.md` (erledigt, rot, offen, Entscheidungen für Daniel).
- Kein Push, Deploy, Store-Upload ohne Freigabe von Daniel. `fitness-aos` nie mit Produkt-Konfiguration berühren.
- Modul-Code gehört in `~/dev/<modul>-dev`, nicht in Submodule des Meta-Repos.
- Nichts als erledigt melden, was nicht geprüft ist. Fragen stellen, wenn es sonst nicht weitergeht.
