# NEXT.md

Aktive Arbeitsliste (max. 5 Punkte) für das vitalos Meta-Repo.

## 2026-10-29 (Coach-Tab, Fuel-Average, Vite-Dev, Door v1)

- [ ] Im Browser prüfen (nichts davon gesehen): Coach-Tab mit `CoachApp`-Wrapper (Unter-Tabs „Katalog Browser“ und „Klienten“, Mobil, Firebase-Build) und Fuel-Average-Widgets mit leeren Tagen. Offen: soll der Shell-Coach-Tab langfristig auf die eigenständige `~/coach-dev` verweisen (Coach ist bewusst kein Submodul mehr)?
- [ ] Vite-Dev-Server (:9190) beobachten: nach dem Neustart ~530 MB, ob `watch.ignored`/`optimizeDeps.entries` das Wachstum Richtung 2 GB dauerhaft verhindern, ist ungemessen. Wächst er weiter, Tailwind-`content`-Pfade und Submodul-Aliase prüfen.
- [ ] Changelog-Lücke: Folge-Deploys ohne Shell-Änderung (reine Pointer-Bumps) überschreiben `release-info.json` mit `null`; Changelog-Quelle müsste über den letzten Deploy mit Änderung statt `before..after` gebaut werden — nicht entschieden.
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
