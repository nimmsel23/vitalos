import { useState } from 'react';
import { healthPlatform } from '../native/health.js';
import HealthProfileImport from './Settings/HealthProfileImport.jsx';

// Per account and installation; declining never opens an OS permission dialog.
export default function HealthOnboarding({ user }) {
  const key = `vitalos-health-onboarding-v1:${user.uid}`;
  const [done, setDone] = useState(() => { try { return localStorage.getItem(key) === 'done'; } catch { return false; } });
  if (!healthPlatform || done) return null;
  return <aside className="mx-auto my-4 w-full max-w-xl px-4 pt-[env(safe-area-inset-top)]">
    <HealthProfileImport user={user} onboarding onDone={() => {
      try { localStorage.setItem(key, 'done'); } catch { /* session dismissal still works */ }
      setDone(true);
    }} />
  </aside>;
}
