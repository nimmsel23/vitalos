import React from "react";
import { Mic, Camera, Send, Loader2, Square } from "lucide-react";

const SpeechCtor = () => (typeof window === "undefined" ? null : window.SpeechRecognition || window.webkitSpeechRecognition || null);

// Eingabezeile: Kamera (Shutter), Freitext (Katalog-Match, dann Gemini-Schätzung) und Diktat — alles landet im Faden.
export default function Composer({ ai, onCamera }) {
  const [listening, setListening] = React.useState(false);
  const [heard, setHeard] = React.useState("");
  const recRef = React.useRef(null);
  const hasSpeech = !!SpeechCtor();

  const start = () => {
    const Ctor = SpeechCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "de-AT"; rec.interimResults = true; rec.continuous = false;
    rec.onresult = (e) => setHeard(Array.from(e.results).map((r) => r[0].transcript).join(" "));
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      setHeard((txt) => { if (txt.trim()) { ai.setText(txt.trim()); setTimeout(() => ai.submit(), 0); } return ""; });
    };
    recRef.current = rec; setHeard(""); setListening(true); rec.start();
  };
  const stop = () => { recRef.current?.stop(); setListening(false); };

  return (
    <>
      {ai.error && <p className="text-xs text-red-400">{ai.error}</p>}
      <form onSubmit={ai.submit} className="flex items-center gap-2 border-t border-white/10 pt-4">
        <button type="button" onClick={onCamera} aria-label="Foto" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300"><Camera className="h-5 w-5" /></button>
        <input value={ai.text} onChange={(e) => ai.setText(e.target.value)} placeholder="Was hast du gegessen?"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-slate-100 placeholder:text-slate-600" />
        {ai.text.trim() ? (
          <button type="submit" disabled={ai.loading} aria-label="Eintragen" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-400 text-slate-950 disabled:opacity-60">
            {ai.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        ) : (
          <button type="button" onClick={listening ? stop : start} disabled={!hasSpeech} aria-label="Diktieren"
            title={hasSpeech ? "Diktieren" : "Diktat wird von diesem Browser nicht unterstützt — nutze die Diktattaste der Tastatur"}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-400 text-slate-950 disabled:opacity-40">
            {listening ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
          </button>
        )}
      </form>
      {listening && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/90 p-8 backdrop-blur" onClick={stop}>
          <p className="text-2xl leading-snug text-slate-100">{heard || "Ich höre zu …"}</p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-emerald-400">Tippen zum Beenden — der Satz geht direkt in den Faden</p>
        </div>
      )}
    </>
  );
}
