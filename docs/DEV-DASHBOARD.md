# VitalOS Dev-Dashboard

Lebendes Inventar aller Firebase-Hosting-Apps (Haupt + Minis).

**Naming-SOT:** [HOSTING-TARGETS.md](./HOSTING-TARGETS.md) — Kanon `vos-<slug>.web.app`
(Ist-Mix `*-vos` / `vos-*` / `*-aos` ist Auth-/Redirect-Schuld; Migration dort).

| Was | Wo |
| --- | --- |
| Generator (SOT) | `scripts/vos-portal.mjs` · Wrapper `bin/vos-portal` |
| Meta-Dashboard | `portal/index.html` + Spiegel `docs/dev-dashboard.html` |
| Registry | `portal/registry.json` (erzeugt) |
| Status-Overlay | `portal/dev-status.json` (**kuratiert**, nicht erzeugen) |
| Hosting-Kanon | `portal/hosting-targets.json` + `docs/HOSTING-TARGETS.md` |
| Je Repo | `~/dev/<repo>/docs/apps.html` (+ `apps.json`) |
| Live (Pages) | https://nimmsel23.github.io/vitalos/dev-dashboard.html |
| Fuel-Beispiel | https://nimmsel23.github.io/fuel-dev/apps.html |

## Ownership

- **CTO** hält das Dashboard aktuell: in der Tagesrunde `vos-portal --all --check`; bei Drift `vos-portal` (schreibt Registry + alle `docs/apps.*`, verteilt Skript-Kopien). Auth-/Login-/ROT-Vermerke in `portal/dev-status.json` nachziehen, wenn Hosting oder OAuth sich ändert.
- **PM** nutzt Dashboard + `PRODUCT.md`-Tabelle als Produkt-Inventar (welche Surfaces live sind, was ROT/Offline-Gate blockiert) — keine zweite Apps-Liste pflegen.
- **ALs** ändern Hosting-Quellen (`miniapps.json`, `mini-app.json`, `.firebaserc`); Portal-Dateien nicht von Hand editieren.

## Tags

- `auth:project-domain` — `*.firebaseapp.com` (OAuth-Handler altbekannt; iOS-Partition-Risiko)
- `auth:same-origin` — Hosting-Site als `authDomain` (braucht GCP redirect URIs)
- `gate:hard` — Login-Mauer, Offline ohne Session tot
- `gate:soft` / `local-first` — App ohne Login nutzbar, Cloud optional
- `rot` — offener Betriebsblocker (Text im Overlay)
