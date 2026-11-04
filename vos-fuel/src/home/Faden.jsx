import React from "react";

function clockOf(meal) {
  const raw = meal?.logged_at || meal?.time || meal?.created_at;
  if (!raw) return "";
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
}

// Tagesfaden: die Mahlzeiten von heute als vertikale Spine, noch nicht analysierte Sätze als "wartet".
export default function Faden({ meals, pendingEntries, onRetry }) {
  const ref = React.useRef(null);
  React.useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }); }, [meals.length, pendingEntries.length]);
  if (!meals.length && !pendingEntries.length) {
    return <p className="py-10 text-center text-sm text-slate-500">Noch nichts für heute. Tippe eine Kachel, mach ein Foto oder schreib einfach, was du gegessen hast.</p>;
  }
  return (
    <div ref={ref} className="grid max-h-[40vh] gap-4 overflow-y-auto pr-1">
      {meals.map((m) => (
        <div key={m.id} className="grid grid-cols-[46px_1fr] gap-3">
          <div className="pt-1 text-right text-[11px] tabular-nums text-slate-500">{clockOf(m)}</div>
          <div className="border-l border-white/10 pl-4">
            <p className="text-[17px] leading-snug text-slate-100">{m.description}</p>
            <div className="mt-1 flex flex-wrap gap-3 text-[11px] tabular-nums text-slate-500">
              <span className="text-slate-300">{Math.round(m.kcal || 0)} kcal</span>
              <span>{Math.round(m.protein || 0)} P</span><span>{Math.round(m.carbs || 0)} K</span><span>{Math.round(m.fat || 0)} F</span>
              {m.pot_id && <span className="text-orange-300">Topf</span>}
            </div>
          </div>
        </div>
      ))}
      {pendingEntries.map((e) => (
        <div key={e.id} className="grid grid-cols-[46px_1fr] gap-3">
          <div className="pt-1 text-right text-[11px] text-slate-600">…</div>
          <div className="border-l border-amber-400/40 pl-4">
            <p className="text-[17px] leading-snug text-slate-300">{e.text}</p>
            <button onClick={() => onRetry(e)} className="mt-1 text-[11px] uppercase tracking-[0.12em] text-amber-400">wartet auf Analyse · neu versuchen</button>
          </div>
        </div>
      ))}
    </div>
  );
}
