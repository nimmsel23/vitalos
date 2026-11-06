import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { NAV_ITEMS } from './NavigationItems.js'
import { handleSheetKeys } from './keyboard.js'

const BASICS = [
  ['Alt + 0', 'Übersicht öffnen'],
  ['Alt + ← / →', 'Vorherige / nächste App'],
  ['Tab / Shift + Tab', 'Nächstes / vorheriges Bedienelement'],
  ['Pfeiltasten', 'Fokus innerhalb einer Navigation bewegen'],
  ['Pos1 / Ende', 'Erster / letzter Navigationseintrag'],
  ['Enter / Leertaste', 'Fokussierten Button aktivieren'],
  ['Shift + F10 / Menütaste', 'Unterbereiche eines App-Buttons öffnen'],
  ['Escape', 'Offenes Menü oder Sheet schließen'],
  ['?', 'Diese Übersicht öffnen'],
]

export default function KeyboardHelp({ open, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    if (open && !ref.current.open) ref.current.showModal()
    else if (!open && ref.current.open) ref.current.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="vos-keyboard-title"
      className="vos-keyboard-help vos-surface rounded-3xl p-6 text-fit-ink shadow-2xl"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClose={onClose}
      onKeyDown={(event) => {
        // Keep Escape local: underlying app/sheet listeners must not close too.
        if (event.key === 'Escape') event.stopPropagation()
        else handleSheetKeys(event, onClose)
      }}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="vos-keyboard-title" className="text-xl font-semibold">Tastaturbedienung</h2>
        <button type="button" onClick={onClose} aria-label="Tastaturübersicht schließen" className="flex h-9 w-9 items-center justify-center rounded-full vos-fill">
          <X size={18} />
        </button>
      </div>
      <dl className="space-y-2 text-sm">
        {[
          ...NAV_ITEMS.map(({ label }, index) => [`Alt + ${index + 1}`, `${label} öffnen`]),
          ...BASICS,
        ].map(([keys, description]) => (
          <div key={keys} className="grid grid-cols-[9rem_1fr] items-baseline gap-3">
            <dt><kbd className="font-mono text-xs text-fit-accent">{keys}</kbd></dt>
            <dd className="text-fit-dim">{description}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-xs text-fit-dim">App-Shortcuts pausieren in Eingabefeldern und bei offenen Dialogen. Links lassen sich mit Enter öffnen.</p>
    </dialog>
  )
}
