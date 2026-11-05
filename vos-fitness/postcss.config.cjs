const path = require("path")

// fitness-app (src/styles.css) ist auf Tailwind 4 umgestellt (@import "tailwindcss" + @config). Pulse verarbeitet dieselbe
// Datei, also muss auch hier das Tailwind-4-Plugin laufen — es liegt in fitness-app/node_modules (Workspace-Mitglied),
// nicht im Root (dort liegt für die Shell noch Tailwind 3).
const FITNESS_APP = path.resolve(__dirname, "..", "fitness-app")
const tailwindPostcss = require(require.resolve("@tailwindcss/postcss", { paths: [FITNESS_APP] }))

module.exports = {
  plugins: [tailwindPostcss(), require("autoprefixer")],
}
