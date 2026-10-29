import { useState, useEffect, useCallback, useRef } from 'react'
import { RefreshCw, Zap } from 'lucide-react'
import { useEscapeKey } from './hooks/useEscapeKey.js'
import { watchAuth, signIn, signInEmail, signUpEmail, signOut, isLocalMode, auth, getUserProfile, registerShellDevice } from '@db'
import { NAV_ITEMS, VALID_TABS, SUB_NAV } from './shell/NavigationItems.js'
import Sidebar from './shell/layout/Sidebar.jsx'
import MobileShell from './shell/layout/MobileShell.jsx'
import KeyboardHelp from './shell/KeyboardHelp.jsx'
import { handleNavigationKeys, isEditing } from './shell/keyboard.js'
import UserProfile from './components/common/UserProfile.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { useApp as useFuelAppStore, useSettings as useFuelStore } from '@fuel/store.js'
import ShellHeader from './shell/ShellHeader.jsx'
import { useShellSettings } from './shell/store.js'
import ShellAppRouter from './shell/ShellAppRouter.jsx'
import { HomeHubGate } from './shell/HomeGates.jsx'
import { localISO } from './shell/runtimeDate.js'

const DAY_START = 8
const DAY_END   = 20

function localToday() {
  return localISO()
}

const DATE_LIKE = /^\d{4}-\d{2}-\d{2}$/
const FITNESS_DIRECT_ROUTES = new Set([
  'today', 'session', 'timer', 'plan', 'history',
  'review', 'report', 'muscles', 'readiness', 'strength', 'verlauf',
  'learn', 'exercises', 'anatomy', 'quiz',
  'inbox',
])
const FUEL_DIRECT_ROUTES = new Set(['log', 'food', 'supplements', 'micros'])
const RELAX_DIRECT_ROUTES = new Set(['dash', 'stats', 'physio', 'catalog'])
const FITNESS_DATE_ROUTES = new Set(['session'])

function resolveHashDate(value) {
  if (value === 'today') return localToday()
  if (!DATE_LIKE.test(value || '')) return null
  const date = new Date(`${value}T12:00:00`)
  return localISO(date) === value ? value : null
}

