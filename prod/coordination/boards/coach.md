# Dashboard — coach-dev

Generated: 2026-11-13T14:34:37+00:00 · SHA: `4dd1d66` · Issue: [#33](https://github.com/nimmsel23/vitalos/issues/33) · Repo: `nimmsel23/coach-dev`

Refresh: `prod/coordination/ui/gen-boards.py` (+ optional Hook/Action).

---

## 1. Auth & access (recent log hits)

- auth-ish commits in last 15: **0**
- `4dd1d66 docs(server): Org-Cockpit-API /api/org (Routen, Ablage, Laptop-/Tailnet-Zugang, Schutz)`
- `2d790cb fix(api): /api/org erkennt Tailnet-Absender hinter tailscale serve`
- `589f08e feat(api): /api/org übers Tailnet für Owner-Konten`
- `bef9804 feat(api): /api/org für das Org-Cockpit (nur lokal, Antworten nach workspace)`
- `d5a6879 docs: auto-update RESULTS.md NEXT.md (pre-compact)`


## 2. Client scope

- client/habit/insight hits: **0**


## 3. Inspector / notes

- inspector hits: **0**


## 4. Plan integration

- plan hits: **3**


## 5. CI gate

- test/ci hits: **6**


## 6. Open acceptance (RESULTS.md)

- `L41: zwei Drafts. Restore+Bump als TODO Offen — kein Blind-Overwrite (Feature-Freeze).`
- `L68: - Hosting/SW für die neuen Push-Typen noch offen.`
- `L82: - Install-Kommentar + `docs/COACH_APP.md` nennen Coach-Repo-SOT; TODO/NEXT abgehakt. Dienst nicht neu gestartet.`
- `L86: - Sidebar: offene Anfragen live als SubTabs unter Anfragen (`watchCoachInbox` → `coachInbox`).`
- `L268: - Coach `getGlobalInbox()` (MODE=coach): offene `inbox/**`-PRs optional read-only, Firestore/lokal danach.`
- `L344: tote `fitness-preview.service` (:8100). KB-Zuordnung korrigiert im Eintrag`
- L365: - Ursache: `/fitness/inbox*` proxied tot nach Fitness-Preview `:8100`, obwohl Coach-API (`:9150`) die ehemalige fitness-python-backend ist (gleicher Code, ander
- L372: - Frontend-Serve (Coach-Dist vs. Fitness-Dist :8100) nach `TODO.md` + Org-Task `+ceo` ausgegliedert. `FIRE.md`/`ARCHITECTURE.md`/`AUDIT.md` nachgezogen.


## 7. Runtime-Hinweis

- coach-api typisch `:9150` (Funnel) — Status hier nicht gescraped
- Details: `~/COACH.md`

