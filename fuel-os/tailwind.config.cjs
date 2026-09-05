const path = require("path");

const FUEL_APP = path.resolve(__dirname, "../fuel-app");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    `${FUEL_APP}/src/client/**/*.{js,jsx}`,
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 60px rgba(249, 115, 22, 0.16)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
