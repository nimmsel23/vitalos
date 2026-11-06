import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldRemindNow } from '../src/focus/remind.js';

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
