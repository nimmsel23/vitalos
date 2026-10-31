# NEXT.md

Aktive Arbeitsliste (max. 5 Punkte) für das vitalos Meta-Repo.

## 2026-10-31 (Shell-Release Door v2)

- [ ] Entscheidung offen: Der Shell-Fix `28cec44` (statische Importe `hotFromJournal`/`profitFromJournal` wegen Build-Guard `vite-no-dynamic-chunks`) liegt nur auf `vitalos` in journal-dev, nicht auf `dev`; jeder Release stolpert deshalb im Import-Block von `journal-app/src/lib/db/journal.js` über denselben Bereich. Nach `dev` zu übernehmen kollidiert mit dem bewusst lazy geladenen Standalone-Build — Architekturentscheidung des Nutzers, nichts getroffen.
- [ ] Auf dem Handy prüfen (nichts gesehen): Shell nach dem Release `9526677` (Seite online öffnen, zweimal neu laden wegen Service Worker), Door v2 Offline-first/Autosave, Frame-Maps mit Tippen, App-Kill und Flugmodus. Der Shell-Build lief nur in der CI.
- [ ] Optional: `.github/workflows/deploy-push-functions.yml` deployt nur `scheduledJournalPushReminders`; die Google-Functions und `scheduledDoorReminders` (live, aus journal-dev deployt) kennt er nicht. Harmlos, aber bei einer Absicherung dort wäre ein eigener Eintrag nötig (dann auch `scripts/test-push-function-isolation.mjs` anpassen).

## 2026-10-29 (Pulse, Shell-Tabs)

- [ ] Im Browser und auf dem Handy prüfen (nichts gesehen): Pulse-Composer in der Shell über der Bottom-Nav (`.pulse-embedded` in `pulse.css`), Wischgesten (Schwellen `MIN_DX`/`MAX_MS` in `vos-fitness/src/pulse/useSwipe.js`), eigene Seiten mit Zurück-Taste, neue Fuel-Untertabs. Töpfe, Küche und Tagesfaden wurden ohne ausdrücklichen Auftrag aufgenommen — Nutzer soll entscheiden, ob sie bleiben.
- [ ] Pulse-Verfeinerung (vorgeschlagen, nicht umgesetzt): Parser („3 Sätze à 8 mit 60“, Supersätze, RPE, Pausen, mehrere Übungen pro Zeile, Cardio mit Distanz/Puls), Plan-Bezug (heutigen Plan-Vorschlag und letzte Gewichte vorbelegen), Streak mit Rest-/Deload-Tagen, Offline-Queue und Undo/Edit eines Eintrags, Auth-Maske auslagern, `.bak`-Dateien in `vos-fitness/src` aufräumen.

## 2026-10-29 (Branch-Schutz auf master)

- [ ] Der Satz zum Branch-Schutz steht nur in der `AGENTS.md` von skills; die übrigen acht App-Repos bekommen ihn erst mit dem nächsten Release. Der PR-Weg unter Schutz ist nur mit skills PR #5 durchgespielt, die anderen acht Repos sind ungeprüft (ein Required Check `check`, der nie läuft, würde dort jeden PR blockieren).

## 2026-10-29 (Release-Weg dev → master → vitalos)

