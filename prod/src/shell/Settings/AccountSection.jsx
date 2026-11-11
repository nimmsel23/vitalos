import { useState } from "react";
import { LogOut, User } from "lucide-react";
import LegalLinks from "../LegalLinks.jsx";
import { callDeleteOwnAccount, clearLocalAccountResidue, reauthenticateCurrentUser } from "../../cloud/deleteAccount.js";
import { CONFIRM_PHRASE, deletionErrorMessage, needsPasswordReauth, runAccountDeletion } from "../../cloud/deleteAccountFlow.js";

export default function AccountSection({ user, signOut }) {
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  function close() {
    if (busy) return;
    setOpen(false);
    setPhrase("");
    setPassword("");
    setError("");
  }

  async function handleDelete(event) {
    event.preventDefault();
    if (phrase.trim() !== CONFIRM_PHRASE) {
      setError(`Bitte ${CONFIRM_PHRASE} eintippen.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await runAccountDeletion({
        user,
        password,
        reauthenticate: reauthenticateCurrentUser,
        callDelete: callDeleteOwnAccount,
        clearLocal: clearLocalAccountResidue,
      });
      try { await signOut(); } catch { /* das Auth-Konto ist serverseitig bereits weg */ }
      window.location.assign("/");
    } catch (err) {
      setError(deletionErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <section className="card p-6 border-t-4 border-t-fit-accent animate-in fade-in slide-in-from-top-4 duration-500">
      <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest text-fit-dim">Konto</h3>
      <div className="flex items-center gap-4">
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-12 h-12 rounded-2xl shadow-md" />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-fit-accent/10 flex items-center justify-center">
            <User size={20} className="text-fit-accent" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-black text-fit-ink">{user.displayName || 'Angemeldet'}</div>
          <div className="text-[10px] font-bold text-fit-dim truncate">{user.email}</div>
          <div className="text-[9px] font-mono opacity-30 mt-0.5">{user.uid?.slice(0, 12)}…</div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-fit-red bg-fit-red/5 border border-fit-red/10 hover:bg-fit-red/10 transition-all"
        >
          <LogOut size={12} />
          Logout
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-fit-line pt-4">
        <LegalLinks />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-fit-red/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-fit-red"
        >
          Konto löschen
        </button>
      </div>

      {open && (
        <form onSubmit={handleDelete} className="mt-4 space-y-3" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
          <h4 id="delete-account-title" className="font-black text-fit-ink">Konto und Daten löschen</h4>
          <p className="text-sm text-fit-dim">
            Das löscht das Firebase-Konto und die Firestore-Daten dieser Anmeldung. Geteilte Kataloge bleiben. Die Aktion lässt sich nicht rückgängig machen.
          </p>
          {needsPasswordReauth(user) ? (
            <label className="block text-sm text-fit-ink">
              Passwort zur Bestätigung
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-fit-line bg-fit-bg2 px-4 py-3 text-sm text-fit-ink outline-none"
              />
            </label>
          ) : (
            <p className="text-sm text-fit-dim">Im nächsten Schritt fragt Google die Anmeldung erneut ab.</p>
          )}
          <label className="block text-sm text-fit-ink">
            Zur Bestätigung {CONFIRM_PHRASE} eintippen
            <input
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-fit-line bg-fit-bg2 px-4 py-3 text-sm text-fit-ink outline-none"
            />
          </label>
          {error && <p role="alert" className="text-sm text-fit-red">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={close} disabled={busy} className="rounded-xl border border-fit-line px-4 py-2 text-sm text-fit-dim">
              Abbrechen
            </button>
            <button type="submit" disabled={busy} className="rounded-xl bg-fit-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Löscht…" : "Endgültig löschen"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
