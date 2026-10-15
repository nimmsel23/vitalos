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
| `MobileShell.jsx` | Mobile-Wrapper mit Bottom-Nav, reserviert unten Platz für Tab-Bar + Home-Indicator |
| `MobileNav.jsx` | iOS-Tab-Bar: 5 feste Slots (Home · Fitness · Fuel · Relax · Mehr). Aktiven Tab nochmal tippen → Sheet mit Unterbereichen und zusätzlichem Standalone-Link (neuer Tab, URLs in `NavigationItems.js`); Home nochmal tippen → Hub an/aus |
| `FuelMobileLayout.jsx` | Fuel-spezifisches Mobile-Layout |

Die Bottom-Nav lässt sich auf der Leiste nach unten einklappen und über den
sichtbaren Griff nach oben aufziehen. Tippen auf den Griff schaltet ebenfalls
um. Beim Einklappen schließen offene Nav-Menüs; ausgeblendete Tabs sind nicht
fokussierbar. `MobileShell` passt den Inhaltsabstand über `--mobile-nav-height`
an; Griff und Home-Indicator bleiben frei. Die Geste gehört zur Shell und
ändert nicht den gemeinsamen `useSwipeToDismiss`-Hook der App-Sheets.

## Settings/ (Setup-Tab)

Eigenständiger Setup-Tab — vitalos SSOT. Shell-eigene Sektionen:
`Account · Profile · Notifications · Appearance · Fuel · LocalDev · Advanced` + Kompositor `index.jsx`.

Der Shell-Setup-Tab ersetzt im VitalOS-Betrieb die Setup-/Settings-Einstiege
der Subapps. Deshalb sind Shell-eigene Settings-Komponenten und Adapter hier
absichtlich erlaubt, auch wenn sie Domain-Controls wie Fitness-Notifications
bedienen. Wichtig ist die Grenze: VitalOS pflegt die Shell-Oberfläche und die
Shell-spezifische `@db`-Adapter-Schicht; die Fachlogik/Views der Fitness-App
bleiben im `fitness-app`-Submodule und werden nicht als stale Kopie nachgebaut.

Importierte Domain-Sektionen (einzige Sub-Repo-Anteile):
- `TrainingSection` ← `@view/fitness-settings/TrainingSection.jsx` (Split, Zyklus, Location)
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

## Ping-Pong-Fix (2026-08-22)

Der ausschlaggebende Grund für das mobile Tab-`Ping-Pong` bei Fuel/Relax war
nicht ein einzelner Hash-Bug, sondern zwei gleichzeitig aktive Sync-Quellen:

1. `App.jsx` mountete mobil zeitweise mehr als eine Shell-View gleichzeitig
   (Desktop-/Mobile-Pfad nur per CSS verborgen statt wirklich exklusiv
   gerendert). Dadurch konnten mehrere `Views`/Wrapper parallel auf denselben
   Shell-State reagieren.
2. `FuelWrapper.jsx` und `RelaxApp.jsx` spiegelten einen gerade von der Shell
   gestarteten Subtab-Wechsel sofort wieder zurück via `onSubTab(...)`, bevor
   der Zieltab stabil angekommen war. Das erzeugte das sichtbare Hin-und-Her.

Der wirksame Fix war deshalb:
- in `App.jsx` nur **eine** aktive Mobile-/Desktop-Shell-Instanz rendern
  (`matchMedia`-gesteuert, nicht nur `hidden lg:block`)
- in `FuelWrapper.jsx` und `RelaxApp.jsx` Shell-getriebene Tabwechsel per
  `shellSyncTargetRef` als laufende Synchronisation behandeln und in dieser
  Phase **kein** Echo zurück an die Shell schicken

Kurz: das Problem war eine doppelte Navigation-Synchronisation, nicht einfach
„zu viel Hashing“.

## Mobile-Redesign (2026-10-11)

Ziel: iOS-native Optik statt „alles UPPERCASE + font-black + tracking“.

- **Design-Primitives** in `src/styles.css` (`.vos-bar`, `.vos-surface`,
  `.vos-fill`, `.vos-eyebrow`, `.vos-press`, `.vos-sheet`, Hairlines,
  Sheet-Animationen). Transparenzen IMMER über `color-mix()` — die
  `fit-*`-Tailwind-Farben sind reine `var()`-Werte ohne `<alpha-value>`,
  `bg-fit-card/90` erzeugt deshalb gar nichts (war der Grund für die
  durchsichtige alte Bottom-Bar).
- **Safe-Area:** nicht mehr global als Padding auf `.app-shell/main/
  .mobile-shell` (war verschachtelt → bis zu 3× Inset). Oben konsumiert der
  `ShellHeader` (compact) `--safe-top`, unten `MobileShell`/Tab-Bar
  `--safe-bottom` + `--tabbar-h`.
- **Keine globale 44px-Mindestgröße** mehr für `button/a/input` — hat
  Wochenleiste und Icon-Chips gesprengt. Bei Bedarf `.tap-target`.
- **`ShellHeader`** hat zwei Komponenten: `CompactHeader` (mobil: Sticky-
  Leiste Titel + Datums-Pill mit nativem Datepicker, Wochenleiste mit
  Aktivitäts-Punkten, Sub-Tabs als Pills, kompakte Fuel-Summe) und
  `DesktopHeader` (unverändert). Setup/Coach/6Pack zeigen kein Datum.
- **Themes:** neues Default `vital` (dunkel) / `vital-light`. `App.jsx`
  migriert einmalig (`vitalos-redesign-2026-10`) vom alten Default
  `nordic` → `vital`; bewusst gewählte Themes bleiben.
- **Theme-Bug behoben:** `src/contexts/SettingsContext.jsx` (Legacy, aus
  `main.jsx` gemountet) setzte `data-theme` aus `fitness-theme` und
  überschrieb als Eltern-Effect die Shell-Wahl bei jedem Laden. Entfernt —
  niemand hat den Context konsumiert.
- `App.jsx` setzt `<meta name="theme-color">` auf den `--bg` des Themes
  (iOS-Statusleiste passt sich an).

## Swipe-to-dismiss (2026-10-11)

Alle Bottom-Sheets schließen per Wisch nach unten. SSOT ist
`fitness-app/src/hooks/useSwipeToDismiss.js`, importiert als
`@fitness/hooks/useSwipeToDismiss.js` (Alias in `packages/cross-app-aliases`
+ Fallback-Aliase in habit-app/fuel-app `vite.config.cjs`). relax-app hat
eine lokale Kopie (standalone, kein `@fitness`-Alias).

Nutzung: `const ref = useSwipeToDismiss(onClose, { enabled, backdropRef, media })`
→ `ref` aufs Sheet-Element. Drag startet nur, wenn der scrollbare Inhalt
unter dem Finger oben steht; horizontale Gesten und Inputs
(`input/textarea/select/[data-no-swipe]`) bleiben unberührt. `media` begrenzt
die Geste z. B. auf Mobile, wenn das Sheet auf Desktop ein Modal/Drawer ist.
Eingebaut: Hub-/Fitness-Gate-Sheet, Tab-Bar-Sheets, Übungs-Detail,
Session-Gate, Session-Sidebar, Habit-Sidebar, Fuel-TapBoard, Relax-Substanz-Detail.
