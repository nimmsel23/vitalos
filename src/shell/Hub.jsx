import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { getSession, getPlan, getRelaxStatsSummary } from '@db'
import { localToday } from '@utils'
import { VOS_APPS } from './VitalOSApps.js'
import FuelHubStat from './FuelHubStat.jsx'
import { DashboardSections } from './Dashboard.jsx'

const HUB_TILES = VOS_APPS

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

export default function Hub({ navigate, variant = 'page', runtimeDate, openSession }) {
  const isSheet = variant === 'sheet'
  const wrapperClass = isSheet
    ? 'flex flex-col text-fit-ink'
    : 'min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-fit-bg to-fit-bg2 text-fit-ink'
  const titleClass = isSheet
    ? 'mb-8 text-left'
    : 'mb-12 text-center animate-in fade-in duration-700'
  const navClass = isSheet
    ? 'grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-3xl'
    : 'grid grid-cols-2 gap-4 w-full max-w-xl animate-in fade-in zoom-in-95 duration-700 delay-100'
  const handleNavigate = (id) => navigate(id === 'journal' ? 'home' : id)

  return (
    <div className={wrapperClass}>
      <div className={titleClass}>
        <h1 className={`${isSheet ? 'text-3xl' : 'text-4xl'} font-black tracking-tight text-fit-ink mb-2`}>VitalOS</h1>
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-fit-dim">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <nav className={navClass}>
        {HUB_TILES.map(({ id, label, Icon, color }) => (
          <button
            key={id}
            onClick={() => handleNavigate(id)}
            className={`group relative flex flex-col items-start justify-between overflow-hidden rounded-3xl border border-fit-line/60 bg-fit-card text-left shadow-sm transition-all duration-300
              hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] active:translate-y-0 active:scale-[0.98]
              ${isSheet ? 'min-h-[124px] gap-3 p-4' : 'min-h-[132px] gap-5 p-5'}`}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `radial-gradient(120% 90% at 0% 0%, ${color}22 0%, transparent 60%)` }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: color }} />

            <div className="z-10 flex w-full items-start justify-between">
              <div
                className={`flex items-center justify-center rounded-2xl border bg-fit-bg shadow-inner transition-all duration-300 group-hover:scale-105
                  ${isSheet ? 'h-11 w-11' : 'h-14 w-14'}`}
                style={{ borderColor: 'color-mix(in srgb, ' + color + ' 45%, transparent)' }}
              >
                <Icon size={isSheet ? 19 : 22} className="transition-colors duration-300" style={{ color }} />
              </div>
              <ArrowUpRight
                size={16}
                className="mt-1 shrink-0 text-fit-dim/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>

            <div className="z-10 flex flex-col gap-2">
              <span className={`${isSheet ? 'text-[10px]' : 'text-[11px]'} font-black uppercase tracking-[0.18em] text-fit-muted transition-colors group-hover:text-fit-ink`}>
                {label}
              </span>
              <div className="h-0.5 w-6 rounded-full transition-all duration-500 group-hover:w-10" style={{ background: color }} />
              <span className="min-h-[12px] text-[9px] font-bold tracking-wide text-fit-dim/60">
                <TileStat appId={id} />
              </span>
            </div>
          </button>
        ))}
      </nav>

      {isSheet ? (
        <div className="mt-8">
          <DashboardSections
            navigate={handleNavigate}
            openSession={openSession}
            runtimeDate={runtimeDate}
            showHero
            showQuickLinks={false}
          />
        </div>
      ) : null}
    </div>
  )
}
