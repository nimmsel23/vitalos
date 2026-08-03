import { useState } from 'react'
import { Dumbbell, BarChart3, ClipboardList, Brain } from 'lucide-react'
import PlanView from '@view/plan/index.jsx'
import Session from '@view/session/index.jsx'
import WeeklyReview from '@view/review/index.jsx'
import ExerciseInsightModal from '@fitness/components/ExerciseInsightModal.jsx'
import { getAnatomy } from '@db'
import FitnessAppGate from './FitnessAppGate.jsx'

export default function FitnessApp({ user, recentDays, coverageThreshold, gender, muscleLanguage, taxonomy, dashboardHighlighter, subTab, onSubTab, sessionDate, sessionDraft, onOpenSession, onRuntimeDateChange, onNavigateShell }) {
  const [inspectorExercise, setInspectorExercise] = useState(null)
  const [reviewSubTab, setReviewSubTab] = useState(null)

  const tab = subTab || 'gate'
  const setTab = onSubTab || (() => {})
  const gateItems = [
    { id: 'session', label: 'Training', Icon: Dumbbell },
    { id: 'review', label: 'Review', Icon: BarChart3 },
    { id: 'plan', label: 'Plan', Icon: ClipboardList },
    { id: 'learn', label: 'Learn', Icon: Brain, onSelect: () => onNavigateShell?.('learn') },
  ]

  async function inspectExercise(exercise) {
    if (!exercise) return
    setInspectorExercise(exercise)
    const id = exercise.exercise_id || exercise.id
    if (!id || exercise.lesson) return
    try {
      const lesson = await getAnatomy(id)
      if (lesson) setInspectorExercise(prev => prev ? { ...prev, lesson } : prev)
    } catch {}
  }

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 overflow-hidden">
        <div className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] max-w-[1600px] mx-auto min-h-[100dvh] flex flex-col ${tab !== 'gate' ? 'scale-[0.98] opacity-30 blur-[2px] pointer-events-none' : 'scale-100 opacity-100'}`}>
          <FitnessAppGate navigate={setTab} items={gateItems} title="Fitness" />
        </div>

        <div
          className={`
            fixed inset-0 z-30 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${tab === 'gate' ? 'translate-y-full pointer-events-none' : 'translate-y-0'}
          `}
        >
          <div className="relative h-full overflow-y-auto rounded-t-[40px] border-t border-[var(--line)]/30 bg-[var(--bg)] pt-6 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
            {tab !== 'gate' && (
              <button
                onClick={() => setTab('gate')}
                aria-label="Zurück zum Fitness-Menü"
                className="sticky top-0 z-30 mx-auto flex w-full flex-col items-center gap-1 bg-gradient-to-b from-[var(--bg)] via-[var(--bg)] to-transparent pt-2 pb-3 transition-opacity active:opacity-60"
              >
                <div className="h-1.5 w-10 rounded-full bg-fit-line" />
                <span className="text-[9px] font-black uppercase tracking-widest text-fit-dim opacity-60">Menü</span>
              </button>
            )}

            <div className={`animate-in fade-in duration-500 ${tab !== 'gate' ? 'p-4 pb-20 sm:p-8 lg:p-12' : ''}`}>
              {tab === 'session' && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} recentDays={recentDays} coverageThreshold={coverageThreshold} onDateChange={onRuntimeDateChange} />}
              {tab === 'review'  && <WeeklyReview onOpenSession={onOpenSession} onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} gender={gender} recentDays={recentDays} subTab={reviewSubTab} onSubNav={setReviewSubTab} />}
              {tab === 'plan'    && <PlanView />}
            </div>
          </div>
        </div>
      </div>

      <ExerciseInsightModal exercise={inspectorExercise} onClose={() => setInspectorExercise(null)} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />
    </div>
  )
}
