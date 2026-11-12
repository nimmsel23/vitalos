import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ACCOUNT_DELETION_URL, CONTACT_EMAIL, CONTACT_EMAIL_IS_PLACEHOLDER, CONTACT_PLACE, PRIVACY_URL } from "../src/cloud/legal.js";
import { PASSWORD_RESET_NEED_EMAIL, PASSWORD_RESET_SENT, passwordResetFailure, passwordResetNotice } from "../src/cloud/passwordReset.js";
import { resolveHosting } from "../scripts/legal-hosting.mjs";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CANONICAL_PRIVACY = "https://vitalos.at/vitalos/datenschutz";

function read(rel) {
  return fs.readFileSync(path.join(repo, rel), "utf8");
}

test("Kontolöschung ist in Produkt und Shell dieselbe Datei, Datenschutz nicht mehr lokal", () => {
  assert.equal(read("public/konto-loeschen/index.html"), read("prod/public/konto-loeschen/index.html"));
  for (const page of ["public/datenschutz/index.html", "prod/public/datenschutz/index.html"]) {
    assert.equal(fs.existsSync(path.join(repo, page)), false, page);
  }
});

test("Kontolöschung nennt die öffentliche Kontaktadresse", () => {
  assert.equal(CONTACT_EMAIL_IS_PLACEHOLDER, false);
  assert.equal(CONTACT_EMAIL, "nimmdaniel@gmail.com");
  assert.equal(CONTACT_PLACE, "1030 Wien, Österreich");
  const html = read("prod/public/konto-loeschen/index.html");
  assert.match(html, /nimmdaniel@gmail\.com/);
  assert.match(html, /1030 Wien, Österreich/);
  assert.match(html, new RegExp(CANONICAL_PRIVACY.replace(/[.]/g, "\\.")));
  assert.doesNotMatch(html, /KONTAKT-FOLGT/);
  assert.doesNotMatch(html, /example\.invalid/);
  assert.doesNotMatch(html, /<form/i);
});

test("Kontolöschung erklärt App-Weg und Weg ohne App", () => {
  const html = read("prod/public/konto-loeschen/index.html");
  assert.match(html, /Setup/);
  assert.match(html, /Konto löschen/);
  assert.match(html, /LÖSCHEN/);
  assert.match(html, /Ohne App/);
  assert.match(html, /mailto:nimmdaniel@gmail\.com/);
  assert.match(html, /Was gelöscht wird/);
});

test("/datenschutz ist ein 301, /konto-loeschen bleibt eine Datei vor dem SPA-Fangnetz", () => {
  assert.equal(PRIVACY_URL, CANONICAL_PRIVACY);
  assert.equal(ACCOUNT_DELETION_URL, "https://vitalos.web.app/konto-loeschen");
  const trees = {
    "firebase.json": "public",
    "prod/firebase.json": "prod/public",
  };
  for (const [file, dir] of Object.entries(trees)) {
    const hosting = JSON.parse(read(file)).hosting;
    const sources = hosting.rewrites.map((rule) => rule.source);
    const catchAll = sources.indexOf("**");
    assert.equal(sources.includes("/datenschutz"), false, file);
    assert.ok(sources.indexOf("/konto-loeschen") >= 0 && sources.indexOf("/konto-loeschen") < catchAll, file);
    const publicDir = path.join(repo, dir);
    for (const url of ["/datenschutz", "/datenschutz/", "/datenschutz/index.html"]) {
      const hit = resolveHosting(publicDir, hosting.rewrites, url, hosting.redirects);
      assert.equal(hit.status, 301, `${file} ${url}`);
      assert.equal(hit.via, "redirect", `${file} ${url}`);
      assert.equal(hit.destination, CANONICAL_PRIVACY, `${file} ${url}`);
    }
    for (const url of ["/konto-loeschen", "/konto-loeschen/"]) {
      const hit = resolveHosting(publicDir, hosting.rewrites, url, hosting.redirects);
      assert.equal(hit.status, 200, `${file} ${url}`);
      assert.equal(hit.via, "static", `${file} ${url}`);
      assert.match(hit.file, /index\.html$/);
    }
    const other = resolveHosting(publicDir, hosting.rewrites, "/setup", hosting.redirects);
    assert.equal(other.via, "**");
  }
});

