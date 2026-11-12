import test from "node:test";
import assert from "node:assert/strict";
import { deletionErrorMessage, needsPasswordReauth, runAccountDeletion } from "../src/cloud/deleteAccountFlow.js";

const user = { uid: "wegwerfKonto1234567890", email: "wegwerf@example.invalid", providerData: [{ providerId: "password" }] };

test("E-Mail-Konten verlangen das Passwort vor jedem Aufruf", async () => {
  let called = false;
  await assert.rejects(
    () => runAccountDeletion({
      user,
      password: "",
      reauthenticate: async () => { called = true; },
      callDelete: async () => ({ ok: true }),
    }),
    (error) => error.code === "missing-password",
  );
  assert.equal(called, false);
  assert.match(deletionErrorMessage({ code: "auth/wrong-password" }), /nichts gelöscht/);
});

test("Google-Konten gehen ohne Passwort zur Neuanmeldung und löschen erst nach Bestätigung", async () => {
  const steps = [];
  const googleUser = { uid: user.uid, providerData: [{ providerId: "google.com" }] };
  assert.equal(needsPasswordReauth(googleUser), false);
  const result = await runAccountDeletion({
    user: googleUser,
    reauthenticate: async ({ user: current }) => { steps.push(`reauth:${current.uid}`); },
    callDelete: async (current) => { steps.push(`call:${current.uid}`); return { ok: true }; },
    clearLocal: async () => { steps.push("local"); },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(steps, [`reauth:${user.uid}`, `call:${user.uid}`, "local"]);
});

test("ohne Serverbestätigung bleibt die lokale Kopie stehen", async () => {
  let cleared = false;
  await assert.rejects(
    () => runAccountDeletion({
      user: { uid: user.uid, providerData: [{ providerId: "google.com" }] },
      reauthenticate: async () => {},
      callDelete: async () => ({ ok: false }),
      clearLocal: async () => { cleared = true; },
    }),
    (error) => error.code === "unconfirmed",
  );
  assert.equal(cleared, false);
  assert.match(deletionErrorMessage({ code: "functions/not-found" }), /nimmsel23\+vitalos@gmail\.com/);
});
