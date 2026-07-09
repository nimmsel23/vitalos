/**
 * fuel-dev Firestore-Layer — selektiver Re-Export der modularen Barrels.
 *
 * Quelle: fuel-dev/src/client/lib/db/firestore/*. Nur Namen, die nicht
 * mit dem fitness-Layer kollidieren (Auth, todayISO, getJournal etc.
 * kommen aus fitness.js); fuel-Journal wird deshalb umbenannt exportiert.
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

// fuel-Journal unter eigenem Namen — getJournal/saveJournal sind im
// Shell-@db bereits durch den fitness-Layer belegt.
export {
  getJournal as getNutritionJournal,
  saveJournal as saveNutritionJournal,
} from "@fuel/lib/db/firestore/journal.js";
