import { useEffect, useRef } from 'react'

// Horizontales Wischen für ganze Seiten. Bewusst konservativ, damit es nicht in
// Eingaben, Slider oder horizontal scrollende Bereiche der eingebetteten
// fitness-app-Views greift: nur klar waagrechte, schnelle Gesten zählen.
const MIN_DX = 70
const MAX_MS = 600

function blocksSwipe(el) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if (n.matches?.('input, textarea, select, [role="slider"], [data-no-swipe]')) return true
    if (n.scrollWidth > n.clientWidth + 1) {
      const ox = getComputedStyle(n).overflowX
      if (ox === 'auto' || ox === 'scroll') return true
    }
  }
  return false
}

export default function useSwipe({ onLeft, onRight }) {
  const handlers = useRef({ onLeft, onRight })
  handlers.current = { onLeft, onRight }

  useEffect(() => {
    let start = null
    const down = (e) => {
      const t = e.touches[0]
      start = e.touches.length === 1 && !blocksSwipe(e.target)
        ? { x: t.clientX, y: t.clientY, at: Date.now() }
        : null
    }
    const up = (e) => {
      if (!start) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      const fast = Date.now() - start.at <= MAX_MS
      start = null
      if (!fast || Math.abs(dx) < MIN_DX || Math.abs(dx) < Math.abs(dy) * 1.5) return
      if (dx < 0) handlers.current.onLeft?.()
      else handlers.current.onRight?.()
    }
    const cancel = () => { start = null }
    window.addEventListener('touchstart', down, { passive: true })
    window.addEventListener('touchend', up, { passive: true })
    window.addEventListener('touchcancel', cancel, { passive: true })
    return () => {
      window.removeEventListener('touchstart', down)
      window.removeEventListener('touchend', up)
      window.removeEventListener('touchcancel', cancel)
    }
  }, [])
}
