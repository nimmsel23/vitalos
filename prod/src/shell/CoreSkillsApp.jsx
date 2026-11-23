import ErrorBoundary from '@components/common/ErrorBoundary.jsx'
import { useEffect, useState } from 'react'
import { SkillsEmbed } from '../../../skills-app/embed.jsx'
import { SixPackEmbed } from '../../../6pack-app/embed.jsx'
import PersistenceStatus from '../../../skills-app/PersistenceStatus.jsx'
import { DESIGNS, readDesign, saveDesign } from '../../../skills-app/designs/index.js'
import { getUid, getSixpackProgram, saveSixpackProgram } from '@db'
import { isNativeApp, nativeReminderDelivery } from '../../../6pack-app/nativeReminders.js'
import { getApp } from 'firebase/app'
import { getAllCoachingNotes } from '../../../fitness-app/src/lib/coachNotes.js'
import { logWorkoutAsSession } from '../../../fitness-app/src/lib/logExternalWorkout.js'
import '../../../skills-app/skills.css'
import './core-skills.css'

const loadProgram = () => getSixpackProgram()
const saveProgram = (_uid, program) => saveSixpackProgram(program)
const complete = workout => logWorkoutAsSession(workout)

// enablePush: optional vom Host (private Shell: src/shell/sixpackPush.js); nativ nie, dort laufen lokale Erinnerungen.
export default function CoreSkillsApp({ user, settings = false, initialRoute = '', onRouteChange, onNavigate, enablePush }) {
  const [route, setRoute] = useState(initialRoute)
  const changeRoute = next => { setRoute(next); onRouteChange?.(next) }
  const [design, setDesign] = useState(readDesign)
  const uid = user?.uid || (() => { try { return getUid() } catch { return null } })()
  useEffect(() => setRoute(initialRoute), [initialRoute])
  const sixpack = settings || route === 'sixpack' || route.startsWith('sixpack/')
  const setup = <div className="p-4 space-y-4"><PersistenceStatus /><label>Skills-Design<select value={design} onChange={e => { saveDesign(e.target.value); setDesign(e.target.value) }} className="block bg-fit-card text-fit-ink p-2 rounded-lg"><option value="classic">Original</option>{DESIGNS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
  return <ErrorBoundary><section data-theme="skills" className="core-skills">
    {!settings && <header className="core-skills-header"><nav aria-label="Core Skills" className="core-skills-nav"><button type="button" aria-pressed={!sixpack} onClick={() => changeRoute('')}>Skills</button><button type="button" aria-pressed={sixpack} onClick={() => changeRoute('sixpack')}>6Pack</button></nav><button type="button" className="core-skills-setup" onClick={() => onNavigate?.('settings')}>Setup</button></header>}
    {sixpack ? <div className="core-skills-sixpack core-skills-content">
      <SixPackEmbed key={uid || 'local'} uid={uid} route={settings ? 'settings' : route.replace(/^sixpack\/?/, '')}
        onRouteChange={next => {
          if (next === 'settings') return onNavigate?.('settings')
          if (settings) return onNavigate?.('skills')
          changeRoute(next.startsWith('skills') ? next.replace(/^skills\/?/, '') : `sixpack/${next}`)
        }} onNavigate={onNavigate} firebaseApp={isNativeApp ? undefined : getApp()} enablePush={isNativeApp ? undefined : enablePush} localReminders={nativeReminderDelivery} setupContent={setup} coachingNotes={getAllCoachingNotes()}
        onWorkoutComplete={complete} loadRemoteProgram={loadProgram} saveRemoteProgram={saveProgram} />
    </div> : <div className="core-skills-training"><SkillsEmbed route={route} onRouteChange={changeRoute} design={design} onWorkoutComplete={complete} /></div>}
  </section></ErrorBoundary>
}
