import React from "react";
import { twMerge } from "tailwind-merge";

// Tagesstand: kcal-Ring (Tap Board) + Makro-Balken (Tagesfaden) in einer Zeile.
export default function DayBar({ totals, kcalGoal, proteinGoal }) {
  const pct = Math.min(100, Math.round((totals.kcal / (kcalGoal || 2000)) * 100));
  const r = 26, circ = 2 * Math.PI * r;
  const bars = [
    { k: "Prot", v: totals.protein, pct: Math.min(100, Math.round((totals.protein / (proteinGoal || 150)) * 100)), low: totals.protein / (proteinGoal || 150) < 0.6 },
    { k: "KH", v: totals.carbs, pct: Math.min(100, Math.round((totals.carbs / 250) * 100)) },
    { k: "Fett", v: totals.fat, pct: Math.min(100, Math.round((totals.fat / 80) * 100)) },
  ];
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="relative h-[62px] w-[62px] shrink-0">
        <svg width="62" height="62" viewBox="0 0 62 62" className="-rotate-90">
          <circle cx="31" cy="31" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
          <circle cx="31" cy="31" r={r} fill="none" stroke="#fb923c" strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - (circ * pct) / 100} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[13px] font-semibold tabular-nums">{Math.round(totals.kcal)}</span>
          <span className="font-mono text-[8px] tracking-[0.1em] text-slate-500">/ {kcalGoal}</span>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-3">
        {bars.map((m) => (
          <div key={m.k}>
            <div className="flex justify-between text-[9px] uppercase tracking-[0.14em] text-slate-500"><span>{m.k}</span><span className="tabular-nums">{Math.round(m.v)} g</span></div>
            <div className="mt-1 h-1 overflow-hidden rounded bg-white/10"><div className={twMerge("h-full rounded", m.low ? "bg-amber-400" : "bg-emerald-400")} style={{ width: `${m.pct}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
