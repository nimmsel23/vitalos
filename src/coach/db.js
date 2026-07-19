export * from "@fitness-db";

// relax-dev — lokaler Build spricht direkt mit :9123 (relax-devs eigener
// Node-Server), genau wie relax-dev standalone. Firestore-Variante nur im
// Firebase-Build (shell/db/relax.js → @relax-db/firestore/sessions.js).
export {
  getRelaxSession,
  saveRelaxSession,
  getRelaxTechniques,
  getRelaxStatsSummary,
  getRelaxSessionHistory,
  exportRelaxCsv,
} from "@relax-db/local/sessions.js";

// Stub — fuel-dev ist im lokalen Coach-Build kein eingebundener Daten-Layer
// (eigener Server :9000, kein shared local store). Cloud-Build (Firestore)
// hat die echte Implementierung in cloud/db.firestore.js.
export async function getMealsHistory(_limit) { return []; }
export async function getSupplementsHistory(_limit) { return []; }

// Stub — users/{uid} Profil existiert nur im Firebase-Build (Multi-User).
// Lokaler Coach-Build ist Single-User, UserContext nutzt isLocalMode()-Guard.
export async function getUserProfile(_uid) { return null; }
export async function updateUserProfile(_uid, _data) { return true; }

// Stub — Push-Notifications brauchen FCM + Firestore, existieren nur im
// Firebase-Build. Lokaler Coach-Build zeigt die Settings-Section entsprechend
// nicht an (siehe isLocalMode()-Guard in NotificationsSection.jsx).
export async function getPushSettings() { return { enabled: false, token: null, reminderTime: "18:00", types: {} }; }
export async function savePushSettings(_settings) { return { ok: true }; }
