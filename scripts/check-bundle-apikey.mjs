#!/usr/bin/env node
// Fail-closed nach dem vos-fitness-Build: ein leerer Firebase-apiKey im
// ausgelieferten JS (apiKey:"", apiKey:'' oder apiKey:``) bricht ab, bevor
// Hosting deployt. Zusätzlich muss der öffentliche Key aus firebase.config.js
// im Bundle stehen.

import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

export const EMPTY_API_KEY = /apiKey\s*:\s*(['"`])\1/;

export function readApiKey(configSource) {
  const match = String(configSource).match(/apiKey\s*:\s*["'`]([^"'`]+)["'`]/);
  return match ? match[1] : "";
}

async function listJs(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") return out;
    throw error;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await listJs(full, out);
    else if (entry.isFile() && extname(entry.name) === ".js") out.push(full);
  }
  return out;
}

function isRootEntry(dir, file) {
  const rel = relative(dir, file).split("\\").join("/");
  return /^assets\/index[^/]*\.js$/.test(rel);
}

export async function scanBundle(dir, { expectedKey = "" } = {}) {
  const files = await listJs(dir);
  const empty = [];
  const entries = [];
  let entryHasKey = false;
  for (const file of files) {
    const text = await readFile(file, "utf8");
    if (EMPTY_API_KEY.test(text)) empty.push(file);
    if (!isRootEntry(dir, file)) continue;
    entries.push(file);
    if (expectedKey && text.includes(expectedKey)) entryHasKey = true;
  }
  return { files, empty, entries, entryHasKey };
}

async function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error("Aufruf: node scripts/check-bundle-apikey.mjs <dist-verzeichnis>");
    process.exit(2);
  }
  const configSource = await readFile(new URL("../firebase.config.js", import.meta.url), "utf8");
  const expectedKey = readApiKey(configSource);
  if (!expectedKey) {
    console.error("firebase.config.js hat keinen apiKey");
    process.exit(1);
  }
  const { files, empty, entries, entryHasKey } = await scanBundle(dir, { expectedKey });
  if (!files.length) {
    console.error(`Kein JS-Bundle in ${dir}`);
    process.exit(1);
  }
  if (!entries.length) {
    console.error(`Kein Einstiegsbundle assets/index-*.js in ${dir}`);
    process.exit(1);
  }
  if (empty.length) {
    for (const file of empty) console.error(`Leerer Firebase-apiKey: ${file}`);
    process.exit(1);
  }
  if (!entryHasKey) {
    console.error("Öffentlicher Firebase-apiKey fehlt im Einstiegsbundle assets/index-*.js");
    process.exit(1);
  }
  console.log(`Firebase-apiKey: ${files.length} JS-Dateien, Key im Einstieg, kein leerer apiKey`);
}

if (process.argv[1] && process.argv[1].endsWith("check-bundle-apikey.mjs")) {
  await main();
}
