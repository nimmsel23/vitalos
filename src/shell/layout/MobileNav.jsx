import { useMemo, useState } from 'react'
import { Home, MoreHorizontal, NotebookPen, X } from 'lucide-react'
import { NAV_ITEMS, SUB_NAV, buildFitnessGateItems } from '@shell/NavigationItems'

function normalizeActiveAppId(tab) {
  if (tab === 'home' || tab === 'journal') return 'journal'
  return tab
}

function flattenSubNav(subNav = []) {
  return subNav.flatMap((item) => {
    const base = [{ id: item.id, label: item.label, Icon: item.Icon, parentId: null, noDefaultSub: item.noDefaultSub }]
    const nested = (item.sub || []).map((child) => ({
      id: child.id,
      label: child.label,
      Icon: child.Icon,
      parentId: item.id,
    }))
    return [...base, ...nested]
  })
}

function isEntryActive(entry, subTab, subNav) {
  if (!subTab) return false
  if (entry.id === subTab) return true
  if (entry.parentId) return false
  const parent = subNav.find((item) => item.id === entry.id)
  return Boolean(parent?.sub?.some((child) => child.id === subTab))
}

function findApp(id) {
  return NAV_ITEMS.find((item) => item.id === id)
}

function getPanelGroups(panelId) {
  if (panelId === 'fitness') return buildFitnessGateItems()
  if (panelId === 'fuel') return [{ group: 'Fuel', items: flattenSubNav(SUB_NAV.fuel) }]
  if (panelId === 'relax') return [{ group: 'Relax', items: flattenSubNav(SUB_NAV.relax) }]
  return []
}

