import test from "node:test";
import assert from "node:assert/strict";
import { getEditionEntryTab, getProductEdition, getRuntimeEdition } from "../../../src/shell/productEdition.js";

test("Observe and Operate open on daily execution", () => {
  assert.equal(getEditionEntryTab("observe"), "habits");
  assert.equal(getEditionEntryTab("operate"), "habits");
  assert.equal(getEditionEntryTab("core"), "home");
});

test("unknown edition values retain the shared VitalOS fallback", () => {
  assert.equal(getProductEdition("unexpected").id, "core");
});

test("the single store build defaults to Observe and restores its local mode", () => {
  assert.equal(getRuntimeEdition("store"), "observe");
  assert.equal(getRuntimeEdition("store", "operate"), "operate");
  assert.equal(getRuntimeEdition("store", "unknown"), "observe");
});

test("standalone edition builds cannot be overridden by a stored store preference", () => {
  assert.equal(getRuntimeEdition("observe", "operate"), "observe");
  assert.equal(getRuntimeEdition("operate", "observe"), "operate");
});
