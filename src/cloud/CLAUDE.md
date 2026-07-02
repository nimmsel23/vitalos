# cloud/ — Firebase Daten-Layer

Kein lokaler Code. Nur für den Firebase-Build (`--mode firebase`).

## firebase.js

Firebase-Initialisierung: App, Firestore (IndexedDB-Cache, Multi-Tab), Auth (Google Provider).
Config kommt via `@firebase-config` Alias → `firebase.config.js` im Repo-Root.

## db.firestore.js

Public-API Parität zu `coach/db.js` — alle Funktionen die Views via `@db` aufrufen existieren hier als Firestore-Implementierung.

Collections: `users/{uid}`, `sessions/{uid}`, `journal/{uid}`, `habits/{uid}`, `kb/{uid}`

## Wann hier editieren

- Neues Feature das auch im Firebase-Build laufen soll → Firestore-Implementierung hier anlegen
- Immer prüfen ob die Funktion auch in `coach/db.js` vorhanden ist (API-Parität)
