import { useEffect, useMemo, useState } from 'react'
import { CalendarRange, ChevronLeft, ChevronRight, Dumbbell, Flame, BookOpen, CheckSquare, Beef, Wheat, Droplet } from 'lucide-react'
import { getRecentSessions, getMealsHistory, getJournalHistory, getAllHabitJournalsHistory } from '@db'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAppData } from '@fuel/hooks/useAppData.js'
import { useSettings } from '@fuel/store.js'
import { computeMacroGoals } from '@fuel/views/Settings/GoalsSection.jsx'
import { formatMetric, sumMetric } from '@fuel-shared/utils/utils.js'
import { NAV_ITEMS, SUB_NAV } from './NavigationItems.js'
import { formatRuntimeDate, localISO, shiftISODate, weekDates } from './runtimeDate.js'

const DOMAIN_META = [
  { key: 'fitness', label: 'Fitness', color: '#60a5fa', Icon: Dumbbell },
  { key: 'fuel', label: 'Fuel', color: '#fb923c', Icon: Flame },
  { key: 'journal', label: 'Journal', color: '#a78bfa', Icon: BookOpen },
  { key: 'habits', label: 'Habits', color: '#a3e635', Icon: CheckSquare },
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

const MACRO_META = [
  { key: 'protein', label: 'Protein', Icon: Beef, color: '#34d399', track: 'rgba(52,211,153,0.14)' },
  { key: 'carbs', label: 'Carbs', Icon: Wheat, color: '#38bdf8', track: 'rgba(56,189,248,0.14)' },
  { key: 'fat', label: 'Fett', Icon: Droplet, color: '#a78bfa', track: 'rgba(167,139,250,0.14)' },
]

function MacroPip({ label, Icon, color, track, value, goal, compact }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
        <Icon size={11} style={{ color }} />
        <span className="truncate">{label}</span>
      </div>
      <div className={`mt-1 font-black text-slate-100 ${compact ? 'text-sm' : 'text-base'}`}>
        {formatMetric(value)}<span className="text-slate-500">g</span>
        {goal > 0 && <span className="ml-1 text-[10px] font-semibold text-slate-500">/{goal}g</span>}
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: track }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  )
}

