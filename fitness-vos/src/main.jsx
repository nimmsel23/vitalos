import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@fitness/src/styles.css'
import { UserProvider } from '@fitness/contexts/UserContext.jsx'
import { SettingsProvider } from '@fitness/contexts/SettingsContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const qc = new QueryClient()

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={qc}>
    <UserProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </UserProvider>
  </QueryClientProvider>
)
