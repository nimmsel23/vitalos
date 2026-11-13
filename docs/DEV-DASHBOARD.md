# VitalOS Portal — App-Links & APK-Downloads

**Kein Dashboard.** `vos-portal` / `portal/` ist **App-Links und APK-Downloads**
(welche Surfaces live sind, Auth-/Gate-/ROT-Tags, Download-Links). Org-/Bot-Dashboards liegen
woanders: **https://vos-dev-dashboards.web.app** (`~/dashboards`, Repo `nimmsel23/dashboards`).

Der Dateiname `DEV-DASHBOARD.md` / `dev-dashboard.html` ist historisch — Inhalt = Portal.

**Naming-SOT:** [HOSTING-TARGETS.md](./HOSTING-TARGETS.md) — Kanon `vos-<slug>.web.app`
(Ist-Mix `*-vos` / `vos-*` / `*-aos` ist Auth-/Redirect-Schuld; Migration dort).

| Was | Wo |
| --- | --- |
| Generator (SOT) | `scripts/vos-portal.mjs` · Wrapper `bin/vos-portal` |
| Portal (App-Links) | `portal/index.html` + Spiegel `docs/dev-dashboard.html` |
| Registry | `portal/registry.json` (erzeugt) |
| Status-Overlay | `portal/dev-status.json` (**kuratiert**, nicht erzeugen) |
| Hosting-Kanon | `portal/hosting-targets.json` + `docs/HOSTING-TARGETS.md` |
| Je Repo | `~/dev/<repo>/docs/apps.html` (+ `apps.json`) |
| Live (Pages) | https://nimmsel23.github.io/vitalos/dev-dashboard.html |
| Org-Dashboards | https://vos-dev-dashboards.web.app · Alias https://vitalos-dev.web.app |
| Fuel-Beispiel | https://nimmsel23.github.io/fuel-dev/apps.html |

## Ownership

- **CTO** hält die App-Links aktuell: Tagesrunde `vos-portal --all --check`; bei Drift `vos-portal`. Auth-/Login-/ROT in `portal/dev-status.json` nachziehen.
- **PM** liest Portal + `PRODUCT.md` als Surface-Inventar — keine zweite Apps-Liste.
- **ALs** ändern Hosting-Quellen (`miniapps.json`, `mini-app.json`, `.firebaserc`); Portal-HTML nicht von Hand.

## Tags

- `auth:project-domain` — `*.firebaseapp.com` (OAuth-Handler altbekannt; iOS-Partition-Risiko)
- `auth:same-origin` — Hosting-Site als `authDomain` (braucht GCP redirect URIs)
- `gate:hard` — Login-Mauer, Offline ohne Session tot
- `gate:soft` / `local-first` — App ohne Login nutzbar, Cloud optional
- `rot` — offener Betriebsblocker (Text im Overlay)
