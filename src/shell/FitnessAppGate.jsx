import { ArrowUpRight } from 'lucide-react';
import { NAV_ITEMS } from '@shell/NavigationItems.js';

// items akzeptiert zwei Formen:
// - flache Liste: [{ id, label, Icon }, ...] (Default/Fallback, z.B. NAV_ITEMS)
// - gruppierte Liste: [{ group: 'Training', items: [...] }, ...]
//   (siehe buildFitnessGateItems() in NavigationItems.js) — rendert
//   Section-Header über jeder Gruppe, damit erkennbar bleibt wozu eine
//   Karte gehört (Training/Review/Lernen), statt alles flach zu mischen.
function CardGrid({ items, navigate, compact = false }) {
  return (
    <nav className={`grid w-full gap-3 ${compact ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
      {items.map(({ id, label, Icon, onSelect }) => (
        <button
          key={id}
          onClick={() => (onSelect ? onSelect() : navigate(id))}
          className={`group relative flex flex-col items-start justify-between overflow-hidden rounded-3xl border border-fit-line/60 bg-fit-card text-left transition-all duration-300
            hover:-translate-y-1 hover:border-fit-accent/50 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] active:translate-y-0 active:scale-[0.98]
            ${compact ? 'min-h-[118px] gap-3 p-4' : 'min-h-[132px] gap-4 p-5'}`}
        >
          {/* Accent-Glow beim Hover, von oben links */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: 'radial-gradient(120% 90% at 0% 0%, rgba(var(--accent-rgb,200,255,0),0.14) 0%, transparent 60%)' }}
          />

          <div className="z-10 flex w-full items-start justify-between">
            <div
              className={`flex items-center justify-center rounded-2xl border border-fit-line bg-fit-bg shadow-inner transition-all duration-300
                group-hover:border-fit-accent group-hover:bg-fit-accent group-hover:shadow-[0_8px_24px_-8px_rgba(var(--accent-rgb,200,255,0),0.5)]
                ${compact ? 'h-11 w-11' : 'h-14 w-14'}`}
            >
              <Icon size={compact ? 19 : 22} className="text-fit-dim transition-colors duration-300 group-hover:text-black" />
            </div>
            <ArrowUpRight
              size={16}
              className="mt-1 shrink-0 text-fit-dim/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fit-accent"
            />
          </div>

          <div className="z-10 flex flex-col gap-2">
            <span className={`font-black uppercase tracking-[0.18em] text-fit-muted transition-colors group-hover:text-fit-ink ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
              {label}
            </span>
            <div className="h-0.5 w-6 rounded-full bg-fit-line transition-all duration-500 group-hover:w-10 group-hover:bg-fit-accent" />
          </div>
        </button>
      ))}
    </nav>
  );
}

export default function AppGate({ navigate, items = NAV_ITEMS, title = null, variant = 'page' }) {
  const isGrouped = items.length > 0 && items[0] != null && 'group' in items[0];
  const isSheet = variant === 'sheet'
  const wrapperClass = isSheet
    ? 'flex flex-col text-fit-ink'
    : 'min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-fit-bg to-fit-bg2 text-fit-ink'
  const bodyClass = isSheet
    ? 'w-full space-y-8'
    : 'w-full max-w-5xl space-y-9 animate-in fade-in zoom-in-95 duration-700'

  return (
    <div className={wrapperClass}>
      {title && (
        <div className={`${isSheet ? 'mb-7 text-left' : 'mb-10 text-center animate-in fade-in duration-700'}`}>
          <h2 className={`${isSheet ? 'text-2xl' : 'text-3xl'} font-black tracking-tight text-fit-ink`}>{title}</h2>
          <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-fit-dim/70">Bereich wählen</p>
        </div>
      )}

      <div className={bodyClass}>
        {isGrouped
          ? items.filter((g) => g.items?.length > 0).map((g) => (
              <div key={g.group}>
                <div className="mb-3.5 flex items-center gap-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.28em] text-fit-ink/80">{g.group}</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-fit-line/70 to-transparent" />
                  <span className="text-[10px] font-black tabular-nums text-fit-dim/50">{g.items.length}</span>
                </div>
                <CardGrid items={g.items} navigate={navigate} compact={isSheet} />
              </div>
            ))
          : <CardGrid items={items} navigate={navigate} compact={isSheet} />}
      </div>

      {/* Date / Subtitle footer */}
      {!isSheet && (
        <div className="mt-16 text-[9px] font-black uppercase tracking-widest text-fit-dim opacity-50 animate-in fade-in duration-1000 delay-150">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      )}
    </div>
  );
}
