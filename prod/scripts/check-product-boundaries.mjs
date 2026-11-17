#!/usr/bin/env node
/**
 * Fail-closed Grenz-Check: private Linie (fitness-aos) vs Produkt (vitalos-prod).
 * Keine Secrets nötig — nur Repo-Dateien.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const productRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metaRoot = resolve(productRoot, '..');
const PRODUCT_PROJECT = 'vitalos-prod';
const PRIVATE_PROJECT = 'fitness-aos';
const PRODUCT_SA = 'FIREBASE_SERVICE_ACCOUNT_VITALOS_PROD';
const PRIVATE_SA = 'FIREBASE_SERVICE_ACCOUNT';

/**
 * Unter prod/: bewusst private Hosting-Ziele / Legacy-Wrapper, nicht die
 * Store-Shell (vitalos-prod). Nicht still erweitern ohne Doku-Hinweis.
 */
const LEGACY_PRIVATE_DEPLOY_PATHS = new Set([
  'vos-fuel-mini/package.json',
  'fuel-os/package.json',
]);

function read(path) {
  return readFileSync(path, 'utf8');
}

function fail(msg) {
  throw new Error(`Product boundary: ${msg}`);
}

function checkFirebaserc() {
  const rcPath = join(productRoot, '.firebaserc');
  assert(existsSync(rcPath), 'prod/.firebaserc missing');
  const rc = JSON.parse(read(rcPath));
  if (rc.projects?.default !== PRODUCT_PROJECT) {
    fail(`prod/.firebaserc default must be ${PRODUCT_PROJECT}, got ${rc.projects?.default}`);
  }
  const blob = JSON.stringify(rc);
  if (blob.includes(PRIVATE_PROJECT)) {
    fail(`prod/.firebaserc must not reference ${PRIVATE_PROJECT}`);
  }
}

function checkPrivateShellWorkflow() {
  const path = join(metaRoot, '.github/workflows/deploy-shell.yml');
  assert(existsSync(path), 'deploy-shell.yml missing');
  const text = read(path);
  if (!/projectId:\s*fitness-aos\b/.test(text)) {
    fail('deploy-shell.yml must keep projectId: fitness-aos (private line)');
  }
}

function checkProductDeployWorkflow() {
  const path = join(metaRoot, '.github/workflows/deploy-product-hosting.yml');
  assert(existsSync(path), 'deploy-product-hosting.yml missing');
  const text = read(path);
  if (!/projectId:\s*vitalos-prod\b/.test(text) && !/--project\s+vitalos-prod\b/.test(text)) {
    fail('deploy-product-hosting.yml must target project vitalos-prod');
  }
  if (text.includes(`secrets.${PRIVATE_SA}`) && !text.includes(`secrets.${PRODUCT_SA}`)) {
    fail(`deploy-product-hosting.yml must not use private ${PRIVATE_SA} alone`);
  }
  if (new RegExp(`secrets\\.${PRIVATE_SA}\\s*\\|\\|`).test(text)) {
    fail(`deploy-product-hosting.yml must not fall back to ${PRIVATE_SA}`);
  }
  if (!text.includes(`secrets.${PRODUCT_SA}`)) {
    fail(`deploy-product-hosting.yml must use secrets.${PRODUCT_SA}`);
  }
}

function checkDeleteOwnAccountWorkflow() {
  const path = join(metaRoot, '.github/workflows/deploy-delete-own-account.yml');
  assert(existsSync(path), 'deploy-delete-own-account.yml missing');
  const text = read(path);
  const header = text.split(/^jobs:/m)[0];
  if (!/workflow_dispatch\s*:/.test(header)) {
    fail('deploy-delete-own-account.yml must declare workflow_dispatch');
  }
  for (const trigger of ['push:', 'pull_request:', 'schedule:']) {
    if (header.includes(trigger)) {
      fail(`deploy-delete-own-account.yml must not trigger on ${trigger.slice(0, -1)}`);
    }
  }
  if (!/--only\s+functions:vitalos:deleteOwnAccount\b/.test(text)) {
    fail('deploy-delete-own-account.yml must deploy only functions:vitalos:deleteOwnAccount');
  }
  if (!/--project\s+vitalos-prod\b/.test(text)) {
    fail('deploy-delete-own-account.yml must target project vitalos-prod');
  }
  if (text.includes(PRIVATE_PROJECT)) {
    fail(`deploy-delete-own-account.yml must not reference ${PRIVATE_PROJECT}`);
  }
  // Produkt-Secret heißt …_VITALOS_PROD und enthält den privaten Namen als Präfix.
  if (new RegExp(`secrets\\.${PRIVATE_SA}(?!_)`).test(text)) {
    fail(`deploy-delete-own-account.yml must not use private ${PRIVATE_SA}`);
  }
  if (!text.includes(`secrets.${PRODUCT_SA}`)) {
    fail(`deploy-delete-own-account.yml must use secrets.${PRODUCT_SA}`);
  }
  if (!/dry_run:[\s\S]*?default:\s*true/.test(header)) {
    fail('deploy-delete-own-account.yml dry_run must default to true');
  }
}

function walkPackageJson(dir, out = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.name === 'node_modules' || name.name === 'dist' || name.name.startsWith('dist-')) continue;
    if (name.name === 'migration' || name.name === '.git') continue;
    const full = join(dir, name.name);
    if (name.isDirectory()) walkPackageJson(full, out);
    else if (name.name === 'package.json') out.push(full);
  }
  return out;
}

function checkNoPrivateProjectInProductDeployScripts() {
  for (const pkgPath of walkPackageJson(productRoot)) {
    const rel = relative(productRoot, pkgPath);
    if (LEGACY_PRIVATE_DEPLOY_PATHS.has(rel)) continue;
    const text = read(pkgPath);
    if (/--project\s+fitness-aos\b/.test(text) || /projectId:\s*['"]fitness-aos['"]/.test(text)) {
      fail(
        `${rel} deploys with ${PRIVATE_PROJECT}; Store-Shell must use ${PRODUCT_PROJECT} ` +
          `(legacy allowlist: ${[...LEGACY_PRIVATE_DEPLOY_PATHS].join(', ')})`,
      );
    }
  }
}

export function checkProductBoundaries() {
  checkFirebaserc();
  checkPrivateShellWorkflow();
  checkProductDeployWorkflow();
  checkDeleteOwnAccountWorkflow();
  checkNoPrivateProjectInProductDeployScripts();
  return {
    productProject: PRODUCT_PROJECT,
    privateShellProject: PRIVATE_PROJECT,
    productServiceAccountSecret: PRODUCT_SA,
    legacyPrivateDeployAllowlist: [...LEGACY_PRIVATE_DEPLOY_PATHS],
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const info = checkProductBoundaries();
  console.log('PASS: product Firebase boundaries (vitalos-prod vs fitness-aos)');
  console.log(JSON.stringify(info, null, 2));
}
