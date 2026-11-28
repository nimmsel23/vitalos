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

export default function FuelHubStat() {
  return (
    <QueryClientProvider client={fuelHubQueryClient}>
      <FuelHubStatInner />
    </QueryClientProvider>
  )
}
