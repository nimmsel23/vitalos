# VitalOS · Prod Living Dashboard

App-Release- und Observe/Operate-Lage für **`vitalos/prod`** (nicht Shell).

- Live: https://nimmsel23.github.io/vitalos/
- Quelle: dieses Verzeichnis (`prod/dashboard/`)
- Build → `docs/index.html` + `docs/assets/` (Pages über `pages-docs.yml`)
- Früher: `Vitaltrainer/website/vitalos-dashboard/` (Publisher abgelöst)

## Lokal

Node ≥ 22:

```sh
cd prod/dashboard
npm ci
npm run dev    # http://127.0.0.1:5173
npm run build  # → dist/
```

## Veröffentlichung

Push auf `master`, der `prod/dashboard/**` ändert, startet
`.github/workflows/prod-dashboard-pages.yml`: bauen → Vite-Ausgabe nach `docs/`
committen → `pages-docs.yml` deployt Pages.

Manuell: Actions → „Prod Living Dashboard → Pages“.

## Inhalt

Ampel/Stand zu Observe/Operate, Play/Release-Gates, Roadmap und Wochenlage.
Detailnachweise bleiben auf Dev-Boards, CPO/CTO und Linear — hier verdichten
und verlinken, nicht abschreiben. Shell-Pins gehören nicht hierher
(siehe `prod/coordination/boards/vitalos.md` / Living Boards #32).
