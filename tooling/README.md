# VitalOS Node Tooling (SSOT)

Vorlagen und Scripts für die `*-dev`-Repos und das Meta-Repo.

| Tool | Zweck | Befehl |
| --- | --- | --- |
| `engines.node` | Node ≥22.13 | in jeder `package.json` |
| Biome | Format-Check auf `scripts/` (Lint optional) | `pnpm run tooling:biome` / `tooling:biome:lint` |
| knip | Unbenutzte Deps/Exports (CI: report, non-blocking) | `pnpm run tooling:knip` |
| syncpack | Versions-Drift im Meta-Workspace | `pnpm run tooling:syncpack` (kritische Pins) / `tooling:syncpack:all` |
| Smoke | Mindestens `engines`+`name` | `pnpm test` → `scripts/smoke.test.mjs` wo kein Suite existiert |

Neu anwenden: `node tooling/apply-to-dev.mjs` aus `~/vitalos`.
