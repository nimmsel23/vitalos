const FIREBASE_AI = 'firebasevertexai.googleapis.com';
const GEMINI = 'generativelanguage.googleapis.com';

// Key metadata only: never fetch or print key strings. This is a conservative
// deployment gate, not proof that a server key has never been disclosed.
export function checkProductAiAccess({ enabledServices, keys, approvedServerKeyId = '' }) {
  if (!Array.isArray(enabledServices) || !Array.isArray(keys) || !keys.length) throw new Error('API-Status oder Schlüsselmetadaten fehlen.');
  if (enabledServices.includes(FIREBASE_AI)) throw new Error('Firebase AI Logic ist aktiviert und umgeht die Smart-Log-Kontingentprüfung.');
  for (const key of keys) {
    const id = String(key.name || '').split('/').pop();
    const restrictions = key.restrictions || {};
    const targets = restrictions.apiTargets;
    if (!id || !Array.isArray(targets) || !targets.length) throw new Error('Ein API-Schlüssel hat keine API-Einschränkung.');
    if (!targets.some(target => target.service === GEMINI)) continue;
    const distributed = restrictions.browserKeyRestrictions || restrictions.androidKeyRestrictions || restrictions.iosKeyRestrictions
      || /auto created by firebase/i.test(key.displayName || '');
    if (distributed || !approvedServerKeyId || id !== approvedServerKeyId) {
      throw new Error('Ein nicht als dedizierter Serverschlüssel freigegebener Schlüssel erlaubt die Generative Language API.');
    }
  }
}
