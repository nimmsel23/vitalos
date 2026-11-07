# Lagebericht: Produkt als getracktes `vitalos/prod`

## Aktualisierung nach Umsetzung

Der vorbereitete Umbau ist inzwischen im aktiven `/home/alpha/vitalos`
auf `dev-product` umgesetzt: `2fe70f3` integriert die Produktquellen,
`e9ec5e9` ergänzt den gemeinsamen Lockfile-Importer und `164e6a3` dokumentiert
den Abschluss. Der anschließende Dev-Abgleich ist in `6b088d9` festgehalten;
die aktive Dokumentation wurde in `fa0c98f` verbessert. Die damaligen
Vorbereitungsblockaden „Übernahme“ und „fehlender prod-Importer“ bestehen
somit nicht mehr. Die nachfolgende Android-Arbeit wird von Vibe separat umgesetzt.

Maßgeblicher aktueller Produktstatus:
`/home/alpha/vitalos/prod/docs/PRODUCT-CHECKOUT.md`.
Keine Quelle dieses Berichts rechtfertigt einen automatischen Push/Deploy.

## Vorbereitungshistorie

Der folgende ursprüngliche Bericht bleibt mit seinen damaligen offenen Punkten
als Entstehungsnachweis erhalten; er ist keine aktuelle Restaufgabenliste.

Stand: 2026-11-06. Auftrag: Umbau vorbereiten, Lage berichten; zuletzt ausdrücklich
keine weiteren Tests. Kein Push, Deploy, Store-Upload oder Verschieben aktiver Checkouts.

## Vorbereitet

Der konkrete Entwurf ist als `ff5d45936f8595c6f05fffa28852c9c825ae5044` committet und liegt auf `dev` in
`/tmp/vitalos-product-prep-20261106`, ausgehend von privatem VitalOS-Commit
`8b9b45c6`. Er verwendet die unveränderten neun App-Gitlinks dieses Meta-Repos.

```text
vitalos/
  src/                     private Shell
  fitness-app/              gemeinsame App-Submodule
  fuel-app/
  journal-app/
  ...
  prod/                    getrackte Produkt-Shell und native Projekte
  package.json
  pnpm-workspace.yaml      mit Workspace-Paket @vitalos/product
  pnpm-lock.yaml           einziges gemeinsames Lockfile
```

- 578 committed Produktdateien aus `a3c3725` übernommen; sechs Komponenten-
  Symlinks auf gemeinsame App-Quellen angepasst. Der alte HabitWidget-Verweis
  zeigt nun auf dessen tatsächlichen Besitzer `habit-app`.
- Produkt-Vite, Fitness-Wrapper, Tailwind, Journal-Preflight und Functions-
  Quellpfade auf die gemeinsamen App-Verzeichnisse im Parent angepasst.
- Eigene App-Checkouts, `.gitmodules`, Git-Hooks und zweites Lockfile unter
  `prod/` entfallen. Legacy-Release-Skripte und Auto-Doc-Dienste werden nicht
  als aktive Produktwerkzeuge übernommen. Das Original bleibt erhalten.
- Produkt-Builds verlangen expliziten Produktmodus und Projekt `vitalos-prod`.
  Secrets, ignorierte Produktkonfiguration und lokale Build-Ausgaben wurden
  nicht kopiert. Provenienz und ausgeschlossene Dateien sind inventarisiert.
- Root-Befehle für Produkt-Web, Observe, Operate, Native, Capacitor-Sync und
  Fitness-TWA vorbereitet. Private Root-Buildbefehle bleiben bestehen.
- Manueller Shared-Source-Workflow und angepasster vorhandener Fitness-TWA-
  Workflow vorbereitet; keine automatische Veröffentlichung eingerichtet.
- Native Android-/iOS-Pluginpfade von einer historischen pnpm-Store-ID auf
  stabile Paketpfade umgestellt. Native Regenerierung/Build bleiben ausstehend.
- Release-Manifest mit Meta-Commit, optionalem `product-*`-Tag, App-Gitlinks,
  Paketmanager und Lockfile-Hash vorbereitet. Es verlangt einen sauberen
  Parent und saubere, exakt gepinnte Apps. Ein fehlender Produkt-Lockfile-
  Importer blockiert die Freigabe.

## Was tatsächlich gemergt werden muss

Die ursprünglich als exklusiv vermuteten Produktänderungen sind bereits im
gemeinsamen App-Release-Stand enthalten:

| App | alter Produktcommit | gleicher Patch in `vitalos` |
| --- | --- | --- |
| Fuel | `e351845` | `84f8cfd` |
| Journal | `3db5810` | `2d5cdf0` |

