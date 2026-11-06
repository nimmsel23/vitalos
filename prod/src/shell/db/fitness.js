/**
 * fitness-dev Firestore-Layer — 1:1 Re-Export des modularen Barrels.
 *
 * Quelle: fitness-dev/src/lib/db/firestore/* (core, sessions, journal,
 * habits, kb, analysis, user, utils). Kein Doppel-Code: die Shell
 * konsumiert die Sub-Repo-Module direkt beim Build.
 *
 * fitness-dev/src/firebase.js wird beim Firebase-Build via Plugin auf
 * src/cloud/firebase.js umgeleitet (eine einzige Firebase-Init, Config
 * aus @firebase-config).
 */

export * from "@fitness-db/index.firestore.js";
