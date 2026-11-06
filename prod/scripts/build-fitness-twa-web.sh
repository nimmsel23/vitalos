#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Fail before building if no real Android app/signing identity was supplied.
node scripts/fitness-assetlinks.mjs
pnpm run build:fitness:product
node scripts/fitness-assetlinks.mjs --write
