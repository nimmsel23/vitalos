// Sehr bewusst simpel gehalten: lieber ein unperfekter Treffer sofort als
// ein "korrektes" Parsing, das den Nutzer zum Nachdenken zwingt. Alles was
// nicht erkannt wird, landet als Freitext-Notiz statt die Eingabe zu blocken.
export function parseLogText(raw) {
  const text = String(raw || "").trim().replace(/[×✕]/g, "x");
  if (!text) return null;

  const NUM = "\\d+(?:[.,]\\d+)?";
  const dot = (v) => v.replace(",", ".");

  // "3x8x60kg" / "3x8x60" — Sätze x Wdh x Gewicht (kg optional)
  let m = text.match(new RegExp(`(\\d+)\\s*x\\s*(\\d+)\\s*x\\s*(${NUM})(?:\\s*kg\\b)?`, "i"));
  if (m) {
    const [, setsN, reps, weight] = m;
    const name = text.slice(0, m.index).trim() || text.replace(m[0], "").trim();
    return {
      name: name || "Übung",
      sets: Array.from({ length: Math.min(Number(setsN) || 1, 30) }, () => ({ reps, weight: dot(weight) })),
      raw: text,
    };
  }

  // "3x8" — Sätze x Wdh; Gewicht optional dahinter: "3x8 @60", "3x8 @ 62,5kg", "3x8 60kg"
  m = text.match(/(\d+)\s*x\s*(\d+)\b/i);
  if (m) {
    const [, setsN, reps] = m;
    const before = text.slice(0, m.index).trim();
    const after = text.slice(m.index + m[0].length);
    const wm = after.match(new RegExp(`@\\s*(${NUM})(?:\\s*kg\\b)?|(${NUM})\\s*kg\\b`, "i"));
    const weight = wm ? dot(wm[1] || wm[2]) : "";
    const rest = wm ? after.replace(wm[0], " ") : after;
    const name = before || rest.replace(/\s{2,}/g, " ").trim();
    return {
      name: name || "Übung",
      sets: Array.from({ length: Math.min(Number(setsN) || 1, 30) }, () => ({ reps, weight })),
      raw: text,
    };
  }

  // Cardio: "Laufen 5km 30min", "10 min Crosstrainer", "5,2 km Rad" — Strecke/Dauer als Text im reps-Feld
  const kmMatch = text.match(new RegExp(`(${NUM})\\s*km\\b`, "i"));
  const minMatch = text.match(new RegExp(`(${NUM})\\s*min\\b`, "i"));
  if (kmMatch || minMatch) {
    let name = text;
    const parts = [];
    if (kmMatch) { parts.push(`${dot(kmMatch[1])}km`); name = name.replace(kmMatch[0], " "); }
    if (minMatch) { parts.push(`${dot(minMatch[1])}min`); name = name.replace(minMatch[0], " "); }
    name = name.replace(/\s{2,}/g, " ").trim();
    return { name: name || "Cardio", sets: [{ reps: parts.join(" "), weight: "" }], raw: text };
  }

  // "60kg 8" / "8 reps 60kg" / "60kg x8" — ein Satz, Gewicht + Wdh in beliebiger Reihenfolge
  const weightMatch = text.match(/(\d+(?:[.,]\d+)?)\s*kg\b/i);
  const withoutWeight = weightMatch ? text.replace(weightMatch[0], " ") : text;
  const repsMatch = withoutWeight.match(/\bx?\s*(\d{1,3})\b/);

  if (weightMatch || repsMatch) {
    let name = withoutWeight;
    if (repsMatch) name = name.replace(repsMatch[0], " ");
    name = name.replace(/\s{2,}/g, " ").trim();
    return {
      name: name || "Übung",
      sets: [{
        reps: repsMatch ? repsMatch[1] : "",
        weight: weightMatch ? weightMatch[1].replace(",", ".") : "",
      }],
      raw: text,
    };
  }

  // Keine Zahlen erkannt — reiner Freitext-Beat
  return { name: text, sets: [{ reps: "", weight: "" }], raw: text, freeform: true };
}

export function slugify(name) {
  return String(name || "manual")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "manual";
}
