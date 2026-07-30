also es geht vor allem darum denke ich dass vitalos eine shell-app ist welche wiederum die "standalone" apps umschließt wie fitness, fuel, journal, habits. 
die vitalOS shell ist wie OS sagt eher fett und feature reich, aus den standalone apps möchte ich eher direkte mobile optimierte portale machen. 
Alles läuft prinzipiell auf firestore + lokale dev server (außer shell = firebase/firestore only + buildet sich aus master branches der standalone apps per git ci deploy).
Ich dachte auch schon daran gpt-mini  oder ähnliches low key model die fakten aufzuspüren lassen und die to do um konkrete dateipfade erweitern soll damit das hohe modell dann nicht mehr suchen muss 
hast du da als multi-agenten-experte noch ein paar ideen und hinweise dazu? 
git worktrees und branches sind schon alles teil des workflows.

---
Ja. Für dein Setup würde ich die Agenten nicht primär nach „starkes Modell vs. schwaches Modell“ trennen, sondern nach **Verantwortung**.

Deine Architektur hat nämlich drei Ebenen, die ein Agent sauber auseinanderhalten muss:

* **Standalone-App** = eigentliche Domain + mobile Portal-UI
* **VitalOS Shell** = Desktop-/OS-artige Composition Layer
* **Firestore / lokale Dev-Services** = gemeinsame Daten- und Runtime-Schicht

Das ist wichtiger als die Modellwahl.

Deine Idee mit einem günstigen Scout-Modell ist dabei sehr sinnvoll. Ich würde daraus eine kleine Pipeline machen.

## 1. Scout Agent: Repository Intelligence

GPT-mini / Haiku / günstiges Modell darf **nichts implementieren**.

Seine Aufgabe ist nur:

> „Finde heraus, wo dieser Bug wahrscheinlich lebt.“

Output beispielsweise:

```yaml
task: FITNESS-001

symptom:
  workout_with_hiit_finisher_wrong_in_history: true

repositories:
  primary: fitness-dev
  consumers:
    - vitalos-shell

likely_files:
  - path: src/features/history/history.js
    relevance: high
    reason: builds history workout cards
  - path: src/domain/workouts/classifyWorkout.js
    relevance: high
    reason: derives workout type
  - path: src/dashboard/activityWidget.js
    relevance: medium
    reason: currently produces correct classification

data_sources:
  - firestore sessions
  - local runtime session store

suspected_divergence:
  dashboard:
    function: classifyWorkout()
  history:
    function: inferActivityType()

recommended_next_step:
  compare both classification functions

confidence: 0.86
```

Das ist viel wertvoller als einfach nur Dateipfade zu sammeln.

Der Scout sollte immer beantworten:

```text
WO?
WELCHE Daten?
WELCHE Funktionen?
WER konsumiert es?
WO existiert bereits funktionierende Logik?
```

---

## 2. Wichtig: Dateipfade allein reichen nicht

Hier würde ich deine ursprüngliche Idee etwas erweitern.

Wenn du dem starken Modell nur sagst:

```text
Bug:
History falsch

Dateien:
foo.js
bar.js
baz.js
```

muss es trotzdem wieder Reverse Engineering machen.

Besser ist ein **Context Packet**.

Zum Beispiel:

```md
# Context Packet: FITNESS-001

## Symptom
Legs + HIIT Finisher wird im Verlauf als HIIT klassifiziert.

## Correct implementation
src/dashboard/activity/deriveActivity.js
- derivePrimaryWorkoutType()

## Suspected incorrect implementation
src/history/normalizeSession.js
- getSessionActivityType()

## Shared data
sessions/{uid}/{sessionId}

Relevant fields:
- workoutType
- exercises[]
- activities[]
- finisher
- muscleIds[]

## Call chain

HistoryTab
→ loadSessions()
→ normalizeSession()
→ getSessionActivityType()
→ HistoryCard

Dashboard
→ getRecentSessions()
→ derivePrimaryWorkoutType()
→ ActivityWidget

## Hypothesis
History selects last activity instead of primary workout.

## Constraints
- do not migrate Firestore schema
- maintain legacy sessions
- standalone fitness and VitalOS must behave identically
```

Jetzt startet das teure Modell nicht bei null.

---

# 3. Ich würde fünf Agent-Rollen benutzen

