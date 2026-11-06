import { useEffect } from 'react'

/**
 * useEscapeKey — schließt ein Modal/Overlay/Sheet/Gate per ESC-Taste.
 *
 * 1:1 aus fitness-app/src/hooks/useEscapeKey.js übernommen, damit die
 * VitalOS-Shell dasselbe Tastatur-Verhalten hat wie die Standalone-App
 * (fitness-dev 3d501d2 "feat(keyboard): Tastaturnavigation für Modals,
 * Tabs und Set-Grid"). Die Shell mountet fitness-apps App.jsx nie, sondern
 * rendert Session/WeeklyReview/… direkt über @view/* — die dortigen
 * useEscapeKey-Aufrufe greifen also nur für Session-lokale Modals. Alles,
 * was die Shell selbst aufspannt (Home-Gate, Hub-Gate, Fitness-Menü-Sheet),
 * braucht sein eigenes ESC-Handling hier.
 *
 * @param {() => void} onEscape - Callback, wenn Escape gedrückt wird
 * @param {boolean} active - Listener nur registrieren wenn true (z.B. offen)
 */
export function useEscapeKey(onEscape, active = true) {
  useEffect(() => {
    if (!active) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onEscape?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active, onEscape])
}
