# FIRE MAP 2026-W46 — Vorbereitung der Sonntagswahl (12:00 CET, 2026-11-08)

 ENTWURF bis zur GAME-Runde So 2026-11-08 — die Runde waehlt den Domino und baut den War Stack; danach wird diese Datei durch die finale Auswahl ersetzt bzw. ergaenzt. Kaskade: Q4-Fokus Front 1+2 -> Nov-Mission -> diese Woche.

## Lage am Sonntag (Stand Sa, 13:xx CET)

- Invoker-Gate geloest (alle 6 Journal-Callables auf vitalos-prod verifizierbar); dem SmartLog-Gruen fehlt nur noch der Emulator-Nachweis (RAM-Gate, Kalibrierung laeuft bei Alpha).
- RC-Ruf wartet auf den gruenen Lauf; M2-APK-Bau wartet auf Owner-GO.
- W45-Domino M1-RC damit überwiegend durchbrochen — W46 dreht auf den Rest.

## Kandidaten

1. **DOMINO-Kandidat A — RC-Ruf & M2-Eroeffnung:** Emulator-Lauf gruen erzwungen (RAM-Fenster), RC-Ruf entscheidungsreif an Daniel, parallel APK-Bau-Antrag im selben Gate-Brief. Oeffnet die M2-Woche und deckt die Nov-Mission direkt ab. Risiko: zwei Owner-Gates in einem Brief.
2. **DOMINO-Kandidat B — Nur SmartLog-Gruen erzwingen:** Nur Emulator-Runde 4 gruen (RAM-Kalibrierung bis zum gruenen Lauf), RC-Ruf in der Folgewoche. Kleiner, schaerfer, ein Tor.
3. **DOMINO-Kandidat C — ORG-LAEUFT-WEITER (Cloud-Handlungsfaehigkeit):**
   Owner-Bedarf Sa 17:3x direkt geaeussert: "Ich brauche ein System, das
   weiterarbeitet, wenn ich den Laptop 2-3 Tage nicht aktiviere." Domino:
   Die Org bleibt ohne Laptop handlungsfaehig — Runden laufen, Berichte
   entstehen, naechste +hit-Tasks werden zu PRs, und Daniel kommt zu
   vorbereiteten Gates zurueck statt zu eingefrorener Arbeit. Danauf aufbauend
   auf dem laufenden Design-Auftrag Cloud-CTO (CEO-Sektion 17:1x).
   GRENSSET (Owner-Bestaetigung Sa): Live-CEO nur bei Bedarf durch Owner
   gespawnt = PERFECT; AL-Linie auf TODO.mds per systemd = PERFECT — die
   CI-Schicht ist strikt ADDITIV (nur Offline-Fenster bei Laptop-aus),
   kein Umbau der beiden bestaigten Ebenen.
4. **Neben-Tuer-Kandidaten (max. 2):** (a) RAM-Kalibrierung/Emulatorfenster
   (laeuft bei Alpha eh — als Neben-Dokumentation). (b) 6pack-AL-turn_limit-
   Muster (CTO-Blick; bislang 2x abgebrochen).

## Empfehlung des CEOs (Vorablage — die Sonntagsrunde entscheidet)

Aktualisiert nach Owner-Signal Sa: **Kandidat C als Haupt-Door** — das ist
das Warum, das der Org-Aufbau von Anfang an hatte (Owner nicht an den
Laptop gebunden); M1-RC steht ohnehin am RAM-Fenster, das Frame bestimmt
der Emulator, nicht die Wahl. Kandidat A schrumpft zur Neben-Tuer: RC-Ruf-
und APK-Brief bleiben im 23:45-Digest-Gate und feuern automatisch, sobald
der Emulator gruen ist — kein eigener Door mehr noetig. Neben-Tuer (b)
dazu, weil sie die AL-Verlaesslichkeit sichert.

## War-Stack-Skizze C (ausformulieren nach Wahl, Kap. 28-Felder in .data)

- WARUM (Domino): Owner weg = Org arbeitet weiter, statt 2-3 Tage Still-
  stand und Berge bei Rueckkehr.
- Hit C1 — Cloud-CTO-Runde in Actions (Design-Vorlage liegt der CTO-Linie
  vor; Bau + Smoke-Test). CTO.
- Hit C2 — State-Repo org-state (privat, secretfrei): CTO.md-Memory,
  Org-Task-DB, Fire-Maps als Basis fuer CI-Agenten. CTO.
