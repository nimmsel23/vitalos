import './styles/vos-pulse.css'
import PulseApp from './pulse/PulseApp.jsx'

/**
 * fitness-vos eigener Einstiegspunkt. Seit 2026-10-12 nicht mehr nur ein
 * neuer Look (vos-pulse-Theme), sondern ein grundsätzlich anderes
 * Bedienkonzept ("Pulse"): kein Sidebar/MobileNav/Tab-System, kein
 * AppGate-Startbildschirm. Stattdessen EIN durchgängiger Screen — eine
 * vertikale Spine mit den heutigen Logs + eine permanente Ein-Zeilen-
 * Eingabe unten, die sofort loggt (kein Formular, kein Zwischenschritt).
 * Alles andere (Review/Lernen/Verlauf/Settings) sitzt in einem einzigen
 * Overlay-Sheet statt in persistenter Nav-Chrome — siehe src/pulse/.
 * Die alte Shell (App.jsx + Sidebar/MobileNav) wurde entfernt (Git-Historie).
 */
export default function AppWrapper() {
  return <PulseApp />
}
