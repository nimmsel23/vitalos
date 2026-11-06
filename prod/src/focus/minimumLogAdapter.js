// minimumLogAdapter.js — Fokus-Sperre: Naht zwischen Controller (Stufe 0) und
// hasMinimumLogToday aus dem Journal-Baustein (Meta-eigen).
// Siehe docs/product-dev/FOKUS-STUFE-0-1-UMSETZUNG.md, Abschnitt 1 und 2.
//
// journal-dev, Commit 9edb12a:
//   hasMinimumLogToday(entries, habitCompletions, now, options)
//     options.rule: 'journal' | 'habit' | 'any' (Default 'any')
//     options.requiredBeforeHour: 0-23 oder undefined
// Diese Funktion wird IMMER injiziert (Vite-Alias/relativer Import, sobald
// `9edb12a` im journal-app-Integrations-Checkout liegt); hier wird NICHT kopiert
// und nichts ueber Journal-Datenformen angenommen. Entries/Habit-Daten bleiben
// vollstaendig hinter den Loader-Funktionen.
//
// Der Adapter liefert dem Controller sein `getMinimumLogMet(now)` als booleschen
// Wert. Wirft einer der Loader oder fehlt `hasMinimumLogToday`, wirft der Adapter —
// der Controller behandelt das konservativ als 'minimum-log-unavailable'
// (kein Reminder-Spam bei kaputten Daten).

export function createMinimumLogAdapter({
  hasMinimumLogToday,
  loadEntries,
  loadHabitCompletions,
  options = { rule: "any" },
}) {
  return async function minimumLogMet(now) {
    if (typeof hasMinimumLogToday !== "function") {
      throw new Error("createMinimumLogAdapter: hasMinimumLogToday fehlt (Journal-Import nicht verdrahtet)");
    }
    const [entries, habitCompletions] = [
      await Promise.resolve(loadEntries()),
      await Promise.resolve(loadHabitCompletions()),
    ];
    // Immer boolesch zumachen: der Reminder hängt an einem boolean, nicht an
    // zufaelligen Truthy-Werten aus Modul-Refaktoren.
    return Boolean(hasMinimumLogToday(entries, habitCompletions, now, options));
  };
}
