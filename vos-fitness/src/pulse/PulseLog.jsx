import { useEffect, useMemo, useRef, useState } from 'react'
import { getSession, saveSession, searchExercises, getSessionHistory, getExercise } from '@db'
import PulseFeed, { PulseHeader } from './PulseFeed.jsx'
import { parseLogText, slugify } from './parseLog.js'
import './pulse.css'

// Lokaler Kalendertag (nicht UTC — sonst stimmt der Tag zwischen 0 und 1/2 Uhr nicht).
function isoLocal(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function todayISO() {
  return isoLocal(new Date())
}

function computeStreak(history, hasToday) {
  const days = new Set((Array.isArray(history) ? history : []).map((s) => s?.date))
  if (hasToday) days.add(todayISO())
  let streak = 0
  const cur = new Date()
  cur.setHours(12, 0, 0, 0) // Mittag: setDate bleibt bei Sommerzeitwechsel auf dem richtigen Tag
  // heute zählt nur mit, wenn schon was geloggt ist — sonst ab gestern rückwärts zählen
  if (!days.has(isoLocal(cur))) cur.setDate(cur.getDate() - 1)
  while (days.has(isoLocal(cur))) {
    streak += 1
    cur.setDate(cur.getDate() - 1)
  }
  return streak
}

/**
 * Pulse-Kern: heutiger Feed + Ein-Zeilen-Eingabe. Kennt weder Login noch Seiten
 * noch Wischen — das liefert die jeweilige Hülle (vos-fitness: PulseApp,
 * VitalOS-Shell: FitnessApp-Untertab 'pulse'). `user` kommt von dort.
 */
export default function PulseLog({ user, onOpenMore, onHistory, embedded = false }) {
  const [exercises, setExercises] = useState([])
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [saveError, setSaveError] = useState(false)
  const sessionRef = useRef(null)
  const exercisesRef = useRef([])
  const loadRef = useRef({ date: null, ok: false, promise: null })
  const saveChain = useRef(Promise.resolve())
  const failedTexts = useRef([])

  // Tagesdaten laden. Geschrieben wird erst, wenn das gelungen ist — sonst würde ein
  // früher Eintrag (oder ein Netzfehler) den bestehenden Tag überschreiben.
  function loadDay(date) {
    const slot = { date, ok: false, promise: null }
    slot.promise = getSession(date).then((s) => {
      if (loadRef.current !== slot) return false
      sessionRef.current = s && typeof s === 'object' ? s : {}
      exercisesRef.current = Array.isArray(s?.exercises) ? s.exercises : []
      setExercises(exercisesRef.current)
      slot.ok = true
      return true
    }).catch(() => false)
    loadRef.current = slot
    return slot.promise
  }

  async function ensureLoaded() {
    const date = todayISO()
    const cur = loadRef.current
    if (cur.date === date && (cur.ok || cur.promise)) {
      const ok = await cur.promise
      if (ok) return true
      if (loadRef.current !== cur) return ensureLoaded()
    }
    return loadDay(date)
  }

  useEffect(() => {
    if (!user) return
    loadDay(todayISO())
    getSessionHistory(60).then((h) => { setHistory(h); onHistory?.(h) }).catch(() => {})
  }, [user])

  const streak = useMemo(() => computeStreak(history, exercises.length > 0), [history, exercises])

  async function handleLog(text) {
    const parsed = parseLogText(text)
    if (!parsed) return
    if (!(await ensureLoaded())) {
      // Tag nicht ladbar → nichts überschreiben; Text merken, "Nochmal speichern" wiederholt ihn.
      failedTexts.current.push(text)
      setSaveError(true)
      return
    }
    const tempKey = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setPending((p) => [...p, { ...parsed, _key: tempKey }])

    let id = `manual_${slugify(parsed.name)}`
    let displayName = parsed.name
    let primaryMuscles = []
    let secondaryMuscles = []
    let stabilizers = []
    try {
      const { results } = await searchExercises(parsed.name)
      const hit = results?.[0]
      if (hit) {
        id = hit.id
        displayName = hit.name || parsed.name
        primaryMuscles = hit.primaryMuscles || []
        secondaryMuscles = hit.secondaryMuscles || []
        stabilizers = hit.stabilizers || []
        // Wie der Session-Editor: Treffer ohne Muskeln beim Katalogeintrag nachschlagen.
        if (!primaryMuscles.length && !secondaryMuscles.length) {
          const kb = await getExercise(hit.id).catch(() => null)
          primaryMuscles = kb?.primaryMuscles || kb?.primary_muscles || []
          secondaryMuscles = kb?.secondaryMuscles || kb?.secondary_muscles || []
          stabilizers = kb?.stabilizers || stabilizers
        }
      }
    } catch { /* kein Katalog-Treffer — bleibt Freitext, blockt nichts */ }

    setPending((p) => p.filter((x) => x._key !== tempKey))
    // Dieselbe Übung nochmal geloggt → Sätze anhängen statt zweiten Eintrag
    // (gleiches Verhalten wie addEx im Session-Editor).
    const existing = exercisesRef.current
    const idx = existing.findIndex((e) => e.id === id)
    const next = idx === -1
      ? [...existing, {
          name: displayName,
          id,
          primaryMuscles,
          secondaryMuscles,
          stabilizers,
          setsArray: parsed.sets,
          source: 'manual',
          note: parsed.freeform ? `Pulse-Log: "${parsed.raw}"` : '',
          inferred: true,
          review_state: 'unreviewed',
        }]
      : existing.map((e, i) => (i === idx ? { ...e, setsArray: [...(e.setsArray || []), ...parsed.sets] } : e))
    exercisesRef.current = next
    setExercises(next)
    const current = sessionRef.current || {}
    sessionRef.current = {
      ...current,
      date: loadRef.current.date,
      // Training zeigt die Übungsliste nur im Kraft-Modus; ein reiner Cardio-Tag würde Pulse-Einträge verstecken.
      sessionMode: current.sessionMode && current.sessionMode !== 'cardio' ? current.sessionMode : 'strength',
      exercises: next,
      block: current.block || '',
      location: current.location || '',
      trainingsart: current.trainingsart || 'Kraft',
    }
    await persistSession()
  }

  // Der Eintrag bleibt im Feed sichtbar, auch wenn das Speichern scheitert —
  // die Meldung bleibt stehen, bis ein erneuter Versuch durchgeht.
  // Speichern läuft seriell (kein Überholen älterer Stände) und immer mit dem neuesten Stand.
  function persistSession() {
    const run = async () => {
      try {
        if (!loadRef.current.ok || !sessionRef.current) { setSaveError(true); return }
        await saveSession(loadRef.current.date, sessionRef.current)
        setSaveError(false)
      } catch (err) {
        console.error('[pulse] saveSession fehlgeschlagen', err)
        setSaveError(true)
      }
    }
    saveChain.current = saveChain.current.then(run, run)
    return saveChain.current
  }

  async function retrySave() {
    const texts = failedTexts.current
    failedTexts.current = []
    for (const t of texts) await handleLog(t) // speichert jeweils selbst
    if (!failedTexts.current.length) await persistSession()
  }

  return (
    <div className={embedded ? 'pulse-root pulse-embedded' : 'pulse-log'}>
      <PulseHeader streak={streak} onOpenMore={onOpenMore} />
      <PulseFeed exercises={exercises} pending={pending} onLog={handleLog} saveError={saveError} onRetrySave={retrySave} />
    </div>
  )
}
