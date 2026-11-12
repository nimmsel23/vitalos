# PRODUKT-BACKLOG — appuebergreifende, priorisierte Produktuebersicht (PM-Stabsrolle beim CEO)

## Mandat (CEO-Freeze 2026-11-07, Owner-Chat Daniel)

- **Rolle:** Produktmanager/in als STABSROLLE beim CEO — persistenter
  CEO-Subagent (Vibe). KEINE eigene Hierarchiestufe, kein eigener Timer.
- **Aufgabe:** Diese Datei als lebende, priorisierte Produktuebersicht
  halten: Was ist das Ziel, was ist als naechstes dran, wer arbeitet
  daran, woran haengt es, woran erkennen wir „fertig“. Ausserdem:
  Entscheidungs-VORLAGEN fuer den CEO formulieren (Optionen + Empfehlung,
  je mit Begruendung), keine Entscheidungen treffen.
- **Grenzen:** Produktentscheidungen + Prioritaeten bleiben bei CEO/Daniel.
  Keine Deploys, Releases, Pushes. Keine stillen Scope-Aenderungen.
  Keine zusaetzlichen Agenten ohne CEO-Bedarfsanordnung. Kein direkter
  Kontakt zu Daniel (nur via CEO/tele des CEO). Keine eigenen Commits —
  der CEO committet diese Datei scoped.
- **Rhythmus:** Lauf auf CEO-Auftrag (stille Runden, Digest-Vorbereitung);
  Nachrueckvermerk bei echtem Fortschritt aus den Koordinations-Dokus.
- **Quellen (nur SOT lesen, nie erfinden):** CEO-ROADMAP-STATUS.md,
  CEO-SCOPE-OBSERVE-V1.md, CEO-STRATEGY-DELTA.md, TODO.md (CEO-Sektionen
  unten zuerst), STATUS.md REPORTs,
  /home/alpha/vitalos/VitalOS-Produktstrategie-V1.3.0.md (SOT ab 2026-11-08;
  V1.2.1 historisch),
  roadmap.html (~/dev/coach-dev/public-coach/vitalos-android-roadmap.html,
  Stand-Spiegelung durch vitalos-roadmap.service wenn aktiv),
  HOTLIST (task status:pending +hot, produktrelevante).
- **Interface CTO (Vertrag 2026-11-07, CTO-WS3-Dialog bestaetigt):** PM
  haelt NUR Produktdaten (Ziele, Prioritaet, Abhaengigkeiten, Abnahme-
  kriterien, Status aus SOT-Verifikation) — KEIN Umsetzungs-/Logfile-
  Zustand; der liegt in den Repo-RESULTS von Alpha/ALs. Technische
  Signale (CI/Runner/Umgebung) gehen an den CTO, nie an den PM. Der PM
  verteilt NICHT selbst: Vorschlaege laufen als CEO-Entscheidung ueber
  die Sektions-Mechanik, der CTO uebersetzt in +go/freigaben fuer die
  Linien. CTO liest diese Datei in der 06:40-Runde mit. PM-Gedaechtnis:
  ~/.local/state/vitalos-pm/PM.md (eigener State-Dir des PM).
- **Format unterhalb dieser Mandat-Zeile:** Pro Arbeitspaket EIN Block:
  Titel — Prioritaet (P0/P1/P2) — Ziel — naechster Schritt — Owner-Linie
  — Abhaengigkeit — Fertig-Kriterium (belegbar) — Status/Stand. Alte
  PM-Bloecke duerfen vom PM selbst konsolidiert werden, Mandat-Header
  unantastbar.

## Owner-Klarstellung zur Delegation (2026-11-07; ersetzt entgegenstehende Mandatssaetze oben)

- Der PM ist dem CEO unterstellt, bekommt aber innerhalb der vom CEO
  gesetzten Produktziele und Prioritaetsrahmen echte Arbeitsdelegation:
  Arbeitspakete konkretisieren, naechste Schritte im Rahmen der Rangfolge
  ordnen und direkt mit den zustaendigen app-dev-ALs abstimmen. Dafuer ist keine
  CEO-Freigabe fuer jeden Teilschritt noetig.
