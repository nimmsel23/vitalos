import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

// The workspace already installs the rules testing SDK for Plan.
const require = createRequire(resolve('plan-app/package.json'));
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc } = require('firebase/firestore');
const env = await initializeTestEnvironment({
  projectId: 'demo-vitalos-product',
  firestore: { rules: readFileSync('firestore.product.rules', 'utf8') },
});
try {
  const alice = env.authenticatedContext('alice').firestore();
  const bob = env.authenticatedContext('bob').firestore();
  const oldPrivateUid = env.authenticatedContext('59ole36uNpNwml5H6VDYCXyCME92', { coach: true }).firestore();
  const anonymous = env.unauthenticatedContext().firestore();
  const records = ['fitness/alice/dailyExecution/2026-11-04', 'fitness/alice/sessions/s1', 'nutrition/alice/logs/2026-11-04', 'relax/alice/sessions/2026-11-04', 'journal/alice/entries/j1'];
  for (const path of records) {
    await assertSucceeds(setDoc(doc(alice, path), { value: 1 }));
    await assertSucceeds(getDoc(doc(alice, path)));
    await assertFails(getDoc(doc(bob, path)));
    await assertFails(setDoc(doc(bob, path), { value: 2 }));
    await assertFails(getDoc(doc(oldPrivateUid, path)));
    await assertFails(getDoc(doc(anonymous, path)));
  }
  // Incoming userId must not grant write access under another owner's path.
  const victimHabit = 'fitness/alice/habitJournals/h1';
  await assertSucceeds(setDoc(doc(alice, victimHabit), { userId: 'alice', text: 'private' }));
  await assertFails(setDoc(doc(bob, victimHabit), { userId: 'bob', text: 'overwrite' }));
  await assertSucceeds(setDoc(doc(alice, 'fitness/alice/sessions/s2'), { userId: 'bob', value: 1 }));
  await assertFails(getDoc(doc(bob, 'fitness/alice/sessions/s2')));
  await assertFails(setDoc(doc(bob, 'googleTokens/alice/habitJournals/h1'), { userId: 'bob' }));
  for (const path of ['googleTokens/alice', 'smartLoggingEntitlements/alice', 'smartLoggingQuotas/alice/weeks/2026-W45', 'smartLoggingRequests/alice/requests/r1', 'smartLoggingConfig/default']) {
    await assertFails(getDoc(doc(alice, path)));
    await assertFails(setDoc(doc(alice, path), { value: 1 }));
  }
  console.log('PASS product rules: owner access, cross-user isolation and server-only paths');
} finally {
  await env.cleanup();
}
