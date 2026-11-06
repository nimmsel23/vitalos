// reminderRunner.js — Fokus-Sperre Stufe 0: führt die Erinnerung aus (Meta-eigen).
// Verbindet shouldRemindNow (remind.js) mit einem Benachrichtigungs-Plugin und einem Speicher.
// Alles Plattformabhängige wird injiziert, damit die Logik ohne Gerät testbar ist:
//   plugin  — Capacitor-LocalNotifications-kompatibel: checkPermissions(), schedule({notifications})
//   storage — { get(key) → string|null, set(key, value) } (z. B. Capacitor Preferences)
// Berechtigungen werden hier NIE angefragt (Hinweistext vorab ist Aufgabe der UI): ohne Erlaubnis
// kommt 'needs-permission' zurück, und es wird nichts geplant oder gespeichert.

import { shouldRemindNow } from "./remind.js";

export const REMINDER_STORAGE_KEY = "focus.lastRemindedOn";
export const REMINDER_NOTIFICATION_ID = 41001;

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * @returns {Promise<'skipped'|'needs-permission'|'scheduled'|'error'>}
 */
export async function runReminderCheck({ plugin, storage, minimumLogMet, now, settings, title, body }) {
  try {
    const nowDate = now === undefined ? new Date() : new Date(now);
    if (Number.isNaN(nowDate.getTime())) return "skipped";
    const lastRemindedOn = (await storage.get(REMINDER_STORAGE_KEY)) || null;
    const merged = { ...(settings || {}), lastRemindedOn };
    if (!shouldRemindNow(minimumLogMet, nowDate, merged)) return "skipped";

    const perm = await plugin.checkPermissions();
    if (!perm || perm.display !== "granted") return "needs-permission";

    await plugin.schedule({
      notifications: [{
        id: REMINDER_NOTIFICATION_ID,
        title: title || "Noch kein Log heute",
        body: body || "Ein kurzer Eintrag reicht, um den Tag freizuschalten.",
        schedule: { at: new Date(nowDate.getTime() + 2000), allowWhileIdle: true },
      }],
    });
    // Erst nach erfolgreichem Planen merken, sonst gäbe es bei Fehlern keinen zweiten Versuch.
    await storage.set(REMINDER_STORAGE_KEY, localDateKey(nowDate));
    return "scheduled";
  } catch {
    return "error";
  }
}
