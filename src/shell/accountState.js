// Device appearance stays shared; personal data belongs to the signed-in account.
const PROFILE_DEFAULTS = {
  displayName: '', gender: 'm', age: 30, heightCm: 175, weightKg: 80,
  split: 'PPL', cycleLength: 4, defaultLocation: 'Home',
  recentDays: 7, coverageThreshold: 1,
}

export function createAccountState(shellStore, fuelStore, queryClient, storage = localStorage) {
  let owner
  const profileKeys = Object.keys(PROFILE_DEFAULTS)
  const fuelDefaults = Object.fromEntries(Object.entries(fuelStore.getInitialState())
    .filter(([key, value]) => typeof value !== 'function' && key !== 'frontdoor'))
  const pick = (state, keys) => Object.fromEntries(keys.map(key => [key, state[key]]))
  const key = uid => `vitalos-account:${uid}`
  const read = uid => {
    try { return JSON.parse(storage.getItem(key(uid))) || {} } catch { return {} }
  }
  const persist = () => {
    if (!owner) return
    try {
      storage.setItem(key(owner), JSON.stringify({
        profile: pick(shellStore.getState(), profileKeys),
        fuel: pick(fuelStore.getState(), Object.keys(fuelDefaults)),
      }))
    } catch { /* Storage may be unavailable; in-memory account isolation still works. */ }
  }
  try {
    if (!storage.getItem('vitalos-unassigned-settings')) {
      storage.setItem('vitalos-unassigned-settings', JSON.stringify({
        profile: pick(shellStore.getState(), profileKeys),
        fuel: pick(fuelStore.getState(), Object.keys(fuelDefaults)),
      }))
    }
  } catch { /* Optional migration copy; it is never loaded into an account. */ }
  shellStore.subscribe(persist)
  fuelStore.subscribe(persist)

  return {
    switchAccount(uid) {
      if (uid === owner) return
      owner = null
      queryClient.clear()
      const cached = uid ? read(uid) : {}
      // Keep the historical single-user settings in local mode only.
      const local = uid === 'local'
      const profile = { ...PROFILE_DEFAULTS, ...(local ? pick(shellStore.getState(), profileKeys) : {}), ...pickDefined(cached.profile, profileKeys) }
      shellStore.setState(profile)
      fuelStore.setState({ ...fuelDefaults, ...(local ? pick(fuelStore.getState(), Object.keys(fuelDefaults)) : {}), ...pickDefined(cached.fuel, Object.keys(fuelDefaults)) })
      owner = uid
      persist()
    },
    applyProfile(uid, profile) {
      if (owner !== uid || !uid) return
      shellStore.setState(pickDefined(profile, profileKeys))
    },
    applyFuelSettings(uid, settings) {
      if (owner !== uid || !uid) return
      fuelStore.setState(pickDefined(settings, Object.keys(fuelDefaults).filter(key => !['age', 'gender', 'height_cm', 'weight_kg'].includes(key))))
    },
  }
}

function pickDefined(values, keys) {
  return Object.fromEntries(keys.filter(key => values?.[key] !== undefined && values[key] !== null)
    .map(key => [key, values[key]]))
}
