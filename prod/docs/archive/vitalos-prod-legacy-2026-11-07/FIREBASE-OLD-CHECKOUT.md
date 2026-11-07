# Firebase-Runbook — Produktprojekt `vitalos-prod`

_stand: 2026-11-05. Dieses Runbook beschreibt das Produktprojekt dieses Checkouts. Das private Projekt `fitness-aos` (Legacy-PWA) ist hier **nie** Ziel von Builds, Konfigs, Workflows oder Deploys (fail-closed). Aktueller Freigabestand und Historie: `docs/PRODUCT-CHECKOUT.md`._

## Projektinventar

| Ressource | Wert |
|---|---|
| Project ID / Nummer | `vitalos-prod` / `149035799731` |
| Firebase-Apps | `VitalOS Product Web` (`1:149035799731:web:2c80308413701435d18cc6`), `VitalOS Android` (`1:149035799731:android:dbe70b98fd4a78f9d18cc6`), `VitalOS iOS` (`1:149035799731:ios:c7a6bb558b0c1ffcd18cc6`) |
| Hosting | Target `vitalos` → Site `vitalos-prod` → `https://vitalos-prod.web.app` (Live-Shell); Target `fitness-product` → Site `vitalos-fitness-prod` → Fitness-TWA-Pilot (noch ohne Deployment) |
| Firestore | `(default)` in `eur3`, Standard-Edition, Löschschutz aktiv |
| Storage Bucket | `vitalos-prod.firebasestorage.app` |
| Billing | Blaze aktiv (2026-11-05) |
| Cloud Logging | aktiviert (2026-11-05, durch Owner) — Logs in der Konsole unter Cloud Logging; erste Anlaufstelle für Auth-/Anmelde-Events und später Functions-/Hosting-Diagnose |

CLI vor Ort: `firebase` (npx firebase-tools, angemeldet als `nimmdaniel@gmail.com`) und `gcloud` (gleicher Account, Default-Project bleibt `fitness-aos` — immer `--project vitalos-prod` mitgeben).

## Build-Umgebung und Geheimnisse

- `pnpm run build:cloud` und alle `build:product:*`-Skripte verlangen drei Umgebungs­werte: `VITE_VOS_FIREBASE_PROJECT_ID` (muss `vitalos-prod` sein), `VITE_VOS_FIREBASE_WEB_CONFIG` (JSON der Web-App-Konfiguration) und `VITE_VOS_FIREBASE_VAPID_KEY` (öffentlicher P-256-Schlüssel). Fehlen sie, bricht der Build ab.
- Die Werte liegen in `.product-config/product.env` (vom Git ignoriert; **niemals committen**). Dort stehen die konkreten Werte für die drei Build-Variablen; die Web-SDK-Konfiguration inkl. API-Key ist dort TEIL der Datei.
- Das VAPID-Paar wird seit 2026-11-05 in der **Firebase Console** verwaltet (Project settings → Cloud Messaging → Web-Push-Zertifikate, dort generiert): der öffentliche Schlüssel liegt in der Env-Datei, der private nur bei Google. Das vorher lokal erzeugte Paar wurde ersetzt. Pair-Rotation immer über die Konsole (neu generieren → öffentlichen Schlüssel in `.product-config/product.env` tauschen → Bundle neu bauen → deployen; alte Push-Subscriptions laufen dann ungültig).
- Service-Account-Key für Deploy/CI: `.product-config/vos-product-firebase-service-account.json` (gitignored), erzeugt via `gcloud iam service-accounts keys create` für `firebase-adminsdk-fbsvc@vitalos-prod.iam.gserviceaccount.com`. Der SA hat `roles/firebasehosting.admin`; für spätere Rules-/Functions-Deploys sind separate Rollen (`firebaserules.*`, `cloudfunctions.*`) zu vergeben.
- GitHub (Repo `nimmsel23/vitalos-prod`) ist produktbereit vorbereitet: Secret `VOS_FIREBASE_SERVICE_ACCOUNT` (SA-JSON) sowie die Variablen `VOS_FIREBASE_PROJECT_ID`, `VOS_SHELL_SITE_ID`, `VOS_FIREBASE_VAPID_KEY`, `VOS_FIREBASE_WEB_CONFIG` (Stand 2026-11-05). `deploy-shell.yml` feuert nur bei `workflow_dispatch` oder Push auf `master` — dieser Branch existiert im Fork nicht, ein versehentlicher CI-Live-Deploy ist damit ausgeschlossen; die Edition-Site-IDs (`VOS_OBSERVE_SITE_ID`, `VOS_OPERATE_SITE_ID`) bleiben unbelegt, bis eigene Edition-Hosting-Sites angelegt sind.
- Produkt-Builds prüfen sich selbst: `scripts/prepare-vitalos-product-config.mjs` (Konfiguration → `.product-config/firebase.config.js`) und `scripts/test-product-firebase-isolation.mjs` (Bundle darf keine privaten Werte enthalten, muss die VAPID-Kennung enthalten).

