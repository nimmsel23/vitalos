const base = require('./fitness-app/tailwind.config.cjs')

module.exports = {
  ...base,
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
    './fitness-app/src/**/*.{js,jsx,ts,tsx}',
    './journal-app/src/**/*.{js,jsx,ts,tsx}',
    './habit-app/src/**/*.{js,jsx,ts,tsx}',
    './learn-dev/src/**/*.{js,jsx,ts,tsx}',
    './fuel-app/src/**/*.{js,jsx,ts,tsx}',
    './relax-app/src/**/*.{js,jsx,ts,tsx}',
  ],
}
