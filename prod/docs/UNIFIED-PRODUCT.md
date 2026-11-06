# Produkt im gemeinsamen VitalOS-Meta-Repo

Dieser vorbereitete Stand importiert ausschließlich committed Produktdateien
des früheren Produkt-Checkouts. `MIGRATION-SOURCE.json` nennt Quellcommit,
SHA-256 der übernommenen Originaldateien, bewusst ausgeschlossene Pfade und
umgebogene Quell-Symlinks. Die ausgeschlossenen historischen Dateien bleiben
im ursprünglichen Repository erhalten. Nicht committete Dateien, Secrets,
lokale Konfigurationen und Build-Ausgaben wurden nicht kopiert.

## Besitz und Build

- `prod/src`, `public`, Wrapper und native Projekte: Produkt-Shell.
- `../*-app`: genau die App-Submodule des privaten Meta-Repos.
- `../pnpm-workspace.yaml` und `../pnpm-lock.yaml`: einzige Workspace-Definition
  und einziges Lockfile. Produkt ist Workspace-Paket `@vitalos/product`.
- Produkt-Builds benötigen explizit `VITE_VOS_PRODUCT_BUILD=1`, ausschließlich
  Firebase-Projekt `vitalos-prod` und eigene Produktwerte. Die Build-Wrapper
  setzen das Flag; die Vite-Konfigurationen verweigern andere Aufrufe.
- Die gemeinsame Alias-Bibliothek kommt aus `../packages/cross-app-aliases`.
  Die Produkt-Fassung von `mini-app-shell` bleibt vorerst zur Bestandssicherung
  innerhalb des Produkts; eine spätere Konsolidierung ist separat zu prüfen.

`pnpm run product:check` prüft Besitzgrenzen und saubere App-Checkouts auf exakt
den gespeicherten Parent-Pins. `product:build` bereitet die Store-Web-Ausgabe
vor; `product:build:native` die native Web-Ausgabe. Ein Build ist kein Deploy.
Alle geerbten Runbooks in diesem Ordner dokumentieren zunächst den früheren
Fork-Aufbau; diese Datei beschreibt die neue Zuständigkeit.

## Reproduzierbarer Release

Ein geprüfter Meta-Repo-Commit erhält z. B. `product-v1.0.0`. Ein sauberer
Checkout dieses Tags enthält Root-Konfiguration, private Shell, `prod/` und
die exakten App-Pins. `node prod/scripts/release-manifest.mjs product-v1.0.0`
gibt einen Nachweis mit Commit, Tag, Paketmanager, Lockfile-Hash und App-Pins
aus. Ohne Tag ist der Nachweis ausdrücklich nur ein Release-Kandidat.
Es wird kein Tag, Remote-Branch oder Deployment automatisch angelegt.

## Noch vor Integration zu klären

Vorbereitungsstatus: Die Struktur und vorhandenen Produktdateien sind übernommen.
Der gemeinsame Lockfile-Lauf wurde nach wiederholten Registry-Fehlern (23) und
Timeouts beendet; der neue `prod`-Importer fehlt noch. Der Layout-/Release-Guard
verweigert deshalb den vollständigen Freigabenachweis. Es wurde kein fertiger
Produkt-Build und kein neues APK erzeugt. Auf Nutzerwunsch finden keine weiteren
Tests statt. Die aktiven Checkouts bleiben bestehen.

1. Patch-Äquivalenz ist geprüft: Fuel `e351845` ist als `84f8cfd`, Journal
   `3db5810` als `2d5cdf0` bereits im gemeinsamen Release-Stand enthalten.
   `git cherry` markiert beide Produkt-Patches mit `-`; Journals relevante
   Implementierung und Testdatei sind zu diesen Produktdateien bytegleich.
   Die aufbewahrten Patches unter `migration-patches/` dienen dem Nachweis,
   nicht zur erneuten Anwendung. Die alten zusätzlichen Auto-Doc-Commits bleiben
   im bisherigen Checkout erhalten. Authentifizierte Produktnutzung ist damit
   noch nicht nachgewiesen.
2. Das gemeinsame Lockfile muss nach Aufnahme des Produkt-Pakets synchronisiert
   und mit einem Frozen-Install geprüft werden.
3. Native Plugin-Pfade müssen nach Workspace-Installation mit Capacitor neu
   generiert und Android erneut gebaut werden; iOS benötigt weiterhin Xcode.
4. Produkt-CI wird als manuell startbarer Check vorbereitet. Keine privaten
   Deploy-Workflows aus dem alten Fork aktivieren. Produkt-Hosting, Functions,
   Rules und Store-Upload benötigen ihre jeweiligen Freigaben.
5. Kein bestehender Produkt-Branch wird überschrieben. Ein Release-Mirror
   verwendet zunächst einen neuen Branch; Quell-/Release-Historie, Sichtbarkeit,
   CI-Variablen und Buildpfade werden vor Veröffentlichung geprüft.
6. Erst nach Übernahme in `~/vitalos` werden Rechnerpfade, bestehende Worktrees,
   Dokumentation und gegebenenfalls `boot-notify-enhanced` angepasst. Bis dahin
   bleiben beide aktiven Checkouts bestehen.

## Secrets

Produktwerte bleiben in ignoriertem `prod/.product-config/` oder in der
freigegebenen Build-Umgebung. Die bisherige lokale Produktkonfiguration wurde
nicht importiert. Keine Service-Accounts, OAuth-Secrets, privaten VAPID-Werte,
Keystores oder privaten Signing-Dateien veröffentlichen.
