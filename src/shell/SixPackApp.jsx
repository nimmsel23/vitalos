import { useCallback, useEffect, useRef, useState } from 'react'
import SixPackEmbed from '../../6pack-app/embed.jsx'
import { enableSixpackPush } from '../../6pack-app/push.js'
import { app as firebaseApp, auth, db } from '@cloud/firebase.js'
import { getUid, getSixpackProgram, saveSixpackProgram } from '@db'
import { getAllCoachingNotes } from '../../fitness-app/src/lib/coachNotes.js'
import { logWorkoutAsSession } from '../../fitness-app/src/lib/logExternalWorkout.js'
import ErrorBoundary from '../components/common/ErrorBoundary.jsx'
import '../../6pack-app/sixpack.css'

// Shell-eigener Scope, getrennt vom Vite-SW. Die Datei kommt aus
// 6pack-app/public/sixpack-messaging-sw.js (Vite-Plugin in vite.config.js).
const SIXPACK_PUSH_SW_URL = '/sixpack-messaging-sw.js'
const SIXPACK_PUSH_SW_SCOPE = '/sixpack-push/'

const loadProgram = () => getSixpackProgram()
const saveProgram = (_uid, program) => saveSixpackProgram(program)

export default function SixPackApp({ user, onNavigate, route = '', onRouteChange }) {
  const uid = user?.uid || (() => { try { return getUid() } catch { return null } })()
  const published = route || ''
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

  // buildWorkoutDoc legt die Session unter source-runId ab. Dieselbe runId
  // überschreibt dasselbe Dokument; der Set fängt den Doppel-Callback ab.
  const onWorkoutComplete = useCallback((workout) => {
    const runId = workout?.runId
    const runKey = runId ? `${workout.source || 'sixpack'}:${runId}` : ''
    if (runKey) {
      if (loggedRuns.current.has(runKey)) return
      loggedRuns.current.add(runKey)
    }
    logWorkoutAsSession(workout).catch((error) => {
      if (runKey) loggedRuns.current.delete(runKey)
      console.error('6Pack-Workout konnte nicht ins Session-Log geschrieben werden:', error)
    })
  }, [])

  const enablePush = useCallback((id) => enableSixpackPush(id, {
    firebaseApp,
    db,
    auth,
    serviceWorkerUrl: SIXPACK_PUSH_SW_URL,
    serviceWorkerScope: SIXPACK_PUSH_SW_SCOPE,
  }), [])

  return (
    <ErrorBoundary>
      <SixPackScreen
        uid={uid}
        route={published}
        onRouteChange={handleRouteChange}
        onNavigate={onNavigate}
        onWorkoutComplete={onWorkoutComplete}
        enablePush={enablePush}
      />
    </ErrorBoundary>
  )
}

// 6Packs Home teilt die Höhe 50/50 (flex-1 basis-0). Ohne feste Höhe fällt das
// Menü (Eat, Track, …) auf 0px, sobald der Shell-Header Platz wegnimmt.
function useViewportRemainder() {
  const ref = useRef(null)
  const [height, setHeight] = useState('100dvh')
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const measure = () => {
      const top = Math.max(0, el.getBoundingClientRect().top)
      setHeight(`calc(100dvh - ${top}px)`)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return [ref, height]
}

function SixPackScreen({ uid, route, onRouteChange, onNavigate, onWorkoutComplete, enablePush }) {
  const [frameRef, height] = useViewportRemainder()
  return (
    // Theme nur hier scoped — das Embed schreibt documentElement in der Shell nicht.
    <div ref={frameRef} data-theme="sixpack" className="overflow-hidden bg-[var(--bg)] text-[var(--ink)]" style={{ height }}>
      <div className="mx-auto h-full max-w-xl px-4 py-4 [&>section]:h-full">
        <SixPackEmbed
          key={uid || 'anonymous'}
          uid={uid}
          embedded
          route={route}
          onRouteChange={onRouteChange}
          onNavigate={onNavigate}
          onWorkoutComplete={onWorkoutComplete}
          loadRemoteProgram={loadProgram}
          saveRemoteProgram={saveProgram}
          firebaseApp={firebaseApp}
          enablePush={enablePush}
          coachingNotes={getAllCoachingNotes()}
        />
      </div>
    </div>
  )
}
