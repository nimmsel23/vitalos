# Repository Guidelines

## Project Structure & Module Organization

`fitness-vos` is a Vite/React wrapper for the VitalOS fitness Firebase surface.
Local source lives in `src/`: `App.jsx` owns the shell, `main.jsx` wires React
providers, `NavigationItems.js` overrides the imported fitness navigation, and
`styles.css` contains VOS-local CSS. Most runtime UI is imported from sibling
VitalOS modules through aliases in `vite.config.cjs`, especially
`../fitness-app/src`. Static assets and PWA files live in `public/`; production
Firebase output is `dist-firebase/`. Do not edit generated `dist*` files by
hand.

## Build, Test, and Development Commands

- `npm run dev` starts the Vite dev server.
- `npm run build` creates the cloud/Firebase build in `dist-firebase`.
- `npm run build:cloud` is a compatibility alias for `npm run build`.
- `npm run deploy` deploys the existing `dist-firebase` build only.
- `npm run deploy:cloud` is a compatibility alias for `npm run deploy`.
- `npm run firebase` runs build plus deploy.

This repository is cloud-only; keep `build` as the primary production build
command. The Firebase site is configured in `firebase.json` as `fitness-vos`
under project `fitness-aos`.

## Coding Style & Naming Conventions

Use React function components, ES modules, two-space indentation, and concise
JSX. Prefer existing Tailwind utility patterns and theme variables such as
`fit-bg`, `fit-card`, `fit-line`, and `fit-accent`. Keep aliases in
`vite.config.cjs` and Tailwind content paths aligned whenever importing from
sibling modules, otherwise responsive classes can be purged from the build.

## Testing Guidelines

There is no dedicated test runner in this package. Validate changes with
`npm run build`; for deployment-script changes, also run `npm run deploy` after
a successful build. When touching layout, verify mobile behavior because the app
depends on responsive classes generated from sibling source files.

## Commit & Pull Request Guidelines

History uses short imperative messages, for example `Fix fitness VOS mobile
build styles` and `Normalize fitness VOS Firebase scripts`. Keep commits scoped
to the changed surface. PRs should describe the user-visible effect, list the
commands run, and include screenshots for UI/layout changes.

## Agent-Specific Instructions

Follow the parent VitalOS rule: commit every working intermediate or final state
without asking. Do not push the VitalOS meta-repo unless explicitly requested.
