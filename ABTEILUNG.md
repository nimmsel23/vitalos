# ABTEILUNG.md — Abteilungsleiter vitalos (Meta-Repo)

Bootstrap: 2026-11-06 durch den CEO-Agenten; entschlackt 2026-11-07 nach
Owner-Hinweis (Repo-Regeln gehoeren in die AGENTS.md, nicht hier). Diese
Datei ist NUR Laufzustand + AL-Etikette. Jeder Lauf liest sie komplett und
schreibt unten additiv fort (nichts oben ueberschreiben, kein Rohprotokoll).

## Regelquellen (in dieser Reihenfolge massgeblich)

1. `/home/alpha/vitalos/AGENTS.md` — Repo-Regeln dieses Repos (Architektur,
   Edit-Orte, Commit-/Gitlink-Regeln, Push-Gate inkl. oeffentlichem origin
   und getrackter google-services.json, Paketmanager, Releases).
2. `~/ABTEILUNGEN.md` — Organisationsebene (Vertrag: Ebenen, Rechte,
   Taskwarrior `vos.*`, Inbox, Guards, CEO-Kanal).
3. Koordinationsordner
   `/home/alpha/vitalos/prod/coordination/TODO.md`
   — nur Abschnitte mit vitalos-Bezug (Kontextquelle, keine Auftraege fuer
   dich daraus ableiten; deine Auftraege kommen aus Taskwarrior oder der
   Inbox).

Widerspricht etwas hier einer Regelquelle: Regelquelle gewinnt + in der
Inbox melden.

## AL-Etikette (nicht in den Regelquellen enthalten)

- Du arbeitest fuer den CEO, nicht fuer Daniel. KEIN Direktkontakt zu
  Daniel: kein tele, kein wacli, keine Benachrichtigungen an den User —
  Berichte ausschliesslich in die CEO-Inbox:
  `~/.local/state/abteilungen/inbox/vitalos-<JJJJ-MM-DD>.md` (mkdir -p,
  falls fehlt). Braucht etwas Daniels Entscheidung: `+ceo` markieren —
  der CEO relayt.
- Takt: TAEGLICH (Owner-Vorgabe 2026-11-07), volle Session (Subagents
  erlaubt), kitty/foot wenn Wayland laeuft, sonst headless. Zeitlich von
  anderen AL-Laeufen und vom thin-results-Fenster (07:30) entzerrt.
- Rechte: lesen, berichten, Aufgaben in der repo-eigenen Task-DB fuehren.
  Code aendern nur mit CEO-`+go` — und im Meta-Repo gilt: `prod/`-Code und
  Submodule gehoeren den Ausfuehrungslinien, Strategie-Dateien dem CEO.
  Deine Normalarbeit: Beobachtung, Bericht, Dokumentations-/Hygiene-
  Auftraege mit `+go`.

## Lauf-Checkliste (jeder Lauf, in dieser Reihenfolge)

1. Diese Datei und die Regelquellen (AGENTS.md vollstaendig; Vertrag und
   Koordinations-TODO nur relevant) lesen.
2. **Eingang aus der repo-eigenen Task-DB** (Taskwarrior mit
   `TASKDATA=<repo>/.task`, untracked): offene/pending Tasks abarbeiten —
   selbst uebernehmen (Doku-/Hygiene-Standard) oder Angestellten-
   Subagenten spawnen (groessere Arbeit, ggf. pro Tab). Code-Aenderungen
   nur mit CEO-`+go`.
3. **Bot-Eingang importieren:** Repo-`TODO.md` (Telegram-TO-do-Bot des
   Owners) sichten, neue Eintraege als Tasks in die Task-DB uebernehmen,
   abgearbeitete markieren; NEXT.md als Protokoll der Folgetasks
   mitfuehren.
4. Ist-Stand selbst pruefen (glauben nie): `git status --short`,
   `git log --oneline -5 dev-product`, `git submodule status` (Marker
   zaehlen, keine Diff-Fluten); Inventur: Gitlink-Drift, Branchabstand
   dev-product vs. master (nur dokumentieren, NIEMALS angleichen —
   Release-Auftrag), unversionierte Artefakte im Root (nur melden, kein
   rm), Worktree-Parallellage (master-flow, vos-editions: fremde Agency,
   nie anfassen; Inbox-Ruecklauf `vitalos-*` der letzten 2 Laeufe lesen).
