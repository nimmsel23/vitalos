import { useEffect, useRef } from 'react'
import { useApp } from '@fuel/store.js'
import FuelApp from './FuelApp.jsx'
const SHELL_TAB_REDIRECTS = {
  dashboard: { type: 'fuel', tab: 'food' },
  journal: { type: 'shell', tab: 'journal' },
  habits: { type: 'shell', tab: 'habits' },
  settings: { type: 'shell', tab: 'settings' },
}

export default function FuelWrapper({ user, subTab, onSubTab, onNavigateShell, embedded = false }) {
  const setActiveTab = useApp(s => s.setActiveTab)
  const activeTab    = useApp(s => s.activeTab)
  const shellSyncTargetRef = useRef(null)
  const lastShellRedirectRef = useRef(null)

  function normalizeFuelTab(tab) {
    const redirect = SHELL_TAB_REDIRECTS[tab]
    return redirect?.type === 'fuel' ? redirect.tab : tab
  }

  useEffect(() => {
    const redirect = SHELL_TAB_REDIRECTS[activeTab]
    if (!redirect) {
      lastShellRedirectRef.current = null
      return
    }
    if (redirect.type === 'fuel') {
      if (activeTab !== redirect.tab) setActiveTab(redirect.tab)
      return
    }
    if (lastShellRedirectRef.current === activeTab) return
    lastShellRedirectRef.current = activeTab
    onNavigateShell?.(redirect.tab, redirect.subTab || null)
  }, [activeTab, onNavigateShell, setActiveTab])

  // Sidebar → Fuel: subTab-Änderung in Store schreiben
  useEffect(() => {
    if (!subTab) return
    const targetTab = normalizeFuelTab(subTab)
    if (!targetTab || targetTab === activeTab) return
    shellSyncTargetRef.current = targetTab
    setActiveTab(targetTab)
  }, [activeTab, setActiveTab, subTab])

  // Fuel intern → Sidebar: Store-Änderung zurückmelden
  useEffect(() => {
    if (!activeTab || !onSubTab) return
    if (shellSyncTargetRef.current === activeTab) {
      shellSyncTargetRef.current = null
      return
    }
    if (normalizeFuelTab(subTab) !== activeTab) onSubTab(activeTab)
  }, [activeTab, onSubTab, subTab])

  if (!user) return (
    <div className="flex items-center justify-center h-full text-fit-dim text-xs font-black uppercase tracking-widest">
      Fuel lädt…
    </div>
  )

  return <FuelApp embedded={embedded} />
}