- [ ] Shell-Promotion nachziehen: Nach den Release-PRs aller neun Module steht `vitalos` (Shell) hinter `master`; `vos-release --all` würde die Pointer bumpen und die Shell neu deployen — nicht ausgeführt, Freigabe offen.
- [ ] Die lokalen Pre-Push-Hooks in `fitness-dev` und `plan-dev` prüfen (deployen bei Push auf `vitalos` evtl. noch lokal live) und die `*-release`-Wrapper in `~/vitalos/bin` (Wirkung nach dem Umbau ungeprüft).
- [ ] `CLAUDE.md` in `~/vitalos` beschreibt den Deploy-Weg noch alt („Der EINZIGE aktive Deploy-Pfad ist die CI im Meta-Repo“, `vitalos` als Prod-Branch); `docs/DEPLOYMENT.md` löst das ab, der Verweis in `CLAUDE.md` fehlt. `vos-overview` zeigt die entfernten verschachtelten Klone als „fehlt“ und kennt `skills-app` nicht.
- [ ] Im Browser/auf dem Gerät prüfen (nichts gesehen): Offline-first-Umbau (Prüfschritte in `~/OFFLINE-FIRST.md`), Notizfeld Door v2 Potential in `journal-vos`, Changelog-Filter gegen echte Commits.
- [ ] Aufräumen: `~/.local/vos-apps/*-app` (Arbeitskopien für die `master`-Anlage) und `~/.bak-nest-submodules/` können weg; `fuel-os.web.app` (Stand 28. Okt.) hat weiter einen eigenen Standalone-Weg außerhalb von `vos-release`.

## 2026-10-29 (Coach-Tab, Fuel-Average, Vite-Dev, Door v1)

- [ ] Im Browser prüfen (nichts davon gesehen): Coach-Tab mit `CoachApp`-Wrapper (Unter-Tabs „Katalog Browser“ und „Klienten“, Mobil, Firebase-Build) und Fuel-Average-Widgets mit leeren Tagen. Offen: soll der Shell-Coach-Tab langfristig auf die eigenständige `~/coach-dev` verweisen (Coach ist bewusst kein Submodul mehr)?
- [ ] Vite-Dev-Server (:9190) beobachten: nach dem Neustart ~530 MB, ob `watch.ignored`/`optimizeDeps.entries` das Wachstum Richtung 2 GB dauerhaft verhindern, ist ungemessen. Wächst er weiter, Tailwind-`content`-Pfade und Submodul-Aliase prüfen.
- [ ] Vite-Dev-Server (:9190) wurde am 2026-10-29 gegen 16:00 vom System beendet, weil der Rechner fast keinen freien Speicher mehr hatte (138 MB frei, 794 MB verfügbar von 7,2 GB); im Server-Log kein Absturz, nur HMR-Updates. Nicht neu gestartet. Vor dem nächsten Start prüfen, welcher andere Prozess den Speicher belegt.
- [ ] Changelog-Lücke: Folge-Deploys ohne Shell-Änderung (reine Pointer-Bumps) überschreiben `release-info.json` mit `null`; Changelog-Quelle müsste über den letzten Deploy mit Änderung statt `before..after` gebaut werden — nicht entschieden. Stand der Diagnose (Live-Deploy `b67893d`: `release-info.json` fehlt, SPA-Fallback; `HEAD~3..HEAD` ergäbe nur den Journal-Eintrag): zwei Wege vorgeschlagen — (1) Zeitfenster (z. B. 14 Tage) bzw. Bereich ab dem letzten Produkt-Release in `vos-release-info.mjs`, (2) vorige `release-info.json` von der Live-Seite übernehmen, wenn der Push nichts Produktrelevantes enthält (`id` bleibt stabil, Dialog erscheint nicht doppelt; braucht Netzzugriff im Build). Empfehlung war Weg 2; nichts gebaut, Freigabe offen.
- [ ] Fuel-Auswertungen im Fuel-Repo (Report, Micros, `FirstMealTrend`) rechnen leere Tage evtl. weiter mit; nicht geprüft.
- [ ] Door v1 (Google Tasks) im Shell-Tab braucht die dauerhafte Google-Verbindung: OAuth-Client/Secret `GOOGLE_OAUTH_CLIENT_SECRET` und Deploy von `functions:journal` aus `~/journal-dev` stehen aus (manuelle Schritte des Nutzers); Migration alter Hot-List-Einträge aus Taskwarrior/Firestore nicht gebaut.

## 2026-10-28 (Hub-Sheet Desktop)

