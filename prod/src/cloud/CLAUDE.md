# cloud/ — Firebase Daten-Layer

Kein lokaler Code. Nur für den Firebase-Build (`--mode firebase`).

## firebase.js

Firebase-Initialisierung: App, Firestore (IndexedDB-Cache, Multi-Tab), Auth (Google Provider).
Config kommt via `@firebase-config` Alias → `firebase.config.js` im Repo-Root.

## db.firestore.js — ABGELÖST (2026-07-09)

Der Monolith ist **nicht mehr im Build**: `@db` (firebase) zeigt jetzt auf
`src/shell/db/index.js`, das die modularen Firestore-Layer der Sub-Repos
re-exportiert (fitness-dev `lib/db/firestore/*`, fuel-dev
`lib/db/firestore/*`) plus Shell-eigene Module (`profile.js`, `push.js`).
Die Datei liegt nur noch als Referenz hier, bis sie archiviert wird.

## Wann hier editieren

- Nur noch `firebase.js` (Init) lebt hier.
- Neue Firestore-Funktionen → in das jeweilige Sub-Repo-Modul
  (`fitness-dev/src/lib/db/firestore/`, `fuel-dev/src/client/lib/db/firestore/`)
  oder, wenn Shell-eigen, nach `src/shell/db/`.
- Immer prüfen ob die Funktion auch in `coach/db.js` vorhanden ist (API-Parität).
