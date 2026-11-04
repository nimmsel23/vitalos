import React from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { SLOT_LABEL, slotOf } from "@fuel/views/Frontdoor/useFrontdoorLog.js";

const PORTIONS = [{ label: "½", factor: 0.5 }, { label: "1×", factor: 1 }, { label: "1½", factor: 1.5 }, { label: "2×", factor: 2 }];

// Tap Board als Kachelreihe: ein Tap loggt, langes Drücken öffnet die Portionswahl.
export default function TapRow({ fd }) {
  const { suggestions, logMeal } = fd;
  const [sheet, setSheet] = React.useState(null);
  const [factor, setFactor] = React.useState(1);
  const holdRef = React.useRef(null);
  const heldRef = React.useRef(false);
  const tiles = suggestions.slice(0, 10);
  if (!tiles.length) return null;

  const startHold = (item) => {
    heldRef.current = false;
    holdRef.current = setTimeout(() => { heldRef.current = true; setFactor(1); setSheet(item); }, 320);
  };
  const endHold = (item) => {
    clearTimeout(holdRef.current);
    if (!heldRef.current && !sheet) logMeal.mutate({ ...item });
    heldRef.current = false;
  };
  const scaled = (item, f) => ({
    ...item,
    kcal: (item.kcal || 0) * f, protein: (item.protein || 0) * f, carbs: (item.carbs || 0) * f, fat: (item.fat || 0) * f,
    description: f === 1 ? item.description : `${item.description} (${PORTIONS.find((p) => p.factor === f)?.label})`,
  });

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-orange-300">{SLOT_LABEL[slotOf()]}</span>
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] text-slate-600">Tap loggt · lange drücken für Portion</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tiles.map((item) => (
          <motion.button key={item.key} whileTap={{ scale: 0.96 }}
            onPointerDown={() => startHold(item)} onPointerUp={() => endHold(item)}
            onPointerLeave={() => clearTimeout(holdRef.current)} onContextMenu={(e) => e.preventDefault()}
            className={twMerge("flex w-36 shrink-0 flex-col justify-between rounded-2xl border p-3 text-left transition",
              item.slotCount > 0 ? "border-orange-400/40 bg-orange-400/10" : "border-white/10 bg-white/5")}>
            <span className="line-clamp-2 text-sm font-semibold leading-tight text-slate-100">{item.description}</span>
            <span className="mt-2 flex gap-2 font-mono text-[10px] tabular-nums text-slate-500">
              <span className="text-slate-200">{Math.round(item.kcal)} kcal</span><span>{Math.round(item.protein)} P</span>
            </span>
          </motion.button>
        ))}
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 sm:items-center sm:p-6" onClick={() => setSheet(null)}>
          <div className="w-full max-w-md rounded-t-3xl border border-white/10 bg-slate-900 p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-100">{sheet.description}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{sheet.catalog_id ? "aus Katalog" : "aus deinem Verlauf"}</p>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {PORTIONS.map((p) => (
                <button key={p.label} onClick={() => setFactor(p.factor)}
                  className={twMerge("rounded-xl border py-3 text-sm tabular-nums", factor === p.factor ? "border-orange-400 bg-orange-400 font-semibold text-slate-950" : "border-white/10 bg-white/5 text-slate-300")}>{p.label}</button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
              {[["kcal", sheet.kcal], ["Prot", sheet.protein], ["KH", sheet.carbs], ["Fett", sheet.fat]].map(([k, v]) => (
                <div key={k} className="bg-slate-950 p-3 text-center"><div className="text-[9px] uppercase tracking-[0.14em] text-slate-500">{k}</div>
                  <div className="mt-1 text-base font-semibold tabular-nums">{Math.round((v || 0) * factor)}</div></div>
              ))}
            </div>
            <button onClick={() => { logMeal.mutate(scaled(sheet, factor)); setSheet(null); }} className="mt-5 w-full rounded-2xl bg-orange-400 py-4 font-semibold text-slate-950">Loggen</button>
            <button onClick={() => setSheet(null)} className="mt-2 w-full py-2 text-xs uppercase tracking-[0.16em] text-slate-500">Abbrechen</button>
          </div>
        </div>
      )}
    </div>
  );
}
