# DESIGN-VORLAGE: Cloud-CTO (CI-Faehigkeit) — Org-Task 17 (+hot)

Status: VORLAGE, KEINE Ausfuehrung. Auftrag: CEO-Sektion TODO.md 17:1x CET.
Verdikt-Kanal: Door-War (Tent SO 12:00, W46) — kein Go vor Verdikt.
Abnahme: CEO in der stillen Runde. Live-CTO (WS3) und systemd-CTO bleiben bis
Verdikt unberuehrt; alles hier ist Papier.

## 1. State-Carve-Out — was der CTO-Takt tatsaechlich braucht

Lesestoff des CTO-Takts ausserhalb von ~/.local/state/vitalos-cto:

- Koordinationsflaeche (vitalos-prod/…/coordination): 8 tracked Dateien (SOT).
- CEO-Lage: ~/.local/state/vitalos-ceo/{CEO.md, ceo-run.log} und PM.md (vitalos-pm).
- AL-Logtails: ~/.local/state/abteilung/<repo>.log (nur tail, stichprobenweise).
- Runner-Signale: vitalos-emulator-test*.log, vitalos-roadmap.log, cto-run.log.
- Task-DBs: <repo>/.task via task CLI (nur Lesen/Statistik).

Carve-Out fuer ein privates State-Repo `vitalos-cto-state` (neu, private):
NUR die CI-les- und CI-schreibfaehige Teilmenge:

- CTO.md (Tagesgedaechtnis; mit Daily-Section-Protokoll, additiv),
- kuratierte Log-Tails: ein lokales Push-Skript haengt je AL-Log die letzten
  ~40 Zeilen in state/logs/<repo>.log an (im Lauf, kein Sekunden-Takt),
- watch-State-Abbild + letzte 3-Zeilen-Berichte.

Bewusst NICHT im State-Repo (bleiben lokal, kein Cloud-Kontakt):

- Task-DBs (.task): enthalten Owners Arbeitswelt — CI-CTO arbeitet nur gegen
  die EXPORTIERTen AUTOMATION-/Berichtszeilen, nie gegen Live-Task-DBs.
- Echte Runner-Rohlogs, .product-config, alle Secrets, heartbeat-Rohdaten.

## 2. Runner-Ableitung cto-run → CI-Variante

- Ableitung: bin/cto-run → bin/cto-run-ci (Kopie im VITALOS-PROD-repo vom
  Runner): gleicher PROMPT-Kern (SKILL + Tagesabschnitt), ENGINE=api (direkter
  Mistral-Chat-Call, keine CLI-Installation im Runner noetig).
- Takt: scheduled workflow, EINMAL taeglich (Vorschlag 06:10 CET — direkt vor
  der lokalen 06:40-Runde, so kann der Live-CTO widersprechen statt doppeln).
- Doppel-Koordination-Gate: Der CI-Lauf ueberspringt sich selbst, wenn das
  State-Repo einen Live-Heartbeat-Commit < 24 h zeigt (Muster: Heartbeat-Gate
  im cto-run, nur Richtungswechsel — lokal unterdrueckt die Live-Session den
  Dienst, im Cloud unterdrueckt die Live-Session den Cloud-Lauf).
- Bericht: 3-Zeilen-Commit ins State-Repo + optional als CTO-SEKTION ins
  Koordinations-TODO (gleiche SOT-Doku wie jetzt).
- CI-CTO ist additiv: Offline-Fenster-Ziel (Owner-Bedarf „2–3 Tage ohne
  Laptop"), kein Ersatz fuer WS3.

## 3. Hartes Grenzset fuer den CI-CTO

- Verboten: Deploy, Store-Release, IAM, .product-config-Zugriff, Push auf
  Produkt-Gitlinks (Apps/AL-Repos), Secret-Erstellung, hotlist routing.
- Erlaubt: Commits in GENAU zwei Flchen: State-Repo (Bericht) und
  Koordinationsflaeche (CTO-SEKTIONEN).Mehr nichts.
- Mechanik: eigenes GITHUB_TOKEN mit minimalem Scope (nur diese zwei Repos),
  Workflow-Permissions `contents: write` nur im State-Repo-Workflow,
  Repo-Allowlist im Prompt UND im Workflow (Environment-Guard), kein
  pull_request_target (keine PR-Inhalts-Ausfuehrung — reine Cron-Flows).
- Ein Verstoß im Lauf = Laufabbruch durch Allowlist-Check vor jedem Commit.

## 4. Kosten-Schaetzung (Token & Runner-Minuten)

- Prompt+Skill+Tagesabschnitt+8 Koordinationsdateien-Tails ≈ 10–30k In / 1–2k
  Out je Lauf (aktuelle Runden Messwert: Vibe-Laeufe mit ~50 Kontext-Files
  bleiben unter 40k). Beim Mistral-Preisfenster: unter 0,10 EUR je Lauf,
  ~3 EUR/Monat bei taeglichem Takt.
- Vergleich lokale Live-Session: >250k Token/Tag nur Wachschleifen — der
  CI-Lauf ist < 10 % Zuladung je Tag und degradiert die Live-Runde nicht.
- GitHub-Runner: 15–30 min Linux je Lauf = < 15 h/Monat, weit im Free-Tier;
  Freedom-Goal geprueft: deckt (Offline-Sicherung) statt vergroessert
  (kein zusaetzlicher Dienst, kein Timer, laeuft nur wenn Laptop weg).

## 5. LLM-Auth in Actions — nur Option, Owner-Gate

- Option A (Empfehlung): MISTRAL_API_KEY als Actions-Secret im State-Repo
  (private). Risiko: Schluessel liegt in GitHub-Secret-Store; Mitigation:
  nur feste Cron-Workflows, keine freigegebene PR-Ausfuehrung, kein fork-
  faehiges Replay (Repo privat), Scoping auf ein Repository.
- Option B (Billig-Fallback): CI-CTO nur lesend/sammelnd in Berichtszeilen —
  Timestamps, mtime-Messungen via echtem Lauflog des Runners; KEINE
  LLM-Entscheidung im Runner, Alerts gehen zurueck ins State-Repo und der
  Live-CTO zieht sie beim Wiederkommen.
- Das ANLEGEN des Secrets bleibt in jedem Fall Owner-Gate (Daniel persoenlich).
- Empfehlung im Verdikt: Option A nur wenn Option B in der 2–3-Tage-Abwesenheit
  nachweislich unzureichend — inventionsfrei dokumentiert, Verdikt beim
  Door-War.

## Verdikt-Unterlage (Zusammenzug fuer Tent SO 12:00)

- Nutzen: System faehrt 2–3 Tage ohne Laptop weiter (Owner-Bedarf, Kandidat C
  im W46-Draft), CTO-Kette bleibt geschlossen, Kein Umbau der lokalen Linie.
- Kosten: ~3 EUR/Monat LLM + Free-Tier-Runner (~15 h/Monat) + ein privates
  State-Repo + einmalige Runner-Ableitung (~2 h CTO-Zeit).
- Risiko: Auth-Schluessel in GitHub (Option A) — vermeidbar via Option B.
- Nicht-Go-Konsequenz: Offline-Fenster bleiben unbesetzt (Kandidat C faellt
  zurueck auf Offline-Aufzeichnung), keine Folgekosten, kein Namensverlust.
