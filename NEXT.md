# NEXT.md
- [ ] CEO-Entwurf `VitalOS-Produktstrategie-V1.3.0.md` mit Owner abnehmen;
  im M1-RC prüfen, ob ein Freitext-Tag alle vier Deposits (Body, Business,
  Balance, Being) abdeckt. Danach M2-Testuser auf tägliche Nutzung,
  Rückkehr, erlebten Nutzen und Preisinteresse testen (6,90/9,90 Euro als
  Gesprächsvarianten). Danach genau ein Premium-Angebot freigeben und erst
  bei positivem variablem Deckungsbeitrag Reichweite zukaufen. Keine neue
  App vor diesem Demand-Gate; weitere Fach-App-Einstiege nacheinander.
- [ ] Smart-Log-Kosten erfassen: aktueller Backendpfad nutzt `gemini-2.5-flash`,
  speichert aber im Smart-Log-Ergebnis bislang keine Provider-Tokenmetrik.
  Abrechnungsart und reale Kosten je erfolgreicher Analyse vor dem
  Premium-Kontingent klären.
- [ ] Session 4af6f88b („VitalOS repos open PRs and merges“, 2026-11-06): Das Transcript enthält nur Start-, Konfigurations- und Statusdatensätze, keine Nachrichten und keine Tool-Aufrufe. Ob offene Worktrees, Branches, PRs und Dependabot-Alerts geprüft oder gemerged wurden, ist daraus nicht belegbar. Stand mit `git worktree list`, `git branch -vv` und `gh pr list` prüfen und die Session nachdokumentieren.

Aktive Arbeitsliste (max. 5 Punkte) für das vitalos Meta-Repo.

## 2026-11-08 (Aktuelle Org-Hits & Meta-Repo-Fokus)

- [ ] Org-Task c3315277 (+alpha +hit, fällig 09.11.2026): M2-Testuser-Vorbereitung (Owner-Freigabe 20:1x): APK des Shells (com.vitalos.app, prod/android) für Simon & Matthias bereitstellen — Verteilweg dokumentieren (Play Internal Track vorbereiten oder direkte APK-Installation), keine Store-Publikation, kein Geräteanfassen; Endzustand = Installer-Weg bereit + kurze Anleitung, Ausgabe an CEO für Owner-Handoff.
- [ ] Org-Task 378427eb (+cto +hit): GitHub-Pages-Kanal erfassen und bewerten: Pages im Meta-Repo dient docs/ von master unter nimmsel23.github.io/vitalos (baut je master-Push, seit heute CEO-beobachtet) — in KEINER Stammdoku erfasst (FIREBASE.md beider Fassungen, UNIFIED-PRODUCT: 0 Treffer). (1) Bestandsaufnahme was dort konkret öffentlich liegt (inkl. sensibler Inhalte-Check), (2) Absatz in vitalos/prod/docs/FIREBASE.md nachziehen mit Verweis-Kette von allen Deploy-Doku, (3) Empfehlung behalten vs. deaktivieren ausarbeiten — Entscheidung bleibt Owner-Gate.
- [ ] Nur-gemeldet-Punkte beobachten (fremde Linien, nicht anfassen): uncommittet prod/migration/unified-product/coordination/CTO.md, D vitalos.html, Untracked 20/docs/Index.html; +-Drift journal-app (9502f2b, heads/vitalos).
- [ ] Submodule-Pointer-Bumps & Shell-Tailwind-4: Modul-PRs master → vitalos und Shell-Upgrade auf Tailwind 4 nach Abschluss der aktiven Dev-Stränge abgleichen.

## 2026-11-06 (Android-Produktlinie, APK/AAB gebaut)

- [ ] Identity Platform in `vitalos-prod` ist aktiviert (Owner, 2026-11-06, per read-only API-Check verifiziert); als Nächstes nativen Google-Sign-In auf einem Gerät abnehmen — Installation + Login sind separate Nachweise, bisher nicht ausgeführt.
- [ ] Vor erstem Play-Upload entscheiden: Play App Signing oder eigener Upload-Key; danach erst `product-*`-Tag/Release-Mirror beauftragen (nicht Teil der Build-Session).
- [ ] Bei zukünftigen Bauten: `prod/android/keystore.properties` lokal korrekt halten (PKCS12-Key nutzt das Store-Passwort; `keyPassword` war falsch und wurde lokal angeglichen).

## 2026-11-06 (Release-Ablauf master → vitalos, Shell-Tailwind-4)

