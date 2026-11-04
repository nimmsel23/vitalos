const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");
const path = require("path");
const { existsSync } = require("fs");

// vos-fuel = Wrapper um fuel-app (wie vos-fitness um fitness-app): Views, Hooks und Store kommen per Alias
// aus fuel-app/src/client, hier liegt nur die Hülle (src/).
const VITALOS = path.resolve(__dirname, "..");
const FUEL = existsSync(path.resolve(VITALOS, "fuel-app")) ? path.resolve(VITALOS, "fuel-app") : path.resolve(VITALOS, "fuel-dev");
const pkg = (spec) => require.resolve(spec, { paths: [FUEL, __dirname, VITALOS] });

module.exports = defineConfig(() => ({
  base: "/",
  define: {
    "import.meta.env.VITE_APP_MODE": JSON.stringify("client"),
    "import.meta.env.VITE_SOLO": JSON.stringify(""),
    "import.meta.env.VITE_SOLO_FRONTDOOR": JSON.stringify(""),
  },
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@api": path.resolve(FUEL, "src/client/lib/api.cloud.js"),
      "@fuel": path.resolve(FUEL, "src/client"),
      "react/jsx-runtime": pkg("react/jsx-runtime"),
      "react/jsx-dev-runtime": pkg("react/jsx-dev-runtime"),
      "react-dom/client": pkg("react-dom/client"),
      "react-dom": pkg("react-dom"),
      react: pkg("react"),
      "firebase/app": pkg("firebase/app"),
      "firebase/app-check": pkg("firebase/app-check"),
      "firebase/messaging": pkg("firebase/messaging"),
      "firebase/auth": pkg("firebase/auth"),
      "firebase/firestore": pkg("firebase/firestore"),
      "firebase/functions": pkg("firebase/functions"),
      "firebase/storage": pkg("firebase/storage"),
      "firebase/ai": pkg("firebase/ai"),
      "lucide-react": pkg("lucide-react"),
      "@tanstack/react-query": pkg("@tanstack/react-query"),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-query", "firebase"],
  },
  build: {
    outDir: "./dist-firebase",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-firebase": ["firebase/app", "firebase/firestore", "firebase/auth"],
        },
      },
    },
  },
  server: { host: "127.0.0.1", port: 9150, strictPort: true },
}));
