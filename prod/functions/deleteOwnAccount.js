"use strict";

const USER_COLLECTIONS = Object.freeze([
  "roles",
  "sixpackSelfies",
  "skillsUsers",
  "coachConversations",
  "fitness",
  "planResponses",
  "journal",
  "nutrition",
  "supplements",
  "users",
  "relax",
]);

const RESERVED_USER_IDS = new Set(["kb", "public"]);
const MAX_AUTH_AGE_SECONDS = 15 * 60;

class AccountDeleteError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AccountDeleteError";
    this.code = code;
  }
}

function normalizeUid(uid) {
  if (typeof uid !== "string") {
    throw new AccountDeleteError("permission-denied", "Dieses Konto kann nicht gelöscht werden.");
  }
  const value = uid.trim();
  if (
    !value
    || value.length > 128
    || value.includes("/")
    || value.includes("\\")
    || value === "."
    || value === ".."
    || RESERVED_USER_IDS.has(value)
  ) {
    throw new AccountDeleteError("permission-denied", "Dieses Konto kann nicht gelöscht werden.");
  }
  return value;
}

function userDataPaths(uid) {
  const safe = normalizeUid(uid);
  return USER_COLLECTIONS.map((collection) => `${collection}/${safe}`);
}

function assertOwnPath(docPath, uid) {
  const slash = docPath.indexOf("/");
  const collection = docPath.slice(0, slash);
  const id = docPath.slice(slash + 1);
  if (!USER_COLLECTIONS.includes(collection) || id !== uid || id.includes("/")) {
    throw new AccountDeleteError("permission-denied", "Pfad gehört nicht zum Konto.");
  }
  if (docPath.endsWith("/kb") || docPath.endsWith("/public")) {
    throw new AccountDeleteError("permission-denied", "Geteilte Daten werden nicht gelöscht.");
  }
}

async function handleDeleteOwnAccount(data, context, deps) {
  const uid = context?.auth?.uid;
  if (!uid) throw new AccountDeleteError("unauthenticated", "Anmeldung erforderlich.");
  const safe = normalizeUid(uid);
  if (data && Object.prototype.hasOwnProperty.call(data, "uid") && data.uid !== safe) {
    throw new AccountDeleteError("permission-denied", "Nur das eigene Konto kann gelöscht werden.");
  }
  const authTime = context.auth?.token?.auth_time;
  const now = deps.nowSeconds();
  if (typeof authTime !== "number" || now - authTime > MAX_AUTH_AGE_SECONDS || authTime > now + 60) {
    throw new AccountDeleteError("failed-precondition", "Bitte melde dich erneut an und wiederhole die Löschung.");
  }

  const paths = userDataPaths(safe);
  for (const docPath of paths) {
    assertOwnPath(docPath, safe);
    await deps.firestore.recursiveDelete(deps.firestore.doc(docPath));
  }
  await deps.auth.deleteUser(safe);
  return { ok: true, deletedPaths: paths };
}

function callableFailure(error) {
  if (error instanceof AccountDeleteError) return { code: error.code, message: error.message };
  return null;
}

module.exports = {
  USER_COLLECTIONS,
  RESERVED_USER_IDS,
  MAX_AUTH_AGE_SECONDS,
  AccountDeleteError,
  normalizeUid,
  userDataPaths,
  handleDeleteOwnAccount,
  callableFailure,
};
