// Sehr bewusst simpel gehalten: lieber ein unperfekter Treffer sofort als
// ein "korrektes" Parsing, das den Nutzer zum Nachdenken zwingt. Alles was
// nicht erkannt wird, landet als Freitext-Notiz statt die Eingabe zu blocken.
export function parseLogText(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;

  // "3x8x60kg" / "3x8x60" — Sätze x Wdh x Gewicht
  let m = text.match(/(\d+)\s*x\s*(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*kg?\b/i);
  if (m) {
    const [, setsN, reps, weight] = m;
    const name = text.slice(0, m.index).trim() || text.replace(m[0], "").trim();
    return {
      name: name || "Übung",
      sets: Array.from({ length: Number(setsN) || 1 }, () => ({
        reps, weight: weight.replace(",", "."),
      })),
      raw: text,
    };
  }

  // "3x8" — Sätze x Wdh, kein Gewicht
  m = text.match(/(\d+)\s*x\s*(\d+)\b/i);
  if (m) {
    const [, setsN, reps] = m;
    const name = text.slice(0, m.index).trim();
    return {
      name: name || "Übung",
      sets: Array.from({ length: Number(setsN) || 1 }, () => ({ reps, weight: "" })),
      raw: text,
    };
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

  // Keine Zahlen erkannt — als reiner Freitext-Beat loggen (z.B. "10min Crosstrainer"
  // fällt oft hier rein, falls "min" nicht separat behandelt wird)
  const minMatch = text.match(/(\d+)\s*min/i);
  if (minMatch) {
    const name = text.replace(minMatch[0], "").trim() || "Cardio";
    return { name, sets: [{ reps: `${minMatch[1]}min`, weight: "" }], raw: text };
  }

  return { name: text, sets: [{ reps: "", weight: "" }], raw: text, freeform: true };
}

export function slugify(name) {
  return String(name || "manual")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "manual";
}
