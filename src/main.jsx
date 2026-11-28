import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { shellQueryClient } from './shell/queryClient.js'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={shellQueryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
