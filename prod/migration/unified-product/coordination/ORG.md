# ORG.md — Landkarte der VitalOS-Agentenorganisation (Stand 2026-11-08)

Lies-Reihenfolge fuer jede CEO-Session: CEO.md -> DIESER -> PRODUCT.md.
Pflege: Strukturwandel => gleicher Commit wie die Aenderung (Doku-Pflicht).

## Rollen (Agenten-Ebenen)
- Owner Daniel: Store/Geraete/Release-Freigaben, Produkt-Richtung. Erreichbar
  via tele (Kurzform), Gmail-Label +ceo (Gates), Chat (Live).
- CEO: behaelt die Gesamtverantwortung fuer den Org-Tent und entscheidet die
  Jahres-/Quartals-/Monatshorizonte sowie die woechentliche Org-Door.
- CTO (Codex uebernimmt die Rolle auf Owner-Wunsch ab 2026-11-08;
  bisheriger vitalos-cto-Runner bleibt separat bestehen): Technik/Infra,
  Dienste-Audits, Vollzugriff gcloud/Firestore (Leitfaden CEO.md
  'DOKUMENTATION DAUERHAFT'), taegliche Sichtung des CEO-Eingangs
  `nimmsel23+ceo` und Cloud-Deploys nur nach Owner-Go.
- CPO (Claude): Produktstrategie, Discovery, Produktpriorisierung und
  Produkt-Backlog; bringt Empfehlungen in CEO-Entscheide ein. Die bisherige
  VitalOS-Koordinationslinie ist diesem Produktbereich zugeordnet.
- Oracle: fuehrt The Door (Potential/Plan/Production/Profit), The Game
  (Frame/Freedom/Focus/Fire Maps) und den Org-General's-Tent als
  Integrationsritual. Der CEO entscheidet weiterhin Horizonte und Wochen-Door;
  Oracle fuehrt Prozess und Vorbereitung, nicht die CEO-Verdikte. Details:
  [ORACLE.md](ORACLE.md).
- PM (produktbezogene Umsetzungs-/Backlog-Arbeit unter CPO-Abstimmung;
  PRODUKT-BACKLOG.md).
- ALs je Repo: Codex ist standardmaessige Besetzung; taegliche Ausfuehrung und
  Beleg-Protokoll je nach Repo-Runner.
- Alpha/Betta (Android-/Git-Linien unter CTO), Angestellte (Subagenten).

## Berichtsstil an CEO, CPO und CTO

Berichte an CEO/CPO/CTO im Format REAL * RAW * RELEVANT * RESULTS. Bei
Rueckfragen oder mentaler Verknotung den VOICE-Rahmen STOP * SUBMIT
(Facts + Feelings + Fokus + Fruits) * STRUGGLE * STRIKE verwenden. Das haelt
The Alpha Code (REAL/RAW/RELEVANT/RESULTS) und The Voice als mentale
Rahmenbedingung und Qualitaetssicherung im Arbeitsfluss.

## Rollen-Skill-Stacks (Owner-Inputs, Stand 2026-11-08)

Arbeitsmodell: Rolle = Kern-SKILL + passende Methoden-SKILLs + die aktuellen
Projekt- und Koordinationsdokumente. Externe Skills ergaenzen diese Quellen;
die Aufnahme macht ihre Empfehlungen nicht automatisch zu Org-Regeln.

