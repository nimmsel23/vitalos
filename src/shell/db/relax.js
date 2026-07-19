/**
 * relax-dev Firestore-Layer — Re-Export der modularen Firestore-Barrel.
 *
 * Quelle: relax-dev/src/lib/db/firestore/sessions.js. Nur Session-Funktionen
 * (bereits Relax*-präfixiert, siehe dort) — relax-dev's eigenes Journal.jsx/
 * Theme werden im Shell-Betrieb nicht gemountet (RelaxApp.jsx: journal-dev
 * übernimmt den Journal-Tab). shared/utils.js (localToday/getWeekDates/
 * downloadText) bewusst NICHT re-exportiert — kollidiert sonst ambig mit
 * fitness.js' identischen SSOT-Exports im @db-Barrel.
 */

export {
  getRelaxSession,
  saveRelaxSession,
  getRelaxTechniques,
  getRelaxStatsSummary,
  getRelaxSessionHistory,
  exportRelaxCsv,
} from "@relax-db/firestore/sessions.js";
