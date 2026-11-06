const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const path = require("path");
const { existsSync } = require("fs");

const VITALOS = path.resolve(__dirname, "..");
const APP_ROOT = path.resolve(VITALOS, "..");
const FITNESS = path.resolve(APP_ROOT, "fitness-app");
const FUEL = path.resolve(APP_ROOT, "fuel-app");
const JOURNAL = path.resolve(APP_ROOT, "journal-app");
const HABITS = path.resolve(APP_ROOT, "habit-app");
const LEARN = path.resolve(APP_ROOT, "learn-app");
const RELAX = path.resolve(APP_ROOT, "relax-app");

// Plan kommt aus dem Submodul plan-app; die Kopie fitness-app/src/views/Plan ist nur Fallback.
// Relative Imports der Fitness-DB-Schicht (z. B. planVersions.js) fehlen dort → auf das Submodul auflösen
// (gleiche Regel wie in ~/vitalos/vite.config.js).
const PLAN_COPY = path.resolve(FITNESS, "src/views/Plan");
const PLAN_SUB = path.resolve(APP_ROOT, "plan-app/src/views/Plan");
const planSubmoduleFallback = () => ({
  name: "vos-fitness-plan-submodule-fallback",
  enforce: "pre",
  resolveId(source, importer) {
    if (!importer || importer.startsWith("\0") || !source.startsWith(".")) return null;
    const target = path.resolve(path.dirname(importer.split("?")[0]), source.split("?")[0]);
    const rel = path.relative(PLAN_COPY, target);
    if (rel.startsWith("..") || path.isAbsolute(rel) || existsSync(target)) return null;
    const sub = path.resolve(PLAN_SUB, rel);
    return existsSync(sub) ? sub : null;
  },
});

module.exports = defineConfig(async ({ mode }) => {
  if (process.env.VITE_VOS_PRODUCT_BUILD !== '1') throw new Error('Use the explicit VitalOS product build commands');
  const { vosChangelog } = await import('../packages/mini-app-shell/vos-changelog-vite.mjs');
  const { miniAppSubmodulePlugin } = await import('../../fitness-app/vite-miniapp-submodules.mjs');
  const env = loadEnv(mode, process.cwd(), "");
  const appMode = process.env.VITE_APP_MODE || env.VITE_APP_MODE || "client";
  const outDir = appMode === "client" ? "./dist-firebase" : "./dist";
  const isProduct = process.env.VITE_VOS_PRODUCT_BUILD === "1";
  const productConfig = path.resolve(VITALOS, ".product-config/firebase.config.js");
  if (isProduct && !existsSync(productConfig)) {
    throw new Error("Prepare the isolated product Firebase configuration before building Fitness-VOS");
  }
  const firebaseConfigs = new Set([
    path.resolve(VITALOS, "firebase.config.js"),
    path.resolve(FITNESS, "firebase.config.js"),
    path.resolve(FUEL, "src/client/lib/firebase.config.js"),
    path.resolve(JOURNAL, "src/lib/firebase.config.js"),
    path.resolve(HABITS, "src/lib/firebase.config.js"),
    path.resolve(RELAX, "firebase.config.js"),
    path.resolve(APP_ROOT, "plan-app/firebase.config.js"),
    path.resolve(APP_ROOT, "skills-app/firebase.config.js"),
  ]);
  const productFirebaseConfig = {
    name: "vos-fitness:product-firebase-config",
    enforce: "pre",
    resolveId(source, importer) {
      if (!isProduct || !importer || !source.startsWith(".")) return null;
      const resolved = path.resolve(path.dirname(importer.split("?")[0]), source);
      return firebaseConfigs.has(resolved) || firebaseConfigs.has(`${resolved}.js`) ? productConfig : null;
    },
  };

  return {
    base: "/",
    define: {
      "import.meta.env.VITE_APP_MODE": JSON.stringify(appMode),
    },
    plugins: [
      productFirebaseConfig,
      planSubmoduleFallback(),
      miniAppSubmodulePlugin(FITNESS),
      vosChangelog({ appId: 'vos-fitness', appName: 'VOS Fitness', accent: '#60a5fa', releaseRoot: FITNESS, showRelease: !isProduct }),
      react()
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@src": path.resolve(VITALOS, "src"),
        "@shell": path.resolve(VITALOS, "src/shell"),
        "@coach": path.resolve(VITALOS, "src/coach"),
        // wie in fitness-app/vite.config.js: dessen firebase.js exportiert
        // functionsInstance/httpsCallable (Push), die Shell-Variante nicht.
        "@cloud/firebase.js": path.resolve(FITNESS, "src/firebase.js"),
        "@cloud": path.resolve(VITALOS, "src/cloud"),
        "@components": path.resolve(FITNESS, "src/components"),
        "@lib": path.resolve(FITNESS, "src/lib"),
        "@constants": path.resolve(FITNESS, "src/constants"),
        "@utils": path.resolve(FITNESS, "src/lib/utils.js"),
        "@db": path.resolve(FITNESS, "src/lib/db/index.firestore.js"),
        "@fitness-db": path.resolve(FITNESS, "src/lib/db"),
        "@relax-db": path.resolve(RELAX, "src/lib/db"),
        "@habits": path.resolve(HABITS, "src"),
        "@journal": path.resolve(JOURNAL, "src"),
        "@learn": path.resolve(LEARN, "src"),
        "@relax": path.resolve(RELAX, "src"),
        "@fitness/components": path.resolve(FITNESS, "src/components"),
        "@fitness/constants": path.resolve(FITNESS, "src/constants"),
        "@fitness/views": path.resolve(FITNESS, "src/views"),
        "@fitness/contexts": path.resolve(FITNESS, "src/contexts"),
        "@fitness/hooks": path.resolve(FITNESS, "src/hooks"),
        "@fitness/lib": path.resolve(FITNESS, "src/lib"),
        "@fitness": FITNESS,
        
        "@view/dashboard": path.resolve(VITALOS, "src/fitness/dashboard/Dashboard.jsx"),
        "@view/session": path.resolve(FITNESS, "src/views/Session"),
        "@view/review": path.resolve(FITNESS, "src/views/WeeklyReview"),
        "@view/muscles": path.resolve(FITNESS, "src/views/Muscles"),
        "@view/learn": path.resolve(LEARN, "src/views/Learn"),
        "@view/journal": path.resolve(JOURNAL, "src/views/JournalVosView.jsx"),
        "@view/habits": path.resolve(HABITS, "src/views/Habits"),
        "@view/settings": path.resolve(FITNESS, "src/views/Settings"),
        "@view/plan": path.resolve(FITNESS, "src/views/Plan"),
        "@view/coach": path.resolve(FITNESS, "src/views/Coach"),
        
        "@firebase-config": isProduct ? productConfig : path.resolve(VITALOS, "firebase.config.js"),
        
        "fuel/FuelApp": path.resolve(VITALOS, "src/shell/FuelApp.jsx"),
        "@fuel": path.resolve(FUEL, "src/client"),
        "@fuel-shared": path.resolve(FUEL, "src/shared"),
        "@api": path.resolve(FUEL, "src/client/lib/api.js")
      },
      dedupe: ["react", "react-dom", "@tanstack/react-query"],
    },
    build: {
      outDir,
      emptyOutDir: true,
    },
  };
});
