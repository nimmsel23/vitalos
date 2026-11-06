// settings.js — Fokus-Sperre: Geraeteeinstellungen (Stufe 0/1), Meta-eigen.
// Siehe docs/product-dev/FOKUS-STUFE-0-1-UMSETZUNG.md.
//
// Reine Funktionen ohne Imports; Speicher wird injiziert (Storage-Naht): die App
// uebergibt ein Objekt mit `getItem`/`setItem` (localStorage oder Capacitor
// Preferences — Einstellung pro Geraet, kein Backend). Alles direkt hier zu
// aendern ist bewusst UNMOEGLICH gemaacht worden: normalizeFocusSettings wirft
// ungueltige Werte weg und setzt Defaults, damit remind.js/der Controller nie
// ungueltige Einstellungen sehen.

export const FOCUS_SETTINGS_KEY = "focus.settings";

export const DEFAULT_FOCUS_SETTINGS = Object.freeze({
  remindHour: 10, // ab dieser vollen Stunde darf erinnert werden (Konzept Stufe 0)
  quietStartHour: null, // Ruhezeit 0-23; null = deaktiviert
  quietEndHour: null,
  lastRemindedOn: null, // 'YYYY-MM-DD' lokal oder null
  dailyMinutesLimit: null, // Stufe 1/2: Warn-/Sperre-Schwelle in Minuten; null = aus
});

// Volle Stunde 0-23 oder `fallback` (bei null/undefined/ungueltig).
function hourOr(v, fallback) {
  if (v === null || v === undefined) return fallback; // Number(null) === 0, nicht NaN
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= 23 ? n : fallback;
}

// 'YYYY-MM-DD' oder null.
function dateKeyOr(v) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

// Positive ganzzahlige Minuten oder null.
function minutesOr(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Ungueltige/fehlende Werte raus, Defaults rein. Ergebnis ist immer vollstaendig.
export function normalizeFocusSettings(raw) {
  const s = raw && typeof raw === "object" ? raw : {};
  return {
    remindHour: hourOr(s.remindHour, DEFAULT_FOCUS_SETTINGS.remindHour),
    quietStartHour: hourOr(s.quietStartHour, null),
    quietEndHour: hourOr(s.quietEndHour, null),
    lastRemindedOn: dateKeyOr(s.lastRemindedOn),
    dailyMinutesLimit: minutesOr(s.dailyMinutesLimit),
  };
}

// Liest Einstellungen aus dem injizierten Storage; Kaputtes/fehlendes JSON fuehrt
// zu Defaults (konservativ), nie zu einem Fehler.
export function readFocusSettings(storage) {
  try {
    const raw = storage.getItem(FOCUS_SETTINGS_KEY);
    if (!raw) return normalizeFocusSettings(null);
    return normalizeFocusSettings(typeof raw === "string" ? JSON.parse(raw) : raw);
  } catch {
    return normalizeFocusSettings(null);
  }
}

// Schreibt Settings gesammelt zurueck (vorher normalisieren, damit nie
// ungueltige Zustaende persistiert werden). `storage.setItem` erhaelt einen
// JSON-String.
export function writeFocusSettings(storage, settings) {
  const normalized = normalizeFocusSettings(settings);
  storage.setItem(FOCUS_SETTINGS_KEY, JSON.stringify(normalized));
  return normalized;
}

// In-Memory-Storage fuer Tests und als Web-Fallback-Referenz.
export function createMemoryStorage(initial = new Map()) {
  return {
    getItem: (k) => (initial.has(k) ? initial.get(k) : null),
    setItem: (k, v) => initial.set(k, String(v)),
  };
}
