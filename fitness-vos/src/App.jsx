import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import Session from '@view/session'
import Learn   from '@view/learn'
import WeeklyReview from '@view/review'
import Settings from '@view/settings'
import Coach from '@view/coach'
import Inbox from '@fitness/views/Inbox/index.js'
import ExerciseInsightModal from '@fitness/components/ExerciseInsightModal.jsx'
import { isLocalMode, getAnatomy } from '@db'

import { NAV_ITEMS, VALID_TABS } from '@fitness/constants/NavigationItems.js'

import Sidebar from '@fitness/components/layout/Sidebar.jsx'
import MobileNav from '@fitness/components/layout/MobileNav.jsx'
import UserProfile from '@fitness/components/common/UserProfile.jsx'
import ErrorBoundary from '@fitness/components/common/ErrorBoundary.jsx'
import PwaUpdateBanner from '@fitness/components/common/PwaUpdateBanner.jsx'

import AppGate from '@fitness/views/AppGate.jsx'

import { useUser } from '@fitness/contexts/UserContext'
import { useSettings } from '@fitness/contexts/SettingsContext'
import { useSwipeNavigation } from '@fitness/hooks/useSwipeNavigation'

const SESSION_SUB_TABS = new Set(['today', 'plan', 'history'])
const REVIEW_SUB_TABS = new Set(['report', 'muscles'])
const LEARN_SUB_TABS = new Set(['exercises', 'anatomy', 'quiz'])