| Rolle | Kern-SKILL und Wissensanker | Ergaenzungen / Stand |
| --- | --- | --- |
| CEO | `CEO.md` -> dieses `ORG.md` -> `PRODUCT.md` | Traegt Org-Verantwortung und entscheidet Jahres-/Quartals-/Monatshorizonte und Wochen-Door. |
| CTO (Codex) | `CODEX.md`; `CTO.md` und Koordinations-TODO | Skill-Stack: `ponytail`, `karpathy-guidelines`, `git-commit-analyzer` (lesend), `gitclassic` (oeffentliche Repos, lesend), `skill-creator`; `impeccable`/`taste` bei UI-Aufgaben. Sweep und Pythagora bleiben externe CI-Produktpruefung, keine SKILL.md-Installation. |
| CPO (Claude) | [CPO.md](CPO.md) | Skill-Stack: `product-strategy`, `opportunity-solution-tree`, `prioritization-frameworks`, `logseq-cli` fuer Wissensarbeit; Produktprioritaeten und Backlog an CEO-freigegebenen Game Maps und Tent-Verdikten ausrichten. Claude-mem-Plugin 15.12.0 ist userweit aktiviert; Transcript-Hooks starten mit der naechsten Claude-Code-Session, lokale Daten unter `~/.claude-mem/`. |
| ALs je Repo (Codex standardmaessig) | jeweiliges Repo-Runbook, `AGENTS.md` und [ORG.md](ORG.md) | Repo-lokale Ausfuehrung und Handoffs; jeweilige Doku, Taskwarrior-Tag und Abnahmegrenzen beachten. |
| Oracle | `~/.agents/skills/vitalos-oracle/SKILL.md`; [ORACLE.md](ORACLE.md) | Fuehrt The Door (4P), The Game (Game Maps 4F) und Org-General's-Tent; verarbeitet +hot als Potential-Eingang und fuehrt in der gemeinsamen Org-DB durch die Phasen. |
| PM | Produkt-Backlog und Umsetzung innerhalb des CEO-freigegebenen Scopes; kein eigenes PM-SKILL in `~/.vibe/skills/` gefunden | Kann CPO-Methoden bei konkreten Produktpaketen mitnutzen; bleibt von CPO als eigener Stabs-/Umsetzungsfunktion unterscheidbar. |
| ALs / Ausfuehrung | jeweiliges Repo-Runbook und Quell-AGENTS plus `vos-warrior` | Codex ist Standard-AL pro Repo. Geteilt installiert: Ponytail-Pack, Karpathy Guidelines; Impeccable und Taste fuer UI. Taste benoetigt noch Playwright MCP. |
| Quer ueber Rollen | `vos-warrior` fuer Org-Tasks, Kontext und Session-Abschluss | Geteilt installiert: GitClassic (public-only, read-only), Logseq CLI, Caveman (nur auf Abruf), Skill Creator, Ponytail- und Design-Skills. Claude-mem-Plugin 15.12.0 userweit aktiviert; Hooks/Worker werden beim naechsten Claude-Code-Start initialisiert. |

`vos-door-plan` ist ein Door-Phasen-/Chapter-Workflow-SKILL, keine Rolle.
Oracle fuehrt Door, Game und Tent. Potential-Tasks kommen als +hot in die
Org-Taskwarrior-DB; Oracle fuehrt die Door-Pruefung. CPO priorisiert
Produktarbeit mit den Produktmethoden und haelt sie an CEO-freigegebenen
Game Maps und Tent-Verdikten ausgerichtet. Die Wochen-Door waehlt der CEO.

Owner-Inputs zur Rollenabstimmung (Arbeitsmodell, nicht mechanische Regel):
Daniel weist Codex ab 2026-11-08 vorlaeufig die CTO-Rolle zu. Der bestehende
Vibe-CTO-Runner um 06:40 ist davon als vorhandener technischer Ablauf
unterschieden; seine Konfiguration wurde hier nicht geaendert.
Als zusaetzlicher Owner-Input soll geprueft werden, ob der stuendliche CEO-
Runner auf einen woechentlichen Lauf reduziert werden kann. Der lokale
`vitalos-ceo.timer` ist derzeit auf `OnCalendar=*-*-* *:05:00` konfiguriert;
der separate Tages-Digest bleibt um 23:45 eingetragen. Eine Frequenzaenderung
ist noch nicht vorgenommen; Laufzeitstatus war in dieser Umgebung nicht
abrufbar.
Oracle fuehrt 4P/4F, den Org-General's-Tent und die Einordnung von +hot-
Potential in die Door. Der CEO behaelt die Org-Entscheide und setzt Wochen-
Door sowie Jahres-/Quartals-/Monatshorizonte: yearly Freedom Maps, quarterly
Focus Maps, monthly Missions. Der CPO priorisiert Produktarbeit und prueft
deren Anschluss an diese freigegebenen Maps und Tent-Verdikte.

Bevorzugtes Plattform- und Teammodell (Owner-Input):

| Layer | Plattform / Agent | Schwerpunkt |
| --- | --- | --- |
| Execution | Antigravity | Plattform und Orchestrierung fuer Teamwork, Remote Agents und laengere Horizonte. |
| Execution | Codex | Engineering, verlaessliche Code-Aenderungen und standardmaessiger Repo-AL je Repository. |
| Execution | Vibe / Cursor | Rapid Product, Frontend-Prototypen, Flow und Feel. |
| Intelligence | Perplexity | Research. |
| Intelligence | Grok | Adversarial, Narrative, Public und Strategy. |
| Intelligence | Claude | CPO sowie Evaluation, Metrics, Memory, Architecture Reviews und Quality Gates. |

Codex und Claude Code sind als spezialisierte Sub-Agents in Antigravity
vorgesehen. Diese Aufteilung soll verhindern, dass jeder Agent alles macht;
die gewuenschten Effekte sind klare Spannungsfelder, besseres Langzeitgedaechtnis
und eine echte Multi-Agent-Infrastruktur. Das Modell bleibt ein anpassbarer
Org-Input; die technische Integration ist damit nicht bestaetigt.

