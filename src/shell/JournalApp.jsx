import Journal from '@view/journal'

export default function JournalApp({ onOpenSession, onNavigateShell, runtimeDate, onRuntimeDateChange }) {
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto">
      <Journal
        embedded
        onOpenSession={onOpenSession}
        onNavigateShell={onNavigateShell}
        date={runtimeDate}
        onDateChange={onRuntimeDateChange}
      />
    </div>
  )
}
