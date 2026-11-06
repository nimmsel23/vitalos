// DebugReminderPanel.jsx — Fokus-Sperre Stufe 0: Debug-Schalter für Emulator-/Geräteabnahme.
// Nur eingebaut, wenn zur Build-Zeit VITE_FOCUS_DEBUG=1 gesetzt ist (Gate in main.jsx);
// normale Builds ohne das Flag enthalten dieses Panel nicht im Bundle.
// Siehe docs/product-dev/FOKUS-STUFE-0-1-UMSETZUNG.md und
// ~/dev/HANDOFF-woche3-emulator-stufe0-REZEPT.md (Schritt 2).
//
// Aufrufwegergebnis von runReminderCheck: 'skipped' (Log erfüllt / Uhr / Ruhezeit /
// heute schon erinnert), 'needs-permission' (Berechtigung fehlt), 'scheduled'
// (Benachrichtigung geplant, Tag gemerkt), 'error'. Berechtigungen fragt der
// Runner bewusst nie selbst an — das macht dieses Panel per requestPermissions().

import { useState } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { runReminderCheck, REMINDER_STORAGE_KEY } from "./reminderRunner.js";

// Speicher für den Test: localStorage-Adapter mit der Runner-Schnittstelle
// ({ get, set }). Die echte Einstellungs-UI (Stufe-0-Ausbau) entscheidet später
// über Capacitor Preferences; der Runner ist daran über die Injektion gebunden.
const storage = {
  async get(key) { return localStorage.getItem(key); },
  async set(key, value) { localStorage.setItem(key, value); },
};

const STATUS_TEXT = {
  skipped: "übersprungen (Log erfüllt, Uhrzeit/Ruhezeit oder heute schon erinnert)",
  "needs-permission": "Berechtigung fehlt — Hinweis anzeigen, dann erneut",
  scheduled: "geplant — Benachrichtigung sollte ~2 s später erscheinen",
  error: "Fehler (Plugin-/Speicherfehler)",
};

export default function FocusDebugPanel() {
  const [minimumLogMet, setMinimumLogMet] = useState(false);
  const [status, setStatus] = useState("bereit");
  const [lastRemindedOn, setLastRemindedOn] = useState(() => storage.get(REMINDER_STORAGE_KEY));

  function refreshStorage() { setLastRemindedOn(localStorage.getItem(REMINDER_STORAGE_KEY)); }

  async function requestAndRun() {
    setStatus("Berechtigung wird angefragt …");
    let display = "unbekannt";
    try {
      const perm = await LocalNotifications.requestPermissions();
      display = perm?.display ?? "unbekannt";
    } catch {
      setStatus("Fehler bei der Berechtigungsanfrage");
      return;
    }
    const result = await runReminderCheck({
      plugin: LocalNotifications,
      storage,
      minimumLogMet,
      // Test-Schalter: true simuliert den erledigten Mindest-Log.
      // remindHour 0 und keine Ruhezeit, damit der Test nicht an der Uhr scheitert.
      settings: { remindHour: 0 },
    });
    refreshStorage();
    setStatus(`Berechtigung: ${display} · Ergebnis: ${result} — ${STATUS_TEXT[result] ?? result}`);
  }

  return (
    <div className="fixed bottom-2 left-2 z-[999] w-64 rounded-xl border border-white/10 bg-black/85 p-3 text-[11px] text-white/90 shadow-lg">
      <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/60">
        Fokus Stufe 0 · Debug
      </div>
      <p className="mb-2 text-white/70">
        Testet die Erinnerung ohne heutigen Mindest-Log. Beim ersten Start fragt es
        die Berechtigung für Benachrichtigungen an — sie wird nur für die
        Test-Erinnerung auf diesem Gerät genutzt.
      </p>
      <label className="mb-2 flex items-center gap-2">
        <input
          type="checkbox"
          checked={minimumLogMet}
          onChange={(e) => setMinimumLogMet(e.target.checked)}
          className="h-4 w-4"
        />
        Mindest-Log heute erfüllt (muss überspringen)
      </label>
      <button
        type="button"
        onClick={requestAndRun}
        className="mb-2 w-full rounded-lg bg-white/90 px-2 py-2 text-[11px] font-bold text-black"
      >
        Erinnerung testen
      </button>
      <div className="flex items-center justify-between gap-2 text-white/60">
        <span>gemerkt: {String(lastRemindedOn)}</span>
        <button
          type="button"
          onClick={() => { localStorage.removeItem(REMINDER_STORAGE_KEY); refreshStorage(); setStatus("Speicher zurückgesetzt"); }}
          className="rounded px-1 py-0.5 underline"
        >
          zurücksetzen
        </button>
      </div>
      <p className="mt-2 break-words text-white/70">{status}</p>
    </div>
  );
}
