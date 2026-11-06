// controller.js — Fokus-Sperre Stufe 0: Orchestrator „heute erinnern?“ (Meta-eigen).
// Siehe docs/product-dev/FOKUS-STUFE-0-1-UMSETZUNG.md.
//
// Der Controller verdrahtet die reinen Entscheidungs-/Settings-Funktionen zu einem
// aufrufbaren Ablauf, OHNE selbst Capacitor, Storage-Backend oder das
// Journal-Modul zu importieren. Alle Abhaengigkeiten werden injiziert; dadurch ist
// der Ablauf in node:test vollstaendig ohne Install/Geraet pruefbar und die
// App-Ui-Integration bleibt bei der Produktlinie:
//
//   getMinimumLogMet  async (now) => boolean
//                     Adapter auf hasMinimumLogToday(entries, habitCompletions,
//                     now, options) aus journal-dev 9edb12a (Importweg: Doku).
//   loadSettings      async () => rohe Settings (z. B. readFocusSettings(storage))
//   saveSettings      async (settings) => void
//   sendNotification  async ({title, body}) => boolean — true nur bei gestellter
//                     Benachrichtigung (Adapter-Entwurf: notifications.js)
//   now               () => Date, injizierbar fuer Tests
//
// Fehler-Philosophie: Bei Fehlern im Log-Adapter NICHT erinnern (konservativ, kein
// Spam bei kaputten Daten); bei fehlgeschlagener Benachrichtigung wird
// `lastRemindedOn` NICHT geschrieben, damit spaeter am selben Tag erneut probiert
// werden kann.

import { explainReminderDecision, localDateKey } from "./remind.js";
import { normalizeFocusSettings } from "./settings.js";

export const FOCUS_REMINDER_NOTIFICATION = Object.freeze({
  title: "Taeglicher Mindest-Log",
  body: "Dein Mindest-Log fehlt heute noch — kurz festhalten?",
});

// Alle injizierten Funktionen duerfen auch nicht-async sein; false statt Throw.
export function createReminderController({
  getMinimumLogMet,
  loadSettings,
  saveSettings,
  sendNotification,
  now = () => new Date(),
}) {
  async function checkToday() {
    const nowValue = now();
    const settings = normalizeFocusSettings(await loadSettings());

    let met;
    try {
      met = await getMinimumLogMet(nowValue);
    } catch {
      // Adapter-Fehler => wie erfuellter Log behandeln: nicht grundlos erinnern.
      return { sent: false, reason: "minimum-log-unavailable", settings };
    }

    const decision = explainReminderDecision(met, nowValue, settings);
    if (!decision.remind) {
      return { sent: false, reason: decision.reason, settings };
    }

    const firedOn = localDateKey(new Date(nowValue));
    let delivered = false;
    try {
      delivered = (await sendNotification({ ...FOCUS_REMINDER_NOTIFICATION })) === true;
    } catch {
      delivered = false;
    }
    if (!delivered) {
      // Kein Schreiben von lastRemindedOn: spaeter am selben Tag erneut moeglich.
      return { sent: false, reason: "notification-failed", settings };
    }

    const updated = normalizeFocusSettings({ ...settings, lastRemindedOn: firedOn });
    try {
      await saveSettings(updated);
    } catch {
      // Persistenz darf die gestellte Benachrichtigung nicht annullieren;
      // schlimmstenfalls erinnern wir morgen erneut.
    }
    return { sent: true, reason: "sent", settings: updated };
  }

  return { checkToday };
}
