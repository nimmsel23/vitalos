import { shellQueryClient } from './queryClient.js'
import { QueryClientProvider } from '@tanstack/react-query'
import Game from '@view/game'
import DoorV2 from '@view/door2'


// subTab: Map ('fire' …) oder Door-v2-Phase ('door/potential' …, Hash #game/door/<phase>)
export default function GameApp({ user, subTab, onSubTab }) {
  const isDoor = typeof subTab === 'string' && subTab.startsWith('door')
  return (
    <QueryClientProvider client={shellQueryClient}>
      <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto">
        {isDoor
          ? <DoorV2 embedded user={user} mode={subTab.split('/')[1] || 'potential'} onModeChange={(phase) => onSubTab?.(`door/${phase}`)} />
          : <Game embedded user={user} mode={subTab} onModeChange={onSubTab} />}
      </div>
    </QueryClientProvider>
  )
}
