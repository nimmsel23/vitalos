import { Flame } from 'lucide-react'
import Composer from './Composer.jsx'

function formatSet(s) {
  const reps = String(s?.reps ?? '').trim()
  const weight = String(s?.weight ?? '').trim()
  if (reps && weight) return `${reps} × ${weight}kg`
  if (reps) return reps
  if (weight) return `${weight}kg`
  return '—'
}

function Beat({ exercise }) {
  const sets = Array.isArray(exercise.setsArray) ? exercise.setsArray : []
  return (
    <div className="pulse-beat">
      <div className="pulse-beat-name">{exercise.name}</div>
      {exercise.note && <div className="pulse-beat-meta">{exercise.note}</div>}
      {!!sets.length && (
        <div className="pulse-chips">
          {sets.map((s, i) => <span key={i} className="pulse-chip">{formatSet(s)}</span>)}
        </div>
      )}
    </div>
  )
}

export default function PulseFeed({ exercises, onLog, pending, saveError, onRetrySave }) {
  return (
    <>
      <div className="pulse-feed">
        <div className="pulse-spine">
          {exercises.length === 0 && !pending.length && (
            <div className="pulse-empty">
              <strong>Noch nix am Pulse.</strong>
              Tipp einfach rein was du grad gemacht hast — unten.
            </div>
          )}
          {exercises.map((ex, i) => <Beat key={ex._key || i} exercise={ex} />)}
          {pending.map((ex) => (
            <div key={ex._key} className="pulse-beat" style={{ opacity: 0.55 }}>
              <div className="pulse-beat-name">{ex.name}</div>
              <div className="pulse-beat-meta">speichert …</div>
            </div>
          ))}
          {saveError && (
            <div className="pulse-beat" style={{ color: 'var(--red)' }}>
              <div className="pulse-beat-name">Nicht gespeichert</div>
              <div className="pulse-beat-meta">Der letzte Eintrag ist nur auf diesem Gerät.</div>
              <button onClick={onRetrySave} style={{ marginTop: '0.5rem', background: 'transparent', border: '1px solid currentColor', borderRadius: '0.7rem', padding: '0.4rem 0.8rem', color: 'inherit', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                Nochmal speichern
              </button>
            </div>
          )}
        </div>
      </div>
      <Composer onSubmit={onLog} />
    </>
  )
}

export function PulseHeader({ streak, onOpenMore }) {
  const dateLabel = new Date().toLocaleDateString('de-AT', { weekday: 'long', day: '2-digit', month: 'long' })
  return (
    <div className="pulse-header">
      <div>
        <div className="pulse-date">{dateLabel}</div>
        <div className="pulse-sub">
          {streak > 0 ? (<><Flame size={11} style={{ display: 'inline', marginRight: 4, marginBottom: -1 }} />{streak} Tage Pulse</>) : 'Heutiger Pulse'}
        </div>
      </div>
      <button className="pulse-more-btn" onClick={onOpenMore} aria-label="Mehr">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/></svg>
      </button>
    </div>
  )
}
