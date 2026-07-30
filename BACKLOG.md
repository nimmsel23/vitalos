# VitalOS / Fitness App — Sammel-Backlog

> Ziel: Bugs, divergierende Implementierungen und offene Architekturentscheidungen systematisch aufarbeiten.
>
> Grundregel für den Agenten:
>
> * Nicht sofort Workarounds bauen.
> * Zuerst bestehende Datenflüsse und Implementierungen untersuchen.
> * Bei divergierenden Implementierungen eine gemeinsame Source of Truth identifizieren bzw. herstellen.
> * Standalone-Fitness und VitalOS-Shell getrennt betrachten.
> * Bestehende funktionierende Logik möglichst wiederverwenden statt parallel neu implementieren.

---

# P0 — Daten- und Logikfehler

## FITNESS-001 — Workout-Historie klassifiziert Sessions mit HIIT-Finisher falsch

**Bereich:** Fitness → Verlauf / Dashboard

### Ist-Zustand

Im Dashboard-Widget „Aktivität & Konsistenz“ wird ein Workout mit anschließendem HIIT/Core-Finisher korrekt als eigentliches Krafttraining dargestellt, z. B.:

* Legs
* anschließend HIIT/Core Finisher

Im eigentlichen Verlauf-Tab wird dieselbe Session jedoch teilweise nur als:

* HIIT
* Ausdauertraining

klassifiziert.

Dadurch geht die eigentliche Krafttraining-Session semantisch verloren.

### Vermutung

Dashboard und Verlauf verwenden unterschiedliche Logik zur Bestimmung des primären Workout-Typs.

Möglicherweise wird im Verlauf einfach die letzte Activity bzw. der Finisher als Session-Typ verwendet.

### Aufgabe

1. Datenmodell einer betroffenen Session untersuchen.
2. Klassifikationslogik von:

   * Dashboard
   * Verlauf
     vergleichen.
3. Bestimmen, welche Implementierung korrekt ist.
4. Eine gemeinsame Klassifikationsfunktion / Source of Truth herstellen.
5. Sicherstellen, dass angehängte Finisher den primären Workout-Typ nicht überschreiben.

### Erwartetes Verhalten

Eine Legs-Session mit HIIT-Core-Finisher bleibt primär:

`Legs / Krafttraining`

Der Finisher wird zusätzlich dargestellt, aber ersetzt nicht die Hauptaktivität.

---

## FITNESS-002 — Muskelstatus verwendet divergierende Berechnungslogik

**Bereich:** Fitness → Dashboard / Muskeln

### Problem

Das Dashboard-Widget „Muskel Status“ scheint nicht dieselbe Berechnung zu verwenden wie die eigentliche Muskel-/Superkompensationslogik der App.

Zusätzlich zeigt der `Muskeln`-Tab offenbar andere Ergebnisse als das Muskelstatus-Widget im Dashboard.

### Weitere Auffälligkeit

Es könnte zusätzlich Unterschiede zwischen:

* Local Mode / lokaler DB
* Firebase / Cloud Mode
* API-basierten Daten

geben.

### Aufgabe

Alle Implementierungen für folgende Konzepte finden:

* relative Muskelbelastung
* Recovery
* Superkompensation
* Muscle Status
* Training Load

Danach dokumentieren:

```txt
Input-Daten
→ Berechnungsfunktion
→ Normalisierung
→ Statusermittlung
→ UI
```

für:

1. Dashboard Muskelstatus
2. Muskeln Tab
3. lokale Daten
4. Firebase-/Cloud-Daten

### Ziel

Eine einzige kanonische Berechnung definieren.

Dashboard und Muskeln-Tab sollen dieselbe Domain-Logik verwenden und nur unterschiedliche Views darauf darstellen.

---

## FITNESS-003 — Muskel → passende Übungen funktioniert nur teilweise

**Bereich:** Fitness → Muskeln / Exercise Catalog

### Ist-Zustand

Beim Klick auf einen Muskel im Highlighter werden häufig keine passenden Übungen angezeigt.

Funktionierende Beispiele:

* Gesäß
* Beinbeuger

Bei vielen anderen Muskeln fehlen passende Exercises.

### Zusätzlich

Wenn eine passende Übung angezeigt wird, kann sie teilweise nicht geöffnet werden.

