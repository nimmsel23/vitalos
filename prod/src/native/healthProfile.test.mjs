import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHealthProfile, readAndroidProfile } from './healthProfile.mjs';

const now = new Date('2026-11-14T12:00:00Z');
const sample = (value, unit, startDate = '2026-10-12T10:00:00Z') => ({ value, unit, startDate });
test('normalizes profile units and preserves measurement dates', () => {
  const result = normalizeHealthProfile({ heightCm: sample(1.82, 'meter'), weightKg: sample(78.24, 'kilogram'), birthDate: '1986-11-15' }, now);
  assert.deepEqual(result.profile, { heightCm: 182, weightKg: 78.2, birthDate: '1986-11-15', age: 39 });
  assert.equal(result.measurements.weightKg.measuredAt, '2026-10-12T10:00:00.000Z');
});
test('rejects invalid, future, unsupported-unit and out-of-profile values without defaults', () => {
  assert.deepEqual(normalizeHealthProfile({ heightCm: sample(999, 'centimeter'), weightKg: sample(70, 'pounds'), birthDate: '2026-02-31' }, now).profile, {});
  assert.deepEqual(normalizeHealthProfile({ heightCm: sample(180, 'centimeter', 'bad'), weightKg: sample(75, 'kilogram', '2030-01-01') }, now).profile, {});
  assert.deepEqual(normalizeHealthProfile({}, now), { profile: {}, measurements: {} });
});
test('birthday and leap dates calculate age correctly', () => {
  assert.equal(normalizeHealthProfile({ birthDate: '1986-11-14' }, now).profile.age, 40);
  assert.equal(normalizeHealthProfile({ birthDate: '2000-02-29' }, now).profile.age, 26);
  assert.deepEqual(normalizeHealthProfile({ birthDate: '2001-02-29' }, now).profile, {});
});
test('Android requests only profile reads and finds newest record without page truncation', async () => {
  const calls = [];
  const result = await readAndroidProfile({
    isAvailable: async () => ({ available: true }),
    requestAuthorization: async options => { assert.deepEqual(options, { read: ['height', 'weight'], write: [], requestHistoryAccess: true }); return { readAuthorized: ['height', 'weight'], historyAccessAuthorized: true }; },
    readSamples: async options => { calls.push(options); return { samples: [sample(options.dataType === 'height' ? 170 : 70, options.dataType === 'height' ? 'centimeter' : 'kilogram'), sample(options.dataType === 'height' ? 180 : 80, options.dataType === 'height' ? 'centimeter' : 'kilogram', '2026-11-13T10:00:00Z')] }; },
  }, now);
  assert.deepEqual(result.profile, { heightCm: 180, weightKg: 80 });
  assert.equal(calls[0].limit, 0);
  assert.equal(calls[0].startDate, '1900-01-01T00:00:00.000Z');
});
test('partial denial and old providers preserve missing fields and restrict history', async () => {
  const result = await readAndroidProfile({ isAvailable: async () => ({ available: true }), requestAuthorization: async () => ({ readAuthorized: ['weight'] }), readSamples: async options => { assert.equal(options.dataType, 'weight'); assert.equal(options.startDate, '2026-10-16T12:00:00.000Z'); return { samples: [sample(74, 'kilogram')] }; } }, now);
  assert.deepEqual(result.profile, { weightKg: 74 });
  assert.equal(result.historyLimited, true);
});
test('one read failing does not discard the other and denial never queries', async () => {
  const result = await readAndroidProfile({ isAvailable: async () => ({ available: true }), requestAuthorization: async () => ({ readAuthorized: ['height', 'weight'] }), readSamples: async o => { if (o.dataType === 'height') throw Error('denied'); return { samples: [sample(75, 'kilogram')] }; } }, now);
  assert.deepEqual(result.profile, { weightKg: 75 });
  assert.deepEqual(result.failed, ['Größe']);
  const denied = await readAndroidProfile({ isAvailable: async () => ({ available: true }), requestAuthorization: async () => ({ readAuthorized: [] }), readSamples: async () => { throw Error('must not query'); } }, now);
  assert.deepEqual(denied.profile, {});
});
test('unavailable devices do not request permissions', async () => {
  await assert.rejects(readAndroidProfile({ isAvailable: async () => ({ available: false }), requestAuthorization: () => { throw Error('must not request'); } }, now), /nicht verfügbar/);
});
