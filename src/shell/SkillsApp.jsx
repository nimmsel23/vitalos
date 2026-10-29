import { useState } from 'react'
import SkillsCard from '../../skills-app/SkillsCard.jsx'
import DesignHost from '../../skills-app/designs/DesignHost.jsx'
import DesignSwitcher from '../../skills-app/designs/DesignSwitcher.jsx'
import { DESIGNS, readDesign, saveDesign } from '../../skills-app/designs/index.js'
import { useProgress } from '../../skills-app/data/useProgress.js'
import '@vos-skills/skills.css'

export default function SkillsApp() {
  const [design, setDesign] = useState(readDesign)
  const { status, pending, user, error, storageWarning } = useProgress()
  const variant = DESIGNS.find((item) => item.id === design)

  function changeDesign(id) {
    saveDesign(id)
    setDesign(id)
    window.scrollTo(0, 0)
  }

  return (
    <main data-theme="skills" className="relative min-h-[100dvh] overflow-y-auto px-4 py-4 text-fit-ink">
      {variant
        ? <DesignHost key={variant.id} design={variant} />
        : <div className="mx-auto max-w-xl"><SkillsCard /></div>}
      <div className="mx-auto max-w-xl px-2 py-4 text-xs" role="status" aria-live="polite">
        {status}{pending > 0 && user ? ` · ${pending} ausstehend` : ''}
        {(error || storageWarning) && <p role="alert" className="mt-2">{error || storageWarning}</p>}
      </div>
      <DesignSwitcher value={design} onChange={changeDesign} />
    </main>
  )
}
