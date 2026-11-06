import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, Copy, Minus, Plus,
  Trash2, UtensilsCrossed,
} from "lucide-react";
import { fetchJson, postJson } from "@api";
import { getNutritionPlan, saveNutritionPlan } from "../lib/db.firestore.js";
import { useSettings } from "../store.js";
import "./MealPlanPrint.css";

const MEAL_TYPES = [
  { value: "breakfast", label: "Frühstück" },
  { value: "lunch", label: "Mittagessen" },
  { value: "dinner", label: "Abendessen" },
  { value: "snack", label: "Snack" },
];

const inputClass = "w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100";

function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function weekStartFor(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return toISODate(date);
}

function addDays(dateValue, amount) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return toISODate(date);
}

function todayISO() {
  return toISODate(new Date());
}

function displayDate(dateValue, options = { weekday: "long", day: "numeric", month: "long" }) {
  return new Intl.DateTimeFormat("de-AT", options).format(new Date(`${dateValue}T12:00:00`));
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function scaled(entry) {
  const factor = Number(entry.factor) || 1;
  return {
    kcal: Math.round((Number(entry.kcal) || 0) * factor),
    protein: Math.round((Number(entry.protein) || 0) * factor * 10) / 10,
    carbs: Math.round((Number(entry.carbs) || 0) * factor * 10) / 10,
    fat: Math.round((Number(entry.fat) || 0) * factor * 10) / 10,
    grams: entry.grams ? Math.round(Number(entry.grams) * factor) : null,
  };
}

function dayTotals(entries) {
  return entries.reduce((sum, entry) => {
    const values = scaled(entry);
    sum.kcal += values.kcal;
    sum.protein += values.protein;
    sum.carbs += values.carbs;
    sum.fat += values.fat;
    return sum;
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

function formatNumber(value) {
  return new Intl.NumberFormat("de-AT", { maximumFractionDigits: 1 }).format(value || 0);
}

function cloneForWeek(plan, fromWeekStart, toWeekStart) {
  const days = {};
  for (let offset = 0; offset < 7; offset++) {
    const sourceDate = addDays(fromWeekStart, offset);
    const targetDate = addDays(toWeekStart, offset);
    days[targetDate] = (plan?.days?.[sourceDate] || []).map((meal) => ({ ...meal, id: makeId() }));
  }
  return days;
}

export default function MealPlanView({ setActiveTab }) {
  const queryClient = useQueryClient();
  const { kcal_goal: kcalGoal = 2000 } = useSettings();
  const [weekStart, setWeekStart] = useState(() => weekStartFor(todayISO()));
  const [selectedFoods, setSelectedFoods] = useState({});
  const weekKey = ["nutrition-plan", weekStart];
  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const previousWeekStart = addDays(weekStart, -7);

  const planQuery = useQuery({
    queryKey: weekKey,
    queryFn: () => getNutritionPlan(weekStart),
    staleTime: 30_000,
  });
  const catalogQuery = useQuery({
    queryKey: ["nutrition-catalog"],
    queryFn: () => fetchJson("/nutrition/catalog"),
    staleTime: 60_000,
  });
  const plan = planQuery.data || { week_start: weekStart, days: {} };
  const catalog = (catalogQuery.data?.items || []).filter((item) => item.source_kind !== "supplement");

  const savePlan = useMutation({
    mutationFn: (nextPlan) => saveNutritionPlan(weekStart, nextPlan),
    onMutate: async (nextPlan) => {
      await queryClient.cancelQueries({ queryKey: weekKey });
      const previous = queryClient.getQueryData(weekKey);
      queryClient.setQueryData(weekKey, nextPlan);
      return { previous };
    },
    onError: (_error, _nextPlan, context) => {
      if (context?.previous) queryClient.setQueryData(weekKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: weekKey }),
  });

  const copyWeek = useMutation({
    mutationFn: async () => {
      const previousPlan = await getNutritionPlan(previousWeekStart);
      const previousMeals = Object.values(previousPlan.days || {}).reduce((sum, meals) => sum + meals.length, 0);
      if (previousMeals === 0) throw new Error("In der Vorwoche ist noch kein Essensplan gespeichert.");
      return cloneForWeek(previousPlan, previousWeekStart, weekStart);
    },
    onSuccess: (days) => savePlan.mutate({ ...plan, week_start: weekStart, days }),
  });

  const logMeal = useMutation({
    mutationFn: ({ date, meal }) => postJson("/nutrition/log", { date, meal }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["nutrition", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["week-logs"] });
      queryClient.invalidateQueries({ queryKey: ["nutrition-history"] });
      queryClient.invalidateQueries({ queryKey: ["macro-trend"] });
    },
  });
  const planBusy = savePlan.isPending || copyWeek.isPending;

  function updateDay(date, update) {
    const currentEntries = plan.days?.[date] || [];
    const nextEntries = update(currentEntries);
    const nextDays = { ...(plan.days || {}), [date]: nextEntries };
    savePlan.mutate({ ...plan, week_start: weekStart, days: nextDays });
  }

  function addCatalogMeal(date, type) {
    const key = `${date}:${type}`;
    const item = catalog.find((candidate) => candidate.id === selectedFoods[key]);
    if (!item) return;
    updateDay(date, (entries) => [...entries, {
      id: makeId(),
      catalog_id: item.id || null,
      name: item.name || item.description || "Gericht",
      type,
      notes: item.notes || "",
      kcal: Number(item.kcal) || 0,
      protein: Number(item.protein) || 0,
      carbs: Number(item.carbs) || 0,
      fat: Number(item.fat) || 0,
      grams: Number(item.yield_g) || null,
      factor: 1,
    }]);
    setSelectedFoods((current) => ({ ...current, [key]: "" }));
  }

  const weekLabel = `${displayDate(weekStart, { day: "numeric", month: "short" })} – ${displayDate(addDays(weekStart, 6), { day: "numeric", month: "short", year: "numeric" })}`;
  const hasMeals = dates.some((date) => (plan.days?.[date] || []).length > 0);
  const currentWeekStart = weekStartFor(todayISO());

  return (
    <div className="meal-plan-print-root mx-auto max-w-6xl space-y-6">
      <header className="rounded-3xl border border-orange-400/20 bg-gradient-to-br from-orange-400/10 via-white/[0.03] to-transparent p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              <CalendarDays className="h-4 w-4" /> Fuel · Wochenplanung
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-50">Essensplan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              Stelle deine Woche aus eigenen Gerichten und Rezepten zusammen. Mengen und Makros bleiben pro Eintrag anpassbar; geplante Mahlzeiten kannst du direkt ins Tagesprotokoll übernehmen.
            </p>
          </div>
          <div className="print-hidden flex gap-2">
            <button type="button" onClick={() => window.print()} className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white">Drucken / PDF</button>
            <button type="button" onClick={() => setWeekStart(currentWeekStart)} className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white">Heute</button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="print-hidden flex items-center gap-2">
            <button type="button" aria-label="Vorherige Woche" disabled={planBusy} onClick={() => setWeekStart(previousWeekStart)} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:bg-white/10 disabled:opacity-40">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-40 text-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Wochenplan</div>
              <div className="mt-0.5 font-semibold text-slate-100">{weekLabel}</div>
            </div>
            <button type="button" aria-label="Nächste Woche" disabled={planBusy} onClick={() => setWeekStart(addDays(weekStart, 7))} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:bg-white/10 disabled:opacity-40">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              if (hasMeals && !window.confirm("Die Vorwoche ersetzt alle bereits geplanten Mahlzeiten dieser Woche. Fortfahren?")) return;
              copyWeek.mutate();
            }}
            disabled={savePlan.isPending || copyWeek.isPending}
            className="print-hidden inline-flex items-center gap-2 rounded-xl border border-orange-300/20 bg-orange-300/10 px-3 py-2.5 text-xs font-bold text-orange-100 hover:bg-orange-300/15 disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" /> {copyWeek.isPending ? "Lädt…" : "Vorwoche übernehmen"}
          </button>
        </div>
      </header>

      {planQuery.isLoading && <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-400">Wochenplan wird geladen…</div>}
      {planQuery.isError && <div role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-200">Der Wochenplan konnte nicht geladen werden: {planQuery.error.message}</div>}
      {catalogQuery.isError && <div role="alert" className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">Der Gerichte-Katalog konnte nicht geladen werden. Bitte lade die Ansicht neu.</div>}
      {savePlan.isError && <div role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-200">Änderung konnte nicht gespeichert werden: {savePlan.error.message}</div>}
      {copyWeek.isError && <div role="alert" className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">{copyWeek.error.message}</div>}
      {logMeal.isError && <div role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-200">Mahlzeit konnte nicht ins Protokoll übernommen werden: {logMeal.error.message}</div>}

      {!planQuery.isLoading && !planQuery.isError && (
        <>
          {!hasMeals && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
                <div>
                  <p className="font-semibold text-slate-200">Dein Wochenplan ist noch leer.</p>
                  <p className="mt-1">Füge Gerichte aus deinem Katalog hinzu. Rezepte kannst du im Rezept-Builder anlegen.</p>
                  {catalog.length === 0 && setActiveTab && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setActiveTab("catalog")} className="rounded-lg border border-orange-300/20 bg-orange-300/10 px-3 py-2 text-xs font-bold text-orange-100 hover:bg-orange-300/15">Zum Katalog</button>
                      <button type="button" onClick={() => setActiveTab("recipes")} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10">Rezept-Builder</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            {dates.map((date) => {
              const entries = plan.days?.[date] || [];
              const totals = dayTotals(entries);
              const progress = Math.min(100, Math.round((totals.kcal / Math.max(1, Number(kcalGoal))) * 100));
              const isToday = date === todayISO();
              return (
                <section key={date} className={`plan-day-card rounded-3xl border p-4 sm:p-5 ${isToday ? "border-orange-300/30 bg-orange-300/[0.045]" : "border-white/10 bg-slate-950/45"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-100">{displayDate(date)}</h2>
                        {isToday && <span className="rounded-full bg-orange-300/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-orange-200">Heute</span>}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{entries.length} {entries.length === 1 ? "Mahlzeit geplant" : "Mahlzeiten geplant"}</p>
                    </div>
                    <div className="min-w-40 text-right">
                      <div className="text-lg font-black tabular-nums text-orange-200">{formatNumber(totals.kcal)} <span className="text-xs font-semibold text-slate-500">kcal</span></div>
                      <div className="mt-0.5 text-[10px] text-slate-500">Ziel {formatNumber(kcalGoal)} kcal</div>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5" aria-label={`${progress}% des Kalorienziels geplant`}>
                    <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-200 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-400">
                    <span>P {formatNumber(totals.protein)}g</span><span>C {formatNumber(totals.carbs)}g</span><span>F {formatNumber(totals.fat)}g</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {MEAL_TYPES.map(({ value: type, label }) => {
                      const typeEntries = entries.filter((entry) => entry.type === type);
                      const selectKey = `${date}:${type}`;
                      return (
                        <div key={type} className="rounded-2xl border border-white/5 bg-black/15 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</h3>
                            {typeEntries.length > 0 && <span className="text-[10px] tabular-nums text-slate-600">{formatNumber(dayTotals(typeEntries).kcal)} kcal</span>}
                          </div>
                          {typeEntries.length > 0 && (
                            <ul className="mb-3 space-y-2">
                              {typeEntries.map((entry) => {
                                const values = scaled(entry);
                                return (
                                  <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2.5">
                                    <div className="min-w-0 flex-1">
                                      <div className="truncate text-sm font-semibold text-slate-100">{entry.name}</div>
                                      <div className="mt-1 text-[10px] text-slate-500">{formatNumber(values.kcal)} kcal · P {formatNumber(values.protein)}g · C {formatNumber(values.carbs)}g · F {formatNumber(values.fat)}g</div>
                                    </div>
                                    <div className="print-hidden flex items-center gap-1.5">
                                      <button type="button" aria-label={`${entry.name}: Portion verkleinern`} disabled={planBusy || (Number(entry.factor) || 1) <= 0.25} onClick={() => updateDay(date, (current) => current.map((meal) => meal.id === entry.id ? { ...meal, factor: Math.max(0.25, Math.round(((Number(meal.factor) || 1) - 0.25) * 100) / 100) } : meal))} className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-white disabled:opacity-30"><Minus className="h-3 w-3" /></button>
                                      <span className="w-10 text-center text-[10px] tabular-nums text-slate-300">{formatNumber(entry.factor || 1)}×</span>
                                      <button type="button" aria-label={`${entry.name}: Portion vergrößern`} disabled={planBusy} onClick={() => updateDay(date, (current) => current.map((meal) => meal.id === entry.id ? { ...meal, factor: Math.round(((Number(meal.factor) || 1) + 0.25) * 100) / 100 } : meal))} className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-white disabled:opacity-30"><Plus className="h-3 w-3" /></button>
                                      <button type="button" title="Ins Tagesprotokoll übernehmen" disabled={logMeal.isPending} onClick={() => logMeal.mutate({ date, meal: { type, description: entry.name, notes: entry.notes || "Aus dem Essensplan übernommen", catalog_id: entry.catalog_id || null, kcal: values.kcal, protein: values.protein, carbs: values.carbs, fat: values.fat, grams: values.grams } })} className="ml-1 inline-flex items-center gap-1 rounded-lg bg-emerald-300/10 px-2 py-1.5 text-[10px] font-bold text-emerald-200 hover:bg-emerald-300/20 disabled:opacity-50"><Check className="h-3 w-3" /><span className="hidden sm:inline">Loggen</span></button>
                                      <button type="button" aria-label={`${entry.name} aus dem Plan entfernen`} disabled={planBusy} onClick={() => updateDay(date, (current) => current.filter((meal) => meal.id !== entry.id))} className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-30"><Trash2 className="h-3 w-3" /></button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                          {catalog.length > 0 ? (
                            <div className="print-hidden flex gap-2">
                              <select aria-label={`${label}: Gericht auswählen`} className={`${inputClass} min-w-0 flex-1`} value={selectedFoods[selectKey] || ""} onChange={(event) => setSelectedFoods((current) => ({ ...current, [selectKey]: event.target.value }))}>
                                <option value="">Gericht aus Katalog wählen…</option>
                                {catalog.map((item) => <option key={item.id} value={item.id}>{item.name} · {Math.round(Number(item.kcal) || 0)} kcal</option>)}
                              </select>
                              <button type="button" aria-label={`${label}: Gericht hinzufügen`} disabled={!selectedFoods[selectKey] || planBusy} onClick={() => addCatalogMeal(date, type)} className="shrink-0 rounded-xl bg-orange-300 px-3 text-slate-950 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"><Plus className="h-4 w-4" /></button>
                            </div>
                          ) : (
                            <p className="print-hidden text-xs text-slate-600">Erstelle zuerst Gerichte im Katalog oder Rezepte im Rezept-Builder.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}

      <footer className="print-hidden flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-slate-600">
        <span>{savePlan.isPending ? "Speichert…" : savePlan.isSuccess ? "Änderungen gespeichert" : "Persönlicher Wochenplan · nur für dein Konto"}</span>
        {logMeal.isPending && <span>Mahlzeit wird protokolliert…</span>}
      </footer>
    </div>
  );
}
