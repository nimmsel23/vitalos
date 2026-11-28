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
 *   notes.js    → fuel-dev/.../firestore/notes.js       (Freitext-Notizen + History)
 *   journal.js  → journal-dev/src/db.js                (Wrapper)
 *   habits.js   → habits-dev/src/db/index.js           (Wrapper)
 *   relax.js    → relax-dev/src/lib/db/index.firestore.js (Session-Funktionen)
 *   settings.js → users/{uid} & push                   (Shell-eigen)
 */

// Zuerst: Firebase-Init der Shell (Multi-Tab-Cache + Messaging). Muss vor
// allen Sub-Repo-Modulen evaluieren, damit deren firebase.js-Redirect
// dieselbe App-Instanz sieht.
import "../../cloud/firebase.js";
export { db, auth, googleProvider, getMessagingIfSupported } from "../../cloud/firebase.js";

export * from "./fitness.js";
export * from "./fuel.js";
export * from "./notes.js";
export * from "./settings.js";
export * from "./journal.js";
export * from "./habits.js";
export * from "./relax.js";

// Resolve ESM wildcard conflicts
export {
  getUserProfile,
  updateUserProfile,
  registerShellDevice,
  getPushSettings,
  savePushSettings,
} from "./settings.js";
export { getMealsHistory, getSupplementsHistory } from "./fuel.js";

// getNutritionNotesHistory kommt zusätzlich transitiv über fitness.js →
// @fitness-db/index.firestore.js → @fuel/lib/db/firestore/index.js (dort
// via notes.js reexportiert) — notes.js selbst soll hier gewinnen.
export { getNutritionNotes, saveNutritionNotes, getNutritionNotesHistory } from "./notes.js";

// Konflikte zwischen fitness.js und journal.js/habits.js auflösen
// (habits.js re-exportiert komplett @fitness-db, das kollidiert hier mit
// journal-devs eigenem Journal-Modul — journal.js gewinnt)
export {
  getJournal,
  getJournalHistory, getAllHabitJournalsHistory,
  getAllHabitJournalsForDate,
} from "./journal.js";

// localToday: habits.js re-exportiert es transitiv über @fitness-db, journal.js
// definiert es direkt (journal-app/src/lib/db/core.js) — beide Namen kollidieren
// wortwörtlich (Rollup verwirft sonst BEIDE, "Conflicting namespaces"-Warning
// wird beim Build zum Hard-Error, sobald irgendwer named importiert, z.B.
// fitness-app/src/views/Plan/AssignedPlans.jsx). journal.js gewinnt, da es die
// direkte Quelle ist statt einer transitiven Re-Export-Kette.
export { localToday } from "./journal.js";

// Core/Auth/Sessions Konflikte auflösen (alle Repos exportieren core.js, wir nutzen fitness als SSOT)
export { 
  getUid, watchAuth, signIn, signInEmail, signUpEmail, signOut, isLocalMode, api,
  getSessionHistory
} from "./fitness.js";


// Shell reads stay shared with the standalone apps; writes refresh the week strip.
import { withActivityRefresh } from '../activityChanges.js';
import { saveSession as writeSession, deleteSession as removeSession, saveHabitJournal as writeHabitJournal } from './fitness.js';
import { saveJournal as writeJournal, updateJournal as editJournal, deleteJournal as removeJournal } from './journal.js';
export const saveSession = withActivityRefresh(writeSession);
export const deleteSession = withActivityRefresh(removeSession);
export const saveHabitJournal = withActivityRefresh(writeHabitJournal);
export const saveJournal = withActivityRefresh(writeJournal);
export const updateJournal = withActivityRefresh(editJournal);
export const deleteJournal = withActivityRefresh(removeJournal);
