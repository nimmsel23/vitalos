// notifications.js — Fokus-Sperre Stufe 0: Local-Notifications-Adapter (ENTWURF).
// Siehe docs/product-dev/FOKUS-STUFE-0-1-UMSETZUNG.md, Abschnitt Notifications.
//
// WICHTIG: Das echte `@capacitor/local-notifications` ist NICHT installiert
// (Registry-Regel) und wird hier NICHT importiert. Das Plugin-Modul (Capacitor 8,
// im Lockfile vorhandene Version 8.3.1) wird der Factory UEBERGEBEN — die
// Produktlinie injiziert es erst nach der bewussten Installation. Dadurch ist
// dieser Adapter heute vollstaendig testbar und das Importchema steht fest.
//
// API-Annahmen (bei der Endintegration gegen 8.3.1 verifizieren):
//   LocalNotifications.checkPermissions() -> { display: 'granted'|'denied'|'prompt' }
//   LocalNotifications.requestPermissions() -> { display: 'granted'|'denied'|'prompt' }
//   LocalNotifications.schedule({ notifications: [{ id, title, body,
//     schedule: { allowWhileIdle: true } }] })
//   (schedule mit leerem/fehlerhaftem Payload wirft; hier gefangen.)

import { FOCUS_REMINDER_NOTIFICATION } from "./controller.js";

// Ohne Plugin (Web/Desktop): Adapter meldet bewusst „nicht verfuegbar“ statt zu
// werfen; der Controller behandelt das als 'notification-failed' und probiert
// spaeter erneut.
export function createNotificationAdapter(plugin) {
  if (!plugin) {
    return {
      available: false,
      async requestPermission() { return "plugin-missing"; },
      async send() { return false; },
    };
  }

  return {
    available: true,

    // 'granted' | 'denied' | 'prompt' | 'plugin-error'
    // Ruft, falls noetig, requestPermissions() auf (Android 13+ verlangt
    // POST_NOTIFICATIONS zur Laufzeit; der App-Ui zeigt vorher den Erklaertext).
    async requestPermission() {
      try {
        const current = await plugin.checkPermissions();
        const display = current && typeof current.display === "string" ? current.display : "denied";
        if (display === "granted") return "granted";
        if (display !== "prompt") return "denied";
        const after = await plugin.requestPermissions();
        const final = after && typeof after.display === "string" ? after.display : "denied";
        return final === "granted" ? "granted" : final === "prompt" ? "denied" : final;
      } catch {
        return "plugin-error";
      }
    },

    // send({title, body}) => boolean — Schnittstelle, die der Controller injiziert bekommt.
    async send(notification) {
      try {
        const n = notification && notification.title ? notification : FOCUS_REMINDER_NOTIFICATION;
        const id = Math.floor(Math.random() * 2000000000) + 1;
        await plugin.schedule({
          notifications: [{
            id,
            title: n.title,
            body: n.body,
            schedule: { allowWhileIdle: true }, // Doze-tauglich anfragen; Verhalten nur am Geraet pruefbar
          }],
        });
        return true;
      } catch {
        return false;
      }
    },
  };
}