function FuelHeaderSummaryInner({ runtimeDate, compact = false }) {
  const { nutrition } = useAppData(runtimeDate)
  const { kcal_goal, protein_goal, carb_ratio } = useSettings()
  const { carbs_goal, fat_goal } = computeMacroGoals({ kcal_goal, protein_goal, carb_ratio })
  const meals = nutrition?.meals || []
  const totalKcal = sumMetric(meals, 'kcal')
  const totalProtein = sumMetric(meals, 'protein')
  const totalCarbs = sumMetric(meals, 'carbs')
  const totalFat = sumMetric(meals, 'fat')
  const kcalPct = kcal_goal > 0 ? Math.min(100, Math.round((totalKcal / kcal_goal) * 100)) : 0
  const kcalRest = Math.max(0, (kcal_goal || 0) - totalKcal)

  if (compact) {
    return (
      <div className="vos-surface rounded-[20px] px-4 py-3.5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12px] font-medium text-fit-dim">Kalorien heute</div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-[26px] font-semibold leading-none tracking-tight text-fit-ink tabular-nums">{formatMetric(totalKcal)}</span>
              <span className="text-[13px] text-fit-dim">{kcal_goal > 0 ? `/ ${kcal_goal} kcal` : 'kcal'}</span>
            </div>
          </div>
          {kcal_goal > 0 ? (
            <div className="shrink-0 text-right">
              <div className="text-[15px] font-semibold text-fit-ink tabular-nums">{formatMetric(kcalRest)}</div>
              <div className="text-[11px] text-fit-dim">übrig</div>
            </div>
          ) : null}
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full vos-fill">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${kcalPct}%`, background: '#fb923c' }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { ...MACRO_META[0], value: totalProtein, goal: protein_goal },
            { ...MACRO_META[1], value: totalCarbs, goal: carbs_goal },
            { ...MACRO_META[2], value: totalFat, goal: fat_goal },
          ].map(({ key, label, color, value, goal }) => {
            const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0
            return (
              <div key={key} className="min-w-0">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="truncate text-[11px] text-fit-dim">{label}</span>
                  <span className="text-[12px] font-semibold text-fit-ink tabular-nums">{formatMetric(value)}<span className="font-normal text-fit-dim">{goal > 0 ? `/${goal}` : ''}g</span></span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full vos-fill">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-orange-400/15 ${compact ? 'px-3.5 py-3' : 'px-5 py-4'}`}
      style={{ background: 'radial-gradient(120% 140% at 100% 0%, rgba(249,115,22,0.16), transparent 55%), rgba(2,6,14,0.55)' }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[9px] font-black uppercase tracking-[0.24em] text-orange-300/70">Fuel Summe</div>
          <div className={`font-black leading-none text-orange-300 ${compact ? 'text-2xl' : 'text-3xl'}`}>
            {formatMetric(totalKcal)}<span className="ml-1 text-sm font-bold text-orange-300/50">kcal</span>
          </div>
        </div>
        <div className="shrink-0 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {kcal_goal > 0 ? <>Ziel {kcal_goal} · <span className="text-slate-300">{formatMetric(kcalRest)} Rest</span></> : 'Kein Ziel gesetzt'}
        </div>
      </div>

      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${kcalPct}%`, background: 'linear-gradient(90deg, #f97316, #fbbf24)', boxShadow: '0 0 10px rgba(249,115,22,0.6)' }}
        />
      </div>

      <div className="mt-3.5 flex gap-4">
        <MacroPip {...MACRO_META[0]} value={totalProtein} goal={protein_goal} compact={compact} />
        <MacroPip {...MACRO_META[1]} value={totalCarbs} goal={carbs_goal} compact={compact} />
        <MacroPip {...MACRO_META[2]} value={totalFat} goal={fat_goal} compact={compact} />
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

function findSubTabLabel(tab, subTab) {
  if (!subTab) return null
  const navItems = SUB_NAV[tab] || []
  for (const item of navItems) {
    if (item.id === subTab) return item.label
    const child = item.sub?.find((entry) => entry.id === subTab)
    if (child) return child.label
  }
  if (tab === 'home' && subTab === 'fitness') return 'Fitness Gate'
  if (tab === 'relax' && subTab === 'dash') return 'Dashboard'
  return null
}

function useActivityMap() {
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

  return activity
}

// Mobile-Header: schlanke Sticky-Leiste (Titel + Datum) + scrollende
// Wochenleiste und Sub-Tabs. Konsumiert das obere Safe-Area-Inset selbst.
function CompactHeader({ tab, subTab, runtimeDate, setRuntimeDate, subNav, onSubTab }) {
  const activity = useActivityMap()
  const current = NAV_ITEMS.find((item) => item.id === tab) || NAV_ITEMS[0]
  const title = tab === 'home' ? 'Journal' : current.label
  const subLabel = findSubTabLabel(tab, subTab)
  const dates = useMemo(() => weekDates(runtimeDate), [runtimeDate])
  const todayIso = localISO()
  const isToday = runtimeDate === todayIso
  const showSubNav = Array.isArray(subNav) && subNav.length > 0
  // Setup/Coach/6Pack haben keinen Tagesbezug — dort weder Datum noch Wochenleiste
  const dated = !['settings', 'coach', 'sixpack'].includes(tab)
  const activeParent = showSubNav
    ? subNav.find((item) => item.id === subTab || item.sub?.some((child) => child.id === subTab))?.id
    : null

  return (
    <>
      <header
        className="vos-bar vos-hairline-b sticky top-0 z-40"
        style={{ paddingTop: 'var(--safe-top)' }}
      >
        <div className="flex h-[52px] items-center gap-3 px-4">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[20px] font-semibold leading-tight tracking-tight text-fit-ink">{title}</div>
            {subLabel ? <div className="truncate text-[12px] leading-tight text-fit-dim">{subLabel}</div> : null}
          </div>

          {dated && !isToday ? (
            <button
              onClick={() => setRuntimeDate(todayIso)}
              className="vos-press h-8 shrink-0 rounded-full px-3 text-[13px] font-medium text-fit-accent vos-fill"
            >
              Heute
            </button>
          ) : null}

          {dated ? <div className="flex h-8 shrink-0 items-center rounded-full vos-fill">
            <button
              onClick={() => setRuntimeDate(shiftISODate(runtimeDate, -1))}
              aria-label="Vorheriger Tag"
              className="vos-press flex h-8 w-8 items-center justify-center rounded-full text-fit-dim"
            >
              <ChevronLeft size={17} />
            </button>
            <label className="relative cursor-pointer px-0.5 text-[13px] font-medium text-fit-ink tabular-nums">
              {formatRuntimeDate(runtimeDate, true)}
              <input
                type="date"
                value={runtimeDate}
                max={todayIso}
                onChange={(event) => event.target.value && setRuntimeDate(event.target.value)}
                aria-label="Datum wählen"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
            <button
              onClick={() => setRuntimeDate(shiftISODate(runtimeDate, 1))}
              disabled={isToday}
              aria-label="Nächster Tag"
              className="vos-press flex h-8 w-8 items-center justify-center rounded-full text-fit-dim disabled:opacity-30"
            >
              <ChevronRight size={17} />
            </button>
          </div> : null}
        </div>
      </header>

      {dated || showSubNav ? <div className="space-y-3 px-4 pb-1 pt-3">
        {dated ? <div className="grid grid-cols-7 gap-1">
          {dates.map((date) => {
            const selected = date === runtimeDate
            const today = date === todayIso
            const future = date > todayIso
            const dayLabel = new Date(`${date}T12:00:00`).toLocaleDateString('de-DE', { weekday: 'narrow' })
            return (
              <button
                key={date}
                onClick={() => setRuntimeDate(date)}
                disabled={future}
                className="vos-press flex flex-col items-center gap-1 py-1 disabled:opacity-35"
              >
                <span className="text-[11px] font-medium" style={{ color: today ? 'var(--accent)' : 'var(--dim)' }}>{dayLabel}</span>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-semibold tabular-nums transition-colors"
                  style={selected
                    ? { background: 'var(--accent)', color: '#0b0e14' }
                    : { color: today ? 'var(--accent)' : 'var(--ink)', boxShadow: today ? 'inset 0 0 0 1.5px color-mix(in srgb, var(--accent) 55%, transparent)' : 'none' }}
                >
                  {Number(date.slice(8))}
                </span>
                <span className="flex h-1.5 items-center gap-[3px]">
                  {DOMAIN_META.map(({ key, color }) => (
                    activity[key]?.has(date)
                      ? <span key={key} className="h-1 w-1 rounded-full" style={{ background: color }} />
                      : null
                  ))}
                </span>
              </button>
            )
          })}
        </div> : null}

        {tab === 'fuel' ? <FuelHeaderSummary runtimeDate={runtimeDate} compact /> : null}

        {showSubNav ? (
          <nav aria-label="Unterbereiche" data-shell-nav="horizontal" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            {subNav.map(({ id, label, Icon }) => {
              const active = activeParent === id
              return (
                <button
                  key={id}
                  onClick={() => onSubTab?.(id)}
                  className="vos-press inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors"
                  style={active
                    ? { background: 'var(--ink)', color: 'var(--bg)' }
                    : { background: 'color-mix(in srgb, var(--ink) 6%, transparent)', color: 'var(--muted)' }}
                >
                  {Icon ? <Icon size={14} strokeWidth={2} /> : null}
                  {label}
                </button>
              )
            })}
          </nav>
        ) : null}
      </div> : null}
    </>
  )
}

export default function ShellHeader(props) {
  if (props.compact) return <CompactHeader {...props} />
  return <DesktopHeader {...props} />
}

function DesktopHeader({ tab, subTab = null, runtimeDate, setRuntimeDate, compact = false, subNav = null, onSubTab = null, onNavigateDomain = null }) {
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
  const currentSubTabLabel = findSubTabLabel(tab, subTab)
  const dates = useMemo(() => weekDates(runtimeDate), [runtimeDate])
  const todayIso = localISO()
  const isToday = runtimeDate === todayIso
  const containerClass = compact
    ? 'mx-3 mt-3 min-w-0 max-w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-4 py-4 shadow-lg backdrop-blur-xl'
    : 'mx-4 mb-4 mt-3 min-w-0 max-w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-5 py-5 shadow-lg backdrop-blur-xl lg:px-7'
  const showSubNav = Array.isArray(subNav) && subNav.length > 0 && (compact || tab === 'relax')

  return (
    <header className={containerClass}>
      <div className={compact ? 'flex min-w-0 flex-col gap-4' : 'grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)] xl:items-end 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]'}>
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fit-accent/15 text-fit-accent">
              <current.Icon size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-fit-dim">Bereich</div>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className={`${compact ? 'text-base' : 'text-xl lg:text-2xl'} truncate font-black text-fit-ink`}>{current.label}</div>
                {currentSubTabLabel ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-fit-dim">
                    {currentSubTabLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-fit-dim">
            <CalendarRange size={14} className="shrink-0" />
            <span className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-fit-ink`}>{formatRuntimeDate(runtimeDate, compact)}</span>
          </div>
        </div>

        <div className={`${compact ? 'space-y-3' : 'min-w-0 space-y-3'}`}>
          {tab === 'fuel' ? <FuelHeaderSummary runtimeDate={runtimeDate} compact={compact} /> : null}
          <div className={`${compact ? 'flex flex-col gap-2 items-stretch' : 'grid gap-3 xl:grid-cols-[auto_minmax(0,1fr)] xl:items-center'}`}>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-fit-dim">Datum</div>
            <div className={`${compact ? 'flex min-w-0 flex-wrap items-center gap-2' : 'grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2'}`}>
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
              <input
                type="date"
                value={runtimeDate}
                onChange={(event) => setRuntimeDate(event.target.value)}
                className={`${compact ? 'min-w-[9.5rem] flex-1' : 'w-full min-w-0'} h-9 rounded-xl border border-white/10 bg-fit-bg2 px-3 text-xs font-black uppercase tracking-[0.1em] text-fit-ink outline-none transition focus:border-fit-accent`}
              />
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

          <div className="grid min-w-0 grid-cols-7 gap-1.5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-2.5">
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
                        <button
                          key={key}
                          title={label}
                          onClick={(event) => {
                            event.stopPropagation()
                            onNavigateDomain?.(key, date)
                          }}
                          className="flex h-6 items-center justify-center rounded-lg border border-white/5 transition hover:scale-[1.03] hover:border-white/15"
                          style={{ backgroundColor: active ? `${color}22` : 'rgba(255,255,255,0.03)', color: active ? color : '#64748b' }}
                        >
                          <Icon size={11} />
                        </button>
                      )
                    })}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {showSubNav ? (
        <nav aria-label="Unterbereiche" data-shell-nav="horizontal" className={`mt-4 flex min-w-0 flex-wrap gap-2 pb-1 overflow-visible ${compact ? '' : 'xl:ml-auto xl:w-full'}`}>
          {subNav.map(({ id, label, Icon }) => {
            const active = subTab === id
            return (
              <button
                key={id}
                onClick={() => onSubTab?.(id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition ${
                  active
                    ? 'border-fit-accent/30 bg-fit-accent text-black'
                    : 'border-white/10 bg-fit-bg2 text-fit-dim hover:text-fit-ink'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            )
          })}
        </nav>
      ) : null}
    </header>
  )
}
