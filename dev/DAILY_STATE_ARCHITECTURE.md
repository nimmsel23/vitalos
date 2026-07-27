# VitalOS Daily State Architecture

Status: proposal
Date: 2026-07-27
Scope: `/home/alpha/vitalos` umbrella architecture for `fitness`, `fuel`, `journal`, `habits`

## Core Reframe

`fitness` and `fuel` are not primarily separate apps.

They are domain-specific journaling writers:

- `fitness`: training and recovery journaling
- `fuel`: nutrition and supplement journaling

`journal` and `habits` should stop being treated as separate product silos.

They become composable surfaces over one shared daily data basis:

- `journal`: timeline and daily read model
- `habits`: recurring expectations, checks, streaks, compliance

The real product center becomes a single shared object:

- `daily_state`

## Target Shape

Each user has one canonical daily document per date.

Suggested identity:

- key: `uid + date`
- examples:
  - `alpha / 2026-07-27`
  - `client-123 / 2026-07-27`

Suggested top-level structure:

```json
{
  "uid": "alpha",
  "date": "2026-07-27",
  "version": 1,
  "meta": {
    "created_at": "2026-07-27T08:00:00Z",
    "updated_at": "2026-07-27T09:30:00Z",
    "sources": ["fitness", "fuel", "habits"]
  },
  "fitness": {
    "sessions": [],
    "plan_checks": [],
    "coverage": {},
    "recovery": {},
    "signals": []
  },
  "fuel": {
    "meals": [],
    "water_ml": 0,
    "supplements": [],
    "micros_sum": {},
    "signals": []
  },
  "habits": {
    "checks": [],
    "streaks": {},
    "compliance": {}
  },
  "journal": {
    "notes": [],
    "events": [],
    "summary": {}
  },
  "derived": {
    "day_score": null,
    "warnings": [],
    "highlights": []
  }
}
```

## Domain Roles

### Fitness

`fitness` remains the writer for:

- session logs
- training plan compliance
- coverage state
- recovery and inactivity signals
- exercise-linked notes

It should stop pretending to own the whole daily user story.

### Fuel

`fuel` remains the writer for:

- meal logs
- supplement logs
- water tracking
- macro/micro derived totals
- nutrition-linked signals

It should write daily nutrition state, not its own isolated world view.

### Habits

`habits` becomes a reusable behavior layer, not a separate tab silo.

It owns:

- recurring expectations
- per-day completion states
- streak calculation
- compliance rules

Examples:

- workout planned today
- creatine taken
- protein target reviewed
- water target hit
- mobility block done

### Journal

`journal` becomes a renderer and composition layer, not the primary storage authority.

It owns:

- timeline grouping
- narrative notes
- merged event presentation
- cross-domain daily summary

`journal` should read from `daily_state` and render it. It should not force every domain into journal-specific storage first.

## Writer Model

Use a producer model.

Each domain writes only its own namespace inside `daily_state`.

Allowed:

- `fitness` writes `fitness.*`
- `fuel` writes `fuel.*`
- `habits` writes `habits.*`

Restricted:

- domains do not directly mutate `journal.*`
- domains do not directly mutate each other's raw blocks

Shared or composed sections should be written by one composition layer:

- `journal.events`
- `journal.summary`
- `derived.*`

That layer can run:

- on write
- on demand
- in a background recompute

## Practical API Direction

Short-term API direction:

```text
GET  /daily-state/{date}
PATCH /daily-state/{date}/fitness
PATCH /daily-state/{date}/fuel
PATCH /daily-state/{date}/habits
POST /daily-state/{date}/recompute
GET  /daily-state/{date}/journal-view
```

Keep current domain endpoints for now.

Examples:

- `/session`
- `/nutrition/log`
- `/supplements`

But start making them write through adapters into `daily_state`.

## Storage Direction

There are two viable paths.

### Path A: Shared daily document first

Use one canonical JSON-like document store first.

