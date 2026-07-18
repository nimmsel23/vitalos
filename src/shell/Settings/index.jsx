import { useState, useEffect } from "react";
import { api, isLocalMode } from "@db";
import { useShellSettings } from "../store.js";
import { THEMES } from "../themes.js";
import AppearanceSection from "./AppearanceSection";
import AdvancedSection from "./AdvancedSection";
import LocalDevSection from "./LocalDevSection";
import AccountSection from "./AccountSection";
import ProfileSection from "./ProfileSection";
import NotificationsSection from "./NotificationsSection";
// Domain-Sektionen — fertig aus den Sub-Repos importiert (kein Doppel-Code)
import TrainingSection from "@fitness/src/views/Settings/TrainingSection.jsx";
import FuelGoalsSection from "@fuel/views/Settings/GoalsSection.jsx";

export default function Settings({ user, signOut }) {
  // Alle User-Settings kommen aus dem Shell-Store (SSOT) statt per Prop-Drilling.
  const {
    layoutScale, setLayoutScale,
    gender, setGender,
    anatomyModel, setAnatomyModel,
    age, setAge,
    heightCm, setHeightCm,
    weightKg, setWeightKg,
    split, setSplit,
    cycleLength, setCycleLength,
    defaultLocation, setDefaultLocation,
    recentDays, setRecentDays,
    coverageThreshold, setCoverageThreshold,
    showAdvanced, setShowAdvanced,
    dashboardHighlighter, setDashboardHighlighter,
    themeMode, setModeState, circLight, setCircLight, circDark, setCircDark,
    theme, setThemeState,
    sidebarPinned, setSidebarPinned,
    muscleLanguage, setMuscleLanguage,
    swipeEnabled, setSwipeEnabled,
    mobileLayout, setMobileLayout,
  } = useShellSettings()
  const themes = THEMES
  const navMode = 'tabs', setNavMode = () => {}
  const [health, setHealth] = useState(null)
  const [wger, setWger] = useState(null)
  const [firestoreStatus, setFirestoreStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [swVersion, setSwVersion] = useState(null)
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false)
  const [swChecking, setSwChecking] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const sw = navigator.serviceWorker
    const askVersion = () => { if (sw.controller) sw.controller.postMessage({ type: 'GET_VERSION' }) }
    const onMsg = (e) => { if (e.data?.type === 'VERSION') setSwVersion(e.data.version) }
    sw.addEventListener('message', onMsg)
    sw.addEventListener('controllerchange', askVersion)
    askVersion()
    
    // Fallback: check again after a short delay just in case
    setTimeout(askVersion, 1000)

    const reg = window.__swRegistration
    if (reg?.waiting) setSwUpdateAvailable(true)
    const onUpdate = () => setSwUpdateAvailable(true)
    window.addEventListener('sw-update-available', onUpdate)
    return () => {
      sw.removeEventListener('message', onMsg)
      sw.removeEventListener('controllerchange', askVersion)
      window.removeEventListener('sw-update-available', onUpdate)
    }
  }, [])

  async function handleSwCheck() {
    setSwChecking(true)
    try {
      const reg = window.__swRegistration || await navigator.serviceWorker?.getRegistration()
      if (reg) await reg.update()
      if (reg?.waiting) setSwUpdateAvailable(true)
    } catch {}
    setTimeout(() => setSwChecking(false), 600)
  }

  function handleSwApply() {
    const reg = window.__swRegistration
    if (reg?.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    else window.location.reload()
  }

  useEffect(() => {
    if (!isLocalMode() || !api) return;
    let alive = true;
    api.get('/health').then(d => alive && setHealth(d)).catch(() => alive && setHealth({ ok: false }))
    fetch('http://localhost:8000/api/v2/language/?format=json')
      .then(r => alive && setWger(r.ok))
      .catch(() => alive && setWger(false))
    api.get('/firestore/status').then(d => alive && setFirestoreStatus(d)).catch(() => alive && setFirestoreStatus({ ok: false }))
    return () => { alive = false }
  }, [])

  async function handleSync() {
    setSyncing(true)
    try {
      await api.post('/firestore/sync', {})
      const s = await api.get('/firestore/status')
      setFirestoreStatus(s)
    } catch {
      setFirestoreStatus({ ok: false })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto">
       <header className="mb-4 animate-in fade-in duration-700">
          <h2 className="text-3xl font-black text-fit-ink">Settings</h2>
          <p className="text-sm font-medium opacity-40">VitalOS — Fitness, Ernährung, Entspannung</p>
       </header>

       <AccountSection user={user} signOut={signOut} />

       <ProfileSection
         gender={gender} setGender={setGender}
         age={age} setAge={setAge}
         heightCm={heightCm} setHeightCm={setHeightCm}
         weightKg={weightKg} setWeightKg={setWeightKg}
       />

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AppearanceSection
            themeMode={themeMode} setModeState={setModeState}
            circLight={circLight} setCircLight={setCircLight}
            circDark={circDark} setCircDark={setCircDark}
            themes={themes} theme={theme} setThemeState={setThemeState}
          />
          <TrainingSection
            split={split} setSplit={setSplit}
            gender={anatomyModel} setGender={setAnatomyModel}
            defaultLocation={defaultLocation} setDefaultLocation={setDefaultLocation}
            cycleLength={cycleLength} setCycleLength={setCycleLength}
            recentDays={recentDays} setRecentDays={setRecentDays}
            coverageThreshold={coverageThreshold} setCoverageThreshold={setCoverageThreshold}
            swVersion={swVersion} swUpdateAvailable={swUpdateAvailable} swChecking={swChecking}
            onSwCheck={handleSwCheck} onSwApply={handleSwApply}
          />
          <FuelGoalsSection className="card p-8 space-y-4 border-t-4 border-t-orange-400 text-fit-ink" />
          {!isLocalMode() && <NotificationsSection user={user} />}
       </div>

       {isLocalMode() && (
         <LocalDevSection
           firestoreStatus={firestoreStatus}
           syncing={syncing} onSync={handleSync}
           health={health} wger={wger}
         />
       )}

       <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2 rounded-xl border transition-all font-black text-[9px] uppercase tracking-widest ${showAdvanced ? 'border-fit-accent bg-fit-accent/5 text-fit-accent' : 'border-fit-line bg-fit-bg2 text-fit-dim hover:text-fit-ink'}`}
          >
             {showAdvanced ? 'Advanced Mode: Ein' : 'Advanced Mode: Aus'}
          </button>
       </div>

       {showAdvanced && (
         <AdvancedSection
           swipeEnabled={swipeEnabled} setSwipeEnabled={setSwipeEnabled}
           dashboardHighlighter={dashboardHighlighter} setDashboardHighlighter={setDashboardHighlighter}
           mobileLayout={mobileLayout} setMobileLayout={setMobileLayout}
           navMode={navMode} setNavMode={setNavMode}
           sidebarPinned={sidebarPinned} setSidebarPinned={setSidebarPinned}
           layoutScale={layoutScale} setLayoutScale={setLayoutScale}
           muscleLanguage={muscleLanguage} setMuscleLanguage={setMuscleLanguage}
           user={user}
         />
       )}
    </div>
  );
}
