import { useEffect, useState } from 'react'
import { ChevronRight, CheckSquare, Compass, DoorOpen, Settings2, Zap } from 'lucide-react'
import { getSession, getPlan, getRelaxStatsSummary } from '@db'
import { localToday } from '@utils'
import { VOS_APPS } from './VitalOSApps.js'
import { SUB_NAV } from './NavigationItems.js'
import FuelHubStat from './FuelHubStat.jsx'
import { DashboardSections } from './Dashboard.jsx'
import ContextMenuButton from '@vos-shell-ui/ContextMenuButton.jsx'
import { getAppDestinations } from '@vos-shell-ui/appDestinations.js'

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

function TileStat({ appId, fallback = null }) {
  const fitnessStat = useFitnessStat()
  const relaxStat = useRelaxStat()

  if (appId === 'fitness') return <span>{fitnessStat || fallback}</span>
  if (appId === 'fuel') return <FuelHubStat />
  if (appId === 'relax') return <span>{relaxStat || fallback}</span>
  return fallback ? <span>{fallback}</span> : null
}

const MENU_APPS = { door: 'Door – 4 P', game: 'Game – Maps' }

const SECONDARY_LINKS = [
  { id: 'habits',   label: 'Habits', Icon: CheckSquare, color: '#a3e635' },
  { id: 'door',     label: 'Door',   Icon: DoorOpen,    color: '#fbbf24' },
  { id: 'game',     label: 'Game',   Icon: Compass,     color: '#f87171' },
  { id: 'sixpack',  label: '6Pack',  Icon: Zap,         color: '#facc15' },
  { id: 'settings', label: 'Setup',  Icon: Settings2,   color: '#94a3b8' },
]

const TILE_HINTS = {
  fitness: 'Training & Review',
  fuel: 'Essen & Makros',
  relax: 'Erholung & Atmung',
  journal: 'Tagebuch & Reflexion',
}

function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 5) return 'Gute Nacht'
  if (h < 11) return 'Guten Morgen'
  if (h < 17) return 'Hallo'
  if (h < 22) return 'Guten Abend'
  return 'Gute Nacht'
}

export default function Hub({ navigate, variant = 'page', runtimeDate, openSession }) {
  const isSheet = variant === 'sheet'
  const handleNavigate = (id, subTab) => navigate(id === 'journal' ? 'home' : id, subTab)
  const now = new Date()

  return (
    <div className={isSheet ? 'flex flex-col text-fit-ink' : 'min-h-[100dvh] bg-fit-bg px-5 py-10 text-fit-ink'}>
      <div className={isSheet ? 'mx-auto w-full max-w-3xl' : 'mx-auto w-full max-w-xl'}>
        <header className="pb-5 pt-2">
          <div className="text-[13px] font-medium text-fit-dim">
            {now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 className="mt-0.5 text-[32px] font-bold leading-tight tracking-tight text-fit-ink">{greeting(now)}</h1>
        </header>

        <nav aria-label="Apps" data-shell-nav="grid" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {HUB_TILES.map(({ id, label, Icon, color }) => (
            <ContextMenuButton
              key={id}
              menuLabel={`${label} – Unterbereiche`}
              items={getAppDestinations(id).map((item) => id === 'journal' && item.href ? item : {
                label: item.label,
                onSelect: () => handleNavigate(id, item.subTab),
              })}
              onClick={() => handleNavigate(id)}
              className="vos-press relative flex min-h-[128px] flex-col justify-between overflow-hidden rounded-[22px] p-4 text-left"
              style={{
                background: `linear-gradient(160deg, color-mix(in srgb, ${color} 16%, var(--card)) 0%, var(--card) 70%)`,
                border: '1px solid color-mix(in srgb, var(--ink) 7%, transparent)',
              }}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                style={{ background: `color-mix(in srgb, ${color} 22%, transparent)`, color }}
              >
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className="mt-4 block">
                <span className="block text-[17px] font-semibold leading-tight text-fit-ink">{label}</span>
                <span className="mt-0.5 block min-h-[16px] truncate text-[12.5px] text-fit-dim">
                  <TileStat appId={id} fallback={TILE_HINTS[id]} />
                </span>
              </span>
            </ContextMenuButton>
          ))}
        </nav>

        <div data-shell-nav="vertical" className="vos-surface mt-3 overflow-hidden rounded-[18px]">
          {SECONDARY_LINKS.map(({ id, label, Icon, color }, index) => {
            const Row = SUB_NAV[id] && MENU_APPS[id] ? ContextMenuButton : 'button'
            const menuProps = SUB_NAV[id] && MENU_APPS[id]
              ? { menuLabel: MENU_APPS[id], items: SUB_NAV[id].map((item) => ({ label: item.label, onSelect: () => handleNavigate('door', item.id) })) }
              : {}
            return (
            <Row
              key={id}
              {...menuProps}
              onClick={() => handleNavigate(id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-white/5"
              style={index ? { boxShadow: 'inset 0 0.5px 0 color-mix(in srgb, var(--ink) 10%, transparent)' } : undefined}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-[8px]" style={{ background: `color-mix(in srgb, ${color} 20%, transparent)`, color }}>
                <Icon size={15} strokeWidth={2.2} />
              </span>
              <span className="flex-1 text-[15px] text-fit-ink">{label}</span>
              <ChevronRight size={16} className="text-fit-dim/60" />
            </Row>
            )
          })}
        </div>
      </div>

      {isSheet ? (
        <div className="mx-auto mt-8 w-full max-w-3xl">
          <DashboardSections
            navigate={handleNavigate}
            openSession={openSession}
            runtimeDate={runtimeDate}
            showHero={false}
            showQuickLinks={false}
          />
        </div>
      ) : null}
    </div>
  )
}
