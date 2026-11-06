# Functions sources after backend consolidation

Hosting stays in Fitness and Journal. Their Node Functions packages are owned by the shared backend repository (`nimmsel23/fitness-backend`, local checkout `~/dev/backend`).

The manual `Deploy app push functions` workflow checks out the exact commit recorded in `.github/backend-functions.json`. `firebase.push.json` reads Fitness and Journal packages from `backend/functions/<app>`; the independent VitalOS codebase still uses `functions/`. Codebase names, exported function names, regions and project remain unchanged. The existing isolation check uses these same deployment paths.

The backend commit must be published before this pin is published or updated. The existing `GH_SUBMODULE_TOKEN` needs read access to the private backend repository, just as it already does for the private app sources. Journal's existing Firebase parameter file is staged from the pinned Journal checkout without logging or committing its contents. Firebase secrets stay in the existing Firebase project.

Fitness/Journal packages use `npm install --package-lock=false --workspaces=false` because backend lockfile work was explicitly deferred by the user; VitalOS keeps its existing `npm ci` contract. No backend tests, secret changes or live deployment were executed while preparing this wiring. The workflow remains manually dispatched; a source push does not deploy Functions. `verify_only=true` validates the service account, private checkout permission, exact source pin and selected deployment package paths without installing dependencies, loading backend code or publishing anything.

The broader `dev-product` meta-repo restructuring is separate. This patch changes only the Functions deployment inputs and retains the existing three Firebase codebases.
