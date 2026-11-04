import React from "react";
import { ArrowLeft } from "lucide-react";
import { TAB_CONFIG } from "@fuel/routes.js";
import { go } from "./nav.js";

// Gruppen des Menüs; was in routes.js fehlt (z. B. lokale Tabs), wird übersprungen.
const GROUPS = [
  { title: "Erfassen", keys: ["log", "food", "recipes", "pots", "kitchen", "catalog"] },
  { title: "Auswerten", keys: ["log-dashboard", "log-timeline", "history", "micros", "supplements", "report"] },
  { title: "System", keys: ["training-module", "fasting", "settings"] },
];

export default function Menu({ userName, onSignOut }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <button onClick={() => go("home")} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" /> Heute
        </button>
        <button onClick={onSignOut} className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-white">Logout{userName ? ` (${userName})` : ""}</button>
      </header>
      {GROUPS.map((g) => {
        const tabs = g.keys.map((k) => TAB_CONFIG.find((t) => t.key === k)).filter(Boolean);
        if (!tabs.length) return null;
        return (
          <section key={g.title} className="mb-6">
            <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-orange-300">{g.title}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tabs.map(({ key, label, Icon }) => (
                <button key={key} onClick={() => go(key)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm font-medium text-slate-100 hover:bg-white/10">
                  <Icon className="h-5 w-5 shrink-0 text-orange-300" />{label}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
