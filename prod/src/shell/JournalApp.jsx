import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Journal from '@view/journal'
import JournalV2 from '@view/journal-v2'
import * as habitsDb from '@habits-db'
import { PRODUCT_EDITION } from './productEdition.js'

// Die Shell hat keinen globalen QueryClientProvider (Fuel/Door haben eigene) —
// Journal v1 und v2 (journal-app) nutzen useQuery/useMutation, daher eigener Client.
const qc = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
})

export default function JournalApp({ user, onOpenSession, onNavigateShell, runtimeDate, onRuntimeDateChange, edition = PRODUCT_EDITION.id }) {
  const [classic, setClassic] = useState(false)
  // Journal v2 verwaltet den Modus (Tag/Woche/Monat/Jahr/Suche) im Parent — im
  // Standalone tut das main.jsx; in der Shell muss dieser Wrapper den Zustand
  // halten, sonst sind die Modus-Buttons wirkungslose No-Ops (Abnahme-Befund).
  const [jv2Mode, setJv2Mode] = useState('tag')
  const productEdition = edition !== 'core' || PRODUCT_EDITION.id === 'store'

  return (
    <QueryClientProvider client={qc}>
      {productEdition && !classic ? (
        <>
          <div className="mx-auto flex max-w-[1600px] justify-end px-4 pt-3 lg:px-12">
            <button type="button" onClick={() => setClassic(true)} className="rounded-full border border-fit-line bg-fit-card px-3 py-2 text-xs font-semibold text-fit-dim hover:text-fit-ink">
              Klassische Tagesliste
            </button>
          </div>
          <JournalV2
            user={user}
            date={runtimeDate}
            mode={jv2Mode}
            onModeChange={setJv2Mode}
            onDateChange={onRuntimeDateChange}
            onSetHabitCompletion={(habitId, date, completed) => {
              const save = Reflect.get(habitsDb, 'setHabitCompletionFromHabits')
              if (typeof save !== 'function') throw new Error('Die Habit-Synchronisierung ist in diesem Produktstand noch nicht verfügbar.')
              return save(habitId, date, completed)
            }}
            onNavigateJournal={(route) => {
              if (route === 'journal') setClassic(true)
              else if (route === 'door-v2') onNavigateShell?.('door')
              else if (route === 'game-v2') onNavigateShell?.('game')
            }}
          />
        </>
      ) : (
        <>
          {productEdition && <div className="mx-auto flex max-w-[1600px] justify-end px-4 pt-3 lg:px-12"><button type="button" onClick={() => setClassic(false)} className="rounded-full border border-fit-line bg-fit-card px-3 py-2 text-xs font-semibold text-fit-dim hover:text-fit-ink">Journal v2</button></div>}
          <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto">
            <Journal
              embedded
              onOpenSession={onOpenSession}
              onNavigateShell={onNavigateShell}
              date={runtimeDate}
              onDateChange={onRuntimeDateChange}
            />
          </div>
        </>
      )}
    </QueryClientProvider>
  )
}
