import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import Session from '@view/session/index.jsx'
import WeeklyReview from '@view/review/index.jsx'
import Learn from '@view/learn/index.jsx'
import Coach from '@fitness/src/views/Coach/index.jsx'
import Inbox from '@fitness/src/views/Inbox/index.js'
import Settings from '@fitness/src/views/Settings/index.jsx'
import ExerciseInsightModal from '@fitness/components/ExerciseInsightModal.jsx'
import { NAV_ITEMS as FITNESS_NAV_ITEMS } from '@constants/NavigationItems.js'
import { getAnatomy, getPlan } from '@db'
import FitnessAppGate from './FitnessAppGate.jsx'

function resolveFitnessRoute(id) {
  if (!id || id === 'gate') return { tab: 'gate', sessionSubTab: null, reviewSubTab: null, learnSubTab: null }
  if (id === 'session') return { tab: 'session', sessionSubTab: null, reviewSubTab: null, learnSubTab: null }
  if (id === 'today') return { tab: 'session', sessionSubTab: null, reviewSubTab: null, learnSubTab: null }
  if (id === 'plan' || id === 'history') return { tab: 'session', sessionSubTab: id, reviewSubTab: null, learnSubTab: null }
  if (id === 'review') return { tab: 'review', sessionSubTab: null, reviewSubTab: null, learnSubTab: null }
  if (id === 'report') return { tab: 'review', sessionSubTab: null, reviewSubTab: 'report', learnSubTab: null }
  if (id === 'muscles' || id === 'readiness') return { tab: 'review', sessionSubTab: null, reviewSubTab: id, learnSubTab: null }
  if (id === 'learn') return { tab: 'learn', sessionSubTab: null, reviewSubTab: null, learnSubTab: 'exercises' }
  if (id === 'exercises' || id === 'anatomy' || id === 'quiz') return { tab: 'learn', sessionSubTab: null, reviewSubTab: null, learnSubTab: id }
  return { tab: id, sessionSubTab: null, reviewSubTab: null, learnSubTab: null }
}

export default function FitnessApp({ recentDays, coverageThreshold, gender, muscleLanguage, taxonomy, subTab, onSubTab, sessionDate, sessionDraft, onOpenSession, onRuntimeDateChange }) {
  const [inspectorExercise, setInspectorExercise] = useState(null)
  const [reviewSubTab, setReviewSubTab] = useState(null)
  const [learnSubTab, setLearnSubTab] = useState('exercises')

  const setTab = onSubTab || (() => {})
  const route = resolveFitnessRoute(subTab)
  const tab = route.tab
  const activeReviewSubTab = route.reviewSubTab ?? reviewSubTab
  const activeLearnSubTab = route.learnSubTab ?? learnSubTab
  const gateItems = useMemo(
    () => FITNESS_NAV_ITEMS
      .filter(({ id }) => id !== 'settings')
      .flatMap(({ id, sub = [] }) => {
        if (id === 'session') {
          return sub.map((item) => (
            item.id === 'today'
              ? { ...item, label: 'Heute', Icon: CalendarDays }
              : { ...item }
          ))
        }
        return sub.map((item) => ({ ...item }))
      }),
    [],
  )

  async function handleGateSelect(id) {
    if (id === 'today' || id === 'session') {
      try {
        const plan = await getPlan()
        const hasTodayPlan = Array.isArray(plan?.today?.exercises) && plan.today.exercises.length > 0
        setTab(hasTodayPlan ? 'plan' : 'session')
        return
      } catch {}
    }

    const next = resolveFitnessRoute(id)
    if (next.reviewSubTab !== null) setReviewSubTab(next.reviewSubTab)
    if (next.learnSubTab !== null) setLearnSubTab(next.learnSubTab)
    setTab(id)
  }

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
          <FitnessAppGate navigate={handleGateSelect} items={gateItems} title="Fitness" />
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
              {tab === 'session' && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} recentDays={recentDays} coverageThreshold={coverageThreshold} subTab={route.sessionSubTab} onDateChange={onRuntimeDateChange} />}
              {tab === 'review'  && <WeeklyReview onOpenSession={onOpenSession} onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} gender={gender} recentDays={recentDays} subTab={activeReviewSubTab} onSubNav={setReviewSubTab} />}
              {tab === 'learn'   && <Learn subTab={activeLearnSubTab} onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />}
              {tab === 'inbox'   && <Inbox />}
              {tab === 'coach'   && <Coach onInspectExercise={inspectExercise} />}
              {tab === 'settings' && <Settings />}
            </div>
          </div>
        </div>
      </div>

      <ExerciseInsightModal exercise={inspectorExercise} onClose={() => setInspectorExercise(null)} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />
    </div>
  )
}
