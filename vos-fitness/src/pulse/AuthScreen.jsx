import { useState } from 'react'

const INPUT_STYLE = { background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '0.9rem', padding: '0.8rem 1rem', color: 'var(--ink)', fontWeight: 600 }

// Firebase-Fehlercode → verständlicher Text
function authMessage(err, registering) {
  const code = err?.code || ''
  if (code === 'auth/network-request-failed') return 'Keine Verbindung. Netzwerk prüfen und erneut versuchen.'
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
    return registering ? 'Anmeldung fehlgeschlagen.' : 'Email oder Passwort falsch.'
  }
  if (code === 'auth/invalid-email') return 'Ungültige Email-Adresse.'
  if (code === 'auth/email-already-in-use') return 'Diese Email ist bereits registriert. Bitte anmelden.'
  if (code === 'auth/weak-password') return 'Passwort zu schwach (mindestens 6 Zeichen).'
  if (code === 'auth/too-many-requests') return 'Zu viele Versuche. Bitte später erneut versuchen.'
  return 'Anmeldung fehlgeschlagen.'
}

function googleMessage(err) {
  const code = err?.code || ''
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return ''
  if (code === 'auth/popup-blocked') return 'Popup wurde blockiert. Popups erlauben oder Email-Login nutzen.'
  if (code === 'auth/network-request-failed') return 'Keine Verbindung. Netzwerk prüfen und erneut versuchen.'
  if (code === 'auth/operation-not-supported-in-this-environment' || code === 'auth/web-storage-unsupported') {
    return 'Google-Login wird in dieser App-Ansicht nicht unterstützt (z. B. iOS-Home-Bildschirm). Bitte Email-Login nutzen.'
  }
  if (code === 'auth/unauthorized-domain') return 'Diese Domain ist für den Google-Login nicht freigeschaltet.'
  return 'Google-Login fehlgeschlagen. Bitte Email-Login nutzen.'
}

/** Login-/Registrierungsmaske (Email + Google). */
export default function AuthScreen({ signIn, signInEmail, signUpEmail }) {
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authRegistering, setAuthRegistering] = useState(false)

  async function handleAuthSubmit(e) {
    e.preventDefault()
    setAuthError('')
    try {
      if (authRegistering) await signUpEmail(authEmail, authPassword)
      else await signInEmail(authEmail, authPassword)
    } catch (err) {
      setAuthError(authMessage(err, authRegistering))
    }
  }

  async function handleGoogle() {
    setAuthError('')
    try {
      await signIn()
    } catch (err) {
      setAuthError(googleMessage(err))
    }
  }

  return (
    <div className="pulse-root" style={{ display: 'grid', placeItems: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 360, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '1.75rem', padding: '2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--p-display)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Pulse</div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--accent)', marginTop: '0.3rem' }}>Fitness VOS</div>
        </div>
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <input type="email" placeholder="Email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required style={INPUT_STYLE} />
          <input type="password" placeholder="Passwort" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required style={INPUT_STYLE} />
          {authError && <p style={{ color: 'var(--red)', fontSize: '0.7rem', fontWeight: 700, textAlign: 'center' }}>{authError}</p>}
          <button type="submit" style={{ background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: '0.9rem', padding: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>
            {authRegistering ? 'Account erstellen' : 'Pulse starten'}
          </button>
        </form>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1rem 0' }}>
          <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
          <span style={{ fontSize: '0.6rem', color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase' }}>oder</span>
          <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
        </div>
        <button onClick={handleGoogle} style={{ width: '100%', background: 'white', color: 'black', border: 'none', borderRadius: '0.9rem', padding: '0.8rem', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
          Google Login
        </button>
        <button onClick={() => setAuthRegistering((v) => !v)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--dim)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.8rem' }}>
          {authRegistering ? 'Bereits ein Account? Anmelden' : 'Neu hier? Account erstellen'}
        </button>
      </div>
    </div>
  )
}
