# game/ — AlphaOS-Disziplin der VitalOS-CEO-Rolle

Angelegt 2026-11-07 von oracle (Erstauftrag: AlphaOS für den CEO aufbauen).
Maßstab: `/home/alpha/aos/THE-ALPHA-CODE.md` — REAL + RAW + RELEVANT + RESULTS.
Geltungsbereich: DIE GESAMTE ORG (AlphaOS = INTERNE Firmenphilosophie, Owner-Entscheidung 2026-11-07; nicht nach aussen) — CEO, CTO, PM, ALs, Angestellte. Daniels privater AlphaOS-Bereich (body/being/balance/business-Maps, sein Taskwarrior, seine persoenlichen Scores) bleibt ausschließlich seiner — Werkzeuge-Ebene des Dispatchers wird nur gelesen/parametrisiert, nicht in sein Verzeichnis geschrieben.

## Struktur

```
game/
  GAME-RUN-2026-W45.md          # THE GAME einmal durchlaufen (Frame→Freedom→Focus→Fire) + Ergebnis
  frame/2026/                   # Frame Map (REAL/RAW/RELEVANT/RESULTS)
    ceo.yaml                    #   Domain CEO — AlphaOS-Frame-Schema (5 Original-Fragen)
    vitalos-prod.yaml           #   Domain VITALOS-PROD
    frame.md                    #   Composite Frame Map (die lesbare Kriegskarte)
  freedom/2026/                 # Freedom Map — Annual Freedom Game
    ceo.yaml                    #   Single Freedom Goal (2027-11-07: Abos decken Betriebskosten
                                 #   + Ueberschuss) + Monats-/Quartals-Brecher
  focus/2026-Q4/                # QUARTALS-FOKUS (aus Freedom gebrochen, 2026-11-07)
    focus.md                    #   M1-RC · M2-Testuser-Woche · Premium-Fundament
  focus/2027-freedom-pfad.md    # 2027-Bahn bis 2027-11-07 (rollierend: Quarterly-Detail erst im Vorkuartals-Review)
  missions/2026-11/             # MONTHLY MISSION November: M1-RC steht + M2-Vorbereitung (faellig 2026-11-29)
  missions/2026-12/             # MONTHLY MISSION Dezember: Premium-Subscription live (faellig 2026-12-23)
  fire/2026-W45/                # Fire Map — weekly war
    STACK_M1-RC.yaml + .md      #   Domino Door: M1-RC (War Stack, Chapter 28)
    side-door-digest-qualitaet.md          # Neben-Door 1
    side-door-roadmap-drilldown-abnahme.md # Neben-Door 2
```

## Ziel-Hierarchie (ab 2026-11-07 verbindlich): Annual Freedom Game → Quartals-Fokus → Monthly Mission → Weekly Doors

Jede Ebene bricht die obere auf — nichts existiert parallel zur Kaskade:

| Ebene | Takt | Inhalt |
| --- | --- | --- |
| **Annual Freedom Game** | bis **2027-11-07** | VitalOS-Abos decken die Betriebskosten inkl. Claude-Max-Abo **plus Überschuss** · [freedom/2026/ceo.yaml](freedom/2026/ceo.yaml) |
| **Quartals-Fokus** | Q4/2026 | M1-RC, M2-Testuser-Woche, Premium-Fundament (Observe free, Premium = KI-Layer) |
| **Monthly Mission** | Monatsultimo fällig | Jede Mission = EIN Arbeitspaket · Nov: M1-RC steht + M2-Vorbereitung · Dez: VitalOS Premium-Subscription live für Nicht-LLM-Nutzer (KI-Vorteile ohne LLM-Kontakt) |
| **Weekly Doors** | So 12:00 | Domino Door (EIN War Stack) + max. 2 Neben-Türen · s. [fire/](fire/) |

