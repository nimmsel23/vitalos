// usageStats.js — Fokus-Sperre Stufe 1: Nutzungsmessung auf der Web-Seite
// (Meta-eigen, reine Funktionen; Plugin wird injiziert, NICHT importiert).
// Siehe docs/product-dev/FOKUS-STUFE-0-1-UMSETZUNG.md.
//
// Native Quelle (Entwurf): prod/src/native/focus/UsageStatsPlugin.kt
//   hasPermission()      -> { granted: boolean }
//   requestPermission()  -> Systemeinstellungen (App-Ops, kein Runtime-Dialog)
//   getTodayUsage()      -> { totalMinutes: number,
//                             apps: [{ packageName, minutes }] }  // Top 5
//   Der Kotlin-Teil reicht rohe Werte; ALLE Normalisierung/Auswertung liegt hier,
// damit sie getestet ist, bevor ein Geraet existiert.

// Defensive Normalisierung des Plugin-Ergebnisses. Alles Ungewoehnliche fuehrt zu
// `available: false` (UI zeigt „Messung nicht verfuegbar“ statt Muell an).
export function normalizeUsageReport(raw) {
  if (!raw || typeof raw !== "object") return { available: false, totalMinutes: 0, apps: [] };

  const total = Number(raw.totalMinutes);
  if (!Number.isFinite(total) || total < 0) {
    return { available: false, totalMinutes: 0, apps: [] };
  }

  const rawApps = Array.isArray(raw.apps) ? raw.apps : [];
  const apps = rawApps
    .filter((a) => a && typeof a === "object" && typeof a.packageName === "string")
    .map((a) => ({ packageName: a.packageName, minutes: clampMinutes(a.minutes) }))
    .filter((a) => a.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  return { available: true, totalMinutes: Math.round(total), apps };
}

function clampMinutes(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n);
}

// UI-Entscheidung, welcher Schritt als naechster noetig ist (Stufe 1, rein):
//   'unavailable'      — kein Plugin (Web/Desktop): Messung aus, kein Fehlerzustand.
//   'needs-permission' — Erklärschirm + requestPermission() anbieten.
//   'ready'            — getTodayUsage() darf geladen werden.
export function usageStatsStep({ pluginAvailable, granted }) {
  if (!pluginAvailable) return "unavailable";
  return granted === true ? "ready" : "needs-permission";
}

// Liest den heutigen Verbrauch inklusive Berechtigungs-/Fehlerbehandlung.
// Liefert NIE einen Throw; `available: false` mit Grund statt crashes (Ablehnung
// ist ein Normalzustand, kein Fehler — Pruefkriterium des Auftrags).
export async function getUsageToday(plugin) {
  if (!plugin || typeof plugin.hasPermission !== "function" ||
      typeof plugin.getTodayUsage !== "function") {
    return { available: false, reason: "plugin-missing" };
  }
  try {
    const perm = await plugin.hasPermission();
    if (!perm || perm.granted !== true) {
      return { available: false, reason: "permission" };
    }
    const report = normalizeUsageReport(await plugin.getTodayUsage());
    if (!report.available) return { available: false, reason: "malformed-report" };
    return { available: true, report };
  } catch {
    return { available: false, reason: "error" };
  }
}

// Auswertung gegen die selbst gesetzte Tagesgrenze (Stufe 1: nur Messen und
// Sichtbarmachen; eine SPAERRE (Stufe 2) wird hier noch NICHT durchgesetzt —
// die Funktion liefert nur den Status, den eine spaetere Sperre konsumiert).
export function evaluateDailyLimit(report, limitMinutes) {
  const limit = Number(limitMinutes);
  if (!Number.isInteger(limit) || limit <= 0) {
    return { status: "no-limit", totalMinutes: 0, limitMinutes: null, remainingMinutes: null };
  }
  const total = report && report.available ? report.totalMinutes : 0;
  const remaining = limit - total;
  return {
    status: !report || !report.available ? "unavailable" : total >= limit ? "over" : "ok",
    totalMinutes: total,
    limitMinutes: limit,
    remainingMinutes: remaining,
  };
}
