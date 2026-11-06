import { useEffect } from 'react'
import { focusableItems } from './keyboard.js'

export function useSheetFocus(ref, active = true) {
  useEffect(() => {
    if (!active || !ref.current) return undefined
    const previous = document.activeElement
    const frame = requestAnimationFrame(() => {
      const container = ref.current
      if (container) focusableItems(container.querySelector('[data-shell-nav]') || container)[0]?.focus({ preventScroll: true })
    })
    return () => {
      cancelAnimationFrame(frame)
      if (previous?.isConnected) {
        if (!previous.closest('[inert]')) previous.focus({ preventScroll: true })
      } else document.getElementById('vos-shell-content')?.focus({ preventScroll: true })
    }
  }, [ref, active])
}
