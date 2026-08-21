import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { watchAuth, signIn, signInEmail, signUpEmail, signOut, isLocalMode, auth, getUserProfile } from '@db'
import { VALID_TABS, SUB_NAV, buildFitnessGateItems } from './shell/NavigationItems.js'
import Settings from '@view/settings/index.jsx'
import Sidebar from './shell/layout/Sidebar.jsx'
import MobileShell from './shell/layout/MobileShell.jsx'
import UserProfile from './components/common/UserProfile.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import Hub from './shell/Hub.jsx'
import { useApp as useFuelAppStore, useSettings as useFuelStore } from '@fuel/store.js'
import ShellHeader from './shell/ShellHeader.jsx'
import { useShellSettings } from './shell/store.js'
import FitnessAppGate from './shell/FitnessAppGate.jsx'
import FitnessApp from './shell/FitnessApp.jsx'
import FuelWrapper from './shell/FuelWrapper.jsx'
import HabitsApp from './shell/HabitsApp.jsx'
import JournalApp from './shell/JournalApp.jsx'
import RelaxApp from './shell/RelaxApp.jsx'
import CoachApp from '@view/coach'

const DAY_START = 8
const DAY_END   = 20

function HomeSheet({ label, onDismiss, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-[linear-gradient(180deg,rgba(8,10,14,0.16),rgba(8,10,14,0.5))] backdrop-blur-md">
      <button
        aria-label={`${label} schließen`}
        className="absolute inset-0"
        onClick={onDismiss}
      />
      <div className="relative w-full translate-y-0 animate-in slide-in-from-bottom-8 duration-500">
        <div className="mx-auto flex max-h-[88dvh] w-full max-w-[1600px] flex-col overflow-hidden rounded-t-[2.5rem] border border-white/12 bg-[linear-gradient(180deg,rgba(20,24,32,0.72),rgba(10,12,18,0.82))] shadow-[0_-30px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="flex shrink-0 flex-col gap-3 px-4 pb-3 pt-3 sm:px-6 lg:px-8">
            <div className="mx-auto h-1.5 w-14 rounded-full bg-white/15" />
            <div className="flex items-center justify-between gap-4">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-fit-dim">{label}</div>
              <button
                onClick={onDismiss}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-fit-dim transition hover:text-fit-ink"
              >
                Schließen
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function HomeFitnessGate({ onSelect, onDismiss }) {
  return (
    <HomeSheet label="Fitness Gate" onDismiss={onDismiss}>
      <FitnessAppGate navigate={onSelect} items={buildFitnessGateItems()} title="Fitness" variant="sheet" />
    </HomeSheet>
  )
}

function HomeHubGate({ onSelect, onDismiss, runtimeDate, openSession }) {
  return (
    <HomeSheet label="Hub" onDismiss={onDismiss}>
      <Hub navigate={onSelect} variant="sheet" runtimeDate={runtimeDate} openSession={openSession} />
    </HomeSheet>
  )
}

function readHashState() {
  const raw = window.location.hash.replace(/^#\/?/, '')
  if (!raw) return { tab: 'home', subTab: 'hub', date: null }
  const [mainTab = 'home', second = null, third = null] = raw.split('/')
  const dateLike = /^\d{4}-\d{2}-\d{2}$/
  const subTab = second && !dateLike.test(second) ? second : null
  const date = dateLike.test(second || '') ? second : third
  if (mainTab === 'hub') return { tab: 'home', subTab: 'hub', date: null }
  if (mainTab === 'dashboard') return { tab: 'home', subTab: null }
  if (mainTab === 'learn') return { tab: 'fitness', subTab: 'learn' }
  if (mainTab === 'journal') return { tab: 'home', subTab: null, date: date || null }
  if (mainTab === 'fuel' && subTab === 'journal') return { tab: 'home', subTab: null, date: date || null }
  if (mainTab === 'fuel' && subTab === 'habits') return { tab: 'habits', subTab: null }
  if (mainTab === 'fuel' && subTab === 'settings') return { tab: 'settings', subTab: null }
  return {
    tab: VALID_TABS.has(mainTab) ? mainTab : 'hub',
    subTab: subTab || null,
    date: date || null,
  }
}

function buildHashState({ tab, subTab = null, date = null }) {
  const parts = [tab]
  if (subTab) parts.push(subTab)
  if (date) parts.push(date)
  return `#${parts.join('/')}`
}

function Views({ tab, fitnessProps, fuelTab, setFuelTab, relaxTab, setRelaxTab, homeGate, onHomeGateSelect, onHomeGateDismiss, user, settingsProps, openSession, compact, muscleLanguage, taxonomy, runtimeDate, onRuntimeDateChange, navigate }) {
  const p = compact ? 'p-4' : 'p-4 sm:p-8 lg:p-12'
  return (
    <>
    {tab === 'home'     && (
      <div className="relative min-h-[100dvh]">
        <JournalApp onOpenSession={openSession} onNavigateShell={navigate} runtimeDate={runtimeDate} onRuntimeDateChange={onRuntimeDateChange} />
        {homeGate === 'fitness' ? <HomeFitnessGate onSelect={onHomeGateSelect} onDismiss={onHomeGateDismiss} /> : null}
      </div>
    )}
    {tab === 'fitness'  && <FitnessApp  {...fitnessProps} />}
    {tab === 'fuel'     && <FuelWrapper user={user} subTab={fuelTab} onSubTab={setFuelTab} onNavigateShell={navigate} embedded />}
    {tab === 'journal'  && <JournalApp onOpenSession={openSession} onNavigateShell={navigate} runtimeDate={runtimeDate} onRuntimeDateChange={onRuntimeDateChange} />}
    {tab === 'habits'   && <HabitsApp runtimeDate={runtimeDate} onRuntimeDateChange={onRuntimeDateChange} />}
    {tab === 'relax'    && <RelaxApp subTab={relaxTab} onSubTab={setRelaxTab} onOpenSession={openSession} runtimeDate={runtimeDate} onRuntimeDateChange={onRuntimeDateChange} />}
    {tab === 'settings' && <div className={`${p} max-w-[1600px] mx-auto`}><Settings {...settingsProps} /></div>}
    {tab === 'coach'    && <div className={`${p} max-w-[1600px] mx-auto`}><CoachApp /></div>}
    </>
  )
}

export default function App() {
  const [tab, setTab] = useState(() => readHashState().tab)
  const [fitnessTab, setFitnessTab] = useState(() => {
    const { tab: hashTab, subTab } = readHashState()
    return hashTab === 'fitness' ? (subTab || null) : null
  })
  const [fuelTab, setFuelTab] = useState(() => {
    const { tab: hashTab, subTab } = readHashState()
    return hashTab === 'fuel' && subTab ? subTab : 'food'
  })
  const [homeGate, setHomeGate] = useState(() => {
    const { tab: hashTab, subTab } = readHashState()
    return hashTab === 'home' ? (subTab || null) : null
  })
  const [relaxTab, setRelaxTab] = useState(() => {
    const { tab: hashTab, subTab } = readHashState()
    return hashTab === 'relax' && subTab ? subTab : 'dash'
  })
  const [sessionDate,   setSessionDate]   = useState(null)
  const [sessionDraft,  setSessionDraft]  = useState(null)

  function openSession(date, draft = null) {
    setSessionDate(date || null)
    setSessionDraft(draft || null)
    setFitnessTab('session')
    setTab('fitness')
  }

  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authEmail, setAuthEmail]     = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError]     = useState('')
  const [authRegistering, setAuthRegistering] = useState(false)

  useEffect(() => {
    if (isLocalMode()) { setAuthLoading(false); return }
    // authStateReady() wartet bis Firebase die Session aus IndexedDB geladen hat —
    // verhindert Login-Screen-Flash bei jedem Reload
    auth.authStateReady().then(() => {
      setAuthLoading(false)
      watchAuth(u => setUser(u))
    })
  }, [])

  // Settings state — SSOT ist der Shell-Store (src/shell/store.js)
  const {
    theme, themeMode, circDark, circLight,
    gender, anatomyModel, age, heightCm, weightKg, recentDays, coverageThreshold,
    runtimeDate, setRuntimeDate, sidebarPinned, setSidebarPinned,
    muscleLanguage, mobileLayout,
  } = useShellSettings()
  const fuelActiveDate = useFuelAppStore(s => s.activeDate)
  const setFuelActiveDate = useFuelAppStore(s => s.setActiveDate)
  const [taxonomy, setTaxonomy] = useState(null)

  useEffect(() => {
    if (isLocalMode()) {
      fetch('http://localhost:9100/fitness/muscles')
      .then(r => r.json())
      .then(data => setTaxonomy(data?.muscles || null))
      .catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (runtimeDate && fuelActiveDate !== runtimeDate) setFuelActiveDate(runtimeDate)
  }, [runtimeDate, fuelActiveDate, setFuelActiveDate])
  useEffect(() => {
    if (tab === 'fuel' && fuelActiveDate && fuelActiveDate !== runtimeDate) setRuntimeDate(fuelActiveDate)
  }, [tab, fuelActiveDate, runtimeDate, setRuntimeDate])

  // User-Settings global: vitalos-Profil (Alter/Geschlecht) in den Fuel-Store spiegeln,
  // damit z. B. DACH-Referenzwerte im Mikros-Tab dieselben Werte nutzen — unabhängig
  // davon, ob der Setup-Tab je geöffnet wurde.
  // Cloud-Hydration: Firestore-Profil (users/{uid}) nach Login in den
  // Shell-Store übernehmen — SSOT bleibt der Store, Firestore ist Backup/Sync.
  useEffect(() => {
    if (!user?.uid || isLocalMode()) return
    getUserProfile(user.uid).then(p => {
      if (!p) return
      const s = useShellSettings.getState()
      if (p.gender) s.setGender(p.gender)
      if (p.age) s.setAge(p.age)
      if (p.heightCm) s.setHeightCm(p.heightCm)
      if (p.weightKg) s.setWeightKg(p.weightKg)
      if (p.split) s.setSplit(p.split)
      if (p.defaultLocation) s.setDefaultLocation(p.defaultLocation)
      if (p.cycleLength) s.setCycleLength(p.cycleLength)
      if (p.recentDays) s.setRecentDays(p.recentDays)
      if (p.coverageThreshold) s.setCoverageThreshold(p.coverageThreshold)
    }).catch(() => {})
  }, [user])

  const setFuelSetting = useFuelStore(s => s.setSetting)
  useEffect(() => {
    if (age) setFuelSetting('age', age)
    if (gender) setFuelSetting('gender', gender)
    if (heightCm) setFuelSetting('height_cm', heightCm)
    if (weightKg) setFuelSetting('weight_kg', weightKg)
  }, [age, gender, heightCm, weightKg, setFuelSetting])

  useEffect(() => {
    if (themeMode === 'manual') {
      document.documentElement.setAttribute('data-theme', theme)
    } else {
      const hour = new Date().getHours()
      document.documentElement.setAttribute('data-theme', (hour >= DAY_START && hour < DAY_END) ? circLight : circDark)
    }
  }, [theme, themeMode, circLight, circDark])

  useEffect(() => {
    const { tab: hashTab, date } = readHashState()
    if ((hashTab === 'home' || hashTab === 'fuel' || hashTab === 'journal' || hashTab === 'habits' || hashTab === 'relax') && date && date !== runtimeDate) {
      setRuntimeDate(date)
    }
    if (hashTab === 'fitness' && readHashState().subTab === 'session' && date) {
      setSessionDate(date)
    }
  }, [])

  useEffect(() => {
    const nextHash = tab === 'fitness'
      ? buildHashState({ tab, subTab: fitnessTab, date: fitnessTab === 'session' ? (sessionDate || runtimeDate) : null })
      : tab === 'home'
        ? buildHashState({ tab, subTab: homeGate, date: homeGate ? null : runtimeDate })
      : tab === 'fuel'
        ? buildHashState({ tab, subTab: fuelTab || 'food', date: runtimeDate })
      : tab === 'relax'
        ? buildHashState({ tab, subTab: relaxTab || 'dash', date: runtimeDate })
      : tab === 'journal' || tab === 'habits'
        ? buildHashState({ tab, date: runtimeDate })
        : buildHashState({ tab })
    if (window.location.hash !== nextHash) history.pushState(null, '', nextHash)
  }, [tab, fitnessTab, homeGate, fuelTab, relaxTab, runtimeDate, sessionDate])

  useEffect(() => {
    function syncFromLocation() {
      const { tab: nextTab, subTab, date } = readHashState()
      setTab(nextTab)
      if (nextTab === 'home') setHomeGate(subTab || null)
      if (nextTab === 'home' && date) setRuntimeDate(date)
      if (nextTab === 'fitness') setFitnessTab(subTab || null)
      if (nextTab === 'fitness' && subTab === 'session') setSessionDate(date || runtimeDate)
      if (nextTab === 'fuel' && subTab) setFuelTab(subTab)
      if (nextTab === 'fuel' && date) setRuntimeDate(date)
      if ((nextTab === 'journal' || nextTab === 'habits' || nextTab === 'relax') && date) setRuntimeDate(date)
      if (nextTab === 'relax') setRelaxTab(subTab || 'dash')
    }

    window.addEventListener('popstate', syncFromLocation)
    window.addEventListener('hashchange', syncFromLocation)
    return () => {
      window.removeEventListener('popstate', syncFromLocation)
      window.removeEventListener('hashchange', syncFromLocation)
    }
  }, [])

  function navigate(id, subTab = null) {
    if (id === 'journal') {
      setHomeGate(null)
      setTab('home')
      return
    }
    if (id === 'hub') {
      setTab('home')
      setHomeGate('hub')
      return
    }
    if (tab === 'home' && homeGate === 'hub' && id === 'fitness') {
      setHomeGate('fitness')
      setTab('home')
      return
    }
    if (!VALID_TABS.has(id)) return
    if (id === 'home') {
      setHomeGate(subTab || null)
    } else if (tab === 'home' && homeGate === 'hub') {
      setHomeGate(null)
    } else if (tab !== 'home') {
      setHomeGate(null)
    }
    if (id === 'fitness') {
      setFitnessTab(subTab || null)
    }
    if (id === 'fuel') {
      setFuelTab(subTab || 'food')
    }
    if (id === 'relax') {
      setRelaxTab(subTab || 'dash')
    }
    setTab(id)
  }

  function handleHomeGateSelect(id) {
    setHomeGate(null)
    setFitnessTab(id)
    setTab('fitness')
  }

  async function handleAuthSubmit(e) {
    e.preventDefault()
    setAuthError('')
    try {
      if (authRegistering) await signUpEmail(authEmail, authPassword)
        else                 await signInEmail(authEmail, authPassword)
    } catch {
      setAuthError('Anmeldung fehlgeschlagen.')
    }
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-fit-bg">
    <div className="text-fit-dim text-xs font-black uppercase tracking-widest">…</div>
    </div>
  )

    // Local-Mode hat keine Firebase-Auth — user bleibt null, Gate überspringen
    if (!user && !isLocalMode()) return (
      <div className="min-h-screen flex items-center justify-center bg-fit-bg text-fit-ink p-6">
      <div className="w-full max-w-sm card p-8 space-y-6">
      <div className="text-center">
      <h1 className="text-2xl font-black tracking-tight">VitalOS</h1>
      <p className="text-fit-dim text-[10px] font-bold uppercase tracking-widest mt-2">Anmelden</p>
      </div>
      <form onSubmit={handleAuthSubmit} className="space-y-3">
      <input type="email"    placeholder="Email"    value={authEmail}    onChange={e => setAuthEmail(e.target.value)}    required className="w-full bg-fit-bg2 border border-fit-line rounded-xl px-4 py-3 text-sm font-bold focus:border-fit-accent outline-none" />
      <input type="password" placeholder="Passwort" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required className="w-full bg-fit-bg2 border border-fit-line rounded-xl px-4 py-3 text-sm font-bold focus:border-fit-accent outline-none" />
      {authError && <p className="text-fit-red text-[10px] font-bold uppercase text-center">{authError}</p>}
      <button type="submit" className="w-full btn btn-primary py-3 font-black uppercase tracking-widest">
      {authRegistering ? 'Account erstellen' : 'Anmelden'}
      </button>
      </form>
      <div className="flex items-center gap-3">
      <div className="h-px bg-fit-line flex-1 opacity-50" />
      <span className="text-[9px] font-black uppercase text-fit-dim">oder</span>
      <div className="h-px bg-fit-line flex-1 opacity-50" />
      </div>
      <button onClick={signIn} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform">
      Google Login
      </button>
      <button onClick={() => setAuthRegistering(!authRegistering)} className="w-full text-[10px] font-black text-fit-dim uppercase hover:text-fit-accent">
      {authRegistering ? 'Bereits einen Account? Anmelden' : 'Neu hier? Account erstellen'}
      </button>
      </div>
      </div>
    )

      const settingsProps = { user, signOut }
      const showDesktopChrome = true
      const gateOpen = tab === 'home' && Boolean(homeGate)
      const showShellHeader = tab !== 'coach' && !gateOpen
      const showSidebar = showDesktopChrome && !gateOpen
      const shellSubTab = tab === 'fitness'
        ? fitnessTab
        : tab === 'fuel'
          ? fuelTab
          : tab === 'relax'
            ? relaxTab
            : tab === 'home'
              ? homeGate
              : null

      const fitnessProps = {
        recentDays, coverageThreshold,
        gender: anatomyModel, muscleLanguage, taxonomy,
        subTab: fitnessTab, onSubTab: setFitnessTab,
        sessionDate: sessionDate || runtimeDate, sessionDraft, onOpenSession: openSession,
        onRuntimeDateChange: setRuntimeDate,
        onNavigateShell: navigate,
        sidebarPinned, showDesktopChrome,
      }
      const shellSubNav = tab === 'fitness'
        ? SUB_NAV.fitness
        : tab === 'fuel'
          ? SUB_NAV.fuel
          : tab === 'relax'
            ? SUB_NAV.relax
            : null
      const shellSubTabSetter = tab === 'fitness'
        ? setFitnessTab
        : tab === 'fuel'
          ? setFuelTab
          : tab === 'relax'
            ? setRelaxTab
            : null
      const shellHeader = <ShellHeader tab={tab} subTab={shellSubTab} runtimeDate={runtimeDate} setRuntimeDate={setRuntimeDate} subNav={shellSubNav} onSubTab={shellSubTabSetter} />
      const mobileShellHeader = <ShellHeader tab={tab} subTab={shellSubTab} runtimeDate={runtimeDate} setRuntimeDate={setRuntimeDate} compact subNav={shellSubNav} onSubTab={shellSubTabSetter} />

      return (
        <ErrorBoundary>
        {/* HIER ist die app-shell Klasse wieder an Ort und Stelle */}
        <div className="app-shell flex min-h-screen overflow-x-hidden w-full bg-fit-bg text-fit-ink font-sans transition-colors duration-500">
        {showSidebar && (
        <Sidebar tab={tab} navigate={navigate} pinned={sidebarPinned} setPinned={setSidebarPinned} user={user}
        subNav={tab === 'fitness' ? SUB_NAV.fitness : tab === 'fuel' ? SUB_NAV.fuel : tab === 'relax' ? SUB_NAV.relax : null}
        subTab={tab === 'fitness' ? fitnessTab : tab === 'fuel' ? fuelTab : tab === 'relax' ? relaxTab : null}
        onSubTab={tab === 'fitness' ? setFitnessTab : tab === 'fuel' ? setFuelTab : tab === 'relax' ? setRelaxTab : null}>
        <UserProfile user={user} subtitle={isLocalMode() ? `${user?.email || 'localhost'} · localhost` : (user?.email || '')} onOpenSettings={() => navigate('settings')} />
        {!isLocalMode() && (
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-fit-red bg-fit-red/5 border border-fit-red/10 rounded-xl hover:bg-fit-red/10 transition-all">
          Logout
          </button>
        )}
        <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-fit-dim bg-fit-bg2 rounded-xl hover:bg-white/5 transition-all">
        <RefreshCw size={14} /> Refresh
        </button>
        </Sidebar>
        )}

        <div className={`flex-1 min-w-0 transition-all duration-500 ease-in-out ${showSidebar ? (sidebarPinned ? 'lg:ml-[304px]' : 'lg:ml-[108px]') : ''}`}>
        {mobileLayout === 'fuel' ? (
          <>
          {/* Desktop: klassisches Layout */}
          <div className="hidden lg:block">
          {showShellHeader ? shellHeader : null}
          <main className="relative min-h-[100dvh]">
          <Views tab={tab} fitnessProps={fitnessProps} fuelTab={fuelTab} setFuelTab={setFuelTab} muscleLanguage={muscleLanguage} taxonomy={taxonomy}
          user={user} settingsProps={settingsProps} openSession={openSession} runtimeDate={runtimeDate} onRuntimeDateChange={setRuntimeDate} navigate={navigate} relaxTab={relaxTab} setRelaxTab={setRelaxTab} homeGate={homeGate} onHomeGateSelect={handleHomeGateSelect} onHomeGateDismiss={() => setHomeGate(null)} />
          {tab === 'home' && homeGate === 'hub' ? <HomeHubGate onSelect={navigate} onDismiss={() => setHomeGate(null)} runtimeDate={runtimeDate} openSession={openSession} /> : null}
          </main>
          </div>
          {/* Mobile: Fuel-Layout */}
          <MobileShell tab={tab} navigate={navigate} mobileLayout="fuel" header={showShellHeader ? mobileShellHeader : null}>
          <Views tab={tab} fitnessProps={fitnessProps} fuelTab={fuelTab} setFuelTab={setFuelTab} muscleLanguage={muscleLanguage} taxonomy={taxonomy}
          user={user} settingsProps={settingsProps} openSession={openSession} compact runtimeDate={runtimeDate} onRuntimeDateChange={setRuntimeDate} navigate={navigate} relaxTab={relaxTab} setRelaxTab={setRelaxTab} homeGate={homeGate} onHomeGateSelect={handleHomeGateSelect} onHomeGateDismiss={() => setHomeGate(null)} />
          {tab === 'home' && homeGate === 'hub' ? <HomeHubGate onSelect={navigate} onDismiss={() => setHomeGate(null)} runtimeDate={runtimeDate} openSession={openSession} /> : null}
          </MobileShell>
          </>
        ) : (
          <>
          <div className="hidden lg:block">
          {showShellHeader ? shellHeader : null}
          <main className="relative min-h-[100dvh]">
          <Views tab={tab} fitnessProps={fitnessProps} fuelTab={fuelTab} setFuelTab={setFuelTab} muscleLanguage={muscleLanguage} taxonomy={taxonomy}
          user={user} settingsProps={settingsProps} openSession={openSession} runtimeDate={runtimeDate} onRuntimeDateChange={setRuntimeDate} navigate={navigate} relaxTab={relaxTab} setRelaxTab={setRelaxTab} homeGate={homeGate} onHomeGateSelect={handleHomeGateSelect} onHomeGateDismiss={() => setHomeGate(null)} />
          {tab === 'home' && homeGate === 'hub' ? <HomeHubGate onSelect={navigate} onDismiss={() => setHomeGate(null)} runtimeDate={runtimeDate} openSession={openSession} /> : null}
          </main>
          </div>
          <MobileShell tab={tab} navigate={navigate} mobileLayout="classic" header={showShellHeader ? mobileShellHeader : null}>
          <Views tab={tab} fitnessProps={fitnessProps} fuelTab={fuelTab} setFuelTab={setFuelTab} muscleLanguage={muscleLanguage} taxonomy={taxonomy}
          user={user} settingsProps={settingsProps} openSession={openSession} compact runtimeDate={runtimeDate} onRuntimeDateChange={setRuntimeDate} navigate={navigate} relaxTab={relaxTab} setRelaxTab={setRelaxTab} homeGate={homeGate} onHomeGateSelect={handleHomeGateSelect} onHomeGateDismiss={() => setHomeGate(null)} />
          {tab === 'home' && homeGate === 'hub' ? <HomeHubGate onSelect={navigate} onDismiss={() => setHomeGate(null)} runtimeDate={runtimeDate} openSession={openSession} /> : null}
          </MobileShell>
          </>
        )}
        </div>
        </div>
        </ErrorBoundary>
      )
}
