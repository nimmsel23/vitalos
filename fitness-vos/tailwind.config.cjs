const base = require('../fitness-dev/tailwind.config.cjs')

module.exports = {
  ...base,
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
    '../src/**/*.{js,jsx,ts,tsx}',
    '../fitness-dev/src/**/*.{js,jsx,ts,tsx}',
    '../journal-dev/src/**/*.{js,jsx,ts,tsx}',
    '../habits-dev/src/**/*.{js,jsx,ts,tsx}',
    '../learn-dev/src/**/*.{js,jsx,ts,tsx}',
    '../fuel-dev/src/**/*.{js,jsx,ts,tsx}',
    '../relax-dev/src/**/*.{js,jsx,ts,tsx}',
  ],
}
