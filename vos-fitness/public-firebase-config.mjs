// fitness-app/src/firebase.js importiert ../firebase.config.js relativ.
// Im Submodul ist das eine leere Platzhalterdatei; die CI von fitness-dev
// überschreibt sie aus dem Secret FIREBASE_CONFIG. Der vos-fitness-Build tut
// das nicht und der Alias @firebase-config greift bei relativen Imports nicht.
// Dadurch landete apiKey:"" im Bundle von fitness-vos.web.app.
import path from "node:path";

export function publicFirebaseConfigRedirect({ fitnessRoot, publicConfig }) {
  const placeholder = path.resolve(fitnessRoot, "firebase.config.js");
  const target = path.resolve(publicConfig);
  return {
    name: "vos-fitness-public-firebase-config",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !source.startsWith(".")) return null;
      const base = path.resolve(path.dirname(importer.split("?")[0]), source.split("?")[0]);
      if (base === placeholder || `${base}.js` === placeholder) return target;
      return null;
    },
  };
}
