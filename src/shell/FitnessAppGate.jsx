import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NAV_ITEMS } from '@shell/NavigationItems.js';

const PAGE_SIZE = 4

export default function AppGate({ navigate, items = NAV_ITEMS, title = null }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const visibleItems = useMemo(
    () => items.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [items, safePage],
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-fit-bg to-fit-bg2 text-fit-ink">
      {title && (
        <div className="mb-10 text-center animate-in fade-in duration-700">
          <h2 className="text-3xl font-black tracking-tight text-fit-ink">{title}</h2>
        </div>
      )}
      
      {/* Navigation Grid */}
      <nav className="grid grid-cols-2 gap-4 w-full max-w-xl animate-in fade-in zoom-in-95 duration-700">
        {visibleItems.map(({ id, label, Icon, onSelect }) => (
          <button
            key={id}
            onClick={() => (onSelect ? onSelect() : navigate(id))}
            className="relative group p-6 rounded-[32px] bg-fit-card border border-fit-line/50 active:scale-95 transition-all overflow-hidden flex flex-col items-center gap-4 shadow-sm hover:shadow-2xl hover:shadow-fit-accent/10 hover:border-fit-accent/40"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-fit-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-14 h-14 rounded-[20px] bg-fit-bg border border-fit-line flex items-center justify-center group-hover:bg-fit-accent group-hover:border-fit-accent transition-all duration-300 shadow-inner z-10">
              <Icon size={24} className="text-fit-dim group-hover:text-black transition-colors" />
            </div>
            
            <div className="flex flex-col items-center gap-1 z-10">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-fit-muted group-hover:text-fit-ink transition-colors">
                {label}
              </span>
              <div className="h-0.5 w-0 group-hover:w-8 bg-fit-accent transition-all duration-500 rounded-full" />
            </div>
          </button>
        ))}
      </nav>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={safePage === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-fit-line bg-fit-card text-fit-dim transition hover:text-fit-accent disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index)}
                className={`h-2.5 rounded-full transition-all ${index === safePage ? 'w-8 bg-fit-accent' : 'w-2.5 bg-fit-line hover:bg-fit-dim'}`}
                aria-label={`Seite ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            disabled={safePage === totalPages - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-fit-line bg-fit-card text-fit-dim transition hover:text-fit-accent disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Date / Subtitle footer */}
      <div className="mt-16 text-[9px] font-black uppercase tracking-widest text-fit-dim opacity-50 animate-in fade-in duration-1000 delay-150">
        {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}
