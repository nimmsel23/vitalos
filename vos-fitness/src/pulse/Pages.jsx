import { Suspense, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSettings } from '@fitness/contexts/SettingsContext.jsx'
import { useUser } from '@fitness/contexts/UserContext'
import ExerciseInsightModal from '@fitness/components/ExerciseInsightModal.jsx'
import { getStaticMuscleTaxonomy } from '@fitness/lib/kb/muscles.js'
import { getAnatomy } from '@db'
import PageBoundary from './PageBoundary.jsx'
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
  { id: 'logbuch', label: 'Logbuch' },
  { id: 'learn', label: 'Lernen' },
  { id: 'settings', label: 'Einstellungen' },
]

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

// Session-Unterseiten (SessionModeTabs/SessionHeader rufen onSubNav('today'|'plan'|'history'|…))
// auf die Pulse-Seiten abbilden. Skills/6Pack sind eigene Apps, dafür gibt es hier kein Ziel.
const SUBNAV_TARGET = { today: 'training', session: 'training', plan: 'plan', history: 'logbuch', logbuch: 'logbuch' }

export function SubPage({ id, onBack, onOpen, sessions, signOut, sessionDate, onDateChange, onOpenSession }) {
  const [reviewTab, setReviewTab] = useState(null) // null = Bericht
  const { muscleLanguage, recentDays } = useSettings()
  const { gender } = useUser()
  const [taxonomy] = useState(() => getStaticMuscleTaxonomy())
  const [inspected, setInspected] = useState(null)

  // wie App.jsx/FitnessApp.jsx: Insight-Modal öffnen, Lektion nachladen
  async function inspectExercise(exercise) {
    if (!exercise) return
    setInspected(exercise)
    const exId = exercise.exercise_id || exercise.id
    if (!exId || exercise.lesson) return
    try {
      const lesson = await getAnatomy(exId)
      if (lesson) setInspected((prev) => (prev ? { ...prev, lesson } : prev))
    } catch { /* Modal bleibt ohne Lektion nutzbar */ }
  }

  const onSubNav = (sub) => { const t = SUBNAV_TARGET[sub]; if (t && onOpen) onOpen(t) }

  const page = PAGES.find((p) => p.id === id)
  if (!page) return null
  return (
    <PageShell title={page.label} onBack={onBack}>
      <PageBoundary key={id} onBack={onBack}>
        <Suspense fallback={<div className="pulse-empty">…</div>}>
          {id === 'training' && (
            <Session key="today" subTab="today" initialDate={sessionDate || undefined} onDateChange={onDateChange}
              recentDays={recentDays} onInspectExercise={inspectExercise} onSubNav={onSubNav} />
          )}
          {id === 'plan' && <Session key="plan" subTab="plan" recentDays={recentDays} onInspectExercise={inspectExercise} onSubNav={onSubNav} />}
          {id === 'review' && (
            <WeeklyReview recentDays={14} gender={gender} muscleLanguage={muscleLanguage} taxonomy={taxonomy}
              subTab={reviewTab} onSubNav={(t) => (t === 'verlauf' ? onOpen('logbuch') : setReviewTab(t === 'report' ? null : t))}
              onOpenSession={onOpenSession} onInspectExercise={inspectExercise} />
          )}
          {id === 'logbuch' && <Session key="logbuch" subTab="logbuch" recentDays={recentDays} onOpenSession={onOpenSession} onInspectExercise={inspectExercise} onSubNav={onSubNav} />}
          {id === 'learn' && <Learn onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />}
          {id === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Settings hideAppearance />
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
        </Suspense>
      </PageBoundary>
      <ExerciseInsightModal exercise={inspected} onClose={() => setInspected(null)} onExerciseChange={setInspected}
        muscleLanguage={muscleLanguage} taxonomy={taxonomy} />
    </PageShell>
  )
}
