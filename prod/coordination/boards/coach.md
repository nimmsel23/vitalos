# Dashboard — coach-dev

Generated: 2026-11-13T00:11:23+00:00 · SHA: `c5f3a8e` · Issue: [#33](https://github.com/nimmsel23/vitalos/issues/33) · Repo: `nimmsel23/coach-dev`

Refresh: `prod/coordination/ui/gen-boards.py` (+ optional Hook/Action).

---

## 1. Auth & access (recent log hits)

- auth-ish commits in last 15: **3**
- `c5f3a8e feat(ci): Living Dashboard als GitHub Page, pages-docs.yml archiviert`
- `2ccd6ac chore(ci): pages-docs.yml archivieren — Dashboard-Workflow baut docs/ mit`
- `1e84fe5 fix(ci): Dependabot base=master→dev Retarget vor Squash (Org c1f9b6ce)`
- `aa1b602 docs(coach): AssignPlan routes through pinned Plan TrainingPlans`
- `c5087e4 refactor(coach): route legacy rotations through the pinned Plan workspace`


## 2. Client scope

- client/habit/insight hits: **2**


## 3. Inspector / notes

- inspector hits: **3**


## 4. Plan integration

- plan hits: **2**


## 5. CI gate

- test/ci hits: **4**


## 6. Open acceptance (RESULTS.md)

- `L34: zwei Drafts. Restore+Bump als TODO Offen — kein Blind-Overwrite (Feature-Freeze).`
- `L61: - Hosting/SW für die neuen Push-Typen noch offen.`
- `L75: - Install-Kommentar + `docs/COACH_APP.md` nennen Coach-Repo-SOT; TODO/NEXT abgehakt. Dienst nicht neu gestartet.`
- `L79: - Sidebar: offene Anfragen live als SubTabs unter Anfragen (`watchCoachInbox` → `coachInbox`).`
- `L261: - Coach `getGlobalInbox()` (MODE=coach): offene `inbox/**`-PRs optional read-only, Firestore/lokal danach.`
- `L337: tote `fitness-preview.service` (:8100). KB-Zuordnung korrigiert im Eintrag`
- L358: - Ursache: `/fitness/inbox*` proxied tot nach Fitness-Preview `:8100`, obwohl Coach-API (`:9150`) die ehemalige fitness-python-backend ist (gleicher Code, ander
- L365: - Frontend-Serve (Coach-Dist vs. Fitness-Dist :8100) nach `TODO.md` + Org-Task `+ceo` ausgegliedert. `FIRE.md`/`ARCHITECTURE.md`/`AUDIT.md` nachgezogen.


## 7. Runtime-Hinweis

- coach-api typisch `:9150` (Funnel) — Status hier nicht gescraped
- Details: `~/COACH.md`

