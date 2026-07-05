export * from "@fitness-db";

// Stub — fuel-dev ist im lokalen Coach-Build kein eingebundener Daten-Layer
// (eigener Server :9000, kein shared local store). Cloud-Build (Firestore)
// hat die echte Implementierung in cloud/db.firestore.js.
export async function getMealsHistory(_limit) { return []; }
