#!/usr/bin/env bash
set -euo pipefail

export VITE_VOS_PRODUCT_BUILD=1
export VITE_VOS_EDITION=store
export VITE_VOS_NATIVE_BUILD=1

pnpm run build:fitness-kb-data
pnpm run build:6pack-data
node scripts/prepare-vitalos-product-config.mjs
vite build --mode firebase --outDir dist-native
node scripts/prepare-vitalos-product-config.mjs --write-service-workers dist-native
node scripts/test-product-firebase-isolation.mjs dist-native
node packages/mini-app-shell/cli.mjs stamp dist-native --app vitalos
