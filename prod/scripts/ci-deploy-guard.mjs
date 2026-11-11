#!/usr/bin/env node
/**
 * Predeploy-Guard für prod/firebase.json.
 * Fail-closed: nur Firebase-Projekt vitalos-prod. Lokal zusätzlich Rückfrage.
 *
 * CI:    GITHUB_ACTIONS → keine Rückfrage, aber Projektpflicht
 * Lokal: Projektcheck, dann gum/confirm
 */

import { spawnSync } from 'node:child_process';

const PRODUCT_PROJECT = 'vitalos-prod';

function resolveProjectId() {
  return (
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.VITE_VOS_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT ||
    ''
  ).trim();
}

const projectId = resolveProjectId();
if (projectId !== PRODUCT_PROJECT) {
  console.error('');
  console.error(`⛔  Produkt-Deploy nur nach ${PRODUCT_PROJECT} (got: ${projectId || '(unset)'}).`);
  console.error('    Setze GCLOUD_PROJECT / GOOGLE_CLOUD_PROJECT / VITE_VOS_FIREBASE_PROJECT_ID.');
  console.error('');
  process.exit(1);
}

if (process.env.GITHUB_ACTIONS) {
  const saHint = process.env.VOS_PRODUCT_DEPLOY_SA || '';
  if (saHint && saHint !== 'FIREBASE_SERVICE_ACCOUNT_VITALOS_PROD') {
    console.error('⛔  Produkt-CI darf nicht den privaten FIREBASE_SERVICE_ACCOUNT nutzen.');
    process.exit(1);
  }
  process.exit(0);
}

console.error('');
console.error('⚠️  Direkter lokaler firebase deploy auf vitalos-prod.');
console.error('    Normalweg: GitHub Actions workflow_dispatch (deploy-product-hosting).');
console.error('    Preview: pnpm run deploy:preview (falls konfiguriert).');
console.error('');

function haveGum() {
  return spawnSync('command', ['-v', 'gum'], { shell: true }).status === 0;
}

function confirmed() {
  if (haveGum()) {
    const res = spawnSync(
      'gum',
      ['confirm', 'Live-Deploy nach vitalos-prod trotzdem lokal durchführen?'],
      { stdio: 'inherit' },
    );
    return res.status === 0;
  }
  const res = spawnSync(
    'bash',
    [
      '-c',
      'read -r -p "Live-Deploy nach vitalos-prod trotzdem lokal? [y/N] " ans < /dev/tty; [[ "$ans" =~ ^([yY]|[jJ][aA]?)$ ]]',
    ],
    { stdio: 'inherit' },
  );
  return res.status === 0;
}

if (!confirmed()) {
  console.error('⛔  Abgebrochen.');
  process.exit(1);
}
