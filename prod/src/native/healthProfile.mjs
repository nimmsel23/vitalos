// Health records remain transient until the user confirms the import.
export function normalizeHealthProfile(raw, now = new Date()) {
  const profile = {};
  const measurements = {};
  for (const [field, unit, min, max] of [
    ['heightCm', 'centimeter', 120, 230], ['weightKg', 'kilogram', 30, 300],
  ]) {
    const sample = raw[field];
    const value = sample?.unit === unit ? sample.value :
      field === 'heightCm' && sample?.unit === 'meter' ? sample.value * 100 : NaN;
    const date = Date.parse(sample?.startDate);
    if (!Number.isFinite(value) || value < min || value > max || !Number.isFinite(date) || date > now.getTime()) continue;
    profile[field] = Math.round(value * 10) / 10;
    measurements[field] = { measuredAt: new Date(date).toISOString() };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.birthDate || '')) {
    const [y, m, d] = raw.birthDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const age = now.getFullYear() - y - (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d) ? 1 : 0);
    if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d && age >= 15 && age <= 99) {
      profile.birthDate = raw.birthDate;
      profile.age = age;
    }
  }
  return { profile, measurements };
}

export async function readAndroidProfile(health, now = new Date()) {
  if (!(await health.isAvailable()).available) {
    throw new Error('Health Connect ist nicht verfügbar. Installiere oder aktualisiere Health Connect und versuche es erneut. Du kannst dein Profil auch manuell ausfüllen.');
  }
  const permissions = await health.requestAuthorization({ read: ['height', 'weight'], write: [], requestHistoryAccess: true });
  const startDate = permissions.historyAccessAuthorized ? '1900-01-01T00:00:00.000Z' : new Date(now.getTime() - 29 * 86400000).toISOString();
  const raw = {};
  const failed = [];
  for (const [dataType, field] of [['height', 'heightCm'], ['weight', 'weightKg']]) {
    if (!permissions.readAuthorized.includes(dataType)) continue;
    try {
      // The Android adapter sorts after fetching; limit 0 reads all pages so the newest record is not truncated away.
      const { samples } = await health.readSamples({ dataType, startDate, endDate: now.toISOString(), limit: 0, ascending: false });
      raw[field] = samples.filter(s => Number.isFinite(Date.parse(s.startDate)) && Date.parse(s.startDate) <= now.getTime())
        .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))[0];
    } catch { failed.push(dataType === 'height' ? 'Größe' : 'Gewicht'); }
  }
  return { ...normalizeHealthProfile(raw, now), historyLimited: !permissions.historyAccessAuthorized, failed };
}
