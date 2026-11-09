# VitalOS Node Tooling (SSOT)

Vorlagen und Scripts für die **aktiven** `*-dev`-Repos und das Meta-Repo.

**Nicht:** `habits-dev` / `learn-dev` (Owner-Freeze 2026-11-07). Habits → `journal-dev` (`apps/habits`), Learn → `fitness-dev`. `habit-app` / `learn-app` in vitalos sind nur noch stale Pins.

| Tool | Zweck | Befehl |
| --- | --- | --- |
| `engines.node` | Node ≥22.13 | in jeder `package.json` |
| Biome | Format-Check auf `scripts/` (Lint optional) | `pnpm run tooling:biome` / `tooling:biome:lint` |
| knip | Unbenutzte Deps/Exports (CI: report, non-blocking) | `pnpm run tooling:knip` |
| syncpack | Versions-Drift im Meta-Workspace | `pnpm run tooling:syncpack` (kritische Pins) / `tooling:syncpack:all` |
| Smoke | Mindestens `engines`+`name` | `pnpm test` → `scripts/smoke.test.mjs` wo kein Suite existiert |

Neu anwenden: `node tooling/apply-to-dev.mjs` aus `~/vitalos`.
