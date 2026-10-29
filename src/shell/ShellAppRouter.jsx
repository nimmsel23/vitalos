import FitnessApp from './FitnessApp.jsx'
import SixPackApp from './SixPackApp.jsx'
import SkillsApp from './SkillsApp.jsx'
import FuelWrapper from './FuelWrapper.jsx'
import HabitsApp from './HabitsApp.jsx'
import DoorApp from './DoorApp.jsx'
import GameApp from './GameApp.jsx'
import JournalApp from './JournalApp.jsx'
import RelaxApp from './RelaxApp.jsx'
import CoachApp from './CoachApp.jsx'
import SettingsApp from './SettingsApp.jsx'
import { HomeFitnessGate } from './HomeGates.jsx'

export default function ShellAppRouter({ tab, fitnessProps, fuelTab, setFuelTab, relaxTab, setRelaxTab, doorTab, setDoorTab, gameTab, setGameTab, homeGate, onHomeGateSelect, onHomeGateDismiss, user, settingsProps, openSession, compact, muscleLanguage, taxonomy, runtimeDate, onRuntimeDateChange, navigate }) {
  return (
    <>
      {tab === 'home' && (
        <div className="relative min-h-[100dvh]">
          <JournalApp onOpenSession={openSession} onNavigateShell={navigate} runtimeDate={runtimeDate} onRuntimeDateChange={onRuntimeDateChange} />
          {homeGate === 'fitness' && <HomeFitnessGate onSelect={onHomeGateSelect} onDismiss={onHomeGateDismiss} />}
        </div>
      )}
      {tab === 'fitness' && <FitnessApp {...fitnessProps} />}
      {tab === 'sixpack' && <SixPackApp user={user} onNavigate={navigate} />}
      {tab === 'skills' && <SkillsApp user={user} />}
      {tab === 'fuel' && <FuelWrapper user={user} subTab={fuelTab} onSubTab={setFuelTab} onNavigateShell={navigate} embedded />}
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
