import { useMemo, useRef, useState } from 'react'
import { Check, ChevronRight, Home, LayoutGrid, MoreHorizontal, NotebookPen, X } from 'lucide-react'
import { NAV_ITEMS, SUB_NAV, buildFitnessGateItems } from '@shell/NavigationItems'
import { useSwipeToDismiss } from '@fitness/hooks/useSwipeToDismiss.js'

// iOS-artige Tab-Bar: fünf feste Slots, immer an derselben Stelle.
// Erneutes Tippen auf den aktiven Tab öffnet ein Sheet mit dessen
// Unterbereichen (statt der früheren, horizontal scrollenden Pill-Leiste
// in der Bar selbst — die Sub-Tabs leben jetzt im ShellHeader).
const PRIMARY_IDS = ['home', 'fitness', 'fuel', 'relax']
const MORE_IDS = ['sixpack', 'habits', 'settings']

function flattenSubNav(subNav = []) {
  return subNav.flatMap((item) => {
    const base = item.hideInFlatNav
      ? []
      : [{ id: item.id, label: item.label, Icon: item.Icon }]
    const nested = (item.sub || []).map((child) => ({ id: child.id, label: child.label, Icon: child.Icon }))
    return [...base, ...nested]
  })
}

function getPanelGroups(panelId) {
  if (panelId === 'fitness') return buildFitnessGateItems()
  if (panelId === 'fuel') return [{ group: 'Fuel', items: flattenSubNav(SUB_NAV.fuel) }]
  if (panelId === 'relax') return [{ group: 'Relax', items: flattenSubNav(SUB_NAV.relax) }]
  return []
}

function findApp(id) {
  return NAV_ITEMS.find((item) => item.id === id)
}

function SheetRow({ Icon, label, active, onClick, hint }) {
  const ResolvedIcon = Icon || NotebookPen
  return (
    <button
      onClick={onClick}
      className={`vos-press flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left ${active ? 'bg-fit-accent/15' : 'active:bg-white/5'}`}
      style={active ? { background: 'color-mix(in srgb, var(--accent) 14%, transparent)' } : undefined}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: active ? 'var(--accent)' : 'color-mix(in srgb, var(--ink) 7%, transparent)',
          color: active ? '#0b0e14' : 'var(--ink)',
        }}
      >
        <ResolvedIcon size={17} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-fit-ink">{label}</span>
        {hint ? <span className="block truncate text-[12px] text-fit-dim">{hint}</span> : null}
      </span>
      {active ? <Check size={16} className="shrink-0 text-fit-accent" /> : <ChevronRight size={16} className="shrink-0 text-fit-dim/60" />}
    </button>
  )
}

export default function MobileNav({ tab, navigate, subTab = null, homeGate = null }) {
  const [panelId, setPanelId] = useState(null)
  const panelGroups = useMemo(() => getPanelGroups(panelId), [panelId])
  const activeSlot = PRIMARY_IDS.includes(tab) ? tab : (tab === 'journal' ? 'home' : 'more')
  const hubOpen = tab === 'home' && homeGate === 'hub'

  function close() { setPanelId(null) }

  const backdropRef = useRef(null)
  const sheetRef = useSwipeToDismiss(close, { enabled: Boolean(panelId), backdropRef })

  function handleSlot(id) {
    if (id === 'more') {
      setPanelId((current) => (current === 'overflow' ? null : 'overflow'))
      return
    }
    setPanelId(null)
    if (id === 'home') {
      // Home = Journal; nochmal tippen schaltet den Hub (Übersicht) an/aus
      navigate(activeSlot === 'home' && !hubOpen ? 'hub' : 'home')
      return
    }
    if (activeSlot === id) {
      setPanelId(id)
      return
    }
    navigate(id)
  }

  const slots = [
    { id: 'home', label: 'Home', Icon: Home },
    ...PRIMARY_IDS.slice(1).map((id) => findApp(id)).filter(Boolean),
    { id: 'more', label: 'Mehr', Icon: MoreHorizontal },
  ]

  const panelTitle = panelId === 'overflow' ? 'Mehr' : (findApp(panelId)?.label || '')

  return (
    <>
      {panelId ? (
        <>
          <button
            ref={backdropRef}
            aria-label="Menü schließen"
            className="vos-fade-in fixed inset-0 z-[55] bg-black/40 lg:hidden"
            onClick={close}
          />
          <div
            ref={sheetRef}
            className="vos-sheet vos-sheet-in fixed inset-x-2 z-[56] max-h-[70dvh] overflow-y-auto overscroll-contain rounded-[28px] px-3 pb-3 pt-2 shadow-2xl lg:hidden"
            style={{
              bottom: 'calc(var(--tabbar-h) + var(--safe-bottom) + 8px)',
              border: '1px solid color-mix(in srgb, var(--ink) 8%, transparent)',
            }}
          >
            <div className="mx-auto mb-1 h-[5px] w-9 rounded-full" style={{ background: 'color-mix(in srgb, var(--ink) 20%, transparent)' }} />
            <div className="mb-1 flex items-center justify-between px-2 pb-1">
              <div className="text-[17px] font-semibold text-fit-ink">{panelTitle}</div>
              <button
                onClick={close}
                aria-label="Schließen"
                className="vos-press flex h-8 w-8 items-center justify-center rounded-full text-fit-dim vos-fill"
              >
                <X size={16} />
              </button>
            </div>

            {panelId === 'overflow' ? (
              <div className="space-y-0.5">
                <SheetRow Icon={LayoutGrid} label="Übersicht" hint="Alle Bereiche auf einen Blick" active={hubOpen} onClick={() => { close(); navigate('hub') }} />
                {MORE_IDS.map((id) => findApp(id)).filter(Boolean).map(({ id, label, Icon }) => (
                  <SheetRow key={id} Icon={Icon} label={label} active={tab === id} onClick={() => { close(); navigate(id) }} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {panelGroups.map(({ group, items }) => (
                  <div key={group}>
                    {panelGroups.length > 1 ? <div className="vos-eyebrow px-3 pb-1 pt-2">{group}</div> : null}
                    <div className="space-y-0.5">
                      {items.map(({ id, label, Icon }) => (
                        <SheetRow
                          key={id}
                          Icon={Icon}
                          label={label}
                          active={subTab === id}
                          onClick={() => { close(); navigate(panelId, id) }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      <nav
        className="vos-bar vos-hairline-t fixed inset-x-0 bottom-0 z-[60] lg:hidden"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
      >
        <div className="mx-auto grid max-w-xl grid-cols-5" style={{ height: 'var(--tabbar-h)' }}>
          {slots.map(({ id, label, Icon }) => {
            const active = id === 'more' ? (activeSlot === 'more' || panelId === 'overflow') : activeSlot === id
            return (
              <button
                key={id}
                onClick={() => handleSlot(id)}
                aria-current={active ? 'page' : undefined}
                className="vos-press group flex flex-col items-center justify-center gap-1"
              >
                <span
                  className="flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200"
                  style={{ background: active ? 'color-mix(in srgb, var(--accent) 18%, transparent)' : 'transparent' }}
                >
                  <Icon size={21} strokeWidth={active ? 2.3 : 1.8} style={{ color: active ? 'var(--accent)' : 'var(--dim)' }} />
                </span>
                <span
                  className="text-[10.5px] font-medium leading-none"
                  style={{ color: active ? 'var(--ink)' : 'var(--dim)' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
