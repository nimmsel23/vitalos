import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ACCOUNT_DELETION_URL, CONTACT_EMAIL, CONTACT_EMAIL_IS_PLACEHOLDER, CONTACT_PLACE, PRIVACY_URL } from "../src/cloud/legal.js";
import { resolveHosting } from "../scripts/legal-hosting.mjs";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function read(rel) {
  return fs.readFileSync(path.join(repo, rel), "utf8");
}

test("dieselbe HTML-Fassung liegt in der Produkt- und in der Shell-Quelle", () => {
  for (const page of ["datenschutz/index.html", "konto-loeschen/index.html"]) {
    assert.equal(read(`public/${page}`), read(`prod/public/${page}`));
  }
});

test("Seiten nennen die öffentliche Kontaktadresse und die tatsächlich genutzten Dienste", () => {
  assert.equal(CONTACT_EMAIL_IS_PLACEHOLDER, false);
  assert.equal(CONTACT_EMAIL, "nimmdaniel@gmail.com");
  assert.equal(CONTACT_PLACE, "1030 Wien, Österreich");
  for (const page of ["prod/public/datenschutz/index.html", "prod/public/konto-loeschen/index.html"]) {
    const html = read(page);
    assert.match(html, /nimmdaniel@gmail\.com/);
    assert.match(html, /1030 Wien, Österreich/);
    assert.doesNotMatch(html, /KONTAKT-FOLGT/);
    assert.doesNotMatch(html, /example\.invalid|C-014/);
    assert.doesNotMatch(html, /gemini-2\.5/i);
    assert.doesNotMatch(html, /<form/i);
  }
  const privacy = read("prod/public/datenschutz/index.html");
  assert.match(privacy, /Firebase Authentication/);
  assert.match(privacy, /Cloud Firestore/);
  assert.match(privacy, /keine KI-Dienste/);
  assert.match(privacy, /keine Werbung/);
  assert.match(privacy, /Art\. 9 Abs\. 2 lit\. a DSGVO/);
  assert.match(privacy, /Datenschutzbehörde/);
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

test("SPA-Fangnetz steht hinter den Rechtsseiten und Dateien gewinnen", () => {
  assert.equal(PRIVACY_URL, "https://vitalos.web.app/datenschutz");
  assert.equal(ACCOUNT_DELETION_URL, "https://vitalos.web.app/konto-loeschen");
  for (const file of ["firebase.json", "prod/firebase.json"]) {
    const hosting = JSON.parse(read(file)).hosting;
    const sources = hosting.rewrites.map((rule) => rule.source);
    const catchAll = sources.indexOf("**");
    assert.ok(sources.indexOf("/datenschutz") >= 0 && sources.indexOf("/datenschutz") < catchAll, file);
    assert.ok(sources.indexOf("/konto-loeschen") >= 0 && sources.indexOf("/konto-loeschen") < catchAll, file);
    const publicDir = path.join(repo, "prod/public");
    for (const url of ["/datenschutz", "/datenschutz/", "/konto-loeschen", "/konto-loeschen/"]) {
      const hit = resolveHosting(publicDir, hosting.rewrites, url);
      assert.equal(hit.status, 200, `${file} ${url}`);
      assert.equal(hit.via, "static", `${file} ${url}`);
      assert.match(hit.file, /index\.html$/);
    }
    const other = resolveHosting(publicDir, hosting.rewrites, "/setup");
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
