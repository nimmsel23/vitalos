import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseVitalOSProductFirebaseConfig } from "../src/cloud/firebaseConfig.js";
import { VAPID_KEY as PRIVATE_VAPID_KEY } from "../firebase.config.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productBuild = process.env.VITE_VOS_PRODUCT_BUILD === "1";

function productConfig() {
  if (!productBuild) throw new Error("Product configuration requires VITE_VOS_PRODUCT_BUILD=1");
  if (process.env.VITE_VOS_FIREBASE_PROJECT_ID !== "vitalos-prod") throw new Error("Product builds require project vitalos-prod");
  const product = parseVitalOSProductFirebaseConfig({
    webConfigJson: process.env.VITE_VOS_FIREBASE_WEB_CONFIG || "",
    expectedProjectId: process.env.VITE_VOS_FIREBASE_PROJECT_ID || "",
    vapidKey: process.env.VITE_VOS_FIREBASE_VAPID_KEY || "",
  });
  if (product.vapidKey === PRIVATE_VAPID_KEY) {
    throw new Error("VitalOS product builds cannot reuse the private Firebase VAPID key");
  }
  return product;
}

function prepareModule() {
  const product = productConfig();
  if (!product) return;
  const dir = path.join(ROOT, ".product-config");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "firebase.config.js"), [
    `export const config = ${JSON.stringify(product.config)};`,
    "export const firebaseConfig = config;",
    `export const VAPID_KEY = ${JSON.stringify(product.vapidKey)};`,
    "",
  ].join("\n"));
  console.log("Prepared isolated VitalOS product Firebase config.");
}

function writeServiceWorkers(outDir) {
  const product = productConfig();
  if (!product) return;
  if (!outDir) throw new Error("Pass the built output directory after --write-service-workers");
  const serializedConfig = JSON.stringify(product.config);
  for (const name of ["firebase-messaging-sw.js", "vitalos-messaging-sw.js", "sixpack-messaging-sw.js", "journal-messaging-sw.js"]) {
    const sourcePath = name === "sixpack-messaging-sw.js" ? path.join(ROOT, "../6pack-app/public", name)
      : name === "journal-messaging-sw.js" ? path.join(ROOT, "../journal-app/public", name)
      : path.join(ROOT, "public", name);
    const source = fs.readFileSync(sourcePath, "utf8");
    const replacement = `firebase.initializeApp(${serializedConfig});`;
    const output = source.replace(/firebase\.initializeApp\(\{[\s\S]*?\}\);/, replacement);
    if (output === source) throw new Error(`Could not replace Firebase config in ${name}`);
    fs.writeFileSync(path.join(ROOT, outDir, name), output);
  }
  console.log("Wrote product Firebase config to the built messaging service workers.");
}

if (process.argv[2] === "--write-service-workers") writeServiceWorkers(process.argv[3]);
else prepareModule();
