import { NAV_ITEMS as fitnessNav } from '@fitness/constants/NavigationItems.js'

// Shell IDs and standalone hashes differ for nested Fitness views.
export function getAppDestinations(app) {
  if (app === 'fitness') {
    return fitnessNav.filter(({ id }) => ['session', 'review', 'learn'].includes(id)).flatMap(({ id, label, sub = [] }) => [
      { label, subTab: id, href: `https://fitness-vos.web.app/#${id}` },
      ...sub.map((item) => ({ label: `${label} · ${item.label}`, subTab: item.id, href: `https://fitness-vos.web.app/#${id}/${item.id}` })),
    ])
  }
  if (app === 'fuel') {
    // Link metadata only: importing Fuel's lazy view registry into Journal
    // would also bundle Fuel views and their app-specific API aliases.
    return [['log', 'Log'], ['food', 'Food'], ['recipes', 'Rezepte'], ['catalog', 'Katalog'], ['history', 'Historie'], ['report', 'Protokoll'], ['supplements', 'Supplements'], ['micros', 'Mikros']].map(([key, label]) => ({
      label, subTab: key, href: `https://fuel-vos.web.app/#${key}`,
    }))
  }
  if (app === 'relax') {
    return [['dash', 'Heute'], ['session', 'Session'], ['stats', 'Statistik'], ['physio', 'Physio'], ['catalog', 'Katalog']].map(([subTab, label]) => ({
      label, subTab, href: `https://relax-vos.web.app/#${subTab}`,
    }))
  }
  if (app === 'journal') {
    return [
      { label: 'Journal', subTab: null },
      ...[['tag', 'Tag'], ['woche', 'Woche'], ['monat', 'Monat'], ['habits', 'Habits']].map(([mode, label]) => ({ label: `Journal v2 · ${label}`, href: `https://vos-journal.web.app/#v2/${mode}` })),
      ...['potential', 'plan', 'production', 'profit'].map((mode) => ({ label: `Door · ${mode[0].toUpperCase()}${mode.slice(1)}`, href: `https://vos-door.web.app/#door2/${mode}` })),
      ...['frame', 'freedom', 'focus', 'fire'].map((mode) => ({ label: `Game · ${mode[0].toUpperCase()}${mode.slice(1)}`, href: `https://vos-game.web.app/#${mode}` })),
      { label: 'Voice', href: 'https://vos-voice.web.app/#voice' },
      { label: "General’s Tent", href: 'https://vos-tent.web.app/#tent2' },
    ]
  }
  return []
}
