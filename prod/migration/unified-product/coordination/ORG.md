# ORG.md — Landkarte der VitalOS-Agentenorganisation (Stand 2026-11-08)

Lies-Reihenfolge fuer jede CEO-Session: CEO.md -> DIESER -> PRODUCT.md.
Pflege: Strukturwandel => gleicher Commit wie die Aenderung (Doku-Pflicht).

## Rollen (Agenten-Ebenen)
- Owner Daniel: Store/Geraete/Release-Freigaben, Produkt-Richtung. Erreichbar
  via tele (Kurzform), Gmail-Label +ceo (Gates), Chat (Live).
- CEO (Skill vitalos-ceo; Live WS1 + ceo-run Timer + ceo-digest 23:45):
  verkoerpert den Org-Tent, priorisiert/nimmt ab; setzt annual Freedom Maps,
  quarterly Focus Maps, monthly Missions und die woechentliche Org-Door.
- CTO (vitalos-cto; systemd 06:40 nach AL-Nacht): Technik/Infra,
  Dienste-Audits, Vollzugriff gcloud/Firestore (Leitfaden CEO.md
  'DOKUMENTATION DAUERHAFT'), Cloud-Deploys nur nach Owner-Go.
- CPO (Chief Product Officer): Produktstrategie, Discovery, Produktpriorisierung
  und Produkt-Backlog; bringt Empfehlungen in CEO-Entscheide ein. Der CEO
  behaelt die Org-Horizonte und die Auswahl der Wochen-Door.
- PM (produktbezogene Umsetzungs-/Backlog-Arbeit unter CPO-Abstimmung;
  PRODUKT-BACKLOG.md).
- ALs je App (abteilung-run 02:10-06:10 taeglich, Beleg-Protokoll im Log).
- Alpha/Betta (Android-/Git-Linien unter CTO), Oracle/Angestellte (Subagenten).

## Rollen-Skill-Stacks (Owner-Inputs, Stand 2026-11-08)

Arbeitsmodell: Rolle = Kern-SKILL + passende Methoden-SKILLs + die aktuellen
Projekt- und Koordinationsdokumente. Externe Skills ergaenzen diese Quellen;
die Aufnahme macht ihre Empfehlungen nicht automatisch zu Org-Regeln.

| Rolle | Kern-SKILL und Wissensanker | Ergaenzungen / Stand |
| --- | --- | --- |
| CEO | `~/.vibe/skills/vitalos-ceo/SKILL.md`; `CEO.md` -> dieses `ORG.md` -> `PRODUCT.md` | Verkoerpert den Org-Tent; setzt yearly Freedom Maps, quarterly Focus Maps, monthly Missions und die Wochen-Door. Skills: `vitalos-ceo`; Produktmethoden koennen mit dem CPO-Stack abgestimmt eingesetzt werden. |
| CTO | `~/.vibe/skills/vitalos-cto/SKILL.md`; `CTO.md` und Koordinations-TODO | Sweep AI/Pythagora sind Owner-Kandidaten fuer CI und moeglichen Alpha-/Betta-Ersatz; aktueller GitHub-/Produktstand und Linienabdeckung erst pruefen. `skill-creator` fuer Skill-Pflege; `commit-analyzer` optional lesend; Claude-mem nach Integrations-/Datenflusspruefung. |
| CPO | Produktstrategie, Discovery, Produktentscheidungen und Backlog; noch kein eigenes CPO-SKILL in `~/.vibe/skills/` gefunden | Skill-Stack: `product-strategy`, `opportunity-solution-tree`, `prioritization-frameworks` (RICE/ICE/MoSCoW/Opportunity Score nur fuer Produktentscheidungen). Empfehlungen unterstuetzen den CEO; sie ersetzen weder CEO-Entscheide zur Org-Door noch Org-Taskwarrior-Priorisierung. |
| PM | Produkt-Backlog und Umsetzung innerhalb des CEO-freigegebenen Scopes; kein eigenes PM-SKILL in `~/.vibe/skills/` gefunden | Kann CPO-Methoden bei konkreten Produktpaketen mitnutzen; bleibt von CPO als eigener Stabs-/Umsetzungsfunktion unterscheidbar. |
| ALs / Ausfuehrung | `~/.vibe/skills/vos-warrior/SKILL.md` plus jeweiliges Repo-Runbook und Quell-AGENTS | Ponytail und Andrej Karpathy Skills fuer Coding; Impeccable und Taste fuer UI/Frontend. Noch als passende Ergaenzungen vorgemerkt. |
| Quer ueber Rollen | `vos-warrior` fuer Org-Tasks, Kontext und Session-Abschluss | GitClassic fuer read-only Public-GitHub-Lektuere; Logseq fuer Wissens-/Graph-Arbeit; Caveman als Antwortstil auf Abruf. Noch keine aktiven Skills. |

`vos-door-plan` ist ein Door-Phasen-/Chapter-Workflow-SKILL, keine Rolle. Er
unterstuetzt CEO-Arbeit an der Door; die Rolle, die die Org-Wochentuer waehlt,
ist CEO.

Owner-Inputs zur Rollenabstimmung (Arbeitsmodell, nicht mechanische Regel):
Der CEO verkoerpert den Org-General's Tent (Kapitel 41) und setzt dort die
Wochen-Door. Die CEO-Rolle traegt auch die Jahres-/Quartals-/Monatshorizonte:
yearly Freedom Maps, quarterly Focus Maps, monthly Missions.

Fuer die uebrigen Rollen bildet die Menge der Taskwarrior-Aufgaben mit der
hoechsten Urgency die Fire-Map-Ausfuehrungssicht. Jede Rolle kennzeichnet ihre
Aufgaben in der gemeinsamen Org-DB mit einem Rollen-Tag (`+ceo`, `+cpo`, `+cto`,
`+pm`, `+al` usw.); andere Rollen richten ihre Ausfuehrung weitgehend an Taskwarrior
aus. Daniels persoenlicher General's Tent und Core4-Score bleiben davon
getrennt — sein persoenlicher Tent ist auf spaeter verschoben.

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
  emulator-test 13:00 (RAM-Gate 2500MB), ceo-digest 23:45 (herzschlag-
  UNABHAENGIG, idempotent via ceo-digest.log), ci-scan 20-Min.
- Globale Org-Task-DB: TASKRC=~/.local/state/vitalos-org/taskrc — Rollen
  als Tags (+ceo/+cto/+al/...), project = Repo; ONLY UUID, nie ID.
- Gates: Browser-Gate -> tele + ceo-mailgate (Label +ceo); Stichwort-Gates
  (z.B. 'deploy-freigabe') -> Org fuehrt aus.
- Messenger: tele-Skript (Telegram+WA-Spiegel), wacli (WhatsApp-Ernte).
