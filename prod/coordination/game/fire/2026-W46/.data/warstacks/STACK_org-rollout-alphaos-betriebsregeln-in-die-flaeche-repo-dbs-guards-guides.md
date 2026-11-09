# War Stack: Org-ROLLOUT — AlphaOS-Betriebsregeln in die Flaeche (Repo-DBs, Guards, Guides)

**Week:** 2026-W45
**Created:** 2026-11-07T13:46:15.021669Z
**Author:** CEO (Vibe, WS1)
**ID:** babad36c-b0cd-4595-ac24-6f16a27ef50b

## Reflexive Inquiry

**Domain:** Production
**Sub-domain:** Systems

**Domino Door:** Die heute beschlossenen AlphaOS-Betriebsregeln (+hit=+br Tier, +hot=Potential, +go abgeschafft, Jar-Koeffizienten, War-Stack-UDAs, Org-Env ~/.org) erreichen jede der 9 Repo-Task-DBs und jede AL-Runde — sonst gilt die Philosophie nur auf dem Papier der Zentrale.

**Trigger:** Was hat dich hierher gebracht?
> 2026-11-07 hat der Owner die AlphaOS-Disziplin zur internen Firmenphilosophie erklaert und die Tag-Semantik mehrfach nach- geschärft (+hit=+br, +hot=Potential, +go abgeschafft). Die Org-taskrc steht — aber die 9 Repo-DBs der AL-Linien rechnen noch ohne Koeffizienten und ohne UDA-Deklaration, und ihr taskwarrior-Default faellt bei Fehlkonfiguration stillschweigend auf Daniels Privat-DB zurueck (Oracles Verifikationsfund, 182 private Tasks lesbar). Die AL-Runden laufen jede Nacht.

**Narrative:** Welche Geschichte erzaehlst du dir?
> Vermeidungsgeschichte: "Die Regeln gelten ja schon zentral, der Rollout kann warten." Ehrliche Fassung: Eine Philosophie, die nur im HQ rechnet, wird in den Naechten von 9 Linien ignoriert oder falsch angewandt — und der naechste Berichts-Stau entsteht dort, wo niemand hingeht. Der Rollout ist keine Deko, er ist die Vertragsunterzeichnung der Flaeche.

**Validation:** Was ist wirklich wahr?
> Notwendig, weil jede AL-Runde ohne Koeffizienten die Jar-Ordnung nur erraet und +go-Auftraege weiter vergeben kann; weil ohne UDA-Deklaration taskwarrior 3.5 War-Stack-Felder stillschweigend verwirft (Oracles Wegwerf-DB-Nachweis); und weil ohne Guard jede verschobene TASKRC-Variableprivate Daten der Flaeche expose.

**Impact on opening:** Was aendert sich, wenn sie aufgeht?
> Der Rollout oeffnet die echte Dezentralisierung: AL-Linien und CTO koennen Doors/Hits/Quadranten lokal gegen ihre eigene DB rechnen, die Sonntagswahl bekommt 9 glaubwuerdige Quadranten- Sichten statt einer Zentral-Sicht — und das Tent kann Auftraege direkt in die Repo-DBs stellen (CEO-Last sinkt).

**Consequences of inaction:** Was passiert, wenn sie zu bleibt?
> Ohne Rollout driftet die Flaeche: +go lebt in alten Guides weiter, Hot-Feuer wird falsch ausgefuehrt, War-Stack-Felder verschwinden lautlos in Repo-DBs — und der erste harte Datenqualitaetsfall in einer AL-Runde trifft eine Org, die geglaubt hat, die Regeln seien bereits verankert.

**Insights:**
> -

**Lessons Learned:**
> -

---

## 4 Hits (Fact / Obstacle / Strike / Responsibility)

### Hit 1
- **Fact:** Alle 9 Repo-taskrcs tragen die Koeffizienten (+hit 8.0, +br 8.0, +lr 2.0, +hot 1.0, +s -1.0) und die War-Stack-UDA-Deklarationen (Muster: Org-taskrc).
- **Obstacle:** Repo-taskrcs sind individueller Standard je AL-Einrichtung — ein Blindauffrischen kann laufende AL-Filters oder Kontexte brechen.
- **Strike:** Muster-Block vorgeben (Org-taskrc-Anhang), je Repo einmalig durch die CTO-Linie anwenden, danach quadrants --json als Gegenprobe je DB.
- **Responsibility:** CTO-Linie (Ausfuehrung je Repo) + CEO (Muster + Abnahme)

### Hit 2
- **Fact:** fleet-weiter Fallback-Guard: task-/taskpy-Wrapper verweigern den Lauf, wenn die angesprochene Repo-DB nicht per TASKRC erreichbar ist (Muster: vitalos.fish-Guard von Oracle, Funktionstest geliefert).
- **Obstacle:** Fisher conf.d kann Shell nicht via exit abbrechen — der Guard muss auf Wrapper-Ebene greifen, nicht auf Konfigurationsebene.
- **Strike:** Guard-Muster als dotfiles-Baustein, in orgsh + Rollen-Profilen aktiv; je Repo ein Negativ-Test (fehlerhaftes TASKRC -> Verweigerung).
- **Responsibility:** CTO-Linie (Ausfuehrung) + Oracle (Muster) + CEO (Abnahme)

