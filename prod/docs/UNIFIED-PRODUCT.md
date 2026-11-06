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

## Shell-Kompositionsgrenze: prod/src gegenüber der Root-Shell

Klassifikation der getrackten `prod/src`-Dateien (Stand `cb4a55b`, HEAD-Vergichl
gegen Root `src`; 114 gemeinsame Pfade, 7 prod-exklusive, keine nur-Root-Pfade):

| Klasse | Umfang | Pflegeregel |
| --- | --- | --- |
| 1:1-Kopie | 96 von 114 gemeinsamen Dateien | Bei Root-Shell-Änderungen an denselben Dateien synchron nachpflegen; unbeabsichtigte Drift ist ein Fehler, kein Produktmerkmal |
| Symlink auf App-Quelle | 6 Dateien in `prod/src/components` auf `../../../{fitness,habit}-app/...` | Bewusst gemeinsame Quelle; niemals zu Kopien zurückwandeln |
| Produktdelta | 12 Dateien: `App.jsx`, `main.jsx`, `cloud/firebase.js`, `cloud/db.firestore.js`, `shell/{Journal,Relax,Habits,SixPack,Skills,Coach}App.jsx`, `ShellAppRouter.jsx`, `layout/Sidebar.jsx` | prod-eigene Inhalte: Edition-Runtime (`productEdition`, `EditionModeSwitch`, native Auth-Init), Parent-Importpfade (`../../../*-app/`), Firebase-Redirect auf genau eine Produkt-Init |
| prod-exklusiv | `cloud/{firebaseConfig,firebaseVertexaiCompat,productRuntime}.js`, `product-editions.css`, `shell/{productEdition.js,EditionModeSwitch.jsx}`, `shell/layout/ObserveNavigation.jsx` | Nur hier bearbeiten — das ist die produkt-eigene Kompositionsschicht |

Empfehlung (kein Umbau ohne Abstimmung): die 96 synchronen Kopien mittelfristig
auf Alias-/Symlink-Auflösung wie bei den Komponenten umstellen; bis dahin gilt
obige Pflegeregel. Root-exklusive Bestandteile (z. B. `src/coach`-Serveranteile,
`src/shell/views`) sind bewusst nicht Teil der Produktschale.

## mini-app-shell: Doppelung und Entscheidung

`prod/packages/mini-app-shell` ist eine Near-Copy des Root-Packages mit genau
zwei Abweichungen (Stand `cb4a55b`): (1) die prod-Fassung von
`vos-changelog-vite.mjs` versteht die Option `showRelease === false` (Blendet
das Release-Changelog im Store-Produkt aus); (2) prod-exklusiver Test
`test/product-edition.test.mjs`. Beide Produkt-Buildpfade (prod-Buildskripte
und `prod/vos-fitness/vite.config.cjs`) nutzen die prod-Kopie.

Entscheidung: Parameterisierung anstreben — `showRelease` als Option in das
Root-Package übernehmen (Default unverändert, kein Verhaltenseffekt für die
private Shell) und den Edition-Test zuordnen. Bis zu diesem abgestimmten
Schritt gilt die prod-Kopie als explizite Abspaltung: Änderungen an
`packages/mini-app-shell/vos-changelog-vite.mjs` sind verpflichtend gegen die
prod-Kopie zu prüfen; die Divergenzliste oben ist die Referenz. Ungetrackte
`*.bak-paths`-Dateien im Root-Package sind Arbeitsartefakte, kein Bestandteil.

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
