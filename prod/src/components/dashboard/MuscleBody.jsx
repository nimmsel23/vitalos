import { useState, useEffect, useMemo } from "react";
import BodyMap from "@components/BodyMap";
import DetailedMuscleMap from "@components/DetailedMuscleMap";
import AnatomyDetailModal from "@components/AnatomyDetailModal";
import { getMuscle } from "@db";
import { ACTIVITY_MUSCLE_GROUPS } from "@constants/ActivityConstants";

const ACTIVITY_MUSCLES = ACTIVITY_MUSCLE_GROUPS;

// Tage seit letztem Training → Superkompensationsphase
// Cardio: kürzeres Fenster (schnellere Erholung), kein Rot (kein Muskeltrauma)
function superKompFreq(daysSince, isCardio = false) {
  if (isCardio) {
    if (daysSince <= 1) return 1;   // rot: frisch
    if (daysSince <= 4) return 2;   // gelb: Erholung
    if (daysSince <= 10) return 3;  // grün: bereit
    return 0;
  }
  // HIT: maximaler Reiz → langer Erholungszyklus
  if (daysSince <= 3)  return 1;   // rot: Stark belastet
  if (daysSince <= 7)  return 2;   // gelb: Erholung
  if (daysSince <= 14) return 3;   // grün: Superkompensation — jetzt!
  if (daysSince <= 21) return 4;   // blau: Fenster schließt sich
  return 0;
}

// Berechnet lastTrainedDate + isCardio pro Muskel aus Session-Array. Trackt
// bewusst auf Einzelmuskel-Ebene (rohe primaryMuscles/secondaryMuscles-IDs),
// nicht vorab auf grobe Region kollabiert — das Downsampling auf die jeweils
// gröbere Zielsprache (RBH-Slug, RMH-Slug, ...) übernehmen die Highlighter
// selbst (muscleToRbhSlug()/muscleToRmhSlug() in translations.js). Cardio
// kennt naturgemäß nur grobe Aktivitäts-Gruppen (ACTIVITY_MUSCLE_GROUPS) —
// die landen als Wort-Keys im selben Dict, die Highlighter lösen Wörter
// genauso auf wie Einzel-IDs.
function buildLastTrainedMap(sessions) {
  const last = {}; // { [muscleIdOrGroupWord]: { date, isCardio } }
  const update = (date, key, isCardio) => {
    if (!last[key] || date > last[key].date) last[key] = { date, isCardio };
    // Kraft überschreibt Cardio wenn gleicher Tag
    else if (date === last[key].date && !isCardio) last[key].isCardio = false;
  };
  for (const s of sessions || []) {
    if (!s?.date) continue;
    // Kraft-Exercises
    for (const ex of s.exercises || []) {
      if (ex.done === false) continue;
      for (const m of [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])]) {
        if (m) update(s.date, m, false);
      }
    }
    // Cardio-Activity
    const actType = s.activity?.type;
    const actMuscles = actType && ACTIVITY_MUSCLES[actType];
    if (actMuscles) actMuscles.forEach(g => update(s.date, g, true));
  }
  return last;
}

const SUPERKOMP_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];

const LEGEND = [
  { color: '#ef4444', label: '0–3 Tage',  sub: 'Stark belastet' },
  { color: '#f59e0b', label: '3–7 Tage',  sub: 'Erholung' },
  { color: '#22c55e', label: '7–14 Tage', sub: 'Superkompensation' },
  { color: '#3b82f6', label: '14–21 Tage', sub: 'Fenster schließt sich' },
];

export default function MuscleBody({ allSessions, enrichedRecent, recentDays = 7, highlighterMode = 'body', gender = 'male' }) {
  const [selectedMuscleId, setSelectedMuscleId] = useState(null);
  const [muscleData, setMuscleData] = useState(null);
  const [muscleLoading, setMuscleLoading] = useState(false);

  useEffect(() => {
    if (!selectedMuscleId) { setMuscleData(null); return; }
    setMuscleLoading(true);
    getMuscle(selectedMuscleId)
      .then(d => setMuscleData(d || null))
      .catch(() => setMuscleData(null))
      .finally(() => setMuscleLoading(false));
  }, [selectedMuscleId]);

  // Superkompensations-Scores aus Session-History
  // score = freq (1–4), color = direkter Hex-Wert für react-muscle-highlighter
  const groupScores = useMemo(() => {
    const sessions = allSessions || enrichedRecent || [];
    const lastTrained = buildLastTrainedMap(sessions);
    // Lokales Kalenderdatum, nicht UTC — s.date wird beim Speichern ebenfalls
    // lokal erzeugt (todayISO()). Ein UTC-Datum liegt in Zeitzonen östlich von
    // UTC kurz nach lokaler Mitternacht noch auf dem Vortag und lässt
    // daysSince um 1 zu klein erscheinen (kippt z.B. 4 echte Tage auf
    // score=1 "Stark belastet" statt score=2 "Erholung").
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const scores = {};
    for (const [group, { date, isCardio }] of Object.entries(lastTrained)) {
      const daysSince = Math.round((new Date(today) - new Date(date)) / 86400000);
      const freq = superKompFreq(daysSince, isCardio);
      if (freq > 0) scores[group] = { score: freq, color: SUPERKOMP_COLORS[freq - 1] };
    }
    return scores;
  }, [allSessions, enrichedRecent]);

  const isMuscles = highlighterMode === 'muscles';
  const sharedProps = { onGroupClick: setSelectedMuscleId };

  // min(160px, 40vw): auf schmalen Handys (~360px) sind zwei Silhouetten +
  // Gap sonst breiter als der Viewport und werden von overflow-x:hidden
  // in der Shell abgeschnitten statt sichtbar zu scrollen.
  const bodyMaxWidth = 'min(160px, 40vw)';

  const frontProps = isMuscles
    ? { groupScores, gender, side: 'front', style: { maxWidth: bodyMaxWidth }, ...sharedProps }
    : { groupScores, highlightedColors: SUPERKOMP_COLORS, style: { maxWidth: bodyMaxWidth }, ...sharedProps };

  const backProps = isMuscles
    ? { groupScores, gender, side: 'back', style: { maxWidth: bodyMaxWidth }, ...sharedProps }
    : { groupScores, highlightedColors: SUPERKOMP_COLORS, style: { maxWidth: bodyMaxWidth }, ...sharedProps };

  const HighlighterFront = isMuscles ? DetailedMuscleMap : BodyMap;
  const HighlighterBack  = isMuscles ? DetailedMuscleMap : BodyMap;

  return (
    <div className="alpha-card p-10 flex flex-col h-full bg-gradient-to-br from-fit-card to-fit-bg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="label-caps !mb-0">Muskel-Status</h3>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
          Superkompensation · {recentDays}d
        </span>
      </div>

      <div className="flex flex-1 justify-center items-center gap-4 sm:gap-16 scale-100 sm:scale-110 origin-center">
        <HighlighterFront {...frontProps} />
        <HighlighterBack  {...backProps}  />
      </div>

      {/* Legende */}
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-1.5">
        {LEGEND.map(({ color, label, sub }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[10px] opacity-60 leading-tight">
              <span className="font-bold">{label}</span> · {sub}
            </span>
          </div>
        ))}
      </div>

      <AnatomyDetailModal
        muscleId={selectedMuscleId}
        muscleData={muscleData}
        loading={muscleLoading}
        onClose={() => setSelectedMuscleId(null)}
      />
    </div>
  );
}