## Auth (`identitytoolkit.googleapis.com`)

Provisioniert am 2026-11-05 per API, nachdem Blaze aktiv war. Nachspielbare Schritte:

1. `gcloud services enable identitytoolkit.googleapis.com --project vitalos-prod`
2. Config initialisieren (nur einmal;_PATCH auf `/config` erzeugt sie **nicht**, es kommt `CONFIGURATION_NOT_FOUND`):
   `POST https://identitytoolkit.googleapis.com/v2/projects/vitalos-prod/identityPlatform:initializeAuth`
3. Domains und Anbieter setzen:
   `PATCH .../v2/projects/vitalos-prod/config?updateMask=authorizedDomains,signIn.email.enabled,signIn.email.passwordRequired`
4. Verifikation: echtes REST-Signup mit dem Web-API-Key (`identitytoolkit.googleapis.com/v1/accounts:signUp?key=…`, Issuer muss `securetoken.google.com/vitalos-prod` sein); Probe-Nutzer danach mit `accounts:delete` (idToken) wieder entfernen.

Aktueller Stand: autorisierte Domains `vitalos-prod.firebaseapp.com`, `vitalos-prod.web.app`, `localhost`; E-Mail/Passwort aktiviert und live verifiziert; das Sign-in-Formular der Shell bietet E-Mail/Passwort **und** Google an.

Fußangeln:

- REST-Aufrufe brauchen für gcloud-Tokens den Header `X-Goog-User-Project: vitalos-prod` (ADC ohne Quota-Project → 403 `SERVICE_DISABLED`/Quota-Fehler). `gcloud`-Befehle selbst funktionieren mit `--project`.
- Vor der Initialisierung melden **alle** v1-Endpunkte `CONFIGURATION_NOT_FOUND` — zuerst `initializeAuth`, dann alles andere.
- Google-Anbieter: die v2-API verlangt für `defaultSupportedIdpConfigs/google.com` zwingend `clientId`/`clientSecret`; Auto-Provisioning gibt es heute nur über die Firebase Console, und die früher nutzbaren IAP OAuth Admin APIs (`gcloud alpha iap oauth-brands/oauth-clients`) sind 2026 abgeschaltet. → **Konsolen-Schritt des Eigentümers:** Authentication → Sign-in method → Google → Enable.
- VAPID für Web-Push: in der Konsole verwaltet (siehe Build-Umgebung); Console-Schritt ist erledigt. Was noch fehlt, ist die **Runtime-Akzeptanz** von Push (Echtgerät/Erst-Anmeldung → Token → Nachricht).

## Native Firebase-Konfiguration (Capacitor)

