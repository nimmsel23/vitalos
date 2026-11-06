import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_FOCUS_SETTINGS,
  FOCUS_SETTINGS_KEY,
  createMemoryStorage,
  normalizeFocusSettings,
  readFocusSettings,
  writeFocusSettings,
} from '../src/focus/settings.js';

test('Defaults: remindHour 10, keine Ruhezeit, kein Limit, nichts erinnert', () => {
  assert.deepEqual(DEFAULT_FOCUS_SETTINGS, {
    remindHour: 10,
    quietStartHour: null,
    quietEndHour: null,
    lastRemindedOn: null,
    dailyMinutesLimit: null,
  });
  assert.equal(Object.isFrozen(DEFAULT_FOCUS_SETTINGS), true);
});

test('normalizeFocusSettings: leere/ungueltige Eingaben werden konservativ normalisiert', () => {
  const d = DEFAULT_FOCUS_SETTINGS;
  for (const [raw, expected] of [
    [null, { remindHour: 10, quietStartHour: null, quietEndHour: null, lastRemindedOn: null, dailyMinutesLimit: null }],
    [{}, { remindHour: 10, quietStartHour: null, quietEndHour: null, lastRemindedOn: null, dailyMinutesLimit: null }],
    [{ remindHour: 24 }, { remindHour: d.remindHour, quietStartHour: null, quietEndHour: null, lastRemindedOn: null, dailyMinutesLimit: null }],
    [{ remindHour: 'x' }, { remindHour: d.remindHour, quietStartHour: null, quietEndHour: null, lastRemindedOn: null, dailyMinutesLimit: null }],
    [{ quietStartHour: 22, quietEndHour: 'unsinn' }, { remindHour: 10, quietStartHour: 22, quietEndHour: null, lastRemindedOn: null, dailyMinutesLimit: null }],
    [{ lastRemindedOn: '6.11.2026' }, { remindHour: 10, quietStartHour: null, quietEndHour: null, lastRemindedOn: null, dailyMinutesLimit: null }],
    [{ dailyMinutesLimit: -5 }, { remindHour: 10, quietStartHour: null, quietEndHour: null, lastRemindedOn: null, dailyMinutesLimit: null }],
  ]) {
    assert.deepEqual(normalizeFocusSettings(raw), expected);
  }
});

test('normalizeFocusSettings: gueltige W bleiben erhalten', () => {
  const raw = { remindHour: 9, quietStartHour: 22, quietEndHour: 7, lastRemindedOn: '2026-11-06', dailyMinutesLimit: 120 };
  assert.deepEqual(normalizeFocusSettings(raw), raw);
});

test('normalizeFocusSettings: explizites null bleibt null, Stunde 0 bleibt 0 (kein Number(null)===0)', () => {
  // Regression: Number(null) === 0 — stilles null darf nicht zu Mitternachts-Ruhezeit werden.
  assert.deepEqual(
    normalizeFocusSettings({ quietStartHour: null, quietEndHour: null }),
    { remindHour: 10, quietStartHour: null, quietEndHour: null, lastRemindedOn: null, dailyMinutesLimit: null },
  );
  assert.equal(normalizeFocusSettings({ quietStartHour: 22, quietEndHour: null }).quietEndHour, null);
  assert.deepEqual(normalizeFocusSettings({ quietStartHour: 0, quietEndHour: 7 }), {
    remindHour: 10, quietStartHour: 0, quietEndHour: 7, lastRemindedOn: null, dailyMinutesLimit: null,
  });
});

test('Storage-Naht: fehlender/defekter Schluessel fuehrt zu Defaults', () => {
  const empty = createMemoryStorage();
  assert.deepEqual(readFocusSettings(empty), normalizeFocusSettings(null));

  const broken = createMemoryStorage(new Map([[FOCUS_SETTINGS_KEY, '{kein json']]));
  assert.deepEqual(readFocusSettings(broken), normalizeFocusSettings(null));
});

test('Storage-Naht: schreiben und lesen rundet ueber Normalisierung', () => {
  const storage = createMemoryStorage();
  const written = writeFocusSettings(storage, { remindHour: '8', quietStartHour: 22, quietEndHour: 7, dailyMinutesLimit: 90, muell: 'weg' });
  assert.deepEqual(written, {
    remindHour: 8, quietStartHour: 22, quietEndHour: 7, lastRemindedOn: null, dailyMinutesLimit: 90,
  });
  assert.deepEqual(readFocusSettings(storage), written);
  assert.equal(typeof storage.getItem(FOCUS_SETTINGS_KEY), 'string');
});