- Hit C3 — Schlanker CI-CEO-Digest auf der Koordinationsflaeche (lesen,
  priorisieren, Digest-Commit); Telegram-Versand nur als Option mit Bot-
  Token-Secret = Owner-Gate. CEO-Linie.
- Hit C4 — Ausfuehrendes CI-Schicht: arbeitet die naechsten +hit-Tasks ab
  und liefert PRs in die Produkt-Repos; grenzset wie 17:1x (kein Deploy,
  kein Store, kein .product-config, keine Produkt-Gitlinks).
- Facts/Obstacles/Strikes/Responsibility: Sonntag nach Kap. 28 Reflektion.

## Hits (fuer Sonntag vorbereitet; Fact/Obstacle/Strike/Responsibility nach Kapitel 28)

- Hit 1 — Emulator-Lauf mit SmartLog gruen (Beleg: 3-Zeilen-Log + Runs-Log-Eintrag). Alpha, im RAM-Fenster.
- Hit 2 — RC-Ruf-Brief beim Owner (RC-Deklaration + APK-Bau-Antrag in EINEM Digest-Gate). CEO.
- Hit 3 — 6pack-turn_limit-Befund (Muster, Ursache, Fix-Vorschlag). CTO.

## CEO-GESAMTPLAN 2026-11-07 21:3x CET (Antwort auf Owner-Kritik „du hast ja gar keinen Plan")

Der Plan — ein Strang, vier Wochen, jede Zeile hat Owner/Gate und Endzustand:

### Nacht SO (heute): Fundament-NT  
Automatik org-weit, kein Zutun noetig: AL-Nacht (02:10–06:10, ERSTE Runde auf
globaler Org-DB, inkl. journal-A11y-Fixes 8639e2ad) -> CTO 06:40 (Global-DB-
Beleg, Guard-Negativtest, Merge-Agent-Race-Verifikation, SmartLog-Ursachen-
stand).

### SO: Tent-Tag (12:00, vos-tent)
- Emulator-Runde 13:00: SmartLog-Grue bleibt der M1-RC-Endnachweis
  (+ Debug-Signin-Bestaetigung, A11y-Verifikation der Nacht-Fixes).
- Tent-Entscheidungen: (1) ORG-LAEUFT-WEITER-Verdikt (Cloud-CTO-Design +
  Automations-Topliste als Beweisstueck), (2) M1-RC-Abnahme bei Emulator
  gruen -> RC-Ruf im Digest, (3) W47-Fire festzurren (dieser Plan hier als
  Vorlage), (4) Pages-Bewertung als neue Owner-Entscheid vorbereiten.
- Abends: CTO-Aggregation AUTOMATION-Topliste (17:00).

### W47 (Mo–So): Auslieferungswoche
- Mo: RC-Ruf gebuendelt (falls SO gruen) — M2-APK-Handoff vorbereitet
  (c3315277). Simon & Matthias installieren (Owner-Hand.
- Di–Mi: M2-Beobachtung (Crash/Feedback-Digest), parallel Security-Buendel
  (Secret-Rotation + node-forge, faellig 12.11.).
- Do: Dependabot-Major-Umstellung + Betta CI-Konsolidierung abgenommen;
  Pages-Doku-Entscheid beim Owner.
- Sa 12:00: Profit-Sichtung (vos-door-profit): M1/M2-Ernte, Kostenstand
  (Runner, Fon, Abos) gegen Freedom-Goal-Rechnung.
- So 12:00: Tent W48 — W47-Abnahme, Premium-Fundament-Auftrag (p6-Serie,
  Dezember-Mission) formal als War Stack.

### Dezember-Vorbereitung (parallel ab W47)
Premium-Subscription-Fundament (Mission Dez: Nicht-LLM-Nutzer zahlen fuer
KI-Vorteile): Preis-/Kontingent-Satz aus der Strategie V1.2.1 als
PM-Vorlage,technische Rollen bei CTO, Bau bei den Linien — Start aber NUR nach
M2-Abnahme, keine Parallelarbeit vor RC (Anti-Fraktal-Regel).

### Freedom-Drift-Messung (jeweils im Profit-Termin)
Fixe Zahlen: Betriebskosten/Monat (Runner, Domains, Fon) gegen
Subscription-Einnahmen (aktuell 0) — Ziel Q1/2027 Deckung inkl.
Claude-Max. Messbar je Profit-Sichtung, in W46-W47 mit 0-Nachweis starten
(Messreihe anlegen).
