import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  USER_COLLECTIONS,
  handleDeleteOwnAccount,
  userDataPaths,
  callableFailure,
} = require("./deleteOwnAccount.js");

const UID = "wegwerfKonto1234567890";
const NOW = 1_700_000_000;

function deps(overrides = {}) {
  const deleted = [];
  const authDeleted = [];
  const firestore = {
    doc(docPath) { return { path: docPath }; },
    async recursiveDelete(ref) {
      deleted.push(ref.path);
      if (overrides.failOn && ref.path.startsWith(overrides.failOn)) {
        throw new Error("firestore-fehler");
      }
    },
  };
  const auth = {
    async deleteUser(uid) { authDeleted.push(uid); },
  };
  return { firestore, auth, deleted, authDeleted, nowSeconds: () => NOW };
}

function context(uid = UID, authTime = NOW - 30) {
  return { auth: { uid, token: { auth_time: authTime } } };
}

test("löscht nur die eigenen Bäume und danach den Auth-Nutzer", async () => {
  const kit = deps();
  const result = await handleDeleteOwnAccount({}, context(), kit);
  assert.equal(result.ok, true);
  assert.deepEqual(result.deletedPaths, userDataPaths(UID));
  assert.deepEqual(kit.deleted, result.deletedPaths);
  assert.deepEqual(kit.authDeleted, [UID]);
  for (const collection of USER_COLLECTIONS) {
    assert.equal(kit.deleted.filter((path) => path === `${collection}/${UID}`).length, 1);
  }
  assert.equal(kit.deleted.some((path) => path.endsWith("/kb") || path.endsWith("/public")), false);
});

test("eine mitgeschickte fremde uid wird nicht angefasst", async () => {
  const kit = deps();
  await assert.rejects(
    () => handleDeleteOwnAccount({ uid: "fremdeUid1234567890" }, context(), kit),
    (error) => error.code === "permission-denied",
  );
  assert.deepEqual(kit.deleted, []);
  assert.deepEqual(kit.authDeleted, []);
});

test("ohne Anmeldung passiert nichts", async () => {
  const kit = deps();
  await assert.rejects(
    () => handleDeleteOwnAccount({}, {}, kit),
    (error) => error.code === "unauthenticated",
  );
  assert.deepEqual(kit.deleted, []);
  assert.deepEqual(kit.authDeleted, []);
});

test("reservierte ids kb und public werden nicht gelöscht", async () => {
  for (const uid of ["kb", "public", "", "a/b", ".."]) {
    const kit = deps();
    await assert.rejects(
      () => handleDeleteOwnAccount({}, context(uid), kit),
      (error) => error.code === "permission-denied" || error.code === "unauthenticated",
    );
    assert.deepEqual(kit.deleted, [], uid);
    assert.deepEqual(kit.authDeleted, [], uid);
  }
});

test("abgelaufene Neuanmeldung löscht nichts", async () => {
  const kit = deps();
  await assert.rejects(
    () => handleDeleteOwnAccount({}, context(UID, NOW - (15 * 60) - 1), kit),
    (error) => error.code === "failed-precondition",
  );
  assert.deepEqual(kit.authDeleted, []);
});

test("bricht vor dem Auth-Löschen ab, wenn Firestore fehlschlägt", async () => {
  const kit = deps({ failOn: "journal/" });
  await assert.rejects(() => handleDeleteOwnAccount({}, context(), kit), /firestore-fehler/);
  assert.equal(kit.deleted.includes(`journal/${UID}`), true);
  assert.deepEqual(kit.authDeleted, []);
  assert.equal(kit.deleted.some((path) => !path.endsWith(`/${UID}`)), false);
});

test("Callable-Fehler tragen nur Code und Text", () => {
  const kit = deps();
  return handleDeleteOwnAccount({}, {}, kit).then(() => {
    assert.fail("erwartet Ablehnung");
  }, (error) => {
    assert.deepEqual(callableFailure(error), {
      code: "unauthenticated",
      message: "Anmeldung erforderlich.",
    });
  });
});
