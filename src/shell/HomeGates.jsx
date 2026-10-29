import { useRef } from 'react'
import { X } from 'lucide-react'
import { useSwipeToDismiss } from '@fitness/hooks/useSwipeToDismiss.js'
import { handleSheetKeys } from './keyboard.js'
import { useSheetFocus } from './useSheetFocus.js'
import Hub from './Hub.jsx'
import FitnessAppGate from './FitnessAppGate.jsx'
import { buildFitnessGateItems } from './NavigationItems.js'

function HomeSheet({ label, onDismiss, children, fullWidth = false }) {
  const backdropRef = useRef(null)
  const sheetRef = useSwipeToDismiss(onDismiss, { backdropRef })
  useSheetFocus(sheetRef)
  return (
    <div className="fixed inset-0 z-50 flex items-end lg:backdrop-blur-sm">
      <button ref={backdropRef} aria-label={`${label} schließen`} className="vos-fade-in absolute inset-0 bg-black/45" onClick={onDismiss} />
      <div ref={sheetRef} role="dialog" aria-label={label} data-shell-overlay="" onKeyDown={(event) => handleSheetKeys(event, onDismiss)}
        className={`vos-sheet vos-sheet-in relative mx-auto flex w-full flex-col overflow-hidden rounded-t-[28px] shadow-[0_-24px_60px_rgba(0,0,0,0.35)] lg:max-h-[88dvh] ${fullWidth ? '' : 'max-w-[1600px]'}`}
        style={{ height: 'calc(100dvh - var(--safe-top) - 10px)', border: '1px solid color-mix(in srgb, var(--ink) 8%, transparent)', borderBottom: 0 }}>
        <div className="flex shrink-0 items-center justify-between gap-4 px-5 pb-1 pt-2 sm:px-6 lg:px-8">
          <div className="w-8" /><div className="h-[5px] w-9 rounded-full" style={{ background: 'color-mix(in srgb, var(--ink) 20%, transparent)' }} />
          <button onClick={onDismiss} aria-label="Schließen" className="vos-press mt-1 flex h-8 w-8 items-center justify-center rounded-full text-fit-dim vos-fill"><X size={16} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 lg:px-8" style={{ paddingBottom: 'calc(var(--mobile-nav-height, calc(var(--tabbar-h) + var(--safe-bottom))) + 24px)' }}>{children}</div>
      </div>
    </div>
  )
}

export function HomeFitnessGate({ onSelect, onDismiss }) {
  return <HomeSheet label="Fitness Gate" onDismiss={onDismiss}><FitnessAppGate navigate={onSelect} items={buildFitnessGateItems()} title="Fitness" variant="sheet" /></HomeSheet>
}

export function HomeHubGate({ onSelect, onDismiss, runtimeDate, openSession }) {
  return <HomeSheet label="Hub" onDismiss={onDismiss} fullWidth><Hub navigate={onSelect} variant="sheet" runtimeDate={runtimeDate} openSession={openSession} /></HomeSheet>
}
