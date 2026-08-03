import { useEffect, useMemo, useState } from 'react'
import { CalendarRange, ChevronLeft, ChevronRight, Dumbbell, Flame, BookOpen, CheckSquare } from 'lucide-react'
import { getRecentSessions, getMealsHistory, getJournalHistory, getAllHabitJournalsHistory } from '@db'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAppData } from '@fuel/hooks/useAppData.js'
import { formatMetric, sumMetric } from '@fuel-shared/utils/utils.js'
import { NAV_ITEMS } from './NavigationItems.js'
import { formatRuntimeDate, localISO, shiftISODate, weekDates } from './runtimeDate.js'

const DOMAIN_META = [
  { key: 'fitness', label: 'Fitness', color: '#ff8c42', Icon: Dumbbell },
  { key: 'fuel', label: 'Fuel', color: '#f97316', Icon: Flame },
  { key: 'journal', label: 'Journal', color: '#4a9eff', Icon: BookOpen },
  { key: 'habits', label: 'Habits', color: '#84cc16', Icon: CheckSquare },
]

const fuelHeaderQueryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
})

function buildDayMap(sessions, meals, journal, habits) {
  return {
    fitness: new Set((sessions || []).map((entry) => entry?.date).filter(Boolean)),
    fuel: new Set((meals || []).map((entry) => entry?.date).filter(Boolean)),
    journal: new Set((journal || []).map((entry) => entry?.date).filter(Boolean)),
    habits: new Set((habits || []).map((entry) => entry?.date).filter(Boolean)),
  }
}

function FuelHeaderSummaryInner({ runtimeDate, compact = false }) {
  const { nutrition } = useAppData(runtimeDate)
  const meals = nutrition?.meals || []
  const totalKcal = sumMetric(meals, 'kcal')
  const totalProtein = sumMetric(meals, 'protein')
  const totalCarbs = sumMetric(meals, 'carbs')
  const totalFat = sumMetric(meals, 'fat')

  return (
    <div className={`rounded-2xl border border-white/10 bg-slate-950/45 ${compact ? 'px-3 py-3' : 'px-4 py-4'} text-right`}>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fuel Summe</div>
      <div className={`mt-2 font-black text-orange-300 ${compact ? 'text-xl' : 'text-3xl'}`}>{formatMetric(totalKcal)} kcal</div>
      <div className={`mt-1 flex justify-end gap-3 ${compact ? 'text-xs' : 'text-sm'} text-slate-400`}>
        <span><span className="text-emerald-300">{formatMetric(totalProtein)}</span> P</span>
        <span><span className="text-sky-300">{formatMetric(totalCarbs)}</span> K</span>
        <span><span className="text-violet-300">{formatMetric(totalFat)}</span> F</span>
      </div>
    </div>
  )
}

function FuelHeaderSummary(props) {
  return (
    <QueryClientProvider client={fuelHeaderQueryClient}>
      <FuelHeaderSummaryInner {...props} />
    </QueryClientProvider>
  )
}

export default function ShellHeader({ tab, runtimeDate, setRuntimeDate, compact = false }) {
  const [activity, setActivity] = useState(() => buildDayMap([], [], [], []))

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [sessions, meals, journal, habits] = await Promise.all([
        Promise.resolve(getRecentSessions?.(90)).catch(() => []),
        Promise.resolve(getMealsHistory?.(90)).catch(() => []),
        Promise.resolve(getJournalHistory?.(90)).catch(() => []),
        Promise.resolve(getAllHabitJournalsHistory?.(90)).catch(() => []),
      ])
      if (!cancelled) setActivity(buildDayMap(sessions, meals, journal, habits))
    }

    load()
    return () => { cancelled = true }
  }, [])

  const current = NAV_ITEMS.find((item) => item.id === tab) || NAV_ITEMS[0]
  const dates = useMemo(() => weekDates(runtimeDate), [runtimeDate])
  const todayIso = localISO()
  const isToday = runtimeDate === todayIso
  const containerClass = compact
    ? 'mx-3 mt-3 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-4 shadow-lg backdrop-blur-xl'
    : 'mx-auto mb-6 max-w-[1600px] rounded-[2rem] border border-white/10 bg-white/5 px-5 py-5 shadow-lg backdrop-blur-xl lg:px-7'

  return (
    <header className={containerClass}>
      <div className={`flex ${compact ? 'flex-col gap-4' : 'flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'}`}>
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fit-accent/15 text-fit-accent">
              <current.Icon size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-fit-dim">VitalOS Runtime</div>
              <div className={`${compact ? 'text-base' : 'text-xl lg:text-2xl'} truncate font-black text-fit-ink`}>{current.label}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-fit-dim">
            <CalendarRange size={14} className="shrink-0" />
            <span className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-fit-ink`}>{formatRuntimeDate(runtimeDate, compact)}</span>
          </div>
        </div>

        <div className={`${compact ? 'space-y-3' : 'space-y-3 xl:min-w-[560px]'}`}>
          {tab === 'fuel' ? <FuelHeaderSummary runtimeDate={runtimeDate} compact={compact} /> : null}
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-fit-dim">Shell Date</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRuntimeDate(shiftISODate(runtimeDate, -1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-fit-bg2 text-fit-dim transition hover:text-fit-accent"
                title="Vorheriger Tag"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setRuntimeDate(todayIso)}
                disabled={isToday}
                className="h-9 rounded-xl border border-white/10 bg-fit-bg2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-fit-ink transition hover:text-fit-accent disabled:opacity-40"
              >
                Heute
              </button>
              <button
                onClick={() => setRuntimeDate(shiftISODate(runtimeDate, 1))}
                disabled={isToday}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-fit-bg2 text-fit-dim transition hover:text-fit-accent disabled:opacity-40"
                title="Nächster Tag"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 rounded-2xl border border-white/10 bg-slate-950/40 p-2.5">
            {dates.map((date) => {
              const selected = date === runtimeDate
              const today = date === todayIso
              const dayLabel = new Date(`${date}T12:00:00`).toLocaleDateString('de-DE', { weekday: 'short' })
              const dayNum = date.slice(8)

              return (
                <button
                  key={date}
                  onClick={() => setRuntimeDate(date)}
                  className={`rounded-2xl px-2 py-2 text-left transition ${selected ? 'bg-fit-accent/15 ring-1 ring-fit-accent/30' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-[0.18em] ${selected ? 'text-fit-accent' : today ? 'text-fit-ink' : 'text-fit-dim'}`}>{dayLabel}</span>
                    {today && !selected && <span className="h-2 w-2 rounded-full bg-fit-accent" />}
                  </div>
                  <div className={`mt-1 text-sm font-black ${selected ? 'text-fit-ink' : 'text-fit-dim'}`}>{dayNum}</div>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {DOMAIN_META.map(({ key, label, color, Icon }) => {
                      const active = activity[key]?.has(date)
                      return (
                        <div
                          key={key}
                          title={label}
                          className="flex h-6 items-center justify-center rounded-lg border border-white/5"
                          style={{ backgroundColor: active ? `${color}22` : 'rgba(255,255,255,0.03)', color: active ? color : '#64748b' }}
                        >
                          <Icon size={11} />
                        </div>
                      )
                    })}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
