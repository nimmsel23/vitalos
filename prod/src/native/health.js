import { Capacitor, registerPlugin } from '@capacitor/core';
import { normalizeHealthProfile, readAndroidProfile } from './healthProfile.mjs';

export const healthPlatform = Capacitor.isNativePlatform() ? Capacitor.getPlatform() : null;
export const healthLabel = healthPlatform === 'ios' ? 'Apple Health' : 'Health Connect';
const HealthProfile = registerPlugin('VitalOSHealthProfile');

export async function readHealthProfile(includeBirthDate) {
  if (healthPlatform === 'ios') {
    return normalizeHealthProfile(await HealthProfile.readProfile({ includeBirthDate }));
  }
  if (healthPlatform === 'android') {
    const { Health } = await import('@capgo/capacitor-health');
    return readAndroidProfile(Health);
  }
  throw new Error('Die Datenübernahme ist nur in der nativen VitalOS-App verfügbar.');
}