Taskwarrior-Anker (Projekt = jeweils betroffenes Repo, Rolle im Tag; Owner-Regeln 2026-11-07): Tasks **1–7 (Org-DB, 7 = Urgency-Koeffizienten-Rollout +cto)** (1 Freedom-Goal/2027 +freedom · 2 Q4-Fokus +fokus · 3 Nov-Mission +fire+br · 4 Dez-Mission +fire+br · 5 W45/46-Domino M1-RC +br · 6 Org-Standard-Engine +freedom) — Org-Taskwarrior, GLOBALE Org-DB TASKRC ~/.local/state/vitalos-org/taskrc (Owner-Weisung 18:2x 2026-11-07: EINE DB fuer die Org statt Rollen-/Repo-Silos; Rollen via Tags +ceo/+cto/+al, Repo via project). **Verwaltung bleibt beim CEO** — diese Struktur verlinkt die Anker nur, sie verwaltet taskwarrior nicht.

## Wöchentlicher Rhythmus (Vorschlag, ab W45 geltend bis Owner-Wort)

- **So ~12:00 CET — GENERAL'S TENT (Kap. 41, tent-Modul; der Tent ist ALLES — Ueber-Ritual ueber Game/Door/Core/Voice, s. Skill vos-tent):** Vier Komponenten in fester Ordnung — 1) Return & Report (brutal ehrlich: dient das Jahresziel der IPW? gewinnt der Fokus-Horizont Momentum? wurde der Weekly War gewonnen? Org-Messung via Karten + Task-DB, nicht Daniels private 28/7/21-Scores), 2) Lessons Learned (was wirkte/versagte, Uebertrag von Lektionen zwischen Bereichen), 3) Course Correction (Kurs korrigieren, nicht verhandeln), 4) New Targets (neue Ziele auf dem nuetzlichen Fokus-Horizont; Door-Wahl nach vos-door-plan). Das Tent ist der woechentliche Rueckkehr-Moment, KEIN Frame-Nachtrag (Kap. 41: Frame etwa jaehrlich oder bei echtem Wandel; RAW-Refresh monatlich bleibt eigenes Intervall). Nur EIN War Stack pro Woche, Neben-Tueren max. 2.
- Trennung Profit vs. Tent (Owner-Klarstellung 2026-11-07): PROFIT (Kap. 30) ist Door-Phase 4 — die Ernte der Hit-Liste am SAMSTAG (Achieved/Done, Yield, 3-Zeiler). DAS TENT (Kap. 41, tent-Modul, KEIN Game-Bestandteil) ist das Ueber-Ritual ueber allen Saeulen am Sonntag — sie NIMMT den Profit-3-Zeiler als EINEN Punkt im Return & Report auf und entscheidet darueber (Lessons, Course Correction, New Targets). Verschiedene Ebenen, verschiedene Kapitel, keine Verschmelzung.
- **Mo–Fr — Lauf:** Hits der Doors via Ausführungslinie; CEO nimmt nur ab (TODO.md-CEO-Sektionen, append-only).
- **Sa — Profit-Sichtung (Kap. 30):** Die zwei Fragen — Door geoeffnet? Alle Hit-Ziele getroffen? (Achieved vs. Done aus Task-DB done+Annotation). Yield lesen: Rhythmus/Pace, starke und ausgerutschte Stellen — Wert des Erreichten, keine Task-Zaehlung. Facts als 3-Zeiler; Blocker nur kompakt (Digest-Regel). Winners keep score.
- **Monatsultimo — Mission:** Monats-Arbeitspaket fällig (Nov: M1-RC+M2-Vorbereitung / Dez: Premium-Subscription live) — Abnahme mit Monats-Review, Übertrag in Q4-Fokus-Sicht.
- **Quartalsende — Fokus-Review:** Q4/2026 (M1-RC, M2, Premium-Fundament) gegen Freedom-Goal-Sicht prüfen; RAW-Aktualisierung der Frame.
- **2027-11-07 — Freedom-Game-Ziel:** Abos ≥ Betriebskosten (inkl. Claude-Max) + Überschuss.
- **täglich 23:45 — läuft bereits:** ceo-run-Digest in ~/.local/state/vitalos-ceo/CEO.md (bleibt unberührt von dieser Struktur; wird nur gelesen).

## Konventionen (von AlphaOS übernommen)