- [ ] Hub-Layout ab `lg` (Hauptteil + Fitness links, Fuel rechts über 2 Spalten) im echten Browser prüfen; nur die erste Stufe wurde headless bei 1800 px gesehen. Offen: sehr breite Fenster, `DashboardSections` bei 1400 px, 2×2-Kacheln in der schmalen Spalte, Fitness gestapelt.
- [ ] Dev-Proxy in `vite.config.js` zeigt jetzt auf `:9150`; mit laufendem `fitness-api` nicht getestet (Session lief nur Frontend).

## 2026-10-26 (mini-app-shell, Fuel-Release)

- [ ] `register.reloadWindowMs` setzt noch keine `mini-app.json` — Option ist durchgereicht und getestet, aber ungenutzt; welche App wann `0` oder einen anderen Wert bekommt, ist nicht entschieden. Ob der Push von `635ea53` einen CI-Deploy ausgelöst hat, wurde nicht geprüft.
- [ ] `fuel-app` per `fuel-release` ausgeliefert (`fuel-vos.web.app`), aber nicht im Browser angesehen (Service-Worker-Cache: ggf. Update-Button nötig).
- [ ] Entscheidung offen: `fuel-os.web.app` wird bisher aus `~/vitalos/fuel-os/` (Standalone mit Wochen-Planer, 180 Dateien) bedient; ein `master`-Workflow in `fuel-dev` zielt seit dieser Session ebenfalls auf diese Site und würde sie überschreiben. Beide Codebasen teilen kein Fundament — zusammenlegen, getrennt lassen oder dritte Site, ungeklärt.

## 2026-10-25 (Shell Door/Game, Plan/Skills)

- [ ] Im Browser prüfen (nichts davon gesehen): Door-/Game-Tab samt Rechtsklick-Menü, vertikale Sidebar, Plan-Tab in `fitness-aos.web.app` (Hard-Reload wegen Service Worker) und in der Shell, Skills-Subtab aus `skills-app`.
- [ ] `vos-release` und `vos-overview` kennen `skills-app` nicht (`plan-app` schon) — Pointer-Bump von `skills-app` läuft nicht automatisch mit.
- [ ] Alte eingebettete Kopien `fitness-app/src/views/{Plan,Skills,SixPack}` sind tote Doppel (Build nutzt immer die Submodule) — archivieren statt löschen, vorher Aufrufer prüfen.
- [ ] Journal-Tags für Plan/Production (Idee: `+q1`–`+q4`, `+hit`) nicht gebaut, Verhalten ungeklärt; `+potential`/`+door` feuern im lokalen Coach-Build nicht (Hooks fehlen in `fitness-app`-Journal-Schicht).
- [ ] Door-Zeile im „Mehr"-Sheet (Mobil) hat noch keine Direktwahl.
- [ ] CI `Deploy Skills PWA`: Abruf von `api.github.com/meta` lieferte 403 (Rate-Limit); Workflow `skills-submodule-auth` ggf. mit Token oder Retry versehen.

## 2026-10-23 (journal-rules / CI)

- [ ] `scripts/build-rules.mjs` vor `firebase deploy --only firestore:rules` einhängen (Script/Workflow `deploy-firestore-rules.yml`); bisher nur von Hand aufrufbar. Gegen Rules-Emulator ungetestet.
- [ ] Rules per `workflow_dispatch` deployen, falls noch nicht geschehen (Stand der Session: nicht geprüft/ausgelöst).
- [ ] Plan-Fallback (`planVersions.js`) steht doppelt (`vite.config.js`, `vos-fitness/vite.config.cjs`) — ggf. in `packages/cross-app-aliases` zusammenführen.
- [ ] Fehlerfall des Lockfile-Checks in `vos-release` nie erzwungen getestet; offen, ob alle `*-release`-Skripte `vos-release` aufrufen.

## 2026-10-18 (journal-app)

- [ ] Prüfen, ob `deploy-habits.yml` / `deploy-learn.yml` ebenfalls `--only hosting` mit mehreren Hosting-Einträgen nutzen (gleiches Muster wie bei `deploy-journal.yml`); nicht geprüft.
- [ ] `journal/{uid}/**`-Rules und Frame-Map-Pfad mit echten Daten im Browser testen (bisher nur deployt).

