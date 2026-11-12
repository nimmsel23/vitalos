/**
 * RelaxApp — Shim für VitalOS (analog FuelApp).
 * Rendert relax' Views mit eigener Tab-Nav, bewusst OHNE relax' App.jsx:
 * dessen useCircadianTheme setzt data-theme global auf <html> und würde
 * das Shell-Theme kapern. Catppuccin-Variablen kommen gescoped aus
 * relax-scope.css, Views sind prop-los.
 */

import { useEffect, useRef, useState } from 'react'
import { Activity, MoonStar, BookOpen, BarChart3, Zap, Beaker, Wind, GraduationCap } from 'lucide-react'
import Journal from '@view/journal'
import DashboardView from '@relax/views/Dashboard.jsx'
import SessionView from '@relax/views/Session.jsx'
import BreathView from '@relax/views/Breath.jsx'
import AusbildungView from '@relax/views/Ausbildung.jsx'
import StatsView from '@relax/views/Stats.jsx'
import PhysioTimelineView from '@relax/views/PhysioTimeline.jsx'
import SubstanceCatalogView from '@relax/views/SubstanceCatalog.jsx'
import './relax-scope.css'
import { relaxApiBase } from '../cloud/productRuntime.js'
import { STORE_BUILD, RELAX_OWNER_TABS } from './NavigationItems.js'

// Muss vor dem ersten lazy-Import der Views gesetzt sein — relax' api.js
// liest window.__RELAX_API_BASE__ auf Modulebene.
// Lokal/ts.net (Vite-Dev-Proxy /relax-api → :9123 in vite.config.js): relativ.
// Private Firebase-Ansichten nutzen den lokalen Funnel. Produkt-Builds bleiben
// auf der eigenen Origin, bis ein Produkt-Backend eingerichtet ist.
if (typeof window !== 'undefined') {
  window.__RELAX_API_BASE__ = relaxApiBase(window.location.hostname)
}

const TABS = [
  { id: 'dash',       label: 'Heute',   Icon: Activity,      View: DashboardView },
  { id: 'ausbildung', label: 'Modul',   Icon: GraduationCap, View: AusbildungView },
  { id: 'session',    label: 'Praxis',  Icon: MoonStar,      View: SessionView },
  { id: 'atem',       label: 'Atem',    Icon: Wind,          View: BreathView },
  { id: 'stats',   label: STORE_BUILD ? 'Statistik' : 'Stats', Icon: BarChart3, View: StatsView },
  { id: 'physio',  label: 'Physio',  Icon: Zap,       View: PhysioTimelineView },
  { id: 'catalog', label: 'Catalog', Icon: Beaker,    View: SubstanceCatalogView },
].filter(({ id }) => !(STORE_BUILD && RELAX_OWNER_TABS.has(id)))

export default function RelaxApp({ subTab = 'dash', onSubTab, onOpenSession, runtimeDate, onRuntimeDateChange }) {
  const [tab, setTab] = useState(subTab || 'dash')
  const shellSyncTargetRef = useRef(null)
  const active = TABS.find(t => t.id === tab)
  const View = active?.View ?? null
  const fullBleed = tab === 'physio' || tab === 'catalog' || tab === 'journal'

  useEffect(() => {
    if (!subTab || subTab === tab) return
    shellSyncTargetRef.current = subTab
    setTab(subTab)
  }, [subTab, tab])

  useEffect(() => {
    if (!tab || !onSubTab) return
    if (shellSyncTargetRef.current === tab) {
      shellSyncTargetRef.current = null
      return
    }
    if (shellSyncTargetRef.current) return
    if (tab !== subTab) onSubTab(tab)
  }, [onSubTab, subTab, tab])

  return (
    <div className="relax-scope flex flex-col h-full">
      <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className={fullBleed ? 'h-full flex flex-col' : tab === 'session' ? 'w-full max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 py-5 pb-8' : 'max-w-2xl mx-auto px-4 py-4 pb-8'}>
          {tab === 'journal' ? (
            <Journal embedded onOpenSession={onOpenSession} date={runtimeDate} onDateChange={onRuntimeDateChange} />
          ) : (
            <View onNavigate={setTab} />
          )}
        </div>
      </main>
    </div>
  )
}
