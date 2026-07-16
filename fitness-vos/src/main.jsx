import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@src/styles.css'
import { UserProvider } from '@src/contexts/UserContext.jsx'
import { SettingsProvider } from '@src/contexts/SettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <UserProvider>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </UserProvider>
)
