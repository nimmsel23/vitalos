import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EMPTY_API_KEY, readApiKey, scanBundle } from "./check-bundle-apikey.mjs";
import { publicFirebaseConfigRedirect } from "../vos-fitness/public-firebase-config.mjs";

const publicConfig = await readFile(new URL("../firebase.config.js", import.meta.url), "utf8");
const expectedKey = readApiKey(publicConfig);
assert.match(expectedKey, /^AIza/, "öffentliche Web-Config enthält einen apiKey");
assert.equal(EMPTY_API_KEY.test('apiKey:""'), true);
assert.equal(EMPTY_API_KEY.test("apiKey:''"), true);
assert.equal(EMPTY_API_KEY.test("apiKey:``"), true);
assert.equal(EMPTY_API_KEY.test(`apiKey:"${expectedKey}"`), false);
assert.equal(EMPTY_API_KEY.test(`apiKey:\`${expectedKey}\``), false);

const root = await mkdtemp(join(tmpdir(), "vos-apikey-"));
try {
  await mkdir(join(root, "assets"), { recursive: true });
  await mkdir(join(root, "training", "assets"), { recursive: true });
  const entry = join(root, "assets", "index-test.js");
  const mini = join(root, "training", "assets", "index-mini.js");
  await writeFile(entry, `initializeApp({apiKey:"${expectedKey}",projectId:"fitness-aos"})`);
  await writeFile(join(root, "fitness-messaging-sw.js"), `apiKey:"${expectedKey}"`);
  await writeFile(mini, "export const x = 1");
  const ok = await scanBundle(root, { expectedKey });
  assert.equal(ok.empty.length, 0);
  assert.equal(ok.entryHasKey, true);
  assert.equal(ok.entries.length, 1);
  assert.equal(ok.files.length, 3);

  await writeFile(mini, 'const r1e={apiKey:"",authDomain:""}');
  const quoted = await scanBundle(root, { expectedKey });
  assert.equal(quoted.empty.length, 1);

  await writeFile(mini, "const $t={apiKey:``,authDomain:``}");
  const ticks = await scanBundle(root, { expectedKey });
  assert.equal(ticks.empty.length, 1);

  await writeFile(entry, "initializeApp({})");
  await writeFile(mini, "export const x = 1");
  const missing = await scanBundle(root, { expectedKey });
  assert.equal(missing.empty.length, 0);
  assert.equal(missing.entryHasKey, false, "Service-Worker-Kopie ersetzt den Key im Einstieg nicht");

  const absent = await scanBundle(join(root, "does-not-exist"), { expectedKey });
  assert.equal(absent.files.length, 0);
  assert.equal(absent.entries.length, 0);
} finally {
  await rm(root, { recursive: true, force: true });
}

const fitness = join(root, "fitness-app");
const pub = join(root, "firebase.config.js");
const plugin = publicFirebaseConfigRedirect({ fitnessRoot: fitness, publicConfig: pub });
const importer = join(fitness, "src", "firebase.js");
assert.equal(plugin.resolveId("../firebase.config.js", importer), pub);
assert.equal(plugin.resolveId("../firebase.config", importer), pub);
assert.equal(plugin.resolveId("./utils.js", importer), null);
assert.equal(plugin.resolveId("../firebase.config.js", null), null);
assert.equal(plugin.resolveId("@firebase-config", importer), null);

const workflow = await readFile(new URL("../.github/workflows/deploy-vos-fitness.yml", import.meta.url), "utf8");
assert.match(workflow, /cp firebase\.config\.js fitness-app\/firebase\.config\.js/);
assert.match(workflow, /node scripts\/check-bundle-apikey\.mjs vos-fitness\/dist-firebase/);

const smoke = await readFile(new URL("../.github/workflows/live-smoke.yml", import.meta.url), "utf8");
assert.match(
  smoke,
  /github\.event\.workflow_run\.name == 'Deploy VOS Fitness PWA' && 'https:\/\/fitness-vos\.web\.app'/,
  "Live-Smoke muss nach dem Fitness-Deploy fitness-vos.web.app prüfen",
);
assert.match(smoke, /https:\/\/vitalos\.web\.app/);

const viteConfig = await readFile(new URL("../vos-fitness/vite.config.cjs", import.meta.url), "utf8");
assert.match(viteConfig, /publicFirebaseConfigRedirect/);

console.log("bundle apiKey check: leer, gesetzt und Redirect ok");
