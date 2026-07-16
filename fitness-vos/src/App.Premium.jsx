import React from 'react'
import { Activity, RotateCcw, Zap, Target } from 'lucide-react'
import Session from '@fitness/views/Session/index.jsx'
import { useRegisterSW } from "virtual:pwa-register/react"

export default function App() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-black/50 p-2 rounded-full border border-white/10">
                <Activity size={22} className="text-orange-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gradient tracking-tight m-0">VOS Fitness</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {needRefresh && (
              <button
                onClick={() => updateServiceWorker(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full animated-gradient-bg text-white font-semibold text-xs uppercase tracking-wider hover-glow transition-all"
              >
                <RotateCcw size={14} className="animate-spin-slow" /> 
                <span>Update Ready</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-300">
              <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <Zap size={16} className="text-rose-400" /> Premium
              </div>
              <div className="w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <Target size={16} className="text-indigo-400" /> Goals
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-12 relative z-10">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Your Workout Session</h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-medium">
                Crush your goals with real-time tracking, powered by advanced metrics and dynamic session management.
              </p>
            </div>
            
            <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden shadow-inner">
              <Session />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-slate-500 text-sm font-medium border-t border-white/5 mt-auto">
        &copy; {new Date().getFullYear()} VOS Fitness Platform. All rights reserved.
      </footer>
    </div>
  )
}
