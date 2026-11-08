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
- CPO (Chief Product Officer): Produktstrategie, Discovery, Produktpriorisierung
  und Produkt-Backlog; bringt Empfehlungen in CEO-Entscheide ein. Die bisherige
  VitalOS-Koordinationslinie ist diesem Produktbereich zugeordnet.
- Oracle: fuehrt die Org durch die 4P-Kette (The Door), die 4F-Kette
  (The Game) und den General's Tent; bereitet Verdikte und Karten fuer den CEO
  vor. Die Entscheidungszustaendigkeit des CEO bleibt bestehen. Details:
  [ORACLE.md](ORACLE.md).
- PM (produktbezogene Umsetzungs-/Backlog-Arbeit unter CPO-Abstimmung;
  PRODUKT-BACKLOG.md).
- ALs je App (abteilung-run 02:10-06:10 taeglich, Beleg-Protokoll im Log).
- Alpha/Betta (Android-/Git-Linien unter CTO), Angestellte (Subagenten).

## Rollen-Skill-Stacks (Owner-Inputs, Stand 2026-11-08)

Arbeitsmodell: Rolle = Kern-SKILL + passende Methoden-SKILLs + die aktuellen
Projekt- und Koordinationsdokumente. Externe Skills ergaenzen diese Quellen;
die Aufnahme macht ihre Empfehlungen nicht automatisch zu Org-Regeln.

| Rolle | Kern-SKILL und Wissensanker | Ergaenzungen / Stand |
| --- | --- | --- |
| CEO | `CEO.md` -> dieses `ORG.md` -> `PRODUCT.md` | Traegt die Org-Gesamtverantwortung und entscheidet die Jahres-/Quartals-/Monatshorizonte sowie die Wochen-Door; Oracle bereitet diese Arbeit im Tent vor. |
| CTO (vorlaeufig Codex) | `~/.vibe/skills/vitalos-cto/SKILL.md`; `CTO.md` und Koordinations-TODO | Sweep AI/Pythagora sind Owner-Kandidaten fuer CI und moeglichen Alpha-/Betta-Ersatz; aktueller GitHub-/Produktstand und Linienabdeckung erst pruefen. `skill-creator` fuer Skill-Pflege; `commit-analyzer` optional lesend; Claude-mem nach Integrations-/Datenflusspruefung. |
| CPO | Produktstrategie, Discovery, Produktentscheidungen und Backlog; `~/.vibe/skills/vitalos-cpo/SKILL.md` | Skill-Stack: `product-strategy`, `opportunity-solution-tree`, `prioritization-frameworks` (RICE/ICE/MoSCoW/Opportunity Score nur fuer Produktentscheidungen). Empfehlungen unterstuetzen den CEO; sie ersetzen weder CEO-Entscheide zur Org-Door noch Org-Taskwarrior-Priorisierung. |
| Oracle | `~/.vibe/skills/vitalos-oracle/SKILL.md`; [ORACLE.md](ORACLE.md) | Fuehrt durch 4P (Potential, Plan, Production, Profit), 4F (Frame, Freedom, Focus, Fire) und General's Tent; nutzt die jeweiligen Phasen-Skills und bleibt innerhalb der Org-Daten. |
| PM | Produkt-Backlog und Umsetzung innerhalb des CEO-freigegebenen Scopes; kein eigenes PM-SKILL in `~/.vibe/skills/` gefunden | Kann CPO-Methoden bei konkreten Produktpaketen mitnutzen; bleibt von CPO als eigener Stabs-/Umsetzungsfunktion unterscheidbar. |
| ALs / Ausfuehrung | `~/.vibe/skills/vos-warrior/SKILL.md` plus jeweiliges Repo-Runbook und Quell-AGENTS | Ponytail und Andrej Karpathy Skills fuer Coding; Impeccable und Taste fuer UI/Frontend. Noch als passende Ergaenzungen vorgemerkt. |
| Quer ueber Rollen | `vos-warrior` fuer Org-Tasks, Kontext und Session-Abschluss | GitClassic fuer read-only Public-GitHub-Lektuere; Logseq fuer Wissens-/Graph-Arbeit; Caveman als Antwortstil auf Abruf. Noch keine aktiven Skills. |

`vos-door-plan` ist ein Door-Phasen-/Chapter-Workflow-SKILL, keine Rolle. Das
Oracle fuehrt diesen Workflow im Tent aus; die Wochen-Door waehlt weiterhin der
CEO.

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
Oracle fuehrt die 4P-/4F-Arbeit und den General's Tent; der CEO behaelt die
Org-Verantwortung und setzt dort die Wochen-Door sowie Jahres-/Quartals- und
Monatshorizonte: yearly Freedom Maps, quarterly Focus Maps, monthly Missions.

Bevorzugtes Plattform- und Teammodell (Owner-Input):

| Layer | Plattform / Agent | Schwerpunkt |
| --- | --- | --- |
| Execution | Antigravity | Plattform und Orchestrierung fuer Teamwork, Remote Agents und laengere Horizonte. |
| Execution | Codex | Engineering und verlaessliche Code-Aenderungen. |
| Execution | Vibe / Cursor | Rapid Product, Frontend-Prototypen, Flow und Feel. |
| Intelligence | Perplexity | Research. |
| Intelligence | Grok | Adversarial, Narrative, Public und Strategy. |
| Intelligence | Claude | Evaluation, Metrics, Memory sowie Architecture Reviews und Quality Gates. |

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