export default function MobileNav({ tab, navigate, subNav = null, subTab = null, onSubTab = null }) {
  const [panelId, setPanelId] = useState(null)
  const panelOpen = Boolean(panelId)
  const activeAppId = normalizeActiveAppId(tab)
  const activeApp = findApp(activeAppId) || NAV_ITEMS[0]
  const isHome = tab === 'home'
  const navEntries = useMemo(() => flattenSubNav(subNav || []), [subNav])
  const overflowItems = NAV_ITEMS.filter((item) => item.id !== 'home' && item.id !== activeAppId)
  const homePrimaryApps = NAV_ITEMS.filter((item) => ['fitness', 'fuel', 'relax'].includes(item.id))
  const homeOverflowItems = NAV_ITEMS.filter((item) => ['habits', 'settings'].includes(item.id))
  const panelGroups = useMemo(() => getPanelGroups(panelId), [panelId])
  const panelTitle = panelId === 'overflow'
    ? 'Mehr'
    : (findApp(panelId)?.label || '')

  function openApp(id) {
    setPanelId(null)
    navigate(id)
  }

  function openHome() {
    setPanelId(null)
    navigate('home')
  }

  function openActiveApp() {
    setPanelId(null)
    navigate(activeAppId)
  }

  function openSubEntry(id) {
    setPanelId(null)
    onSubTab?.(id)
  }

  function openPanel(id) {
    setPanelId((current) => (current === id ? null : id))
  }

  function handlePanelSelect(targetAppId, entryId) {
    setPanelId(null)
    navigate(targetAppId, entryId)
  }

  function renderIcon(Icon, size, className = '') {
    const ResolvedIcon = Icon || NotebookPen
    return <ResolvedIcon size={size} className={className} />
  }

  return (
    <>
      {panelOpen ? (
        <button
          aria-label="Menü schließen"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setPanelId(null)}
        />
      ) : null}

      {panelOpen ? (
        <div className="fixed inset-x-3 bottom-[5.5rem] z-50 rounded-[2rem] border border-white/10 bg-fit-card/95 p-3 shadow-2xl shadow-black/35 backdrop-blur-2xl lg:hidden">
          <div className="mb-2 flex items-center justify-between px-2">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-fit-dim">{panelTitle}</div>
            <button
              onClick={() => setPanelId(null)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-fit-dim"
            >
              <X size={14} />
            </button>
          </div>
          {panelId === 'overflow' ? (
            <div className="grid grid-cols-2 gap-2">
              {(isHome ? homeOverflowItems : overflowItems).map(({ id, label, Icon }) => {
                const active = tab === id
                return (
                  <button
                    key={id}
                    onClick={() => openApp(id)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-fit-accent/30 bg-fit-accent/14 text-fit-accent'
                        : 'border-white/10 bg-fit-bg2/70 text-fit-ink'
                    }`}
                  >
                    {renderIcon(Icon, 16)}
                    <span className="text-[10px] font-black uppercase tracking-[0.16em]">{label}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {panelGroups.map(({ group, items }) => (
                <div key={group}>
                  <div className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.22em] text-fit-dim">{group}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        onClick={() => handlePanelSelect(panelId, id)}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-fit-bg2/70 px-4 py-3 text-left text-fit-ink transition"
                      >
                        {renderIcon(Icon, 16)}
                        <span className="text-[10px] font-black uppercase tracking-[0.16em]">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="border-t border-fit-line/40 bg-fit-card/92 px-3 pt-2 pb-3 backdrop-blur-2xl">
          <div className="flex items-end gap-2">
            <button
              onClick={openHome}
              className={`flex shrink-0 flex-col items-center gap-[5px] rounded-[1.2rem] px-2 py-1.5 transition ${
                tab === 'home'
                  ? 'text-fit-accent'
                  : 'text-fit-dim'
              }`}
            >
              <div className={`flex h-8 w-11 items-center justify-center rounded-2xl ${tab === 'home' ? 'bg-fit-accent shadow-lg shadow-fit-accent/30' : 'bg-white/5'}`}>
                <Home size={17} className={tab === 'home' ? 'text-black stroke-[2.5]' : 'stroke-[2]'} />
              </div>
              <span className="text-[7.5px] font-black uppercase tracking-wide leading-none">Home</span>
            </button>

            {isHome ? (
              <div className="min-w-0 flex-1 overflow-x-auto no-scrollbar">
                <div className="flex min-w-max items-end gap-2 pb-1">
                  {homePrimaryApps.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => openPanel(id)}
                      className={`flex shrink-0 flex-col items-center gap-[5px] rounded-[1.2rem] px-2 py-1.5 transition ${
                        panelId === id ? 'text-fit-accent' : 'text-fit-ink'
                      }`}
                    >
                      <div className={`flex h-8 min-w-[3.2rem] items-center justify-center rounded-2xl px-3 ${
                        panelId === id ? 'bg-fit-accent shadow-lg shadow-fit-accent/30' : 'bg-white/7'
                      }`}>
                        {renderIcon(Icon, 17, panelId === id ? 'text-black stroke-[2.5]' : 'stroke-[2]')}
                      </div>
                      <span className="text-[7.5px] font-black uppercase tracking-wide leading-none">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={openActiveApp}
                className={`flex shrink-0 flex-col items-center gap-[5px] rounded-[1.2rem] px-2 py-1.5 transition ${
                  tab === activeAppId
                    ? 'text-fit-accent'
                    : 'text-fit-ink'
                }`}
              >
                <div className={`flex h-8 min-w-[3.2rem] items-center justify-center rounded-2xl px-3 ${
                  tab === activeAppId
                    ? 'bg-fit-accent shadow-lg shadow-fit-accent/30'
                    : 'bg-white/7'
                }`}>
                  {renderIcon(activeApp.Icon, 17, tab === activeAppId ? 'text-black stroke-[2.5]' : 'stroke-[2]')}
                </div>
                <span className="text-[7.5px] font-black uppercase tracking-wide leading-none">{activeApp.label}</span>
              </button>
            )}

            {!isHome ? (
              <div className="min-w-0 flex-1 overflow-x-auto no-scrollbar">
                <div className="flex min-w-max items-center gap-1 pb-1">
                  {navEntries.map((entry) => {
                    const active = isEntryActive(entry, subTab, subNav || [])
                    return (
                      <button
                        key={`${entry.parentId || 'root'}-${entry.id}`}
                        onClick={() => openSubEntry(entry.id)}
                        className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[9px] font-black uppercase tracking-[0.14em] transition ${
                          active
                            ? 'border-fit-accent/30 bg-fit-accent text-black'
                            : 'border-white/10 bg-fit-bg2/80 text-fit-dim'
                        }`}
                      >
                        {renderIcon(entry.Icon, 12)}
                        <span>{entry.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <button
              onClick={() => openPanel('overflow')}
              className={`flex shrink-0 flex-col items-center gap-[5px] rounded-[1.2rem] px-2 py-1.5 transition ${
                panelId === 'overflow' ? 'text-fit-accent' : 'text-fit-dim'
              }`}
            >
              <div className={`flex h-8 w-11 items-center justify-center rounded-2xl ${panelId === 'overflow' ? 'bg-fit-accent shadow-lg shadow-fit-accent/30' : 'bg-white/5'}`}>
                <MoreHorizontal size={17} className={panelId === 'overflow' ? 'text-black stroke-[2.5]' : 'stroke-[2]'} />
              </div>
              <span className="text-[7.5px] font-black uppercase tracking-wide leading-none">Mehr</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
