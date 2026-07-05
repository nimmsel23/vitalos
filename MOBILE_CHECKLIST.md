---
# Mobile QA Checklist

This file provides a short set of manual checks and Lighthouse guidance for mobile-focused testing after merging mobile optimizations.

## Local dev

1. Start dev server:

   npm install
   npm run dev

2. Open http://localhost:9190 and toggle Chrome DevTools Device Toolbar (mobile emulation).

3. Check the following screens (Dashboard, a Training Session, Journal Entry):
   - Safe-area padding (top/bottom) on notch devices
   - Bottom navigation does not overlap content
   - Input fields scroll into view when focused (keyboard)
   - Touch targets are >= 44x44

## Build / PWA

1. Build firebase preview:

   npm run build:firebase
   npx http-server dist-firebase -p 8080

2. Open site on a mobile device or emulator. Install PWA and verify:
   - Shell loads offline (turn airplane mode on)
   - Writes are queued (Firestore offline persistence is enabled)

## Lighthouse (Mobile)

Run Lighthouse in Chrome DevTools (Mobile) on the prioritized screens. Look for:
- LCP: improve by inlining critical CSS / deferring non-critical JS
- TBT: avoid long tasks; code-split large libraries
- CLS: reserve image/icon dimensions and avoid layout shifts
- Accessibility: 90+

## Notes
- Firestore persistence is enabled by default (src/cloud/firebase.js). The app uses IndexedDB-backed local cache so reads come from cache while offline and writes are queued.