## 2026-10-17 (vos-fitness)

- [ ] Entscheidung offen: Soll die Shell `PulseApp` aus `vos-fitness` rendern (neuer Fitness-Tab oder Ersatz für `FitnessApp.jsx`)? Koppelt die Shell an `vos-fitness`, dessen Zweck die Shell-Unabhängigkeit war.
- [ ] Klären, was `vos-training` als Session-Tab in `vos-fitness` sein soll (Ordner/Repo existiert nicht; evtl. `@view/session` aus fitness-app).
- [ ] `standaloneUrl` in der Shell-Navigation ist nur für fitness/fuel/relax gesetzt — für 6pack, plan, coach, skills ergänzen? Site-Namen stehen in den jeweiligen `firebase.json`.
- [ ] `vos-fitness`: Pre-Push-Hook und CI deployen bei Änderungen unter `vos-fitness/` doppelt — Hook-Deploy ggf. entfernen.

## 2026-10-17

- [ ] Nach dem Login in der Cloud-PWA prüfen, ob `users/{uid}/meta/profile` und `users/{uid}/devices/{deviceId}` angelegt werden (bisher nur gebaut, nicht im Browser mit echten Daten getestet).
- [ ] Write-through auf `users/{uid}` / `fitness/{uid}/profile/metadata` beibehalten, bis Coach-Panel und evtl. Python-Tools auf `meta/profile` umgestellt sind; ob ein Python-Tool den alten Pfad liest, ist ungeprüft.
- [ ] Offen/optional: Geräteliste in den Einstellungen anzeigen; `UserContext` in fitness und vitalos auf ein einziges Profil-Objekt zusammenlegen.

## 2026-10-16

- [ ] CI-Lauf `Deploy Fuel PWA` zu `5f93106` prüfen — erster Lauf mit `--only hosting:client`.
- [ ] Mini-App-CI für `vos-fuel-*` (`deploy-fuel-<x>.yml`, Pfadfilter `fuel-app/**`); Pointer-Bump deployt
  sonst nur `hosting:client`. Berührt `pnpm-workspace.yaml` + Lockfile.
- [ ] `packages/mini-app-shell/` ist untracked bzw. noch nicht Teil eines Releases — `fuel-dev` hält eine
  vendored Kopie (`vendor --check` zeigt Drift).

**Gemini-Review (potenzielle blinde Flecken, 2026-10-17):**
*   **Fehlende End-to-End-Verifikation im Browser:** Die Funktionalität der Änderungen (insbesondere das neue Profil- und Geräteschema) wurde trotz erfolgreicher CI-Builds nicht im Browser mit echten Firestore-Daten getestet, was eine kritische Lücke in der Verifikation der Endbenutzererfahrung darstellt.
*   **Ungeprüfte Kompatibilität der Mini-Apps:** Die vier `vos-fuel-*-app`-Mini-Apps wurden bewusst nicht "mitgebumpt". Es fehlt eine Verifikation, ob diese Mini-Apps mit dem neuen, geänderten Profil- und Geräteschema vollständig kompatibel sind, was zu Laufzeitfehlern führen könnte.
*   **Potenzielle Sicherheitslücke in Firestore-Regeln:** Die Annahme, dass die unveränderten Firestore-Regeln (`users/{uid}/{document=**}`) die neuen `meta/profile`- und `devices`-Dokumente adäquat abdecken, ist ungeprüft und könnte zu übermäßigen Schreibberechtigungen führen.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-17):**
*   Die Zusammenfassung verschweigt die drei detaillierten, offenen Architekturfragen, die am Ende der Session gestellt wurden und weitere Arbeit erfordern.
*   Die funktionale Korrektheit und Nutzererfahrung der deployten App wurde nicht im Browser oder auf einem Gerät verifiziert, was die Aussage "live deployt" relativiert.
*   Die Redundanz des lokalen Pre-Push-Deployments bei Änderungen im `vos-fitness/`-Ordner wurde zwar erkannt, aber nicht behoben, sondern als offene Entscheidung an den Benutzer delegiert.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-18):**
*   **Ambiguität der "Fire Map" Kalender-Auswahl:** Die Doku beschreibt die Auswahl als "Name enthält 'fire'". Es wird nicht berichtet, wie das System bei mehreren passenden Kalendern priorisiert oder ob dies zu unvorhersehbarem Verhalten führen kann.
*   **Ungeprüfte Konsistenz des `journal:flavor-html` Plugins:** Es wird nicht berichtet, ob die String-Ersetzungen des Plugins in `index.html` für die unterschiedlichen Builds (Journal/Door) auf unbeabsichtigte Überlappungen oder Seiteneffekte hin getestet wurden.
*   **Fehlende Verifikation manueller GCP-Schritte:** Obwohl die Notwendigkeit manueller OAuth-

