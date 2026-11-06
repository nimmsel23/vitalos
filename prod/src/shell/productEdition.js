const EDITIONS = Object.freeze({
  core: Object.freeze({ id: 'core', name: 'VitalOS', shortName: 'VitalOS', tagline: 'Dein persönliches Betriebssystem.' }),
  store: Object.freeze({ id: 'store', name: 'VitalOS', shortName: 'VitalOS', tagline: 'Wahrnehmen. Reflektieren. Handeln.' }),
  observe: Object.freeze({ id: 'observe', name: 'VitalOS Observe', shortName: 'Observe', tagline: 'Wahrnehmen. Festhalten. In deinem Tempo.' }),
  operate: Object.freeze({ id: 'operate', name: 'VitalOS Operate', shortName: 'Operate', tagline: 'Aus Klarheit wird Handlung.' }),
})

export function getProductEdition(value = 'core') {
  return EDITIONS[value] || EDITIONS.core
}

export function getEditionEntryTab(value = 'core') {
  return value === 'observe' || value === 'operate' ? 'habits' : 'home'
}

export function getRuntimeEdition(buildEdition = 'core', savedEdition = null) {
  if (buildEdition !== 'store') return getProductEdition(buildEdition).id
  return savedEdition === 'operate' ? 'operate' : 'observe'
}

export const PRODUCT_EDITION = getProductEdition(import.meta.env?.VITE_VOS_EDITION)
