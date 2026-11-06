# Fuel OS

Fuel OS is an independent local source copy for `fuel-os.web.app`. It starts from
Fuel client source at `b5ec24b` and combines the four former solo apps as tabs
inside one application: Log, Supplements, Mikros, and Protokoll. It also includes
the current Fuel tabs and frontdoors (Tap Board, Shutter, Tagesfaden, and Klassisch).

`src/client` and `src/shared` are copied into this folder. Vite aliases resolve
Fuel source locally here; changes in `fuel-dev` or `fuel-app` do not silently
change Fuel OS. Local Firebase config files in this copy are ignored by the parent Git repo. Cross-app aliases still resolve through the VitalOS submodules
pinned by the parent checkout. To bring newer Fuel work over, copy or merge it
into this folder deliberately and review the result.

## Build and publish

- Build only: `pnpm run build:cloud`
- Publish this site explicitly: `pnpm run deploy`
- Build then publish: `pnpm run firebase`

This directory's `firebase.json` points only to the `fuel-os` Hosting site.
Fuel OS has no automatic release workflow; `fuel-vos.web.app` remains a separate app.

Firebase Cloud Messaging is checked lazily when a push action is used. Browsers without FCM support can still start and use Fuel OS.

## Ernährungspläne

The `Essensplan` tab stores each user's weekly plan in
`nutrition/{uid}/plans/{weekStart}`. Meals are selected from that user's Fuel
catalog, portion factors are saved per entry, and a planned meal can be copied
into the matching nutrition log. A week can be printed or saved as PDF for
sharing. This feature belongs to Fuel OS and does not read or write the separate
Plan app. Use the explicit `pnpm run firebase` command when a reviewed change
should be published to `fuel-os.web.app`.
