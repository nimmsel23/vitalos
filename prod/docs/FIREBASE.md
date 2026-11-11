# Firebase-Runbook — Produktziel `vitalos-prod`

## Geltungsbereich und Arbeitsverzeichnis

Dieses Runbook gilt für `~/vitalos/prod`. Die private Root-PWA verwendet ihr
eigenes Firebase-Ziel `fitness-aos`; Produkt-Builds verlangen `vitalos-prod`.
App-Quellen kommen aus den gemeinsamen Submodulen im Parent. Das Produkt hat
keine eigenen App-Pins oder ein eigenes Lockfile.

**Owner-Trennung (2026-11-11):** Store-User und private Klienten bekommen denselben
Quellcode in getrennten Firebase-/Firestore-Hostings, Projekten und Accounts.
Google-Konten: privat/Org = `nimmsel23@gmail`, nach außen (Store/Produkt) =
`nimmdaniel@gmail`. Architektur-Metapher und Release-Folge:
[UNIFIED-PRODUCT.md — Owner-Klarstellung 2026-11-11](../../docs/UNIFIED-PRODUCT.md#owner-klarstellung-2026-11-11-quelle-vs-store-gewand).

Root-Builds über `product:*` starten: [Befehlsübersicht](../../docs/UNIFIED-PRODUCT.md).
Direkte produktinterne Befehle und Firebase-Konfigurationen unten beziehen sich
auf das Arbeitsverzeichnis `/home/alpha/vitalos/prod`, sofern nicht anders angegeben.

## Lokale Buildwerte

Benötigt werden `VITE_VOS_FIREBASE_PROJECT_ID=vitalos-prod`,
`VITE_VOS_FIREBASE_WEB_CONFIG` und `VITE_VOS_FIREBASE_VAPID_KEY`.
Sie liegen lokal in `prod/.product-config/product.env`, vom Meta-Repo-Root aus
gesehen. Innerhalb dieses Produktverzeichnisses heißt derselbe Pfad
`.product-config/product.env`. Die Migration hat vorhandene lokale Werte
kopiert, ohne das Original im alten Checkout zu entfernen.

Beispiel für Bash/Zsh, ohne Ausgabe der Datei oder ihrer Werte:

```sh
cd /home/alpha/vitalos
set -a
source prod/.product-config/product.env
set +a
pnpm run product:build
```

Keine Secrets in Doku, Git, Logs oder Shell-Trace schreiben. Der vorhandene
Service-Account bleibt lokal unter `.product-config/`; vor einem autorisierten
Deploy dessen Ziel und Berechtigungen prüfen. Keine neuen Schlüssel als
Nebenwirkung eines Builds erzeugen. Buildkonfiguration wird durch
`scripts/prepare-vitalos-product-config.mjs` vorbereitet; die Bundle-Isolations-
prüfung gehört zum Produkt-Buildweg. Platzhalter ergeben kein Release-Artefakt.

## CI Secrets (nur Namen) und Deploy-Trennung

Private Shell-CI (`deploy-shell.yml`) deployt nach `fitness-aos` mit
`FIREBASE_SERVICE_ACCOUNT`. Produkt-Hosting darf dieses Secret **nie** nutzen.

| GitHub Actions Secret (Name) | Zweck |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT_VITALOS_PROD` | Hosting-Deploy nach `vitalos-prod` |
| `VITE_VOS_FIREBASE_PROJECT_ID` | CI-Produkt-Build; Wert muss `vitalos-prod` sein |
| `VITE_VOS_FIREBASE_WEB_CONFIG` | CI-Produkt-Build (Web-Config JSON) |
| `VITE_VOS_FIREBASE_VAPID_KEY` | CI-Produkt-Build (VAPID) |

Quelle lokal: `prod/.product-config/product.env` und
`prod/.product-config/vos-product-firebase-service-account.json`. Owner-Regel
2026-11-11: Agenten mit Zugriff setzen fehlende Secrets selbst via
`gh secret set -R nimmsel23/vitalos` (Werte nie ausgeben/committen); privates
`FIREBASE_SERVICE_ACCOUNT` unberührt lassen. Stand gesetzt: 2026-11-11.

Workflows:

- `product-check.yml` — Push auf `master` (Paths `prod/**` u. a.) + `workflow_dispatch`: Layout, Boundary-Check, Manifest; optional Store-Build wenn die `VITE_VOS_FIREBASE_*`-Secrets gesetzt sind. **Kein Deploy.**
- `deploy-product-hosting.yml` — nur `workflow_dispatch`: Store-Build (`dist-store`) + Hosting Target `vitalos` auf `vitalos-prod`. Fehlt `FIREBASE_SERVICE_ACCOUNT_VITALOS_PROD`, bricht der Job ab.

Lokal/predeploy: `prod/scripts/ci-deploy-guard.mjs` verlangt Projekt `vitalos-prod`; TWA/`pnpm firebase` über `deploy-product.mjs` zusätzlich `VOS_PRODUCT_DEPLOY=1`. Boundary-Check: `pnpm run product:check` bzw. `node prod/scripts/check-product-boundaries.mjs`.

## Ressourceninventar

Die folgenden IDs stammen aus dem bisherigen Produkt-Runbook. Sie dienen der
Zuordnung; Verfügbarkeit, Auth-Provider, IAM, Billing und Hosting-Stand wurden
für diese Doku-Überarbeitung nicht neu abgefragt.

| Ressource | Zuordnung |
| --- | --- |
| Firebase-Projekt / Nummer | `vitalos-prod` / `149035799731` |
| Web-App | `VitalOS Product Web`, `1:149035799731:web:2c80308413701435d18cc6` |
| Android-/iOS-App | Produktpaket `com.vitalos.app` |
| Shell-Hosting | Target `vitalos`, Site `vitalos-prod`, `vitalos-prod.web.app` |
| Fitness-TWA-Hosting | Target `fitness-product`, Site `vitalos-fitness-prod` |
| Firestore / Storage | `(default)` in `eur3` / `vitalos-prod.firebasestorage.app` |

Historische Befunde zu Auth, Billing, Hosting, VAPID und Rules:
[Produkt-Historie](archive/PRODUCT-CHECKOUT-BEFORE-UNIFICATION-2026-11-06.md).
Das [historische Firebase-Runbook](archive/FIREBASE-BEFORE-UNIFICATION-2026-11-06.md)
erhält die damaligen Provisionierungsbefunde und Bedienhinweise.
Diese Befunde nicht automatisch erneut provisionieren; den Zielzustand vor
Änderungen frisch prüfen. Bei CLI-Aufrufen das Projekt explizit angeben, statt
auf eine lokale gcloud-/Firebase-Voreinstellung zu vertrauen.

## Native Konfiguration

Im Produktverzeichnis: `android/app/google-services.json` und
`ios/App/App/GoogleService-Info.plist`. Die Webkonfiguration ersetzt weder
native Client-Registrierungen noch Android-Signatur-Fingerprints oder iOS-
Rücksprungkonfiguration. Google-Login, Kalender-OAuth und Push sind getrennte
Integrationen. Ein vorhandener Client-Eintrag oder ein Sync beweist keine Anmeldung.
Die früher dokumentierte Android-Google-Auth-Lücke ist vor einer Abnahme frisch
zu prüfen; keinen inzwischen überholten Konsolen-Schritt blind wiederholen.
Stand 2026-11-06: `google-services.json` enthält noch keinen Android-OAuth-Client
mit Fingerabdruck; Owner-Checkliste und lokale Signing-Fingerabdrücke stehen im
[Store-Plan](STORE-PUBLISHING-PLAN.md).

## Deployment-Ziele — nur bei eigenem Veröffentlichungsauftrag

| Ziel | Produktdatei / Quelle | Besonderheit |
| --- | --- | --- |
| Shell-Hosting | `firebase.json` | Vorgabe `dist-firebase`; Store-Build liegt in `dist-store` |
| Produkt-Rules | `firebase.product-rules.json`, `firestore.product.rules` | Produkttransformation aus `firestore.rules`; kein privater Rules-Deploy |
| Journal-Functions | `firebase.product-journal.json`, `../journal-app/functions` | Preflight prüft gemeinsamen Parent-Pin und Produktkonfiguration |
| Fitness-TWA-Hosting | `firebase.product-fitness.json` | eigener Host und Digital Asset Links; geerbtes `vos-fitness/firebase.json` nicht verwenden |

Für einen später autorisierten Shell-Hosting-Deploy aus diesem Verzeichnis
ist der Store-Output ausdrücklich zu wählen, z. B. mit `--public dist-store`
und `--project vitalos-prod`. Der lokale Guard ist keine Push-/Deploy-Freigabe.
Rules, Functions und Hosting getrennt beauftragen. Journal-Callables gezielt
auswählen; ein Whole-Codebase-Deploy umfasst auch andere Functions.

## Datenschutz-Seiten und Kontolöschung (C-013)

Öffentliche Seiten, ohne Anmeldung:

| URL | Quelle |
| --- | --- |
| `https://vitalos.web.app/datenschutz` | `public/datenschutz/index.html` und `prod/public/datenschutz/index.html` |
| `https://vitalos.web.app/konto-loeschen` | `public/konto-loeschen/index.html` und `prod/public/konto-loeschen/index.html` |

`vitalos.web.app` veröffentlicht der bestehende Shell-Deploy
(`.github/workflows/deploy-shell.yml`, Projekt `fitness-aos`, Root-`firebase.json`).
Die Produkt-Hosting-Konfiguration `prod/firebase.json` (Site `vitalos-prod`)
trägt dieselben Rewrites vor dem SPA-Fangnetz `**`. Statische Dateien
gewinnt Hosting vor Rewrites. Der Service Worker der Shell lässt beide
Pfade durch, damit er die App-Shell nicht mit der Rechtsseite überschreibt.

Der Wortlaut ist der Sachstand des Release-Builds (Firebase Authentication,
Cloud Firestore, Google-Anmeldung, optionales Cloud Messaging; kein Gemini,
kein Analytics-, Crash- oder Werbe-SDK im Produktcode). C-014 darf ihn
ersetzen. Eine öffentliche Kontaktadresse steht nicht im Repo. Der
Platzhalter `KONTAKT-FOLGT@example.invalid` ist nicht zustellbar.

Die Kontolöschung in der App ruft `deleteOwnAccount` auf
(`prod/functions/index.js`, Region `europe-west1`). Die Function liest die
uid nur aus der Anmeldung, löscht die Firestore-Wurzeln dieser uid
(`roles`, `sixpackSelfies`, `skillsUsers`, `coachConversations`, `fitness`,
`planResponses`, `journal`, `nutrition`, `supplements`, `users`, `relax`)
und danach den Auth-Nutzer. `kb` und `public` sind keine Nutzer-IDs.
Geteilte Kataloge bleiben.

Dieser Deploy ist nicht der Shell-Hosting-Deploy. Ein späterer Auftrag
veröffentlicht gezielt nur diese Function, nicht die ganze Codebase:

```sh
cd /home/alpha/vitalos/prod
npx firebase-tools deploy --only functions:vitalos:deleteOwnAccount --project vitalos-prod
```

Vorher die Tests `pnpm --filter @vitalos/product run test:account-deletion`.
Ein manueller Löschversuch nur mit einem neuen Wegwerfkonto. Keine
bestehenden Personenkonten und keine Produktionsdaten löschen. Der
In-App-Knopf bleibt ohne diesen Function-Deploy ohne Serverwirkung.

## CI nach der Zusammenführung

Aktive Produkt-Vorlagen liegen im Parent unter
`.github/workflows/product-check.yml` und `product-twa.yml`, beide manuell.
Der erste Workflow dokumentiert Quellen und Pins; er ist kein vollständiger
Produkt-Build oder Deploy. Private Root-Deploy-Workflows behalten ihr privates
Ziel. Im alten Produkt-Repo konfigurierte GitHub-Secrets/Variablen werden nicht
durch eine lokale Remote-Definition ins neue Quellrepo übertragen.
Keine alten `master`-Deploy-Workflows des Produkt-Forks ungeprüft aktivieren.

## GitHub Pages (Meta-Repo, kein Firebase-Hosting)

Separater öffentlicher Doku-/Landing-Kanal am Parent-Repo `nimmsel23/vitalos`
(Stand erfasst 2026-11-09, Org-Task `378427eb`; keine Console-/Konfigänderung
in diesem Lauf):

| Feld | Ist |
| --- | --- |
| URL | `https://nimmsel23.github.io/vitalos/` |
| Build | Legacy (`build_type=legacy`), Status `built` |
| Quelle | Branch `master`, Pfad `/docs` — jeder Push auf `master` baut neu |
| Domain | keine Custom-Domain; HTTPS enforced; `public=true` |

**Bestand unter `docs/` auf `master` (17 Dateien):** Marketing-Landing
`docs/Index.html` plus Betriebs-/Architektur-Runbooks (`DEPLOYMENT.md`,
`CI-DEPLOY-PR-FLOW.md`, `UNIFIED-PRODUCT.md`, `FUNCTIONS-*-MIGRATION.md`,
`PUSH-FUNCTIONS.md`, `STORE-*-*.md`, `SHELL-SERVICE-WORKER.md`,
`CLI-VLOG-VOS-FIRESTORE.md`, `OBSERVE-OPERATE-ARCHITECTURE.md`, u. a.).

**Live-Check:** Root `…/vitalos/` → HTTP 404 (kein kleingeschriebenes
`index.html`/`README.md` in `/docs`). `…/vitalos/Index.html` → HTTP 200.
Die Landing referenziert Root-Assets (`/app.js`, `/consent.js`, Legal-Seiten),
die unter der Pages-Quelle `/docs` nicht mitgeliefert werden — gebrochene
Relativpfade.

**Sensibles-Inhalte-Check (ohne Secret-Werte):** Keine Rohschlüssel, keine
`google-services.json`, keine Kundendaten im veröffentlichten `docs/`-Baum.
Wohl aber öffentlich lesbare Betriebsdetails: Service-Account-Mails
(`fitness-pwa-deploy@…`, Compute-Laufzeitkonten), Secret-*Namen*
(`GEMINI_API_KEY`, `GOOGLE_OAUTH_CLIENT_SECRET`,
`BACKEND_FUNCTIONS_DEPLOY_KEY`), IAM-/Deploy-Reparaturhinweise, interne
Release-Abläufe. Das öffentliche Git-Repo legt dieselben Dateien ohnehin offen;
Pages macht sie zusätzlich als Website browsbar.

**Empfehlung (Entscheidung = Owner-Gate):** Pages **deaktivieren oder stark
beschneiden**. Ops-Runbooks brauchen keinen Site-Kanal; Produkt-Landing gehört
auf Produkt-/Marketing-Hosting, nicht neben interne Deploy-Doku. Bis zur
Owner-Entscheidung: keine Pages-Konfig anfassen. Alternative nur falls Landing
bewusst bleiben soll: kleingeschriebenes `docs/index.html` + Ops-Markdown aus
dem Pages-Pfad nehmen (oder Actions-Publish nur für kuratierte Public-Dateien).

Verweiskette: [Deployment](../../docs/DEPLOYMENT.md),
[UNIFIED-PRODUCT](../../docs/UNIFIED-PRODUCT.md). Verwandter CTO-Hit zur
Public-Repo-Sichtbarkeit: Org-Task `8e82a31b` (C-004).
