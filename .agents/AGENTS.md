# VitalOS Agent Rules

## ⛔ DEPLOY-SCHUTZ — NIEMALS UMGEHEN

**Agents dürfen NIEMALS direkt nach Production deployen.**

Die einzige erlaubte Deploy-Pipeline ist **GitHub Actions** (`.github/workflows/`), die auf `push` nach `master` triggert.

### Verbotene Befehle in diesem Repo:
- `firebase deploy` (jede Variante)
- `npx firebase-tools deploy`
- `npm run deploy:shell` (existiert absichtlich nicht mehr)

### Erlaubter Workflow:
1. Code-Änderungen in den jeweiligen Sub-Repos machen (`fuel-dev`, `fitness-dev`, etc.)
2. In das Sub-Repo mergen und pushen (`git push origin master`)
3. Submodule-Pointer in vitalos updaten (`git add <submodule> && git commit && git push`)
4. GitHub Actions deployt automatisch — **fertig, kein weiterer Schritt nötig**

### Warum:
vitalos ist das Production-Meta-Repo. Ein defekter Build oder ein falscher Deploy kann
die Live-App für alle Nutzer zerstören. GitHub Actions ist die einzige Instanz, die
nach einem erfolgreichen Build deployen darf.

## ⛔ GIT-SCHUTZ

**Agents dürfen auf `master`-Branches NIEMALS folgende Befehle ausführen:**
- `git rebase`
- `git reset --hard`
- `git push --force` / `git push -f`

Diese Befehle können committete Arbeit anderer Agents unwiederbringlich löschen.