function parseHashRoute() {
  const rawHash = window.location.hash.replace(/^#\/?/, '')
  const [pathPart = ''] = rawHash.split('?')
  const [rawTab = '', rawSub = ''] = pathPart.split('/').filter(Boolean)
  const tab = VALID_TABS.has(rawTab) ? rawTab : 'session'
  let subTab = null

  if (tab === 'session') {
    subTab = SESSION_SUB_TABS.has(rawSub) ? rawSub : null
  } else if (tab === 'review') {
    subTab = REVIEW_SUB_TABS.has(rawSub) && rawSub !== 'report' ? rawSub : null
  } else if (tab === 'learn') {
    subTab = LEARN_SUB_TABS.has(rawSub) ? rawSub : null
  }

  return { tab, subTab }
}

function buildHashRoute({ tab, subTab }) {
  const segments = [tab]

  if (tab === 'session' && SESSION_SUB_TABS.has(subTab) && subTab !== 'today') {
    segments.push(subTab)
  } else if (tab === 'review' && REVIEW_SUB_TABS.has(subTab) && subTab !== 'report') {
    segments.push(subTab)
  } else if (tab === 'learn' && LEARN_SUB_TABS.has(subTab)) {
    segments.push(subTab)
  }

  return `#${segments.join('/')}`
}

export default function App() {
  const {
    user, authLoading,
    gender, split, cycleLength, defaultLocation,
    signIn, signInEmail, signUpEmail, signOut
  } = useUser();

  const {
    theme, setThemeState, themeMode, setModeState,
    circDark, setCircDark, circLight, setCircLight,
    layoutScale, setLayoutScale, recentDays, setRecentDays,
    coverageThreshold, setCoverageThreshold, showAdvanced, setShowAdvanced,
    sidebarPinned, setSidebarPinned,
    swipeEnabled, setSwipeEnabled, muscleLanguage, setMuscleLanguage,
    navMode, setNavMode
  } = useSettings();

  const initialRoute = parseHashRoute();
  const [tab, setTab] = useState(() => {
    const initialNavMode = localStorage.getItem('fitness-navMode') || 'tabs';
    if (!window.location.hash && initialNavMode === 'home') return 'gate';
    return initialRoute.tab;
  });
  const [subTab, setSubTab] = useState(() => initialRoute.subTab);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authRegistering, setAuthRegistering] = useState(false);

  const [sessionDate, setSessionDate]   = useState(null)
  const [sessionDraft, setSessionDraft] = useState(null)
  const [inspectorExercise, setInspectorExercise] = useState(null)
  const [taxonomy, setTaxonomy] = useState(null);

  const { mainRef, swipeHint, slideDirection, setSlideDirection } = useSwipeNavigation({
    navMode, tab, swipeEnabled, setTab, NAV_ITEMS
  });

  useEffect(() => {
    if (isLocalMode()) {
      fetch('http://localhost:9100/fitness/muscles')
        .then(r => r.json())
        .then(data => setTaxonomy(data?.muscles || null))
        .catch(() => {});
    }
  }, []);

  const navigateToTab = (newTabId) => {
    if (newTabId === tab) return;
    const oldIdx = NAV_ITEMS.findIndex(i => i.id === tab);
    const newIdx = NAV_ITEMS.findIndex(i => i.id === newTabId);
    if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
      setSlideDirection(newIdx > oldIdx ? 'left' : 'right');
    } else {
      setSlideDirection('bottom');
    }
    setSubTab(null);
    setTab(newTabId);
  };

  function navigate(id) { navigateToTab(id) }
  function navigateSub(id) { setSubTab(id) }

  useEffect(() => {
    if (tab === 'gate') return
    const targetHash = buildHashRoute({ tab, subTab })
    if (window.location.hash !== targetHash) {
      history.replaceState(null, '', targetHash)
    }
  }, [tab, subTab])

  useEffect(() => {
    const handleHashChange = () => {
      const route = parseHashRoute();
      if (route.tab === tab && route.subTab === subTab) return;
      navigateToTab(route.tab);
      setSubTab(route.subTab);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [tab, subTab]);

  function openSession(date, draft = null) {
    setSessionDate(date || null)
    setSessionDraft(draft || null)
    navigate('session')
  }

  async function inspectExercise(exercise) {
    if (!exercise) return
    setInspectorExercise(exercise)
    const id = exercise.exercise_id || exercise.id
    if (!id || exercise.lesson) return
    try {
      const lesson = await getAnatomy(id)
      if (lesson)
        setInspectorExercise(prev => prev ? { ...prev, lesson } : prev)
    } catch {}
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');
    try {
      if (authRegistering) await signUpEmail(authEmail, authPassword);
      else                 await signInEmail(authEmail, authPassword);
    } catch {
      setAuthError('Anmeldung fehlgeschlagen.');
    }
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-fit-bg">
      <div className="text-fit-dim text-xs font-black uppercase tracking-widest">…</div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-fit-bg text-fit-ink p-6">
      <div className="w-full max-w-sm card p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">VitalOS Fitness</h1>
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
        <div className="flex items-center gap-3"><div className="h-px bg-fit-line flex-1 opacity-50" /><span className="text-[9px] font-black uppercase text-fit-dim">oder</span><div className="h-px bg-fit-line flex-1 opacity-50" /></div>
        <button onClick={signIn} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform">Google Login</button>
        <button onClick={() => setAuthRegistering(!authRegistering)} className="w-full text-[10px] font-black text-fit-dim uppercase hover:text-fit-accent">
          {authRegistering ? 'Bereits einen Account? Anmelden' : 'Neu hier? Account erstellen'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <PwaUpdateBanner />
      <ErrorBoundary>
        <div className="app-shell isolate flex min-h-screen overflow-x-hidden w-full bg-fit-bg text-fit-ink font-sans transition-colors duration-500">

        <Sidebar
          tab={tab}
          navigate={navigate}
          subTab={subTab}
          navigateSub={navigateSub}
          navItems={NAV_ITEMS}
          pinned={sidebarPinned}
          setPinned={setSidebarPinned}
          user={user}
        >
          <UserProfile user={user} subtitle={isLocalMode() ? `${user?.email || 'localhost'} · localhost` : (user?.email || '')} />
          {!isLocalMode() && (
            <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-fit-red bg-fit-red/5 border border-fit-red/10 rounded-xl hover:bg-fit-red/10 transition-all">
              Logout
            </button>
          )}
          <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-fit-dim bg-fit-bg2 rounded-xl hover:bg-white/5 transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
        </Sidebar>

        <div className={`flex-1 min-w-0 transition-all duration-500 ease-in-out ${sidebarPinned ? 'lg:ml-[280px]' : 'lg:ml-24'}`}>
          <main ref={mainRef} className={`relative min-w-0 ${navMode === 'tabs' ? 'pb-28' : ''} sm:pb-10 lg:pb-16 min-h-[100dvh] overflow-x-hidden`}>
              {/* Background Gate - only mounted in home mode */}
              {navMode === 'home' && (
                <div className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] max-w-[1600px] mx-auto min-h-[100dvh] flex flex-col ${tab !== 'gate' ? 'scale-[0.98] opacity-30 blur-[2px] pointer-events-none' : 'scale-100 opacity-100'}`}>
                   <AppGate navigate={navigate} navItems={NAV_ITEMS} />
                </div>
              )}

              {/* Foreground Sheet (or normal Tab content) */}
              <div 
                className={`
                  ${navMode === 'home' ? 'fixed inset-0 z-30 overflow-x-hidden transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]' : 'p-4 sm:p-10 lg:p-16 max-w-[1600px] mx-auto'}
                  ${navMode === 'home' && tab === 'gate' ? 'translate-y-full pointer-events-none' : 'translate-y-0'}
                `}
              >
                <div className={`${navMode === 'home' ? 'alpha-glass h-full w-full overflow-y-auto overflow-x-hidden rounded-t-[40px] border-t border-[var(--line)]/30 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] relative pt-6 lg:m-4 lg:h-[calc(100dvh-2rem)] lg:rounded-[32px] lg:border lg:border-[var(--line)]/30 lg:shadow-[0_24px_80px_rgba(0,0,0,0.32)]' : ''}`}>
                  {/* Back-to-Gate handle (only in home mode, when not on gate) */}
                  {navMode === 'home' && tab !== 'gate' && (
                    <button
                      onClick={() => navigate('gate')}
                      aria-label="Zurück zum Menü"
                      className="sticky top-0 z-30 mx-auto flex w-full flex-col items-center gap-1 pt-2 pb-3 active:opacity-60 transition-opacity bg-gradient-to-b from-[color:var(--glass)] via-[color:var(--glass)] to-transparent backdrop-blur-md"
                    >
                      <div className="w-10 h-1.5 rounded-full bg-fit-line" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-fit-dim opacity-60">Menü</span>
                    </button>
                  )}
                  <div key={tab} className={`${navMode === 'home' && tab !== 'gate' ? 'p-4 pb-20 sm:p-10' : ''} animate-in fade-in ${slideDirection === 'left' ? 'slide-in-from-right-8' : slideDirection === 'right' ? 'slide-in-from-left-8' : 'slide-in-from-bottom-4'} duration-500`}>
                      {/* Render content */}
                      {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} onOpenSession={openSession} recentDays={recentDays} coverageThreshold={coverageThreshold} subTab={subTab} />}
                      {tab === 'review'   && <WeeklyReview onOpenSession={openSession} onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} gender={gender} recentDays={recentDays} subTab={subTab} onSubNav={navigateSub} />}
                      {tab === 'learn'    && <Learn subTab={subTab} />}
                      {tab === 'coach'    && (isLocalMode() || user?.email?.includes('alpha') || user?.uid === '59ole36uNpNwml5H6VDYCXyCME92') && <Coach onInspectExercise={inspectExercise} />}
                      {tab === 'inbox'    && <Inbox />}
                      {tab === 'settings' && <Settings />}
                  </div>
                </div>
              </div>
            </main>

            {navMode === 'tabs' && <MobileNav tab={tab} subTab={subTab} navigate={navigate} navigateSub={navigateSub} swipeHint={swipeHint} navItems={NAV_ITEMS} />}
          </div>
        </div>
      </ErrorBoundary>
      <ExerciseInsightModal exercise={inspectorExercise} onClose={() => setInspectorExercise(null)} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />
    </>
  );
}
