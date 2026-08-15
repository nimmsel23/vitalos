/**
 * RelaxApp — Shim für VitalOS (analog FuelApp).
 * Rendert relax' Views mit eigener Tab-Nav, bewusst OHNE relax' App.jsx:
 * dessen useCircadianTheme setzt data-theme global auf <html> und würde
 * das Shell-Theme kapern. Catppuccin-Variablen kommen gescoped aus
 * relax-scope.css, Views sind prop-los.
 */

import { useEffect, useState } from 'react'
import { Activity, MoonStar, BookOpen, BarChart3, Zap, Beaker } from 'lucide-react'
import Journal from '@view/journal'
import DashboardView from '@relax/views/Dashboard.jsx'
import SessionView from '@relax/views/Session.jsx'
import StatsView from '@relax/views/Stats.jsx'
import PhysioTimelineView from '@relax/views/PhysioTimeline.jsx'
import SubstanceCatalogView from '@relax/views/SubstanceCatalog.jsx'
import './relax-scope.css'

// Muss vor dem ersten lazy-Import der Views gesetzt sein — relax' api.js
// liest window.__RELAX_API_BASE__ auf Modulebene.
// Lokal/ts.net (Vite-Dev-Proxy /relax-api → :9123 in vite.config.js): relativ.
// Firebase Hosting hat keinen Backend-Proxy (statisches Hosting) — dort direkt
// über den Tailscale Funnel ansprechen (`tailscale funnel --set-path=/relax-api/ :9123`).
if (typeof window !== 'undefined') {
  const host = window.location.hostname
  window.__RELAX_API_BASE__ = (host.includes('web.app') || host.includes('firebaseapp.com'))
    ? 'https://ideapad.tail7a15d6.ts.net/relax-api'
    : '/relax-api'
}

const TABS = [
  { id: 'dash',    label: 'Heute',   Icon: Activity,  View: DashboardView },
  { id: 'session', label: 'Session', Icon: MoonStar,  View: SessionView },
  { id: 'stats',   label: 'Stats',   Icon: BarChart3, View: StatsView },
  { id: 'physio',  label: 'Physio',  Icon: Zap,       View: PhysioTimelineView },
  { id: 'catalog', label: 'Catalog', Icon: Beaker,    View: SubstanceCatalogView },
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
            <View />
          )}
        </div>
      </main>
    </div>
  )
}
