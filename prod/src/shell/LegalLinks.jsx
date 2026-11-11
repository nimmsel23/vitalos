import { ACCOUNT_DELETION_URL, PRIVACY_URL } from "../cloud/legal.js";

const linkClass = "text-[13px] text-fit-dim underline underline-offset-2 hover:text-fit-accent";

export default function LegalLinks({ className = "" }) {
  return (
    <nav aria-label="Rechtliches" className={`flex flex-wrap gap-x-4 gap-y-1 ${className}`}>
      <a className={linkClass} href={PRIVACY_URL}>Datenschutz</a>
      <a className={linkClass} href={ACCOUNT_DELETION_URL}>Konto löschen</a>
    </nav>
  );
}
