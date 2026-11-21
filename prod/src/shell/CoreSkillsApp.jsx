import ErrorBoundary from '@components/common/ErrorBoundary.jsx'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { sixpackFrameVars } from './sixpackFrame.js'
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

// 6Pack-Home teilt Hero und App-Menü 50/50 (flex-1 basis-0). Dafür muss der
// Rahmen eine definite Höhe haben; die misst sich neu, wenn iOS die Leiste
// oder die Shell die Tab-Bar ändert. Im Setup bleibt der Block im Fluss.
function useSixpackFrame(active) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    if (!active) return undefined
    const el = ref.current
    if (!el) return undefined
    const measure = () => {
      const shell = el.closest('.mobile-shell')
      const nav = shell ? getComputedStyle(shell).getPropertyValue('--mobile-nav-height') : ''
      const vars = sixpackFrameVars(el.getBoundingClientRect().top, nav)
      for (const [key, value] of Object.entries(vars)) el.style.setProperty(key, value)
    }
    measure()
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    for (const node of [el.closest('#vos-shell-content'), el.closest('.mobile-shell')]) {
      if (node) ro?.observe(node)
    }
    window.addEventListener('resize', measure)
    const viewport = window.visualViewport
    viewport?.addEventListener('resize', measure)
    viewport?.addEventListener('scroll', measure)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', measure)
      viewport?.removeEventListener('resize', measure)
      viewport?.removeEventListener('scroll', measure)
    }
  }, [active])
  return ref
}

// enablePush: optional vom Host (private Shell: src/shell/sixpackPush.js); nativ nie, dort laufen lokale Erinnerungen.
export default function CoreSkillsApp({ user, settings = false, initialRoute = '', onRouteChange, onNavigate, enablePush }) {
  const [route, setRoute] = useState(initialRoute)
  const changeRoute = next => { setRoute(next); onRouteChange?.(next) }
  const [design, setDesign] = useState(readDesign)
  const uid = user?.uid || (() => { try { return getUid() } catch { return null } })()
  useEffect(() => setRoute(initialRoute), [initialRoute])
  const sixpack = settings || route === 'sixpack' || route.startsWith('sixpack/')
  const frameRef = useSixpackFrame(sixpack && !settings)
  const setup = <div className="p-4 space-y-4"><PersistenceStatus /><label>Skills-Design<select value={design} onChange={e => { saveDesign(e.target.value); setDesign(e.target.value) }} className="block bg-fit-card text-fit-ink p-2 rounded-lg"><option value="classic">Original</option>{DESIGNS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
  return <ErrorBoundary><section data-theme="skills" className="core-skills">
    {!settings && <header className="mx-auto max-w-xl p-4"><h1 className="text-2xl font-bold">Core Skills</h1><nav aria-label="Core Skills" className="flex gap-4 pt-3"><button onClick={() => changeRoute('')}>Skills</button><button onClick={() => changeRoute('sixpack')}>6Pack</button><button onClick={() => onNavigate?.('settings')}>Setup</button></nav></header>}
    {sixpack ? <div ref={frameRef} data-sixpack-frame="" className={`core-skills-sixpack mx-auto max-w-xl ${settings ? 'min-h-[70dvh]' : 'core-skills-sixpack-frame'}`}>
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
