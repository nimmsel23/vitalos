/**
 * fuel-dev Firestore-Layer — selektiver Re-Export der modularen Barrels.
 *
 * Quelle: fuel-dev/src/client/lib/db/firestore/*. Nur Namen, die nicht
 * mit dem fitness-Layer kollidieren (Auth, todayISO etc. kommen aus
 * fitness.js). Freitext-Notizen ("Notizen", ehem. Journal des Users) +
 * deren History liegen in notes.js — "Journal" (App-übergreifende
 * Kombi-Ansicht) ist journal-dev's Domäne, siehe journal.js.
 */

export {
  // Nutrition
  getMealsHistory,
  getNutritionCatalog,
  getMicrosCatalog,
  getNutritionLog,
  saveNutritionLog,
  getNutritionLogsInRange,
  deleteMealFromLog,
  searchNutritionCatalog,
  getWeeklyMicros,
  MICRO_KEYS,
  zeroMicros,
  // Supplements
  getSupplementsCatalog,
  getSupplementLog,
  getSupplementsHistory,
  getSupplementStats,
  // Settings (users/{uid}/meta/settings)
  getUserSettings,
  saveUserSettings,
} from "@fuel/lib/db/firestore/index.js";
