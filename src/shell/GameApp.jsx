import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Game from '@view/game'

// Eigener QueryClient wie DoorApp (Shell hat keinen globalen Provider).
const qc = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
})

export default function GameApp({ user, subTab, onSubTab }) {
  return (
    <QueryClientProvider client={qc}>
      <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto">
        <Game embedded user={user} mode={subTab} onModeChange={onSubTab} />
      </div>
    </QueryClientProvider>
  )
}
