import { useEffect, useRef, useState } from 'react';
import { healthPlatform, healthLabel, readHealthProfile } from '../../native/health.js';
import { updateUserProfile } from '@db';
import { useShellSettings } from '../store.js';
import LegalLinks from '../LegalLinks.jsx';

export default function HealthProfileImport({ user, onboarding = false, onDone = () => {} }) {
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const [includeBirthDate, setIncludeBirthDate] = useState(false);
  const [message, setMessage] = useState('');
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  if (!healthPlatform || !user?.uid) return null;

  async function read() {
    setBusy(true);
    setMessage('');
    setDraft(null);
    try {
      const result = await readHealthProfile(includeBirthDate);
      if (!active.current) return;
      if (Object.keys(result.profile).length) setDraft(result);
      else setMessage('Keine passenden Daten verfügbar oder freigegeben. Du kannst dein Profil manuell ausfüllen.');
      if (result.failed?.length) setMessage(`${result.failed.join(' und ')} konnte nicht gelesen werden. Versuche es erneut oder ergänze die Angaben manuell.`);
      else if (result.historyLimited) setMessage('Health Connect gibt hier nur die letzten 30 Tage frei. Ältere Angaben bitte manuell ergänzen.');
    } catch {
      if (active.current) setMessage(`${healthLabel} konnte nicht gelesen werden. Prüfe Verfügbarkeit und Freigaben in den Geräteeinstellungen oder gib deine Daten manuell ein.`);
    } finally { if (active.current) setBusy(false); }
  }

  async function save() {
    setBusy(true);
    setMessage('');
    const success = await updateUserProfile(user.uid, {
      ...draft.profile,
      healthProfileImport: { source: healthPlatform === 'ios' ? 'apple-health' : 'health-connect', importedAt: new Date().toISOString(), measurements: draft.measurements },
    });
    if (!active.current) return;
    setBusy(false);
    if (!success) { setMessage('Speichern fehlgeschlagen. Deine bisherigen Profilwerte bleiben erhalten. Bitte erneut versuchen.'); return; }
    const store = useShellSettings.getState();
    if (draft.profile.heightCm !== undefined) store.setHeightCm(draft.profile.heightCm);
    if (draft.profile.weightKg !== undefined) store.setWeightKg(draft.profile.weightKg);
    if (draft.profile.age !== undefined) store.setAge(draft.profile.age);
    setDraft(null);
    setMessage('Profilwerte übernommen.');
    onDone();
  }

  const button = 'min-h-12 rounded-xl px-4 py-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fit-accent disabled:opacity-50';
  return <section aria-label="Gesundheitsdaten übernehmen" className="space-y-4 border-b border-fit-line pb-6 text-fit-ink">
    <h2 className="text-xl font-bold">Profil aus {healthLabel} übernehmen?</h2>
    <p className="text-sm leading-relaxed">Größe und Gewicht freiwillig einlesen. Erst nach deiner Bestätigung speichern wir die Werte in deinem VitalOS-Konto in der Cloud und ersetzen die entsprechenden Profilangaben. Es gibt keine laufende Synchronisierung.</p>
    <p className="text-sm text-fit-dim">Schritte und andere Gesundheitsdaten werden nicht abgefragt. Fehlende Angaben kannst du manuell ergänzen.</p>
    {healthPlatform === 'ios' && !draft && <label className="flex min-h-12 items-center gap-3 text-sm"><input type="checkbox" checked={includeBirthDate} disabled={busy} onChange={e => setIncludeBirthDate(e.target.checked)} />Auch Geburtsdatum und daraus berechnetes Alter übernehmen</label>}
    {healthPlatform === 'android' && <p className="text-sm text-fit-dim">Alter bitte manuell im Körperprofil eingeben.</p>}
    {draft && <div className="space-y-3">
      <p className="text-sm font-bold">Bitte prüfe die gefundenen Angaben:</p>
      <dl className="space-y-2 text-sm">
        {[['heightCm', 'Größe', 'cm'], ['weightKg', 'Gewicht', 'kg'], ['birthDate', 'Geburtsdatum', ''], ['age', 'Alter', 'Jahre']].map(([field, label, unit]) => draft.profile[field] !== undefined && <div key={field} className="flex flex-wrap justify-between gap-x-4 gap-y-1"><dt>{label}</dt><dd className="text-right font-bold">{field === 'birthDate' ? new Date(`${draft.profile[field]}T12:00:00`).toLocaleDateString('de-AT') : draft.profile[field]} {unit}{draft.measurements[field] && <span className="block text-xs font-normal text-fit-dim">Messung: {new Date(draft.measurements[field].measuredAt).toLocaleDateString('de-AT')}</span>}</dd></div>)}
      </dl>
    </div>}
    <p role="status" aria-live="polite" className="text-sm">{busy ? 'Bitte warten …' : message}</p>
    <div className="flex flex-wrap gap-3">
      {draft ? <><button className={`${button} bg-fit-ink text-fit-bg`} disabled={busy} onClick={save}>Bestätigen & speichern</button><button className={`${button} border border-fit-line`} disabled={busy} onClick={() => setDraft(null)}>Verwerfen</button></> : <button className={`${button} bg-fit-ink text-fit-bg`} disabled={busy} onClick={read}>Aus {healthLabel} lesen</button>}
      {onboarding && <button className={`${button} border border-fit-line`} disabled={busy} onClick={onDone}>Manuell / später</button>}
    </div>
    <LegalLinks />
  </section>;
}
