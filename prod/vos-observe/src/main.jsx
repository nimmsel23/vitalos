import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight, Eye, LockKeyhole, LogOut, Moon, Sun, Wind } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { getJournalHistory, saveJournal, signIn, signInEmail, signOut, signUpEmail, watchAuth } from '@db'
import './style.css'

const MOODS = [
  { id: 'low', label: 'Eher schwer', glyph: '◒' },
  { id: 'quiet', label: 'Ruhig', glyph: '○' },
  { id: 'steady', label: 'Ausgeglichen', glyph: '◉' },
  { id: 'bright', label: 'Leicht', glyph: '✳' },
  { id: 'charged', label: 'Voll da', glyph: '✦' },
]
const today = () => format(new Date(), 'yyyy-MM-dd')

function App() {
  const [user, setUser] = useState(undefined)
  useEffect(() => watchAuth(setUser), [])
  if (user === undefined) return <div className="boot">Observe</div>
  return user ? <Observe user={user} /> : <Welcome />
}

function Welcome() {
  const [register, setRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    try { await (register ? signUpEmail(email, password) : signInEmail(email, password)) }
    catch { setError(register ? 'Konto konnte nicht erstellt werden.' : 'Anmeldung fehlgeschlagen. Bitte prüfe deine Angaben.') }
    finally { setBusy(false) }
  }
  return <main className="welcome">
    <div className="welcome-mark"><Eye size={25} strokeWidth={1.5} /></div>
    <p className="wordmark">VITALOS <span>/ FREE</span></p>
    <h1>Observe.</h1>
    <p className="welcome-copy">Nimm wahr, was in dir vorgeht.<br />Ohne Urteil. In deinem Tempo.</p>
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="email">E-Mail</label><input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
      <label htmlFor="password">Passwort</label><input id="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={6} required value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Einen Moment …' : register ? 'Kostenloses Konto erstellen' : 'Anmelden'}</button>
    </form>
    <button className="google" onClick={() => signIn().catch(() => setError('Google-Anmeldung nicht verfügbar.'))}>Mit Google fortfahren</button>
    <button className="switch-auth" onClick={() => setRegister(value => !value)}>{register ? 'Schon ein Konto? Anmelden' : 'Neu bei Observe? Kostenlos registrieren'}</button>
    <p className="privacy-note"><LockKeyhole size={13} /> Deine Einträge sind privat und nur für dich sichtbar.</p>
  </main>
}