- [ ] `vos-ship`/`vos-release`-Umbau (`58f1ecf`/`36292cd`) ist nur lokal committet und nur per Dry-Run/Syntaxcheck geprüft: einmal real durchlaufen lassen (z. B. `vos-ship learn`) und erst dann pushen. `~/vitalos` steht auf `dev-product`, `vos-release` verlangt `master`.
- [ ] Pointer-Bumps im Meta-Repo fehlen: auf `master` liegt mehr als auf `vitalos` (fitness +14, fuel +3, habits +3, relax +3, 6pack +3). Modul-PRs `master → vitalos` sollte Vibe-Agent B machen (Ergebnis in `~/dev/HANDOFF-ERGEBNIS-module-prs.md`); Ergebnis prüfen.
- [ ] Shell auf Tailwind 4 (Agent A, Worktree `~/dev/.vitalos`, Übergabe `~/dev/HANDOFF-vitalos-tw4-shell-2026-11-06.md`): Stand und Build (Shell, `vos-fitness`, `vos-fuel`, Fuel-Embedded-CSS ohne Base-Schicht) prüfen, danach Lockfile, Push, Shell-CI. Nichts davon verifiziert.
- [ ] Meta-Repo-PR #12 (Functions-CI-Fix) ist mergebar, aber offen; erst nach dem Shell-Push mergen, da beide `master` ändern.
- [ ] `docs/DEPLOYMENT.md` und `CLAUDE.md` beschreiben noch `dev → master (PR) → vitalos`; auf den neuen Ablauf (`dev` Preview, `master` live, `master → vitalos` per PR) angleichen.
- [ ] Offen aus dem Zielmodell: Dependabot (weniger, Ziel `master`), `ci-test/**`-Branches lösen in acht Modulen Live-Deploys aus, `coach-dev` hat keinen `master`, `automerge.yml` greift nur für Quelle `dev`.

## 2026-11-05 (Backend-Auslagerung, Dependabot)

- [ ] Dependabot-Rest (130 Alerts, überwiegend Frontend-Pakete) nach Rescan neu bewerten; Dependabot-Update-Läufe waren gestartet, PRs standen noch aus.
- [ ] relax-dev: prüfen, ob `server.py`, `server/` und der `server.mjs`-Stub archiviert werden können (angeboten, nicht bestätigt). Pre-push-Hook von relax-app/plan-app scheitert am lokalen `firebase deploy` (Permission): Firebase-Login/Rechte prüfen.
- [ ] Docs mit alten Pfaden (`src/server`, `node-backend`) in `fuel-dev` (`CLAUDE.md`, `ARCHITECTURE.md`) nachziehen. Die neuen Backend-Repos haben kein `node_modules`, ihre Tests wurden nicht ausgeführt.
- [ ] Plan live (`vos-plan.web.app`) im Browser ansehen (Routinen, Makrozyklen, Fortschritt): bisher nur HTTP 200 und Build.

## 2026-11-04 (vos-fitness Stabilitätsrunde)

- [ ] `15daf57` und `fcf2717` (vos-fitness) sind nur lokal committet: Push und damit CI-Deploy nach `fitness-vos.web.app` erst auf Zeichen des Nutzers. Danach auf dem iPhone prüfen (Layout, Wischen, Logbuch) – bisher nichts gesehen.
- [ ] Offene Entscheidungen in `fitness-app` (fremdes Repo, deployt auch nach `fitness-aos`): (1) Learn-Detail-Overlay `z-[100]` liegt vermutlich über dem `ExerciseInsightModal` `z-50` (Mobile, nur aus Code abgeleitet); (2) `settingsStore.js` greift ohne `try/catch` auf `localStorage` zu (weißer Bildschirm bei gesperrtem Storage); (3) `saveSession` überschreibt den ganzen Tag, gleichzeitiges Schreiben von Pulse und Training: letzter gewinnt.
- [ ] Pulse-Parser ausbauen (Reihenfolge vorgeschlagen): mehrere Übungen pro Zeile, RPE/Pausen, Vorbelegung aus dem heutigen Plan (`useTodayPlan()`). Cardio steckt weiter als Text im `reps`-Feld (Schema kennt nur `reps`/`weight`). Zusammenhang Journal ↔ Pulse-Parser ungeklärt (`journal-app` nutzt weder `parseLogText` noch `@pulse`).
- [ ] Ungeklärt/ungeprüft: Update-Knopf in den Einstellungen (braucht `window.__swRegistration` und `sw-update-available`), Manifest-Icons `"any maskable"` getrennt eintragen, Logout ohne Bestätigung, stille Leerzustände im Lernen-Tab, ob `fitness/kb/*` ohne Login lesbar ist.

## 2026-11-02 (Shell-Menüs, Hash, firebase/ai)

