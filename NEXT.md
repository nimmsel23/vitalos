# NEXT.md

Aktive Arbeitsliste (max. 5 Punkte) für das vitalos Meta-Repo.

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
