import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function fitnessAssetLinks(packageName, fingerprints) {
  if (typeof packageName !== 'string' || packageName.length > 255 || !/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/.test(packageName)) {
    throw new Error('VOS_FITNESS_ANDROID_PACKAGE muss eine gültige Android-Paketkennung sein.');
  }
  const values = String(fingerprints || '').split(',').map((value) => value.trim().toUpperCase()).filter(Boolean);
  if (!values.length || values.some((value) => !/^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(value))) {
    throw new Error('VOS_FITNESS_ANDROID_SHA256 muss mindestens einen SHA-256-Fingerabdruck mit Doppelpunkten enthalten.');
  }
  return [{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: packageName, sha256_cert_fingerprints: [...new Set(values)] },
  }];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const links = fitnessAssetLinks(process.env.VOS_FITNESS_ANDROID_PACKAGE, process.env.VOS_FITNESS_ANDROID_SHA256);
    const manifest = JSON.parse(readFileSync(resolve(root, 'platforms/fitness-twa/twa-manifest.json'), 'utf8'));
    if (links[0].target.package_name !== manifest.packageId) {
      throw new Error('VOS_FITNESS_ANDROID_PACKAGE stimmt nicht mit der Paketkennung im Fitness-TWA-Manifest überein.');
    }
    if (process.argv.includes('--write')) {
      const out = resolve(root, 'vos-fitness/dist-firebase/.well-known/assetlinks.json');
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, `${JSON.stringify(links, null, 2)}\n`);
      console.log('Digital Asset Links für den Fitness-Produktbuild geschrieben.');
    } else {
      console.log('Android-Paketkennung und Fingerabdrücke sind syntaktisch gültig.');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
