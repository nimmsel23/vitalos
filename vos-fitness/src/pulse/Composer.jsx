import { useState, useRef } from 'react'
import { ArrowUp } from 'lucide-react'

export default function Composer({ onSubmit }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  function fire() {
    const text = value.trim()
    if (!text) return
    onSubmit(text)
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <div className="pulse-composer-wrap">
      <div className="pulse-composer">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') fire() }}
          placeholder="z.B. Bankdrücken 3x8x60kg …"
          enterKeyHint="done"
          autoComplete="off"
        />
        <button className="pulse-send" onClick={fire} disabled={!value.trim()} aria-label="Loggen">
          <ArrowUp size={18} strokeWidth={2.75} />
        </button>
      </div>
      <div className="pulse-composer-hint">Tippen, Enter — fertig. Kein Formular, kein Umweg.</div>
    </div>
  )
}
