import test from 'node:test';
import assert from 'node:assert/strict';
import { explainReminderDecision, shouldRemindNow } from '../src/focus/remind.js';

// Lokale Zeit-Konstruktion, damit die Tests in jeder Zeitzone deterministisch sind.
const at = (y, mo, d, h, mi) => new Date(y, mo - 1, d, h, mi, 0, 0);

test('keine Erinnerung, wenn der Mindest-Log erfuellt ist', () => {
  const now = at(2026, 11, 6, 11, 0);
  assert.equal(shouldRemindNow(true, now, {}), false);
  assert.equal(shouldRemindNow(true, now, { lastRemindedOn: null }), false);
});

test('keine Erinnerung vor remindHour, ab remindHour ja', () => {
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 9, 59), { remindHour: 10 }), false);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 10, 0), { remindHour: 10 }), true);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 9, 59), { remindHour: 0 }), true);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 23, 30), { remindHour: 22 }), true);
});

test('Default-Erinnerungsstunde ist 10 Uhr (Konzept Stufe 0)', () => {
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 9, 0), null), false);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 10, 30)), true);
});

test('keine Erinnerung waehrend der Ruhezeit', () => {
  const quiet = { quietStartHour: 12, quietEndHour: 18 };
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 13, 0), quiet), false);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 11, 59), quiet), true);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 18, 0), quiet), true);
});

test('Ruhezeit darf ueber Mitternacht laufen', () => {
  const quiet = { remindHour: 6, quietStartHour: 22, quietEndHour: 7 };
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 5, 0), quiet), false);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 23, 30), quiet), false);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 7, 0), quiet), true);
});

test('unvollstaendige Ruhezeit-Angaben deaktivieren die Ruhezeit', () => {
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 13, 0), { quietStartHour: 12 }), true);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 13, 0), { quietEndHour: 18 }), true);
  assert.equal(
    shouldRemindNow(false, at(2026, 11, 6, 13, 0), { quietStartHour: 12, quietEndHour: 12 }),
    true,
  );
  // Regression: fehlendes quiet Ende darf KEIN Mitternachtsfenster ab quietStart bauen
  // (Number(null) === 0-Bug): 23:30 bleibt mit halbem Paar erinnerbar.
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 23, 30), { quietStartHour: 22 }), true);
  // Explizite Stunde 0 als Start bleibt gueltig (0–7 Ruhezeit).
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 3, 0), { quietStartHour: 0, quietEndHour: 7 }), false);
});

test('hoechstens einmal pro Tag: lastRemindedOn blockt nur denselben Kalendertag', () => {
  const settings = { lastRemindedOn: '2026-11-06' };
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 11, 0), settings), false);
  assert.equal(shouldRemindNow(false, at(2026, 11, 7, 11, 0), settings), true);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 11, 0), { lastRemindedOn: '2026-11-05' }), true);
});

test('ungueltige now-Angabe => keine Erinnerung', () => {
  assert.equal(shouldRemindNow(false, null, {}), false);
  assert.equal(shouldRemindNow(false, 'unsinn', {}), false);
  assert.equal(shouldRemindNow(false, Number.NaN, {}), false);
});

test('ungueltige remindHour faellt auf den Default 10 zurueck', () => {
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 9, 0), { remindHour: 24 }), false);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 9, 0), { remindHour: 'x' }), false);
  assert.equal(shouldRemindNow(false, at(2026, 11, 6, 10, 0), { remindHour: 'x' }), true);
});

test('explainReminderDecision liefert stabil geordnete Gruende', () => {
  const quiet = { quietStartHour: 12, quietEndHour: 18 };
  assert.deepEqual(explainReminderDecision(true, at(2026, 11, 6, 13, 0), quiet), {
    remind: false, reason: 'minimum-log-met',
  });
  assert.deepEqual(explainReminderDecision(false, null, {}), {
    remind: false, reason: 'invalid-now',
  });
  assert.deepEqual(explainReminderDecision(false, at(2026, 11, 6, 9, 0), quiet), {
    remind: false, reason: 'before-remind-hour',
  });
  assert.deepEqual(explainReminderDecision(false, at(2026, 11, 6, 13, 0), quiet), {
    remind: false, reason: 'quiet-time',
  });
  assert.deepEqual(
    explainReminderDecision(false, at(2026, 11, 6, 8, 0), { lastRemindedOn: '2026-11-06' }),
    { remind: false, reason: 'before-remind-hour' }, // vor remindHour schlaegt bereits-erinnert nicht
  );
  assert.deepEqual(
    explainReminderDecision(false, at(2026, 11, 6, 11, 0), { lastRemindedOn: '2026-11-06' }),
    { remind: false, reason: 'already-reminded-today' },
  );
  assert.deepEqual(explainReminderDecision(false, at(2026, 11, 6, 11, 0), {}), {
    remind: true, reason: 'remind',
  });
});

test('shouldRemindNow bleibt konsistent mit explainReminderDecision', () => {
  for (const [met, now, s] of [
    [true, at(2026, 11, 6, 11, 0), {}],
    [false, at(2026, 11, 6, 9, 0), {}],
    [false, at(2026, 11, 6, 13, 0), { quietStartHour: 12, quietEndHour: 18 }],
    [false, at(2026, 11, 6, 11, 0), { lastRemindedOn: '2026-11-06' }],
    [false, at(2026, 11, 6, 11, 0), {}],
    [false, undefined, {}],
  ]) {
    assert.equal(shouldRemindNow(met, now, s), explainReminderDecision(met, now, s).remind);
  }
});
