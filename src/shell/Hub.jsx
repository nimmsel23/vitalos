import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Settings2 } from 'lucide-react'
import { getSession, getPlan, getRelaxStatsSummary } from '@db'
import { localToday } from '@utils'
import { VOS_APPS } from './VitalOSApps.js'
import FuelHubStat from './FuelHubStat.jsx'

const HUB_TILES = [...VOS_APPS, { id: 'settings', label: 'Setup', Icon: Settings2, color: '#a1a1aa' }]
const PAGE_SIZE = 4

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

export default function Hub({ navigate }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(HUB_TILES.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const visibleTiles = useMemo(
    () => HUB_TILES.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [safePage],
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-fit-bg to-fit-bg2 text-fit-ink">
      <div className="mb-12 text-center animate-in fade-in duration-700">
        <h1 className="text-4xl font-black tracking-tight text-fit-ink mb-2">VitalOS</h1>
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-fit-dim">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <nav className="grid grid-cols-2 gap-4 w-full max-w-xl animate-in fade-in zoom-in-95 duration-700 delay-100">
        {visibleTiles.map(({ id, label, Icon, color }) => (
          <button
            key={id}
            onClick={() => navigate(id)}
            className="relative group p-6 rounded-[32px] bg-fit-card border border-fit-line/50 active:scale-95 transition-all overflow-hidden flex flex-col items-center gap-4 shadow-sm hover:shadow-2xl hover:border-white/20"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18 0%, transparent 70%)` }}
            />
            <div className="w-14 h-14 rounded-[20px] bg-fit-bg border border-fit-line flex items-center justify-center transition-all duration-300 shadow-inner z-10 group-hover:scale-110">
              <Icon size={24} className="text-fit-dim transition-colors duration-300" />
            </div>
            <div className="flex flex-col items-center gap-1 z-10">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-fit-muted group-hover:text-fit-ink transition-colors">
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

      {totalPages > 1 && (
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={safePage === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-fit-line bg-fit-card text-fit-dim transition hover:text-fit-accent disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index)}
                className={`h-2.5 rounded-full transition-all ${index === safePage ? 'w-8 bg-fit-accent' : 'w-2.5 bg-fit-line hover:bg-fit-dim'}`}
                aria-label={`Seite ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            disabled={safePage === totalPages - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-fit-line bg-fit-card text-fit-dim transition hover:text-fit-accent disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
