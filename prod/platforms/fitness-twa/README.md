# Fitness VOS Android TWA draft

Generated with Bubblewrap Core 1.27.0 from `vos-fitness/public/manifest.json`. It opens `https://vitalos-fitness-prod.web.app/` and targets Android API 36. The package `at.vitalos.fitness` is provisional until confirmed. No keystore, fingerprint, signed artifact, Store upload or device acceptance exists.

`gradlew assembleDebug` builds a debug APK when JDK 17 and the Android SDK with platform 36/build tools are installed. `gradlew bundleRelease` creates an unsigned release bundle. Use a dedicated upload key and Play App Signing for a future signed upload; keep keystores outside Git. The website must publish `.well-known/assetlinks.json` with the correct app package and signing fingerprints before the app can open as a verified Trusted Web Activity. See `docs/PRODUCT-CHECKOUT.md`.

The Android browser helper requires Android 7 (API 24) or newer. Local `assembleDebug` and `bundleRelease` builds succeeded with JDK 17, SDK 36 and build tools 36.0.0. The AAB was verified as unsigned and the APK has not been installed or accepted on a device. Both point to the product web origin, whose app deployment and Digital Asset Links are still pending.

`bubblewrap update` regenerates project files from `twa-manifest.json` and can overwrite manual changes. The production web manifest and icons must be reachable before using it.
