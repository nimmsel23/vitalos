import FitnessApp from './FitnessApp.jsx'
import CoreSkillsApp from '../../prod/src/shell/CoreSkillsApp.jsx'
import FuelWrapper from './FuelWrapper.jsx'
import HabitsApp from './HabitsApp.jsx'
import DoorApp from './DoorApp.jsx'
import GameApp from './GameApp.jsx'
import JournalApp from './JournalApp.jsx'
import RelaxApp from './RelaxApp.jsx'
import CoachApp from './CoachApp.jsx'
import SettingsApp from './SettingsApp.jsx'
import { HomeFitnessGate } from './HomeGates.jsx'
import { FuelFrontdoorScreen, FUEL_FRONTDOOR_KEYS } from './FuelFrontdoors.jsx'

export default function ShellAppRouter({ tab, fitnessProps, fuelTab, setFuelTab, relaxTab, setRelaxTab, doorTab, setDoorTab, gameTab, setGameTab, homeGate, onHomeGateSelect, onHomeGateDismiss, user, settingsProps, openSession, compact, muscleLanguage, taxonomy, runtimeDate, onRuntimeDateChange, navigate, sixpackRoute = '', onSixpackRoute, skillsRoute = '', onSkillsRoute }) {
  return (
    <>
      {tab === 'home' && (
        <div className="relative min-h-[100dvh]">
          <JournalApp onOpenSession={openSession} onNavigateShell={navigate} runtimeDate={runtimeDate} onRuntimeDateChange={onRuntimeDateChange} />
          {homeGate === 'fitness' && <HomeFitnessGate onSelect={onHomeGateSelect} onDismiss={onHomeGateDismiss} />}
        </div>
      )}
      {tab === 'fitness' && <FitnessApp {...fitnessProps} user={user} />}
      {tab === 'sixpack' && <CoreSkillsApp user={user} initialRoute={`sixpack/${sixpackRoute}`} onRouteChange={next => next.startsWith('sixpack') ? onSixpackRoute?.(next.replace(/^sixpack\/?/, '')) : navigate('skills', next)} onNavigate={navigate} />}
      {tab === 'skills' && <CoreSkillsApp user={user} initialRoute={skillsRoute} onRouteChange={onSkillsRoute} onNavigate={navigate} />}
      {tab === 'fuel' && FUEL_FRONTDOOR_KEYS.has(fuelTab) && <FuelFrontdoorScreen frontdoorKey={fuelTab} navigate={navigate} />}
      {tab === 'fuel' && !FUEL_FRONTDOOR_KEYS.has(fuelTab) && <FuelWrapper user={user} subTab={fuelTab} onSubTab={setFuelTab} onNavigateShell={navigate} embedded />}
      {tab === 'journal' && <JournalApp onOpenSession={openSession} onNavigateShell={navigate} runtimeDate={runtimeDate} onRuntimeDateChange={onRuntimeDateChange} />}
      {tab === 'habits' && <HabitsApp runtimeDate={runtimeDate} onRuntimeDateChange={onRuntimeDateChange} />}
      {tab === 'door' && <DoorApp subTab={doorTab} onSubTab={setDoorTab} />}
      {tab === 'game' && <GameApp user={user} subTab={gameTab} onSubTab={setGameTab} />}
      {tab === 'relax' && <RelaxApp subTab={relaxTab} onSubTab={setRelaxTab} onOpenSession={openSession} runtimeDate={runtimeDate} onRuntimeDateChange={onRuntimeDateChange} />}
      {tab === 'settings' && <SettingsApp {...settingsProps} compact={compact} />}
      {tab === 'coach' && <div className={`${compact ? 'p-4' : 'p-4 sm:p-8 lg:p-12'} max-w-[1600px] mx-auto`}><CoachApp /></div>}
    </>
  )
}
