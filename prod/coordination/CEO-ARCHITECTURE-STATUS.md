# CEO-Bestandsaufnahme: prod als dedizierter Produktwrapper

Datum: 2026-11-06, ca. 14:05 UTC. Auftraggeber: User (CEO-Koordinator-Rolle).
Geprüfter Stand: `/home/alpha/vitalos`, Branch `dev-product`, HEAD `36292cd`,
Arbeitsbaum sauber. Alle 9 App-Submodule an ihren Gitlinks (kein `+` in
`git submodule status`). Reine Inspektion — keine Tests, Builds, Pushes.

## 1. Verifizierter Ist-Stand

- Meta-Repo: `2fe70f3` (prod/ integriert, 591 Dateien), `e9ec5e9` (prod-Importer
  im gemeinsamen Lockfile), `164e6a3`/`6b088d9` (Doku/Dev-Abgleich),
  `fa0c98f` (Doku), `afbdda9` (Shell-App-Importe auf Parent-Quellen),
  `36292cd` (vos-ship: master->vitalos nur per PR).
- `prod/` hat kein `.git`, keine `.gitmodules`, keinen `*-app`-Ordner und kein
  eigenes pnpm-Lockfile; 595 getrackte Dateien. Workspace
  (`pnpm-workspace.yaml`) umfasst Root, `prod` und `packages/cross-app-aliases`;
  `@vos/cross-app-aliases: workspace:*` wird von prod geteilt.
- Alle 9 App-Quellstände kommen aus den Root-Gitlinks. Belege in
  `prod/vite.config.js`: `APP_ROOT = resolve(__dirname, '..')`; Aliase
  `@components/@lib/@constants -> fitness-app/src`, `@view/journal -> journal-app`,
  `@view/habits -> habit-app`, `@view/learn -> learn-app` u. a.; Import-Plugin
  `miniAppSubmodulePlugin(../fitness-app)`; `firebaseRedirect` zwingt Sub-Repo-
  Firebase-Inits auf die Produkt-Shell-Init (genau eine initializeApp im Bündel).
- Zusätzlich direkte Parent-Importe: 6 Symlinks `prod/src/components/* ->
  ../../../{fitness,habit}-app/...`; `prod/src/shell/SixPackApp.jsx` importiert
  `../../../6pack-app/SixPackPromiseCard.jsx`; `SkillsApp.jsx` aus
  `../../../skills-app/*` (nachgezogen in `afbdda9`).
- Produkteigene Merkmale vorhanden und funktional (nur Sichtung):
  Edition-System `core/store/observe/operate` (`prod/src/shell/productEdition.js`,
  Edition-Guard im Vite-Entry), eigene Produkt-Buildpfade
  (`build:firebase[:store|observe|operate]`, `build:native`, `build:cloud`),
  Produkt-Firebase nur aus gitignored `.product-config/`,
  `firestore.product.rules`, Capacitor `prod/android`+`prod/ios`, separater
  Fitness-TWA-Pilot `prod/platforms/fitness-twa`, separates Hosting-Target
  `firebase.product-fitness.json` für den Standalone-Fitness-Wrapper.
- `prod/vos-fitness` ist ein schlanker Wrapper: `src/AppWrapper.jsx` importiert
  nur `./pulse/PulseApp.jsx`; die Produkt-Shell bindet über `@pulse ->
  prod/vos-fitness/src/pulse` ein. Fitness-Quellcode selbst kommt aus
  `../fitness-app`.

## 2. Bewertung: Was prod schon ein dedizierter Wrapper ist

Das Ziel „prod baut aus denselben Gitlink-Quellen wie die private Shell, ohne
zweite App-Pins" ist strukturell erreicht: keine duplizierten `*-app`-Repos,
keine zweite Gitlink-Landschaft, alle 9 Quellstände identisch zur privaten
Shell. Der Produktmodus ist fail-closed (`VITE_VOS_PRODUCT_BUILD`-Guard im
Vite-Entry, Edition-Guard, Firebase-Redirect). Der Fitness-Wrapper und die
Edition-Komposition (obtain/observe/operate) sind eigenständige Produktanteile,
kein bloßes Build-Profil der privaten PWA.

## 3. Kompositionsgrenzen und fehlende Produktmerkmale

1. **prod/src ist ein Fork der privaten Shell, keine abgegrenzte Komposition.**
   `prod/src` (121 getrackte Dateien) dupliziert `src/shell` großteils 1:1;
   nur ca. 10 Dateien divergieren (App.jsx, main.jsx, ShellAppRouter, Journal-,
   Habits-, Relax-, SixPack-, Skills-App, Sidebar; plus produkt-eigene Dateien
   wie productEdition.js, EditionModeSwitch.jsx, ObserveNavigation.jsx,
   cloud/*). Die Grenze „prod-eigene Produktdelta vs. synchron zu haltende
   Kopie" ist nirgends definiert — Drift mit der Root-Shell ist vorprogrammiert.
2. **`prod/packages/mini-app-shell` ist eine driftende Near-Copy** des
   Root-Packages (Differenz: `vos-changelog-vite.mjs`; prod-exklusiv:
   `test/product-edition.test.mjs`). Beide Buildpfade (prod/build-Skripte und
   `prod/vos-fitness/vite.config.cjs`) nutzen die prod-Kopie.
3. **Wrapper-Lockfiles außerhalb des gemeinsamen Lockfiles.** `prod/vos-fitness`
   (im Produkt-Buildpfad über `@pulse`) trägt ein eigenes npm
   `package-lock.json`; gleiches Muster bei `fuel-os`, `vos-observe`,
   `vos-fuel-mini`. Deren Abhängigkeitsstände werden vom Parent-Commit nicht
   gepinnt. `prod/functions/package-lock.json` ist dagegen Firebase-Deploy-
   Standard und unproblematisch.
4. **Store-Fähigkeit der core/store-Edition offen.** `prod/branding/` enthält
   nur observe/operate-Icons; für die vermarktbaren Editionen fehlen
   Brand-Assets/Splash/Store-Listing-Bausteine, und laut STATUS existieren
   keine Keystores im übernommenen Bestand. Schritt 4 (Gradle-Build) ist laut
   `prod/docs/STORE-PUBLISHING-PLAN.md` vom Nutzer zurückgestellt.
5. **Nachweisführung hinkt hinterher.** Die Commits `afbdda9`/`36292cd` und die
   laufende native Runde (prod/android, prod/dist-native, Capacitor-Sync) sind
   in STATUS.md noch nicht erfasst.

## 4. Ableitung

Fünf konkrete Aufträge hierzu stehen ab jetzt in `TODO.md` (Abschnitt
„CEO: Produktarchitektur-Aufträge"). Sie sind Dokumentations-, Entscheidungs-
und Nachweisaufträge — bewusst KEINE Refactors, Builds oder Tests. Die
Freigabelage (Push/Deploy/Store) ändert sich dadurch nicht.
