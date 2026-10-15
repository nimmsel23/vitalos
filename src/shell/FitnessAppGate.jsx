import { NAV_ITEMS } from '@shell/NavigationItems.js';

// items akzeptiert zwei Formen:
// - flache Liste: [{ id, label, Icon }, ...] (Default/Fallback, z.B. NAV_ITEMS)
// - gruppierte Liste: [{ group: 'Training', items: [...] }, ...]
//   (siehe buildFitnessGateItems() in NavigationItems.js) — rendert
//   Section-Header über jeder Gruppe, damit erkennbar bleibt wozu eine
//   Karte gehört (Training/Review/Lernen), statt alles flach zu mischen.
function CardGrid({ items, navigate, compact = false }) {
  return (
    <nav aria-label="Fitness-Bereiche" data-shell-nav="grid" className={`grid w-full gap-2.5 ${compact ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
      {items.map(({ id, label, Icon, onSelect }) => (
        <button
          key={id}
          onClick={() => (onSelect ? onSelect() : navigate(id))}
          className="vos-press vos-surface flex min-h-[60px] items-center gap-3 rounded-[18px] px-3.5 py-3 text-left transition-colors hover:border-fit-accent/40"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
            style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}
          >
            <Icon size={18} strokeWidth={2} />
          </span>
          <span className="min-w-0 truncate text-[15px] font-medium text-fit-ink">{label}</span>
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
    : 'flex flex-col items-center px-4 pb-6 pt-4 text-fit-ink'
  const bodyClass = isSheet
    ? 'w-full space-y-6'
    : 'w-full max-w-5xl space-y-6'

  return (
    <div className={wrapperClass}>
      {title && (
        <div className={`${isSheet ? 'mb-6 text-left' : 'mb-6 w-full max-w-5xl text-left'}`}>
          <h2 className={`${isSheet ? 'text-[28px]' : 'text-[32px]'} font-bold tracking-tight text-fit-ink`}>{title}</h2>
          <p className="mt-0.5 text-[14px] text-fit-dim">Wohin geht's heute?</p>
        </div>
      )}

      <div className={bodyClass}>
        {isGrouped
          ? items.filter((g) => g.items?.length > 0).map((g) => (
              <div key={g.group}>
                <div className="vos-eyebrow mb-2 px-1">{g.group}</div>
                <CardGrid items={g.items} navigate={navigate} compact={isSheet} />
              </div>
            ))
          : <CardGrid items={items} navigate={navigate} compact={isSheet} />}
      </div>

      {/* Date / Subtitle footer */}
      {!isSheet && (
        <div className="mt-10 text-[12px] text-fit-dim/70">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      )}
    </div>
  );
}
