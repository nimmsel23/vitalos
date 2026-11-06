import test from 'node:test';
import assert from 'node:assert/strict';
import { createReminderController, FOCUS_REMINDER_NOTIFICATION } from '../src/focus/controller.js';
import { createMinimumLogAdapter } from '../src/focus/minimumLogAdapter.js';
import { createMemoryStorage, readFocusSettings, writeFocusSettings } from '../src/focus/settings.js';

const at = (y, mo, d, h, mi) => new Date(y, mo - 1, d, h, mi, 0, 0);

// Vollstaendige Fake-App: Storage + Controller mit injizierten Deps.
function makeApp({ met = false, notifyOk = true, now, storage = createMemoryStorage() }) {
  const sent = [];
  const saved = [];
  const controller = createReminderController({
    getMinimumLogMet: async () => met,
    loadSettings: async () => readFocusSettings(storage),
    saveSettings: async (s) => { saved.push(s); writeFocusSettings(storage, s); },
    sendNotification: async (n) => {
      if (!notifyOk) return false;
      sent.push(n);
      return true;
    },
    now,
  });
  return { controller, storage, sent, saved };
}

test('fehlt: feuert, sendet Text, schreibt lastRemindedOn; zweiter Aufruf blockt', async () => {
  const now = () => at(2026, 11, 6, 11, 0);
  const { controller, storage, sent, saved } = makeApp({ met: false, now });
  const first = await controller.checkToday();
  assert.equal(first.sent, true);
  assert.equal(first.reason, 'sent');
  assert.deepEqual(sent, [FOCUS_REMINDER_NOTIFICATION]);
  assert.equal(saved.length, 1);
  assert.equal(readFocusSettings(storage).lastRemindedOn, '2026-11-06');

  const second = await controller.checkToday();
  assert.equal(second.sent, false);
  assert.equal(second.reason, 'already-reminded-today');
  assert.equal(sent.length, 1); // keine zweite Benachrichtigung
});

test('Mindest-Log erfuellt: keine Erinnerung, kein Schreiben', async () => {
  const { controller, sent, saved } = makeApp({ met: true, now: () => at(2026, 11, 6, 11, 0) });
  const res = await controller.checkToday();
  assert.equal(res.reason, 'minimum-log-met');
  assert.equal(res.sent, false);
  assert.deepEqual(sent, []);
  assert.deepEqual(saved, []);
});

test('Log-Adapter wirft: konservativ NICHT erinnern (kein Spam bei kaputten Daten)', async () => {
  const { controller, storage, sent } = makeApp({ now: () => at(2026, 11, 6, 11, 0) });
  const broken = createReminderController({
    getMinimumLogMet: async () => { throw new Error('journal weg'); },
    loadSettings: async () => readFocusSettings(storage),
    saveSettings: async () => {},
    sendNotification: async (n) => { sent.push(n); return true; },
    now: () => at(2026, 11, 6, 11, 0),
  });
  void controller;
  const res = await broken.checkToday();
  assert.deepEqual(res, {
    sent: false,
    reason: 'minimum-log-unavailable',
    settings: readFocusSettings(storage),
  });
  assert.deepEqual(sent, []);
});

test('Benachrichtigung schlaegt fehl: KEIN lastRemindedOn, Retry am selben Tag moeglich', async () => {
  const storage = createMemoryStorage();
  const now = () => at(2026, 11, 6, 11, 0);
  const failing = makeApp({ met: false, notifyOk: false, now, storage });
  const failed = await failing.controller.checkToday();
  assert.equal(failed.sent, false);
  assert.equal(failed.reason, 'notification-failed');
  assert.equal(readFocusSettings(storage).lastRemindedOn, null);

  // Adapter reparieren => am selben Tag erneut probieren und feuern.
  const retried = makeApp({ met: false, now: () => at(2026, 11, 6, 12, 0), storage });
  const res = await retried.controller.checkToday();
  assert.equal(res.sent, true);
  assert.equal(readFocusSettings(storage).lastRemindedOn, '2026-11-06');
});