**Gemini-Review (potenzielle blinde Flecken, 2026-10-18):**
*   **Ungetestete Funktionalität:** Die Kernfunktionalität der "Journal-v2-Pointer-Bumps" (z.B. Google Calendar Integration, Frame Maps, Swipe-Funktionen) wurde laut Selbstzusammenfassung "nicht im Browser oder auf einem Gerät getestet", was alle funktionalen Änderungen unbestätigt lässt.
*   **Ungeprüfte Auswirkungen der Firestore-Regeln:** Die neuen Firestore-Regeln wurden ausgerollt, aber es wurde nicht verifiziert, ob sie die beabsichtigte Zugriffskontrolle korrekt umsetzen und keine unbeabsichtigten Seiteneffekte oder Datenzugriffsprobleme verursachen (z.B. für die "bewusst ausgenommene" Coach-Funktionalität).
*   **Partielle Lösung des Deployment-Problems:** Claude hat erkannt, dass das `firebase deploy --only hosting`-Problem, das `journal` betraf, auch `habits` und `learn` betreffen *könnte*, hat dies aber nicht überprüft.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-23):**
*   **Ignorierte Build-Warnung:** Die wiederholte Warnung zur Deprecation der CJS-Build-API von Vite (`The CJS build of Vite's Node API is deprecated...`) wurde nicht adressiert oder in der Zusammenfassung erwähnt, was auf zukünftige Kompatibilitätsprobleme hindeuten könnte.
*   **Unrobuste CI-Wartezeit:** Die Verwendung eines hartkodierten `sleep 150` nach dem `git push` zur Wartezeit auf GitHub Actions ist eine unzuverlässige Methode, die bei variabler CI-Dauer zu Fehlern oder unnötigen Verzögerungen führen kann und nicht als technisches Problem oder Verbesserungspotenzial erwähnt wurde.
*   **Fehl

**Gemini-Review (potenzielle blinde Flecken, 2026-10-25):**
*   **Dauermessung:** Claude behauptet, die Dauer nicht gemessen zu haben, da das Log keine Zeitstempel habe, obwohl es den Endzeitpunkt des Hintergrund-Tasks (`Log-Ende 20:29:26`) erfolgreich ausgelesen hat.
*   **Skills PWA Fehlerursache:** Die 403-Fehlermeldung beim Skills-Deploy wird als "vermutlich Rate-Limit" interpretiert, obwohl das Log explizit "SKILLS_DEPLOY_KEY is required" ausweist, was auf ein fehlendes oder ungültiges Credential hindeutet.
*   **Service Worker Invalidierung:** Claude fordert den Nutzer zum Hard-Reload auf, um alte Service-Worker-Stände zu vermeiden, ohne zu hinterfragen, warum der Deployment-Prozess die Invalidierung nicht automatisch sicherstellt.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-26):**
*   **Ungeprüfte Annahme bei Auth-Domains:** Claude behauptet, `fuel-os.web.app` sei als Auth-Domain eingetragen und der Google-Login funktioniere, obwohl die Tool-Ausgabe `fuel-os.firebaseapp.com` als "fehlen" listet. Es wird nicht geprüft, ob beide Domains für die volle Firebase-Auth-Funktionalität notwendig sind oder ob die fehlende Domain Probleme verursachen könnte.
*   **Unklare Deployment-Quelle:** Claude stellt fest, dass die "Fuel OS"-App auf `fuel-os.web.app` von `vitalos`-`master` deployt wurde, obwohl die `vitalos`-Workflows keine CI/CD-Konfiguration

