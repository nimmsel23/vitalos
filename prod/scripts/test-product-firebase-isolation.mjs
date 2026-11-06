import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseVitalOSProductFirebaseConfig } from "../src/cloud/firebaseConfig.js";
import { config as privateConfig, VAPID_KEY as privateVapidKey } from "../firebase.config.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.resolve(ROOT, process.argv[2] || "dist-store");

const product = parseVitalOSProductFirebaseConfig({
  webConfigJson: process.env.VITE_VOS_FIREBASE_WEB_CONFIG || "",
  expectedProjectId: process.env.VITE_VOS_FIREBASE_PROJECT_ID || "",
  vapidKey: process.env.VITE_VOS_FIREBASE_VAPID_KEY || "",
});
if (!fs.existsSync(outDir) || !fs.statSync(outDir).isDirectory()) {
  throw new Error(`Product build directory does not exist: ${path.relative(ROOT, outDir)}`);
}

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(?:js|html|json|css|txt|webmanifest)$/.test(file)) files.push(file);
  }
}
walk(outDir);
const bundle = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");

const leakedPrivateValues = [
  privateConfig.apiKey,
  privateConfig.storageBucket,
  privateConfig.messagingSenderId,
  privateConfig.appId,
  privateVapidKey,
].filter((value) => value && bundle.includes(value));
const privateFirebaseConfig = [
  ["authDomain", privateConfig.authDomain],
  ["projectId", privateConfig.projectId],
].some(([key, value]) => new RegExp(`${key}\\s*:\\s*["']${value.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}["']`).test(bundle));
if (leakedPrivateValues.length || privateFirebaseConfig) {
  throw new Error("Product bundle contains Firebase configuration from the private project");
}

for (const [key, value] of Object.entries(product.config)) {
  if (!bundle.includes(value)) throw new Error(`Product bundle is missing Firebase ${key}`);
}
if (!bundle.includes(product.vapidKey)) throw new Error("Product bundle is missing its VAPID key");

console.log(`PASS Firebase isolation: ${path.relative(ROOT, outDir)} contains only the configured product Firebase identity.`);
