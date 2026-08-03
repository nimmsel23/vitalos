import { lazy, Suspense, useEffect } from 'react'
import { useApp } from '@fuel/store.js'

const FuelApp = lazy(() => import('fuel/FuelApp'))
const SHELL_TAB_REDIRECTS = {
  dashboard: { type: 'fuel', tab: 'food' },
  journal: { type: 'shell', tab: 'relax', subTab: 'journal' },
  habits: { type: 'shell', tab: 'habits' },
  settings: { type: 'shell', tab: 'settings' },
}

export default function FuelWrapper({ user, subTab, onSubTab, onNavigateShell, embedded = false }) {
  const setActiveTab = useApp(s => s.setActiveTab)
  const activeTab    = useApp(s => s.activeTab)

  useEffect(() => {
    const redirect = SHELL_TAB_REDIRECTS[activeTab]
    if (!redirect) return
    if (redirect.type === 'fuel') setActiveTab(redirect.tab)
    if (redirect.type === 'shell') onNavigateShell?.(redirect.tab, redirect.subTab || null)
  }, [activeTab, onNavigateShell, setActiveTab])

  // Sidebar → Fuel: subTab-Änderung in Store schreiben
  useEffect(() => {
    if (!subTab) return
    const redirect = SHELL_TAB_REDIRECTS[subTab]
    if (redirect?.type === 'fuel') {
      if (activeTab !== redirect.tab) setActiveTab(redirect.tab)
      return
    }
    if (redirect?.type === 'shell') {
      onNavigateShell?.(redirect.tab, redirect.subTab || null)
      return
    }
    if (subTab !== activeTab) setActiveTab(subTab)
  }, [activeTab, onNavigateShell, setActiveTab, subTab])

  // Fuel intern → Sidebar: Store-Änderung zurückmelden
  useEffect(() => {
    if (activeTab && onSubTab && activeTab !== subTab) onSubTab(activeTab)
  }, [activeTab, onSubTab, subTab])

  if (!user) return (
    <div className="flex items-center justify-center h-full text-fit-dim text-xs font-black uppercase tracking-widest">
      Fuel lädt…
    </div>
  )

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full text-fit-dim text-xs font-black uppercase tracking-widest">
        Fuel lädt…
      </div>
    }>
      <FuelApp embedded={embedded} />
    </Suspense>
  )
}
