#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export VITE_VOS_PRODUCT_BUILD=1
export VITE_APP_MODE=client
export VITE_VOS_FIREBASE_WEB_CONFIG="$(node --input-type=module -e "import { productConfigForHost } from './scripts/product-auth-domain.mjs'; process.stdout.write(productConfigForHost(process.env.VITE_VOS_FIREBASE_WEB_CONFIG, 'vitalos-fitness-prod.web.app'))")"
# The config preparation validates all required Firebase values and rejects
# the private project before any bundle is produced.
node scripts/prepare-vitalos-product-config.mjs
export VITE_VAPID_KEY="$VITE_VOS_FIREBASE_VAPID_KEY"
pnpm run build:fitness-kb-data
pnpm exec vite build vos-fitness --config vos-fitness/vite.config.cjs
node scripts/test-product-firebase-isolation.mjs vos-fitness/dist-firebase
