/** @type {import("syncpack").RcFile} */
// Nur kritische Pins erzwingen — Rest ist Inventar (`pnpm run tooling:syncpack:all`).
module.exports = {
  source: [
    'package.json',
    'prod/package.json',
    'fitness-app/package.json',
    'fuel-app/package.json',
    'journal-app/package.json',
    'habit-app/package.json',
    'learn-app/package.json',
    'plan-app/package.json',
    '6pack-app/package.json',
    'relax-app/package.json',
    'skills-app/package.json',
    'packages/*/package.json',
  ],
  versionGroups: [
    {
      // Exakte 1.12.1 kommt aus pnpm-workspace overrides; in package.json reicht die Range.
      label: 'Firebase util pin (Hoist-Kompatibilität)',
      dependencies: ['@firebase/util'],
      pinVersion: '^1.12.1',
    },
    {
      label: 'Rest vorerst nur beobachten (pnpm run tooling:syncpack:all)',
      dependencies: ['**'],
      isIgnored: true,
    },
  ],
}
