// CSS-Variablen für die definite Höhe des 6Pack-Rahmens in der Shell.
// topPx ist der Abstand der Rahmenoberkante zum Viewport (Safe-Area oben
// steckt darin, sobald Header oder der Shell-Abstandshalter sie verbrauchen).
// nav ist der berechnete Wert von --mobile-nav-height (Tab-Leiste plus
// safe-area-inset-bottom) oder leer ausserhalb der mobilen Shell.

export function sixpackFrameVars(topPx, nav) {
  const top = Number.isFinite(topPx) ? Math.max(0, Math.round(topPx)) : 0
  const trimmed = typeof nav === 'string' ? nav.trim() : ''
  return {
    '--sixpack-top': `${top}px`,
    '--sixpack-nav': trimmed || '0px',
  }
}
