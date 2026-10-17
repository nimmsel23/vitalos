// Wrapper-Config der Fuel-Mini-Apps: nutzt die Vite-Config von ../fuel-app unverändert
// (Aliase, Plugins, VITE_SOLO-Logik) und biegt nur root + outDir um, damit der Build-Output
// hier im Wrapper liegt (dist-<app>/) und nicht im fuel-app-Checkout.
const path = require("path");

const FUEL = path.resolve(__dirname, "..", "fuel-app");
const base = require(path.join(FUEL, "vite.config.cjs"));

module.exports = async (env) => {
  const cfg = typeof base === "function" ? await base(env) : base;
  const solo = process.env.VITE_SOLO || "";
  if (!solo) throw new Error("[vos-fuel-mini] VITE_SOLO fehlt (log|supplements|micros|report)");
  return {
    ...cfg,
    root: FUEL,
    build: { ...cfg.build, outDir: path.resolve(__dirname, `dist-${solo}`), emptyOutDir: true },
  };
};