test('Benachrichtigungs-Adapter wirft => wie fehlgeschlagen, kein Crash', async () => {
  const storage = createMemoryStorage();
  const controller = createReminderController({
    getMinimumLogMet: async () => false,
    loadSettings: async () => readFocusSettings(storage),
    saveSettings: async (s) => writeFocusSettings(storage, s),
    sendNotification: async () => { throw new Error('kein Plugin'); },
    now: () => at(2026, 11, 6, 11, 0),
  });
  const res = await controller.checkToday();
  assert.equal(res.sent, false);
  assert.equal(res.reason, 'notification-failed');
  assert.equal(readFocusSettings(storage).lastRemindedOn, null);
});

test('Ruhezeit-Einstellungen wirken bis in den Controller (Grunddurchreichung)', async () => {
  const storage = createMemoryStorage();
  writeFocusSettings(storage, { quietStartHour: 12, quietEndHour: 18 });
  const { controller, sent } = makeApp({ met: false, now: () => at(2026, 11, 6, 13, 0), storage });
  const res = await controller.checkToday();
  assert.equal(res.reason, 'quiet-time');
  assert.equal(res.sent, false);
  assert.deepEqual(sent, []);
});

test('saveSettings wirft: Benachrichtigung bleibt gaeltig, kein Crash, sent true', async () => {
  const controller = createReminderController({
    getMinimumLogMet: async () => false,
    loadSettings: async () => ({}),
    saveSettings: async () => { throw new Error('disk voll'); },
    sendNotification: async () => true,
    now: () => at(2026, 11, 6, 11, 0),
  });
  const res = await controller.checkToday();
  assert.equal(res.sent, true);
  assert.equal(res.reason, 'sent');
});

test('createMinimumLogAdapter: reicht Entries/Habits/options/now an hasMinimumLogToday durch', async () => {
  const seen = [];
  const entries = [{ id: 'e1' }];
  const habits = [{ id: 'h1' }];
  const now = at(2026, 11, 6, 11, 0);
  const adapter = createMinimumLogAdapter({
    hasMinimumLogToday: (e, h, n, o) => { seen.push({ e, h, n, o }); return true; },
    loadEntries: async () => entries,
    loadHabitCompletions: async () => habits,
    options: { rule: 'journal', requiredBeforeHour: 10 },
  });
  assert.equal(await adapter(now), true);
  assert.deepEqual(seen, [{ e: entries, h: habits, n: now, o: { rule: 'journal', requiredBeforeHour: 10 } }]);
});

test('createMinimumLogAdapter: Truthy-Wert wird zu echtem boolean, eloquente Form bleibt unwichtig', async () => {
  const adapter = createMinimumLogAdapter({
    hasMinimumLogToday: () => 'vergleichbar-truthy',
    loadEntries: async () => [],
    loadHabitCompletions: async () => [],
  });
  assert.equal(await adapter(new Date()), true); // Boolean-Coercion
  const adapterOne = createMinimumLogAdapter({
    hasMinimumLogToday: () => 1,
    loadEntries: async () => [],
    loadHabitCompletions: async () => [],
  });
  assert.equal(await adapterOne(new Date()), true);
  const adapterZero = createMinimumLogAdapter({
    hasMinimumLogToday: () => 0,
    loadEntries: async () => [],
    loadHabitCompletions: async () => [],
  });
  assert.equal(await adapterZero(new Date()), false);
});

test('createMinimumLogAdapter: fehlende Funktion wirft; Controller macht daraus minimum-log-unavailable', async () => {
  const broken = createMinimumLogAdapter({
    loadEntries: async () => [],
    loadHabitCompletions: async () => [],
  });
  await assert.rejects(() => broken(new Date()));
  const failLoader = createMinimumLogAdapter({
    hasMinimumLogToday: () => true,
    loadEntries: async () => { throw new Error('Store weg'); },
    loadHabitCompletions: async () => [],
  });
  await assert.rejects(() => failLoader(new Date()));

  const settings = createMemoryStorage();
  const sent = [];
  const controller = createReminderController({
    getMinimumLogMet: failLoader,
    loadSettings: async () => readFocusSettings(settings),
    saveSettings: async (s) => writeFocusSettings(settings, s),
    sendNotification: async (n) => { sent.push(n); return true; },
    now: () => at(2026, 11, 6, 11, 0),
  });
  const res = await controller.checkToday();
  assert.deepEqual(res, {
    sent: false,
    reason: 'minimum-log-unavailable',
    settings: readFocusSettings(settings),
  });
  assert.deepEqual(sent, []);
});
