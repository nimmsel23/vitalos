import { NAV_ITEMS } from '../NavigationItems.js'
import { getProductEdition } from '../productEdition.js'

export default function ObserveNavigation({ tab, navigate, edition = 'observe' }) {
  const productEdition = getProductEdition(edition)
  return (
    <header className="observe-navigation">
      <a href="#home" className="observe-navigation__brand" onClick={(event) => { event.preventDefault(); navigate('home') }}>
        <span className="observe-navigation__mark" aria-hidden="true">V</span>
        <span><strong>{productEdition.shortName}</strong><small>Dein Alltag, wahrgenommen</small></span>
      </a>
      <nav aria-label="Bereiche">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button key={id} type="button" onClick={() => navigate(id)} aria-current={tab === id ? 'page' : undefined}>
            <Icon size={17} aria-hidden="true" />
            <span>{id === 'fuel' ? 'Nutrition' : label}</span>
          </button>
        ))}
      </nav>
      <span className="observe-navigation__note">Wahrnehmen · Festhalten · Verstehen</span>
    </header>
  )
}
