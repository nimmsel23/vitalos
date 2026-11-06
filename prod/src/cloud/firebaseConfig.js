const LEGACY_PROJECT_ID = "fitness-aos";

export function parseVitalOSProductFirebaseConfig({ webConfigJson = "", expectedProjectId = "", vapidKey = "" }) {
  if (typeof webConfigJson !== "string" || !webConfigJson.trim()) {
    throw new Error("VitalOS product build requires VITE_VOS_FIREBASE_WEB_CONFIG");
  }
  let config;
  try {
    config = JSON.parse(webConfigJson);
  } catch {
    throw new Error("VITE_VOS_FIREBASE_WEB_CONFIG must be valid JSON");
  }

  for (const key of ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]) {
    if (typeof config?.[key] !== "string" || !config[key].trim()) {
      throw new Error(`VitalOS product Firebase config is missing ${key}`);
    }
  }
  if (!expectedProjectId || config.projectId !== expectedProjectId) {
    throw new Error("VitalOS Firebase web config projectId does not match VOS_FIREBASE_PROJECT_ID");
  }
  if (config.projectId === LEGACY_PROJECT_ID
      || config.authDomain.includes(LEGACY_PROJECT_ID)
      || config.storageBucket.includes(LEGACY_PROJECT_ID)) {
    throw new Error("VitalOS product builds cannot use the private fitness-aos Firebase project");
  }
  if (typeof vapidKey !== "string" || !vapidKey.trim()) {
    throw new Error("VitalOS product build requires its own VITE_VOS_FIREBASE_VAPID_KEY");
  }
  return { config, vapidKey };
}
