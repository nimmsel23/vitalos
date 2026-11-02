import { Component } from 'react'

// Ein Fehler in einer eingebetteten fitness-app-View darf nicht den ganzen
// React-Baum abräumen (das war der schwarze Bildschirm auf dem iPhone): ohne
// Boundary unmountet React bei einem Render-Fehler die komplette App und es
// bleibt nur der dunkle Hintergrund stehen.
//
// Chunk-Ladefehler (alte index.html, Chunk-Hash existiert nach einem Deploy
// nicht mehr) sind der häufigste Fall in der installierten Web-App: dafür
// einmal neu laden, danach die Fehlermeldung zeigen statt in einer Schleife
// zu laden.
const RELOAD_KEY = 'pulse-chunk-reload-at'

function isChunkError(error) {
  const msg = String(error?.message || error || '')
  return /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch dynamically/i.test(msg)
}

function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (Date.now() - last < 60000) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    return false
  }
  window.location.reload()
  return true
}

export default class PageBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Pulse PageBoundary:', error, info)
    if (isChunkError(error)) reloadOnce()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="pulse-empty" style={{ position: 'relative', zIndex: 1 }}>
        <strong>Etwas ist schiefgelaufen</strong>
        <div style={{ fontSize: '0.75rem', wordBreak: 'break-word', maxWidth: 420, margin: '0 auto 1rem' }}>
          {String(error?.message || error)}
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
          <button className="pulse-chip" onClick={() => this.setState({ error: null })}>Erneut versuchen</button>
          {this.props.onBack && <button className="pulse-chip" onClick={this.props.onBack}>Zurück</button>}
          <button className="pulse-chip" onClick={() => window.location.reload()}>Neu laden</button>
        </div>
      </div>
    )
  }
}
