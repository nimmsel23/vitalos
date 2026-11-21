// Root-firestore.rules im Emulator. Start nur über den Emulator, Demo-Projekt,
// keine echten Credentials:
//   pnpm test:firestore-rules
//
// exerciseVideos-Zielmodell (vitalos#50): fremdes Konto darf nicht überschreiben
// oder löschen, der Uploader darf, ein Coach darf update/delete, storagePath ist
// genau exerciseVideos/{exerciseId}/{uploaderUid}. Davon weicht master ab
// (Coach bleibt ausgeschlossen, storagePath akzeptiert jedes Uid-Segment).
// Diese Fälle laufen mit FIRESTORE_RULES_EXERCISE_VIDEOS=1.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const PROJECT_ID = 'demo-vitalos-rules';
const OWNER = 'alice';
const OTHER = 'bob';
const COACH = 'coach-claim';
const COACH_ROLE = 'coach-role';
const LEGACY_COACH = '59ole36uNpNwml5H6VDYCXyCME92';
const ENFORCE_EXERCISE_VIDEO_TARGET = process.env.FIRESTORE_RULES_EXERCISE_VIDEOS === '1';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rules = readFileSync(resolve(root, 'firestore.rules'), 'utf8');

const none = { read: false, create: false, update: false, delete: false };
const readOnly = { read: true, create: false, update: false, delete: false };
const all = { read: true, create: true, update: true, delete: true };
const readCreate = { read: true, create: true, update: false, delete: false };
const readUpdate = { read: true, create: true, update: true, delete: false };

const results = [];

function serverTimestamp() {
  return firebase.firestore.FieldValue.serverTimestamp();
}

function value(source, actor) {
  return typeof source === 'function' ? source(actor) : source;
}

function selfie(date = '2026-11-21') {
  return {
    date,
    dataUrl: 'data:image/jpeg;base64,qqqq',
  };
}

function skillsEvent(eventId = 'evt1', stageId = 'muscle-up/first') {
  return {
    id: eventId,
    schemaVersion: 1,
    catalogVersion: 1,
    type: 'legacy',
    skillId: 'muscle-up',
    stageId,
    at: '2026-11-21T08:00:00.000Z',
    payload: {},
  };
}

function message(actor) {
  const coach = actor.kind === 'coach';
  return {
    body: 'hallo',
    senderUid: actor.uid,
    senderRole: coach ? 'coach' : 'client',
    createdAt: serverTimestamp(),
    plan: null,
  };
}

function planEntry(actor) {
  const coach = actor.kind === 'coach';
  return {
    body: 'notiz',
    senderUid: actor.uid,
    senderRole: coach ? 'coach' : 'client',
    createdAt: serverTimestamp(),
  };
}

function readState() {
  return { lastReadAt: serverTimestamp() };
}

function command(actor) {
  return {
    action: 'approve',
    item_id: 'item-1',
    payload: { source: 'rules-test' },
    requested_by: actor.uid,
    status: 'queued',
  };
}

function videoBody(exerciseId, uploaderUid, createdAt, storageSuffix = uploaderUid) {
  return {
    exerciseId,
    storagePath: `exerciseVideos/${exerciseId}/${storageSuffix}`,
    uploaderUid,
    createdAt,
    duration: 12,
    status: 'pending',
    contentType: 'video/mp4',
    sizeBytes: 1024,
  };
}

let env;

function database(actor) {
  if (!actor.db) actor.db = actor.ctx.firestore();
  return actor.db;
}

async function seed(path, data) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().doc(path).set(data);
  });
}

async function wipe(path) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().doc(path).delete();
  });
}

async function check(name, allowed, promise) {
  try {
    if (allowed) await assertSucceeds(promise);
    else await assertFails(promise);
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error });
    console.error(`FAIL ${name}\n  ${error instanceof Error ? error.message : error}`);
  }
}

