import React from "react";
import { ArrowLeft, LayoutGrid, RotateCcw } from "lucide-react";
import { TAB_CONFIG } from "@fuel/routes.js";
import TabContent from "@fuel/components/TabContent.jsx";
import { InstallPromptHandler } from "@fuel/components/InstallPromptHandler.jsx";
import { IosInstallHint } from "@fuel/components/IosInstallHint.jsx";
import { useApp, useSettings } from "@fuel/store.js";
import { useAppData } from "@fuel/hooks/useAppData.js";
import { watchAuth, signIn, signOut } from "@fuel/lib/db.firestore.js";
import { useQueryClient } from "@tanstack/react-query";
import FuelHome from "./home/FuelHome.jsx";
import Menu from "./Menu.jsx";
import { go } from "./nav.js";

// vos-fuel: EIN Screen (Home = Schnelleinstieg aus Tap Board, Shutter und Tagesfaden) und alles andere als
// eigene Seite per Hash-Route (#/menu, #/log-dashboard, #/pots, ...), analog zu Pulse in vos-fitness.
function routeFromHash() {
  const raw = window.location.hash.replace(/^#\/?/, "").split("/")[0];
  return raw || "home";
}

export default function FuelApp() {
  const qc = useQueryClient();
  const [route, setRoute] = React.useState(routeFromHash);
  const [user, setUser] = React.useState(null);
  const [authReady, setAuthReady] = React.useState(false);
  const [authError, setAuthError] = React.useState("");
  const [needRefresh, setNeedRefresh] = React.useState(false);
  const { activeDate, setActiveDate } = useApp();

  React.useEffect(() => {
    const on = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  React.useEffect(() => {
    let prev = null;
    return watchAuth((u) => {
      if (prev !== (u?.uid || null)) { qc.clear(); prev = u?.uid || null; }
      setUser(u);
      setAuthReady(true);
      if (u) useSettings.getState().hydrateFromCloud();
    });
  }, [qc]);
  React.useEffect(() => {
    const on = () => setNeedRefresh(true);
    window.addEventListener("sw-update-available", on);
    return () => window.removeEventListener("sw-update-available", on);
  }, []);

  const reload = () => {
    const w = window.__swRegistration?.waiting;
    if (w) w.postMessage({ type: "SKIP_WAITING" });
    else window.location.reload();
  };

  if (!authReady) return <div className="py-24 text-center text-sm text-slate-500 animate-pulse">Laden…</div>;
  if (!user) {
    return (
      <div className="mx-auto mt-24 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="mb-4 text-sm text-slate-300">Mit deinem VitalOS-Konto anmelden, um Fuel zu nutzen.</p>
        <button onClick={() => { setAuthError(""); signIn().catch((e) => setAuthError(e.message)); }}
          className="rounded-full bg-orange-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-orange-300">
          Mit Google anmelden
        </button>
        {authError && <p role="alert" className="mt-3 text-sm text-rose-300">{authError}</p>}
      </div>
    );
  }

  const userName = user.displayName?.split(" ")[0] || "";
  const safe = { paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" };

  return (
    <div className="min-h-screen text-slate-100" style={safe}>
      <InstallPromptHandler />
      <IosInstallHint />
      {needRefresh && (
        <button onClick={reload} className="fixed right-3 top-3 z-50 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-slate-950/90 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-amber-200">
          <RotateCcw className="h-3.5 w-3.5" /> Update
        </button>
      )}
      {route === "home" ? (
        <FuelHome userName={userName} onOpen={go} />
      ) : route === "menu" ? (
        <Menu userName={userName} onSignOut={signOut} />
      ) : (
        <Page route={route} date={activeDate} setDate={setActiveDate} />
      )}
    </div>
  );
}

// Seiten = die Tabs aus fuel-app (routes.js), unverändert, nur in neuer Hülle.
function Page({ route, date, setDate }) {
  const tab = TAB_CONFIG.find((t) => t.key === route);
  const data = useAppData(date);
  if (!tab) {
    return <div className="p-6 text-sm text-slate-400">Unbekannte Seite „{route}“. <button className="underline" onClick={() => go("menu")}>Zum Menü</button></div>;
  }
  const ctx = { ...data, activeDate: date, setActiveDate: setDate, setActiveTab: go };
  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 py-3 sm:px-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <button onClick={() => go("home")} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" /> Heute
        </button>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight"><tab.Icon className="h-5 w-5 text-orange-300" />{tab.label}</h1>
        <button onClick={() => go("menu")} aria-label="Menü" className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"><LayoutGrid className="h-4 w-4" /></button>
      </header>
      <TabContent activeTab={route} ctx={ctx} />
    </div>
  );
}
