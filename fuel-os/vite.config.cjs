const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const tailwindcss = require("tailwindcss");
const path = require("path");

const VITALOS = path.resolve(__dirname, "..");
const FUEL = path.resolve(VITALOS, "fuel-app");
const FITNESS = path.resolve(VITALOS, "fitness-app");
const JOURNAL = path.resolve(VITALOS, "journal-app");
const HABITS = path.resolve(VITALOS, "habit-app");
const RELAX = path.resolve(VITALOS, "relax-app");

function resolvePackageEntry(specifier) {
  return require.resolve(specifier, { paths: [FUEL, VITALOS, __dirname] });
}

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appMode = process.env.VITE_APP_MODE || env.VITE_APP_MODE || "client";
  const outDir = appMode === "client" ? "./dist-firebase" : "./dist";

  return {
    root: __dirname,
    base: "/",
    publicDir: path.resolve(__dirname, "public"),
    define: {
      "import.meta.env.VITE_APP_MODE": JSON.stringify(appMode),
    },
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@api": path.resolve(FUEL, appMode === "client" ? "src/client/lib/api.cloud.js" : "src/client/lib/api.local.js"),
        "@db": path.resolve(FUEL, "src/client/lib/db/index.js"),
        "@utils": path.resolve(FUEL, "src/client/lib/db/index.js"),
        "@fuel": path.resolve(FUEL, "src/client"),
        "@fuel-shared": path.resolve(FUEL, "src/shared"),
        "@habits": path.resolve(HABITS, "src"),
        "@habits-db": path.resolve(HABITS, "src/db"),
        "@journal": path.resolve(JOURNAL, "src"),
        "@journal-db": path.resolve(JOURNAL, "src/db/index.js"),
        "@relax": path.resolve(RELAX, "src"),
        "@fitness/constants": path.resolve(FITNESS, "src/constants"),
        "@fitness-db/index.firestore.js": path.resolve(FITNESS, "src/lib/db/index.firestore.js"),
        "@fitness-db/shared/utils.js": path.resolve(FITNESS, "src/lib/db/shared/utils.js"),
        "@fitness-db": path.resolve(FITNESS, "src/lib/db/index.firestore.js"),
        "react/jsx-runtime": resolvePackageEntry("react/jsx-runtime"),
        "react/jsx-dev-runtime": resolvePackageEntry("react/jsx-dev-runtime"),
        "react-dom/client": resolvePackageEntry("react-dom/client"),
        "react-dom": resolvePackageEntry("react-dom"),
        "react": resolvePackageEntry("react"),
        "firebase/app": resolvePackageEntry("firebase/app"),
        "firebase/auth": resolvePackageEntry("firebase/auth"),
        "firebase/firestore": resolvePackageEntry("firebase/firestore"),
        "firebase/functions": resolvePackageEntry("firebase/functions"),
        "firebase/storage": resolvePackageEntry("firebase/storage"),
        "firebase/vertexai": resolvePackageEntry("firebase/vertexai"),
        "firebase/ai": resolvePackageEntry("firebase/ai"),
        "lucide-react": resolvePackageEntry("lucide-react"),
        "@tanstack/react-query": resolvePackageEntry("@tanstack/react-query"),
      },
      dedupe: [
        "react",
        "react-dom",
        "@tanstack/react-query",
        "firebase",
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
        "firebase/functions",
        "firebase/storage",
        "firebase/vertexai",
        "firebase/ai",
      ],
    },
    plugins: [react()],
    css: {
      postcss: {
        plugins: [tailwindcss({ config: path.resolve(__dirname, "tailwind.config.cjs") })],
      },
    },
    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-query": ["@tanstack/react-query"],
            "vendor-firebase": ["firebase/app", "firebase/firestore", "firebase/auth"],
            "vendor-calendar": ["@fullcalendar/react", "@fullcalendar/daygrid", "@fullcalendar/timegrid", "@fullcalendar/interaction"],
            "vendor-charts": ["recharts"],
          },
        },
      },
    },
  };
});