### Prüfen

* Muscle IDs
* Anatomy IDs
* Exercise-Muscle-Mappings
* Alias-/Legacy-IDs
* local vs. Firestore Catalog
* Routing zum Exercise Detail Inspector

### Erwartetes Verhalten

Jeder Muskel mit bestehenden Exercise-Mappings zeigt passende Übungen.

Eine angezeigte Übung ist anklickbar und öffnet zuverlässig ihre Detailansicht.

---

## FITNESS-004 — Wochenreport lädt nicht

**Bereich:** Fitness → Review

### Fehler

`Wochenreport konnte nicht geladen werden.`

Keine erkennbare Fehlermeldung in der Browser-Konsole.

### Kontext

Der Fehler könnte seit dem letzten Rewrite des Exercise Catalogs bzw. angrenzender Funktionen bestehen.

### Aufgabe

Nicht nur UI-Fehlerbehandlung ergänzen, sondern zuerst den vollständigen Datenpfad verfolgen:

```txt
Review Tab
→ Report Loader
→ Workout/Sessions Query
→ Catalog Resolution
→ Aggregation
→ Rendering
```

Dabei nach still geschluckten Exceptions / leeren Fallbacks suchen.

### Erwartetes Verhalten

Der Wochenreport wird aus vorhandenen Sessions zuverlässig generiert.

Fehler werden diagnostizierbar geloggt und nicht still verschluckt.

---

# P1 — Coach / Exercise Catalog

## COACH-001 — Inbox enthält bereits lokal freigegebene Exercises

**Bereich:** Fitness → Coach → Inbox

### Problem

Exercises wurden lokal offenbar bereits:

* approved
* auf Expert Status gesetzt

In Firebase erscheinen sie jedoch weiterhin in der Coach Inbox.

### Zu klären

Welche Ebene besitzt aktuell den kanonischen Approval-Status?

Mögliche Quellen:

* lokaler Catalog
* runtime JSON
* Firestore
* Sync Layer
* Coach-specific metadata

### Aufgabe

Approval-Datenfluss untersuchen:

```txt
local approval
→ runtime/catalog
→ sync
→ Firestore
→ Coach Inbox query
```

### Erwartetes Verhalten

Bereits freigegebene Expert-Exercises erscheinen nicht erneut als offene Coach-Inbox-Einträge.

---

## COACH-002 — Exercise Approval Modal / CoachSheet fehlt

**Bereich:** Coach → Inbox

Für Exercises fehlt im Inbox-Subtab eine vollständige Exercise-Detail-/Approval-Ansicht.

### Benötigt

Beim Öffnen eines Inbox-Exercises sollte eine sinnvolle Exercise-Ansicht erscheinen mit mindestens:

* Name
* Exercise-Metadaten
* Muskeln
* Equipment
* Movement Pattern
* Catalog Status
* Approval Status
* relevante Coach-Aktionen

### Ziel

Kein separater Dummy-Screen, sondern möglichst Wiederverwendung des normalen Exercise Detail Inspectors.

---

## COACH-003 — Catalog Browser zeigt zu wenig Informationen

**Bereich:** Coach / Exercise Catalog

### Problem

Der Katalog-Browser zeigt aktuell nur sehr begrenzte Informationen.

Erst der Detail Inspector liefert zusätzliche Daten.

Der Inspector führt jedoch teilweise auf eine CoachSheet-„Übung-Dummypage“.

### Aufgabe

Catalog Browser und Detail Inspector als zusammenhängendes UI-System aufarbeiten.

### Catalog Browser sollte bereits sinnvoll zeigen

* Exercise Name
* Primary Muscles
* Secondary Muscles
* Equipment
* Movement Pattern
* Status / Approval
* ggf. Source

### Detail Inspector

Soll vollständige Exercise-Daten zeigen und eine echte wiederverwendbare Komponente sein.

Keine Dummy-Exercise-Page.

---

## ARCH-001 — Coach Tab aus VitalOS Shell entfernen?

**Typ:** Architekturentscheidung

### Beobachtung

Der Coach Tab ist derzeit praktisch ausschließlich fitnessbezogen.

VitalOS selbst benötigt wahrscheinlich keinen globalen Coach Tab.