function Observe({ user }) {
  const qc = useQueryClient()
  const [mood, setMood] = useState('')
  const [energy, setEnergy] = useState(3)
  const [sleep, setSleep] = useState(3)
  const [balance, setBalance] = useState(3)
  const [business, setBusiness] = useState(3)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const journal = useQuery({ queryKey: ['observe', user.uid], queryFn: () => getJournalHistory(100) })
  const entries = useMemo(() => (journal.data || []).filter(entry => entry.tags?.includes('observe')).slice(0, 14), [journal.data])
  const recentCount = entries.filter(entry => entry.date >= format(new Date(Date.now() - 6 * 86400000), 'yyyy-MM-dd')).length

  async function save() {
    if (!mood) return
    const text = [`Being · Stimmung: ${MOODS.find(item => item.id === mood)?.label}`, `Body · Energie: ${energy}/5 · Schlaf: ${sleep}/5`, `Balance · Verbundenheit: ${balance}/5`, `Business · Klarheit: ${business}/5`, note.trim()].filter(Boolean).join('\n\n')
    await saveJournal(today(), text, ['observe', `mood:${mood}`, `energy:${energy}`, `sleep:${sleep}`, `balance:${balance}`, `business:${business}`])
    setMood(''); setEnergy(3); setSleep(3); setBalance(3); setBusiness(3); setNote(''); setSaved(true)
    await qc.invalidateQueries({ queryKey: ['observe', user.uid] })
    window.setTimeout(() => setSaved(false), 2200)
  }

  return <main className="observe-app">
    <header className="topbar"><a className="brand" href="#"><span className="brand-icon"><Eye size={17} /></span>observe</a><div className="top-actions"><a className="operate-link" href="#operate">Operate <ArrowUpRight size={14} /></a><button className="icon-button" aria-label="Abmelden" onClick={() => signOut()}><LogOut size={16} /></button></div></header>
    <section className="today-block">
      <p className="date-line">{format(new Date(), 'EEEE · d. MMMM', { locale: de })}</p>
      <h1>Wie bist du<br /><em>gerade da?</em></h1>
      <p className="subline">Ein Moment zum Einchecken. Nur für dich.</p>
    </section>
    <section className="checkin">
      <div className="step-head"><span className="step-number">BEING</span><h2>Was ist gerade da?</h2></div>
      <div className="mood-row" role="group" aria-label="Stimmung auswählen">{MOODS.map(item => <button key={item.id} className={`mood ${mood === item.id ? 'selected' : ''}`} onClick={() => setMood(item.id)} aria-pressed={mood === item.id}><span>{item.glyph}</span><small>{item.label}</small></button>)}</div>
      <div className="pillar-heading"><span>BODY</span><p>Wie geht es deinem Körper?</p></div>
      <div className="sliders">
        <Scale icon={<Wind size={17} />} title="Energie" value={energy} onChange={setEnergy} low="Erschöpft" high="Wach" />
        <Scale icon={<Moon size={17} />} title="Schlaf" value={sleep} onChange={setSleep} low="Unruhig" high="Erholt" />
      </div>
      <div className="pillar-heading"><span>BALANCE</span><p>Wie verbunden fühlst du dich?</p></div>
      <Scale icon={<Eye size={17} />} title="Nähe" value={balance} onChange={setBalance} low="Für mich" high="Verbunden" />
      <div className="pillar-heading"><span>BUSINESS</span><p>Wie klar ist dein nächster Schritt?</p></div>
      <Scale icon={<ArrowUpRight size={17} />} title="Klarheit" value={business} onChange={setBusiness} low="Offen" high="Klar" />
      <div className="note-wrap"><label htmlFor="note">Was möchtest du festhalten?</label><textarea id="note" rows="3" maxLength="1500" placeholder="Gedanken dürfen hier einfach stehen …" value={note} onChange={event => setNote(event.target.value)} /></div>
      <div className="submit-row"><span className="saved-state">{saved ? 'Für heute festgehalten' : 'Wird privat gespeichert'}</span><button className="save-button" disabled={!mood} onClick={save}>{saved ? 'Gespeichert ✓' : 'Check-in speichern'}</button></div>
    </section>
    <section className="history">
      <div className="history-title"><div><p className="eyebrow">DEIN VERLAUF · BODY / BEING / BALANCE / BUSINESS</p><h2>Wahrnehmen wird leichter.</h2></div><span className="week-count">{recentCount}<small> / 7 Tage</small></span></div>
      {journal.isLoading ? <p className="empty-state">Dein Verlauf wird geladen …</p> : entries.length ? <div className="entry-list">{entries.map(entry => <article className="entry" key={entry.id}><time>{format(parseISO(entry.date), 'EEE, d. MMM', { locale: de })}</time><div><strong>{MOODS.find(m => `mood:${m.id}` === entry.tags?.find(tag => tag.startsWith('mood:')))?.label || 'Check-in'}</strong><p>{(entry.text || '').split('\n\n').at(-1)}</p></div><span className="entry-energy">{entry.tags?.find(tag => tag.startsWith('energy:'))?.slice(7) || '—'}</span></article>)}</div> : <div className="empty-state"><span className="empty-orbit">○</span><p>Dein erster Check-in beginnt mit einem Atemzug.<br />Kein streak, kein Score. Einfach du.</p></div>}
    </section>
    <section className="premium" id="operate"><div><p className="eyebrow">WENN DU BEREIT BIST</p><h2>Aus Wahrnehmen wird Handeln.</h2><p>Operate ergänzt Observe um Ziele, Wochenplanung und konkrete nächste Schritte für alle vier Lebensbereiche.</p></div><span className="premium-badge">OPERATE · PREMIUM</span></section>
    <footer className="footer"><span>OBSERVE <i>BY</i> VITALOS</span><span>BODY · BEING · BALANCE · BUSINESS</span></footer>
  </main>
}

function Scale({ icon, title, value, onChange, low, high }) {
  return <div className="scale"><div className="scale-label">{icon}<span>{title}</span></div><div className="scale-controls"><small>{low}</small><div className="scale-options" role="group" aria-label={title}>{[1, 2, 3, 4, 5].map(number => <button key={number} className={value === number ? 'on' : ''} onClick={() => onChange(number)} aria-label={`${title}: ${number}`} aria-pressed={value === number}>{number}</button>)}</div><small>{high}</small></div></div>
}

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })
createRoot(document.getElementById('root')).render(<React.StrictMode><QueryClientProvider client={qc}><App /></QueryClientProvider></React.StrictMode>)
