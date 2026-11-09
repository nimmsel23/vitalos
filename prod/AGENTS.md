# AGENTS.md — getrackter VitalOS-Produktbereich

Es gelten die Regeln in `../AGENTS.md`. `prod/` gehört zum Parent-Meta-Repo;
kein eigenes `.git`, keine `.gitmodules`, keine App-Checkouts und kein zweites
Lockfile anlegen. Die neun gemeinsamen `../*-app` liefern den Quellstand.
App-Code wird in den zuständigen `~/dev/*-dev`-Repos bearbeitet.

Produkt-Shell, Wrapper und native Produktquellen werden hier standardmäßig auf
`master` bearbeitet (`dev-product` ist entfernt). Keine Parallel-Branches/
Worktrees ohne ausdrückliche Owner-Ausnahme. Arbeitsbaum vor Edits prüfen.
Funktionierende Stände mit passender Doku scoped committen; nicht
unbeabsichtigt fremde Dateien oder Pointer aufnehmen.

Produktziel ist ausschließlich Firebase `vitalos-prod`. Die Produkt-Build-
Wrapper setzen den Produktmodus und verlangen eigene Konfiguration. Root-
Private-Deploys und geerbte Wrapper-Deploys sind kein Produktweg. Lokale Werte
in `.product-config/` sind gitignored und dürfen nicht ausgegeben oder
committet werden. Die lokale Konfigurationskopie vom alten Checkout ist kein
Bestandteil der versionierten Quellmigration.

Buildbefehle und Arbeitsverzeichnisse: `../docs/UNIFIED-PRODUCT.md`.
Aktueller Stand: `docs/PRODUCT-CHECKOUT.md`. Produkt-Firebase:
`docs/FIREBASE.md`. Native Projekte und Store: `docs/STORE-PUBLISHING-PLAN.md`.
Provenienz der ursprünglichen Übernahme: `docs/MIGRATION-SOURCE.json`.
Historische Berichte unter `docs/archive/` sind keine aktuellen Agent-Regeln.

Ein Web-Build, Capacitor-Sync, APK/AAB, Geräteinstallation, Login und Store-
Freigabe sind getrennte Ergebnisse. Push, Deploy, Upload und Service-Neustarts
benötigen den jeweiligen Auftrag; ein reiner Build beauftragt sie nicht.
