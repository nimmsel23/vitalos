import { useEffect, useState } from 'react'
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
    ? 'grid grid-cols-2 gap-4 w-full'
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
            className={`relative group overflow-hidden rounded-[32px] bg-fit-card border border-fit-line/50 active:scale-95 transition-all flex flex-col items-center gap-4 shadow-sm hover:shadow-2xl hover:border-white/20 ${isSheet ? 'p-5' : 'p-6'}`}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)` }}
            />
            <div className={`${isSheet ? 'w-12 h-12 rounded-[18px]' : 'w-14 h-14 rounded-[20px]'} bg-fit-bg border border-fit-line flex items-center justify-center transition-all duration-300 shadow-inner z-10 group-hover:scale-110`}>
              <Icon size={isSheet ? 20 : 24} className="text-fit-dim transition-colors duration-300" />
            </div>
            <div className="flex flex-col items-center gap-1 z-10">
              <span className={`${isSheet ? 'text-[10px]' : 'text-[11px]'} font-black uppercase tracking-[0.2em] text-fit-muted group-hover:text-fit-ink transition-colors`}>
                {label}
              </span>
              <div className="h-0.5 w-0 group-hover:w-8 transition-all duration-500 rounded-full" style={{ background: color }} />
              <span className="text-[9px] font-bold text-fit-dim/60 tracking-wide min-h-[12px] text-center">
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
