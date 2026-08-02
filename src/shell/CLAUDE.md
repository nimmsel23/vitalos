# shell/ — VitalOS App-Shell

SOT für alles was vitalos-spezifisch ist. Nichts hier wird aus Sub-Repos kopiert.

## Dateien

| Datei | Rolle |
|---|---|
| `VitalOSApps.js` | App-Registry (`VOS_APPS`) — welche Tempel existieren |
| `NavigationItems.js` | Tab-Registry (`NAV_ITEMS`, `SUB_NAV`, `VALID_TABS`) |
| `AppGate.jsx` | Auth-Gate — entscheidet ob Login oder App |
| `Hub.jsx` | Landing-Screen (Tab `'hub'`, Default) — Tempel-Kachelgrid mit Live-Stats pro Tempel, KEIN Fitness-Dashboard |
| `themes.js` | Theme-Registry SSOT (`DARK_THEMES`/`LIGHT_THEMES`/`THEMES`, nur `bg`+`accent`) — jedes CSS-Theme aus `src/styles/themes/*.css` muss hier registriert sein, sonst im Picker unsichtbar |

**Hub.jsx ist NICHT das Fitness-Dashboard** (Verwechslungsgefahr historisch:
`shell/Dashboard.jsx` bündelte früher 1:1 `src/fitness/Dashboard.jsx` +
`FuelDashboardWidget` und wurde nie wirklich gerendert — der `@view/dashboard`-
Alias war seit einer Umstellung tot, siehe Git-Historie. Entfernt 2026-08-02:
`Hub.jsx` ist der einzige Landing-Screen, zeigt pro Tempel eine Kachel +
optionalen Live-Stat (`FuelHubStat.jsx`, `useFitnessStat`/`useRelaxStat` inline
in `Hub.jsx`) und navigiert in den jeweiligen `*App.jsx`-Tab. Journal/Habits/
Learn haben bewusst keinen Stat — die lokalen Datenpfade dafür sind unklar
(`@habits-db` z. B. importiert hart `@fitness-db/index.firestore.js`, auch im
Coach/Local-Build) und sollten nicht blind auf dem Landing-Screen verdrahtet
werden. `src/fitness/Dashboard.jsx` (Widgets: Header, Heatmap, MuscleBody,
MuscleCoverage, SessionStatus, WeightChart) bleibt das reine Fitness-Tab-
Dashboard, erreichbar nur innerhalb des Fitness-Tabs (`FitnessApp.jsx`
SUB_NAV `dash`), nicht mehr auf dem Hub.

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

## Settings/ (Setup-Tab)

Eigenständiger Setup-Tab — vitalos SSOT. Shell-eigene Sektionen:
`Account · Profile · Notifications · Appearance · Fuel · LocalDev · Advanced` + Kompositor `index.jsx`.

Importierte Domain-Sektionen (einzige Sub-Repo-Anteile):
- `TrainingSection` ← `@fitness/src/views/Settings/TrainingSection.jsx` (Split, Zyklus, Location)
- `FuelSection` ist shell-eigenes UI über `@fuel/store.js` (Tagesziele)

`LocalDevSection.jsx` = coach-only (Port-Checks, Sync-Trigger) — wird im Firebase-Build nicht angezeigt.

**INVARIANTE (2026-07-16):** Im Shell-Betrieb darf KEINE App einen eigenen
Setup-/Settings-Einstieg haben, der über app-spezifische Funktionen hinausgeht.
Generisches (Account/Auth, Theme, SW-Update, Profil, Layout, Diagnose) lebt
ausschließlich im VitalOS-Setup-Tab. Deshalb: kein `settings`-Eintrag in
`SUB_NAV`, RelaxApp/FuelWrapper routen die Settings-Views der Sub-Repos nicht.
App-spezifische Settings-Modals (z. B. Journal: Darstellung/Telegram) sind ok.

## Regel

Neue Shell-Komponente hier anlegen nur wenn sie wirklich vitalos-übergreifend ist (Navigation, Auth, Layout). Sub-Repo-spezifisches → im Sub-Repo lassen, via `@view/*` Alias einbinden.
