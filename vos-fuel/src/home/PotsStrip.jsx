import React from "react";
import { CookingPot, Plus } from "lucide-react";
import { usePots, usePotActions } from "@fuel/hooks/usePots.js";
import { remainingFraction, formatPct, isFinished } from "@fuel/lib/potsLogic.js";

// Töpfe auf dem Home-Screen: angebrochene Töpfe mit Rest, "+¼" trägt eine Portion in den Faden ein
// (gleiche Logik wie der Töpfe-Tab: der Anteil landet als Mahlzeit im Tageslog).
export default function PotsStrip({ date, onOpen }) {
  const { data: pots = [] } = usePots();
  const { setDay, error } = usePotActions();
  const open = pots.filter((p) => !isFinished(p) && p.cooked_on <= date).slice(0, 4);
  if (!open.length) return null;
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange-300">Töpfe</span>
        <button onClick={() => onOpen("pots")} className="text-[10px] uppercase tracking-[0.16em] text-slate-500 hover:text-slate-300">alle</button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {open.map((p) => {
          const today = Number(p.days?.[date]?.fraction) || 0;
          return (
            <div key={p.id} className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-2 pl-3 pr-2">
              <CookingPot className="h-4 w-4 text-orange-300" />
              <div className="min-w-0">
                <div className="max-w-[9rem] truncate text-sm font-medium text-slate-100">{p.name}</div>
                <div className="text-[10px] tabular-nums text-slate-500">Rest {formatPct(remainingFraction(p))}{today ? ` · heute ${formatPct(today)}` : ""}</div>
              </div>
              <button onClick={() => setDay(p.id, date, today + 0.25)} aria-label={`Portion ${p.name} eintragen`}
                className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-orange-400 px-2.5 py-1.5 text-xs font-semibold text-slate-950"><Plus className="h-3 w-3" />¼</button>
            </div>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
