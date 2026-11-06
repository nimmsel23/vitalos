import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './product-editions.css'

import { UserProvider } from './contexts/UserContext'

// Fokus-Sperre Stufe 0: Debug-Schalter für die Emulator-/Geräteabnahme.
// Nur bei Builds mit VITE_FOCUS_DEBUG=1 sichtbar (siehe FocusDebugPanel-Kopf).
const FOCUS_DEBUG = import.meta.env.VITE_FOCUS_DEBUG === '1'
const FocusDebugPanel = React.lazy(() => import('./focus/DebugReminderPanel.jsx'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {FOCUS_DEBUG && (
      <React.Suspense fallback={null}>
        <FocusDebugPanel />
      </React.Suspense>
    )}
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
)
