# VitalOS Agent Rules

## ⛔ DEPLOY-SCHUTZ — NIEMALS UMGEHEN

**Agents dürfen NIEMALS direkt nach Production deployen.**

Die einzige erlaubte Deploy-Pipeline für Production ist **GitHub Actions** (`.github/workflows/`), die auf `push` nach `master` triggert.

### Verbotene Befehle in diesem Repo:
- `firebase deploy` (live, jede Variante)
- `npx firebase-tools deploy --only hosting`

### Erlaubter lokaler Deploy (nur Preview):
```bash
npm run deploy:preview
```
→ Deployt auf einen temporären Preview-Channel (`agent-preview`, läuft nach 3 Tagen ab).
→ Gibt eine Preview-URL aus, **berührt nie die Live-Site**.

### Die zwei CI-Pipelines:

| Trigger | Workflow | Ergebnis |
|---|---|---|
| PR nach `master` geöffnet | `pr-preview.yml` | Temporärer Preview-Link (`pr-{nr}`, 7 Tage) |
| Merge/Push in `master` | `deploy-shell.yml` | **Live-Deploy** auf `vitalos.web.app` |

### Erlaubter Workflow für Submodule-Änderungen (fuel-dev etc.):
1. Code-Änderungen im Sub-Repo committen und auf `master` pushen
2. Submodule-Pointer in vitalos updaten: `git add <submodule> && git commit && git push`
3. `deploy-shell.yml` deployt automatisch live — **kein weiterer Schritt nötig**

Für einen lokalen Preview-Test vor dem Merge: `npm run deploy:preview`

vitalos ist das Production-Meta-Repo. Ein defekter Build oder ein falscher Deploy kann
die Live-App für alle Nutzer zerstören. GitHub Actions ist die einzige Instanz, die
nach einem erfolgreichen Build deployen darf.

## ⛔ GIT-SCHUTZ

**Agents dürfen auf `master`-Branches NIEMALS folgende Befehle ausführen:**
- `git rebase`
- `git reset --hard`
- `git push --force` / `git push -f`

Diese Befehle können committete Arbeit anderer Agents unwiederbringlich löschen.