async function runTree(tree, actors) {
  if (tree.before) await tree.before();
  const mark = results.length;
  const cast = tree.actors ?? [actors.owner, actors.other, actors.coach, actors.anon];
  for (const actor of cast) {
    const path = typeof tree.path === 'function' ? tree.path(actor) : tree.path;
    const access = tree.access[actor.id];
    const seeded = value(tree.seed ?? tree.data, actor);
    const created = value(tree.create ?? tree.data, actor);
    await seed(path, seeded);
    await check(`${tree.name} ${actor.id} read`, access.read, database(actor).doc(path).get());
    await wipe(path);
    await check(`${tree.name} ${actor.id} create`, access.create, database(actor).doc(path).set(created));
    await seed(path, seeded);
    await check(`${tree.name} ${actor.id} update`, access.update, database(actor).doc(path).set(created));
    await seed(path, seeded);
    await check(`${tree.name} ${actor.id} delete`, access.delete, database(actor).doc(path).delete());
  }
  const failed = results.slice(mark).filter((item) => !item.ok).length;
  console.log(`${failed ? 'FAIL' : 'ok'} ${tree.name}${failed ? ` (${failed})` : ''}`);
}

async function spot(name, actor, path, data, access) {
  await seed(path, data);
  await check(`${name} read`, access.read, database(actor).doc(path).get());
  await wipe(path);
  await check(`${name} create`, access.create, database(actor).doc(path).set(data));
  await seed(path, data);
  await check(`${name} update`, access.update, database(actor).doc(path).set(data));
  await seed(path, data);
  await check(`${name} delete`, access.delete, database(actor).doc(path).delete());
}

async function exerciseVideos(actors) {
  const exerciseId = 'pushup';
  const path = `exerciseVideos/${exerciseId}`;
  await wipe(path);
  await check('exerciseVideos anon read', false, database(actors.anon).doc(path).get());
  await check(
    'exerciseVideos anon create',
    false,
    database(actors.anon).doc(path).set(videoBody(exerciseId, OWNER, serverTimestamp())),
  );
  await check(
    'exerciseVideos uploader create',
    true,
    database(actors.owner).doc(path).set(videoBody(exerciseId, OWNER, serverTimestamp())),
  );
  await check('exerciseVideos other read', true, database(actors.other).doc(path).get());
  await check('exerciseVideos coach read', true, database(actors.coach).doc(path).get());

  let createdAt;
  await env.withSecurityRulesDisabled(async (ctx) => {
    createdAt = (await ctx.firestore().doc(path).get()).data().createdAt;
  });
  const kept = videoBody(exerciseId, OWNER, createdAt);
  kept.status = 'approved';
  await check('exerciseVideos other overwrite', false, database(actors.other).doc(path).set(kept));
  await check('exerciseVideos other delete', false, database(actors.other).doc(path).delete());
  await check('exerciseVideos anon delete', false, database(actors.anon).doc(path).delete());
  await check('exerciseVideos uploader update', true, database(actors.owner).doc(path).set(kept));
  await check('exerciseVideos uploader delete', true, database(actors.owner).doc(path).delete());
  console.log('ok exerciseVideos (master: Uploader, kein fremdes Überschreiben/Löschen)');

  if (!ENFORCE_EXERCISE_VIDEO_TARGET) {
    console.log(
      'SKIP exerciseVideos Zielmodell (vitalos#50): Coach darf update/delete und storagePath muss exerciseVideos/{exerciseId}/{uploaderUid} sein. Gegen master ist das eine bekannte Abweichung. Aktivieren mit FIRESTORE_RULES_EXERCISE_VIDEOS=1.',
    );
    return;
  }

  const squat = 'exerciseVideos/squat';
  await wipe(squat);
  await check(
    'exerciseVideos storagePath fremdes Segment',
    false,
    database(actors.owner).doc(squat).set(videoBody('squat', OWNER, serverTimestamp(), 'notalice')),
  );
  await wipe(squat);
  await check(
    'exerciseVideos storagePath uploaderUid',
    true,
    database(actors.owner).doc(squat).set(videoBody('squat', OWNER, serverTimestamp())),
  );
  let squatCreatedAt;
  await env.withSecurityRulesDisabled(async (ctx) => {
    squatCreatedAt = (await ctx.firestore().doc(squat).get()).data().createdAt;
  });
  const coachUpdate = videoBody('squat', OWNER, squatCreatedAt);
  coachUpdate.status = 'approved';
  await check('exerciseVideos coach update', true, database(actors.coach).doc(squat).set(coachUpdate));
  await check('exerciseVideos coach delete', true, database(actors.coach).doc(squat).delete());
  const targetFailed = ['storagePath fremdes Segment', 'storagePath uploaderUid', 'coach update', 'coach delete']
    .filter((label) => results.some((item) => item.name === `exerciseVideos ${label}` && !item.ok));
  console.log(`${targetFailed.length ? 'FAIL' : 'ok'} exerciseVideos Zielmodell${targetFailed.length ? ` (${targetFailed.join(', ')})` : ''}`);
}

