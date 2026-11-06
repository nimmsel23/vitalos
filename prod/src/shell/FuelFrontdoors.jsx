import { Suspense, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { FRONTDOORS, getFrontdoor } from '@fuel/views/Frontdoor/frontdoors.js'
import { useFrontdoorLog } from '@fuel/views/Frontdoor/useFrontdoorLog.js'
import { fuelHubQueryClient } from './fuelHubQueryClient.js'

function FuelFrontdoorView({ frontdoorKey, navigate }) {
  const fd = useFrontdoorLog()
  const View = getFrontdoor(frontdoorKey)?.View
  if (!View) return null

  function openApp(tab) {
    if (tab === 'settings') navigate?.('settings')
    else navigate?.('fuel', tab || 'log')
  }

  return (
    <Suspense fallback={<p className="py-8 text-center text-sm text-fit-dim" role="status">Fuel lädt …</p>}>
      <View key={frontdoorKey} fd={fd} onOpenApp={openApp} />
    </Suspense>
  )
}

// Ein einzelner Schnelleinstieg als eigener Fuel-Untertab (#fuel/tapboard|shutter|tagesfaden).
export function FuelFrontdoorScreen({ frontdoorKey, navigate }) {
  return (
    <div className="min-w-0 p-4 sm:p-8">
      <QueryClientProvider client={fuelHubQueryClient}>
        <FuelFrontdoorView frontdoorKey={frontdoorKey} navigate={navigate} />
      </QueryClientProvider>
    </div>
  )
}

export const FUEL_FRONTDOOR_KEYS = new Set(['tapboard', 'shutter', 'tagesfaden'])

export default function FuelFrontdoors({ navigate }) {
  const [selected, setSelected] = useState('tapboard')

  return (
    <section className="mt-6 min-w-0" aria-label="Fuel Schnelleinstiege">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-fit-ink">Essen erfassen</h3>
        <p className="mt-1 text-sm text-fit-dim">Für heute · per Tap, Foto oder Text</p>
      </div>
      <div data-shell-nav="grid" className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FRONTDOORS.map(({ key, label, tagline, Icon, View }) => (
          <button
            key={key}
            type="button"
            aria-pressed={View ? selected === key : undefined}
            aria-controls={View ? 'hub-fuel-frontdoor' : undefined}
            onClick={() => View ? setSelected(key) : navigate?.('fuel', 'log')}
            className={`vos-press min-w-0 rounded-2xl border p-3 text-left ${selected === key ? 'border-fit-accent vos-fill' : 'border-fit-line vos-surface'}`}
          >
            <Icon size={20} className="mb-2 text-fit-accent" aria-hidden="true" />
            <span className="block text-sm font-semibold text-fit-ink">{label}</span>
            <span className="mt-1 block text-xs text-fit-dim">{View ? tagline : 'Log, Food und weitere Bereiche'}</span>
          </button>
        ))}
      </div>
      <div id="hub-fuel-frontdoor" className="min-w-0">
        <QueryClientProvider client={fuelHubQueryClient}>
          <FuelFrontdoorView frontdoorKey={selected} navigate={navigate} />
        </QueryClientProvider>
      </div>
    </section>
  )
}
