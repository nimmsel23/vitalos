import { QueryClient } from '@tanstack/react-query'

export const fuelHubQueryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
})
