import { QueryClient, MutationCache } from '@tanstack/react-query'

export const shellQueryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => { void shellQueryClient.invalidateQueries({ queryKey: ['shell-activity'] }) },
  }),
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
})