- [ ] Auf Gerät/Browser bedienen (nur Ladetest gesehen): Rechtsklick/Long-Press in Hub-Kacheln und Bottom-Nav, Klick auf „Heute"/‹ ›/Datepicker ändert den URL-Hash. Prüfen, ob die CI-Deploys nach den Pushes (`0f7ae5e`) grün wurden.
- [ ] Google-Tasks-Login: Origin(s) (`http://localhost:9190`, Shell-Prod-Host, `vos-journal.web.app`/`vos-door.web.app`) in der Cloud Console beim OAuth-Web-Client unter „Autorisierte JavaScript-Quellen" eintragen (Nutzer-Aufgabe); ob `GOOGLE_OAUTH_CLIENT_SECRET` gesetzt ist, wurde nicht geprüft.
- [ ] firebase-Versionen angleichen: Root und die meisten Apps auf firebase 11, `fitness-dev` auf 13 (Workaround `AgentPlatformBackend ?? VertexAIBackend` in `fitness-app/src/firebase.js`, Build-Warnung zu `VertexAIBackend` harmlos). Root auf 13 zu heben betrifft alle Apps — nicht entschieden.

## 2026-11-02 (Fuel-Mini-Apps, Worktree-Aufräumen)

- [ ] Die vier `vos-fuel-*-app`-Ordner stehen im Meta-Repo weiter als ` M` (Checkout `12cd6b3`, Pointer `b5ec24b`), bewusst nicht gebumpt (laut Doku stabile Fallbacks, durch `vos-fuel-mini` überflüssig). Entscheidung offen: Submodule entfernen oder Pointer bumpen; vorher nie aus einem der Klone pushen (alle teilen `fuel-dev`/`vitalos`).
- [ ] Auth-Domain pro Mini-App (`vos-fuel-<x>.web.app`) ist nicht umgesetzt (Domains in Firebase freigeschaltet, Apps nutzen `fitness-aos.firebaseapp.com`). Falls gewollt: eigene Branches in `fuel-dev` pro App, nicht auf `vitalos`.
- [ ] Mini-Apps auf einem Gerät prüfen (nichts gesehen, nur HTTP 200 für Seite und `sw.js`).
- [ ] Lokale Branches ohne Worktree aufräumen (`git branch -d`, noch nicht gefragt/gelöscht): `worktree-*`, `feat/vos-ship-functions`, `fix/push-function-test-runwith`, `codex/coach-unread-index`, `feat/relax-session-desktop-width` (lokal + Remote). `codex/coach-communication` und `backup/coach-communication-2026-11-02` (enthält den nicht übernommenen Rules-Test samt Doku) erst löschen, wenn der Test sicher nicht gebraucht wird.

## 2026-11-02 (Pulse, schwarze Bildschirme)

- [x] `372336e` ist gepusht und über die CI live (`fitness-vos.web.app`, `sw.js` = `fitness-vos-v4`). Offen nur: Pointer-Bump im Meta-Repo nach dem üblichen Release-Weg, falls für `vos-fitness` nötig (es ist ein Ordner im Meta-Repo, vermutlich nichts zu tun).
- [ ] `CLAUDE.md` (Abschnitt „vos-fitness Auto-Deploy“) beschreibt noch den Deploy per `.githooks/pre-push`; tatsächlich prüft der Hook nur das Lockfile, deployt wird per CI `deploy-vos-fitness.yml`. Doku bei Gelegenheit angleichen.
- [ ] Auf dem iPhone prüfen (nichts gesehen): Web-App einmal komplett schließen und neu öffnen (neuer Service Worker `fitness-vos-v4`), dann Tab-Wechsel in Review/Lernen/Einstellungen und Layout unten (`100dvh`, Safe-Area). Tritt noch ein Fehler auf, steht jetzt die Meldung der `PageBoundary` auf dem Bildschirm — Text an Claude geben; die eigentliche Absturzursache ist nicht bewiesen.
- [ ] Alte Bug-Liste `fitness-app/BUGLIST.md` (22.07., Session-Workout-Details überlappen, Journal-Modal an falscher Position, Composer-Prompt fehlt im Journal) wurde nicht angegangen und betrifft die alte Tab-Oberfläche, nicht Pulse; Katalog-Punkte sind Datenfehler.
- [ ] `.bak`-Dateien aus dieser Session in `vos-fitness/` (`public/sw.js.bak`, `src/pulse/*.bak*`) aufräumen.

## 2026-11-01 (Standalone-Deploy, vos-ship)

