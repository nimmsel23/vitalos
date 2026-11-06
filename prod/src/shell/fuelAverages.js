const KEYS = ['kcal', 'protein', 'carbs', 'fat']

// Fuel's macro trend is chronological and includes empty calendar days.
// Tage ohne Eintrag (alle Makros 0) zählen nicht in den Durchschnitt.
export function averageMacros(trend = [], days) {
  const entries = (trend || []).slice(-days)
  const logged = entries.filter((entry) => KEYS.some((key) => (Number(entry?.[key]) || 0) > 0))
  const count = logged.length
  const averages = Object.fromEntries(KEYS.map((key) => [
    key,
    count ? logged.reduce((sum, entry) => sum + (Number(entry[key]) || 0), 0) / count : 0,
  ]))
  return { ...averages, count }
}
