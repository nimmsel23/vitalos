import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import FuelSettings from '@fuel/views/Settings/SettingsView.jsx'
import RelaxSettings from '@relax/views/Settings.jsx'
import JournalSettings from '../../../journal-app/src/components/Journal/JournalSettings.jsx'
import { useJournalPushNotifications } from '../../../journal-app/src/hooks/useJournalPushNotifications.js'
import { usePushNotifications } from '../../../habit-app/src/views/Habits/usePushNotifications.js'
import PushSettingsModal from '../../../habit-app/src/views/Habits/PushSettingsModal.jsx'
import * as journalDb from '@journal-db'
import CoreSkillsApp from '../../../prod/src/shell/CoreSkillsApp.jsx'

const queryClient = new QueryClient()
function Section({ id, title, children }) {
  const [open, setOpen] = useState(false)
  return <details id={`settings-${id}`} className="card p-4" onToggle={e => setOpen(e.currentTarget.open)}><summary className="cursor-pointer text-lg font-bold">{title}</summary>{open && <div className="pt-4">{children}</div>}</details>
}
function JournalControls({ user }) {
  const [settings, setSettings] = useState(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const push = useJournalPushNotifications(user)
  useEffect(() => {
    let alive = true
    journalDb.getSettings().then(s => { if (alive) setSettings(s) }).catch(e => { if (alive) setError(e.message) })
    return () => { alive = false }
  }, [user?.uid])
  async function change(key, value) {
    try {
      const next = { ...await journalDb.getSettings(), [key === 'colorActivities' ? 'journal_colorActivities' : key]: value }
      await journalDb.saveSettings(next)
      if (key === 'colorActivities') localStorage.setItem('journal_colorActivities', String(value))
      setSettings(next); setError('')
    } catch (e) { setError(e.message) }
  }
  const act = operation => Promise.resolve().then(operation).catch(e => setError(e.message))
  return <><button disabled={!settings} onClick={() => setOpen(true)}>Darstellung & Erinnerungen</button>{error && <p role="alert">{error}</p>}{open && <JournalSettings onClose={() => setOpen(false)} settings={{ ...settings, colorActivities: settings?.journal_colorActivities ?? false }} onChange={change} pushSettings={push.settings} pushBusy={push.busy} onEnablePush={() => act(push.enable)} onDisablePush={() => act(push.disable)} onReminderTimeChange={time => act(() => push.updateReminderTime(time))} />}</>
}
function HabitControls({ user }) {
  const push = usePushNotifications(user)
  const [open, setOpen] = useState(false)
  return <><button onClick={() => setOpen(true)}>Habit-Erinnerungen</button><PushSettingsModal open={open} onClose={() => setOpen(false)} settings={push.settings} permission={push.permission} busy={push.busy} onEnable={push.enable} onDisable={push.disable} onReminderTimeChange={push.updateReminderTime} /></>
}
export default function AppSettingsSections({ user }) {
  return <div className="space-y-4">
    <Section id="skills" title="Core Skills · Skills & 6Pack"><CoreSkillsApp user={user} settings onNavigate={target => { location.hash = `#${target}` }} /></Section>
    <Section id="fuel" title="Fuel"><QueryClientProvider client={queryClient}><FuelSettings /></QueryClientProvider></Section>
    <Section id="journal" title="Journal"><JournalControls user={user} /></Section>
    <Section id="habits" title="Habits"><HabitControls user={user} /></Section>
    <Section id="relax" title="Relax"><div className="relax-scope"><RelaxSettings /></div></Section>
    <p className="text-sm text-fit-dim">Fitness, Plan und Learn verwenden die gemeinsamen Trainings-, Profil- und Darstellungseinstellungen auf dieser Seite.</p>
  </div>
}