Vorgeschlagene Ergaenzungen kritischer Verantwortungsbereiche:

| Rollen-Vorschlag | Vorgeschlagene Besetzung | Zweck / erwarteter Beitrag |
| --- | --- | --- |
| Red Team / Adversarial | Grok | Plaene, Annahmen und Code regelmaessig angreifen, um blinde Flecken und Fehler frueh offenzulegen. |
| Head of Evaluation & Metrics | Claude | Messen, ob Qualitaet und Teamleistung tatsaechlich steigen, statt sich nur besser anzufuehlen. |
| Knowledge & Memory Manager | Claude | Langfristiges Firmenwissen, Entscheidungslog und Lessons Learned pflegen. |
| Growth / Narrative / Public | Grok | Kommunikation nach aussen, Storytelling und Real-Time-Sentiment (z. B. X) beobachten. |
| Security & Reliability | Codex + Claude | Production-Code und Agenten-Sicherheit absichern. |

Diese Rollen-/Besetzungsmodelle sind Owner-Inputs zur Org-Entwicklung; sie
definieren fuer sich allein noch keine laufenden Agenten, Systemd-Timer,
Zugriffsrechte oder Rollen-Tags.

Die Modellgewichtung ist eine Orientierung nach Aufgabenart und kann sich mit
Verfuegbarkeit und konkreter Evidenz weiterentwickeln.

Fuer die uebrigen Rollen bildet die Menge der Taskwarrior-Aufgaben mit der
hoechsten Urgency die Fire-Map-Ausfuehrungssicht. Jede Rolle kennzeichnet ihre
Aufgaben in der gemeinsamen Org-DB mit einem Rollen-Tag (`+ceo`, `+cpo`, `+cto`,
`+oracle`, `+pm`, `+al` usw.); andere Rollen richten ihre Ausfuehrung weitgehend
an Taskwarrior aus. Daniels persoenlicher General's Tent und Core4-Score bleiben
davon getrennt — sein persoenlicher Tent ist auf spaeter verschoben.

Dokumentations-Input: Die `docs/product-dev/abteilungen/*.md` enthalten
derzeit Runbook-, Aufgaben- und Workflow-Anteile. Daniel weist darauf hin,
dass viel dauerhaftes Repo-Wissen eher in die passende `AGENTS.md`,
`ARCHITECTURE.md`, `BACKEND.md`, `FRONTEND.md`, `DEPLOY.md`, `README.md` oder
ein anderes thematisches Projektdokument gehoert. Bei einer spaeteren Sichtung
nach Inhalt zuordnen; nicht mechanisch alle Runbook-Inhalte verschieben.

## Repo-Landschaft (Namen sind KEINE Auskunft — AGENTS.md Kopf lesen!)
- Meta-Repo ~/vitalos (Branches dev-product/master; Symlink ~/vitalos-prod
  -> vitalos/prod seit 2026-11-08; Altstand-Schnappschuss: ~/vitalos-prod-legacy-*)
- App-Entwicklung: ~/dev/<name>-dev (Produkt-App-Quellen, s. PRODUCT.md)
- Tools/Dienste: ~/.dotfiles (Runner, Units, Skripte), ~/aos (AlphaOS CLI,
  Firmenphilosophie), ~/.org (Org-Zuhause, venv symlink), ~/dev/agent-skills
  (Skill-Standard-Referenz, read-only), ~/.vibe/skills (Org-Agenten-Skills,
  BEFUND: unversioniert — Befund bei CTO-Linie), Skill-Format-Standard: ~/dev/agent-skills (Spec).
- Nicht verwechseln: skills-dev = Skills-APP (Produkt), NICHT die
  Skill-Verwaltung der Agenten.

## Maschinen und Kanaele
- Timer: AL-Nacht 02:10-06:10, CTO 06:40, roadmap 07:45, thin-results,
  emulator-test 13:00 (RAM-Gate 2500MB), CEO-Runner stuendlich (Reduktion
  auf woechentlich als Owner-Input vorgemerkt), ceo-digest 23:45 (herzschlag-
  UNABHAENGIG, idempotent via ceo-digest.log), ci-scan 20-Min.
- Globale Org-Task-DB: TASKRC=~/.local/state/vitalos-org/taskrc — Rollen
  als Tags (+ceo/+cpo/+cto/+oracle/+pm/+al/...), project = Repo; ONLY UUID, nie ID.
- Gates: Browser-Gate -> tele + ceo-mailgate (Label +ceo); Stichwort-Gates
  (z.B. 'deploy-freigabe') -> Org fuehrt aus.
- Messenger: tele-Skript (Telegram+WA-Spiegel), wacli (WhatsApp-Ernte).