- [ ] Prüfen, ob der Shell-Deploy zu `8c511df` grün wurde (`gh run list -R nimmsel23/vitalos --limit 2`); beim Sessionende lief er noch. Die zwei roten `npm_and_yarn`-Einträge bei `bc92f31` sind Dependabot, schon vorher da.
- [ ] 6Pack-Push in der Shell ist aus (`SixPackApp.jsx`, Notlösung). Richtig: `6pack-dev` bietet ein Push-Modul ohne eigene Firebase-Instanz (App/Firestore als Parameter) über `dev` → `master` → `vitalos` an, danach importiert die Shell es.
- [ ] `habits-dev` (`a6f8e1a`, nur `dev`) ist nicht released; `coach-dev` auf `master` ist ein Altstand (dort arbeitet eine andere Session). Weitere Repos mit `@vos/cross-app-aliases` nach dem Muster prüfen.
- [ ] `plan-dev`: Entfernung des verschachtelten `6pack-dev` (`b208e32`, plus `docs/DEPLOY.md`-Hinweis) liegt nur auf `dev`, nicht auf `master`/`vitalos`. `vos-ship plan` erst starten, wenn die andere Plan-Session fertig ist: `dev` enthält deren Commit `58ee478` (Klienten-Feedback, `firestore.rules.part`, Rules noch nicht freigegeben) und uncommittete Änderungen im Arbeitsordner; Nutzer hat nicht entschieden, ob trotzdem released wird.
- [ ] Mögliche Umzugs-Folgefehler nach `~/dev` (Symlinks, Lockfile-`link:`-Pfade) in weiteren Repos/Worktrees; `vos-release` fängt nur die bekannten Fälle ab. Ein Umzug der `-app`-Checkouts (z. B. `~/.local/vitalos/`) wurde bewusst nicht gebaut, vorher wäre ein lesendes Inventar der Pfad-Abhängigkeiten (`/opt`-Ketten, systemd-Units, Release-Skripte) nötig.
- [ ] Dependabot-Fehlermeldung `.github/dependabot.yml` in `plan-dev` (Ursache nur auf der GitHub-Seite sichtbar) nicht verfolgt.

## 2026-11-01 (Tent Push)

- [ ] Functions-Deploy wiederholen, sobald `fitness-pwa-deploy@fitness-aos.iam.gserviceaccount.com` `secretmanager.secrets.get` auf `GOOGLE_OAUTH_CLIENT_SECRET` lesen darf. Workflow-Run `41299433483` stoppt bei dieser fehlenden Metadatenberechtigung; die aktive lokale Identität darf die Secret-IAM-Policy nicht ändern.

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
- [ ] Mini-App-CI für `vos-fuel-*` (`deploy-fuel-<x>.yml`, Pfadfilter `fuel-app/**`); Pointer-Bump deployt sonst nur `hosting:client`. Berührt `pnpm-workspace.yaml` + Lockfile.
- [ ] `packages/mini-app-shell/` ist untracked bzw. noch nicht Teil eines Releases — `fuel-dev` hält eine vendored Kopie (`vendor --check` zeigt Drift).
- [ ] `bin/learn-release` ist eine fremde, ungetrackte Datei in `~/vitalos` und wird bei `vos-ship` nicht mitcommittet; prüfen, ob sie entfernt oder getrackt werden soll.
- [ ] **Coach-Deploy-CI-Fix:** Der Preview-Deploy für `coach-dev` ist fehlgeschlagen, da das Submodul `daniel-vitaltrainer-firebase` (privates Repo) nicht ausgecheckt werden konnte. Entscheidung offen: (1) Read-only Deploy-Key in `daniel-vitaltrainer-firebase` und Secret `WEBSITE_DEPLOY_KEY` in `coach-dev` anlegen, (2) Personal Access Token als `GH_SUBMODULE_TOKEN` in `coach-dev` eintragen, oder (3) Submodul als externes Dependency-Target anbinden.

## Archiv: Gemini-Reviews (Oktober 2026 — konsolidiert)

Historische Review-Feststellungen aus den Oktober-Sessions wurden konsolidiert:
- **Verifikation & Tests:** Fehlende Browser-/Gerätetests für migrierte Schemata (Profile, Geräte) und UI-Features (Pulse, Hub) wurden in den nachfolgenden Testläufen (u. a. Emulator-Runden 1 & 2 für Fokus Stufe 0/1) adressiert.
- **Rules & Auth:** Firestore-Rules für Journal, Coach und TractionDaily wurden per modulspezifischem Rules-Build und zentralem Deploy (41319760105) verifiziert.
- **CI/CD & Submodule:** Lockfile-Synchronisation und Standalone-Deploy-Pfade (vos-ship, vos-release) wurden etabliert; redundante Pre-Push-Deploys zugunsten von CI-Pipelines deaktiviert.
