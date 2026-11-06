# Gemeinsames Meta-Repo, getracktes Produktverzeichnis

Vorbereiteter Aufbau: private Shell im Root, Store-Shell in `prod/`, genau ein
gemeinsamer Satz App-Submodule im Root. `prod/` ist kein separates Repository
und besitzt weder App-Kopien noch eigene Gitlinks oder ein eigenes Lockfile.

Root-Befehle: `pnpm run product:check`, `product:build`,
`product:build:observe`, `product:build:operate`, `product:build:native` und
`product:manifest`. Der bestehende private Buildweg bleibt im Root.
Details und Grenzen: [Produkt-Migration](../prod/docs/UNIFIED-PRODUCT.md).

Ein `product-*`-Tag pinnt den vollständigen Meta-Repo-Commit mit den
App-Gitlinks und dem gemeinsamen Lockfile. CI verwendet `submodule update
--init --recursive`, niemals `--remote` für Release-Builds.

Der Remote-Name `product` bezeichnet `nimmsel23/vitalos-prod`. Das bloße
Eintragen synchronisiert nichts und berechtigt nicht zum Push. Ein späterer
Release-Mirror kann den vollständigen getaggten Meta-Repo-Stand auf einen
neuen Branch dieses Repositories veröffentlichen. Die bestehende Produkt-
Historie darf dabei nicht ohne Abgleich überschrieben werden. Nur `prod/`
zu exportieren wäre unvollständig, weil Apps und Lockfile im Root liegen.

Integriert am 2026-11-06 auf Branch `dev-product` im aktiven Checkout
(`/home/alpha/vitalos/prod`); ein Meta-Commit pinnt Root, `prod/` und alle
App-Gitlinks gemeinsam. Offen bleiben: Abgleich mit dem älteren lokalen
`dev`-Strang (Observe/Operate-Linie), native Regenerierung, der vollständige
Produkt-Build und die abschließende Ablösung des alten Produkt-Checkouts.
