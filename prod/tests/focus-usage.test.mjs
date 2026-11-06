import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateDailyLimit,
  getUsageToday,
  normalizeUsageReport,
  usageStatsStep,
} from '../src/focus/usageStats.js';
import { createNotificationAdapter } from '../src/focus/notifications.js';

test('normalizeUsageReport: Plugin-Form bleibt erhalten, Top-5 sortiert', () => {
  const raw = {
    totalMinutes: 125,
    apps: [
      { packageName: 'com.twitter.android', minutes: 60 },
      { packageName: 'com.instagram.android', minutes: 40 },
      { packageName: 'a', minutes: 10 },
      { packageName: 'b', minutes: 8 },
      { packageName: 'c', minutes: 5 },
      { packageName: 'd', minutes: 2 }, // ueber Top-5 hinaus
    ],
  };
  const report = normalizeUsageReport(raw);
  assert.equal(report.available, true);
  assert.equal(report.totalMinutes, 125);
  assert.deepEqual(report.apps.map((a) => a.packageName), [
    'com.twitter.android', 'com.instagram.android', 'a', 'b', 'c',
  ]);
});

test('normalizeUsageReport: ungueltige/gebrochene Plugin-Daten => available:false', () => {
  for (const bad of [
    null, undefined, 'x', 42,
    { totalMinutes: 'unsinn', apps: [] },
    { totalMinutes: -3, apps: [] },
    { apps: [{ packageName: 'a', minutes: 5 }] }, // totalMinutes fehlt
  ]) {
    assert.deepEqual(normalizeUsageReport(bad), { available: false, totalMinutes: 0, apps: [], approximate: false }, JSON.stringify(bad));
  }
});

test('normalizeUsageReport: approximate-Flag des Kotlin-Fallbacks wird durchgereicht', () => {
  const exact = normalizeUsageReport({ totalMinutes: 30, apps: [], approximate: false });
  assert.equal(exact.approximate, false);
  const approx = normalizeUsageReport({ totalMinutes: 30, apps: [], approximate: true });
  assert.equal(approx.approximate, true);
  // Ungueltige Angabe => false (nie versehentlich "ungefaehr" behaupten).
  assert.equal(normalizeUsageReport({ totalMinutes: 30, apps: [], approximate: 'ja' }).approximate, false);
});

test('normalizeUsageReport: kaputte App-Eintraege werden gefiltert/run gerundet', () => {
  const report = normalizeUsageReport({
    totalMinutes: 30,
    apps: [
      { packageName: 5, minutes: 10 }, // packageName keine String
      { minutes: 10 },                 // packageName fehlt
      { packageName: 'ok', minutes: 3.4 }, // -> 3
      { packageName: 'null', minutes: 'x' }, // -> 0 -> gefiltert
      'muell',
    ],
  });
  assert.equal(report.available, true);
  assert.deepEqual(report.apps, [{ packageName: 'ok', minutes: 3 }]);
});

test('usageStatsStep: reine Naechste-Schritt-Entscheidung', () => {
  assert.equal(usageStatsStep({ pluginAvailable: false, granted: true }), 'unavailable');
  assert.equal(usageStatsStep({ pluginAvailable: false, granted: false }), 'unavailable');
  assert.equal(usageStatsStep({ pluginAvailable: true, granted: false }), 'needs-permission');
  assert.equal(usageStatsStep({ pluginAvailable: true, granted: undefined }), 'needs-permission');
  assert.equal(usageStatsStep({ pluginAvailable: true, granted: true }), 'ready');
});

test('getUsageToday: bereitgestellt, verweigert, fehlgeformt, Broker/Plugin-Fehler — nie Throw', async () => {
  const report = { totalMinutes: 88, apps: [{ packageName: 'x', minutes: 88 }] };

  const okPlugin = {
    hasPermission: async () => ({ granted: true }),
    getTodayUsage: async () => report,
  };
  assert.deepEqual(await getUsageToday(okPlugin), { available: true, report: normalizeUsageReport(report) });

  const noPerm = { hasPermission: async () => ({ granted: false }), getTodayUsage: async () => report };
  assert.deepEqual(await getUsageToday(noPerm), { available: false, reason: 'permission' });

  const garbage = { hasPermission: async () => ({ granted: true }), getTodayUsage: async () => 'muell' };
  assert.deepEqual(await getUsageToday(garbage), { available: false, reason: 'malformed-report' });

  const thrower = {
    hasPermission: async () => { throw new Error('Bridge weg'); },
    getTodayUsage: async () => report,
  };
  assert.deepEqual(await getUsageToday(thrower), { available: false, reason: 'error' });

  assert.deepEqual(await getUsageToday(null), { available: false, reason: 'plugin-missing' });
  assert.deepEqual(await getUsageToday({}), { available: false, reason: 'plugin-missing' }); // Methoden fehlen
});

