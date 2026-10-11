import { Zap, ChevronRight, Dumbbell, Activity, Timer } from "lucide-react";
import { getBlockColor as blockColor, ACTIVITY_LABELS, ACTIVITY_ICONS, ACTIVITY_EMOJI } from "@constants/ActivityConstants";

export default function SessionStatus({ plan, todaySession, recent, today, onNavigate }) {
  const planExercises = Array.isArray(plan?.today?.exercises) ? plan.today.exercises : [];
  const todayExercises = Array.isArray(todaySession?.exercises) ? todaySession.exercises : [];
  const recentSessions = Array.isArray(recent) ? recent : [];

  return (
    <div className="space-y-4">
      {/* Plan-Hint */}
      {plan?.today && (
        <div className="rounded-[18px] p-4 vos-fill">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-fit-accent" />
              <span className="text-[13px] font-medium text-fit-dim">Vorschlag</span>
            </div>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium text-fit-accent" style={{ background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}>Plan</span>
          </div>
          <div className="mb-3">
            <div className="text-[24px] font-semibold tracking-tight text-fit-ink" style={{ color: blockColor(plan.today.block) || 'var(--accent)' }}>
              {plan.today.block}
            </div>
                      </div>
          {planExercises.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {planExercises.slice(0, 6).map((e, i) => (
                <span key={i} className="rounded-full px-2.5 py-1 text-[12px] text-fit-muted" style={{ background: 'color-mix(in srgb, var(--ink) 7%, transparent)' }}>
                  {typeof e === "string" ? e : e.name}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => onNavigate?.("session")}
            className="vos-press mt-4 h-11 w-full rounded-full text-[15px] font-semibold"
            style={{ background: 'var(--accent)', color: '#0b0e14' }}
          >
            Session starten
          </button>
        </div>
      )}

      {/* Heutige Session Status */}
       { (todayExercises.length > 0 || todaySession?.activity || todaySession?.sessionMode === 'cardio') ? (
        <div className="rounded-[18px] p-4 vos-fill">
          <div className="mb-3 flex items-center justify-between text-[13px]">
            <span className="font-medium text-fit-dim">Aktuelle Session</span>
            <span className="font-semibold text-fit-accent">
              {(todaySession?.activity || todaySession?.sessionMode === 'cardio')
                ? (ACTIVITY_LABELS[todaySession.activity?.type] || 'Ausdauer')
                : todaySession?.block}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-8">
              {todaySession.activity ? (
                <div className="flex flex-col">
                  <span className="flex items-baseline gap-1 text-[26px] font-semibold text-fit-ink tabular-nums">
                    {todaySession.activity.duration || '—'}<span className="text-[13px] font-normal text-fit-dim">min</span>
                  </span>
                  <span className="text-[12px] text-fit-dim">Dauer</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-[26px] font-semibold text-fit-ink tabular-nums">
                    {todayExercises.length}
                  </span>
                  <span className="text-[12px] text-fit-dim">Übungen</span>
                </div>
              )}
              {todaySession?.effort && (
                <div className="flex flex-col">
                  <span className="text-[26px] font-semibold text-fit-ink tabular-nums">{todaySession.effort}</span>
                  <span className="text-[12px] text-fit-dim">Effort</span>
                </div>
              )}
            </div>
            <button onClick={() => onNavigate?.("session")} className="vos-press flex h-11 w-11 items-center justify-center rounded-full" style={{ background: 'var(--accent)', color: '#0b0e14' }} aria-label="Session öffnen">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      ) : !plan?.today && (
        <div className="flex items-center gap-3 rounded-[18px] p-4 vos-fill">
           <Dumbbell size={20} className="shrink-0 text-fit-dim" />
           <p className="text-[14px] text-fit-dim">Heute nichts geplant – Pause oder Plan wählen.</p>
        </div>
      )}

    </div>
  );
}