test("Service Worker leitet die Rechtsseiten nicht auf die App-Shell um", () => {
  for (const file of ["mini-app.json", "prod/mini-app.json"]) {
    const config = JSON.parse(read(file));
    assert.deepEqual(config.apps.vitalos.sw.navPassthrough, ["/datenschutz", "/konto-loeschen"]);
  }
  for (const file of ["prod/src/App.jsx", "prod/src/shell/Settings/ProfileSection.jsx", "prod/src/shell/Settings/AccountSection.jsx"]) {
    assert.match(read(file), /LegalLinks|Konto löschen/);
  }
});

test("Login und Registrierung verlinken die Datenschutzerklärung und setzen das Passwort zurück", () => {
  const shell = read("src/App.jsx");
  const product = read("prod/src/App.jsx");
  assert.match(shell, /href=\{PRIVACY_URL\}/);
  assert.match(shell, /Passwort vergessen/);
  assert.match(shell, /sendPasswordResetEmail/);
  assert.match(shell, /passwordResetNotice/);
  assert.match(product, /<LegalLinks/);
  assert.match(product, /Passwort vergessen/);
  assert.match(product, /sendPasswordResetEmail/);
  assert.match(product, /passwordResetNotice/);
  assert.match(read("prod/src/shell/LegalLinks.jsx"), /href=\{PRIVACY_URL\}/);
  assert.equal(passwordResetFailure({ code: "auth/invalid-email" }), "Diese E-Mail-Adresse ist ungültig.");
  assert.equal(passwordResetFailure({ code: "auth/too-many-requests" }), "Zu viele Versuche. Bitte später erneut versuchen.");
  assert.equal(passwordResetFailure({ code: "auth/network-request-failed" }), "Keine Verbindung. Bitte später erneut versuchen.");
  assert.match(passwordResetFailure({ code: "auth/internal-error" }), /nicht gesendet/);
  assert.equal(PASSWORD_RESET_NEED_EMAIL, "Bitte zuerst die E-Mail-Adresse eingeben.");
  assert.equal(PASSWORD_RESET_SENT, "Falls ein Konto mit dieser E-Mail-Adresse existiert, erhältst du eine Nachricht zum Zurücksetzen.");
  assert.deepEqual(passwordResetNotice(null), { ok: true, message: PASSWORD_RESET_SENT });
  assert.deepEqual(passwordResetNotice({ code: "auth/user-not-found" }), { ok: true, message: PASSWORD_RESET_SENT });
  assert.equal(passwordResetNotice({ code: "auth/invalid-email" }).ok, false);
  assert.doesNotMatch(read("prod/src/cloud/passwordReset.js"), /kein E-Mail-Konto/);
});

test("Store-Doku nennt die kanonische Datenschutzerklärung", () => {
  for (const file of ["prod/docs/STORE-LISTING-FINAL.md", "prod/docs/DATA-SAFETY-ANSWERS.md"]) {
    const text = read(file);
    assert.match(text, /https:\/\/vitalos\.at\/vitalos\/datenschutz/);
    assert.doesNotMatch(text, /https:\/\/vitalos\.web\.app\/datenschutz/);
  }
});

test("Impressum ist keine Seite in diesem Repo", () => {
  for (const page of ["public/impressum/index.html", "prod/public/impressum/index.html"]) {
    assert.equal(fs.existsSync(path.join(repo, page)), false, page);
  }
  for (const file of ["firebase.json", "prod/firebase.json"]) {
    const hosting = JSON.parse(read(file)).hosting;
    const sources = [...hosting.rewrites, ...(hosting.redirects || [])].map((rule) => rule.source);
    assert.equal(sources.some((source) => String(source).includes("impressum")), false, file);
  }
});