5. **Ausgang (immer, im selben Lauf):** Session in `RESULTS.md`
   aufzeichnen (Konventionsformat), Folgetasks nach `NEXT.md` — beides
   PROTOKOLL (thin-results destilliert taeglich); fuehrend fuer Aufgaben
   ist die Task-DB. Erledigtes dort als done mit Ergebnis-Annotation.
6. Bericht in die CEO-Inbox: Zusammenfassung 2-3 Saetze, +ceo-Punkte.
7. Unten fortschreiben: neuen „Letzter Lauf"-Abschnitt anhaengen.

## Offene Produktlinien im Umfeld (Kontext, nicht deine Auftraege)

- Journal-Release freigegeben, wartet auf die Kompositions-Entscheidung
  (vos-backend als Submodule a/b/c) — Owner.
- p2-weekly ist aktiver Funktionsauftrag des Haupt-Vibes (journal-dev-Seite).
- Emulator-Abnahme wartet auf Owner-Signal (Android-Linie).
- Strategie massgeblich: `VitalOS-Produktstrategie-V1.2.1.md` (+ .html).

## Letzter Lauf

- (Bootstrap durch CEO, 2026-11-06 — erster Abteilungsleiter-Lauf steht aus.)

## Letzter Lauf — 2026-11-07 (~02:45 UTC, Erstlauf; manuell angestossen, nicht vom Runner)

- Regelquellen gelesen (AGENTS.md vollstaendig, ~/ABTEILUNGEN.md inkl.
  Nachtrag 2026-11-07, Guide vitalos.md). Logsdauer: Der Lauf diente der
  Tagesinventur (Guide-Aufgabe 1) — read-only, kein Worktree, kein Commit
  im Meta-Repo (~justify TESTLAUF-Konvention: nur Logeintrag).
- Inventur: `git status --short` nur `?? ABTEILUNG.md` (CEO-Datei, nur
  gemeldet, nicht bewegt). `dev-product` Spitze `226b799` (Feuer-Nachweis
  Fokus Stufe 0, Emulator-Runde 2). Neun Submodule sauber: 0 Drift-Marker
  (+/-), 0 dirty. Branchabstand `origin/master...dev-product` = 13/15
  (nur dokumentiert, NICHT angeglichen — Release-Auftrag). Unversionierte
  Root-Dateien: keine ausser ABTEILUNG.md.
- Worktree-Parallellage: 7 registrierte; fremde Linien unberuehrt
  (master-flow 4b2f0bf, vos-editions f6243f6, vitalos-master-Flow etc.).
  Befund: 2 prunable Eintraege auf /dev/shm (wt-focus a199fc4,
  wt-focus1 e11379b, Focus-Linie) — gemeldet, nicht gepullt, nicht
  bereinigt.
- Eingang: Task-DB (`~/.vitalos/.task`) leer — keine offenen Tasks.
  TODO.md: alle Punkte [x], keine neuen Bot-Zeilen. NEXT.md: offener
  Punkt Coach-Deploy-CI-Fix betrifft coach-dev (nicht vitalos-Repo) —
  dem CEO ueberlassen. Koordinations-TODO nur als Kontext gelesen.
- Von den Vorschlaegen aus der Inventur drei neue nummerierte Zeilen
  (5-7) an den Guide angehaengt (vitalos-prod `59cfd5c`, kein Push):
  Focus-Worktree-Bereinigung (fremde Linie, nur mit +go), veraltete
  RESULTS.md/NEXT.md im Root (Doku-Auftrag, nur mit +go), leere Task-DB.
- RESULTS.md/NEXT.md im Meta-Repo NICHT aktualisiert — nichts im
  vitalos-Repo bearbeitet (reine Inventur); abweichend zur Checklist nur
  logiert, kein Repo-Dirt im Haupt-Checkout.
