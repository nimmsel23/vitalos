import './styles/vos-pulse.css'
import App from './App.jsx'

/**
 * fitness-vos eigener Einstiegspunkt. Bündelt den "vos-pulse"-Look (eigene
 * CSS-Variablen-Theme, unabhängig von den fitness-app-Themes) und rendert
 * ansonsten die geerbte App unverändert — kein Fork der Shell-Logik, nur
 * ein eigener visueller Layer für die slim/VOS-Variante.
 */
export default function AppWrapper() {
  return <App />
}
