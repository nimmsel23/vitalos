import test from 'node:test';
import assert from 'node:assert/strict';
import { runReminderCheck, REMINDER_STORAGE_KEY } from '../src/focus/reminderRunner.js';

function fakes({ display = 'granted', stored = null, scheduleFails = false } = {}) {
  const calls = { schedule: [], set: [] };
  return {
    calls,
    plugin: {
      checkPermissions: async () => ({ display }),
      schedule: async (arg) => { if (scheduleFails) throw new Error('boom'); calls.schedule.push(arg); },
    },
    storage: { get: async () => stored, set: async (k, v) => { calls.set.push([k, v]); } },
  };
}
const noon = new Date(2026, 10, 6, 12, 0, 0);

test('fehlender Log + Erlaubnis: plant Erinnerung und merkt den Tag', async () => {
  const f = fakes();
  assert.equal(await runReminderCheck({ ...f, minimumLogMet: false, now: noon }), 'scheduled');
  assert.equal(f.calls.schedule.length, 1);
  assert.deepEqual(f.calls.set, [[REMINDER_STORAGE_KEY, '2026-11-06']]);
});

test('Mindest-Log erfuellt: nichts passiert', async () => {
  const f = fakes();
  assert.equal(await runReminderCheck({ ...f, minimumLogMet: true, now: noon }), 'skipped');
  assert.equal(f.calls.schedule.length, 0);
});

test('heute schon erinnert: zweites Mal uebersprungen', async () => {
  const f = fakes({ stored: '2026-11-06' });
  assert.equal(await runReminderCheck({ ...f, minimumLogMet: false, now: noon }), 'skipped');
});

test('ohne Erlaubnis: needs-permission, nichts geplant oder gespeichert', async () => {
  const f = fakes({ display: 'prompt' });
  assert.equal(await runReminderCheck({ ...f, minimumLogMet: false, now: noon }), 'needs-permission');
  assert.equal(f.calls.schedule.length, 0);
  assert.equal(f.calls.set.length, 0);
});

test('Planen schlaegt fehl: error, Tag wird nicht gemerkt (zweiter Versuch moeglich)', async () => {
  const f = fakes({ scheduleFails: true });
  assert.equal(await runReminderCheck({ ...f, minimumLogMet: false, now: noon }), 'error');
  assert.equal(f.calls.set.length, 0);
});

test('vor remindHour und ungueltige Zeit: skipped', async () => {
  const f = fakes();
  assert.equal(await runReminderCheck({ ...f, minimumLogMet: false, now: new Date(2026, 10, 6, 8, 0), settings: { remindHour: 10 } }), 'skipped');
  assert.equal(await runReminderCheck({ ...f, minimumLogMet: false, now: 'kaputt' }), 'skipped');
});