- Kein Push, kein Fetch, kein Submodule/Tag/Master-Touch, kein rm/mv,
  kein tele. Ende: 3 Zeilen an den Log (~/.local/state/abteilung/
  vitalos.log, neu angelegt).

## Letzter Lauf — 2026-11-08 (manuell angestossen; EINE Aufgabe: +hit-Worktree-Bereinigung)

- Regelquellen komplett gelesen (Guide, AGENTS.md, ABTEILUNG.md, Log-Tail). Guide-Referenzen `~/vitalos-prod/docs/product-dev/README.md`/`WOCHENPLAN.md` existieren nach der Symlink-Konsolidierung nicht mehr (dort liegen nur `abteilungen/`, `legacy/`, `FOKUS-STUFE-0-1-UMSETZUNG.md`) — gemeldet, Lauf ohne sie fortgesetzt.
- DIE EINE Aufgabe (+hit, CEO-freigegeben): Bereinigung GENAU der 2 prunable /dev/shm-Focus-Worktrees verifiziert — wt-focus (a199fc4) und wt-focus1 (e11379b) waren bei Laufstart bereits entfallen (keine `.git/worktrees/`-Admin-Eintraege, keine Verzeichnisse in /dev/shm; Boot 2026-11-06, Erstlauf sah sie noch → Entfernung durch unbekannte dritte Linie). `git worktree prune` als Freigabe-Schritt: no-op (rc=0, 5 registrierte Worktrees unverändert); Branches focus-stufe-0-1 (a199fc4) / focus-stufe-1 (e11379b) unberuehrt — Freigabe-Scope nicht verlassen. Guide-Aufgabe abgehakt.
- Inventur: dev-product Spitze `1b9601b` (vor Lauf) → `b471707` (Lauf-Commit); Branchabstand `origin/master...dev-product` 18/7 (nur dokumentiert, NICHT angeglichen); Submodule 1 Drift-Marker (`+ journal-app` 9502f2b, heads/vitalos, fremde Linie — nur gemeldet), 0 dirty. Nur gemeldet, kein mv/rm: `M prod/coordination/CTO.md` (fremd, uncommittet), `D vitalos.html`, Untracked `20`, `docs/Index.html`.
- Protokoll-Commit `b471707` auf dev-product (AL-LOG.md 2026-11-08 gefuellt, RESULTS.md-Session, NEXT.md-Folgetasks, Guide-Abhaken) — selective Staging direkt im Haupt-Checkout: der Temp-Worktree-Flow haette den Protokoll-Commit dangling hinterlassen, und Schwester-ALs committen ihre Guide-Abhakungen ebenfalls direkt auf dev-product. ABTEILUNG.md bleibt untracked (CEO-Datei, nur gemeldet).
- Trailer-Abweichung: Commits dieses Laufs tragen Mistral-Vibe-Co-Author statt der Claude-Signatur der Guide-Vorlage (ausfuehrender Agent ist Mistral Vibe). Kein Push, kein Fetch, kein Master/Tag/Gitlink/Submodule-Touch, kein tele. Bericht in der CEO-Inbox `~/.local/state/abteilungen/inbox/vitalos-2026-11-08.md`.

## Letzter Lauf — 2026-11-08 (Abteilungsleiter-Lauf; EINE Aufgabe: +hit Doku-Hygiene RESULTS.md/NEXT.md)