### Mögliche Zielarchitektur

```txt
Standalone Fitness
└── Coach
    ├── Inbox
    ├── Catalog
    └── Review/Approval

VitalOS Shell
└── kein globaler Coach Tab
```

### Aufgabe

Prüfen:

* ob andere VitalOS-Apps den Coach Tab verwenden
* ob Shell-Routing davon abhängt
* welche Coach-Komponenten Fitness-only sind

Wenn keine Cross-App-Abhängigkeit existiert:

Coach Tab aus der VitalOS Shell entfernen und im Standalone-Fitness behalten.

---

# P1 — Sessions

## SESSION-001 — Vergangene Workouts fehlen im Session Tab

**Bereich:** Fitness → Session

### Ist-Zustand

Vergangene Sessions sind sichtbar:

* im Verlauf-Subtab
* als Häkchen in der Datumswahl

Sie werden aber nicht vollständig im eigentlichen Session-Bereich angezeigt.

### Firestore

Die Sessions scheinen in Firestore vorhanden zu sein und verwenden bereits aktuelle Muscle IDs.

Damit scheint zumindest die Runtime-/Firestore-Migration grundsätzlich funktioniert zu haben.

### Aufgabe

Datenquellen vergleichen:

```txt
Session Tab query
vs.
Verlauf query
vs.
Calendar/date marker query
```

Prüfen, warum dieselben Sessions von verschiedenen Views unterschiedlich gefunden werden.

### Ziel

Alle Session-bezogenen Views greifen auf dieselbe Session-Repository-/Query-Schicht zu.

---

# P1 — Fuel Integration

## FUEL-001 — Größe und Gewicht in Fuel Settings ergänzen

**Bereich:** Fuel → Settings / Profile

Für automatische Makroberechnungen benötigt Fuel mindestens:

* Körpergröße
* Körpergewicht

### Prüfen

Bevor neue Felder eingeführt werden:

Existieren diese Werte bereits im globalen VitalOS User Profile?

Wenn ja, sollen sie nicht redundant gespeichert werden.

### Ziel

Fuel verwendet nach Möglichkeit das zentrale User Profile als Source of Truth.

---

## FUEL-002 — Micros Push Reminder aus Setup verschieben

**Bereich:** Fuel → Micros

Der Push-Reminder für Micros gehört semantisch in den Micros-Bereich und nicht in den Setup Tab.

### Ziel

Reminder-Konfiguration direkt im Micros Tab bzw. dessen Settings integrieren.

---

## ARCH-002 — Fuel für VitalOS Shell reduzieren

**Typ:** Architektur / UX

### Problem

Die vollständige Standalone-Fuel-Navigation ist innerhalb von VitalOS vermutlich zu umfangreich.

### Idee

Standalone:

```txt
Fuel App
├── mehrere Tabs
├── Setup
├── Micros
├── ...
```

VitalOS:

```txt
Fuel
└── kompakter integrierter Fuel View
```

### Aufgabe

Prüfen, ob für VitalOS ein eigener Wrapper sinnvoll ist, der nur zentrale Fuel-Komponenten zusammensetzt.

Standalone-Fuel soll dabei vollständig bleiben.

### Ziel

Keine zwei getrennten Fuel-Implementierungen.

Stattdessen:

```txt
shared Fuel components
        ↓
Standalone layout
        +
VitalOS compact layout
```

---

# P2 — Supplements

## SUPPLEMENT-001 — Supplement Tab aufräumen

**Bereich:** Fuel / Supplements

Der Supplement Tab benötigt allgemeines UI-/Struktur-Cleanup.

Vor Änderungen zuerst bestehende Komponenten und Datenflüsse inventarisieren.

Nicht unnötig neu schreiben.

---

## SUPPLEMENT-002 — Gemini „Supplement hinzufügen“ liefert JSON Parse Error

**Bereich:** Supplements / Gemini Integration

### Fehler

Beim Gemini-Aufruf zum Hinzufügen eines Supplements zum Catalog entsteht:

`JSON error: line 1 column 1`

### Wahrscheinliche Fehlerklasse

Die Antwort ist vermutlich:

* leer
* kein JSON
* Markdown-Codeblock
* API-Fehlertext
* HTML
* oder wird falsch geparsed

