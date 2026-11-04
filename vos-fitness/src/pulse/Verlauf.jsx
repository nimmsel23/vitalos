import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import './verlauf.css'

// Session-Felder (verifiziert in fitness-app/src/lib/db/firestore/sessions.js):
// date (YYYY-MM-DD), block, exercises[]; je Übung name, setsArray[{reps,weight}] (Strings)
// oder alternativ sets[] (Array). Gewicht/Reps können Strings oder leer sein.
const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function setsOf(ex) {
  if (Array.isArray(ex?.setsArray) && ex.setsArray.length) return ex.setsArray
  if (Array.isArray(ex?.sets) && ex.sets.length) return ex.sets
  return []
}

function parseDate(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number)
  return y && m && d ? new Date(y, m - 1, d) : null
}

function weekStart(dt) {
  const d = new Date(dt)
  const wd = (d.getDay() + 6) % 7 // Montag = 0
  d.setDate(d.getDate() - wd)
  d.setHours(0, 0, 0, 0)
  return d
}

const fmtDay = new Intl.DateTimeFormat('de-AT', { weekday: 'short', day: 'numeric', month: 'numeric' })
const fmtShort = new Intl.DateTimeFormat('de-AT', { day: 'numeric', month: 'numeric' })
const nf = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 0 })

function weekLabel(start) {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const now = weekStart(new Date())
  const diff = Math.round((now - start) / (7 * 864e5))
  const range = `${fmtShort.format(start)} – ${fmtShort.format(end)}`
  if (diff === 0) return `Diese Woche · ${range}`
  if (diff === 1) return `Letzte Woche · ${range}`
  return range
}

function summarize(s) {
  const exs = Array.isArray(s.exercises) ? s.exercises : []
  let sets = 0
  let volume = 0
  for (const ex of exs) {
    for (const st of setsOf(ex)) {
      sets += 1
      volume += num(st?.reps) * num(st?.weight)
    }
  }
  const names = exs.map((e) => e?.name || e?.exercise_name).filter(Boolean)
  return { count: exs.length, sets, volume, names }
}

export default function Verlauf({ sessions, onOpenSession }) {
  const weeks = useMemo(() => {
    const map = new Map()
    const sorted = [...(sessions || [])].filter((s) => s && s.date).sort((a, b) => String(b.date).localeCompare(String(a.date)))
    for (const s of sorted) {
      const dt = parseDate(s.date)
      if (!dt) continue
      const ws = weekStart(dt)
      const key = ws.getTime()
      if (!map.has(key)) map.set(key, { key, start: ws, items: [] })
      map.get(key).items.push({ s, dt, sum: summarize(s) })
    }
    return [...map.values()]
  }, [sessions])

  if (!weeks.length) {
    return <div className="pulse-empty"><strong>Noch keine History</strong>Sobald du ein Training loggst, taucht es hier auf.</div>
  }

  return (
    <div className="pulse-verlauf">
      {weeks.map((w) => {
        const total = w.items.reduce((a, i) => ({ sets: a.sets + i.sum.sets, volume: a.volume + i.sum.volume }), { sets: 0, volume: 0 })
        return (
          <section key={w.key} className="pulse-verlauf-week">
            <div className="pulse-verlauf-weekhead">
              <span>{weekLabel(w.start)}</span>
              <span>{w.items.length} Tag(e) · {total.sets} Sätze{total.volume ? ` · ${nf.format(total.volume)} kg` : ''}</span>
            </div>
            {w.items.map(({ s, dt, sum }, i) => {
              const shown = sum.names.slice(0, 4).join(', ')
              const more = sum.names.length > 4 ? ` +${sum.names.length - 4}` : ''
              return (
                <button key={`${s.date}-${s.id ?? i}`} type="button" className="pulse-beat pulse-verlauf-item"
                  onClick={() => onOpenSession?.(s.date)}>
                  <span className="pulse-verlauf-main">
                    <span className="pulse-beat-name">{fmtDay.format(dt)}{s.block ? ` · ${s.block}` : ''}</span>
                    <span className="pulse-beat-meta">
                      {sum.count} Übung(en) · {sum.sets} Sätze{sum.volume ? ` · ${nf.format(sum.volume)} kg` : ''}
                    </span>
                    {shown && <span className="pulse-verlauf-names">{shown}{more}</span>}
                  </span>
                  <ChevronRight size={16} />
                </button>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