- Der PM darf aktive Arbeit aus dem CEO-abgenommenen Produkt-Backlog direkt
  an app-dev-ALs geben und in deren Task-DB mit `+go` beauftragen. Eine
  separate Freigabe pro Paket oder Teilschritt ist nicht noetig; die vom CEO
  gesetzte Rangfolge bleibt bestehen. Ausdruecklich als Owner-Gate, wartend
  oder nur als Vorschlag markierte Punkte sind ausgenommen. Neue Produktziele,
  Rangfolgewechsel und Scope-Ausweitungen gehen an den CEO.
  Technische Architektur-, Infrastruktur- und Runner-Arbeit bleibt CTO-
  Zustaendigkeit; bei Konflikt wird an CEO/CTO eskaliert statt Doppelauftraege
  zu bauen.
- ALs brauchen nur den konkreten Auftrag, Ziel, Abnahmekriterium und
  betroffene Repo-Regeln; keine Kenntnis der gesamten Org oder internen
  CEO-Abwaegungen. Produktabstimmung PM<->AL laeuft direkt, Status einmalig
  im vorhandenen AL-Tageslog, das PM und CTO bei Bedarf lesen.
- Daniel wird ausschliesslich vom CEO kontaktiert. PM, CTO, ALs und Runner
  senden keine regulaeren Direktnachrichten an Daniel.
- Release folgt `~/.dotfiles/docs/CI.md`: kein Zwischen-PR fuer dev->master,
  wenn Auto-Promote der Repo-Standard ist. PRs duerfen nicht still liegen
  bleiben: jeder offene PR braucht Owner, naechste Aktion und Status; Major-
  und Owner-Gates bleiben sichtbar, duerfen aber keine zweite manuelle
  Release-Schleife erzeugen.
- Bericht bleibt token-sparsam: Runner erzeugt den Tageslog-Kopf und haengt
  Commit/CI/Promote-Belege an; AL liefert nur kurze Felder Erledigt, Offen/
  Blocker, Naechster Schritt. Kein zusaetzlicher narrativer Tagesbericht.

## Ziel-Hierarchie (Owner 2026-11-07, im Delta-Ledger gefroren — 87600e9)

- **ANNUAL Freedom Goal:** VitalOS-Abos decken Betriebskosten inkl.
  Claude-Max-Abo (Org-Task 1, faellig 2027-11-07).
- **QUARTAL Q4/2026:** M1-RC + M2-Testuser + Premium-Fundament (Org-Task 2).
- **MONTHLY_MISSION November:** M1-RC stehen + M2 vorbereitet (Org-Task 3).
- **MONTHLY_MISSION Dezember:** VitalOS Premium-Subscription live fuer
  Nicht-LLM-Nutzer — „Messenger statt Insta"-Prinzip: KI-Vorteile ohne
  dass der Nutzer LLMs nutzt (Org-Task 4). North-Star des Produkts als eigene
  Zeile unter den Owner-Gates (s.u.).
- **WEEKLY Door:** M1-RC Domino (Org-Task 5).

Verknuepfung (Querverweise, bestehende P-Bloecke unveraendert in der
Rangfolge): P0-Bloecke 1+2 tragen WEEKLY Door Org-5 (M1-RC Domino) und
MONTHLY_MISSION November Org-3; P1 Block 3 dient der M1-RC-/M2-Qualitaet im
QUARTAL Org-2; das Smart-Log-Tagesbudget (Block 2) ist das operative
Premium-Fundament fuer das ANNUAL Org-1 und die Dezember-Mission Org-4.

### Wirtschaft (Owner-Richtlinie 2026-11-07; Delta-Ledger 4582ca5)

- **Kostenseite (sammeln, monatlich):**
  - Engine-Abos: Vibe / Claude / Codex, inkl. geplanter MAX-Upgrades.
    Nur bekannte/eroeffnete Positionenlisten — KEINE Secrets, keine
    Preisraten aus privaten Konten erraten. Offene Werte als Platzhalter
    mit Kennzeichnung „Owner ergaenzt".
    - Vibe: [Betrag — Owner ergaenzt]
    - Claude (inkl. geplantes MAX-Upgrade): [Betrag — Owner ergaenzt]
    - Codex: [Betrag — Owner ergaenzt]
  - Infra (als gestellt bekannte Positionen, Betraege [Owner ergaenzt]):
    Firebase (vitalos-prod: Functions/Firestore/Hosting; Billing aktiv
    seit 2026-11-06), Store-Gebuehren (Play Console/Kontotyp).