**Gemini-Review (potenzielle blinde Flecken, 2026-10-28):**
*   **Risiko unbemerkter visueller Fehler durch fehlende End-zu-End-Verifikation:** Claude hat die komplexen UI-Änderungen mehrfach umgesetzt und committet, ohne die visuellen Ergebnisse im Browser selbst zu prüfen (weder per Headless-Screenshot für die späteren Stufen noch durch eine explizite Aufforderung an den Nutzer zur visuellen Bestätigung). Dies birgt ein hohes Risiko für unbemerkte Layout- oder Darstellungsfehler, die nur durch eine tatsächliche Betrachtung im Browser sichtbar würden.
*   **Ungeprüfte Auswirkungen auf responsive Layouts unterhalb des `lg`-Breakpoints:** Obwohl die Änderungen explizit `lg:`-Klassen verwendeten, wurde keine Ver

**Gemini-Review (potenzielle blinde Flecken, 2026-10-29):**
-   **Unvollständige Problembehandlung/Berichterstattung:** Die gesamte iterative Suche nach den korrekten Ablagepfaden für "Voice Sessions" und "Focus Maps" (und weitere wie Fire/Freedom/Frame/Journal) wird in der Zusammenfassung komplett ausgelassen. Es war ein signifikanter Teil der Session, in dem Claude mehrfach falsche Annahmen über Pfade traf (`~/.voice` vs. `~/.aos/Voice`, `~/voice` vs. `~/.aos/voice`) und erst durch Nutzerinput und weitere Versuche die korrekten Orte (`~/.aos/`) identifizierte. Die Selbstzusammenfassung konzentriert sich nur auf die *erfolgreichen* Code-Änderungen.
-

**Gemini-Review (potenzielle blinde Flecken, 2026-10-29):**
*   **Ungeprüfte Annahme im `fitness-app` Master-Branch:** Die erste Korrektur des `automerge.yml` im `fitness-app` Master-Branch (`cd $HOME/.local/vos-apps/fitness-app`) hat `base=vitalos` zu `base=master` und `--ref vitalos` zu `--ref master` geändert. Die Zeile `gh workflow run deploy-master.yml` wurde dabei nicht explizit auf `deploy-master.yml` überprüft oder geändert, obwohl die Logik nun `if [ "$base" = master ]` ist. Es wird angenommen, dass `deploy-master.yml` in diesem Kontext weiterhin der korrekte Workflow ist, ohne dies expl