Nicht zwingend fünf Modelle. Es können fünf Prompts / Phasen sein.

### Scout

Nur lesen und lokalisieren.

```text
repo → Dateien → Funktionen → Datenfluss → Hypothese
```

### Architect

Entscheidet:

```text
Ist es:
- UI bug?
- domain bug?
- repository bug?
- sync bug?
- shell integration bug?
```

Und besonders:

> **Wo sollte die Wahrheit langfristig leben?**

Das ist bei VitalOS entscheidend.

### Implementer

Bekommt bereits:

```text
Problem
Context Packet
Architect Decision
Acceptance Criteria
```

und ändert Code.

### Reviewer

Sucht bewusst nach:

* duplicated logic
* regressions
* Shell-vs-Standalone Divergenz
* local-vs-Firestore Divergenz
* unnötigen neuen Abstraktionen

### Verifier

Führt Tests, Build und gegebenenfalls Dev-App aus.

---

# 4. Die wichtigste Regel für VitalOS

Ich würde im Repo eine explizite Regel festhalten:

> **VitalOS darf Domain-Logik konsumieren, aber möglichst keine eigene Domain-Logik implementieren.**

Also nicht:

```text
fitness standalone
   └── eigene Muscle Recovery Logic

vitalos
   └── andere Muscle Recovery Logic
```

sondern:

```text
fitness/
├── domain/
├── data/
├── components/
├── standalone/
└── vitalos/
```

konzeptionell:

```text
                    ┌─ standalone mobile UI
domain → services → components
                    └─ VitalOS shell UI
```

Die Shell ist dann **Composition + Navigation + Cross-App Experience**, nicht zweite Fitness-App.

Das würde viele deiner derzeitigen Divergenzen automatisch verhindern.

---

# 5. Standalone und Shell dürfen absichtlich unterschiedlich sein

Das ist ebenfalls wichtig.

Du willst nicht:

```text
Standalone Fitness = VitalOS Fitness
```

Du willst eher:

```text
       shared fitness engine
               │
        shared components
          ┌────┴────┐
          │         │
Standalone UI    VitalOS UI
mobile portal    rich OS workspace
```

Das ist eine gute Architektur.

Beispiel Coach:

```text
fitness/domain/coach/
fitness/components/coach/
```

Standalone:

```text
Fitness
├── Today
├── Session
├── Exercises
└── Coach
```

VitalOS:

```text
Fitness workspace
├── Overview
├── Session
├── Analysis
└── maybe no Coach at all
```

Das ist kein Code-Duplikat, solange beide dieselben unteren Schichten verwenden.

---

# 6. Lass den Scout außerdem „Ownership“ bestimmen

Bei deinem Multi-Repo-Setup ist das extrem hilfreich.

Jede Aufgabe sollte ein Feld bekommen:

```yaml
ownership:
  source_repo: fitness-dev
  integration_repo: vitalos
  data_owner: fitness
```

Beispiel:

```yaml
task: MUSCLE-002

source_of_truth:
  domain: fitness
  repository: fitness-dev

consumers:
  - fitness standalone
  - vitalos shell

must_not_be_implemented_in:
  - vitalos-shell/src/pages/dashboard
```

Damit vermeidest du genau diesen Fehler:

> Agent sieht Bug in VitalOS → patched ihn direkt in VitalOS.

Obwohl die Ursache im Fitness-Modul liegt.

---

# 7. Für deine CI-Architektur würde ich einen „integration impact“ Header einführen

Da VitalOS aus den Master-Branches baut, sollte jede Task wissen:

```yaml
integration_impact:
  standalone_only: false
  vitalos_rebuild_required: true
  firestore_schema_change: false
  backward_compatibility: required
```

Oder:

```text
Impact:
[x] fitness standalone
[x] VitalOS
[ ] Firestore schema
[ ] migration
[ ] other apps
```

Dann weiß der Agent sofort, wie breit der Blast Radius ist.

---

# 8. Lass günstige Modelle auch Git-Historie durchsuchen

Das ist vermutlich einer der größten Hebel für deinen Workflow.

Bei dir gibt es viele Fälle wie:

> „Seit dem letzten Catalog Rewrite kaputt.“

Der Scout sollte deshalb nicht nur den aktuellen Code lesen, sondern:

