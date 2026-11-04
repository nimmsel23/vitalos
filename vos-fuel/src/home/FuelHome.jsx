import React from "react";
import { Check, LayoutGrid, Undo2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useFrontdoorLog } from "@fuel/views/Frontdoor/useFrontdoorLog.js";
import { useAiMealLogger } from "@fuel/hooks/useAiMealLogger.js";
import NutritionDataNotice from "@fuel/components/NutritionDataNotice.jsx";
import DayBar from "./DayBar.jsx";
import PotsStrip from "./PotsStrip.jsx";
import TapRow from "./TapRow.jsx";
import Faden from "./Faden.jsx";
import Composer from "./Composer.jsx";
import ShutterSheet from "./ShutterSheet.jsx";

const greeting = (h = new Date().getHours()) => (h < 10 ? "Morgen" : h < 14 ? "Mahlzeit" : h < 18 ? "Nachmittag" : "Abend");

// Home von vos-fuel: die drei Schnelleinstiege (Tap Board, Shutter, Tagesfaden) als EIN Screen, dazu die Töpfe.
//   oben   Tagesstand, Töpfe (+¼ trägt eine Portion ein)
//   Mitte  Faden von heute
//   unten  Kachelreihe (Tap), Eingabezeile mit Kamera (Shutter-Overlay), Text und Diktat
export default function FuelHome({ userName, onOpen }) {
  const fd = useFrontdoorLog();
  const ai = useAiMealLogger(fd.date);
  const [shutter, setShutter] = React.useState(false);
  const closeShutter = React.useCallback(() => setShutter(false), []);

  React.useEffect(() => {
    if (!fd.lastLogged) return undefined;
    const t = setTimeout(() => fd.clearLastLogged(), 6000);
    return () => clearTimeout(t);
  }, [fd.lastLogged, fd.clearLastLogged]);

  const dateLabel = new Date(fd.date).toLocaleDateString("de-AT", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{greeting()}{userName ? `, ${userName}` : ""}.</h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">{dateLabel} · Fuel</p>
        </div>
        <button onClick={() => onOpen("menu")} aria-label="Menü" className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"><LayoutGrid className="h-5 w-5" /></button>
      </header>

      <NutritionDataNotice nutrition={fd.nutrition} error={fd.nutritionError} onRetry={fd.reloadNutrition} />
      <DayBar totals={fd.totals} kcalGoal={fd.kcalGoal} proteinGoal={fd.proteinGoal} />
      <PotsStrip date={fd.date} onOpen={onOpen} />

      <div className="flex-1"><Faden meals={fd.meals} pendingEntries={ai.pendingEntries} onRetry={(e) => ai.reanalyzePending.mutate(e)} /></div>

      <TapRow fd={fd} />
      <Composer ai={ai} onCamera={() => setShutter(true)} />

      <AnimatePresence>
        {fd.lastLogged && !shutter && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-emerald-400/40 bg-slate-950/95 p-4 shadow-xl backdrop-blur">
            <Check className="h-5 w-5 shrink-0 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{fd.lastLogged.description}</div>
              <div className="text-[11px] tabular-nums text-slate-400">{Math.round(fd.lastLogged.kcal)} kcal · {Math.round(fd.lastLogged.protein)} P · {Math.round(fd.lastLogged.carbs)} K · {Math.round(fd.lastLogged.fat)} F</div>
            </div>
            <button onClick={() => fd.undoLast.mutate()} className="flex shrink-0 items-center gap-1.5 rounded-full border border-orange-400/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-orange-300"><Undo2 className="h-3.5 w-3.5" /> Zurück</button>
          </motion.div>
        )}
      </AnimatePresence>

      {shutter && <ShutterSheet fd={fd} onClose={closeShutter} onOpenApp={onOpen} />}
    </div>
  );
}
