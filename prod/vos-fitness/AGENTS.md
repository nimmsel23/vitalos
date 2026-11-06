# AGENTS.md — Fitness-Produktwrapper

Dieser Ordner gehört zu `~/vitalos/prod`, nicht zu einem eigenen Repository.
Es gelten `../../AGENTS.md` und `../AGENTS.md`. Fitness-, Plan-, 6Pack- und
weitere App-Quellen kommen aus den gemeinsamen Submodulen im Meta-Repo-Root;
keine zusätzlichen App-Kopien hier anlegen.

Der Wrapper besitzt Pulse-Oberfläche und Produktanbindung. `src/pulse/PulseLog.jsx`
ist der wiederverwendete Kern; `PulseApp.jsx` stellt Login, Seiten und Navigation.
Die Produkt-Shell kann denselben Pulse-Kern einbetten. Fachliche App-Änderungen
gehören ins zuständige Dev-Repo. Keine unabhängige zweite Fitness-Implementierung.

Den Produkt-Build vom Meta-Root mit `pnpm --filter @vitalos/product run
build:fitness:product` ausführen. Die TWA-Webvorbereitung heißt im Root
`pnpm run product:build:twa`; Paket-/Fingerprint-Werte werden dafür zusätzlich
benötigt. Wrapper-Webausgabe: `prod/vos-fitness/dist-firebase`.
Die native TWA-Quelle liegt in `../platforms/fitness-twa`.

Produkt-Firebase ist ausschließlich `vitalos-prod`. Das geerbte lokale
`firebase.json` des Wrappers nennt den privaten Legacy-Weg und darf nicht für
das Produktdeploy verwendet werden. Zuständig ist `../firebase.product-fitness.json`.
Ein Build beauftragt keinen Deploy und keinen Testlauf.

Bei UI-/Importänderungen Vite-Aliase, Tailwind-Quellpfade und zuständige Doku
zusammen pflegen; nur eigene Dateien committen. Produktstatus und Release-Weg:
`../docs/PRODUCT-CHECKOUT.md`, `../docs/FIREBASE.md`,
`../docs/STORE-PUBLISHING-PLAN.md`.
