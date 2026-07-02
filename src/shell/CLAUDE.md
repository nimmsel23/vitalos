# shell/ — VitalOS App-Shell

SOT für alles was vitalos-spezifisch ist. Nichts hier wird aus Sub-Repos kopiert.

## Dateien

| Datei | Rolle |
|---|---|
| `VitalOSApps.js` | App-Registry (`VOS_APPS`) — welche Tempel existieren |
| `NavigationItems.js` | Tab-Registry (`NAV_ITEMS`, `SUB_NAV`, `VALID_TABS`) |
| `AppGate.jsx` | Auth-Gate — entscheidet ob Login oder App |
| `Hub.jsx` | Haupt-Router — dispatcht auf *App.jsx je aktivem Tab |
| `Dashboard.jsx` | Einstiegs-Dashboard (`@view/dashboard`) |

## App-Wrapper Pattern

Pro Sub-Repo ein `*App.jsx` + `*Shell.jsx`:
- `FitnessApp.jsx` — mounted fitness-dev Views, kennt fitness-dev Routing
- `FuelApp.jsx` / `FuelShell.jsx` — mounted fuel-dev, inkl. coach-only Tabs
- `JournalApp.jsx` / `JournalTab.jsx` — journal-dev embedded
- `HabitsApp.jsx` — habits-dev embedded
- `LearnApp.jsx` — learn-dev embedded

Der `*Shell.jsx` ist für die Layout-Ebene (Sidebar, MobileShell), der `*App.jsx` für den Tab-Content.

## layout/

| Datei | Rolle |
|---|---|
| `Sidebar.jsx` / `VitalOSSidebar.jsx` | Desktop-Navigation |
| `MobileShell.jsx` | Mobile-Wrapper mit Bottom-Nav |
| `MobileNav.jsx` | Bottom-Navigation Bar |
| `FuelMobileLayout.jsx` | Fuel-spezifisches Mobile-Layout |

## Settings/

Eigenständiger Settings-Tab — vitalos SSOT. Sektionen:
`Account · Profile · Appearance · Training · Fuel · LocalDev · Advanced`

`LocalDevSection.jsx` = coach-only (Port-Checks, Sync-Trigger) — wird im Firebase-Build nicht angezeigt.

## Regel

Neue Shell-Komponente hier anlegen nur wenn sie wirklich vitalos-übergreifend ist (Navigation, Auth, Layout). Sub-Repo-spezifisches → im Sub-Repo lassen, via `@view/*` Alias einbinden.
