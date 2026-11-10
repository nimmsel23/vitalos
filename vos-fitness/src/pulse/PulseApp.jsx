import { useEffect, useState } from 'react'
import { useUser } from '@fitness/contexts/UserContext'
import { getAllMuscles } from '@db'
import PulseLog from './PulseLog.jsx'
import AuthScreen from './AuthScreen.jsx'
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
 * Der Kern (PulseLog) wird beim Seitenwechsel durch PageBoundary key={page} neu
 * gemountet und lädt den Tag frisch; PulseLog selbst schützt vor Überschreiben
 * (erst speichern, wenn der Tag geladen ist).
 */
export default function PulseApp() {
  const { user, authLoading, signIn, signInEmail, signUpEmail, signOut } = useUser()
  const [history, setHistory] = useState([])
  const [page, setPage] = useState(pageFromHash)
  const [sessionDate, setSessionDate] = useState(null)

  useEffect(() => {
    const onHash = () => setPage(pageFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function go(id) {
    // Datum nur für den Sprung aus Review/Verlauf behalten; sonst öffnet Training wieder heute.
    if (id !== 'training') setSessionDate(null)
    window.location.hash = id ? `/${id}` : ''
  }

  // Review/Verlauf öffnen einen Tag im Training-Editor (wie openSession in der Haupt-App).
  function openSession(date) {
    setSessionDate(date || null)
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

  if (authLoading) {
    return (
      <div className="pulse-root" style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ color: 'var(--dim)', fontWeight: 800, letterSpacing: '0.2em', fontSize: '0.7rem' }}>…</div>
      </div>
    )
  }

  if (!user) return <AuthScreen signIn={signIn} signInEmail={signInEmail} signUpEmail={signUpEmail} />

  return (
    <div className={`pulse-root${page ? ' pulse-root--page' : ''}`}>
      <PageBoundary key={page} onBack={() => go('')}>
        {page === 'menu' && <MenuPage onOpen={go} onBack={() => go('')} />}
        {page && page !== 'menu' && (
          <SubPage id={page} onBack={() => go('menu')} onOpen={go} sessions={history} signOut={signOut}
            sessionDate={sessionDate} onDateChange={setSessionDate} onOpenSession={openSession} />
        )}
        <div hidden={!!page}>
          <PulseLog user={user} onOpenMore={() => go('menu')} onHistory={setHistory} />
        </div>
      </PageBoundary>
    </div>
  )
}