```bash
git log
git blame
git diff <known-good>..HEAD
```

und idealerweise liefern:

```md
## Regression candidates

Commit:
a83f22e catalog runtime rewrite

Changed:
- normalizeExercise()
- resolveMuscleIds()
- loadWeeklyReport()

Likely regression:
loadWeeklyReport still expects legacy exercise IDs.
```

Das spart einem großen Modell massiv Tokens.

---

# 9. Noch besser: Bug → Regression Window

Falls du ungefähr weißt:

> „Vor zwei Wochen ging es noch.“

Scout:

```text
Find last known good implementation.
Determine regression window.
Inspect only commits touching relevant symbols.
```

Resultat:

```text
Known good:
7c124c1

Known broken:
d233cd9

Candidate commits:
3
```

Dann muss dein großes Modell nicht 50.000 LOC verstehen.

---

# 10. Erstelle einen Repo-Index für Agenten

Nicht jedes Mal erneut suchen lassen.

Zum Beispiel:

```text
.agent/
├── architecture.md
├── repositories.yml
├── domain-map.yml
├── firestore-map.yml
├── routes.yml
├── ownership.yml
└── known-divergences.md
```

`repositories.yml`

```yaml
fitness:
  repo: fitness-dev
  responsibility:
    - training
    - exercises
    - sessions
    - muscle recovery

fuel:
  repo: fuel-dev
  responsibility:
    - nutrition
    - macros
    - micros
    - supplements

vitalos:
  repo: vitalos
  responsibility:
    - shell
    - composition
    - navigation
    - firebase hosting

  forbidden:
    - duplicate fitness domain logic
    - duplicate fuel domain logic
```

Das kann dein Scout regelmäßig aktualisieren.

---

# 11. Besonders wertvoll: Symbol-Index statt Dateiliste

Noch besser als:

```text
src/foo.js
src/bar.js
```

ist:

```yaml
symbols:

  workout_classification:
    canonical:
      - classifyWorkout()
    consumers:
      - ActivityWidget
      - HistoryCard
      - WeeklyReview

  muscle_recovery:
    canonical:
      - calculateRecovery()
      - calculateRelativeLoad()

  session_repository:
    canonical:
      - getSessions()
      - saveSession()
```

Damit entwickelt sich dein Agent-Wissen zu einer **Codebase Knowledge Graph**.

---

# 12. Lass Scouts explizit Divergenzen suchen

Das könnte bei dir sogar ein eigener Agent-Job werden.

Prompt sinngemäß:

```text
Find multiple implementations that derive the same concept.

Concept:
muscle recovery

Search for:
- recovery
- supercompensation
- muscleLoad
- fatigue
- readiness
- relativeLoad

Return implementations, call sites and differences.
Do not modify code.
```

Output:

```text
Found 4 implementations.

A calculateRecoveryScore
B deriveMuscleState
C getRecoveryPercent
D dashboardRecoveryStatus

A and B share algorithm.
C uses older constants.
D duplicates B inline.
```

Das ist genau die Art Problem, die deine aktuelle Bugliste vermuten lässt.

---

# 13. Ich würde Tasks deswegen in zwei Kategorien teilen

### Repair

```text
REPAIR FITNESS-001
```

Ein konkreter Defekt.

### Consolidation

```text
CONSOLIDATE FITNESS-DOMAIN-001
```

Beispiel:

> Alle Muscle Recovery Implementierungen auf eine Domain-Funktion konsolidieren.

Dann vermeidest du, dass ein Agent bei jedem Bug nur kleine Flicken draufklebt.

---

# 14. Worktrees passen sehr gut dazu

Da du sie schon benutzt:

```text
main repo
│
├── worktree/scout
├── worktree/fitness-001
├── worktree/muscle-consolidation
└── worktree/review
```

Aber ein Punkt ist wichtig:

**Scout-Agents sollten meistens keinen eigenen Branch brauchen.**

Die können read-only gegen denselben Checkout arbeiten.

Branches/Worktrees nur für Agenten, die tatsächlich Änderungen erzeugen.

Sonst produzierst du unnötig Git-Zustand.

---

# 15. Parallelisierung nur bei unterschiedlichen Ownership-Grenzen

Gute Parallelisierung:

