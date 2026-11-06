# Firebase-Runbook — Produktziel `vitalos-prod`

## Geltungsbereich und Arbeitsverzeichnis

Dieses Runbook gilt für `~/vitalos/prod`. Die private Root-PWA verwendet ihr
eigenes Firebase-Ziel `fitness-aos`; Produkt-Builds verlangen `vitalos-prod`.
App-Quellen kommen aus den gemeinsamen Submodulen im Parent. Das Produkt hat
keine eigenen App-Pins oder ein eigenes Lockfile.

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

## CI nach der Zusammenführung

Aktive Produkt-Vorlagen liegen im Parent unter
`.github/workflows/product-check.yml` und `product-twa.yml`, beide manuell.
Der erste Workflow dokumentiert Quellen und Pins; er ist kein vollständiger
Produkt-Build oder Deploy. Private Root-Deploy-Workflows behalten ihr privates
Ziel. Im alten Produkt-Repo konfigurierte GitHub-Secrets/Variablen werden nicht
durch eine lokale Remote-Definition ins neue Quellrepo übertragen.
Keine alten `master`-Deploy-Workflows des Produkt-Forks ungeprüft aktivieren.
