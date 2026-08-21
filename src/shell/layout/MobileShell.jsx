import MobileNav from './MobileNav.jsx'
import FuelMobileLayout from './FuelMobileLayout.jsx'

/**
 * Switcher zwischen klassischem Mobile-Layout (MobileNav bottom bar)
 * und Fuel-inspiriertem Mobile-Layout (glassmorphism header + pill tabs).
 *
 * Nur auf Mobile aktiv (lg:hidden via FuelMobileLayout / MobileNav).
 * Desktop-Layout bleibt unverändert in App.jsx.
 */
export default function MobileShell({ tab, navigate, mobileLayout, swipeHint, header, subNav = null, subTab = null, onSubTab = null, children }) {
  if (mobileLayout === 'fuel') {
    return (
      <div className="lg:hidden mobile-shell">
        <FuelMobileLayout tab={tab} navigate={navigate} header={header}>
          {children}
        </FuelMobileLayout>
      </div>
    )
  }

  return (
    <div className="mobile-shell lg:hidden flex min-h-[100dvh] flex-col bg-fit-bg text-fit-ink">
      {header}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      <MobileNav tab={tab} navigate={navigate} swipeHint={swipeHint} subNav={subNav} subTab={subTab} onSubTab={onSubTab} />
    </div>
  )
}
