import Habits from '@view/habits/index.jsx'

export default function HabitsApp({ user, runtimeDate, onRuntimeDateChange, onNavigateShell, onOpenSession }) {
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto">
      <Habits user={user} selectedDate={runtimeDate} onSelectedDateChange={onRuntimeDateChange} onOpenSkill={(skill, context) => {
        if (skill === 'fitness') return onOpenSession?.(context?.date || runtimeDate)
        if (skill === 'plan') return onNavigateShell?.('fitness', 'plan')
        return onNavigateShell?.(skill)
      }} />
    </div>
  )
}
