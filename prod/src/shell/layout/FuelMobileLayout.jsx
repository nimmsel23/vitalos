import { motion, AnimatePresence } from 'framer-motion'
import { NAV_ITEMS } from '@shell/NavigationItems'
import { Keyboard } from 'lucide-react'

export default function FuelMobileLayout({ tab, navigate, header, onKeyboardHelp, children }) {
  return (
    <div className="lg:hidden flex flex-col min-h-[100dvh] bg-fit-bg text-fit-ink">
      {header}

      <nav aria-label="Hauptnavigation" data-shell-nav="horizontal" className="mx-3 mt-3 flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <motion.button
            key={id}
            onClick={() => navigate(id)}
            aria-current={tab === id ? 'page' : undefined}
            whileTap={{ scale: 0.93 }}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 ${
              tab === id
                ? 'border-fit-accent/40 bg-fit-accent text-black'
                : 'border-white/10 bg-white/5 text-fit-dim'
            }`}
          >
            <Icon size={11} />
            {label}
          </motion.button>
        ))}
        <button type="button" onClick={onKeyboardHelp} aria-label="Tastaturkurzbefehle" title="Tastaturkurzbefehle (?)" className="shrink-0 rounded-full px-3 text-fit-dim"><Keyboard size={18} /></button>
      </nav>

      {/* View content */}
      <div id="vos-shell-content" tabIndex={-1} className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
