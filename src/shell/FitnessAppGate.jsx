import { NAV_ITEMS } from '@shell/NavigationItems.js';

// items akzeptiert zwei Formen:
// - flache Liste: [{ id, label, Icon }, ...] (Default/Fallback, z.B. NAV_ITEMS)
// - gruppierte Liste: [{ group: 'Training', items: [...] }, ...]
//   (siehe buildFitnessGateItems() in NavigationItems.js) — rendert
//   Section-Header über jeder Gruppe, damit erkennbar bleibt wozu eine
//   Karte gehört (Training/Review/Lernen), statt alles flach zu mischen.
function CardGrid({ items, navigate, compact = false }) {
  return (
    <nav className={`grid w-full gap-4 ${compact ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
      {items.map(({ id, label, Icon, onSelect }) => (
        <button
          key={id}
          onClick={() => (onSelect ? onSelect() : navigate(id))}
          className={`relative group overflow-hidden rounded-[32px] border border-fit-line/50 bg-fit-card transition-all active:scale-95 flex flex-col items-center shadow-sm hover:border-fit-accent/40 hover:shadow-2xl hover:shadow-fit-accent/10 ${compact ? 'gap-3 p-5' : 'gap-4 p-6'}`}
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-fit-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className={`rounded-[20px] border border-fit-line bg-fit-bg flex items-center justify-center group-hover:bg-fit-accent group-hover:border-fit-accent transition-all duration-300 shadow-inner z-10 ${compact ? 'h-12 w-12' : 'h-14 w-14'}`}>
            <Icon size={compact ? 20 : 24} className="text-fit-dim group-hover:text-black transition-colors" />
          </div>

          <div className="flex flex-col items-center gap-1 z-10">
            <span className={`font-black uppercase tracking-[0.2em] text-fit-muted group-hover:text-fit-ink transition-colors ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
              {label}
            </span>
            <div className="h-0.5 w-0 group-hover:w-8 bg-fit-accent transition-all duration-500 rounded-full" />
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
    ? 'w-full space-y-7'
    : 'w-full max-w-6xl space-y-8 animate-in fade-in zoom-in-95 duration-700'

  return (
    <div className={wrapperClass}>
      {title && (
        <div className={`${isSheet ? 'mb-6 text-left' : 'mb-10 text-center animate-in fade-in duration-700'}`}>
          <h2 className={`${isSheet ? 'text-2xl' : 'text-3xl'} font-black tracking-tight text-fit-ink`}>{title}</h2>
        </div>
      )}

      <div className={bodyClass}>
        {isGrouped
          ? items.filter((g) => g.items?.length > 0).map((g) => (
              <div key={g.group}>
                <div className="mb-3 ml-1 text-[10px] font-black uppercase tracking-[0.25em] text-fit-dim/50">
                  {g.group}
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
