// remind.js — Fokus-Sperre Stufe 0: Entscheidung „jetzt erinnern?“ (Meta-eigen).
// Siehe docs/product-dev/FOKUS-STUFE-0-1-UMSETZUNG.md und die Konzept-Quellen
// ~/vitalos-prod/docs/product-dev/ANDROID-FOKUS-STUFE-0-1.md sowie FOKUS-SPERRMODUS.md.
//
// Reine Funktion ohne Imports und ohne UI-/Speicher-Anbindung. Der Aufrufer liefert
// alle Daten (Log-Status, Uhrzeit, Geräte-Einstellungen inkl. letztem Erinnerungstag)
// und schreibt nach dem Feuern selbst `settings.lastRemindedOn` zurück (z. B. in
// Capacitor Preferences oder localStorage — Einstellung pro Gerät, kein Backend).
//
// Eingabe:
//   minimumLogMet — Ergebnis von hasMinimumLogToday(entries, habitCompletions,
//     now, options) aus journal-dev, Commit 9edb12a (src/lib/focus/minimumLog.js).
//     Diese Funktion wird importiert, nicht kopiert; geplanter Importweg und
//     Schnittstelle: docs/product-dev/FOKUS-STUFE-0-1-UMSETZUNG.md.
//
//   now — Date, Millisekunden oder ISO-String; ungültig => keine Erinnerung.
//     Maßgeblich ist die lokale Zeitzone des Geräts (wie in minimumLog.js).
//
//   settings (alles optional):
//     remindHour      — volle Stunde 0–23, ab der erinnert werden darf
//                       (Nutzer wählt; Default 10, siehe Konzept Stufe 0).
//     quietStartHour  — Beginn der Ruhezeit als volle Stunde 0–23; null = deaktiviert.
//     quietEndHour    — Ende der Ruhezeit; dürfen vor oder nach quietStartHour liegen
//                       (Fenster über Mitternacht, z. B. 22–7). Ungültiges oder
//                       fehlendes Paar deaktiviert die Ruhezeit.
//     lastRemindedOn  — 'YYYY-MM-DD' (lokal) des letzten gefeuerten Reminder oder null.
//                       Gleicher Tag => höchstens einmal pro Tag.
//
// Semantik: true nur wenn der Mindest-Log fehlt UND jetzt ab remindHour liegt UND
// außerhalb der Ruhezeit UND heute noch nicht erinnert wurde.

const DEFAULT_REMIND_HOUR = 10;

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Akzeptiert Date, Millisekunden oder ISO-String; null bei ungültig.
function toValidDate(v) {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === "number" || typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

// Volle Stunde 0–23 oder `fallback` (bei null/undefined/ungültig).
function hourOr(v, fallback) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= 23 ? n : fallback;
}

function inQuietTime(hour, start, end) {
  if (start === null || end === null || start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end; // Fenster über Mitternacht
}

export function shouldRemindNow(minimumLogMet, now, settings) {
  if (minimumLogMet) return false;
  const nowDate = now === undefined ? new Date() : toValidDate(now);
  if (!nowDate) return false; // ungültige Zeit => konservativ nicht erinnern

  const s = settings && typeof settings === "object" ? settings : {};
  const remindHour = hourOr(s.remindHour, DEFAULT_REMIND_HOUR);
  const quietStart = hourOr(s.quietStartHour, null);
  const quietEnd = hourOr(s.quietEndHour, null);
  const hour = nowDate.getHours();

  if (hour < remindHour) return false;
  if (inQuietTime(hour, quietStart, quietEnd)) return false;
  return s.lastRemindedOn !== localDateKey(nowDate); // höchstens einmal pro Tag
}
