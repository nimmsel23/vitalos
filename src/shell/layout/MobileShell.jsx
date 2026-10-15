import { useState } from 'react'
import MobileNav from './MobileNav.jsx'
import FuelMobileLayout from './FuelMobileLayout.jsx'

/**
 * Switcher zwischen klassischem Mobile-Layout (MobileNav bottom bar)
 * und Fuel-inspiriertem Mobile-Layout (glassmorphism header + pill tabs).
 *
 * Nur auf Mobile aktiv (lg:hidden via FuelMobileLayout / MobileNav).
 * Desktop-Layout bleibt unverändert in App.jsx.
 *
 * Safe-Area: oben konsumiert der ShellHeader das Inset, unten reserviert
 * der Content-Wrapper Platz für die fixe Tab-Bar + Home-Indicator.
 */
export default function MobileShell({ tab, navigate, mobileLayout, swipeHint, header, subNav = null, subTab = null, onSubTab = null, homeGate = null, children }) {
  const [navExpanded, setNavExpanded] = useState(true)

  if (mobileLayout === 'fuel') {
    return (
      <div className="lg:hidden mobile-shell" style={{ paddingTop: 'var(--safe-top)' }}>
        <FuelMobileLayout tab={tab} navigate={navigate} header={header}>
          {children}
        </FuelMobileLayout>
      </div>
    )
  }

  return (
    <div
      className="mobile-shell lg:hidden flex min-h-[100dvh] flex-col bg-fit-bg text-fit-ink"
      style={{ '--mobile-nav-height': `calc(var(--nav-grip-h) + var(--safe-bottom)${navExpanded ? ' + var(--tabbar-h)' : ''})` }}
    >
      {header || <div style={{ height: 'var(--safe-top)' }} />}
      <div
        className="min-w-0 flex-1"
        style={{ paddingBottom: 'calc(var(--mobile-nav-height) + 12px)' }}
      >
        {children}
      </div>
      <MobileNav tab={tab} navigate={navigate} swipeHint={swipeHint} subNav={subNav} subTab={subTab} onSubTab={onSubTab} homeGate={homeGate} expanded={navExpanded} onExpandedChange={setNavExpanded} />
    </div>
  )
}