### Hit 3
- **Fact:** AL-Guides und Rollen-Skills sind auf Stand: +go als Prio-Marker entfernt, +hit/+br-Tier und +hot=Potential beschrieben, Verweise auf ~/.org und die vos-* Skills vorhanden.
- **Obstacle:** 9 Guides + diversen Rollen-Dateien — Teilmenge kann uebersehen werden; Guides stehen in Repons, die AL-Linien jede Nacht lesen.
- **Strike:** Art je Repo gegenchecken (grep +go in AL-Guides), Nacherhebung als kleine Doku-Auftraege an die CTO-Linie ins Rolloutpaket legen.
- **Responsibility:** CTO-Linie (Anarbeitung) + CEO (Sichtpruefer)

### Hit 4
- **Fact:** Beweis je Repo: quadrants --json klassifiziert eine Testaufgabe korrekt nach der neuen Semantik, Negativfall (Guard) verweigert — eine REPORT-Zeile je Repo mit Belegen im STATUS.md.
- **Obstacle:** Zeitfenster: AL-Runden laufen 02:10-06:10 — Gegenproben ausserhalb der Rundenfenster legen, sonst Leerlaufrisiko.
- **Strike:** Sammelverifikation einmalig nach Rollout (nicht je Runde), Ergebnisse gebuendelt im Tent-Sonntag vorweisen.
- **Responsibility:** CTO-Linie (Lauf) + CEO (Abnahme im Tent)

```yaml
hits:
  - id: e1aab406-b62d-49d2-bb45-f71238248dc3
    task_uuid: 4c2f8d06-446c-4140-a3a5-bae69bb097f4
    fact: 'Alle 9 Repo-taskrcs tragen die Koeffizienten (+hit 8.0, +br 8.0, +lr 2.0, +hot 1.0, +s -1.0) und die War-Stack-UDA-Deklarationen (Muster: Org-taskrc).'
    obstacle: Repo-taskrcs sind individueller Standard je AL-Einrichtung — ein Blindauffrischen kann laufende AL-Filters oder Kontexte brechen.
    strike: 'Muster-Block vorgeben (Org-taskrc-Anhang), je Repo einmalig durch die CTO-Linie anwenden, danach quadrants --json als Gegenprobe je DB.'
    responsibility: CTO-Linie (Ausfuehrung je Repo) + CEO (Muster + Abnahme)
  - id: a89f54ee-7d52-43cd-a897-5526a3040c6f
    task_uuid: 48333e2a-53dc-4e8a-8bce-fa5645fe3122
    fact: 'fleet-weiter Fallback-Guard: task-/taskpy-Wrapper verweigern den Lauf, wenn die angesprochene Repo-DB nicht per TASKRC erreichbar ist (Muster: vitalos.fish-Guard von Oracle, Funktionstest geliefert).'
    obstacle: 'Fisher conf.d kann Shell nicht via exit abbrechen — der Guard muss auf Wrapper-Ebene greifen, nicht auf Konfigurationsebene.'
    strike: 'Guard-Muster als dotfiles-Baustein, in orgsh + Rollen-Profilen aktiv; je Repo ein Negativ-Test (fehlerhaftes TASKRC -> Verweigerung).'
    responsibility: CTO-Linie (Ausfuehrung) + Oracle (Muster) + CEO (Abnahme)
  - id: 220c6e13-2b82-4cf5-a428-99488c16f2ef
    task_uuid: 28982f46-7477-427f-81d4-f04f1785f58d
    fact: 'AL-Guides und Rollen-Skills sind auf Stand: +go als Prio-Marker entfernt, +hit/+br-Tier und +hot=Potential beschrieben, Verweise auf ~/.org und die vos-* Skills vorhanden.'
    obstacle: '9 Guides + diversen Rollen-Dateien — Teilmenge kann uebersehen werden; Guides stehen in Repons, die AL-Linien jede Nacht lesen.'
    strike: 'Art je Repo gegenchecken (grep +go in AL-Guides), Nacherhebung als kleine Doku-Auftraege an die CTO-Linie ins Rolloutpaket legen.'
    responsibility: CTO-Linie (Anarbeitung) + CEO (Sichtpruefer)
  - id: 8b282cf5-474c-4cf1-8463-68618d3ebd43
    task_uuid: 03aeb14a-d86d-4f9d-9d55-1e3391bb722a
    fact: 'Beweis je Repo: quadrants --json klassifiziert eine Testaufgabe korrekt nach der neuen Semantik, Negativfall (Guard) verweigert — eine REPORT-Zeile je Repo mit Belegen im STATUS.md.'
    obstacle: 'Zeitfenster: AL-Runden laufen 02:10-06:10 — Gegenproben ausserhalb der Rundenfenster legen, sonst Leerlaufrisiko.'
    strike: 'Sammelverifikation einmalig nach Rollout (nicht je Runde), Ergebnisse gebuendelt im Tent-Sonntag vorweisen.'
    responsibility: CTO-Linie (Lauf) + CEO (Abnahme im Tent)
```
