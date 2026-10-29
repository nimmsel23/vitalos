## 2026-10-29 — Branch-Schutz auf master (App-Repos + Meta-Repo), Lockfile-Fix für relax-app

Aus der Fortsetzung der Release-Weg-Session (Eintrag darunter): Auf die Frage nach einem sinnvollen Branch-Schutz wurde ein schlanker Schutz für `master` eingerichtet, der den automatischen Release-Weg (PR → `check` → Auto-Merge → Deploy) nicht blockiert. Zusätzlich korrigierte der Pre-Commit-Hook beim Doku-Commit das Root-Lockfile. Alles liegt gepusht auf `master` (zuletzt `b67893d`); der Shell-Deploy dazu lief grün.

- **GitHub-Branch-Schutz `master` (per `gh api -X PUT …/branches/master/protection`, kein Repo-Commit):** In den neun App-Repos (journal, fuel, habits, learn, relax, plan, 6pack, skills, fitness) ist der Required Check `check` gesetzt (Job-Name; „Check (<App>)“ ist nur der Workflow-Name), Force-Push und Löschen gesperrt, keine Pflicht-Reviews, `enforce_admins` aus (Hotfix-Push des Owners bleibt möglich), `strict` aus (sonst käme der Auto-Merge wegen der Merge-Commit-Lücke von `dev` nie durch), keine Linear-History-Pflicht. Im Meta-Repo `vitalos` ist `master` nur gegen Force-Push und Löschen gesperrt, weil `vos-release` den Pointer-Bump direkt pusht. `dev` und die `vitalos`-Branches der App-Repos bleiben ohne Schutz.
- **`docs/DEPLOYMENT.md` (`2fb84ae`):** neuer Abschnitt „Branch-Schutz (seit 2026-10-29)“ mit den Einstellungen, dem Testlauf und der Rücknahme (`gh api -X DELETE repos/nimmsel23/<repo>/branches/master/protection`); der Punkt „Branch-Schutz fehlt“ unter „Noch offen“ ist durchgestrichen.
- **`pnpm-lock.yaml`, Pointer `relax-app` (`b67893d`):** `relax-app` braucht `better-sqlite3` nicht mehr; das Lockfile enthielt es noch, `--frozen-lockfile` im Shell-Build wäre gescheitert. `bin/vos-sync-submodule-pointers` (Pre-Commit-Hook) hat das Lockfile nachgezogen und dabei den `relax-app`-Pointer von `3daa8cc` auf `0d43599` gesetzt (Merge von relax PR #1, liegt auf `master` und `vitalos`). Der lokale Commit `c5c8705` wich vom bereits gepushten `2fb84ae` ab und wurde per `reset --soft origin/master` als eigener Commit neu aufgesetzt (kein Force-Push).
- **Getestet:** Der PR-Weg unter Schutz lief mit skills PR #5 (Check grün → Auto-Merge → `Live Deploy (Skills master)` grün); die anderen acht Repos wurden nicht einzeln durchgespielt. `Deploy VitalOS Shell` zu `b67893d` ist grün. Im Browser angesehen wurde nichts.

---

## 2026-10-29 — Release-Weg dev → master → vitalos: Standalone-Prod per CI, Shell nur Promotion, Nesting ausgebaut

Aus einer langen Shell-/Release-Session (Fortsetzung des Eintrags darunter): Nach einem Sammel-Release liefen sechs Deploys rot, danach wurde der Deploy-Weg im Meta-Repo grundlegend umgebaut. Neues Modell: `dev` = Preview, `master` in jedem App-Repo = Standalone-Prod (nur per CI, lokal nicht nötig), `vitalos`-Branch + Pointer im Meta-Repo = Stand für die Shell (stable Prod). `plan`, `6pack` und `skills` hängen nicht mehr als verschachtelte Gitlinks in `fitness-dev`. Alles liegt gepusht auf `master` (zuletzt `99e74a4`), alle neun Live-Deploys und die Shell liefen grün. Im Browser angesehen wurde nichts.

- **`pnpm-lock.yaml` (`b74a028`), `bin/vos-release` (`d493d9b`):** Der Release `49a389f` nahm 8 Fuel-Commits mit, die `pino` in `fuel-app/package.json` ergänzten, aber nicht im Lockfile standen; `--frozen-lockfile` ließ Fitness, Fuel, Relax, Habits, Plan, VOS Fitness und die Shell scheitern. Lockfile nachgetragen, die fünf noch roten Deploys neu gestartet (alle grün). Ursache war, dass `vos-release` ein geändertes Lockfile nur lokal anpasste und nur warnte; der Check lief gegen den Arbeitsbaum und war deshalb grün. `vos-release` committet das Lockfile jetzt selbst mit.
- **`bin/vos-release` (`68c7ee0`, `57c9ae5`):** Skills, plan und 6pack sind normale Module (Sonderwege `planembed` und Skills-nur-mit-Fitness entfernt, `skills-app` im Parent-Filter). Der `--help`-Text führte wegen eines ungequoteten Heredocs Backtick-Befehle aus, jetzt gequotet. Danach Umbau zur reinen Shell-Promotion: holt `origin/master` per Fetch (lokaler `master` nicht nötig), merged in den `vitalos`-Branch des `-app`-Checkouts, bumpt die Pointer, pusht Meta-`master`. Preflight und Merge laufen im `-app`-Checkout, die `~/<x>-dev`-Klone müssen weder sauber noch auf `dev` stehen. Die Promotion lief einmal für alle neun Module durch (`a6b99a6`), konfliktfrei.
- **Verschachtelung ausgebaut (`1500307`):** `deploy-skills.yml` (Pfad und Trigger auf `skills-app`), `deploy-firestore-rules.yml` (Skills-Katalog-Seed), `vite.config.js` der Shell, `tailwind.config.cjs` und `vos-fitness/vite.config.cjs` zeigen auf `skills-app`/`plan-app`/`6pack-app` statt `fitness-app/{Skills,plan,6pack}`. In `fitness-dev` fielen die Gitlinks `plan`, `6pack`, `Skills` samt `.gitmodules` weg (alte Ordner in `~/.bak-nest-submodules/`, dort keine ungepushte Arbeit); der Resolver `vite-miniapp-submodules.mjs` nimmt Nachbar-Checkouts zuerst. Fitness, Shell, vos-fitness, Habits und Learn bauten lokal ohne die verschachtelten Ordner grün.
- **`.github/workflows/` → `workflows.disabled/` (`ba90b64`):** `deploy-{fitness,fuel,habits,journal,learn,plan,relax,skills}.yml` abgeschaltet (nicht gelöscht). Das Meta-Repo deployt nur noch Shell, Firestore-Rules, push-functions und `vos-fitness`; die App-Deploys laufen als `Live Deploy (<App> master)` in den App-Repos (aus dem früheren Meta-Workflow übernommen, checken das Meta-Repo wegen der Nachbar-Repos aus). `bin/vos-release-pr` gilt für alle neun Module und zielt auf `master`; Auto-Merge löst danach den Deploy per Dispatch aus.
- **`.github/actions/skills-submodule-auth/action.yml` (`a39409a`):** bricht ohne `SKILLS_DEPLOY_KEY` nicht mehr ab (`skills-dev` ist öffentlich); daran waren die Habits-/Learn-Checks und -Previews gescheitert, ebenso die neuen Master-Workflows.
- **`docs/DEPLOYMENT.md` (`302abbd`, `99e74a4`, neu):** Branch-Modell, die zwei Schritte (`vos-release-pr <modul>` für `dev` → `master`, `vos-release` für `master` → `vitalos`), Plan/6Pack/Skills ohne Gitlinks, Fehlerbilder, offene Punkte; ergänzt um den Changelog-Filter (Merge-Commits, Präfixe `docs`/`chore`/`ci`/`build`/`test`/`refactor` und reine Markdown-Änderungen zählen nicht, nur Änderungen unter `src/views`) und Hook-Tipps. Löst die Deploy-Beschreibung in `CLAUDE.md` für die App-Repos ab.
- **Pointer-Bumps:** `49a389f`, `a2c8036` (journal), `8fdfe0e` (habits), `0ec2a65`, `c57acaf`, `f3673d7` (`skills-app` von `acdbfd7` auf `31b32c5`, gleicher Stand wie der frühere verschachtelte Zeiger), `a6b99a6`. Zwei `mini-app-shell`-Commits aus dem Offline-first-Umbau (`935407c` Navigation cache-zuerst, harte Timeouts, kein Auto-Reload im Service Worker; `385712d` Background-Sync mit `X-Idempotency-Key` und Timeout) und `docs/CI-DEPLOY-PR-FLOW.md` (`61b97ec`) gingen dabei mit raus.
- **In den App-Repos (dort dokumentiert):** `master` aus dem `vitalos`-Stand in allen neun Repos angelegt und als Default gesetzt (bei relax und plan alte `master`-Historie per Merge erhalten, kein Force-Push); `check.yml`/`automerge.yml` auf `master` ausgerichtet; `AGENTS.md` mit Release-Weg-Abschnitt; `scripts/ensure-kb-data.mjs` in learn/habits (erzeugt die `*.generated.js` von `fitness-app` vor dem Build, behebt `Could not resolve "./push.generated.js"`); Changelog-Filter in allen neun Repos neu aus `@vos/mini-app-shell` vendored; Release-PRs aller neun Module über Auto-Merge nach `master`.
- **Getestet:** Der Weg PR → `Check` → Auto-Merge → Deploy-Dispatch lief zuerst mit `skills-dev` (PR #1), dann mit allen neun Modulen. Der Changelog-Filter ist nicht gegen echte Commits geprüft.

---

## 2026-10-29 — Coach-Tab-Wrapper, Fuel-Durchschnitt ohne leere Tage, Vite-Dev-Server schlanker, Door-v1-Pointer

Aus einer Shell-Session (Fortsetzung des Hub-Sheet-Eintrags vom 2026-10-28): Der Coach-Tab war ungestylt, die Fuel-Durchschnitts-Widgets rechneten leere Tage mit, und der Vite-Dev-Server (:9190) stürzte mit Heap-Überlauf (~2 GB) ab. Zusätzlich wurden die Pointer-Bumps für `journal-app` (Door v1 auf Google Tasks, Code in `~/journal-dev`) im Meta-Repo committet. Alles liegt gepusht auf `master`; im Browser angesehen wurde nichts davon, die Fuel-Berechnung nur einzeln mit Testdaten geprüft.

- **`src/shell/CoachApp.jsx` (neu), `src/App.jsx`, `src/shell/FitnessApp.jsx` (`c6d9fdf`):** Ursache des kaputten Coach-Tabs war das fehlende `coach-console.css` (fitness-dev hat es am 2026-09-23 aus der `styles.css` entfernt). Der Wrapper importiert `../../fitness-app/src/styles/coach-console.css` und rendert `<Coach>` in `<div className="coach-console rounded-2xl">`; beide Stellen importieren jetzt den Wrapper statt `@view/coach`. Gebaut von einem Subagenten.
- **`src/shell/fuelAverages.js` (neu), `src/shell/FuelDashboardWidget.jsx` (`8061b72`):** Wochen-/Monatsdurchschnitt teilt durch die Zahl der Tage mit Einträgen (Tag leer = kcal, Protein, Kohlenhydrate und Fett alle 0), ohne Eintrag im Zeitraum überall 0. Untertitel „5 von 7 Tagen mit Einträgen“, Fußzeile „Ø pro Tag mit Einträgen · leere Tage zählen nicht“. Die Auswertungen im Fuel-Repo (Report, Micros, `FirstMealTrend`) blieben unverändert.
- **`vite.config.js` (`a7cd6ce`, `0e47fc7`):** `server.watch.ignored` für `**/dev/**`, `**/.claude/**`, `**/dist*/**`, `**/dist-versions/**`, `**/.firebase/**`, `**/.worktrees/**` und `optimizeDeps.entries: ['index.html']`. Vorher beobachtete der Watcher über die `dev/`-Symlinks (auch in `.claude/worktrees/*`) ganze `~/*-dev`-Repos samt `node_modules` und der Dep-Scan crawlte rund 40 HTML-Dateien der Submodule. Nach dem Neustart lag der Server bei ~530 MB (Langzeitverhalten nicht gemessen). Nur Dev-Server betroffen, kein Build-Effekt.
- **`dev/` (`64dbfdf`):** die vier Symlinks (`fitness`, `fuel`, `klienten`, `relax`) und `dev/DAILY_STATE_ARCHITECTURE.md` (388 Zeilen, nur dort vorhanden) aus dem Meta-Repo entfernt; die Datei bleibt über die Historie abrufbar (`git show a7cd6ce:dev/DAILY_STATE_ARCHITECTURE.md`). Löschung der Symlinks hatte der Nutzer selbst von Hand ausgeführt.
- **Pointer `journal-app` (`73b3a53`, `d4f1ea1`, `2802f26`, `6e495e5`, `74c62da`):** Door v1 komplett auf Google Tasks (Potential, Plan über Listenreihenfolge, War Stacks, Production mit Datum und Wochen-Navigation, Profit als Notes) sowie Door-Erinnerungen für offene Daily Hits (Cloud Function `scheduledDoorReminders`, FCM, Service Worker). Der Code liegt in `~/journal-dev` (Branch `dev`, dort dokumentiert); hier nur die Pointer. `journal-dev` `dev`/`master` und `vitalos` stehen auf `4756336`.
- **Befund Changelog:** Der Shell-Changelog (`release-info.json`) wird pro Deploy nur aus `before..after` des letzten Pushes gebaut. Ein Folge-Push ohne Shell-/View-Änderung (Pointer-Bump aus anderer Session, drei Minuten nach `8061b72`) erzeugt `release = null` und überschreibt den Stand — deshalb war nach dem Hard-Reload kein Changelog zu sehen. Nicht geändert.
- **Release:** `git push origin master`; ein `dev`-Branch existiert im Meta-Repo nicht (nur in den Sub-Repos), deshalb kein Merge nach `dev`.

---

## 2026-10-28 — Hub-Sheet im Desktop: volle Breite, Fuel zweispaltig, Dev-Proxy-Fix

Aus einer Shell-Session: Das Hub-Sheet (`#hub`) nutzt im Desktop-Modus die Fensterbreite und ist ab `lg` ein Raster aus Hauptteil, Fitness und Fuel. Beim Testen zeigte der Dev-Server einen weißen Bildschirm; Ursache waren Proxy-Regeln in `vite.config.js`, nicht der Hub. Die fünf Commits liegen gepusht auf `master` (`21d490e..8010e9c`), „Deploy VitalOS Shell" ist grün. Das Layout wurde nur per Headless-Screenshot (1800 px) für die erste Stufe geprüft, die späteren Umbauten nicht im Browser angesehen.

- **`vite.config.js` (`0c1d462`):** Dev-Proxy-Keys wie `/fitness`, `/journal`, `/plan` passten per Präfix auch auf `/fitness-app/src/…` und `/journal-app/…` und leiteten Quelldateien ans Backend (`:9100`, dort lauscht nichts) → weißer Bildschirm. Regeln sind jetzt auf exakte Pfade verankert (`^/fitness(/|\?|$)`), Backend zeigt auf `:9150` (dokumentierter Dev-Port von `fitness-api`). Der erste Neustart des Dev-Servers war vorher mit Heap-Überlauf (2 GB) an der Proxy-Fehlerflut gestorben. Betrifft nur den Dev-Server.
- **`src/shell/Hub.jsx` (`35bcaea`):** Kopf, Kachelraster und Dashboard-Sektionen ab `lg` bis 1400 px statt 768 px; Mobil/Tablet unverändert. Die 5-Spalten-Reihe der Sekundär-Links (Habits, Door, Game, 6Pack, Setup) wurde später wieder zurückgenommen, weil die Hauptspalte schmal ist.
- **`src/shell/Hub.jsx`, `src/shell/Dashboard.jsx`, `src/App.jsx` (`1f03cad`, `d18b02a`, `8010e9c`):** Hub-Sheet über volle Fensterbreite (neues Prop `fullWidth` an `HomeSheet`, nur vom Hub genutzt; das Fitness-Gate behält sein Maximum von 1600 px). `FuelTodayCard` aus `DashboardSections` herausgezogen, `FitnessTodayWidget` exportiert. Endstand ab `lg`: links eine Spalte mit Hauptteil (Kacheln 2×2) und darunter Fitness gestapelt („Heute im Training" über „Aktivität & Konsistenz"), rechts Fuel über zwei Spalten. Unter `lg` weiter alles untereinander (Hauptteil, Fitness, Fuel). Zwischenstände (Fitness volle Breite darunter bzw. Fuel 30 rem rechts) wurden auf Wunsch des Users verworfen.
- **Release:** `git push origin master` (fünf eigene Commits, nichts Fremdes); „Deploy VitalOS Shell" (Run 40735321614) erfolgreich, nur Hosting.

---

## 2026-10-26 — mini-app-shell: reloadWindowMs durchgereicht, Lockfile nach Fuel-Standalone-Umbau

Aus einer fuel-dev-Session: Fuel (Töpfe, Küche, Standalone-Umbau ohne Nachbar-Repo-Imports) ging per `fuel-release` nach vitalos; hier im Meta-Repo sind dabei ein Lockfile-Fix, die Pointer-Bumps von `fuel-app` und eine bis dahin uncommittete Änderung am `mini-app-shell`-Paket gelandet. Fuel-interne Änderungen stehen in der Doku von `fuel-dev`. Nichts davon wurde im Browser angesehen.

- **`packages/mini-app-shell/stamp.mjs`, `test/shell.test.mjs` (`7704bcb`):** `stampApp`/`stampSplash` reichten bei der SW-Registrierung nur `expose` weiter; `register.reloadWindowMs` aus `mini-app.json` kommt jetzt bis ins Register-Snippet (`0` = nie automatisch neu laden, Default 10000). Die Änderung lag uncommittet im Arbeitsverzeichnis und war inhaltlich richtig; ergänzt wurde ein Test für Default, `0` und `4000` in beiden Funktionen (25 Paket-Tests grün).
- **`packages/mini-app-shell/README.md` (`635ea53`):** `reloadWindowMs` dokumentiert. Beide Commits sind auf `master` gepusht (der Pre-Push-Hook ließ `pnpm install` ohne Änderung laufen). Keine App setzt die Option bisher, das Laufzeitverhalten ändert sich also nicht.
- **`pnpm-lock.yaml`, `fuel-app` (`502481c`):** Fuel hat `@vos/cross-app-aliases` aus seiner `package.json` entfernt; das Lockfile verlor dafür die vier `optionalDependencies`-Zeilen im `fuel-app`-Block (`pnpm install --no-frozen-lockfile`). Der Lockfile-Check in `vos-release` hatte den `fuel-release` vorher abgebrochen. Der Commit enthält zusätzlich den Pointer-Bump `fuel-app` auf `1c6ff1f`, den der Pre-Commit-Hook mitgestaged hat.
- **Releases (`3638919`, `502481c`):** `fuel-release --yes` lief zweimal durch („vos release flow complete"); `dev` und `vitalos` in `fuel-app` stehen beide auf `1c6ff1f`. Die CI-Läufe „Deploy Fuel PWA" und „Deploy VitalOS Shell" zu `502481c` waren grün. Der Journal-Tab ist damit aus der Live-Fuel-App verschwunden (im Cloud-Build ohnehin ausgeblendet).

---

## 2026-10-25 — Door/Game in der Shell, Plan/Skills aus Submodulen, Plan-Release-Pfad

Aus einer Shell-Session: Die VitalOS-Shell hat jetzt Door (v1) und Game (inkl. Door v2) als Tabs mit Rechtsklick-Direktwahl, die Sidebar ist ausgeklappt wieder vertikal beschriftet, und Plan/Skills kommen aus `plan-app` bzw. dem neuen Submodul `skills-app`. Dazu ein Fix für den Plan-Tab in der fitness-app (`Gt() is undefined`) und ein neuer Plan-Pfad in `vos-release`. Alle Release-Deploys liefen grün (Skills PWA erst nach Neustart wegen 403 auf `api.github.com/meta`); keine Änderung wurde im Browser angesehen.

- **`src/shell/DoorApp.jsx`, `src/shell/GameApp.jsx`, `vite.config.js`, `NavigationItems.js`, `App.jsx` (`15c3823`, `fc87d0f`, `16043af`):** Door v1 als Tab `door`, Game v2 als Tab `game` (Fire/Focus/Freedom/Frame/Voice); Door v2 als Gruppe unter Game, Hash-Routen `#door/<phase>`, `#game/<map>`, `#game/door/<phase>`. `DoorApp` hat eigenen `QueryClientProvider`. Tabs in Sidebar, „Mehr"-Sheet und Hub; ein separater Door-v2-Tab wurde wieder entfernt.
- **Rechtsklick/Long-Press-Menü (`6d91551`):** Direktwahl der Phasen bzw. Maps in Sidebar und Hub (Menü-Taste, Shift+F10), gemeinsam über `MENU_APPS`; Sidebar zeigt Untereinträge des aktiven Tabs. Im „Mehr"-Sheet (Mobil) gibt es das Menü noch nicht.
- **Sidebar (`511feb8`):** Hauptnavigation ausgeklappt als vertikale Liste mit Icon und Beschriftung, eingeklappt Icon-Spalte.
- **journal-app (Submodul, `c33d621`, `237df7d`, `a68e73f`, dev-Merge `47654c6`):** `DoorView` mit optionalen Props `subTab`/`onSubTab`, `GameV2View`/`DoorV2View` mit Prop `embedded`; Journal-Trigger `+potential` und `+door` wirken wie `+hot` (`HOT_TAGS` in `hotFromJournal.js`). Im lokalen Coach-Build feuern die Tags nicht (Journal-Schicht aus `fitness-app`).
- **Changelog (`e6d8405`, `a6e3dd5`):** Option `shellPaths` in `packages/mini-app-shell` (`vos-release-info.mjs`, `vos-changelog-vite.mjs`), damit Shell-Commits unter `src/shell/**` und `src/App.jsx` im Changelog erscheinen. Ursache des leeren Changelogs war: nur `src/views/**` zählt, `refactor/chore/docs/ci/build/test` werden gefiltert, und jeder Deploy ersetzt den Changelog durch den des letzten Pushes.
- **`skills-app` + Resolver `miniAppSubmodules` (`57f4798`):** neues Submodul auf `skills-dev` (Branch `fitness`, `acdbfd7`, `ignore = untracked`); der Resolver ersetzt `planSubmoduleFallback`, biegt `fitness-app/src/views/Plan` auf `plan-app` und `…/Skills` auf `skills-app` um und leitet Importe aus dem Plan-Gerüst auf das Gegenstück in `fitness-app` zurück (sonst zwei `UserContext`-Instanzen). Push-Hook der Shell (`src/hooks/usePushNotifications.js`) wird für `PushOptIn` genutzt.
- **`fitness-app/vite.config.js` (`2f6dd75`):** `miniAppSubmodulePlugin` leitet Importe aus `plan/src/{contexts,lib,hooks,components}` auf `fitness-app/src/…` um — behebt den Plan-Tab-Fehler `Gt() is undefined` auf `fitness-aos.web.app` (zweiter `UserContext` ohne Provider).
- **Plan-Submodul der fitness-app (`9c3ba60`):** folgt jetzt `plan-dev` Branch `fitness` (`.gitmodules` `branch = fitness`, Pin `dc94345` = `origin/dev` in `fitness` gemerged); in `plan-dev` wurde `fitness` zurück in `dev` gemerged (`e620036`), damit Fast-Forward `dev → fitness` wieder geht.
- **`bin/vos-release` (`6082eae`):** `embed_preflight`/`embed_release` für Skills und Plan parametrisiert; neues internes Pseudo-Modul `planembed` (nicht in der Auswahl), `vos-release plan` zieht `plan-dev origin/fitness` per Fast-Forward nach und bumpt `fitness-app/plan`. Dry-Run sauber, dann real gelaufen (`vos-release plan`, `fitness-release --yes`).
- **`pnpm-lock.yaml` (`52ef757`, `62e01ae`):** an `journal-dev`- bzw. `fitness-dev`-`package.json` (Capacitor-Deps) angepasst, damit die Releases durchlaufen.
- **Releases:** `journal-release --yes` und `vos-release` für fitness/plan haben gepusht; Shell-, Journal-, Fitness-, VOS-Fitness-, Skills-PWA-Deploys grün, `vos-plan.web.app` deployt. Die Site `vos.web.app` existiert im Projekt `fitness-aos` nicht (nichts angelegt).

---

## 2026-10-23 — Journal-Rules als Modul, Lockfile-Check und Build-Fixes (Fitness/VOS-Fitness)

Aus einer journal-dev-Session: Die Firestore-Rules für `journal/{uid}/**` liegen jetzt als Modul-Fragment im Journal-Repo und werden von vitalos eingebettet. Dazu CI-Reparaturen (Lockfile, Solo-Stub, VOS-Fitness-Plan-Imports). Rules-Deploy per `workflow_dispatch` wurde in dieser Session nicht ausgelöst; Browser-/Handy-Test der TaskChampion-Config steht aus.

- **`scripts/build-rules.mjs` (`81714f8`):** bettet `journal-app/firestore.rules.part` in `firestore.rules` ein (Marker `// >>> module:` / `// <<< module`); `--check` prüft Aktualität (Exit 1 bei Abweichung). Rules inhaltlich unverändert, nur der Block ist umgezogen. Aktuell 2 Module eingebettet (journal, plan). In keinen Deploy-Schritt oder `package.json`-Script verdrahtet.
- **`pnpm-lock.yaml` (`52f9ab5`):** für `@firebase/rules-unit-testing` in `plan-app` nachgezogen; behebt `ERR_PNPM_OUTDATED_LOCKFILE` in Shell-/Journal-/Plan-/Fitness-Deploys. Nach dem Push waren Shell- und Plan-Deploy grün.
- **`bin/vos-release` (`fa5e0b8`):** neuer Lockfile-Check (`pnpm install --frozen-lockfile --lockfile-only`) vor `commit_parent_bumps`; bricht vor dem `master`-Push ab. Positivfall getestet (griff im echten `journal-release`-Lauf), Fehlerfall nicht erzwungen; im Dry-Run oder ohne `pnpm` übersprungen.
- **`fitness-app/vite.config.js` (`403e2f1`, Pointer `2bbfe77`):** Solo-Stub-Regel trifft nur noch den View-Einstieg (`index`), nicht mehr `Session/useTodayGateWatcher.js` (Fehler „not exported by src/solo-stub.jsx“ im `atlas`-Modus). Solo-Builds `training`/`atlas` und `pnpm run build` lokal grün; `Deploy Fitness PWA` grün.
- **`vos-fitness/vite.config.cjs` (`50d4259`):** Fallback für `planVersions.js` auf das Submodul `fitness-app/plan` (wie in der Shell-Config). Lokaler Build grün, `Deploy VOS Fitness PWA` grün.
- **Release:** `journal-release --yes` lief durch (`journal-app` `276a37c`, vitalos `fd97cc3`); `deploy:all` aus journal-dev (vom User gestartet) deployte alle sechs Journal-Hosting-Sites ohne Fehler.

---

## 2026-10-22 — Push-Functions und CI-Rechte reparieren

Die drei Reminder-Sender bekommen eindeutige Function-IDs und Firebase-Codebases (vitalos/fitness/journal). Ein eigener manueller CI-Workflow deployt alle oder einen gezielten Sender; Hosting bleibt unabhängig. Journal liest Push-Einstellungen aus dem tatsächlichen Pfad fitness/{uid}/settings/push statt einer nicht vorhandenen push-CollectionGroup. Der Regressionstest führt die echten Handler gegen isolierte SDK-/Firestore-Doubles aus und prüft, dass aktivierte fremde App-Lanes keinen Push auslösen. Bestehende 6Pack-Reminders und andere Fitness-Functions sind keine Deploy-Ziele.

Migration und eng begrenzte IAM-Reparatur: siehe docs/PUSH-FUNCTIONS.md. Der alte Journal-Scheduler wird vor dem Ersatz pausiert und erst nach bestätigtem Ersatz entfernt. Keine manuellen Testnachrichten an echte Benutzer.

Live verifiziert: CI-Lauf 39722742884 veröffentlicht Journal erfolgreich; Lauf 39722974187 veröffentlicht alle drei getrennten Sender erfolgreich. Alle drei Functions ACTIVE, Live-Quellen identisch mit Git, drei eigene aktivierte Scheduler/Topics. Legacy-Function, Job und Topic entfernt. Journal hat einen regulären Lauf mit Status ok abgeschlossen. CI erhält actAs gezielt auf Laufzeit- und tatsächlichem Cloud-Build-Konto sowie die minimale eigene Scheduler-Rolle. Fehlenden VitalOS-Collection-Group-Index ergänzt und im zentralen Index-Manifest festgehalten. Shell-CI und wiederholter Skills-Deploy erfolgreich.

Abschluss: VitalOS-Index READY. Reguläre Läufe von Journal (04:36 UTC), Fitness (04:41 UTC) und VitalOS (04:44 UTC) jeweils Status ok, ohne manuelle Testnachrichten.

## 2026-10-21 — Universeller Changelog in allen Apps

Gemeinsamen Vite-Plugin in Fitness, Fuel, Journal, Learn, Relax, Plan und Skills eingebunden; Habits/6Pack auf den aktuellen gemeinsamen Stand gebracht. Skills verwendet keine separate React-UpdateNotes-/Fetch-Lösung mehr. Mini-Apps erhalten eigene IDs/Namen. VOS Fitness verwendet die Release-Metadaten des tatsächlichen Fitness-Checkouts. Die Shell behält genau einen gebündelten Dialog mit allen eingebetteten App-Versionen. CI-Deploys umfassen auch Training/Atlas, vier Fuel-Mini-Apps und alle sechs Journal-Targets.

Stand vor Veröffentlichung: neun App-Builds erfolgreich; Journal origin/dev-Divergenz mit eigenständigem Build integriert und erneut geprüft. Browserprüfung bei 320px/390px bestätigt Standalone-Anzeige, Unterdrückung eingebetteter Dialoge, genau einen Shell-Dialog, gemeinsame Bestätigung, sicheren Text und Fokus. Fitness generiert auch die vom neuen Plan-Submodul benötigten KB-Daten; Learn findet dev- und app-Checkouts. Journal vendort die gemeinsamen Kontextmenüs für seinen eigenständigen Build.

## 2026-10-21 — Ein gemeinsamer Shell-Changelog

VitalOS sammelt die Änderungen von Shell und neun eingebundenen Apps,
einschließlich Skills, in einem Dialog mit Abschnitten und passenden
Repository-Links. Eine gemeinsame Release-ID berücksichtigt alle gebauten
Repo-Stände; vitalos:seen-release bestätigt den gesamten Stand. Der Shell-
Marker im HTML-Head und die Frame-Prüfung unterdrücken eigene App-Dialoge
im eingebetteten Betrieb. Standalone-Dialoge bleiben unabhängig. Leere
Submodule erben keine Parent-Git-Metadaten.

Geprüft: fünf isolierte Metadaten-/Plugin-Tests, bestehende Shell-Tests,
VitalOS-Firebase- und Habits-Client-Build, alle zehn Gruppen im Build-JSON,
Vendor-Parität. Browser bei 320/390px: ein Dialog, App-Links, gemeinsame
Bestätigung, Unterdrückung vor/nach Schließen und Standalone-Verhalten.
Kein Push/Deployment oder Pointer-Bump; bestehender 6pack-app-Stand erhalten.

## 2026-10-21 — Gemeinsamer VitalOS-Changelog

6Pack-Pilot in drei wiederverwendbare Module überführt: vos-changelog-screen.mjs,
vos-release-info.mjs und vos-changelog-vite.mjs unter packages/mini-app-shell.
Die Shell nutzt den Plugin direkt, Habits und 6Pack vendorte Kopien. CLI mit
vendor-changelog für eine minimale Standalone-Kopie ergänzt. App-spezifische
Browser-Bestätigung erst beim Schließen; nativer modaler Dialog, Text statt
HTML und HTTPS-Links. Release-Daten im jeweiligen Build eingebettet, GitHub-
Events nur bei passendem Repo/HEAD, sonst jüngste zehn Nicht-Merge-Commits.

Geprüft: gemeinsame Node-Tests, VitalOS-Firebase-Build, Habits in beiden Modi,
6Pack-Vite-Build und Vendor-Parität. Isolierter Browser bei 320/390px: erste/neue
Version, Bestätigung, Escape, Fokus, Links, Layout und blockierter localStorage.
Keine Veröffentlichung, keine Submodule-Pointer geändert; vorhandene Änderung
an 6pack-app unberührt.

## 2026-10-21 — Hub Fuel-Einstiege und App-Kontextmenüs

Fuel Tap Board, Shutter und Tagesfaden sind unter den Fuel-Karten im Home-Hub eingebettet; Klassisch öffnet Fuel. Der gemeinsame Hub-QueryClient aktualisiert Dashboard und Durchschnitte nach Logs. Die vier App-Buttons bieten ihre Unterbereiche per Rechtsklick, Long Tap, Menütaste oder Shift+F10 an. Gemeinsame Menü-/Tastaturbausteine in `packages/mini-app-shell/react/` werden auch von journal-dev v1 genutzt. Direkte Fitness-Ziele umgehen die Hub-Auswahl; Stärke führt zu Lernen. Pfeiltasten, Pos1/Ende, Buchstabensuche, Escape und Fokusrückgabe sind geprüft.

Validierung: VitalOS- und Journal-Firebase-Build erfolgreich; isolierte Browserprüfung bei exakt 320px und 390px für Rechtsklick, Tastatur, Long Tap, Scroll-Abbruch, Menüränder und alle drei Journal-Buttons bestanden. Kein Push/Deploy; journal-dev ist noch nicht in journal-app integriert. Bestehende 6Pack-Änderung bleibt unberührt.

## 2026-10-20 — Coach owns the client Shell

Removed direct `coach-app` gitlink, workspace/lockfile importer and Coach deployment workflow. Removed Coach from VitalOS release/pointer/overview inventories; compatibility `coach-release` delegates to Coach. Branch `coach` starts from this cleaned Shell. Existing unrelated submodule changes are excluded. Old Coach checkout retained locally under `~/coach-dev/.worktrees/legacy-vitalos-coach`. No push or deploy.

## 2026-10-18 — Journal-v2-Rules, CI-Reparaturen und coach-Submodul-Fix

Fortsetzung des Journal-v2-Pointer-Bumps (siehe nächster Eintrag): Firestore-Rules für die Raster-Apps, Lockfile-/Workflow-Fehler beim Push und ein defekter Submodul-Pointer. `~/vitalos` ist komplett gepusht; die Journal-Seiten waren zuvor direkt per `deploy:all` aus `~/journal-dev` ausgeliefert worden. Nicht im Browser oder auf einem Gerät getestet.

- **`firestore.rules` (`876a0d3`):** neuer Block `match /journal/{uid}/{document=**}` nur für den Besitzer (Frame Map je Domain unter `journal/{uid}/frame/{domain}`, Door-Quellenwahl unter `journal/{uid}/settings/door`; Coach bewusst ausgenommen). Rules per `firebase deploy --only firestore:rules --project fitness-aos` ausgerollt.
- **`journal-app`-Pointer-Bumps:** Fire × Google Calendar, Frame Map + Quellenwahl `journal/`, Freedom/Focus Maps + Fire-Woche, Potential-Wischen (Quadranten per Swipe), `+hot`/`+profit` aus dem Journal, TaskChampion-Härtung. Das Lockfile `pnpm-lock.yaml` im Submodul wird nicht mehr getrackt (CI nutzt das Root-Lockfile).
- **`fitness-app` (`1f16bda`):** `coach`-Submodul entfernt (Coach lebt als `coach-app` in vitalos); behebt den CI-Checkout-Fehler `not our ref` (der referenzierte Commit `a190434` war zuvor nach `origin master` von coach gepusht worden).
- **`pnpm-lock.yaml` (Root, `701b2e8`):** neu erzeugt, weil `fflate` (journal-app) fehlte und `--frozen-lockfile` in der CI abbrach.
- **`.github/workflows/deploy-journal.yml` (`1c6022a`):** `firebase deploy --only hosting:journal` statt `--only hosting`, da `journal-app` jetzt sechs Hosting-Targets hat und der Workflow nur `journal` baut. CI „Deploy Journal PWA“ und Shell danach grün.

---

## 2026-10-18 — journal-app: Journal v2 / Door v2 per Pointer-Bump nach vitalos

Die Arbeit an Journal v2 passierte in `~/journal-dev` (Branch `dev`); in `~/vitalos` wurde sie über mehrere Merges und Pointer-Bumps nachgezogen. Nicht im Browser oder auf einem Gerät getestet.

- **`journal-app` (Branch `vitalos`):** mehrfach `origin/dev` hineingemergt — v2-Ansicht (Raster, Woche/Monat, gcal), Splash/Auto-Updater, iPad-Vollbild, Habits-Ansicht im Raster-Design, Service-Worker-Font-Caching, Doku Journal v2, Door v2 / Door-App (`vos-door`), Google Tasks, Fire-Map-Kalender. Beim ersten Merge blieb `package.json` mit `workspace:*` (vitalos-Workspace); `pnpm-lock.yaml`/`pnpm-workspace.yaml` aus dev gehören nicht ins Submodul.
- **`pnpm-lock.yaml` (Root):** per `pnpm install --frozen-lockfile --lockfile-only` nachgezogen (`workbox-window` für journal-app).
- **Meta-Repo-Commits:** Pointer-Bumps `journal-app: v2-Ansicht …`, `journal-app: Service Worker Font-Caching`, `journal-app: Hosting-Target v2, deploy:v2`, `journal-app: Doku Journal v2`, `journal-app: Door v2, Door-App, Google Tasks, Fire-Map-Kalender`, `journal-app: Doku Door v2 / Door-App`.

---

## 2026-10-17 — vos-fitness: Build repariert, Ordner umbenannt, eigene CI

Der Ordner `fitness-vos/` baute nicht mehr; er wurde repariert, in `vos-fitness/` umbenannt und bekam einen eigenen CI-Deploy. Die Hosting-Site-ID `vos-fitness` ist bei Firebase global an ein anderes Projekt vergeben, deshalb bleibt die Site `fitness-vos` (`fitness-vos.web.app`, Auth-Domains unverändert). Live deployt; nicht im Browser oder auf einem Gerät getestet.

- **`vos-fitness/` Build-Fix (`47e6c7c`):** Das lokale `NavigationItems.js`-Override exportierte `IS_SOLO` nicht (von fitness-app seit 15.10. gebraucht); `@cloud` zeigte auf eine `firebase.js` ohne `httpsCallable`. Override und toter Code (`App.jsx`, `App.Premium.jsx`, `vite.config.js`, `public/index.html`, `public/v1.html`) entfernt; `vite.config.cjs`, `tailwind.config.cjs`, `AGENTS.md`, `public/sw.js` angepasst.
- **Ordner-Rename (`5b05f0b`):** `fitness-vos/` → `vos-fitness/`; `.githooks/pre-push`, `CLAUDE.md`, `package.json`/`package-lock.json` und `AGENTS.md` auf den neuen Pfad umgestellt.
- **`.github/workflows/deploy-vos-fitness.yml`:** neuer CI-Deploy nach `fitness-vos`, Trigger auf `vos-fitness/**` und den `fitness-app`-Pointer. Erster Lauf scheiterte (fehlende generierte KB-/6pack-Daten, `vite` nicht gefunden); mit `c1f75ce` baut er mit generierten Daten und Root-vite und läuft grün.

---

## 2026-10-17 — Privater Skills-Checkout in CI

Skills bleibt privat. Nach ausdrücklicher Nutzerfreigabe liest VitalOS-CI das neue verschachtelte Submodule über einen separaten Nur-Lese-Deploy-Key (SKILLS_DEPLOY_KEY). Die gemeinsame Composite-Action konfiguriert ausschließlich den Skills-Repository-SSH-Pfad; Hostkeys stammen aus GitHubs HTTPS-Metadaten. Alle 12 rekursiven Checkout-Jobs verwenden sie vor dem Submodule-Update. YAML, Shell-Syntax und Schritt-Reihenfolge geprüft. Der Firebase-Service-Account unter ~/.env/firebase-fitness.json gehört zum Projekt fitness-aos; der vorhandene CI-Service-Account wird weiterverwendet.

## 2026-10-17 — Skills-Videos und gemeinsame Release-Quelle

Fitness/Skills ist ein direktes skills-dev-Submodule auf Branch fitness. Der neue Production-Workflow deploy-skills.yml baut denselben gepinnten verschachtelten Checkout separat nach vos-skills.web.app; deploy-fitness.yml baut den Host. Tailwind der VitalOS-Shell erfasst die Skills-Root-UI-Dateien. Keine parallele UI-Kopie mehr.

## 2026-10-17 — Gemeinsames Profil + Geräteliste in der Shell, Pointer-Bump fuel-app/fitness-app deployt

- **`src/shell/db/settings.js`:** Shell liest/schreibt das app-übergreifende Profil `users/{uid}/meta/profile` (`gender` m/f, `age`, `heightCm`, `weightKg`, `chronicConditions`, `medications`). Lesen: Profil gewinnt, fehlende Felder werden einmalig aus `users/{uid}` übernommen (Backfill); Schreiben: Profil plus Write-through auf `users/{uid}` (Coach-Tools lesen dort). Geräte-Registrierung unter `users/{uid}/devices/{deviceId}` mit `app=vitalos` (Commit `353dcbb`).
- **Pointer-Bump:** `fuel-app` (`dc0c7c8`) und `fitness-app` (`f784df6`) enthalten jetzt dasselbe Profil-/Geräte-Schema (Commits `d029182`, `6b22bd9`). Reihenfolge von innen nach außen gepusht: Teil-Repos `coach`/`plan`/`plan/coach-dev`, dann `fitness-dev`/`fuel-dev` `dev`, dann Submodul-Branches `vitalos`, zuletzt Meta-Repo `master`. Die vier `vos-fuel-*-app`-Mini-Apps bewusst nicht mitgebumpt.
- **`plan/coach-dev`:** Commit hing im Detached HEAD, `origin/dev` war 47 Commits weiter — per Cherry-Pick auf `origin/dev` gelegt und als Fast-Forward gepusht.
- **Mitgepusht:** Die Pushes von `fuel-dev`/`fitness-dev` nahmen auch fremde, bis dahin ungepushte Commits mit (5 bzw. 11); Staging-Hooks liefen (Fitness-Preview :8100, Fuel nach `~/.local/fuel`), kein Prod-Deploy außerhalb der CI.
- **CI:** `Deploy Fitness PWA`, `Deploy Fuel PWA`, `Deploy VitalOS Shell` für `2fe37d0` mit `success`. Alle sieben Builds (fuel cloud, fitness lokal/firebase, vitalos lokal/firebase) liefen durch; im Browser mit echten Firestore-Daten nicht getestet.
- **`CLAUDE.md`:** Neue Abschnitte „Pointer-Bump fuel-app / fitness-app: Schritt für Schritt“ und „Gemeinsamer User-Kontext in Firestore“ (Tabelle der Pfade, Backfill-/Write-through-Regeln, Geräte-ID pro Origin).
- Firestore-Rules unverändert (`users/{uid}/{document=**}` deckt die neuen Dokumente ab).

---

## 2026-10-17 — Selfie-Sync vom Nutzer auf zwei Geräten bestätigt

- Nutzer bestätigt nach Upload eines Fotos am Handy die erfolgreiche Anzeige am Laptop mit demselben Konto. Der reale geräteübergreifende Upload-/Lese-Ablauf funktioniert; frühere Hinweise „Geräte-Sync noch ungeprüft“ sind für diesen Ablauf erledigt.
- Finaler Stand: 6pack 21c804d, Shell-Fix 42e1168; bestehender VitalOS-Login wird wiederverwendet. Production-CI erfolgreich: [VitalOS](https://github.com/nimmsel23/vitalos/actions/runs/39028533456), [6pack](https://github.com/nimmsel23/vitalos/actions/runs/39028533446). Live-Bundles einschließlich Shell-UID-Anbindung geprüft.
- Speicher: `sixpackSelfies/{uid}/photos/{photoId}`, nur Eigentümer; normaler Sync benötigt keinen Laptop-Dienst. Dokumentation und Abnahme ebenfalls in 6pack README/RESULTS und Fitness docs/6pack-integration.md/RESULTS festgehalten.
- Die Nutzerbestätigung deckt keine zusätzlichen Offline-/Altbestand-/HEIC-Gerätetests ab. Persönliche Fotos oder Tokens wurden nicht für die Dokumentation ausgelesen.

## 2026-10-17 — 6pack übernimmt den VitalOS-Login

- Ursache: Der eigenständige Shell-Tab importierte noch 6pack-app b3e070b und übergab keine UID. Der bereits veröffentlichte Fitness-Release nutzte dagegen den neuen 6pack-Stand. Deshalb zeigte die Shell trotz Anmeldung die alte Login-Sperre.
- 6pack-app auf 21c804d (vereinigter Photo-Auth/Cloud-Sync, identisch zur Fitness-Integration) aktualisiert. Shell übergibt user.uid; Account-Wechsel remountet 6pack. Die neue Foto-Auth verwendet die vorhandene Firebase-App und deren Sitzung.
- Tailwind scannt die flachen 6pack-Quellen beider Einbindungen gezielt statt deren node_modules rekursiv einzulesen.
- Firebase-Shell-Build erfolgreich; Auth-Regression läuft zusätzlich in Production-/PR-Preview-CI.
- Regressionstest führt den tatsächlichen Shell-Views-Code und den Photo-Auth-Adapter aus: UID für zwei Konten/abgemeldet, Remount-Key, Navigation und bestehende Firebase-Sitzung ohne zweite initializeApp. Cloud-/Import-Regression ebenfalls grün.

# RESULTS.md

Session-Log mit datierten Ergebnis-Bullets (vitalos Meta-Repo). Wird vom globalen PreCompact-Hook
(`~/.claude/hooks/pre-compact-docs.sh`) fortgeschrieben, wenn eine Session hier gearbeitet hat.

## 2026-10-16: Fuel-Mini-Apps im Meta-Repo nachgezogen

- **`.github/workflows/deploy-fuel.yml`:** Deploy nur noch `--only hosting:client` — `fuel-dev` hat jetzt fünf
  Hosting-Targets (`client`=`fuel-vos`, `log`, `supplements`, `mikros`, `protokoll`); ein nacktes
  `--only hosting` würde sie alle deployen und an den fehlenden `dist-solo-*` scheitern.
- **`CLAUDE.md`:** Deploy-Tabelle um die vier Mini-App-Sites `vos-fuel-<x>` ergänzt (gebaut/deployt aus
  `fuel-dev`, nicht aus eigenen Submodulen).
- **Release:** `fuel-release --yes` → `fuel-app` auf `vitalos` gemergt, Pointer-Bump `5f93106`, `master` gepusht.
- **Nicht gebaut:** Mini-App-CI im Meta-Repo (Workflows `deploy-fuel-<x>.yml`) — berührt Workspace/Lockfile.

---

## 2026-10-16: Plan Strong-Workflow und Fitness-Backend veröffentlicht

Plan-Feature und Backend-Verträge nach dev gemergt und gepusht; über
`vos-release --yes plan fitness` in die jeweiligen vitalos-Release-Branches
übernommen, verschachtelte Submodule initialisiert, Firebase-Hosting veröffentlicht
und beide Parent-Gitlinks mit `bd551c8` gepusht. Plan-Release: `31f6595`;
Fitness-Release: `0cc9e6a`. Der Hook-Konflikt im Plan-Release betraf ausschließlich
`.githooks/pre-push` und wurde vom Release-Wrapper mit der dev-Fassung aufgelöst.

Erfolgreiche GitHub-Actions-Läufe für Parent `bd551c8`: Plan `38959199587`,
Fitness `38959199831`, VitalOS Shell `38959199908`. Auch Plan-dev-Preview
`38958876264` sowie Fitness-dev/vitalos `38959101504`/`38959189447` erfolgreich.
Plan unter https://vos-plan.web.app live; ausgeliefertes Hauptbundle auf neue
Coach-Verwaltung, Planbereitstellung, Vorlagenaktualisierung und Yuhonas geprüft.
Der CI-Rebuild hat eigene Asset-Hashes; kein bytegleicher Vergleich zum lokalen
Vor-CI-Build behauptet. Authentifizierter Coach-/Klienten-Cloud-Durchlauf bleibt offen.

Lokales Fitness-Staging ist auf :8100 erfolgreich aktualisiert und healthy.
:6100, :9100 und :9150 waren beim Abschluss nicht aktiv; diese separaten Dienste
wurden nicht gestartet. Der Firebase-Release und die lokalen Dienst-Owner bleiben
getrennt. Paketmanager-bedingte supports-color-Peer-Normalisierung im Plan-Lockfile
wurde gesichert und aus den Arbeitskopien entfernt; keine neue Dependency-Version
oder Lockfile-Änderung wurde in den Release aufgenommen.

Das anschließende Coach-Upgrade liegt separat als geprüfter Entwicklungscommit
`af1f4cd` in coach-dev (gemeinsamer Plan-Editor und Klientenablauf). Es ist nicht
Teil dieses bereits ausgeführten Plan-/Fitness-Releases.


## 2026-10-16: Coach Strong-Workflow veröffentlicht

Coach-Upgrade `af1f4cd` über dev in den vitalos-Release-Branch übernommen;
finaler Coach-Stand `5a0d012`, Parent-Verweis `b419ff9`, alle Branches gepusht.
Firebase Hosting unter https://vos-coach.web.app erfolgreich veröffentlicht.
Vorlageneditor, Trainingsplanbereitstellung, Yuhonas-Auswahl und Workout-Ergebnisse
im ausgelieferten JavaScript sowie gemeinsame Plan-Dialogklassen im Live-CSS
geprüft. Authentifizierte reale Coach-/Klienten-Cloud-Schreibvorgänge bleiben
unverifiziert; der isolierte Browser-Durchlauf verwendete Testdaten.

Der erste Upload scheiterte am Netzwerk und wurde erfolgreich wiederholt.
Zusätzlich Tailwind auf die eingebundenen Plan-Quellen erweitert. Preview-CI
repariert: vollständiger Plan-Commit statt Kurz-ID, pnpm statt npm für die
Standalone-Installation und explizite temporäre Workspace-Konfiguration.
Preview `38965346842` erfolgreich. Produktions-CI Coach `38964936285` und
`38965094966` sowie Shell `38964936288` und `38965094970` erfolgreich.
Der abschließende Parent-Sync übernimmt ausschließlich die weiteren CI- und
Dokumentationskorrekturen; die veröffentlichte Produktfunktion bleibt gleich.

## 2026-10-17 — Offline-Cache bei Updates
Gemeinsame mini-app-shell erweitert bzw. aktualisiert: versionsunabhängiger öffentlicher API-Cache mit Migration, Asset-Precache standardmäßig aktiv, fehlgeschlagene Installation ersetzt bestehenden Worker nicht. IndexedDB/localStorage bleiben unverändert. Geprüft: 13 Shell-/Update-Tests, Private-Request-Test, Vendor-Parität. Kein Push/Release; kein physischer Geräte-Test.
## 2026-10-19 — VitalOS-eigener Push-Worker

VitalOS registriert `/vitalos-messaging-sw.js` auf `/vitalos-push/` und nutzt
`apps.vitalos` für Geräte-Tokens und Einstellungen. VitalOS-Funktionen senden
mit `app: "vitalos"`; sein Worker ignoriert Nachrichten anderer Apps.
Aktivierte Altgeräte migrieren beim nächsten Öffnen automatisch in die eigene
Token-Lane. Fitness verwendet parallel die Fitness-Lane und den separaten
Worker/Scope.

Statische Syntax-, JSON- und Diff-Prüfungen erfolgreich. Kein Produktions-
Deploy; der lokale VitalOS-Stand enthält außerdem Änderungen im Habit-Submodul.