- **Einnahmenseite:** VitalOS-Abo-Einnahmen — aktuell **0** (keine
  Premium-Subscription live, Stand 2026-11-07).
- **KPI:** Einnahmen >= Kosten. Monatlich gemessen; Monatsbericht 1x
  als 3-Zeiler an den CEO.
- **Kurzfrist-Hebel Kostendeckung:** Die Dezember-Mission (Org-Task 4,
  Premium-Subscription live) bleibt UNVERAENDERT SCHARF. Sobald M2-
  Testuser laufen, evaluiert der PM eine ggf. fruehere schlanke
  Variante als VORLAGE (Optionen + Empfehlung) — Faelligkeit: Ende
  November.

---

## Owner-Update 2026-11-07 — Produktuebersicht statt Taskliste

Diese Datei haelt Produktziele, vom CEO gesetzte Prioritaeten, Abhaengigkeiten,
Abnahmekriterien und Owner-Gates. Ausfuehrbare Einzelschritte werden direkt
in der Task-DB des zustaendigen Repos angelegt; deren Urgency bestimmt die
Arbeitsreihenfolge innerhalb der CEO-Rangfolge. Technische/Infra-Auftraege
bleiben in der CTO-/Alpha-Linie. Keine doppelte Aufgabenpflege hier.
Dieses Update ersetzt die alte Formatvorgabe oben, nach der jeder Block
einen operativen naechsten Schritt enthalten sollte. Neue Aufgaben erhalten
keine `+go`-Tags als Dringlichkeitsmarker; die Tag-/Urgency-Migration
bestehender Repo-Tasks liegt beim CTO. Ausfuehrungsfreigaben stehen explizit
im Task-Auftrag.

# PRODUKTUEBERSICHT — Stand 2026-11-09

## Owner-Aufmerksamkeit a→f (verbindlich ab 2026-11-09)

Aufmerksamkeitsreihenfolge des Owners (kein stiller Scope-Wechsel der
Wochen-Door; Freitag-Buendel fuer Owner-Fragen):

| # | Fokus | Was der PM daraus macht (ohne Owner-Warten) |
| --- | --- | --- |
| a | One2One-Coaching + Gruppentrainings (hypothetisch) als Vital-/Fitnesstrainer Wien | Angebotsentwurf C-009 vorantreiben; Tester-Einladung C-006 textfertig machen — Versand bleibt Owner, Entwurf nicht. |
| b | Einfache Subversionen der Standalone-Apps publishen (z. B. vos-fitness) | Inventur Publish-Bereitschaft vos-fitness (Fertig-Kriterien, fehlende Artefakte) als AL-Auftrag — kein Store-Upload ohne Freigabe. |
| c | VitalOS als Ganzes (c1 SaaS / c2 Patreon/Personal Brand) | Entscheidungsvorlage Freitag; unter der Woche nur Fakten sammeln, keine Architekturentscheidung. |
| d | vitalos-observe = Freitext-KI-Journal + fitness/fuel/relax; operate = Add-on | W47-Haupttuer Closed Test + M1-RC-Beweis (Emulator/Geraet) + C-003 4-Deposit-Lueckenliste — Observe-Kern sichtbar machen. |
| e | Mini-Apps (z. B. Supplement-Tracker) standalone Play Store | Nach Closed-Test-Startklar; bis dahin keine Bauauftraege. |
| f | Premium-Login via Personal Brand bewerben | Nach M2/Premium-Fundament; Marketing-Paket erst wenn Login-Pfad belegt. |

**W47-Lieferung bleibt:** Closed Test startklar (E-005 / `b1fd75b7`) mit Big
Rocks C-001 Play-Console + C-002 Geraeteabnahme. Das bedient vor allem **d**,
schafft die Basis fuer **b/e**, und laeuft parallel zu **a** (Coaching-Spur).

## Richtung und Rangfolge (Lieferstatus)

