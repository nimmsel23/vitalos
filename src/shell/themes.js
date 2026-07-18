/**
 * Shell-Themes — SSOT für Theme-Metadaten (bg/accent je Theme).
 *
 * Die CSS-Definitionen liegen in `src/styles/themes/*.css` (40 Dateien).
 * Diese Liste ist die Registrierung, die Appearance-Settings zum Rendern
 * des Theme-Pickers braucht — jedes CSS-Theme muss hier eingetragen sein,
 * sonst ist es im Picker unsichtbar (DARK_THEMES/LIGHT_THEMES.filter()).
 */

export const DARK_THEMES = [
  'nordic', 'nordic-darker', 'nordic-bluish',
  'dracula', 'dracula-purple',
  'kanagawa', 'everforest', 'oxocarbon',
  'midnight', 'matrix', 'forest', 'crimson',
  'frappe', 'macchiato', 'mocha',
  'gruvbox', 'solarized-dark',
  'ant-dark', 'materia', 'arc-dark',
  'homunculus', 'nothing',
  'slate', 'zinc', 'sweet', 'sweet-amber-blue', 'sweet-mars', 'sweet-purple',
];

export const LIGHT_THEMES = [
  'honey', 'paper', 'latte', 'solarized', 'arc', 'ant', 'alucard',
  'cyan', 'gold', 'mint', 'rose', 'snow',
];

export const THEMES = {
  // Dark
  nordic:             { bg: '#2e3440', accent: '#88c0d0' },
  'nordic-darker':    { bg: '#1d212a', accent: '#88c0d0' },
  'nordic-bluish':    { bg: '#2e3440', accent: '#81a1c1' },
  dracula:            { bg: '#1e1f29', accent: '#bd93f9' },
  'dracula-purple':   { bg: '#1a1526', accent: '#ff79c6' },
  kanagawa:           { bg: '#1f1f28', accent: '#e46876' },
  everforest:         { bg: '#272e33', accent: '#a7c080' },
  oxocarbon:          { bg: '#161616', accent: '#78a9ff' },
  midnight:           { bg: '#090b10', accent: '#3b82f6' },
  matrix:             { bg: '#000000', accent: '#00ff41' },
  forest:             { bg: '#1a2f23', accent: '#4ade80' },
  crimson:            { bg: '#1a0f12', accent: '#f43f5e' },
  frappe:             { bg: '#303446', accent: '#81c8be' },
  macchiato:          { bg: '#24273a', accent: '#8aadf4' },
  mocha:              { bg: '#1e1e2e', accent: '#cba6f7' },
  gruvbox:            { bg: '#282828', accent: '#fabd2f' },
  'solarized-dark':   { bg: '#002b36', accent: '#268bd2' },
  'ant-dark':         { bg: '#222e32', accent: '#9bbfbf' },
  materia:            { bg: '#1e1e1e', accent: '#8ab4f8' },
  'arc-dark':         { bg: '#2f3445', accent: '#5294e2' },
  homunculus:         { bg: '#18181b', accent: '#a16262' },
  nothing:            { bg: '#000000', accent: '#ff3333' },
  slate:              { bg: '#0f172a', accent: '#38bdf8' },
  zinc:               { bg: '#18181b', accent: '#a1a1aa' },
  sweet:              { bg: '#101013', accent: '#ff4081' },
  'sweet-amber-blue': { bg: '#090b10', accent: '#e8a020' },
  'sweet-mars':       { bg: '#2b1d1f', accent: '#ff5f5f' },
  'sweet-purple':     { bg: '#161925', accent: '#c50ed2' },

  // Light
  honey:              { bg: '#fdfaf0', accent: '#f59e0b' },
  paper:              { bg: '#f4efe6', accent: '#7c5c3a' },
  latte:              { bg: '#eff1f5', accent: '#7287fd' },
  solarized:          { bg: '#fdf6e3', accent: '#268bd2' },
  arc:                { bg: '#ffffff', accent: '#5294e2' },
  ant:                { bg: '#f0f2f5', accent: '#1677ff' },
  alucard:            { bg: '#fffbeb', accent: '#644ac9' },
  cyan:               { bg: '#ecfeff', accent: '#06b6d4' },
  gold:               { bg: '#fffbeb', accent: '#d97706' },
  mint:               { bg: '#f0fff4', accent: '#10b981' },
  rose:               { bg: '#fff1f2', accent: '#f43f5e' },
  snow:               { bg: '#ffffff', accent: '#3b82f6' },
};
