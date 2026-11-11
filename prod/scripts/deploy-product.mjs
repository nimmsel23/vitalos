#!/usr/bin/env node
/**
 * Fail-closed Produkt-Deploy-Freigabe (predeploy TWA / pnpm firebase).
 * Freigabe nur mit VOS_PRODUCT_DEPLOY=1 und Projekt vitalos-prod.
 */
const PRODUCT_PROJECT = 'vitalos-prod';

const projectId = (
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.VITE_VOS_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT ||
  ''
).trim();

if (process.env.VOS_PRODUCT_DEPLOY !== '1') {
  console.error('VitalOS Produkt-Deploy ist fail-closed gesperrt.');
  console.error('Freigabe: VOS_PRODUCT_DEPLOY=1 und Projekt vitalos-prod.');
  console.error('Shell-Hosting-CI: .github/workflows/deploy-product-hosting.yml (workflow_dispatch).');
  console.error('Build ohne Deploy: pnpm run product:build (siehe docs/PRODUCT-CHECKOUT.md).');
  process.exit(1);
}

if (projectId !== PRODUCT_PROJECT) {
  console.error(`VitalOS Produkt-Deploy: Projekt muss ${PRODUCT_PROJECT} sein (got: ${projectId || '(unset)'}).`);
  process.exit(1);
}

console.log(`PASS: product deploy gate (VOS_PRODUCT_DEPLOY=1, project=${PRODUCT_PROJECT})`);