M1-RC (Emulator-Runde-3-Checkliste nachweisbar gruen) → M2-Testuser-Woche
(Simon & Matthias; Verteilungsweg bleibt Owner-Gate). M3 wird erst nach
CEO-/Delta-Ledger-Freigabe als eigenes Ziel aufgenommen.

Liefer-Rangfolge unveraendert: **P0 M1-RC**, **P1 Fuel-iOS**, danach
**P2 Produktqualitaet** — gelesen unter Owner-Aufmerksamkeit a→f. Repo-
Aufgaben nach Urgency; Owner-Gates und CTO-/Alpha-Technik nicht als
App-Aufgaben duplizieren.

## P0 — M1-RC

**Produktziel:** Alle Punkte a–f der Emulator-Runde-3-Checkliste sind in einem
validierten Lauf gruen. Abnahmebeleg ist das 3-Zeilen-Log des Emulator-Dienstes.

**Stand (2026-11-09):** Start/Signin, Voice-Einstieg, Journal v2, Persistenz und
Ohne-KI-Fallback sind belegt. SmartLog-Functions-Fix ist auf vitalos-prod live
(Deploy 08.11.). Offen: Emulator-/Geraete-Beweis heute (C-002 / Task 5f09bbb1)
mit Kontingent-Anzeige und echter Analyse; danach Client-Haertung eeb9d722.
Kosmetik-/A11y-Findings bleiben dokumentiert. Abnahme: Emulatordienst oder
Geraeteprotokoll — kein Owner-Gate fuer den Nachweis selbst.

## P1 — Fuel-iOS-Login

**Produktziel:** Fuel Mini-App-Login funktioniert auf iOS (und Soft-Gate wie
fuel-os / local-first wie skills — Offline nicht hinter Login-Mauer).

**Stand 2026-11-11:** Code-Fix `a87a883` (same-origin authDomain) ist auf
fuel-vos + `vos-fuel-*` live. Firebase Authorized Domains ok. Live-Fehler jetzt
`400 redirect_uri_mismatch` — GCP OAuth-Client braucht Redirect-URIs
`https://<site>.web.app/__/auth/handler` (Console, Owner). Skills bleibt
Referenz (project-domain + offline ohne Login). Inventar/ROT:
[Dev-Dashboard](https://nimmsel23.github.io/vitalos/dev-dashboard.html) /
`portal/dev-status.json` (CTO).

## P2 — Produktqualitaet

- **Datenherkunft im Fitness-Dashboard:** Cloud- und lokale Daten muessen fuer
  Nutzer unterscheidbar sein. Der freigegebene Umsetzungsauftrag liegt in der
  Fitness-Task-DB; Abnahme erst mit sichtbarer Anzeige und gruenem Live-Stand.
- **Journal-Versionspflege:** Release-Versionen sollen nachvollziehbar und mit
  Auto-Promote/Live-Deploy verknuepft sein. Der Journal-AL liefert zunaechst
  einen Vorschlag in seiner Task-DB; eine Versionsaenderung folgt erst nach
  CEO-Abnahme.

Technische Abhaengigkeits-, CI-, Dependabot-, Runner- und Backend-Arbeit wird
in den CTO-/Alpha-Arbeitsquellen gefuehrt (Koordinations-TODO.md, STATUS.md und
zustaendige Repo-Task-DBs), nicht als PM-Taskliste gespiegelt.

## Owner-Gates

- **M2-Testuser/APK:** Simon & Matthias; Verteilungsweg (Play-Console-
  Internal-Testing oder direkte APK/AAB-Installation) braucht Owner-Entscheid.
- **Secret-Rotation:** ein Client-Secret-Wert erschien einmal lokal im
  Session-Log, nicht committet oder versendet; Rotation bleibt Owner-Aktion.
- **vitalos #13 (node-forge, prod/functions):** Merge-/Deploy-Entscheid bleibt
  beim Owner wegen Produktions- und Security-Relevanz.
- **Dezember-Mission:** Premium-Subscription fuer Nicht-LLM-Nutzer live;
  Livestellung bleibt Owner-Gate. Die Mission bleibt unveraendert scharf.

Coach Task 93 ist kein offenes Owner-Gate mehr: CEO-Zielbild ist die direkte
serverseitige Enrichment-API; lokale Worker gelten als akzeptierter Uebergang,
Prioritaet P3, derzeit kein Refactor.