Pros:

- simplest cross-app composition
- easiest for timeline rendering
- low friction for rapid iteration

Cons:

- weaker relational guarantees
- more care needed around concurrent patch merges

### Path B: Shared relational core plus derived daily document

Keep normalized domain tables, but materialize `daily_state`.

Pros:

- best long-term rigor
- easier analytics and migrations

Cons:

- higher implementation cost
- extra materialization layer

Recommended near-term choice:

- use a derived `daily_state` document as SSOT for the app surface
- allow underlying domain persistence to remain mixed during migration

That means the user-facing truth is `daily_state`, even if `fitness` and `fuel` still have old internal stores for a while.

## Why This Is Better Than "Merge All Backends"

Blind backend fusion would mix:

- fitness file/session storage
- fitness SQLite history
- fitness Firestore mirrors
- fuel SQL-first nutrition models
- frontend-serving concerns

That would create a large mixed monolith before the shared model is stable.

`daily_state` avoids that mistake:

- unify the contract first
- unify process boundaries second
- unify storage internals only where it clearly pays off

## Migration Plan

### Phase 1: Contract First

Create a schema package or document spec for `daily_state`.

Deliverables:

- canonical field names
- versioning strategy
- patch semantics
- event types

### Phase 2: Fitness Adapter

Add an adapter in `fitness` that can emit:

- sessions
- plan checks
- coverage summary
- recovery summary

into `daily_state.fitness`.

No UI rewrite required yet.

### Phase 3: Fuel Adapter

Add an adapter in `fuel` that can emit:

- meals
- water
- supplements
- micro totals

into `daily_state.fuel`.

### Phase 4: Habit Layer Extraction

Define habit objects independent of the current `habit-app` presentation.

Goal:

- `habit-app` becomes one consumer/editor for habit definitions
- habits are then rendered inside the shared daily surface as components

### Phase 5: Journal Composition

Make `journal-app` consume `daily_state` and render:

- chronological day flow
- grouped domain blocks
- combined summary cards

At this phase `journal` is mostly a read model plus notes UI.

### Phase 6: Shared Backend Shell

Only now build the single backend shell if still desirable.

Target shape:

- one FastAPI app
- separate packages:
  - `domains/fitness`
  - `domains/fuel`
  - `domains/habits`
  - `readmodels/journal`
  - `core/daily_state`

## Suggested Internal Model

If a unified backend is built later, use this split:

```text
core/
  daily_state/
  events/
  identities/
  time/

domains/
  fitness/
  fuel/
  habits/

readmodels/
  journal/
  dashboard/
  coach/
```

Key rule:

- domains write facts
- read models assemble views

## Daily State Event Types

Examples of useful shared event types:

- `fitness.session.logged`
- `fitness.plan.checked`
- `fuel.meal.logged`
- `fuel.water.updated`
- `fuel.supplement.logged`
- `habits.check.completed`
- `journal.note.added`

These can be rendered directly in a timeline without app-specific translation hacks.

## Immediate Practical Next Steps

1. Define `daily_state.schema.json` or a TypeScript/Pydantic schema package.
2. Decide whether the app-facing SSOT lives as JSON document, SQL row, or Firestore doc.
3. Implement one thin `fitness -> daily_state` adapter.
4. Implement one thin `fuel -> daily_state` adapter.
5. Make `journal-app` read a mocked combined `daily_state` before rewiring real writes.

## Non-Goals

Do not do these first:

- merge every backend module into one package immediately
- force `fitness` and `fuel` onto one DB engine before the contract is stable
- treat `journal` as the raw storage owner for every domain fact
- rebuild the UI around tabs again under new names

## Bottom Line

The fastest path to a coherent single product is not:

- `fitness + fuel -> one backend`

The better path is:

- `fitness + fuel + habits -> shared daily_state`
- `journal -> composed surface over that state`
- unified backend only after the shared contract proves itself
