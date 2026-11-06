import test from "node:test";
import assert from "node:assert/strict";
import { parseVitalOSProductFirebaseConfig } from "../src/cloud/firebaseConfig.js";

const valid = {
  webConfigJson: JSON.stringify({
    apiKey: "product-api-key",
    authDomain: "vitalos-product.firebaseapp.com",
    projectId: "vitalos-product",
    storageBucket: "vitalos-product.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc",
  }),
  expectedProjectId: "vitalos-product",
  vapidKey: "product-vapid-key",
};

test("accepts a complete product Firebase configuration", () => {
  const result = parseVitalOSProductFirebaseConfig(valid);
  assert.equal(result.config.projectId, "vitalos-product");
  assert.equal(result.vapidKey, "product-vapid-key");
});

test("rejects missing or malformed product configuration", () => {
  assert.throws(() => parseVitalOSProductFirebaseConfig({}), /requires VITE_VOS_FIREBASE_WEB_CONFIG/);
  assert.throws(() => parseVitalOSProductFirebaseConfig({ ...valid, webConfigJson: "{" }), /valid JSON/);
  assert.throws(() => parseVitalOSProductFirebaseConfig({ ...valid, expectedProjectId: "other" }), /projectId does not match/);
  assert.throws(() => parseVitalOSProductFirebaseConfig({ ...valid, vapidKey: " " }), /requires its own/);
});

test("rejects the private fitness-aos project in every Firebase identifier", () => {
  for (const [key, value] of [
    ["projectId", "fitness-aos"],
    ["authDomain", "fitness-aos.firebaseapp.com"],
    ["storageBucket", "fitness-aos.firebasestorage.app"],
  ]) {
    const config = JSON.parse(valid.webConfigJson);
    config[key] = value;
    assert.throws(() => parseVitalOSProductFirebaseConfig({
      ...valid,
      webConfigJson: JSON.stringify(config),
      expectedProjectId: config.projectId,
    }), /private fitness-aos/);
  }
});