- Android: `android/app/google-services.json` (Paket `com.vitalos.app`, Projekt `vitalos-prod`). Das Gradle-Setup wendet das google-services-Plugin automatisch an, sobald diese Datei liegt (`android/app/build.gradle`); ohne sie wird nur geloggt.
- iOS: `ios/App/App/GoogleService-Info.plist` (`com.vitalos.app`), inkl. Eintrag im Xcode-Target (`App.xcodeproj/project.pbxproj`: FileReference, Gruppe, Resources-Phase).
- Native Google-Anmeldung braucht zusätzlich die Client-Registrierung in Firebase (Android SHA-1-Fingerprints / iOS-URL-Schema) — noch offen, siehe `docs/STORE-PUBLISHING-PLAN.md`.

## Deploy-Wege

- **Hosting (Shell):** Build `pnpm run build:cloud` (Output `dist-store/`), dann `npx firebase deploy --only hosting --public dist-store --project vitalos-prod`. Achtung: `firebase.json` zeigt als `public` auf `dist-firebase` (CI-Weg `build:firebase`) — bei Store-Builds immer `--public dist-store` mitgeben. Der Predeploy-Guard (`scripts/ci-deploy-guard.mjs`) fragt bei lokalem Live-Deploy interaktiv nach und blockt versehentliche Deploys.
- **Firestore-Rules:** SSOT für das Produkt ist `firestore.product.rules`, generiert von `scripts/build-product-rules.mjs` (Coach-Privileg gesperrte Produkt-Rolle; `--check` meldet Drift). Deploy-Definition: `firebase.product-rules.json`. Live-Stand 2026-11-04: Ruleset `e94fc22e-b0f8-4f4a-b9c8-9567ebc540bd`, quellexakt (SHA-256 `c8d3b93d…c2b6`).
- **Journal-Functions:** Codebase-Definition `firebase.product-journal.json`; Predeploy-Gate `scripts/check-product-journal.mjs` (verlangt `vitalos-prod`, sauberen Gitlink-Checkout und `VOS_GEMINI_SERVER_KEY_ID`). Bei Deploy jeden Callable einzeln filtern (Liste in PRODUCT-CHECKOUT.md), kein Whole-Codebase-Deploy.
- **Fitness-Hosting:** `firebase.product-fitness.json` (erlaubt `.well-known`, blockt Deploy bis Produkt-Freigabe). Das geerbte `vos-fitness/firebase.json` (private Site) nicht verwenden.
- **CI (GitHub Actions):** `deploy-shell.yml`, `deploy-vos-edition.yml` (manuell, Ref `master`), `build-fitness-twa.yml` lesen Projekt/Site/Konfig aus `VOS_FIREBASE_PROJECT_ID`, `VOS_SHELL_SITE_ID`, `VOS_OBSERVE_SITE_ID`, `VOS_OPERATE_SITE_ID`, `VOS_FIREBASE_WEB_CONFIG`, `VOS_FIREBASE_VAPID_KEY` und `VOS_FIREBASE_SERVICE_ACCOUNT`; bis diese gesetzt sind, verweigern sie den Live-Deploy. Geerbte private Workflows liegen disabled (`.yml.disabled` / `.github/workflows.disabled/`).

## Achtungen

- Builds mit Test-Platzhaltern (Test-VAPID, unvollständige Firebase-Werte) sind keine Release-Artefakte.
- Neue Hosting-Sites/Channels: `authorizedDomains` der Auth-Config ergänzen, sonst schlägt die Anmeldung auf der neuen Origin fehl.
- `firebase.config.js` im Root behält die private Konfiguration nur für unqualifizierte lokale Builds; Produkt-Builds zwingen die Produkt-Identität (`VITE_VOS_PRODUCT_BUILD=1`, Bundle-Gate).
- Verweis-Stand: `docs/PRODUCT-CHECKOUT.md` (Freigaben/Historie), `docs/STORE-PUBLISHING-PLAN.md` (Store-Weg), `.firebaserc` (Targets), `scripts/` (Build- und Prüfskripte).
