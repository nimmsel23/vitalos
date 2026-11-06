// Functions-Deploy zurueckgestellt bis Operate (Phase 06, Owner-Entscheid
// 2026-11-07): Journal-Functions laufen nur im privaten Projekt; dieser
// Guard bleibt als Operate-Vorausarbeitung im Repo und wird bei
// Nicht-Deploy nicht ausgefuehrt.
import { execFileSync } from 'node:child_process';
import { checkProductAiAccess } from './product-ai-access.mjs';

if (process.env.GCLOUD_PROJECT !== 'vitalos-prod') {
  console.error('Product AI preflight: deployment requires project vitalos-prod.');
  process.exit(1);
}
try {
  const gcloud = (args) => execFileSync('gcloud', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 });
  const enabledServices = gcloud(['services', 'list', '--enabled', '--project=vitalos-prod', '--format=value(config.name)']).trim().split(/\r?\n/).filter(Boolean);
  const keys = JSON.parse(gcloud(['services', 'api-keys', 'list', '--project=vitalos-prod', '--format=json']));
  checkProductAiAccess({ enabledServices, keys, approvedServerKeyId: process.env.VOS_GEMINI_SERVER_KEY_ID || '' });
  console.log('Product AI preflight: direct Firebase AI Logic is disabled and API key restrictions passed the metadata gate.');
} catch (error) {
  console.error(`Product AI preflight failed: ${error.message?.startsWith('Command failed') ? 'Google Cloud metadata could not be read.' : error.message}`);
  process.exit(1);
}
