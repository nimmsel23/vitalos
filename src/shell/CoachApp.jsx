/**
 * CoachApp — Shell-Wrapper für den Coach-Tab.
 *
 * Die Coach-View (@view/coach → fitness-app/src/views/Coach) nutzt das
 * „Hidden Chamber“-Theme: `cc-*`-Klassen und die Variablen unter `.coach-console`.
 * Das Stylesheet hat fitness-dev am 2026-09-23 aus seiner eigenen src/styles.css
 * entfernt („Split coach console into Firebase app“) und lädt es nur noch im
 * Standalone-Einstieg (coach-main.jsx). Die Shell muss es deshalb selbst einbinden
 * und den Wurzel-Container mit `.coach-console` auszeichnen — sonst rendert der
 * Tab als ungestylter Text ohne Layout.
 */

import Coach from '@view/coach'
import '../../fitness-app/src/styles/coach-console.css'

export default function CoachApp(props) {
  return (
    <div className="coach-console rounded-2xl">
      <Coach {...props} />
    </div>
  )
}
