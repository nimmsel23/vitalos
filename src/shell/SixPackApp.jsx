import SixPackPromiseCard from '../../6pack-app/SixPackPromiseCard.jsx'
import { getUid, getSixpackProgram, saveSixpackProgram } from '@db'
import { getAllCoachingNotes } from '../../fitness-app/src/lib/coachNotes.js'
import { logWorkoutAsSession } from '../../fitness-app/src/lib/logExternalWorkout.js'
import '../../6pack-app/sixpack.css'

const loadProgram = () => getSixpackProgram()
const saveProgram = (_uid, program) => saveSixpackProgram(program)

export default function SixPackApp({ user, onNavigate }) {
  const uid = user?.uid || (() => { try { return getUid() } catch { return null } })()
  const onWorkoutComplete = (workout) => logWorkoutAsSession(workout).catch((error) => {
    console.error('6Pack-Workout konnte nicht ins Session-Log geschrieben werden:', error)
  })

  return (
    <div data-theme="sixpack" className="min-h-[100dvh] overflow-y-auto bg-[var(--bg)] text-[var(--ink)]">
      <div className="mx-auto max-w-xl px-4 py-4">
        {/* 6Pack-Push kommt nur von der 6Pack-App (6pack-dev). Fitness hat ihn entfernt; die Standalone-Variante
            (standaloneSync.js) legt eine eigene Firebase-Instanz an und taugt nicht für die Shell. Bis 6pack ein
            shell-taugliches Push-Modul anbietet, bleibt enablePush hier aus (die Karte zeigt dann einen Hinweis). */}
        <SixPackPromiseCard
          key={uid || 'anonymous'}
          uid={uid}
          coachingNotes={getAllCoachingNotes()}
          onSubNav={(id) => id === 'skills' && onNavigate?.('skills')}
          onWorkoutComplete={onWorkoutComplete}
          loadRemoteProgram={loadProgram}
          saveRemoteProgram={saveProgram}
        />
      </div>
    </div>
  )
}
