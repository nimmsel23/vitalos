import { ChevronLeft, ChevronRight, Shield, Zap } from "lucide-react";
import { NAV_ITEMS } from '@shell/NavigationItems';
import { isLocalMode } from "@db";

export default function Sidebar({ tab, navigate, pinned, setPinned, children, user, subNav, subTab, onSubTab }) {
  const hasSubNav = Array.isArray(subNav) && subNav.length > 0
  const visibleNavItems = NAV_ITEMS.filter(({ id }) => id !== 'hub')

  return (
    <aside className={`hidden lg:flex flex-col alpha-glass fixed left-3 top-4 bottom-4 z-50 rounded-[2rem] border border-fit-line/70 shadow-2xl shadow-black/20 transition-all duration-500 ease-in-out ${pinned ? 'w-[280px]' : 'w-24'}`}>
      <div className={`flex h-full flex-col p-4 ${!pinned ? 'items-center' : ''}`}>

        {/* Logo */}
        <div className="relative mb-6 flex items-center gap-4">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-fit-accent text-black flex items-center justify-center shadow-xl shadow-fit-accent/30 transition-transform hover:scale-105">
            <Zap size={20} />
          </div>
          {pinned && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-lg font-black tracking-tight text-fit-ink">VitalOS</h2>
            </div>
          )}
          <button
            onClick={() => setPinned(!pinned)}
            className="absolute top-1 right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/8 text-fit-dim shadow-lg backdrop-blur transition-all hover:scale-110 hover:text-fit-accent active:scale-90"
          >
            {pinned ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Haupt-Nav bleibt in App-Views immer kompakt, damit die Rail nicht
            zwischen Journal/Habits und Apps mit eigener Sub-Navigation springt. */}
        <nav className="mb-4 flex flex-wrap justify-center gap-1 border-b border-fit-line/30 pb-4">
          {visibleNavItems.map(({ id, label, Icon }) => {
            const isActive = tab === id
            return (
              <button key={id} onClick={() => navigate(id)} title={label}
                className={`rounded-xl border p-2.5 transition-all duration-200 ${isActive ? 'border-fit-accent/30 bg-fit-accent/14 text-fit-accent shadow-lg shadow-fit-accent/10 backdrop-blur' : 'border-transparent text-fit-dim hover:border-white/10 hover:bg-white/5 hover:text-fit-ink'}`}>
                <Icon size={16} className={isActive ? 'stroke-[3]' : ''} />
              </button>
            )
          })}

          {(isLocalMode() || user?.email?.includes('alpha') || user?.uid === '59ole36uNpNwml5H6VDYCXyCME92') && (
            <button key="coach" onClick={() => navigate('coach')} title="Coach"
              className={`rounded-xl border p-2.5 transition-all duration-200 ${tab === 'coach' ? 'border-red-500/30 bg-red-500/16 text-red-200 shadow-lg shadow-red-500/10 backdrop-blur' : 'border-transparent text-fit-dim hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-200'}`}>
              <Shield size={16} className={tab === 'coach' ? 'stroke-[3]' : ''} />
            </button>
          )}
        </nav>

        {/* Sub-Nav — reine App-Navigation ohne Shell/Gate-Ziele. Struktur
            identisch zu fitness-apps eigener Sidebar (@fitness/src/components/
            layout/Sidebar.jsx): Item mit `sub` klappt bei Aktivität eine
            zweite Ebene auf (z.B. Review -> Muskeln/Readiness/Verlauf),
            `noDefaultSub` verhindert dass der erste Sub-Eintrag fälschlich
            als aktiv markiert wird, wenn eigentlich der Tab selbst (Bericht)
            angezeigt wird. */}
        {hasSubNav && (
          <nav className="flex-1 space-y-1.5">
            {subNav.map(({ id, label, Icon, sub, noDefaultSub }) => {
              const isChildActive = sub?.some((s) => s.id === subTab)
              const isActive = subTab === id || isChildActive
              return (
                <div key={id}>
                  <button onClick={() => onSubTab?.(id)}
                    className={`w-full border transition-all duration-200 ${pinned ? 'gap-4 px-5 py-4 rounded-2xl' : 'justify-center p-4 rounded-2xl'} ${isActive ? 'border-fit-accent/25 bg-white/10 text-fit-ink shadow-xl shadow-black/10 backdrop-blur font-black' : 'border-transparent text-fit-dim hover:border-white/10 hover:bg-white/5 font-bold'} flex items-center`}>
                    <Icon size={20} className={isActive ? 'stroke-[3]' : ''} />
                    {pinned && <span className="text-sm truncate animate-in fade-in slide-in-from-left-4 duration-500">{label}</span>}
                  </button>

                  {isActive && pinned && sub?.length > 0 && (
                    <div className="ml-4 mt-1 mb-1 space-y-0.5 border-l-2 border-fit-accent/20 pl-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {sub.map(({ id: subId, label: subLabel, Icon: SubIcon }) => {
                        const isSubActive = subTab === subId || (!isChildActive && !noDefaultSub && sub[0].id === subId)
                        return (
                          <button key={subId} onClick={() => onSubTab?.(subId)}
                            className={`w-full flex items-center gap-3 rounded-xl border px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] transition-all ${isSubActive ? 'border-fit-accent/20 bg-fit-accent/12 text-fit-accent backdrop-blur' : 'border-transparent text-fit-dim/60 hover:border-white/10 hover:bg-white/5 hover:text-fit-dim'}`}>
                            <SubIcon size={13} />
                            {subLabel}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        )}

        {/* Footer */}
        <div className={`mt-auto space-y-3 border-t border-fit-line/30 pt-4 ${!pinned ? 'w-full flex flex-col items-center overflow-hidden' : ''}`}>
          {pinned ? children : (
            <div className="h-9 w-9 rounded-full border border-white/10 bg-white/6 backdrop-blur" />
          )}
        </div>
      </div>
    </aside>
  );
}
