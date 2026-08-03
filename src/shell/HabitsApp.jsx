import Habits from '@view/habits/index.jsx'

export default function HabitsApp({ runtimeDate, onRuntimeDateChange }) {
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto">
      <Habits selectedDate={runtimeDate} onSelectedDateChange={onRuntimeDateChange} />
    </div>
  )
}
