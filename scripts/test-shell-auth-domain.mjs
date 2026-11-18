import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isCapacitorNative, resolveShellAuthDomain } from "../src/cloud/authDomain.js";

const PROJECT = "fitness-aos.firebaseapp.com";

function check(host, expected, options) {
  assert.equal(
    resolveShellAuthDomain(PROJECT, host, options),
    expected,
    `${host || "(leer)"} native=${Boolean(options?.native)}`,
  );
}

check("vitalos.web.app", "vitalos.web.app");
check("VitalOS.web.app.", "vitalos.web.app");
check("vitalos.web.app:443", "vitalos.web.app");
check("localhost", PROJECT);
check("127.0.0.1", PROJECT);
check("::1", PROJECT);
check("", PROJECT);
check("vitalos--pr-12-abcd.web.app", PROJECT);
check("fitness-aos.web.app", PROJECT);
check("fitness-aos.firebaseapp.com", PROJECT);
check("vos-fuel.web.app", PROJECT);
check("example.com", PROJECT);
check("vitalos.web.app", PROJECT, { native: true });
check("localhost", PROJECT, { native: true });

assert.equal(isCapacitorNative({}), false);
assert.equal(isCapacitorNative({ Capacitor: { isNativePlatform: () => false } }), false);
assert.equal(isCapacitorNative({ Capacitor: { isNativePlatform: () => true } }), true);
assert.equal(
  isCapacitorNative({ Capacitor: { isNativePlatform() { throw new Error("bridge"); } } }),
  true,
);

const firebaseJs = await readFile(new URL("../src/cloud/firebase.js", import.meta.url), "utf8");
assert.match(firebaseJs, /resolveShellAuthDomain\(config\.authDomain/);
assert.match(firebaseJs, /initializeApp\(appConfig\)/);
assert.doesNotMatch(firebaseJs, /initializeApp\(config\)/);
assert.match(firebaseJs, /native: isCapacitorNative\(\)/);

const sw = await readFile(new URL("../packages/mini-app-shell/sw-template.js", import.meta.url), "utf8");
assert.match(sw, /path\.startsWith\('\/__\/'\)/);

const config = await readFile(new URL("../firebase.config.js", import.meta.url), "utf8");
assert.match(config, /authDomain:\s+"fitness-aos\.firebaseapp\.com"/);

console.log("shell authDomain: vitalos.web.app only; other hosts and Capacitor keep the project domain");
