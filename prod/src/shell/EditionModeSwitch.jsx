import { getProductEdition } from './productEdition.js'

export default function EditionModeSwitch({ edition, onChange }) {
  const nextEdition = edition === 'operate' ? 'observe' : 'operate'
  const current = getProductEdition(edition)
  const next = getProductEdition(nextEdition)

  return (
    <button
      type="button"
      onClick={() => onChange(nextEdition)}
      aria-label={`Zur ${next.shortName}-Oberfläche wechseln`}
      title={`Zur ${next.shortName}-Oberfläche wechseln`}
      className="rounded-full border border-fit-line bg-fit-card px-3 py-2 text-xs font-semibold text-fit-dim transition hover:border-fit-accent hover:text-fit-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fit-accent"
    >
      Ansicht: {current.shortName} · Zu {next.shortName} wechseln
    </button>
  )
}
