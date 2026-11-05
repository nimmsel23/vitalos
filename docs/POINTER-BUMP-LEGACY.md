# Pointer-Bump fuel-app / fitness-app (Legacy-Ablauf, Stand 2026-10-17)

Aus `CLAUDE.md` ausgelagert. Maßgeblich ist `docs/DEPLOYMENT.md` (dev → master per PR, dann `vos-release`); dieser Text bleibt als Hintergrund zu detached HEAD, Teil-Repos und Pointern.

### Pointer-Bump fuel-app / fitness-app: Schritt für Schritt (Stand 2026-10-17, aus einem Durchlauf mit Stolpersteinen)

> **Überholt seit 2026-10-29:** Der Weg ist jetzt `dev` → `master` (PR, `vos-release-pr`) → `vitalos` (`vos-release`, mergt `origin/master`, nicht mehr `origin/dev`). Schritt 4 unten (`merge origin/dev`) und die Aufzählung der nested Repos stammen aus dem alten Ablauf; maßgeblich ist `docs/DEPLOYMENT.md`. Die Stolpersteine zu detached HEAD und Pointern bleiben als Hintergrund nützlich.

Die Arbeit passiert in `~/fuel-dev` / `~/fitness-dev` (Branch `dev`). Die Submodule
`fuel-app` / `fitness-app` tracken den Branch **`vitalos`**, der per Merge aus
`origin/dev` entsteht (Commit-Text `Merge origin/dev into vitalos`). Reihenfolge — von
innen nach außen, jede Stufe erst pushen, wenn die darunter auf `origin` liegt:

1. **Geschachtelte Teil-Repos zuerst** (nur fitness-dev): `coach/` (→ `coach-dev`, Branch `master`),
   `plan/` (→ `plan-dev`, Branch `master`), `plan/coach-dev/` (→ `coach-dev`, Branch `dev`).
   Dort committen, **auf einen echten Branch**, pushen.
   - `plan/coach-dev` steht oft im **Detached HEAD**. Ein Commit dort hängt dann in der Luft
     und `origin/dev` ist meist weit voraus (Non-Fast-Forward). Richtig:
     `git checkout -b <name> origin/dev && git cherry-pick <commit> && git push origin <name>:dev`.
   - Danach in `plan/`: `git add coach-dev && git commit` → `git push origin master`;
     `coach/`: `git push origin master`.
2. **fitness-dev**: Pointer `plan`/`coach` committen (`git add plan coach`), `git push origin dev`.
   Der Pre-Commit-Hook baut (`dist/`, `dist-versions/`), der Push deployt Staging
   (`fitness-preview.service` :8100) — das ist erwartet, kein Prod.
3. **fuel-dev**: `git push origin dev` (Staging nach `~/.local/fuel`, kein laufender Service).
4. **Submodul-Branches `vitalos`**:
   - `cd ~/vitalos/fitness-app && git fetch origin && git merge --no-edit origin/dev`
     (analog `fuel-app`). Ohne vorheriges Push von `dev` gibt es nichts zu mergen —
     vorher nur lokal testen: `git fetch ~/fitness-dev dev && git merge FETCH_HEAD`.
   - **Nur fitness-app:** danach stehen `coach`, `plan` und `plan/coach-dev` als
     „modified“, weil die Arbeitskopien noch auf dem alten Commit sind. Je Teil-Repo:
     `want=$(git ls-tree HEAD <sub> | awk '{print $3}'); git -C <sub> fetch origin; git -C <sub> checkout $want`
     (für `plan/coach-dev` mit `git -C plan ls-tree HEAD coach-dev`).
   - `git push origin vitalos` (in jedem Submodul).
5. **Meta-Repo** `~/vitalos`: `git add fitness-app fuel-app && git commit` →
   `git push origin master`. Der Push löst `Deploy Fitness PWA` / `Deploy Fuel PWA` /
   `Deploy VitalOS Shell` aus (nur Hosting; Status: `gh run list --limit 5`).
   `push.recurseSubmodules=on-demand` pusht referenzierte Submodule-Commits zwar mit,
   fängt aber **nicht** die Teil-Repos aus Schritt 1 ab — die vorab selbst pushen.

Stolpersteine:
- Die vier Mini-App-Submodule `vos-fuel-{log,supplements,mikros,protokoll}-app` zeigen auf
  denselben Fuel-Commit, werden aber **bewusst nicht** mitgebumpt (stabile Fallbacks, nur
  manuell deployen).
- `git push origin dev` in fuel-dev/fitness-dev veröffentlicht **alle** dort noch ungepushten
  Commits, nicht nur die eigenen — vorher `git log origin/dev..dev` ansehen.
- Vor dem Pointer-Commit beide vitalos-Builds probieren, ohne `dist/` zu überschreiben:
  `npx vite build --mode firebase --outDir <scratch> --emptyOutDir` und ohne `--mode`.
- Firestore-Rules brauchen für neue Unterpfade unter `users/{uid}/**` keinen Deploy
  (`match /users/{uid}/{document=**}` deckt sie ab); Rules weiterhin nur aus `~/vitalos`.
- Gemeinsame Namen in den `export *`-Barrels (`shell/db/index.js` zieht fuel + fitness mit):
  neue Exporte in `shell/db/settings.js` eindeutig benennen (`registerShellDevice` statt
  `registerDevice`), sonst werden sie als mehrdeutig verworfen. Neue `@db`-Funktionen, die
  Views aus `fitness-app` importieren, brauchen auch einen Stub in `src/coach/db.js`
  (lokaler Build).
