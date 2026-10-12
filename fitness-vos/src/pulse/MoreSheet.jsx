import { useState } from 'react'
import { X } from 'lucide-react'
import WeeklyReview from '@view/review'
import Learn from '@view/learn'
import Settings from '@view/settings'

const TABS = [
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
  const [tab, setTab] = useState('review')

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
