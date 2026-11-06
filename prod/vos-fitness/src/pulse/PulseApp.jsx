import { useEffect, useRef, useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@cloud/firebase.js'
import { useUser } from '@fitness/contexts/UserContext'
import { getAllMuscles } from '@db'
import PulseLog from './PulseLog.jsx'
import PageBoundary from './PageBoundary.jsx'
import { MenuPage, SubPage, PAGES } from './Pages.jsx'
import useSwipe from './useSwipe.js'
import './pulse.css'

// Seite aus dem Hash (#/review) — leer = Pulse selbst, 'menu' = Mehr-Liste.
function pageFromHash() {
  const id = window.location.hash.replace(/^#\/?/, '')
  return id === 'menu' || PAGES.some((p) => p.id === id) ? id : ''
}

/**
 * vos-fitness-Hülle um den Pulse-Kern: Login, Seiten (Hash-Routen) und Wischen.
 * Der Kern (PulseLog) bleibt beim Seitenwechsel gemountet (nur versteckt), damit
 * eine noch laufende Speicherung nicht mit veraltetem Stand überschrieben wird.
 */
export default function PulseApp() {
  const { user, authLoading, signIn, signInEmail, signUpEmail, signOut } = useUser()
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [resetBusy, setResetBusy] = useState(false)
  const [authRegistering, setAuthRegistering] = useState(false)
  const [history, setHistory] = useState({ uid: null, sessions: [] })
  const [page, setPage] = useState(pageFromHash)
  const [sessionSelection, setSessionSelection] = useState({ uid: null, date: null })
  const currentUid = useRef(user?.uid || null)
  currentUid.current = user?.uid || null

  useEffect(() => {
    const onHash = () => setPage(pageFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function go(id) {
    window.location.hash = id ? `/${id}` : ''
  }

  // Review/Verlauf öffnen einen Tag im Training-Editor (wie openSession in der Haupt-App).
  function openSession(date) {
    setSessionSelection({ uid: user?.uid || null, date: date || null })
    go('training')
  }

  // Die Haupt-App füllt beim Start den In-Memory-KB-Cache der Muskeln; ohne ihn
  // zeigen Review/Muskeln ungruppierte IDs.
  useEffect(() => {
    if (user) getAllMuscles().catch(() => {})
  }, [user])

  // Links wischen: Pulse → Mehr. Rechts wischen: eine Ebene zurück (wie der Pfeil).
  useSwipe({
    onLeft: () => { if (user && !page) go('menu') },
    onRight: () => { if (page) go(page === 'menu' ? '' : 'menu') },
  })

  async function handleAuthSubmit(e) {
    e.preventDefault()
    if (authBusy) return
    setAuthError('')
    setAuthBusy(true)
    try {
      if (authRegistering) await signUpEmail(authEmail, authPassword)
      else await signInEmail(authEmail, authPassword)
    } catch {
      setAuthError('Anmeldung fehlgeschlagen.')
    } finally { setAuthBusy(false) }
  }

  async function handleGoogleSignIn() {
    if (authBusy) return
    setAuthError('')
    setAuthBusy(true)
    try { await signIn() }
    catch (error) {
      if (error?.code !== 'auth/popup-closed-by-user') setAuthError('Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut.')
    } finally { setAuthBusy(false) }
  }

  async function resetPassword() {
    const email = authEmail.trim()
    if (!email) { setResetMessage('Bitte gib zuerst deine E-Mail-Adresse ein.'); return }
    setResetBusy(true)
    setResetMessage('')
    try {
      await sendPasswordResetEmail(auth, email)
      setResetMessage('Falls ein Konto mit dieser E-Mail-Adresse existiert, erhältst du eine Nachricht zum Zurücksetzen.')
    } catch {
      setResetMessage('Das Zurücksetzen konnte nicht gestartet werden. Bitte prüfe die Adresse und deine Verbindung.')
    } finally { setResetBusy(false) }
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
            {authError && <p role="alert" style={{ color: 'var(--red)', fontSize: '0.7rem', fontWeight: 700, textAlign: 'center' }}>{authError}</p>}
            <button type="submit" disabled={authBusy} style={{ background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '0.9rem', padding: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
              {authBusy ? 'Einen Moment …' : authRegistering ? 'Account erstellen' : 'Pulse starten'}
            </button>
          </form>
          {!authRegistering && <button type="button" onClick={resetPassword} disabled={resetBusy} style={{ marginTop: '0.75rem', background: 'none', border: 0, color: 'var(--accent)', cursor: 'pointer' }}>{resetBusy ? 'Wird gesendet …' : 'Passwort vergessen?'}</button>}
          {resetMessage && <p role="status" style={{ color: 'var(--dim)', fontSize: '0.75rem' }}>{resetMessage}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1rem 0' }}>
            <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
            <span style={{ fontSize: '0.6rem', color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase' }}>oder</span>
            <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
          </div>
          <button onClick={handleGoogleSignIn} disabled={authBusy} style={{ width: '100%', background: 'white', color: 'black', border: 'none', borderRadius: '0.9rem', padding: '0.8rem', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
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
      <PageBoundary key={`${user.uid}:${page}`} onBack={() => go('')}>
        {page === 'menu' && <MenuPage onOpen={go} onBack={() => go('')} />}
        {page && page !== 'menu' && (
          <SubPage id={page} onBack={() => go('menu')} onOpen={go} sessions={history.uid === user.uid ? history.sessions : []} signOut={signOut}
            sessionDate={sessionSelection.uid === user.uid ? sessionSelection.date : null} onOpenSession={openSession} />
        )}
      </PageBoundary>
      <div hidden={!!page}>
        <PageBoundary key={user.uid} onBack={() => go('')}>
          <PulseLog user={user} onOpenMore={() => go('menu')} onHistory={(sessions) => {
            if (currentUid.current === user.uid) setHistory({ uid: user.uid, sessions })
          }} />
        </PageBoundary>
      </div>
    </div>
  )
}
