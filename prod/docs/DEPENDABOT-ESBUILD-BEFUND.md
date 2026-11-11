# Dependabot esbuild Security-Update — Befund (Meta-Root)

Stand: 2026-11-11 (AL vitalos, Org `fdd8b7fd`). Kein Merge, kein Lockfile-Touch.
Leser: CTO. Fix bleibt CTO-Linie.

## Symptom

- Dependabot-Jobs `npm_and_yarn in /. for esbuild` rot, u. a. Runs
  `42640916585`, `42643232360` (2026-11-09).
- Updater-Fehler: **`security_update_dependency_not_found`** (nicht
  `misconfigured_tooling`).
- Offene Alerts: **#205** (`package.json`), **#206** (`pnpm-lock.yaml`).
  GHSA-g7r4-m6w7-qqqr, Severity **low**, Windows-only arbitrary file read
  beim Dev-Server. Vulnerable: `>= 0.27.3, < 0.28.1`. Patched: **`0.28.1`**.

## Ursache (belegt)

1. Root `package.json` pinnt `"esbuild": "^0.27.7"` → Semver `>=0.27.7 <0.28.0`.
   Der Security-Patch `0.28.1` liegt **ausserhalb** dieses Carets; Dependabot
   Security-Update findet deshalb keinen aufloesbaren Upgrade-Pfad und bricht
   mit `security_update_dependency_not_found` ab.
2. Workspace traegt **mehrere** esbuild-Major-Minors parallel:
   - `0.27.7` — Root + `fitness-app`
   - `0.28.2` — `6pack-app` + `skills-app` (bereits gepatcht)
   - `0.25.12` — `fuel-app`
   - `0.21.5` — via `prod` / Vite 5
3. `pnpm-workspace.yaml` hat Overrides (u. a. `rolldown`), aber **kein**
   `esbuild`-Override. Dependabot-Config ist seit CTO 2026-11-09 bewusst nur
   noch Root-`/` (Subdir-`/prod`-Jobs waren separat kaputt).

## Empfehlung an CTO (kein Blind-Merge)

1. Root (+ idealerweise `fitness-app`) manuell auf `"esbuild": "^0.28.2"`
   heben **oder** Meta-Override `esbuild: 0.28.2` in `pnpm-workspace.yaml`
   (analog Rolldown-Pin) — dann `pnpm install` / Lockfile sync im Root.
2. Alerts #205/#206 nach Lockfile-Push schliessen lassen; Dependabot-Security
   fuer diese Advisory danach erwarten gruen bzw. irrelevant.
3. Risiko-Kontext: Advisory Windows-only, low. Linux-CI/Prod-Hosting nicht
   betroffen; trotzdem Alert-Hygiene sinnvoll. Kein Auto-PR von Dependabot
   abwarten.

## Nicht getan (Grenzen)

- Kein `package.json`-/Lockfile-Edit, kein Override, kein Push, kein PR.
