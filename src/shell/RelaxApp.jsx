/**
 * RelaxApp — Shim für VitalOS (analog FuelApp).
 * Rendert relax' Views mit eigener Tab-Nav, bewusst OHNE relax' App.jsx:
 * dessen useCircadianTheme setzt data-theme global auf <html> und würde
 * das Shell-Theme kapern. Catppuccin-Variablen kommen gescoped aus
 * relax-scope.css, Views sind prop-los.
 */

import { useEffect, useState, lazy, Suspense } from 'react'
import { Activity, MoonStar, BookOpen, BarChart3, Zap, Beaker } from 'lucide-react'
import Journal from '@view/journal'
import './relax-scope.css'

// Muss vor dem ersten lazy-Import der Views gesetzt sein — relax' api.js
// liest window.__RELAX_API_BASE__ auf Modulebene. Shell-Proxy: /relax-api → :9123
if (typeof window !== 'undefined') window.__RELAX_API_BASE__ = '/relax-api'

const TABS = [
  { id: 'dash',    label: 'Heute',   Icon: Activity,  View: lazy(() => import('@relax/views/Dashboard.jsx')) },
  { id: 'session', label: 'Session', Icon: MoonStar,  View: lazy(() => import('@relax/views/Session.jsx')) },
  { id: 'stats',   label: 'Stats',   Icon: BarChart3, View: lazy(() => import('@relax/views/Stats.jsx')) },
  { id: 'physio',  label: 'Physio',  Icon: Zap,       View: lazy(() => import('@relax/views/PhysioTimeline.jsx')) },
  { id: 'catalog', label: 'Catalog', Icon: Beaker,    View: lazy(() => import('@relax/views/SubstanceCatalog.jsx')) },
]

export default function RelaxApp({ subTab = 'dash', onSubTab, onOpenSession, runtimeDate, onRuntimeDateChange }) {
  const [tab, setTab] = useState(subTab || 'dash')
  const active = TABS.find(t => t.id === tab)
  const View = active?.View ?? null
  const fullBleed = tab === 'physio' || tab === 'catalog' || tab === 'journal'

  useEffect(() => {
    if (subTab && subTab !== tab) setTab(subTab)
  }, [subTab, tab])

  useEffect(() => {
    if (tab && onSubTab && tab !== subTab) onSubTab(tab)
  }, [onSubTab, subTab, tab])

  return (
    <div className="relax-scope flex flex-col h-full">
      <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className={fullBleed ? 'h-full flex flex-col' : 'max-w-2xl mx-auto px-4 py-4 pb-8'}>
          {tab === 'journal' ? (
            <Journal embedded onOpenSession={onOpenSession} date={runtimeDate} onDateChange={onRuntimeDateChange} />
          ) : (
            <Suspense fallback={<div className="p-8 text-center" style={{ color: 'var(--dim)' }}>Laden…</div>}>
              <View />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  )
}