`git cherry` bestätigt jeweils Patch-Äquivalenz. Es fehlt dafür kein weiterer
Code-Merge. Die zusätzlichen lokalen Auto-Doc-Commits bleiben im alten Checkout
erhalten; ihre Doku-Historie muss nicht in einen App-Code-Merge gezwungen werden.
Dieser Befund präzisiert den früheren Git-Audit: dort wurden unterschiedliche
Commit-IDs festgestellt, die Patch-Äquivalenz aber noch nicht geprüft.

Die Android-Projekte von Fuel, 6Pack, Relax und Skills sind bereits auf den
aktuellen gemeinsamen `vitalos`-Ständen vorhanden. Das eigenständige Fitness-
TWA-Projekt stammt aus dem Produkt-Meta-Repo und liegt im Entwurf unter
`prod/platforms/fitness-twa`. APK/AAB-Ausgaben sind Build-Artefakte; übernommen
werden die zugehörigen Quellen, keine ignorierten lokalen Binärdateien.

## Offene Arbeit vor der tatsächlichen Übernahme

1. Das neue gemeinsame Lockfile fertigstellen. Der eine gestartete pnpm-Lauf
   wurde nach wiederholten Registry-Fehlern (23) und Timeouts beendet; er hat
   noch keinen `prod`-Importer geschrieben. Dies ist der konkrete technische
   Restpunkt. Kein Frozen-Install und kein vollständiger neuer Build behauptet.
2. Den vorbereiteten Commit auf `dev` im privaten Meta-Repo übernehmen.
   Der aktive Checkout steht derzeit auf `master`; ein ungeprüfter Checkout-
   Wechsel wird nicht durchgeführt. Vorhandene Worktrees und lokale Änderungen
   bleiben bestehen. Der Produkt-Fork wird erst danach abgelöst.
3. Bei der tatsächlichen Pfadumstellung Dokumentation, Service-/Toolpfade und
   erforderlichenfalls `boot-notify-enhanced` anpassen. Jetzt wurden weder
   Dienste noch aktive Produktpfade verändert.
4. Vor einer Veröffentlichung die native Konfiguration regenerieren und den
   exakten getaggten Quellstand bauen. Tests wurden auf Nutzerwunsch gestoppt;
   die vorhandenen Prüfungsergebnisse aus der Zeit davor sind keine neue
   Android-/Gerätefreigabe.

## GitHub und Release

Der Entwurf hat `origin -> nimmsel23/vitalos` und
`product -> nimmsel23/vitalos-prod`. Beide sind nur Remote-Verbindungen; kein
Push wurde ausgeführt. Ein Produkt-Tag pinnt den vollständigen gemeinsamen
Meta-Repo-Stand. Ein späterer Release-Mirror müsste diesen vollständigen Stand
auf einen neuen Produkt-Branch übernehmen; ein Export nur von `prod/` enthielte
weder App-Gitlinks noch Root-Lockfile. Die alte Produkt-Historie wird nicht
überschrieben. Das VitalOS-Quellrepository ist laut GitHub öffentlich; getrackte
Produktquellen würden bei einem Push dorthin ebenfalls öffentlich.

## Nachvollziehbare Vorbereitung

`scripts/prepare-unified-product.py` und
`migration/unified-product/files/` enthalten den wiederverwendbaren Importer
und die neuen Dateien. Der Importer verlangt einen separaten sauberen
`dev`-Checkout, verweigert ein vorhandenes `prod/` und kopiert ausschließlich
einen angegebenen committed Produktstand. Er führt weder Installation noch
Fetch, App-Merge, Push, Tests oder Deployment aus.

Beispiel für einen bereits angelegten separaten Dev-Checkout:

```sh
python3 scripts/prepare-unified-product.py \
  --source /home/alpha/vitalos-prod \
  --source-ref a3c3725 \
  --destination /tmp/eigener-vitalos-dev-checkout
```

Der isolierte Entwurf wird zusätzlich als Git-Bundle unter
`/tmp/vitalos-product-prep-20261106.bundle` sowie dauerhaft lokal unter
`migration/unified-product/artifacts/prepared.bundle` gesichert (Build-/Transfer-
Artefakt, gitignored; Importer und Vorlagen sind getrackt). Er enthält keine zweite
App-Quellkopie als getrackten Inhalt. Das Bundle benötigt den genannten privaten
Basiscommit; es ist für den bestehenden VitalOS-Verlauf vorbereitet.
