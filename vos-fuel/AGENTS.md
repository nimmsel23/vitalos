# vos-fuel

Wrapper um `fuel-app` (Hosting-Site `fuel-vos`, Projekt `fitness-aos`), analog zu `vos-fitness`. Grobe Variante: Views, Hooks,
Store und Firebase-Anbindung kommen per Alias `@fuel` aus `fuel-app/src/client`, hier liegt nur die Hülle.

- **Home** (`src/home/FuelHome.jsx`): die drei Schnelleinstiege Tap Board (`TapRow`), Shutter (`ShutterSheet`, Overlay) und
  Tagesfaden (`Faden` + `Composer`) in EINEM Screen, dazu `DayBar` (kcal-Ring + Makros) und `PotsStrip` (Töpfe, „+¼“ trägt eine
  Portion in den Faden ein).
- **Seiten** (`src/FuelApp.jsx`, Hash-Routen `#/menu`, `#/log-dashboard`, `#/log-timeline`, `#/pots`, `#/kitchen`, `#/catalog`, …):
  die Tabs aus `fuel-app/src/client/routes.js`, unverändert. Menü in `src/Menu.jsx`.
- Build: `npm run build` (vite + `scripts/stamp.mjs` für SW/Splash), Deploy nur über `.github/workflows/deploy-vos-fuel.yml`
  im Meta-Repo (vorerst manuell) oder Preview-Channel: `firebase hosting:channel:deploy <name> --project fitness-aos`.
- Neue Preview-Channel-Domains müssen unter Authentication → autorisierte Domains stehen, sonst scheitert der Google-Login.
- fuel-dev deployt bisher die volle App auf dieselbe Site `fuel-vos` (`deploy-master.yml`, Target `client`); vor dem Live-Schalten
  dort abschalten. `fuel-os` bleibt der alte fuelctx-Stand.
