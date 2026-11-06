import { Activity, ChevronRight } from "lucide-react";
import { getBlockColor as blockColor, ACTIVITY_LABELS } from "@constants/ActivityConstants";
import { DAY_LABELS } from "./utils";

export default function ActivityHeatmap({ rollingDays, sessionByDate, today, onNavigate }) {
  const recentList = Object.entries(sessionByDate)
    .filter(([, s]) => s?.block || s?.activity)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 10);

  return (
    <div className="md:col-span-2 xl:col-span-3 vos-surface rounded-[22px] p-5 md:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[17px] font-semibold text-fit-ink">
          <Activity size={17} className="text-fit-accent" />
          Aktivität & Konsistenz
        </h3>
        <span className="shrink-0 text-[12px] text-fit-dim">Letzte 10 Tage</span>
      </div>
      <div className="grid grid-cols-5 gap-x-3 gap-y-4 lg:grid-cols-10">
        {rollingDays.map((date) => {
          const s = sessionByDate[date];
          const done = !!(s?.block || s?.activity);
          const isToday = date === today;
          const color = done ? blockColor(s.block, s.activity, s.sessionMode) : null;
          const dayName = DAY_LABELS[new Date(date).getDay()];
          return (
            <div key={date} className="group flex flex-col items-center gap-1.5">
              <button
                onClick={() => done && onNavigate?.("session", date)}
                className="flex aspect-square w-full max-w-[44px] items-center justify-center rounded-full border text-[13px] font-semibold transition-all"
                style={{
                  background: done ? (color + '22') : 'color-mix(in srgb, var(--ink) 5%, transparent)',
                  borderColor: isToday ? 'var(--accent)' : 'transparent',
                  color: done ? color : 'var(--dim)',
                  cursor: done ? 'pointer' : 'default',
                }}
              >
                {done ? "✓" : "·"}
              </button>
              <span className="text-[11px] font-medium text-fit-dim">
                {dayName}
              </span>
            </div>
          );
        })}
      </div>

      {recentList.length > 0 && (
        <div className="mt-5 pt-4 vos-hairline-t">
          <div className="vos-eyebrow mb-2">Verlauf</div>
          <div className="space-y-1">
            {recentList.map(([date, s]) => {
              const color = blockColor(s.block, s.activity, s.sessionMode);
              const label = s.block || ACTIVITY_LABELS[s.activity?.type] || '—';
              const exCount = s.exercises?.length || 0;
              return (
                <button
                  key={date}
                  onClick={() => onNavigate?.("session", date)}
                  className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors active:bg-white/5 hover:bg-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color || 'var(--accent)' }} />
                    <span className="text-[14px] font-medium" style={{ color: color || 'var(--accent)' }}>{label}</span>
                    <span className="text-[12px] text-fit-dim tabular-nums">{new Date(`${date}T12:00:00`).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-4 text-fit-dim">
                    {exCount > 0 && <span className="text-[12px]">{exCount} Übg.</span>}
                    {s.effort && <span className="text-[12px]">E{s.effort}</span>}
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
