const path = require("path")
const fs = require("fs")

// fitness-vos rendert Komponenten direkt aus den VitalOS-Submodules. Tailwind
// muss diese Quellen scannen, sonst fehlen mobile/responsive Utility-Klassen im
// Build, obwohl Vite die Komponenten korrekt importiert.
function siblingGlob(devName, appName) {
  const appPath = path.resolve(__dirname, "..", appName)
  const dir = fs.existsSync(appPath) ? appPath : path.resolve(__dirname, "..", devName)
  return `${dir}/src/**/*.{js,jsx,ts,tsx}`
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    siblingGlob("fitness-dev", "fitness-app"),
    siblingGlob("journal-dev", "journal-app"),
    siblingGlob("habits-dev", "habit-app"),
    path.resolve(__dirname, "..", "learn-dev", "src", "**", "*.{js,jsx,ts,tsx}"),
    "../src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'lg:flex',
    'lg:hidden',
    'lg:ml-[280px]',
    'justify-around',
    'flex-col',
  ],
  theme: {
    extend: {
      colors: {
        fit: {
          bg:    'var(--bg)',
          bg2:   'var(--bg2)',
          card:  'var(--card)',
          cardh: 'var(--card-hover)',
          line:  'var(--line)',
          ink:   'var(--ink)',
          muted: 'var(--muted)',
          dim:   'var(--dim)',
          accent:'var(--accent)',
          green: 'var(--green)',
          red:   'var(--red)',
          orange:'var(--orange)',
          scrim: 'var(--scrim)',
          selected: 'var(--surface-selected)',
          accentSubtle: 'var(--accent-subtle)',
          accentSubtleHover: 'var(--accent-subtle-hover)',
          accentBorder: 'var(--accent-border)',
        },
        forge: {
          bg:     'var(--card)',
          panel:  'var(--bg2)',
          border: 'var(--line)',
          ink:    'var(--ink)',
          muted:  'var(--muted)',
          accent: 'var(--accent)',
          red:    'var(--red)',
          green:  'var(--green)',
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
