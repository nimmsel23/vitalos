import { useState } from 'react'
import { X } from 'lucide-react'
import Session from '@view/session'
import WeeklyReview from '@view/review'
import Learn from '@view/learn'
import Settings from '@view/settings'

// Training/Plan ergänzt 2026-10-13: Pulse selbst kennt nur den einzeiligen
// Freitext-Logger (Composer.jsx) — kein Satz/Wdh-Editor, kein Session-Gate
// (Start/Stop-Timer), kein Trainingsplan. Statt das in Pulse nachzubauen,
// wird hier der echte `@view/session`-Router wiederverwendet (identischer
// Code wie in der vollen fitness-app-Shell/App.jsx) — `subTab="today"`
// liefert den kompletten Editor inkl. SessionGateCard, `subTab="plan"`
// routet intern bereits auf PlanView (siehe Session/index.jsx), kein
// zusätzlicher `@view/plan`-Import nötig.
const TABS = [
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

export default function MoreSheet({ onClose, sessions, signOut }) {
  const [tab, setTab] = useState('training')

  return (
    <>
      <div className="pulse-sheet-backdrop" onClick={onClose} />
      <div className="pulse-sheet">
        <div className="pulse-sheet-head">
          <h2>Mehr</h2>
          <button className="pulse-icon-btn" onClick={onClose} aria-label="Schließen"><X size={18} /></button>
        </div>
        <div className="pulse-sheet-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`pulse-sheet-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>
        <div className="pulse-sheet-body">
          {tab === 'training' && <Session key="today" subTab="today" />}
          {tab === 'plan' && <Session key="plan" subTab="plan" />}
          {tab === 'review' && <WeeklyReview recentDays={14} />}
          {tab === 'verlauf' && <Verlauf sessions={sessions} />}
          {tab === 'learn' && <Learn />}
          {tab === 'settings' && (
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
        </div>
      </div>
    </>
  )
}
