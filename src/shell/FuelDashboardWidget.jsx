import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useApp } from '@fuel/store.js'
import { useAppData } from '@fuel/hooks/useAppData.js'
import { useMacroTrend } from '@fuel/hooks/useNutrition.js'
import { sumMetric } from '@fuel-shared/utils/utils.js'
import StatsGrid from '@fuel/views/Dashboard/StatsGrid.jsx'
import DailyGoals from '@fuel/views/Dashboard/DailyGoals.jsx'
import { shiftISODate } from './runtimeDate.js'
import { averageMacros } from './fuelAverages.js'

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })

function FuelAverageCard({ title, days, date, trend, isPending, isError }) {
  const averages = averageMacros(trend, days)
  const formatDate = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })

  return (
    <section className="min-w-0 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-fit-dim">{formatDate(shiftISODate(date, 1 - days))} – {formatDate(date)} · {days} Tage</p>
      {isPending || isError ? (
        <p className="mt-4 text-sm text-fit-dim" role="status">{isError ? 'Durchschnitt konnte nicht geladen werden.' : 'Durchschnitt wird geladen …'}</p>
      ) : (
        <dl className="mt-4 grid grid-cols-2 gap-4">
          {[
            ['Kalorien', 'kcal', 'kcal'],
            ['Protein', 'protein', 'g'],
            ['Kohlenhydrate', 'carbs', 'g'],
            ['Fett', 'fat', 'g'],
          ].map(([label, key, unit]) => (
            <div key={key}>
              <dt className="text-xs text-fit-dim">{label}</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{Math.round(averages[key]).toLocaleString('de-DE')} <span className="text-xs font-normal text-fit-dim">{unit}</span></dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 text-xs text-fit-dim">Ø pro Kalendertag · ohne Eintrag = 0</p>
    </section>
  )
}

function FuelDashboardInner({ navigate, runtimeDate }) {
  const { activeDate } = useApp()
  const date = runtimeDate || activeDate
  const { nutrition } = useAppData(date)
  const { data: trend, isPending, isError } = useMacroTrend(date, 30)

  const meals = nutrition?.meals || []
  const totalKcal = sumMetric(meals, 'kcal')
  const totalProtein = sumMetric(meals, 'protein')
  const waterMl = nutrition?.water_ml || 0

  return (
    <div
      onClick={() => navigate?.('fuel')}
      className="grid gap-4 md:grid-cols-2 cursor-pointer"
    >
      <StatsGrid mealsCount={meals.length} totalProtein={totalProtein} waterMl={waterMl} />
      <DailyGoals totalKcal={totalKcal} totalProtein={totalProtein} waterMl={waterMl} />
      <FuelAverageCard title="Wöchentlicher Fuel Average" days={7} date={date} trend={trend} isPending={isPending} isError={isError} />
      <FuelAverageCard title="Monatlicher Fuel Average" days={30} date={date} trend={trend} isPending={isPending} isError={isError} />
    </div>
  )
}

export default function FuelDashboardWidget(props) {
  return (
    <QueryClientProvider client={qc}>
      <FuelDashboardInner {...props} />
    </QueryClientProvider>
  )
}
