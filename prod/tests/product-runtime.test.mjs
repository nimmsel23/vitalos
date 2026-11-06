import test from 'node:test';
import assert from 'node:assert/strict';
import { isProductBuild, relaxApiBase } from '../src/cloud/productRuntime.js';

test('product Relax requests never target the private host', () => {
  for (const host of ['vitalos-prod.web.app', 'example.firebaseapp.com', 'localhost']) {
    assert.equal(relaxApiBase(host, true), '/relax-api');
  }
});

test('private and local environments retain their existing routes', () => {
  assert.equal(relaxApiBase('fitness-aos.web.app', false), 'https://ideapad.tail7a15d6.ts.net/relax-api');
  assert.equal(relaxApiBase('localhost', false), '/relax-api');
  assert.equal(isProductBuild(), false);
});
