# Dashboard — coach-dev

Generated: 2026-11-23T15:57:50+00:00 · SHA: `42f401e` · Issue: [#33](https://github.com/nimmsel23/vitalos/issues/33) · Repo: `nimmsel23/coach-dev`

Refresh: `prod/coordination/ui/gen-boards.py` (+ optional Hook/Action).

---

## 1. Auth & access (recent log hits)

- auth-ish commits in last 15: **0**
- `42f401e chore: toten Code entfernen (Ausbaustufen #25, #26)`
- `c0c2c4a docs: npm statt pnpm, NEXT.md auf GitHub-Issue-Inbox und Ausbaustufen`
- `f88361d feat(coach-inbox): GitHub-Issues aus nimmsel23/fitness als Inbox-Quelle`
- `d03ca3e Revert "refactor(coach-inbox): toten GitHub-PR-Zweig entfernen"`
- `4bb30a1 ci: npm 12 wie lokal verwenden (Lockfile-Kompatibilität)`


## 2. Client scope

- client/habit/insight hits: **0**


## 3. Inspector / notes

- inspector hits: **0**


## 4. Plan integration

- plan hits: **2**


## 5. CI gate

- test/ci hits: **2**


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