test('evaluateDailyLimit: no-limit / unavailable / ok / over mit Restzeit', () => {
  // Ohne Limit: Status no-limit, aber der Messwert bleibt sichtbar.
  assert.deepEqual(evaluateDailyLimit({ available: true, totalMinutes: 100, apps: [] }, null), {
    status: 'no-limit', totalMinutes: 100, limitMinutes: null, remainingMinutes: null,
  });
  assert.deepEqual(evaluateDailyLimit({ available: true, totalMinutes: 100, apps: [] }, 'x'), {
    status: 'no-limit', totalMinutes: 100, limitMinutes: null, remainingMinutes: null,
  });
  assert.deepEqual(evaluateDailyLimit(null, 120), {
    status: 'unavailable', totalMinutes: 0, limitMinutes: 120, remainingMinutes: 120,
  });
  assert.deepEqual(evaluateDailyLimit({ available: true, totalMinutes: 100, apps: [] }, 120), {
    status: 'ok', totalMinutes: 100, limitMinutes: 120, remainingMinutes: 20,
  });
  assert.deepEqual(evaluateDailyLimit({ available: true, totalMinutes: 130, apps: [] }, 120), {
    status: 'over', totalMinutes: 130, limitMinutes: 120, remainingMinutes: -10,
  });
  // Grenzfall exakt am Limit gilt als over (ab dann wird gesperrt/warn angezeigt).
  assert.equal(evaluateDailyLimit({ available: true, totalMinutes: 120, apps: [] }, 120).status, 'over');
});

test('createNotificationAdapter ohne Plugin: verfuegbar=false, send() bleibt false', async () => {
  const adapter = createNotificationAdapter(null);
  assert.equal(adapter.available, false);
  assert.equal(await adapter.requestPermission(), 'plugin-missing');
  assert.equal(await adapter.send({ title: 'x', body: 'y' }), false);
});

function makePlugin({ display = 'prompt', after = 'granted', scheduleImpl = async () => {} } = {}) {
  return {
    checkPermissions: async () => ({ display }),
    requestPermissions: async () => ({ display: after }),
    schedule: scheduleImpl,
  };
}

test('createNotificationAdapter: Berechtigungsfluss prompt -> requestPermissions -> granted', async () => {
  const calls = [];
  const plugin = makePlugin({ display: 'prompt', after: 'granted' });
  const adapter = createNotificationAdapter(plugin);
  plugin.requestPermissions = async () => { calls.push('request'); return { display: 'granted' }; };
  assert.equal(await adapter.requestPermission(), 'granted');
  assert.deepEqual(calls, ['request']);
});

test('createNotificationAdapter: granted bleibt ohne request, denied bleibt denied', async () => {
  const plugin = makePlugin({ display: 'granted' });
  const adapter = createNotificationAdapter(plugin);
  plugin.requestPermissions = async () => { throw new Error('sollte nicht gerufen werden'); };
  assert.equal(await adapter.requestPermission(), 'granted');

  const denied = createNotificationAdapter(makePlugin({ display: 'denied' }));
  assert.equal(await denied.requestPermission(), 'denied');
});

test('createNotificationAdapter: send() nutzt schedule mit allowWhileIdle und id', async () => {
  const seen = [];
  const plugin = makePlugin({
    scheduleImpl: async (req) => { seen.push(req); },
  });
  const adapter = createNotificationAdapter(plugin);
  assert.equal(await adapter.send({ title: 'T', body: 'B' }), true);
  assert.equal(seen.length, 1);
  const n = seen[0].notifications[0];
  assert.equal(n.title, 'T');
  assert.equal(n.body, 'B');
  assert.deepEqual(n.schedule, { allowWhileIdle: true });
  assert.equal(Number.isInteger(n.id) && n.id >= 1, true);
});

test('createNotificationAdapter: schedule wirft => send() false, kein Crash', async () => {
  const plugin = makePlugin({ scheduleImpl: async () => { throw new Error('kein Kanal'); } });
  const adapter = createNotificationAdapter(plugin);
  assert.equal(await adapter.send({ title: 'T', body: 'B' }), false);
});

test('createNotificationAdapter: checkPermissions wirft => plugin-error', async () => {
  const plugin = makePlugin();
  plugin.checkPermissions = async () => { throw new Error('weg'); };
  const adapter = createNotificationAdapter(plugin);
  assert.equal(await adapter.requestPermission(), 'plugin-error');
});