- **Stand & Regelquellen:** Regelquellen geprüft (AGENTS.md, vitalos.md, ABTEILUNG.md, Einstieg via `abteilungsleiter brief vitalos`). Dev-product HEAD: `6034504`. Submodule: 1 Drift-Marker (`+ journal-app` 9502f2b, heads/vitalos — fremde Ausführungslinie, nur gemeldet, nicht angefasst). Fremde uncommittete/unversionierte Pfade unverändert nur gemeldet: `D vitalos.html`, `?? 20`, `?? docs/Index.html`, `?? ABTEILUNG.md` (untracked CEO-Datei).
- **Ausgeführte Aufgabe (+hit, CEO-freigegeben):** Doku-Hygiene in `RESULTS.md` und `NEXT.md` im Meta-Repo-Root durchgeführt:
  - `RESULTS.md`: Chronologie bereinigt (nach unten gerutschte 2026-11-07- und 2026-11-01-Einträge sauber einsortiert), Meilenstein-Dokumentation dev-product bis `226b799` (Fokus Stufe 0/1 Feuer-Nachweis, Shell-Journal-v2-Wrap, Observe/Operate-Architektur) nachgepflegt, doppelten Dateikopf `# RESULTS.md` bereinigt, offizielle Dünne-Grenze (`thin-results-Grenze`) gemäß Org-Regel 2026-11-07 gesetzt.
  - `NEXT.md`: Rohe Gemini-Reviews (Oktober) in Archiv-Zusammenfassung konsolidiert; aktive Arbeitsliste auf die aktuellen Org-Hits (M2-Testuser APK-Vorbereitung c3315277, GitHub-Pages-Bewertung 378427eb) und offene Meta-Repo-Beobachtungen ausgerichtet.
  - Guide `prod/docs/product-dev/abteilungen/vitalos.md`: Aufgabe 6 / CEO-Freigabe 2 abgehakt.
- **Offene Punkte & Blocker:** Blocker: keine. Offen: Org-Hits c3315277 (+alpha, M2 APK-Vorbereitung für Simon & Matthias) und 378427eb (+cto, GitHub Pages erfassen/bewerten); fremde Dateistände unberührt.
- **Commit & Abschluss:** Commit auf `dev-product` (RESULTS.md, NEXT.md, AL-LOG.md, vitalos.md). Kein Push, kein Gitlink-/Submodule-Touch.

## Letzter Lauf — 2026-11-09 (Abteilungsleiter-Lauf; EINE Aufgabe: Org-Hit 378427eb GitHub Pages)

- **Stand & Regelquellen:** Einstieg `abteilungsleiter brief vitalos`; Queues FIRE.md fehlt, TODO.md alle [x] → NEXT.md. HEAD vor Lauf `f2eadda`. Branchabstand `origin/master...HEAD` 0/3 (nur dokumentiert). Submodule: 7 Drift-Marker `+` (6pack/fitness/fuel/journal/plan/relax/skills) — fremde/dirty Checkouts, nur gemeldet. Arbeitsbaum zusätzlich `M AL-LOG.md` (Vorlage). Vorlauf 03:40 Engine agy = FEHLER, AL-LOG-Sektion leer.
- **Ausgeführte Aufgabe:** Org-Hit `378427eb` (+cto +hit): GitHub-Pages-Kanal erfasst und bewertet ohne Console-/Konfigänderung. Bestand Legacy Pages `master`/`/docs` → `https://nimmsel23.github.io/vitalos/`; 17 Dateien; Root 404 / `Index.html` 200; keine Rohsecrets, wohl SA-Mails/Secret-Namen; Empfehlung deaktivieren oder stark beschneiden (Owner-Gate). Doku: `prod/docs/FIREBASE.md` § GitHub Pages; Verweise in `docs/DEPLOYMENT.md` + `docs/UNIFIED-PRODUCT.md`; Guide Aufgabe 8 abgehakt; NEXT/RESULTS/AL-LOG; Taskwarrior done.
- **Offene Punkte & Blocker:** Blocker keine. Offen: `c3315277` (+alpha, M2-APK fällig heute), `8e82a31b` (C-004), Owner-Entscheidung Pages, Submodule-Drift nur beobachten.
- **Commit & Abschluss:** Commit auf `dev-product` (FIREBASE/DEPLOYMENT/UNIFIED-PRODUCT, NEXT/RESULTS, Guide, AL-LOG, ABTEILUNG). Kein Push, kein Gitlink-/Submodule-/Pages-Touch.

## Letzter Lauf — 2026-11-09 (~15:40 CET, Abteilungsleiter-Lauf; EINE Aufgabe: C-002 Handoff)

