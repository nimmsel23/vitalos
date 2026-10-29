import { useEffect, useMemo, useRef, useState } from 'react'
import { getSession, saveSession, searchExercises, getSessionHistory } from '@db'
import { useUser } from '@fitness/contexts/UserContext'
import PulseFeed, { PulseHeader } from './PulseFeed.jsx'
import { MenuPage, SubPage, PAGES } from './Pages.jsx'
import useSwipe from './useSwipe.js'
import { parseLogText, slugify } from './parseLog.js'
import './pulse.css'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// Seite aus dem Hash (#/review) — leer = Pulse selbst, 'menu' = Mehr-Liste.
function pageFromHash() {
  const id = window.location.hash.replace(/^#\/?/, '')
  return id === 'menu' || PAGES.some((p) => p.id === id) ? id : ''
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

export default function PulseApp() {
  const { user, authLoading, signIn, signInEmail, signUpEmail, signOut } = useUser()
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authRegistering, setAuthRegistering] = useState(false)

  const [exercises, setExercises] = useState([])
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [page, setPage] = useState(pageFromHash)
  const [saveError, setSaveError] = useState(false)
  const sessionRef = useRef(null)
  const exercisesRef = useRef([])

  useEffect(() => {
    const onHash = () => setPage(pageFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!user) return
    getSession(todayISO()).then((s) => {
      sessionRef.current = s && typeof s === 'object' ? s : {}
      exercisesRef.current = Array.isArray(s?.exercises) ? s.exercises : []
      setExercises(exercisesRef.current)
    }).catch(() => {})
    getSessionHistory(60).then(setHistory).catch(() => {})
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

  function go(id) {
    window.location.hash = id ? `/${id}` : ''
  }

  // Links wischen: Pulse → Mehr. Rechts wischen: eine Ebene zurück (wie der Pfeil).
  useSwipe({
    onLeft: () => { if (user && !page) go('menu') },
    onRight: () => { if (page) go(page === 'menu' ? '' : 'menu') },
  })

  async function handleAuthSubmit(e) {
    e.preventDefault()
    setAuthError('')
    try {
      if (authRegistering) await signUpEmail(authEmail, authPassword)
      else await signInEmail(authEmail, authPassword)
    } catch {
      setAuthError('Anmeldung fehlgeschlagen.')
    }
  }

  if (authLoading) {
    return (
      <div className="pulse-root" style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ color: 'var(--dim)', fontWeight: 800, letterSpacing: '0.2em', fontSize: '0.7rem' }}>…</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="pulse-root" style={{ display: 'grid', placeItems: 'center', padding: '1.5rem' }}>
        <div style={{ width: '100%', maxWidth: 360, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '1.75rem', padding: '2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--p-display)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Pulse</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--accent)', marginTop: '0.3rem' }}>Fitness VOS</div>
          </div>
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <input type="email" placeholder="Email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required
              style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '0.9rem', padding: '0.8rem 1rem', color: 'var(--ink)', fontWeight: 600 }} />
            <input type="password" placeholder="Passwort" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required
              style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '0.9rem', padding: '0.8rem 1rem', color: 'var(--ink)', fontWeight: 600 }} />
            {authError && <p style={{ color: 'var(--red)', fontSize: '0.7rem', fontWeight: 700, textAlign: 'center' }}>{authError}</p>}
            <button type="submit" style={{ background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '0.9rem', padding: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
              {authRegistering ? 'Account erstellen' : 'Pulse starten'}
            </button>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1rem 0' }}>
            <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
            <span style={{ fontSize: '0.6rem', color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase' }}>oder</span>
            <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
          </div>
          <button onClick={signIn} style={{ width: '100%', background: 'white', color: 'black', border: 'none', borderRadius: '0.9rem', padding: '0.8rem', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
            Google Login
          </button>
          <button onClick={() => setAuthRegistering((v) => !v)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--dim)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.8rem' }}>
            {authRegistering ? 'Bereits ein Account? Anmelden' : 'Neu hier? Account erstellen'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pulse-root">
      {page === 'menu' && <MenuPage onOpen={go} onBack={() => go('')} />}
      {page && page !== 'menu' && (
        <SubPage id={page} onBack={() => go('menu')} sessions={history} signOut={signOut} />
      )}
      {!page && (
        <>
          <PulseHeader streak={streak} onOpenMore={() => go('menu')} />
          <PulseFeed exercises={exercises} pending={pending} onLog={handleLog} saveError={saveError} onRetrySave={persistSession} />
        </>
      )}
    </div>
  )
}
