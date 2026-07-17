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
 *   journal.js  → journal-dev/src/db.js                (Wrapper)
 *   habits.js   → habits-dev/src/db/index.js           (Wrapper)
 *   settings.js → users/{uid} & push                   (Shell-eigen)
 */

// Zuerst: Firebase-Init der Shell (Multi-Tab-Cache + Messaging). Muss vor
// allen Sub-Repo-Modulen evaluieren, damit deren firebase.js-Redirect
// dieselbe App-Instanz sieht.
import "../../cloud/firebase.js";
export { db, auth, googleProvider, getMessagingIfSupported } from "../../cloud/firebase.js";

export * from "./fitness.js";
export * from "./fuel.js";
export * from "./settings.js";
export * from "./journal.js";
export * from "./habits.js";

// Resolve ESM wildcard conflicts
export { getUserProfile, updateUserProfile } from "./settings.js";
export { getMealsHistory } from "./fuel.js";

// Konflikte zwischen fitness.js und journal.js/habits.js auflösen
// (habits.js re-exportiert komplett @fitness-db, das kollidiert hier mit
// journal-devs eigenem Journal-Modul — journal.js gewinnt)
export {
  getJournal, saveJournal,
  getJournalHistory, updateJournal, getAllHabitJournalsHistory,
} from "./journal.js";

// Core/Auth/Sessions Konflikte auflösen (alle Repos exportieren core.js, wir nutzen fitness als SSOT)
export { 
  getUid, watchAuth, signIn, signInEmail, signUpEmail, signOut, isLocalMode, api,
  getSessionHistory
} from "./fitness.js";