- **Stand & Regelquellen:** Einstieg `abteilungsleiter brief vitalos` (Queues: keine neuen TODO-Punkte; Org project:vitalos = c3315277/+alpha, 7df12a13/+cto, e83d8daa/+al). HEAD vor Lauf `f2075da`. Branchabstand `origin/master...HEAD` 0/33 (nur dokumentiert). Submodule-Marker: 0. Arbeitsbaum sauber.
- **Ausgeführte Aufgabe:** Guide #9 / Org `3c55e958` C-002 M1-RC Geräteabnahme — Befund + Handoff (kein Gerät, kein Emulator-Start). Artefakte `app-debug.apk` (7,9M) + `app-release.aab` (6,0M), `com.vitalos.app`. DoD-Schritte offen. NEXT/RESULTS/Guide-Handoff/AL-LOG; Org-Annotation.
- **Offene Punkte & Blocker:** Blocker = kein adb-Gerät. Offen: C-002 Rest (Live), `e83d8daa` vos-fitness, `c3315277` M2-APK (+alpha), Dependabot/PR #13 (+cto).
- **Commit & Abschluss:** Commit auf `dev-product` (Guide, NEXT, RESULTS, AL-LOG, ABTEILUNG). Kein Push, kein Install/Emulator/Gitlink-Touch.

## Letzter Lauf — 2026-11-10 (~03:40 CET, Abteilungsleiter-Lauf; EINE Aufgabe: vos-fitness baubar)

- **Stand & Regelquellen:** Einstieg `abteilungsleiter brief vitalos` (keine neuen TODO-Punkte; Org project:vitalos = c3315277/+alpha, 7df12a13/+cto, e83d8daa/+al). HEAD vor Lauf `711c8eb`. Branch `master`, Abstand `origin/master...HEAD` 0/0. Submodule: 0 Pointer-Drift; dirty working trees nur gemeldet (`m fitness-app`, `m fuel-app`).
- **Ausgeführte Aufgabe:** Guide #10 / Org `e83d8daa` — Web-Build OK + Host 404 belegt + Debug-APK-Pfad; PostCSS auf TW4-Plugin; `@tanstack/query-core` Direkt-Dep. Restlücken Asset-Links/Keystore/Play in AL-LOG. NEXT/RESULTS/Guide/AL-LOG; Task done.
- **Offene Punkte & Blocker:** Blocker keine (DoD). Offen: C-002 Live-Rest, M2-APK (+alpha), Dependabot-Mo (+cto), Hosting-Deploy nur mit Owner-Auftrag.
- **Commit & Abschluss:** Commit auf `master` (vos-fitness postcss, prod package/lock, Guide, NEXT/RESULTS, AL-LOG, ABTEILUNG). Kein Push, kein Deploy/Store/Gitlink-Touch.

## Letzter Lauf — 2026-11-10 (~15:40 CET, Abteilungsleiter-Lauf; EINE Aufgabe: M2-Verteilweg)

- **Stand & Regelquellen:** Einstieg `abteilungsleiter brief vitalos` (Org project:vitalos = `c3315277`/+alpha overdue, `fdd8b7fd`/+cto; neue TODO C-010/C-011 bereits als Docs in `e60b4d4`/PR #16). HEAD vor Lauf `63a7cfb`. Branch `master`, voraus 1 vs origin. `adb devices` leer.
- **Ausgeführte Aufgabe:** Org `c3315277` — Verteilweg dokumentiert in `prod/docs/M2-TESTUSER-APK-VERTEILWEG.md` (Sideload Debug-APK, SHA-256, Kurz-Anleitung Simon/Matthias; Play-Internal bewusst nachgelagert). Intake: TODO C-010/C-011 [x]; Guide #11/#12; NEXT/RESULTS/AL-LOG.
- **Offene Punkte & Blocker:** Blocker C-002 = kein Gerät. Offen: C-002 Live, C-001b/+cto, Dependabot esbuild `fdd8b7fd`, Journal-Live-Rot → CTO. Owner muss privaten APK-Link an Tester geben.
- **Commit & Abschluss:** Commit auf `master` (M2-Doku, TODO/NEXT/RESULTS, Guide, AL-LOG, ABTEILUNG). Kein Push, kein Store/Gerät/Gitlink-Touch.
