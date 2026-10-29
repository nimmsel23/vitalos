import { ChevronLeft, ChevronRight } from 'lucide-react'
import Session from '@view/session'
import WeeklyReview from '@view/review'
import Learn from '@view/learn'
import Settings from '@view/settings'

// Eigene Seiten statt Overlay-Sheet (2026-10-29): Pulse bleibt der eine Screen,
// alles andere wird bewusst geöffnet (Hash-Route #/<id>, Zurück-Taste geht).
// Training/Plan nutzen den echten `@view/session`-Router aus fitness-app:
// `subTab="today"` liefert den kompletten Editor inkl. SessionGateCard,
// `subTab="plan"` routet intern auf PlanView (siehe Session/index.jsx).
export const PAGES = [
  { id: 'training', label: 'Training' },
  { id: 'plan', label: 'Plan' },
  { id: 'review', label: 'Review' },
  { id: 'verlauf', label: 'Verlauf' },
  { id: 'learn', label: 'Lernen' },
  { id: 'settings', label: 'Einstellungen' },
]

function Verlauf({ sessions }) {
  if (!sessions.length) {
    return <div className="pulse-empty"><strong>Noch keine History</strong>Sobald mehr geloggt ist, taucht sie hier auf.</div>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {sessions.map((s) => (
        <div key={s.date} className="pulse-beat" style={{ marginBottom: 0 }}>
          <div className="pulse-beat-name">{s.date}</div>
          <div className="pulse-beat-meta">{(s.exercises || []).length} Übung(en){s.block ? ` · ${s.block}` : ''}</div>
        </div>
      ))}
    </div>
  )
}

function PageShell({ title, onBack, children }) {
  return (
    <div className="pulse-page">
      <div className="pulse-page-head">
        <button className="pulse-icon-btn" onClick={onBack} aria-label="Zurück"><ChevronLeft size={18} /></button>
        <h2>{title}</h2>
      </div>
      <div className="pulse-page-body">{children}</div>
    </div>
  )
}

export function MenuPage({ onOpen, onBack }) {
  return (
    <PageShell title="Mehr" onBack={onBack}>
      <div className="pulse-menu">
        {PAGES.map((p) => (
          <button key={p.id} className="pulse-beat pulse-menu-item" onClick={() => onOpen(p.id)}>
            <span className="pulse-beat-name" style={{ marginBottom: 0 }}>{p.label}</span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
    </PageShell>
  )
}

export function SubPage({ id, onBack, sessions, signOut }) {
  const page = PAGES.find((p) => p.id === id)
  if (!page) return null
  return (
    <PageShell title={page.label} onBack={onBack}>
      {id === 'training' && <Session key="today" subTab="today" />}
      {id === 'plan' && <Session key="plan" subTab="plan" />}
      {id === 'review' && <WeeklyReview recentDays={14} />}
      {id === 'verlauf' && <Verlauf sessions={sessions} />}
      {id === 'learn' && <Learn />}
      {id === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Settings />
          {signOut && (
            <button
              onClick={signOut}
              className="pulse-beat"
              style={{ color: 'var(--red)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}
            >
              Logout
            </button>
          )}
        </div>
      )}
    </PageShell>
  )
}
