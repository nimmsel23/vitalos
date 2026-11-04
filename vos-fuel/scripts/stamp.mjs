// Nach vite build: Service Worker (Cache-Version) und Splash wie fuel-app `stamp:sw`.
// Die Mini-App-Shell und mini-app.json liegen in fuel-app, deshalb dort ausführen.
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../dist-firebase");
const fuel = resolve(here, "../../fuel-app");
for (const cmd of ["sw", "splash"]) {
  execFileSync("node", ["scripts/mini-app-shell/cli.mjs", cmd, out, "--app", "fuel"], { cwd: fuel, stdio: "inherit" });
}
