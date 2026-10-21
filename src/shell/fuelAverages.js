// Fuel's macro trend is chronological and includes empty calendar days.
export function averageMacros(trend = [], days) {
  const entries = trend.slice(-days)
  return Object.fromEntries(['kcal', 'protein', 'carbs', 'fat'].map((key) => [
    key,
    entries.reduce((sum, entry) => sum + (Number(entry[key]) || 0), 0) / days,
  ]))
}
