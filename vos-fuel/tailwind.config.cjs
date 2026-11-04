const path = require("path");
const fs = require("fs");
// vos-fuel rendert Views aus fuel-app (Alias @fuel) — Tailwind muss deren Quellen scannen,
// sonst fehlen Utility-Klassen im Build (gleiche Regel wie bei vos-fitness).
const FUEL = fs.existsSync(path.resolve(__dirname, "../fuel-app")) ? "../fuel-app" : "../fuel-dev";
const base = require(path.resolve(__dirname, FUEL, "tailwind.config.cjs"));
module.exports = {
  ...base,
  content: ["./index.html", "./src/**/*.{js,jsx}", path.resolve(__dirname, FUEL, "src/**/*.{js,jsx}")],
};