**Gemini-Review (potenzielle blinde Flecken, 2026-10-29):**
- **Ungeprüfte Annahmen/Behauptungen:** Claude hat Änderungen an der Vite-Konfiguration vorgenommen, um den Speicherverbrauch zu senken, räumt aber ein, dass nicht verifiziert wurde, ob diese Änderungen den Server *dauerhaft* schlanker halten.
- **Ungeprüfte Komponenten:** Der neu implementierte Changelog-Filter wurde explizit *nicht* gegen echte Commits getestet, was eine potenzielle Fehlerquelle darstellt.
- **Teilweise Problemlösung:** Obwohl der Vite-Server aufgrund eines *systemweiten* Speichermangels beendet wurde, hat Claude die Ursache des allgemeinen Speicherdrucks nicht proaktiv untersucht, sondern nur die Vite-spezifischen Konfigurationen angepasst und eine weitere Analyse nur auf Nachfrage angeboten.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-29):**
*   **Ungeprüfte Annahme:** Claude behauptet, dass die `permissions`-Konfiguration von `journal-dev` korrekt sei und der Run grün lief, obwohl der `grep`-Befehl für die `permissions`-Sektion in `journal-dev` keine Ausgabe lieferte. Dies deutet auf eine Annahme über Standardberechtigungen hin, die nicht explizit verifiziert wurde.
*   **Teilweise Lösung:** Das identifizierte Berechtigungsproblem (`checks: write`) wurde nur für `fitness-dev` behoben. Die Session bestätigt explizit, dass 7 der 9 relevanten Repos nicht auf dasselbe Problem geprüft wurden.
*   **Unverifizierte Behauptung:** Die Aussage, dass `strict: false` im Branch-Schutz notwendig ist, weil der Auto-Merge sonst wegen einer "Merge-Commit-Lücke von `dev`" scheitern würde, ist eine nicht verifizierte Behauptung. Es wurde kein Testfall mit `strict: true` durchgeführt, der dies belegt.

**Gemini-Review (potenzielle blinde Flecken, 2026-10-29):**
*   **Ignorierter interner Fehler:** Die Fehlermeldung `sim: keine Berechtigung: /ev.json` bei der Simulation der Changelog-Berechnung wurde im Output angezeigt, aber in der Analyse und den Schlussfolgerungen nicht thematisiert oder behoben. Dies deutet auf eine ungelöste technische Instabilität in der eigenen Ausführung hin.
*   **Ungeprüfte Vollständigkeit der Filterlogik:** Claude erklärt die Filterung von Commits (`releaseNotes`) und Pfaden (`isViewPath`) korrekt. Es wird jedoch nicht überprüft, ob diese Filter (z.B. die `VIEW_PATHS` oder die Regex für Commit-Nachrichten) tatsächlich alle *gewünschten* produktrelevanten Änderungen

**Gemini-Review (potenzielle blinde Flecken, 2026-10-29):**
*   **Ungeprüfte Annahme (UI-Effekt):** Die Behauptung, dass "Review und Muskel-Heatmap damit Daten bekommen", ist eine ungeprüfte Annahme. Claude hat explizit angegeben, dass keine Tests im Browser oder auf dem Handy durchgeführt wurden, um die tatsächliche Darstellung und Funktionalität der UI zu verifizieren.
*   **Edge-Case (API-Fehler):** Die Fehlerbehandlung für `searchExercises` und `getExercise` (mittels `try...catch` oder `.catch(() => null)`) führt dazu, dass bei einem API-Fehler (z.B. Netzwerkprobleme) die Übung ohne Muskeldaten geloggt wird, selbst wenn ein passender Kataloge

**Gemini-Review (potenzielle blinde Flecken, 2026-10-31):**
*   **Widerspruch im Selbstbericht:** Die Zusammenfassung behauptet, der Shell-Build sei "im Browser bzw. auf dem Handy nicht angesehen" worden, obwohl der Transkript zeigt, dass der Nutzer auf Claudes Anweisung hin die App im Browser/am Handy getestet und Erfolg gemeldet hat ("verbunden, tasks laden").
*   **Unerklärte Log-Details:** Die Firebase-Funktions-Logs (`googleLink`, `googleLinkConfig`) zeigen `"app":"MISSING"` in den Verifikationen. Es wird nicht erklärt, ob dieser Status für den OAuth-Fluss erwartet oder unbedenklich ist.
*   **Unverifizierte Dauerhaftigkeit:** Die Behauptung, die Verbindung laufe "dauerhaft", wird gemacht, obwohl Claude selbst anmerkt, dass die Token-Erneuerung (`googleAccessToken`) noch nicht getestet wurde und erst nach einer Stunde erwartet wird. Die "Dauerhaftigkeit" ist somit noch nicht vollständig bewiesen.
