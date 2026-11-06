import { spawnSync } from 'node:child_process';
import { productConfigForHost } from './product-auth-domain.mjs';

const edition = process.argv[2] || 'store';
if (!['store', 'observe', 'operate'].includes(edition)) {
  console.error('VitalOS Produkt-Build: Edition muss store, observe oder operate sein.');
  process.exit(1);
}
const required = ['VITE_VOS_FIREBASE_PROJECT_ID', 'VITE_VOS_FIREBASE_WEB_CONFIG', 'VITE_VOS_FIREBASE_VAPID_KEY'];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`VitalOS Produkt-Build: Es fehlen ${missing.join(', ')}.`);
  console.error('Diese Werte müssen zum Firebase-Projekt vitalos-prod gehören. Siehe docs/PRODUCT-CHECKOUT.md.');
  process.exit(1);
}
if (process.env.VITE_VOS_FIREBASE_PROJECT_ID !== 'vitalos-prod') {
  console.error('VitalOS Produkt-Build: Nur das Projekt vitalos-prod ist als Ziel eingerichtet.');
  process.exit(1);
}
const result = spawnSync('pnpm', ['run', `build:firebase:${edition}`], {
  stdio: 'inherit',
  env: { ...process.env, VITE_VOS_PRODUCT_BUILD: '1', VITE_VAPID_KEY: process.env.VITE_VOS_FIREBASE_VAPID_KEY,
    VITE_VOS_FIREBASE_WEB_CONFIG: productConfigForHost(process.env.VITE_VOS_FIREBASE_WEB_CONFIG, 'vitalos-prod.web.app') },
});
if (result.error) {
  console.error(`Produkt-Build konnte nicht gestartet werden: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
