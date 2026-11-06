import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EDITIONS = new Set(['observe', 'operate']);

export function createEditionFirebaseConfig(baseConfig, edition) {
  if (!EDITIONS.has(edition)) throw new Error('edition must be observe or operate');
  const baseHosting = Array.isArray(baseConfig.hosting) ? baseConfig.hosting[0] : baseConfig.hosting;
  if (!baseHosting || typeof baseHosting !== 'object') throw new Error('firebase.json has no Hosting configuration');
  const { target: _baseTarget, site: _baseSite, public: _basePublic, ...sharedHosting } = baseHosting;
  return {
    hosting: {
      ...sharedHosting,
      target: edition,
      public: `dist-${edition}`,
    },
  };
}

function main() {
  const edition = process.env.VOS_EDITION;
  if (!EDITIONS.has(edition)) throw new Error('VOS_EDITION must be observe or operate');
  const baseConfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'firebase.json'), 'utf8'));
  const outputPath = path.join(ROOT, `firebase.${edition}.generated.json`);
  fs.writeFileSync(outputPath, `${JSON.stringify(createEditionFirebaseConfig(baseConfig, edition), null, 2)}\n`);
  console.log(`Wrote ${path.basename(outputPath)} for ${edition}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
