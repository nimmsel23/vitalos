const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const path = require("path");
const { existsSync } = require("fs");

const VITALOS = path.resolve(__dirname, "..");
const FITNESS = path.resolve(VITALOS, "fitness-app");
const FUEL = path.resolve(VITALOS, "fuel-app");
const JOURNAL = path.resolve(VITALOS, "journal-app");
const HABITS = path.resolve(VITALOS, "habit-app");
const LEARN = path.resolve(VITALOS, "learn-app");
const RELAX = path.resolve(VITALOS, "relax-app");

// Plan kommt aus dem Submodul fitness-app/plan; die Kopie fitness-app/src/views/Plan ist nur Fallback.
// Relative Imports der Fitness-DB-Schicht (z. B. planVersions.js) fehlen dort → auf das Submodul auflösen
// (gleiche Regel wie in ~/vitalos/vite.config.js).
const PLAN_COPY = path.resolve(FITNESS, "src/views/Plan");
const PLAN_SUB = path.resolve(FITNESS, "plan/src/views/Plan");
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
  const { vosChangelog } = await import('../packages/mini-app-shell/vos-changelog-vite.mjs');
  const env = loadEnv(mode, process.cwd(), "");
  const appMode = process.env.VITE_APP_MODE || env.VITE_APP_MODE || "client";
  const outDir = appMode === "client" ? "./dist-firebase" : "./dist";

  return {
    base: "/",
    define: {
      "import.meta.env.VITE_APP_MODE": JSON.stringify(appMode),
    },
    plugins: [
      planSubmoduleFallback(),
      vosChangelog({ appId: 'vos-fitness', appName: 'VOS Fitness', accent: '#60a5fa', releaseRoot: FITNESS }),
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
        
        "@firebase-config": path.resolve(VITALOS, "firebase.config.js"),
        
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
