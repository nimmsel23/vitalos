import { useCallback, useEffect, useRef, useState } from 'react'
import SkillsEmbed from '../../skills-app/embed.jsx'
import DesignSwitcher from '../../skills-app/designs/DesignSwitcher.jsx'
import { readDesign, saveDesign } from '../../skills-app/designs/index.js'
import { getUid } from '@db'
import { logWorkoutAsSession } from '../../fitness-app/src/lib/logExternalWorkout.js'
import ErrorBoundary from '../components/common/ErrorBoundary.jsx'

export default function SkillsApp({ user, route = '', onRouteChange, onNavigate }) {
  const uid = user?.uid || (() => { try { return getUid() } catch { return null } })()
  const published = route || ''
  const [design, setDesign] = useState(readDesign)
  // Shell-getriebene Routen nicht zurückspiegeln (Ping-Pong-Fix, wie FuelWrapper).
  const shellSyncTargetRef = useRef(null)
  const loggedRuns = useRef(new Set())

  useEffect(() => {
    shellSyncTargetRef.current = published
  }, [published])

  const handleRouteChange = useCallback((next) => {
    const normalized = next || ''
    if (shellSyncTargetRef.current === normalized) {
      shellSyncTargetRef.current = null
      return
    }
    shellSyncTargetRef.current = null
    if (normalized !== published) onRouteChange?.(normalized)
  }, [onRouteChange, published])

  // toHostWorkout setzt runId = sessionId. logWorkoutAsSession schreibt damit
  // genau ein Session-Dokument; Wiederholung überschreibt dasselbe.
  // Mit onWorkoutComplete senden die Designs kein skills:workout-completed mehr.
  const onWorkoutComplete = useCallback((workout) => {
    const runId = workout?.runId
    const runKey = runId ? `${workout.source || 'skills'}:${runId}` : ''
    if (runKey) {
      if (loggedRuns.current.has(runKey)) return
      loggedRuns.current.add(runKey)
    }
    logWorkoutAsSession(workout).catch((error) => {
      if (runKey) loggedRuns.current.delete(runKey)
      console.error('Skills-Workout konnte nicht ins Fitness-Session-Log geschrieben werden:', error)
    })
  }, [])

  function changeDesign(id) {
    saveDesign(id)
    setDesign(id)
    window.scrollTo(0, 0)
  }

  return (
    <ErrorBoundary>
      <SkillsScreen
        uid={uid}
        route={published}
        design={design}
        onRouteChange={handleRouteChange}
        onNavigate={onNavigate}
        onWorkoutComplete={onWorkoutComplete}
        onDesign={changeDesign}
      />
    </ErrorBoundary>
  )
}

function SkillsScreen({ uid, route, design, onRouteChange, onNavigate, onWorkoutComplete, onDesign }) {
  return (
    <main data-theme="skills" className="relative min-h-[100dvh] overflow-y-auto text-fit-ink">
      <SkillsEmbed
        uid={uid}
        embedded
        route={route}
        onRouteChange={onRouteChange}
        onNavigate={onNavigate}
        onWorkoutComplete={onWorkoutComplete}
        design={design}
      />
      <DesignSwitcher value={design} onChange={onDesign} />
    </main>
  )
}
