import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useApp } from '@fuel/store.js'
import { useAppData } from '@fuel/hooks/useAppData.js'
import { sumMetric } from '@fuel-shared/utils/utils.js'
import StatsGrid from '@fuel/views/Dashboard/StatsGrid.jsx'
import DailyGoals from '@fuel/views/Dashboard/DailyGoals.jsx'

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })

function FuelDashboardInner({ navigate }) {
  const { activeDate } = useApp()
  const { nutrition } = useAppData(activeDate)

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