function readHashState() {
  const raw = window.location.hash.replace(/^#\/?/, '')
  if (!raw) return { tab: 'home', subTab: 'hub', date: null }
  const [mainTab = 'home', second = null, third = null] = raw.split('/')
  const subTab = second && !DATE_LIKE.test(second) && second !== 'today' ? second : null
  const date = resolveHashDate(second) || resolveHashDate(third)

  if (FITNESS_DIRECT_ROUTES.has(mainTab)) {
    return {
      tab: 'fitness',
      subTab: mainTab === 'session' && !second ? 'session' : mainTab,
      date: mainTab === 'session' || mainTab === 'today' ? (date || localToday()) : date,
    }
  }

  if (FUEL_DIRECT_ROUTES.has(mainTab)) {
    return { tab: 'fuel', subTab: mainTab, date: date || null }
  }

  if (RELAX_DIRECT_ROUTES.has(mainTab)) {
    return { tab: 'relax', subTab: mainTab, date: date || null }
  }

  if (mainTab === 'game' && second === 'door') return { tab: 'game', subTab: third ? `door/${third}` : 'door/potential', date: null }

  const fitnessSessionDate = mainTab === 'fitness' && subTab === 'session' ? (date || localToday()) : date
  if (mainTab === 'hub') return { tab: 'home', subTab: 'hub', date: null }
  if (mainTab === 'dashboard') return { tab: 'home', subTab: null }
  if (mainTab === 'learn') return { tab: 'fitness', subTab: 'learn' }
  if (mainTab === 'journal') return { tab: 'home', subTab: null, date: date || null }
  if (mainTab === 'fitness' && subTab === 'settings') return { tab: 'settings', subTab: null }
  if (mainTab === 'fuel' && subTab === 'journal') return { tab: 'home', subTab: null, date: date || null }
  if (mainTab === 'fuel' && subTab === 'habits') return { tab: 'habits', subTab: null }
  if (mainTab === 'fuel' && subTab === 'settings') return { tab: 'settings', subTab: null }
  return {
    tab: VALID_TABS.has(mainTab) ? mainTab : 'hub',
    subTab: subTab || null,
    date: fitnessSessionDate || null,
  }
}

function buildHashState({ tab, subTab = null, date = null }) {
  if (tab === 'fitness' && subTab) {
    const parts = [subTab]
    if (FITNESS_DATE_ROUTES.has(subTab) && date) parts.push(date)
    return `#${parts.join('/')}`
  }
  if (tab === 'fuel' && subTab) {
    const parts = [subTab]
    if (date) parts.push(date === localToday() ? 'today' : date)
    return `#${parts.join('/')}`
  }
  if (tab === 'relax' && subTab && RELAX_DIRECT_ROUTES.has(subTab)) {
    const parts = [subTab]
    if (date) parts.push(date)
    return `#${parts.join('/')}`
  }
  if (tab === 'home' && !subTab) {
    const parts = ['journal']
    if (date) parts.push(date)
    return `#${parts.join('/')}`
  }
  const parts = [tab]
  if (subTab) parts.push(subTab)
  if (date) parts.push(date)
  return `#${parts.join('/')}`
}

export default function App() {
  const initialHashState = readHashState()
  const [isDesktopViewport, setIsDesktopViewport] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(min-width: 1024px)').matches
  })
  const [tab, setTab] = useState(() => initialHashState.tab)
  const [fitnessTab, setFitnessTab] = useState(() => {
    const { tab: hashTab, subTab } = initialHashState
    return hashTab === 'fitness' ? (subTab || null) : null
  })
  const [fuelTab, setFuelTab] = useState(() => {
    const { tab: hashTab, subTab } = initialHashState
    return hashTab === 'fuel' && subTab ? subTab : 'food'
  })
  const [homeGate, setHomeGate] = useState(() => {
    const { tab: hashTab, subTab } = initialHashState
    return hashTab === 'home' ? (subTab || null) : null
  })
  const [relaxTab, setRelaxTab] = useState(() => {
    const { tab: hashTab, subTab } = initialHashState
    return hashTab === 'relax' && subTab ? subTab : 'dash'
  })
  const [doorTab, setDoorTab] = useState(() => {
    const { tab: hashTab, subTab } = initialHashState
    return hashTab === 'door' && subTab ? subTab : 'potential'
  })
  const [gameTab, setGameTab] = useState(() => {
    const { tab: hashTab, subTab } = initialHashState
    return hashTab === 'game' && subTab ? subTab : 'fire'
  })
  const [sessionDate,   setSessionDate]   = useState(() => (
    initialHashState.tab === 'fitness' && initialHashState.subTab === 'session'
      ? initialHashState.date
      : null
  ))
  const [sessionDraft,  setSessionDraft]  = useState(null)

  function openSession(date, draft = null) {
    setSessionDate(date || null)
    setSessionDraft(draft || null)
    setFitnessTab('session')
    setTab('fitness')
  }

  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false)
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

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const media = window.matchMedia('(min-width: 1024px)')
    const syncViewport = () => setIsDesktopViewport(media.matches)
    syncViewport()
    media.addEventListener('change', syncViewport)
    return () => media.removeEventListener('change', syncViewport)
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
  const previousRuntimeDateRef = useRef(runtimeDate)
  const previousFuelActiveDateRef = useRef(fuelActiveDate)
  const previousTabRef = useRef(null)
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
    const runtimeDateChanged = runtimeDate !== previousRuntimeDateRef.current
    const fuelDateChanged = fuelActiveDate !== previousFuelActiveDateRef.current
    const enteredFuel = previousTabRef.current !== tab && tab === 'fuel'
    previousRuntimeDateRef.current = runtimeDate
    previousFuelActiveDateRef.current = fuelActiveDate
    previousTabRef.current = tab

    if (tab !== 'fuel' || !runtimeDate || fuelActiveDate === runtimeDate) return
    if (runtimeDateChanged || (enteredFuel && !fuelDateChanged)) {
      setFuelActiveDate(runtimeDate)
    } else if (fuelDateChanged) {
      setRuntimeDate(fuelActiveDate)
    }
  }, [tab, fuelActiveDate, runtimeDate, setFuelActiveDate, setRuntimeDate])

  // User-Settings global: vitalos-Profil (Alter/Geschlecht) in den Fuel-Store spiegeln,
  // damit z. B. DACH-Referenzwerte im Mikros-Tab dieselben Werte nutzen — unabhängig
  // davon, ob der Setup-Tab je geöffnet wurde.
  // Cloud-Hydration: Firestore-Profil (users/{uid}) nach Login in den
  // Shell-Store übernehmen — SSOT bleibt der Store, Firestore ist Backup/Sync.
  useEffect(() => {
    if (!user?.uid || isLocalMode()) return
    registerShellDevice()
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

  // Einmalige Migration auf das neue Default-Theme (Redesign 2026-10):
  // wer noch auf dem alten Default "nordic" steht (bzw. nie gewählt hat),
  // bekommt "vital". Bewusst gewählte andere Themes bleiben unangetastet.
  useEffect(() => {
    try {
      if (localStorage.getItem('vitalos-redesign-2026-10')) return
      localStorage.setItem('vitalos-redesign-2026-10', '1')
      const s = useShellSettings.getState()
      if (s.theme === 'nordic') s.setTheme('vital')
      if (s.circDark === 'nordic') s.setCircDark('vital')
      if (s.circLight === 'honey') s.setCircLight('vital-light')
    } catch {}
  }, [])

  useEffect(() => {
    if (themeMode === 'manual') {
      document.documentElement.setAttribute('data-theme', theme)
    } else {
      const hour = new Date().getHours()
      document.documentElement.setAttribute('data-theme', (hour >= DAY_START && hour < DAY_END) ? circLight : circDark)
    }
    // iOS-Statusleiste/Browser-Chrome an den Theme-Hintergrund angleichen
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    const meta = document.querySelector('meta[name="theme-color"]')
    if (bg && meta) meta.setAttribute('content', bg)
  }, [theme, themeMode, circLight, circDark])

  useEffect(() => {
    const { tab: hashTab, date } = readHashState()
    if ((hashTab === 'home' || hashTab === 'fuel' || hashTab === 'journal' || hashTab === 'habits' || hashTab === 'relax') && date && date !== runtimeDate) {
      setRuntimeDate(date)
    }
    if (hashTab === 'fitness' && readHashState().subTab === 'session' && date) {
      if (date !== runtimeDate) setRuntimeDate(date)
      setSessionDate(date)
    }
  }, [])

  useEffect(() => {
    // Apply a deep-link date before replacing it with the persisted shell date.
    if (initialHashState.date && initialHashState.date !== runtimeDate) return
    const nextHash = tab === 'fitness'
      ? buildHashState({ tab, subTab: fitnessTab, date: fitnessTab === 'session' ? (sessionDate || runtimeDate) : null })
      : tab === 'home'
        ? buildHashState({ tab, subTab: homeGate, date: homeGate ? null : runtimeDate })
      : tab === 'fuel'
        ? buildHashState({ tab, subTab: fuelTab || 'food', date: runtimeDate })
      : tab === 'relax'
        ? buildHashState({ tab, subTab: relaxTab || 'dash', date: runtimeDate })
      : tab === 'door'
        ? buildHashState({ tab, subTab: doorTab || 'potential' })
      : tab === 'game'
        ? buildHashState({ tab, subTab: gameTab || 'fire' })
      : tab === 'journal' || tab === 'habits'
        ? buildHashState({ tab, date: runtimeDate })
        : buildHashState({ tab })
    if (window.location.hash !== nextHash) history.pushState(null, '', nextHash)
  }, [tab, fitnessTab, homeGate, fuelTab, relaxTab, doorTab, gameTab, runtimeDate, sessionDate])

  useEffect(() => {
    function syncFromLocation() {
      const { tab: nextTab, subTab, date } = readHashState()
      setTab(nextTab)
      if (nextTab === 'home') setHomeGate(subTab || null)
      if (nextTab === 'home' && date) setRuntimeDate(date)
      if (nextTab === 'fitness') setFitnessTab(subTab || null)
      if (nextTab === 'fitness' && date) setRuntimeDate(date)
      if (nextTab === 'fitness' && subTab === 'session') {
        setSessionDate(date || runtimeDate)
      }
      if (nextTab === 'fuel' && subTab) setFuelTab(subTab)
      if (nextTab === 'fuel' && date) setRuntimeDate(date)
      if ((nextTab === 'journal' || nextTab === 'habits' || nextTab === 'relax') && date) setRuntimeDate(date)
      if (nextTab === 'relax') setRelaxTab(subTab || 'dash')
      if (nextTab === 'door') setDoorTab(subTab || 'potential')
      if (nextTab === 'game') setGameTab(subTab || 'fire')
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
    if (tab === 'home' && homeGate === 'hub' && id === 'fitness' && !subTab) {
      setHomeGate('fitness')
      setTab('home')
      return
    }
    if (id === 'fitness' && !subTab && runtimeDate) {
      setHomeGate(null)
      openSession(runtimeDate)
      return
    }
    if (!VALID_TABS.has(id)) return
    if (id === 'home' && tab === 'home') {
      setHomeGate(subTab || null)
      return
    }
    if (id === tab && subTab == null) return
    if (id === 'home') {
      setHomeGate(subTab || null)
    } else if (tab === 'home' && homeGate === 'hub') {
      setHomeGate(null)
    } else if (tab !== 'home') {
      setHomeGate(null)
    }
    if (id === 'fitness') {
      setFitnessTab(subTab || fitnessTab || null)
    }
    if (id === 'fuel') {
      setFuelTab(subTab || fuelTab || 'food')
    }
    if (id === 'relax') {
      setRelaxTab(subTab || relaxTab || 'dash')
    }
    setTab(id)
  }

  function handleHomeGateSelect(id) {
    setHomeGate(null)
    setFitnessTab(id)
    setTab('fitness')
  }

  function navigateToDomainDate(id, date) {
    if (date && date !== runtimeDate) setRuntimeDate(date)
    if (id === 'fitness') {
      setHomeGate(null)
      openSession(date || runtimeDate)
      return
    }
    if (id === 'journal') {
      setHomeGate(null)
      setTab('home')
      return
    }
    if (id === 'habits') {
      setHomeGate(null)
      setTab('habits')
      return
    }
    if (id === 'door') {
      setHomeGate(null)
      setDoorTab(subTab || doorTab || 'potential')
      setTab('door')
      return
    }
    if (id === 'game') {
      setHomeGate(null)
      setGameTab(subTab || gameTab || 'fire')
      setTab('game')
      return
    }
    if (id === 'fuel') {
      setHomeGate(null)
      setFuelTab(fuelTab || 'food')
      setTab('fuel')
    }
  }

  // ── Tastatur-Navigation ───────────────────────────────────────────────
  // Nachgezogen aus fitness-app (fitness-dev 3d501d2). Die Shell mountet
  // fitness-apps App.jsx nie, also griff dort nichts davon.
  //
  // ESC-Prinzip: die jeweils oberste offene Ebene schließen. Die Ebenen
  // besitzen ihr ESC-Handling selbst und liegen von innen nach außen:
  //   1. Session-lokale Modals (@view/session, setzt
  //      document.body.dataset.sessionModalOpen) — eigener Handler
  //   2. ExerciseInsightModal + Fitness-Menü-Sheet — in FitnessApp.jsx
  //   3. Home-Gate (Hub-/Fitness-Kacheln über dem Journal) — hier
  // Jede Ebene bricht ab (return), wenn eine tiefere noch offen ist, damit
  // ein ESC-Druck nur genau eine Ebene schließt.
  const handleShellEscape = useCallback(() => {
    if (document.querySelector('dialog[open], [data-shell-nav-dialog]')) return
    if (typeof document !== 'undefined' && document.body.dataset.sessionModalOpen) return
    // Fitness kümmert sich selbst um Inspector + Trainings-Sheet
    if (tab === 'fitness' && fitnessTab && fitnessTab !== 'gate') return
    if (homeGate) setHomeGate(null)
  }, [homeGate, tab, fitnessTab])
  useEscapeKey(handleShellEscape, true)

  useEffect(() => {
    function handleKeyDown(event) {
      if (authLoading || (!user && !isLocalMode()) || event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || isEditing(event.target)) return
      if (document.querySelector('dialog[open]')) return
      if (event.key === '?' && !event.altKey) {
        event.preventDefault()
        setKeyboardHelpOpen(true)
        return
      }
      if (!event.altKey || event.shiftKey || document.querySelector('[aria-modal="true"], [data-shell-overlay], [data-shell-nav-dialog]') || document.body.dataset.sessionModalOpen) return
      const digit = event.code?.match(/^Digit([0-7])$/)?.[1] || (/^[0-7]$/.test(event.key) ? event.key : null)
      if (digit !== null) {
        event.preventDefault()
        navigate(digit === '0' ? 'hub' : NAV_ITEMS[Number(digit) - 1].id)
        return
      }
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      const cycle = NAV_ITEMS.map(i => i.id)
      const currentIdx = cycle.indexOf(tab)
      if (currentIdx === -1) return
      event.preventDefault()
      const delta = event.key === 'ArrowRight' ? 1 : -1
      const nextIdx = (currentIdx + delta + cycle.length) % cycle.length
      navigate(cycle[nextIdx])
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tab, homeGate, authLoading, user, navigate])

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
      <div
        className="flex min-h-[100dvh] items-center justify-center bg-fit-bg px-5 text-fit-ink"
        style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}
      >
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px]" style={{ background: 'var(--accent)' }}>
              <Zap size={30} strokeWidth={2.2} color="#0b0e14" />
            </div>
            <h1 className="text-[28px] font-bold tracking-tight">VitalOS</h1>
            <p className="mt-1 text-[15px] text-fit-dim">{authRegistering ? 'Neuen Account erstellen' : 'Willkommen zurück'}</p>
          </div>
          <form onSubmit={handleAuthSubmit} className="space-y-3">
            <input type="email" autoComplete="email" placeholder="E-Mail" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required className="vos-surface h-12 w-full rounded-[14px] px-4 text-[16px] text-fit-ink outline-none transition focus:border-fit-accent" />
            <input type="password" autoComplete={authRegistering ? 'new-password' : 'current-password'} placeholder="Passwort" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required className="vos-surface h-12 w-full rounded-[14px] px-4 text-[16px] text-fit-ink outline-none transition focus:border-fit-accent" />
            {authError && <p className="text-center text-[13px] text-fit-red">{authError}</p>}
            <button type="submit" className="vos-press h-12 w-full rounded-[14px] text-[16px] font-semibold" style={{ background: 'var(--accent)', color: '#0b0e14' }}>
              {authRegistering ? 'Account erstellen' : 'Anmelden'}
            </button>
          </form>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'color-mix(in srgb, var(--ink) 12%, transparent)' }} />
            <span className="text-[12px] text-fit-dim">oder</span>
            <div className="h-px flex-1" style={{ background: 'color-mix(in srgb, var(--ink) 12%, transparent)' }} />
          </div>
          <button onClick={signIn} className="vos-press h-12 w-full rounded-[14px] bg-white text-[16px] font-semibold text-black">
            Mit Google anmelden
          </button>
          <button onClick={() => setAuthRegistering(!authRegistering)} className="mt-5 w-full text-[14px] text-fit-dim hover:text-fit-accent">
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
            : tab === 'door'
              ? doorTab
            : tab === 'game'
              ? gameTab
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
            : tab === 'door'
              ? SUB_NAV.door
            : tab === 'game'
              ? SUB_NAV.game
            : null
      const shellSubTabSetter = tab === 'fitness'
        ? setFitnessTab
        : tab === 'fuel'
          ? setFuelTab
          : tab === 'relax'
            ? setRelaxTab
            : tab === 'door'
              ? setDoorTab
            : tab === 'game'
              ? setGameTab
            : null
      const shellHeader = <ShellHeader tab={tab} subTab={shellSubTab} runtimeDate={runtimeDate} setRuntimeDate={setRuntimeDate} subNav={shellSubNav} onSubTab={shellSubTabSetter} onNavigateDomain={navigateToDomainDate} />
      const mobileShellHeader = <ShellHeader tab={tab} subTab={shellSubTab} runtimeDate={runtimeDate} setRuntimeDate={setRuntimeDate} compact subNav={shellSubNav} onSubTab={shellSubTabSetter} onNavigateDomain={navigateToDomainDate} />
      const shellViews = <ShellAppRouter tab={tab} fitnessProps={fitnessProps} fuelTab={fuelTab} setFuelTab={setFuelTab} muscleLanguage={muscleLanguage} taxonomy={taxonomy}
      user={user} settingsProps={settingsProps} openSession={openSession} runtimeDate={runtimeDate} onRuntimeDateChange={setRuntimeDate} navigate={navigate} relaxTab={relaxTab} setRelaxTab={setRelaxTab} doorTab={doorTab} setDoorTab={setDoorTab} gameTab={gameTab} setGameTab={setGameTab} homeGate={homeGate} onHomeGateSelect={handleHomeGateSelect} onHomeGateDismiss={() => setHomeGate(null)} />
      const compactShellViews = <ShellAppRouter tab={tab} fitnessProps={fitnessProps} fuelTab={fuelTab} setFuelTab={setFuelTab} muscleLanguage={muscleLanguage} taxonomy={taxonomy}
      user={user} settingsProps={settingsProps} openSession={openSession} compact runtimeDate={runtimeDate} onRuntimeDateChange={setRuntimeDate} navigate={navigate} relaxTab={relaxTab} setRelaxTab={setRelaxTab} doorTab={doorTab} setDoorTab={setDoorTab} gameTab={gameTab} setGameTab={setGameTab} homeGate={homeGate} onHomeGateSelect={handleHomeGateSelect} onHomeGateDismiss={() => setHomeGate(null)} />
      const hubGate = tab === 'home' && homeGate === 'hub'
        ? <HomeHubGate onSelect={navigate} onDismiss={() => setHomeGate(null)} runtimeDate={runtimeDate} openSession={openSession} />
        : null

      return (
        <ErrorBoundary>
        {/* HIER ist die app-shell Klasse wieder an Ort und Stelle */}
        <div className="app-shell flex min-h-screen overflow-x-clip w-full bg-fit-bg text-fit-ink font-sans transition-colors duration-500" onKeyDown={handleNavigationKeys}>
        <a href="#vos-shell-content" className="vos-skip-link vos-surface rounded-xl px-4 py-3" onClick={(event) => {
          event.preventDefault()
          document.getElementById('vos-shell-content')?.focus()
        }}>Zum Inhalt springen</a>
        {showSidebar && (
        <Sidebar tab={tab} navigate={navigate} pinned={sidebarPinned} setPinned={setSidebarPinned} user={user} onKeyboardHelp={() => setKeyboardHelpOpen(true)}
        subNav={tab === 'fitness' ? SUB_NAV.fitness : tab === 'fuel' ? SUB_NAV.fuel : tab === 'relax' ? SUB_NAV.relax : tab === 'door' ? SUB_NAV.door : tab === 'game' ? SUB_NAV.game : null}
        subTab={tab === 'fitness' ? fitnessTab : tab === 'fuel' ? fuelTab : tab === 'relax' ? relaxTab : tab === 'door' ? doorTab : tab === 'game' ? gameTab : null}
        onSubTab={tab === 'fitness' ? setFitnessTab : tab === 'fuel' ? setFuelTab : tab === 'relax' ? setRelaxTab : tab === 'door' ? setDoorTab : tab === 'game' ? setGameTab : null}>
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
        {isDesktopViewport ? (
          <>
          {showShellHeader ? shellHeader : null}
          <main id="vos-shell-content" tabIndex={-1} className="relative min-h-[100dvh]">
          {shellViews}
          {hubGate}
          </main>
          </>
        ) : mobileLayout === 'fuel' ? (
          <>
          {/* Mobile: Fuel-Layout */}
          <MobileShell
            tab={tab}
            navigate={navigate}
            mobileLayout="fuel"
            onKeyboardHelp={() => setKeyboardHelpOpen(true)}
            header={showShellHeader ? mobileShellHeader : null}
            subNav={shellSubNav}
            subTab={shellSubTab}
            onSubTab={shellSubTabSetter}
          >
          {compactShellViews}
          {hubGate}
          </MobileShell>
          </>
        ) : (
          <>
          <MobileShell
            tab={tab}
            navigate={navigate}
            mobileLayout="classic"
            onKeyboardHelp={() => setKeyboardHelpOpen(true)}
            homeGate={homeGate}
            header={showShellHeader ? mobileShellHeader : null}
            subNav={shellSubNav}
            subTab={shellSubTab}
            onSubTab={shellSubTabSetter}
          >
          {compactShellViews}
          {hubGate}
          </MobileShell>
          </>
        )}
        </div>
        <KeyboardHelp open={keyboardHelpOpen} onClose={() => setKeyboardHelpOpen(false)} />
        </div>
        </ErrorBoundary>
      )
}
