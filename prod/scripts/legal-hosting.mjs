import fs from "node:fs";
import path from "node:path";

function matches(source, urlPath) {
  if (source === "**") return true;
  if (source.endsWith("/**")) {
    const prefix = source.slice(0, -3);
    return urlPath === prefix || urlPath.startsWith(`${prefix}/`);
  }
  return urlPath === source;
}

export function findStatic(publicDir, urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/\/$/, "") || "/";
  const relative = clean === "/" ? "" : clean.slice(1);
  const candidates = clean === "/"
    ? ["index.html"]
    : [relative, `${relative}.html`, path.join(relative, "index.html")];
  for (const candidate of candidates) {
    const full = path.join(publicDir, candidate);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return candidate.split(path.sep).join("/");
  }
  return null;
}

/** Firebase Hosting: vorhandene Dateien vor Rewrites. Kein Auth. */
export function resolveHosting(publicDir, rewrites, urlPath) {
  const pathOnly = decodeURIComponent(urlPath.split("?")[0]) || "/";
  const file = findStatic(publicDir, pathOnly);
  if (file) return { status: 200, file, via: "static" };
  for (const rule of rewrites) {
    if (!matches(rule.source, pathOnly)) continue;
    const destination = findStatic(publicDir, rule.destination);
    return {
      status: destination ? 200 : 404,
      file: destination || rule.destination,
      via: rule.source,
    };
  }
  return { status: 404, file: null, via: null };
}
