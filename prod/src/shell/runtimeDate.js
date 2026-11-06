export function localISO(date = new Date()) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shiftISODate(isoDate, days) {
  const d = new Date(`${isoDate}T12:00:00`)
  d.setDate(d.getDate() + days)
  return localISO(d)
}

export function weekDates(anchorDate) {
  const pivot = new Date(`${anchorDate}T12:00:00`)
  const weekday = (pivot.getDay() + 6) % 7
  pivot.setDate(pivot.getDate() - weekday)

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(pivot)
    day.setDate(pivot.getDate() + index)
    return localISO(day)
  })
}

export function formatRuntimeDate(isoDate, compact = false) {
  const date = new Date(`${isoDate}T12:00:00`)
  return date.toLocaleDateString('de-DE', compact
    ? { weekday: 'short', day: 'numeric', month: 'short' }
    : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
