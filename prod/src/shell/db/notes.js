/**
 * fuel-dev Notizen-Layer — Freitext-Tagesnotizen ("Notizen", ehem. Journal
 * des Users) + deren History. Eigenständig von journal.js (= journal-dev
 * Barrel, das generische App-übergreifende Journal).
 *
 * Quelle: fuel-dev/src/client/lib/db/firestore/notes.js.
 */

export {
  getNotes as getNutritionNotes,
  saveNotes as saveNutritionNotes,
  getNutritionNotesHistory,
} from "@fuel/lib/db/firestore/notes.js";
