# VitalOS Shell

VitalOS ist die übergreifende App-Shell die alle VOS-Module (fitness-dev, fuel-dev, journal-dev, habits-dev, learn-dev) zusammenhält.

**Port Dev:** 9190 (`npm run dev`)
**Build:** `npm run build` (local) / `npm run build -- --mode firebase` (Firebase PWA)

---

## src/ Struktur

`src/` ist der shared Layer — er kennt alle Sub-Repos und hält sie zusammen.

```
vitalos/src/
├── coach/              ← lokale DB + API (kein Firebase-Import)
│   ├── db.js           → re-exportiert @fitness-db + @journal + @habits
│   └── api.js
├── cloud/              ← Firebase only (kein lokaler Code)
│   ├── db.firestore.js
│   └── firebase.js
├── shell/              ← vitalorisierte App-Shell (SSOT)
│   ├── layout/         Navigation, Sidebar, MobileShell
│   ├── Settings/       Settings-Tab (vitalos-eigener SOT)
│   ├── Dashboard.jsx
│   ├── *App.jsx        Pro Sub-Repo ein App-Wrapper
│   └── VitalOSApps.js  Tab-Registry
├── components/         vitalos-eigene UI (WeightChart, common/)
├── lib → (symlink)     → fitness-dev/src/lib (via @lib Alias)
├── App.jsx             React Entry + Auth-Gate
├── main.jsx
└── styles.css
```

Kein `src/shared/` Unterordner nötig — `src/` selbst ist der shared Layer.

---

## Build-Mode Trennung: coach vs. firebase

`@db` Alias wählt per Build-Mode:
- **local** (`npm run build`): `@db` → `src/coach/db.js` — kein Firebase-SDK im Bundle
- **firebase** (`--mode firebase`): `@db` → `src/cloud/db.firestore.js` — kein lokaler Code

```js
// vite.config.js
'@db': resolve(VITALOS_SRC, isFirebase ? 'cloud/db.firestore.js' : 'coach/db.js')
```

Identisches Muster wie fitness-dev (`db.js` vs. `db.firestore.js`) und fuel-dev (`api.local.js` vs. `api.cloud.js`).

---

## Vite Alias Map

| Alias | Zeigt auf | Herkunft |
|---|---|---|
| `@db` | `src/coach/db.js` oder `src/cloud/db.firestore.js` | build-time swap |
| `@shell` | `src/shell/` | vitalos |
| `@coach` | `src/coach/` | vitalos |
| `@cloud` | `src/cloud/` | vitalos |
| `@lib` | `fitness-dev/src/lib/` | fitness-dev |
| `@utils` | `fitness-dev/src/lib/utils.js` | fitness-dev |
| `@components` | `fitness-dev/src/components/` | fitness-dev |
| `@constants` | `fitness-dev/src/constants/` | fitness-dev |
| `@fitness-db` | `fitness-dev/src/lib/db/` | fitness-dev |
| `@fitness` | `fitness-dev/` | fitness-dev |
| `@habits` | `habits-dev/src/` | habits-dev |
| `@journal` | `journal-dev/src/` | journal-dev |
| `@learn` | `learn-dev/src/` | learn-dev |
| `@fuel` | `fuel-dev/src/client/` | fuel-dev |
| `@view/*` | je Tab-Herkunft | siehe vite.config |
| `@firebase-config` | `firebase.config.js` | vitalos root |

---

## Git Submodules

Alle Sub-Repos sind als Git Submodules eingebunden:

| Submodule | Remote | Typ |
|---|---|---|
| `fitness-dev` | `git@github.com:nimmsel23/fitness-dev.git` | GitHub (remote) |
| `fuel-dev` | `git@github.com:nimmsel23/fuel-dev.git` | GitHub (remote) |
| `journal-dev` | `/home/alpha/journal-dev` | lokal |
| `habits-dev` | `/home/alpha/habits-dev` | lokal |
| `learn-dev` | `/home/alpha/learn-dev` | lokal |

```bash
git submodule update --init          # alle initialisieren
git submodule update --remote        # alle auf neuesten Stand bringen
git submodule update --remote fitness-dev   # einzelnes updaten
```

Änderungen in einem Submodule → dort committen, dann in vitalos den neuen Commit-Pointer committen.

---

## Hidden Chambers (Sub-Repos)

| Modul | Pfad | Standalone Port | Rolle |
|---|---|---|---|
| habits-dev | `@habits` | 9002 | Tägliche Gewohnheiten |
| journal-dev | `@journal` | — | Journal + Fuel-Tabs |
| learn-dev | `@learn` | — | Fitness-Wissen |

Die Tempel (fitness-dev, fuel-dev) haben eigene Backends und sind eigenständig deployed. VitalOS embeddet sie via Aliases, ohne Code zu duplizieren.

---

## Wichtige Regeln

- **Kein Doppel-Code.** Alles was in fitness-dev / fuel-dev / habits-dev existiert wird via Alias importiert, nicht kopiert.
- **`src/shell/` ist SSOT** für Navigation, Settings, Sidebar — nicht fitness-dev.
- **`src/components/`** nur für vitalos-eigene UI (WeightChart, UserProfile, ErrorBoundary). fitness-dev Components → via `@components`.
- Vor Edits in shell/: prüfen ob Komponente wirklich vitalos-spezifisch ist oder aus einem Sub-Repo kommen sollte.
