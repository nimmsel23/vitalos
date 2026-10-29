import { useEffect, useMemo, useRef, useState } from 'react'
import { getSession, saveSession, searchExercises, getSessionHistory } from '@db'
import PulseFeed, { PulseHeader } from './PulseFeed.jsx'
import { parseLogText, slugify } from './parseLog.js'
import './pulse.css'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function computeStreak(history) {
  const days = new Set(history.map((s) => s.date))
  let streak = 0
  const cur = new Date()
  // heute zählt nur mit, wenn schon was geloggt ist — sonst ab gestern rückwärts zählen
  if (!days.has(todayISO())) cur.setDate(cur.getDate() - 1)
  while (days.has(cur.toISOString().slice(0, 10))) {
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

  useEffect(() => {
    if (!user) return
    getSession(todayISO()).then((s) => {
      sessionRef.current = s && typeof s === 'object' ? s : {}
      exercisesRef.current = Array.isArray(s?.exercises) ? s.exercises : []
      setExercises(exercisesRef.current)
    }).catch(() => {})
    getSessionHistory(60).then((h) => { setHistory(h); onHistory?.(h) }).catch(() => {})
  }, [user])

  const streak = useMemo(() => computeStreak(history), [history])

  async function handleLog(text) {
    const parsed = parseLogText(text)
    if (!parsed) return
    const tempKey = `pending-${Date.now()}`
    setPending((p) => [...p, { ...parsed, _key: tempKey }])

    let id = `manual_${slugify(parsed.name)}`
    let displayName = parsed.name
    try {
      const { results } = await searchExercises(parsed.name)
      if (results?.length) {
        id = results[0].id
        displayName = results[0].name || parsed.name
      }
    } catch { /* kein Katalog-Treffer — bleibt Freitext, blockt nichts */ }

    const entry = {
      name: displayName,
      id,
      primaryMuscles: [],
      secondaryMuscles: [],
      setsArray: parsed.sets,
      source: 'manual',
      note: parsed.freeform ? `Pulse-Log: "${parsed.raw}"` : '',
      inferred: true,
      review_state: 'unreviewed',
    }

    setPending((p) => p.filter((x) => x._key !== tempKey))
    const next = [...exercisesRef.current, entry]
    exercisesRef.current = next
    setExercises(next)
    const current = sessionRef.current || {}
    sessionRef.current = {
      ...current,
      date: todayISO(),
      sessionMode: current.sessionMode || 'strength',
      exercises: next,
      block: current.block || '',
      location: current.location || '',
      trainingsart: current.trainingsart || 'Kraft',
    }
    await persistSession()
  }

  // Der Eintrag bleibt im Feed sichtbar, auch wenn das Speichern scheitert —
  // die Meldung bleibt stehen, bis ein erneuter Versuch durchgeht.
  async function persistSession() {
    try {
      await saveSession(todayISO(), sessionRef.current)
      setSaveError(false)
    } catch (err) {
      console.error('[pulse] saveSession fehlgeschlagen', err)
      setSaveError(true)
    }
  }

  return (
    <div className={embedded ? 'pulse-root pulse-embedded' : 'pulse-log'}>
      <PulseHeader streak={streak} onOpenMore={onOpenMore} />
      <PulseFeed exercises={exercises} pending={pending} onLog={handleLog} saveError={saveError} onRetrySave={persistSession} />
    </div>
  )
}
