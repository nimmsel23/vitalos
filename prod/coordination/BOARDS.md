# Living Boards — Lagezelt-Brücke

Anleitung für Agenten: `~/DASHBOARDS.md`.  
Epic: https://github.com/nimmsel23/vitalos/issues/27

Living Boards sind **keine** Ersatz-STATUS.md. Sie ergänzen die Org-Lage mit area-weiten, selbst-aktualisierenden Kategorien.

Zuletzt generiert: 2026-11-13T14:44:54+00:00

## Boards

| Area | Issue | Repo | Status |
| --- | --- | --- | --- |
| workspace Hub | [#28](https://github.com/nimmsel23/vitalos/issues/28) | `nimmsel23/workspace` | generiert (`boards/workspace.md`) |
| VitalTraining | [#29](https://github.com/nimmsel23/vitalos/issues/29) | `nimmsel23/business-vitaltraining` | generiert (`boards/vitaltrainer.md`) |
| creator | [#30](https://github.com/nimmsel23/vitalos/issues/30) | `nimmsel23/business-creator` | generiert (`boards/creator.md`) |
| business Vault | [#31](https://github.com/nimmsel23/vitalos/issues/31) | `nimmsel23/obsidian-business` | generiert (`boards/business.md`) |
| vitalos Meta | [#32](https://github.com/nimmsel23/vitalos/issues/32) | `nimmsel23/vitalos` | generiert (`boards/vitalos.md`) |
| coach-dev | [#33](https://github.com/nimmsel23/vitalos/issues/33) | `nimmsel23/coach-dev` | generiert (`boards/coach.md`) |

## Generierte Dateien

| Datei | Zweck |
| --- | --- |
| `boards/<id>.md` | Area-Dashboard (Evidence) |
| `ui/gen-boards.py` | Generator |
| `ui/gen-manifest.sh` | Doc-Index fürs Lagezelt |

## Verwandte Oberflächen

| Oberfläche | Zweck |
| --- | --- |
| Lagezelt (`ui/#boards`) | Karten + Docs |
| [Dev-Dashboard](../../docs/DEV-DASHBOARD.md) | Firebase-Hosting-Inventar |
| `~/DASHBOARDS.md` | Bau-Guide |

## Regeln

- Evidence oder „fehlt“ — keine geschätzten KPIs
- Keine Klienten-PII / Secrets
- Refresh: `./ui/gen-boards.py` dann `./ui/gen-manifest.sh`
