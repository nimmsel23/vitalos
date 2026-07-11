/**
 * vitalos Shell-@db (Firebase-Build) — Doppelwrapper über die modularen
 * Firestore-Layer der Sub-Repos + Shell-eigene Module.
 *
 * Ersetzt den Monolithen src/cloud/db.firestore.js. `@db` zeigt im
 * `--mode firebase` hierher (vite.config.js); im Local-Build weiterhin
 * auf src/coach/db.js.
 *
 *   fitness.js  → fitness-dev/src/lib/db/firestore/*   (alles)
 *   fuel.js     → fuel-dev/src/client/lib/db/firestore/* (selektiv)
 *   profile.js  → users/{uid}                          (Shell-eigen)
 *   push.js     → fitness/{uid}/settings/push          (Shell-eigen)
 */

// Zuerst: Firebase-Init der Shell (Multi-Tab-Cache + Messaging). Muss vor
// allen Sub-Repo-Modulen evaluieren, damit deren firebase.js-Redirect
// dieselbe App-Instanz sieht.
import "../../cloud/firebase.js";
export { db, auth, googleProvider, getMessagingIfSupported } from "../../cloud/firebase.js";

export * from "./fitness.js";
export * from "./fuel.js";
export * from "./profile.js";
export * from "./push.js";

// Resolve ESM wildcard conflicts
export { getUserProfile, updateUserProfile } from "./profile.js";
export { getMealsHistory } from "./fuel.js";

