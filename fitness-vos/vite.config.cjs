const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const path = require("path");

const VITALOS = path.resolve(__dirname, "..");
const FITNESS = path.resolve(VITALOS, "fitness-dev");
const FUEL = path.resolve(VITALOS, "fuel-dev");
const JOURNAL = path.resolve(VITALOS, "journal-dev");
const HABITS = path.resolve(VITALOS, "habits-dev");
const LEARN = path.resolve(VITALOS, "learn-dev");
const RELAX = path.resolve(VITALOS, "relax-dev");

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appMode = process.env.VITE_APP_MODE || env.VITE_APP_MODE || "client";
  const outDir = appMode === "client" ? "./dist-firebase" : "./dist";

  return {
    base: "/",
    define: {
      "import.meta.env.VITE_APP_MODE": JSON.stringify(appMode),
    },
    plugins: [
      react(),
      {
        name: 'override-nav-items',
        enforce: 'pre',
        resolveId(source, importer) {
          if (source.includes('constants/NavigationItems')) {
            return path.resolve(__dirname, 'src/NavigationItems.js');
          }
          return null;
        }
      }
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@src": path.resolve(VITALOS, "src"),
        "@shell": path.resolve(VITALOS, "src/shell"),
        "@coach": path.resolve(VITALOS, "src/coach"),
        "@cloud": path.resolve(VITALOS, "src/cloud"),
        "@components": path.resolve(FITNESS, "src/components"),
        "@lib": path.resolve(FITNESS, "src/lib"),
        "@constants": path.resolve(FITNESS, "src/constants"),
        "@utils": path.resolve(FITNESS, "src/lib/utils.js"),
        "@db": path.resolve(VITALOS, "src/shell/db/index.js"),
        "@fitness-db": path.resolve(FITNESS, "src/lib/db"),
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
        "@view/settings": path.resolve(VITALOS, "src/shell/Settings"),
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