```text
Agent A → Fuel reminder
Agent B → Supplement Gemini parser
Agent C → Fitness history
```

Schlechte Parallelisierung:

```text
Agent A → muscle status dashboard
Agent B → muscle tab
Agent C → supercompensation
```

Denn die drei werden wahrscheinlich dieselbe Domain-Schicht anfassen.

Dann erzeugen Agenten mehr Merge-Arbeit als Produktivität.

---

# 16. Ein Agent sollte der „merge authority“ sein

Ich würde niemals mehrere Implementierungsagenten selbständig in `master` integrieren lassen.

Flow:

```text
Scout
  ↓
Architect
  ↓
Implementation branch
  ↓
Tests
  ↓
Review Agent
  ↓
Integration Agent
  ↓
master
```

Der Integration-Agent beurteilt dabei insbesondere:

```text
Hat dieser Fix neue Divergenz erzeugt?
```

---

# 17. Sehr sinnvoll bei deinem Setup: automatisch erzeugte Task Dossiers

Du könntest lokal sowas haben:

```bash
agent investigate FITNESS-001
```

erzeugt:

```text
.agent/tasks/FITNESS-001/
├── task.md
├── context.md
├── files.txt
├── symbols.md
├── git-history.md
├── firestore.md
└── hypothesis.md
```

Dann:

```bash
agent implement FITNESS-001
```

Das High-End-Modell liest nur dieses Paket plus die relevanten Dateien.

Damit bekommst du tatsächlich eine Art **Token-Kompression durch Agenten**.

---

# 18. Das günstige Modell darf aber nicht die Wahrheit definieren

Das ist der wichtigste Vorbehalt.

Mini-Modell:

> „Ich glaube `history.js` ist kaputt.“

Großes Modell:

> „Okay, ändere ich.“

wäre gefährlich.

Besser:

```text
Scout output = evidence, not authority.
```

Also immer:

```yaml
evidence:
  - "History uses getActivityType"
  - "Dashboard uses classifyWorkout"
  - "Same Firestore session reaches both"

hypothesis:
  value: "classification divergence"
  confidence: 0.82
```

Dann darf das Implementierungsmodell die Hypothese verwerfen.

---

# 19. Für Firestore unbedingt noch eine vierte Architekturachse dokumentieren

Bei dir existiert faktisch:

```text
                   Local Dev
                       │
Standalone ─ Domain ─ Data
                       │
                    Firestore
                       │
                    VitalOS
```

Deshalb sollte jede Task explizit angeben:

```text
Runtime modes affected:

[ ] standalone + local
[ ] standalone + firestore
[ ] VitalOS + firestore
```

Das würde dein aktuelles Muskelstatus-Problem wahrscheinlich sofort übersichtlicher machen.

---

# 20. Mein bevorzugtes Gesamtsystem für dein Projekt

Ich würde langfristig ungefähr so denken:

```text
                    TASK BACKLOG
                         │
                         ▼
                  TRIAGE / SCOUT
             cheap model + ripgrep + git
                         │
                         ▼
                  CONTEXT PACKET
           files + symbols + data + git
                         │
                         ▼
                  ARCHITECT AGENT
              choose correct ownership
                         │
                         ▼
                  IMPLEMENT AGENT
               isolated git worktree
                         │
                         ▼
               TEST / REVIEW AGENTS
                         │
                         ▼
               INTEGRATION AGENT
                         │
                         ▼
                       MASTER
                         │
             ┌───────────┴──────────┐
             ▼                      ▼
      standalone deploy       VitalOS CI build
```

Und für mich wäre dabei das zentrale Architekturprinzip:

```text
Standalone apps own the domains.
VitalOS owns composition.
Firestore owns persisted shared state.
Local services own development/runtime augmentation.
```

Wenn du **diese Ownership-Grenze maschinenlesbar machst**, werden Claude Code, Codex und ähnliche Agenten wesentlich weniger Unsinn machen.

Der größte nächste Hebel wäre daher wahrscheinlich nicht noch ein weiterer Agent, sondern eine kleine `.agent/architecture/`-Knowledge-Base plus ein automatischer **Scout → Context-Packet**-Workflow. Dann wird aus deiner `TODO_AGENT.md` tatsächlich eine ausführbare Arbeitswarteschlange statt bloß einer Bugliste.
