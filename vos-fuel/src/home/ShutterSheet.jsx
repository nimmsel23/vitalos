import React from "react";
import { X } from "lucide-react";
import ShutterFrontdoor from "@fuel/views/Frontdoor/ShutterFrontdoor.jsx";

// Shutter als Vollbild-Overlay über dem Home-Screen: Kamera auf, auslösen, bestätigen, zurück in den Faden.
// Schließt sich selbst, sobald eine Mahlzeit gespeichert wurde (lastLogged ändert sich).
export default function ShutterSheet({ fd, onClose, onOpenApp }) {
  const first = React.useRef(fd.lastLogged?.id || null);
  React.useEffect(() => {
    if (fd.lastLogged?.id && fd.lastLogged.id !== first.current) onClose();
  }, [fd.lastLogged, onClose]);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 p-4 backdrop-blur">
      <button onClick={onClose} aria-label="Schließen" className="fixed right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/60 text-white">
        <X className="h-5 w-5" />
      </button>
      <ShutterFrontdoor fd={fd} onOpenApp={(tab) => { onClose(); onOpenApp?.(tab); }} />
    </div>
  );
}
