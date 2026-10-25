import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Door from '@view/door'

// Die Shell hat keinen globalen QueryClientProvider (Fuel/Hub haben eigene) —
// Door v1 (journal-app/src/views/door) nutzt useQuery/useMutation, daher eigener Client.
const qc = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
})

export default function DoorApp({ subTab, onSubTab }) {
  return (
    <QueryClientProvider client={qc}>
      <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto">
        <Door subTab={subTab} onSubTab={onSubTab} />
      </div>
    </QueryClientProvider>
  )
}