async function main() {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('FIRESTORE_EMULATOR_HOST fehlt. Start über: pnpm test:firestore-rules');
  }
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules },
  });
  firebase.firestore.setLogLevel('silent');
  await env.clearFirestore();

  const actors = {
    owner: { id: 'owner', uid: OWNER, ctx: env.authenticatedContext(OWNER) },
    other: { id: 'other', uid: OTHER, ctx: env.authenticatedContext(OTHER) },
    coach: { id: 'coach', uid: COACH, kind: 'coach', ctx: env.authenticatedContext(COACH, { coach: true }) },
    anon: { id: 'anon', uid: null, ctx: env.unauthenticatedContext() },
  };
  const coachRole = {
    id: 'coach-role',
    uid: COACH_ROLE,
    kind: 'coach',
    ctx: env.authenticatedContext(COACH_ROLE),
  };
  const legacy = {
    id: 'legacy',
    uid: LEGACY_COACH,
    kind: 'coach',
    ctx: env.authenticatedContext(LEGACY_COACH),
  };

  await seed(`roles/${COACH_ROLE}`, { role: 'coach' });
  await seed(`roles/${OWNER}`, { role: 'client' });

  const planRoot = `fitness/${OWNER}/macrocycles/plantest`;
  const trees = [
    {
      name: 'roles/{uid}',
      path: `roles/${OWNER}`,
      data: { role: 'client' },
      access: { owner: readOnly, other: none, coach: none, anon: none },
    },
    {
      name: 'sixpackSelfies/{uid}/photos/{photoId}',
      path: `sixpackSelfies/${OWNER}/photos/front`,
      data: selfie(),
      access: { owner: all, other: none, coach: none, anon: none },
    },
    {
      name: 'fitness/{uid}/**',
      path: `fitness/${OWNER}/sessions/s1`,
      data: { userId: OWNER, value: 1 },
      access: { owner: all, other: none, coach: all, anon: none },
    },
    {
      name: 'fitness/{uid}/macrocycles self',
      path: `fitness/${OWNER}/macrocycles/selfplan`,
      data: { coachUid: OWNER, title: 'self' },
      access: { owner: all, other: none, coach: all, anon: none },
    },
    {
      name: 'fitness/{uid}/macrocycles coach-owned',
      path: `fitness/${OWNER}/macrocycles/assigned`,
      data: { coachUid: COACH, title: 'assigned' },
      access: { owner: readOnly, other: none, coach: all, anon: none },
    },
    {
      name: 'fitness/{uid}/macrocycles/versions',
      path: `${planRoot}/versions/v1`,
      data: { n: 1 },
      before: async () => {
        await seed(planRoot, { coachUid: OWNER, title: 'plan' });
      },
      access: { owner: readCreate, other: none, coach: all, anon: none },
    },
    {
      name: 'fitness/{uid}/macrocycles/receipts',
      path: `${planRoot}/receipts/v3`,
      data: { planId: 'plantest', version: 3, readAt: '2026-11-21' },
      access: { owner: readCreate, other: none, coach: all, anon: none },
    },
    {
      name: 'fitness/{uid}/macrocycles/completions',
      path: `${planRoot}/completions/c1`,
      data: { done: true },
      access: { owner: all, other: none, coach: all, anon: none },
    },
    {
      name: 'planResponses/{uid}/versions',
      path: `planResponses/${OWNER}/plans/plantest/versions/v1`,
      data: () => ({ readerUid: OWNER, readAt: serverTimestamp() }),
      before: async () => {
        await seed(planRoot, { coachUid: OWNER, title: 'plan' });
        await seed(`${planRoot}/versions/v1`, { n: 1 });
      },
      access: { owner: readCreate, other: none, coach: readOnly, anon: none },
    },
    {
      name: 'planResponses/{uid}/entries',
      path: `planResponses/${OWNER}/plans/plantest/versions/v1/entries/e1`,
      seed: { body: 'notiz', senderUid: OWNER, senderRole: 'client', createdAt: new Date(), },
      create: planEntry,
      before: async () => {
        await seed(planRoot, { coachUid: OWNER, title: 'plan' });
        await seed(`${planRoot}/versions/v1`, { n: 1 });
      },
      access: { owner: readCreate, other: none, coach: readCreate, anon: none },
    },
    {
      name: 'journal/{uid}/**',
      path: `journal/${OWNER}/entries/e1`,
      data: { text: 'tag' },
      access: { owner: all, other: none, coach: none, anon: none },
    },
    {
      name: 'nutrition/{uid}/**',
      path: `nutrition/${OWNER}/logs/d1`,
      data: { kcal: 1 },
      access: { owner: all, other: none, coach: all, anon: none },
    },
    {
      name: 'supplements/{uid}/**',
      path: `supplements/${OWNER}/logs/d1`,
      data: { name: 'd' },
      access: { owner: all, other: none, coach: all, anon: none },
    },
    {
      name: 'users/{uid}/**',
      path: `users/${OWNER}/meta/profile`,
      data: { gender: 'm' },
      access: { owner: all, other: none, coach: all, anon: none },
    },
    {
      name: 'relax/{uid}/**',
      path: `relax/${OWNER}/sessions/d1`,
      data: { value: 1 },
      access: { owner: all, other: none, coach: all, anon: none },
    },
    {
      name: 'coachConversations/{uid}/messages',
      path: `coachConversations/${OWNER}/messages/m1`,
      seed: { body: 'hallo', senderUid: OWNER, senderRole: 'client', createdAt: new Date(), plan: null },
      create: message,
      access: { owner: readCreate, other: none, coach: readCreate, anon: none },
    },
    {
      name: 'coachConversations/{uid}/readStates',
      path: (actor) => `coachConversations/${OWNER}/readStates/${actor.uid ?? 'anonymous'}`,
      data: readState,
      access: { owner: readUpdate, other: none, coach: readUpdate, anon: none },
    },
    {
      name: 'skillsUsers/{uid}/events',
      path: `skillsUsers/${OWNER}/events/evt1`,
      data: skillsEvent(),
      access: { owner: { read: true, create: true, update: true, delete: true }, other: none, coach: none, anon: none },
    },
    {
      name: 'coachInbox/{id}',
      path: 'coachInbox/item1',
      data: { text: 'in' },
      access: { owner: none, other: none, coach: readOnly, anon: none },
    },
    {
      name: 'coachState/{id}',
      path: 'coachState/item1',
      data: { text: 'state' },
      access: { owner: none, other: none, coach: readOnly, anon: none },
    },
    {
      name: 'coachCommands/{id}',
      path: 'coachCommands/item1',
      data: command,
      access: { owner: none, other: none, coach: readCreate, anon: none },
    },
    {
      name: 'skillsCatalogs/{version}',
      path: 'skillsCatalogs/v1',
      data: { name: 'catalog' },
      access: { owner: readOnly, other: readOnly, coach: readOnly, anon: none },
    },
    {
      name: 'fitness/kb/**',
      path: 'fitness/kb/exercises/pushup',
      data: { name: 'pushup' },
      access: { owner: readOnly, other: readOnly, coach: all, anon: none },
    },
    {
      // nutrition/{uid} mit uid "public" lässt den Coach per ODER schreiben.
      name: 'nutrition/public/**',
      path: 'nutrition/public/nutrients/iron',
      data: { name: 'iron' },
      access: { owner: readOnly, other: readOnly, coach: all, anon: none },
    },
    {
      name: 'knowledge/**',
      path: 'knowledge/a1',
      data: { title: 'a' },
      access: { owner: readOnly, other: readOnly, coach: readOnly, anon: none },
    },
    {
      name: 'knowledge_tasks/{taskId}',
      path: 'knowledge_tasks/t1',
      data: { title: 't' },
      access: { owner: readCreate, other: readCreate, coach: readCreate, anon: none },
    },
  ];

  for (const tree of trees) await runTree(tree, actors);

  const changed = skillsEvent('evt1', 'muscle-up/second');
  await seed(`skillsUsers/${OWNER}/events/evt1`, skillsEvent());
  await check(
    'skillsUsers owner identical update',
    true,
    database(actors.owner).doc(`skillsUsers/${OWNER}/events/evt1`).set(skillsEvent()),
  );
  await check(
    'skillsUsers owner history edit',
    false,
    database(actors.owner).doc(`skillsUsers/${OWNER}/events/evt1`).set(changed),
  );

  await seed(`coachConversations/${OWNER}/readStates/${OWNER}`, { lastReadAt: new Date() });
  await check(
    'readStates coach reads owner',
    true,
    database(actors.coach).doc(`coachConversations/${OWNER}/readStates/${OWNER}`).get(),
  );
  await check(
    'readStates other reads owner',
    false,
    database(actors.other).doc(`coachConversations/${OWNER}/readStates/${OWNER}`).get(),
  );
  await check(
    'readStates owner writes coach slot',
    false,
    database(actors.owner).doc(`coachConversations/${OWNER}/readStates/${COACH}`).set(readState()),
  );

  const session = { userId: OWNER, value: 1 };
  const note = { text: 'tag' };
  await spot('legacy coach fitness', legacy, `fitness/${OWNER}/sessions/s1`, session, all);
  await spot('legacy coach journal', legacy, `journal/${OWNER}/entries/e1`, note, none);
  await spot('legacy coach sixpack', legacy, `sixpackSelfies/${OWNER}/photos/front`, selfie(), none);
  await spot('roles-doc coach fitness', coachRole, `fitness/${OWNER}/sessions/s1`, session, all);
  await spot('roles-doc coach journal', coachRole, `journal/${OWNER}/entries/e1`, note, none);
  await spot('roles-doc coach own role', coachRole, `roles/${COACH_ROLE}`, { role: 'coach' }, readOnly);
  console.log('ok coach variants (claim, roles-doc, legacy uid)');

  const habit = `fitness/${OWNER}/habitJournals/h1`;
  await seed(habit, { userId: OWNER, text: 'privat' });
  await check('habitJournals other read', false, database(actors.other).doc(habit).get());
  await check(
    'habitJournals other write owner userId',
    false,
    database(actors.other).doc(habit).set({ userId: OWNER, text: 'fremd' }),
  );
  await wipe(habit);
  await check(
    'habitJournals other write own userId',
    false,
    database(actors.other).doc(habit).set({ userId: OTHER, text: 'eigen' }),
  );
  await wipe(habit);
  await check(
    'habitJournals owner write',
    true,
    database(actors.owner).doc(habit).set({
      habitId: 'h1',
      date: '2026-11-21',
      text: 'eigen',
    }),
  );
  await wipe(habit);
  await check(
    'habitJournals owner write own userId',
    true,
    database(actors.owner).doc(habit).set({ userId: OWNER, habitId: 'h1', text: 'eigen' }),
  );
  await wipe(habit);
  await check(
    'habitJournals coach write',
    true,
    database(actors.coach).doc(habit).set({ coachFeedback: 'ok' }),
  );

  await exerciseVideos(actors);

  const failed = results.filter((item) => !item.ok);
  console.log(`\n${results.length - failed.length} passed, ${failed.length} failed, ${results.length} checks`);
  if (!ENFORCE_EXERCISE_VIDEO_TARGET) {
    console.log('exerciseVideos Zielmodell: SKIP (FIRESTORE_RULES_EXERCISE_VIDEOS ist nicht 1, vitalos#50)');
  }
  if (failed.length) process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (env) await env.cleanup();
}
