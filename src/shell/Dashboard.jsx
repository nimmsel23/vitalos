import { useState, useEffect, useMemo } from 'react'
import { ArrowRight, CalendarDays, Flame, Settings2, Sparkles } from 'lucide-react'
import { getSession, getPlan, getRecentSessions, getRelaxStatsSummary } from '@db'
import { localToday } from '@utils'
import { VOS_APPS } from './VitalOSApps.js'
import FuelHubStat from './FuelHubStat.jsx'
import FuelDashboardWidget from './FuelDashboardWidget.jsx'
import SessionStatus from '../components/dashboard/SessionStatus.jsx'
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap.jsx'
import { getRolling10Days } from '../components/dashboard/utils.js'

const HUB_TILES = [...VOS_APPS, { id: 'settings', label: 'Setup', Icon: Settings2, color: '#a1a1aa' }]

function useFitnessStat() {
  const [stat, setStat] = useState(null)
  useEffect(() => {
    let alive = true
    Promise.all([getSession(localToday()), getPlan()]).then(([session, plan]) => {
      if (!alive) return
      const doneCount = (session?.exercises || []).filter((entry) => entry.done).length
      const plannedCount = Array.isArray(plan?.today?.exercises) ? plan.today.exercises.length : 0
      if (doneCount > 0) setStat(`${doneCount} Übungen heute`)
      else if (plannedCount > 0) setStat(`${plannedCount} Übungen geplant`)
      else setStat('Kein Training heute')
    }).catch(() => {})
    return () => { alive = false }
  }, [])
  return stat
}

function useRelaxStat() {
  const [stat, setStat] = useState(null)
  useEffect(() => {
    let alive = true
    getRelaxStatsSummary?.().then((summary) => {
      if (!alive || !summary) return
      if (summary.streakDays) setStat(`${summary.streakDays} Tage Streak`)
    }).catch(() => {})
    return () => { alive = false }
  }, [])
  return stat
}

function TileStat({ appId }) {
  const fitnessStat = useFitnessStat()
  const relaxStat = useRelaxStat()

  if (appId === 'fitness') return fitnessStat ? <span>{fitnessStat}</span> : null
  if (appId === 'fuel') return <FuelHubStat />
  if (appId === 'relax') return relaxStat ? <span>{relaxStat}</span> : null
  return null
}

function FitnessTodayWidget({ runtimeDate, openSession, navigate }) {
  const today = runtimeDate || localToday()
  const [plan, setPlan] = useState(null)
  const [todaySession, setTodaySession] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getPlan().catch(() => null),
      getSession(today).catch(() => null),
      getRecentSessions(14).catch(() => []),
    ]).then(([nextPlan, nextSession, nextRecent]) => {
      if (cancelled) return
      setPlan(nextPlan)
      setTodaySession(nextSession)
      setRecent(Array.isArray(nextRecent) ? nextRecent : [])
    }).catch(() => {})

    return () => { cancelled = true }
  }, [today])

  const rollingDays = useMemo(() => getRolling10Days(today), [today])
  const sessionByDate = useMemo(
    () => Object.fromEntries((recent || []).filter(Boolean).map((entry) => [entry.date, entry])),
    [recent],
  )

  function handleNavigate(target, date) {
    if (target === 'session') {
      openSession?.(date || today)
      return
    }
    if (target === 'review') {
      navigate?.('fitness', 'review')
      return
    }
    navigate?.('fitness', target)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="alpha-card p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-fit-dim">Fitness</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-fit-ink">Heute im Training</h2>
          </div>
          <button
            onClick={() => navigate?.('fitness', 'session')}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-fit-bg2 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-fit-ink transition hover:text-fit-accent"
          >
            Öffnen <ArrowRight size={14} />
          </button>
        </div>
        <SessionStatus plan={plan} todaySession={todaySession} recent={recent} today={today} onNavigate={handleNavigate} />
      </div>

      <ActivityHeatmap rollingDays={rollingDays} sessionByDate={sessionByDate} today={today} onNavigate={handleNavigate} />
    </div>
  )
}

export default function Dashboard({ navigate, openSession, runtimeDate }) {
  return (
    <div className="px-4 pb-20 pt-2 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,140,66,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 md:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-fit-accent">
                <Sparkles size={12} />
                Shell Dashboard
              </div>
              <h1 className="text-3xl font-black tracking-tight text-fit-ink md:text-5xl">Heute</h1>
              <p className="mt-3 max-w-2xl text-sm text-fit-dim md:text-base">
                Ein gemeinsamer Einstieg für Training, Essen und den Rest der Shell.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button onClick={() => openSession?.(runtimeDate || localToday())} className="rounded-[1.5rem] border border-white/10 bg-fit-bg2/70 px-4 py-4 text-left transition hover:border-fit-accent/30 hover:bg-fit-bg2">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-fit-dim">Fitness</div>
                <div className="mt-2 text-lg font-black text-fit-ink">Session</div>
              </button>
              <button onClick={() => navigate?.('fuel', 'food')} className="rounded-[1.5rem] border border-white/10 bg-fit-bg2/70 px-4 py-4 text-left transition hover:border-fit-accent/30 hover:bg-fit-bg2">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-fit-dim">Fuel</div>
                <div className="mt-2 text-lg font-black text-fit-ink">Food</div>
              </button>
              <button onClick={() => navigate?.('fitness', 'review')} className="rounded-[1.5rem] border border-white/10 bg-fit-bg2/70 px-4 py-4 text-left transition hover:border-fit-accent/30 hover:bg-fit-bg2">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-fit-dim">Review</div>
                <div className="mt-2 text-lg font-black text-fit-ink">Wochenblick</div>
              </button>
            </div>
          </div>
        </section>

        <FitnessTodayWidget runtimeDate={runtimeDate} openSession={openSession} navigate={navigate} />

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="alpha-card p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.28em] text-fit-dim">Fuel</div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-fit-ink">Heute im Essen</h2>
              </div>
              <button
                onClick={() => navigate?.('fuel', 'food')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-fit-bg2 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-fit-ink transition hover:text-fit-accent"
              >
                Öffnen <Flame size={14} />
              </button>
            </div>
            <FuelDashboardWidget navigate={() => navigate?.('fuel', 'food')} />
          </div>

          <div className="alpha-card p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <CalendarDays size={18} className="text-fit-accent" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.28em] text-fit-dim">Quick Links</div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-fit-ink">Bereiche</h2>
              </div>
            </div>
            <nav className="grid grid-cols-2 gap-4">
              {HUB_TILES.map(({ id, label, Icon, color }) => (
                <button
                  key={id}
                  onClick={() => navigate?.(id)}
                  className="relative overflow-hidden rounded-[1.75rem] border border-fit-line/50 bg-fit-card p-5 text-left transition-all hover:border-white/20 hover:shadow-2xl"
                >
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)` }}
                  />
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-fit-dim">{label}</div>
                      <div className="mt-3 text-sm font-bold text-fit-ink/80 min-h-[20px]">
                        <TileStat appId={id} />
                      </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-fit-line bg-fit-bg">
                      <Icon size={20} style={{ color }} />
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </section>
      </div>
    </div>
  )
}
