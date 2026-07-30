# .agent/architecture/DEPLOYMENT.md

# Repos, Branches und VitalOS Deployment

## Grundmodell

VitalOS ist das Parent-/Shell-Repo.

Standalone Apps wie:

* fitness
* fuel
* journal
* habits
* learn

werden separat entwickelt und besitzen jeweils ihre eigene Domain.

VitalOS bindet diese Apps ein und baut daraus die Shell.

---

## Branch-Modell

Standalone Apps verwenden grundsätzlich:

```text
dev
↓
testen / entwickeln
↓
merge nach master
↓
master = Version, die VitalOS konsumieren darf
```

Wichtig:

VitalOS soll grundsätzlich auf den aktuellen `master`-Stand der Standalone Apps zeigen, nicht auf deren `dev` Branch.

---

## Submodule-Modell

VitalOS enthält Standalone Apps als Submodules.

Beispiel:

```text
vitalos/
├── fitness-app
├── fuel-app
├── journal-app
├── habit-app
└── learn-app
```

Der Parent speichert dabei nicht automatisch „den neuesten master“, sondern einen konkreten Commit-Pointer.

Deshalb reicht:

```text
git push fitness/master
```

alleine nicht aus.

Nach einem neuen Standalone-Master muss auch der Submodule-Pointer in VitalOS aktualisiert und committed werden.

Konzeptionell:

```text
fitness/dev
   ↓
fitness/master
   ↓
VitalOS fitness-app pointer
   ↓
VitalOS master
   ↓
CI
   ↓
Firebase deploy
```

---

## VitalOS Deployment

VitalOS wird nicht manuell nach jedem App-Commit deployed.

Der produktive VitalOS-Deploy wird durch einen Push auf:

```text
vitalos/master
```

über Git CI ausgelöst.

Die CI checkt VitalOS inklusive der im Parent gespeicherten Standalone-App-Pointer aus und baut daraus die Shell.

Deshalb gilt:

```text
Standalone master updated
≠
VitalOS updated
```

Erst:

```text
Standalone master updated
+
VitalOS submodule pointer updated
+
VitalOS master pushed
```

stößt die neue Version der App innerhalb der Shell an.

---

## Typischer Workflow

Beispiel Fitness:

```text
1. Arbeit auf fitness/dev
2. Tests / Build
3. dev → master
4. fitness/master pushen
5. VitalOS Submodule-Pointer auf neuen fitness/master Commit setzen
6. Pointer in vitalos committen
7. vitalos/master pushen
8. CI-Run verifizieren
```

---

## Wichtig für Agenten

Ein Agent darf nach einem Push auf `vitalos/master` nicht behaupten:

```text
"ist deployed"
```

solange der CI-Lauf nicht geprüft wurde.

Korrekt ist zunächst:

```text
"Deploy wurde durch den Push angestoßen."
```

Erst nach erfolgreichem CI-/Firebase-Deploy darf der Stand als live gelten.

---

## Vor Änderungen prüfen

Vor Arbeiten an Standalone + Shell:

```bash
git branch --show-current
git status --short

git -C /home/alpha/vitalos branch --show-current
git -C /home/alpha/vitalos status --short
```

Dabei insbesondere auf fremde Änderungen in anderen Submodules achten.

Nicht pauschal alle Submodule oder Parent-Änderungen committen.

---

## Ownership

Domain-Änderungen gehören zuerst ins Standalone Repo.

Beispiele:

```text
Workout Classification → fitness
Muscle Recovery        → fitness
Macros                  → fuel
Habits                  → habits
```

VitalOS soll Domain-Logik nur konsumieren.

Shell-spezifisch sind dagegen z.B.:

```text
globale Navigation
Shell Layout
Cross-App Dashboard
Firebase Functions
Shell Deployment
```