- Frame-Fragen bleiben im englischen Original; Frame-Felder: domain/year/updated/period/type/kind/status/questions.
- Fire: pro Woche EIN War Stack (Trigger/Narrative/Validation/Impact/Consequences + 4 Hits: Fact/Obstacle/Strike/Responsibility).
- KEEP-SHUT-VERMERKE (Kap. 25, Chaos of Abundance): Die Door War beschliesst auch verschlossene Tueren — Potential + Grund (z. B. 'Zeitverschwendung fuer halbfertiges Produkt'). Der Vermerk verhindert Zombie-Potenziale: Was zu war, kommt nicht jede Woche neu auf den Tisch, nur wenn sich der Frame aendert und die Notiz das nennt.
- CHAPTER SCHLAEGT PYTHON (Owner-Weisung 2026-11-07): Disziplin-SSOT sind die Chapter-Texte. Zwischen Chapter und Werkzeug (Python, Scripts, auch handgebauten Maps) ist nie das Werkzeug rechtens: unstimmige Felder/Schemata/Ablaeufe werden zugunsten des Chapters geaendert. Nichts erfinden, was kein Chapter vorschreibt (Beispiel: messbare per-Front-Results in der Focus-Map — Kap. 34 kennt sie nicht, Messbarkeit gehoert zur Profit-Phase Kap. 30).
- Fire-Simplicity (Kap. 35): Hits schlicht, direkt, ohne Verzierung — Klarheit ist das Ziel, nicht Cleverness. Takt/Skalen sind Stuetze, keine Regel; aendern nur, wenn es Klarheit bringt.
- Door vs. Domino (Owner-Klarstellung 2026-11-07): Die DOOR ist das Arbeitspaket selbst (z. B. eine neue Funktion in die App einfuehren). Das DOMINO ist keine zweite Aufgabe, sondern die Wirkung — zu welchen Moeglichkeiten diese Door fuehrt (impact on opening). Gewaehlt wird die Door mit dem groessten Domino-Effekt, kurz begrundet im War Stack.
- Eisenhower-Waechte (Kap. 27): Dringlichkeit (Urgency: due) und Wichtigkeit (+br Rocks aus Mission/Fokus) sind zwei Achsen. Q1 (Krisenmodus) nicht dauerhaft bewohnen, Q3 (Illusion der Dringlichkeit: Doppelberichte, Meta-Runden) abschneiden, Q4 (Prokrastination) meiden.
- Q2-WAHLNORM (Kap. 27, Door War): Die Wochen-Door wird bevorzugt aus QUADRANT 2 gewaehlt — wichtig, ohne unmittelbare Frist; chosen, not forced. Missions-Hits (Q1-artige Pflichten wie RC-Ruf/M2) laufen als Hits weiter, ohne das Door-Wahl-Recht zu kassieren. Beispiel Q2-Bestand: Premium-Fundament, Betriebskosten-Monatsblatt.
- Hot-List-Semantik (Owner-Klarstellung 2026-11-07, Kap. 26): +hot ist POTENTIAL — ungepruefte Moeglichkeit, noch keine Door, kein War Stack, nicht automatisch dringend. Die Door War (Sonntagsrunde) entscheidet anhand Prio/Urgency, ob ein Potential jetzt durch die Door geht oder als Zeitverschwendung verfaellt (Beispiel: endlose Emulator-Tests fuer ein halbfertiges Produkt).
- Taskwarrior-Vertrag der CEO-Org (`vitalos.*`, s. coordination/CEO-DEPARTMENTS-KONZEPT.md) ist noch nicht ratifiziert — bis dahin sind die YAML/MD hier SSOT, Übernahme mit hit_uuids folgt nach Freigabe.
- Ergebnisse dieser Struktur werden in coordination/TODO.md (CEO-Sektion) referenziert; STATUS.md bleibt die Bericht-Inbox der Linien.

## Pfad-Regeln

- Keine Löschungen, kein git-push, keine Secrets, keine privaten Daniel-Daten — CEO-Artefakte nur hier.
- Ältere Wochenlandungen bleiben liegen (fire/2026-W45, fire/2026-W46, …) — nothing gets deleted, new weeks add new directories.
