// Each product uses its own Firebase Hosting domain for redirect sign-in.
export function productConfigForHost(json, host) {
  if (!['vitalos-prod.web.app', 'vitalos-fitness-prod.web.app'].includes(host)) throw new Error('Unknown VitalOS product hosting domain');
  let config;
  try { config = JSON.parse(json); } catch { throw new Error('VITE_VOS_FIREBASE_WEB_CONFIG must be valid JSON'); }
  if (!config || config.projectId !== 'vitalos-prod') throw new Error('Expected Firebase project vitalos-prod');
  return JSON.stringify({ ...config, authDomain: host });
}
