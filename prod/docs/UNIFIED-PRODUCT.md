# Produktintegration: Zuständigkeit und Herkunft

Der Produktbereich ist unter `~/vitalos/prod` getrackt und verwendet die neun
gemeinsamen App-Submodule im Parent. Workspace, App-Gitlinks und Lockfile werden
einmal im Meta-Repo gepflegt. Die Übersicht mit allen Root-Befehlen liegt unter
[docs/UNIFIED-PRODUCT.md](../../docs/UNIFIED-PRODUCT.md).

## Übernahme am 6. November 2026

| Commit | Inhalt |
| --- | --- |
| `ff5d459` | vorbereitete Produktdateien und gemeinsame Quellpfade |
| `2fe70f3` | Integration auf Basis des privaten Meta-Stands `240a66a` |
| `e9ec5e9` | gemeinsamer Lockfile-Importer `prod` |
| `164e6a3` | dokumentierter Integrationsabschluss |

`MIGRATION-SOURCE.json` inventarisiert den damaligen Produkt-Quellcommit,
Originaldatei-Hashes, ausgeschlossene Pfade und umgebogene Symlinks. Die Hashes
beschreiben die Importquelle, nicht spätere Änderungen an den Zieldateien.
Legacy-Werkzeuge, zweite App-Checkouts und ein zweites Lockfile wurden nicht
als aktive Produktstruktur übernommen. Der ursprüngliche Checkout bleibt
einschließlich nicht übernommener Dateien und lokaler Artefakte erhalten.

Fuel `e351845` ist patchgleich zu `84f8cfd`, Journal `3db5810` zu `2d5cdf0`
im gemeinsamen App-Release-Verlauf. Die archivierten Patches unter
`migration-patches/` dienen dem Nachweis und werden nicht erneut angewendet.
Eigene Auto-Doc-Commits sind kein Beleg für fehlende App-Produktfunktionen.

Die versionierte Quellmigration enthielt keine Secrets. Anschließend wurden
die bestehenden lokalen Produktwerte gesondert nach `.product-config/`
kopiert, mit restriktiven Rechten und weiterhin außerhalb von Git. Das
Original blieb erhalten. Vor späteren Releases ist die Konfiguration des
tatsächlich benutzten Buildorts maßgeblich.

## Abgleich der älteren Observe/Operate-Linie

Der anschließende Commit `6b088d9` dokumentiert den Abgleich mit `f6243f6`:
Diese Dev-Spitze ist Vorfahr des importierten Produktquellstands `a3c3725`.
Für die 120 damals berührten Pfade wurden 103 Produktgegenstücke sowie 17
bewusst getrennte Root-/Legacy-Pfade zugeordnet. Die historischen Dokumente
`OBSERVE-OPERATE-ARCHITECTURE.md` und `DAILY-EXECUTION.md` liegen im Produktarchiv;
der frühere Fork-Commit `73f40d0` dokumentiert ihre Verschiebung.
Der alte Ref wurde zusätzlich als lokales, ignoriertes Bundle im bisherigen
Produkt-Checkout gesichert. Diese Zuordnung erhält die alte Arbeit, ohne
alte private Root-Konfigurationen pauschal in den aktuellen Root zu mergen.
Sie ist kein neuer Build- oder Laufzeitnachweis.

## Zuständigkeit der Bestandteile

- `src/`, `public/`, Wrapper, `android/`, `ios/` und `platforms/`: Produktbereich.
- `../*-app`: gemeinsame App-Integration; Quelländerungen in deren Dev-Repos.
- `../packages/cross-app-aliases`: gemeinsame Alias-Bibliothek.
- `packages/mini-app-shell`: vorerst erhaltene Produkt-Fassung; spätere
  Konsolidierung nur als eigener abgegrenzter Schritt.
- `../pnpm-workspace.yaml`, `../pnpm-lock.yaml`: gemeinsame Paketauflösung.
- `prod/.product-config/`: lokale Produktwerte; nie Quellbestandteil.

## Aussagekraft des Abschlussstands

Der Abschlussbericht zu `164e6a3` meldet saubere App-Pins sowie erfolgreiche
Layout- und Manifest-Guards. Der Manifeststatus war `releaseCandidate: true`,
ohne Release-Tag. Es erfolgten dabei weder neuer nativer Build noch Deployment.
Ein Frozen-Install blieb ausdrücklich ausstehend. Die laufende Folgearbeit
muss ihre Ergebnisse gesondert dokumentieren.

Produktstatus: [PRODUCT-CHECKOUT.md](PRODUCT-CHECKOUT.md).
Konfiguration: [FIREBASE.md](FIREBASE.md). Native Reihenfolge und Freigaben:
[STORE-PUBLISHING-PLAN.md](STORE-PUBLISHING-PLAN.md).
