import { shellQueryClient } from './queryClient.js'
import { QueryClientProvider } from '@tanstack/react-query'
import Door from '@view/door'


export default function DoorApp({ subTab, onSubTab }) {
  return (
    <QueryClientProvider client={shellQueryClient}>
      <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto">
        <Door subTab={subTab} onSubTab={onSubTab} />
      </div>
    </QueryClientProvider>
  )
}
