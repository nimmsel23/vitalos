import { QueryClientProvider } from '@tanstack/react-query'
import { useAppData } from '@fuel/hooks/useAppData.js'
import { sumMetric } from '@fuel-shared/utils/utils.js'
import { localToday } from '@utils'
import { fuelHubQueryClient } from './fuelHubQueryClient.js'

function FuelHubStatInner() {
  const { nutrition } = useAppData(localToday())
  const meals = nutrition?.meals || []
  const kcal = sumMetric(meals, 'kcal')
  if (!meals.length) return <span>Noch nichts geloggt</span>
  return <span>{Math.round(kcal)} kcal heute</span>
}

// Eigener QueryClient statt fuel-app-App-weiten Client (analog FuelDashboardWidget.jsx)
// — Hub rendert unabhängig vom Fuel-Tab, braucht keinen geteilten Cache.
export default function FuelHubStat() {
  return (
    <QueryClientProvider client={fuelHubQueryClient}>
      <FuelHubStatInner />
    </QueryClientProvider>
  )
}
