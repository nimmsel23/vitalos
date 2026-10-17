// Baut eine oder alle Fuel-Mini-Apps aus ../fuel-app und stempelt sie als eigene PWA.
// Aufruf: node scripts/build.mjs [log|supplements|micros|report]   (ohne Argument: alle vier)
//  1. vite build  (cwd = fuel-app, Config = ./vite.config.cjs → Output ./dist-<app>/)
//  2. mini-app-shell sw + stamp (Cache-Version, Icons, Manifest, Splash) — Konfiguration mini-app.json in fuel-app
//  3. Aufräumen — Icon-Links auf App-Icons, Haupt-App-Icons und *.bak raus (wie fuel-app/scripts/stamp-solo.mjs)
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fuel = resolve(here, "..", "fuel-app");
const all = ["log", "supplements", "micros", "report"];
const apps = process.argv[2] ? [process.argv[2]] : all;

for (const app of apps) {
  if (!all.includes(app)) { console.error(`Unbekannte App "${app}" — erlaubt: ${all.join("|")}`); process.exit(1); }
  const out = resolve(here, `dist-${app}`);
  console.log(`\n▶ ${app}`);
  execFileSync("pnpm", ["exec", "vite", "build", "--config", resolve(here, "vite.config.cjs")], {
    cwd: fuel, stdio: "inherit", env: { ...process.env, VITE_APP_MODE: "client", VITE_SOLO: app },
  });
  if (!existsSync(resolve(out, "index.html"))) { console.error(`❌ ${out}/index.html fehlt`); process.exit(1); }

  const cli = (...a) => execFileSync("node", ["scripts/mini-app-shell/cli.mjs", ...a], { cwd: fuel, stdio: "inherit" });
  cli("sw", out, "--app", "fuel");
  cli("stamp", out, "--app", app);

  const htmlPath = resolve(out, "index.html");
  const html = readFileSync(htmlPath, "utf8")
    .replace(/\s*<link rel="icon" href="\/favicon\.ico"[^>]*\/>/, "")
    .replace(/<link rel="icon" type="image\/svg\+xml" href="[^"]*" \/>/, '<link rel="icon" type="image/svg+xml" href="./favicon.svg" />')
    .replace(/<link rel="icon" type="image\/png" sizes="192x192" href="[^"]*" \/>/, '<link rel="icon" type="image/png" sizes="192x192" href="./icon-192.png" />');
  writeFileSync(htmlPath, html);
  for (const f of readdirSync(out)) if (/\.bak/.test(f) || f === "favicon.ico") rmSync(resolve(out, f), { force: true });
  rmSync(resolve(out, "icons"), { recursive: true, force: true });
  console.log(`🧹 dist-${app} fertig`);
}