### Aufgabe

Vor dem JSON Parsing:

* HTTP/API Status prüfen
* Raw Response loggen
* Content-Type prüfen
* Gemini Response-Struktur prüfen

Danach Parser robust machen.

### Wichtig

Nicht einfach `try/catch` um `JSON.parse()` legen und den eigentlichen API-Fehler verstecken.

### Erwartetes Verhalten

Gemini Response wird entweder:

1. korrekt als Supplement-Catalog-Objekt verarbeitet

oder

2. mit einer verständlichen diagnostischen Fehlermeldung abgebrochen.

---

# P2 — VitalOS Shell

## SHELL-001 — Eingeklappte Sidebar verbessern

**Bereich:** VitalOS Shell

### Problem

Im collapsed Zustand ist die Sidebar aufgrund der Anzahl an Icons nicht zufriedenstellend.

### Aufgabe

Navigation inventarisieren und prüfen:

* welche Items wirklich global sein müssen
* welche App-spezifisch sind
* welche zusammengefasst werden können
* welche nur innerhalb eines App-Wrappers existieren sollten

### Zusammenhang

Diese Aufgabe hängt wahrscheinlich mit folgenden Architekturentscheidungen zusammen:

* `ARCH-001` Coach aus VitalOS entfernen
* `ARCH-002` Fuel kompakter integrieren

Daher Sidebar erst nach diesen Entscheidungen final überarbeiten.

---

# Übergreifende technische Aufgabe

## ARCH-003 — Divergierende Domain-Logik reduzieren

Mehrere aktuelle Bugs weisen auf dasselbe strukturelle Problem hin:

Dieselbe Information wird in verschiedenen Views unterschiedlich berechnet oder interpretiert.

Betroffene Bereiche:

* Workout-Typ
* Session History
* Muscle Load
* Superkompensation
* Exercise-Muscle-Mapping
* Approval Status
* Local vs Cloud State

### Zielarchitektur

UI-Komponenten sollten möglichst keine eigene Domain-Logik besitzen.

Beispiel:

```txt
Firestore / Local DB
        ↓
Repository
        ↓
Domain Logic
        ↓
Selectors / View Models
        ↓
Dashboard
Muskeln
Verlauf
Session
Coach
```

Nicht:

```txt
Dashboard → eigene Berechnung
Muskeln   → eigene Berechnung
Verlauf   → eigene Berechnung
Session   → eigene Berechnung
```

### Agent-Aufgabe

Bei jedem bearbeiteten Bug prüfen, ob eine lokale Sonderimplementierung entfernt und durch bestehende gemeinsame Domain-Logik ersetzt werden kann.

---

# Empfohlene Bearbeitungsreihenfolge

1. `FITNESS-001` Workout-Klassifikation
2. `FITNESS-002` Muskelstatus / Superkompensation
3. `SESSION-001` Session Queries vereinheitlichen
4. `FITNESS-003` Muscle → Exercise Mapping
5. `FITNESS-004` Wochenreport
6. `COACH-001` Approval Sync
7. `COACH-002` + `COACH-003` Coach/Catalog UI
8. `ARCH-001` Coach aus Shell?
9. `FUEL-001` + `FUEL-002`
10. `ARCH-002` Fuel Shell Integration
11. `SUPPLEMENT-002` Gemini JSON Fehler
12. `SUPPLEMENT-001` Supplement UI Cleanup
13. `SHELL-001` Sidebar finalisieren

---

# Definition of Done für Agenten

Eine Aufgabe gilt nicht allein deshalb als erledigt, weil der sichtbare Bug verschwunden ist.

Vor Abschluss prüfen:

* [ ] Ursache identifiziert
* [ ] keine unnötige zweite Implementierung eingeführt
* [ ] Local und Cloud Mode geprüft, sofern relevant
* [ ] bestehende Source of Truth verwendet
* [ ] Fehlerzustände sichtbar / diagnostizierbar
* [ ] Standalone-App weiterhin funktionsfähig
* [ ] VitalOS-Integration weiterhin funktionsfähig
* [ ] keine bekannten Legacy-IDs / alten Datenpfade versehentlich reaktiviert
* [ ] Build erfolgreich
* [ ] relevante Tests erfolgreich
