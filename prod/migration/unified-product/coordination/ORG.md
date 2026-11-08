# ORG.md — Landkarte der VitalOS-Agentenorganisation (Stand 2026-11-08)

Lies-Reihenfolge fuer jede CEO-Session: CEO.md -> DIESER -> PRODUCT.md.
Pflege: Strukturwandel => gleicher Commit wie die Aenderung (Doku-Pflicht).

## Rollen (Agenten-Ebenen)
- Owner Daniel: Store/Geraete/Release-Freigaben, Produkt-Richtung. Erreichbar
  via tele (Kurzform), Gmail-Label +ceo (Gates), Chat (Live).
- CEO (Skill vitalos-ceo; Live WS1 + ceo-run Timer + ceo-digest 23:45):
  priorisiert, nimmt ab, Tent So 12:00, Profit-Sichtung Sa.
- CTO (vitalos-cto; systemd 06:40 nach AL-Nacht): Technik/Infra,
  Dienste-Audits, Vollzugriff gcloud/Firestore (Leitfaden CEO.md
  'DOKUMENTATION DAUERHAFT'), Cloud-Deploys nur nach Owner-Go.
- PM (Stabsrolle beim CEO, produktuebersicht/backlog: PRODUKT-BACKLOG.md).
- ALs je App (abteilung-run 02:10-06:10 taeglich, Beleg-Protokoll im Log).
- Alpha/Betta (Android-/Git-Linien unter CTO), Oracle/Angestellte (Subagenten).

## Rollen-Skill-Stacks (Owner-Inputs, Stand 2026-11-08)

Arbeitsmodell: Rolle = Kern-SKILL + passende Methoden-SKILLs + die aktuellen
Projekt- und Koordinationsdokumente. Externe Skills ergaenzen diese Quellen;
die Aufnahme macht ihre Empfehlungen nicht automatisch zu Org-Regeln.

| Rolle | Kern-SKILL und Wissensanker | Ergaenzungen / Stand |
| --- | --- | --- |
| CEO | `~/.vibe/skills/vitalos-ceo/SKILL.md`; `CEO.md` -> dieses `ORG.md` -> `PRODUCT.md` | `product-strategy` und `opportunity-solution-tree` sind in `~/.vibe/skills/` aufgenommen. Nur als Methodenhilfe. |
| CTO | `~/.vibe/skills/vitalos-cto/SKILL.md`; `CTO.md` und Koordinations-TODO | Sweep AI/Pythagora bleiben CI-Kandidaten; `commit-analyzer` als lesende Git-Aktivitaets-Zusammenfassung vorgemerkt. Dessen feste Commit-/Leerlauf-Schwellen sind nicht als Org-Gesundheitsmass bestaetigt. |
| PM | Produkt-Backlog und CEO-freigegebener Scope; kein eigenes PM-SKILL in `~/.vibe/skills/` gefunden | `product-strategy` und `opportunity-solution-tree` koennen bei passenden Produktpaketen zusaetzlich dienen. |
| Door Plan | `~/.vibe/skills/vos-door-plan/SKILL.md`; Chapter 27/28/31 | `prioritization-frameworks` ist fuer Door-War-Abwaegungen aufgenommen; ergaenzt das Verdikt und Taskwarrior, ersetzt keines davon. |
| ALs / Ausfuehrung | `~/.vibe/skills/vos-warrior/SKILL.md` plus das Repo-Runbook und die Quell-AGENTS | Ponytail/Karpathy sind Coding-Stil-Kandidaten; Impeccable/Taste sind UI-Kandidaten. Noch nicht als globale Skills aktiviert. |
| Quer ueber Rollen | `vos-warrior` fuer Org-Tasks, Kontext und Session-Abschluss | GitClassic bleibt Kandidat fuer read-only Public-GitHub-Lektuere; Logseq-CLI aus `logseq/logseq/.agents/skills/logseq-cli/SKILL.md` als Wissens-/Graph-Kandidat vorgemerkt. `logseq` ist aktuell nicht im PATH; beides noch nicht als aktive Org-Skills bestaetigt. |

Owner-Inputs zur Rollenabstimmung: Daniel sieht den CEO als die Rolle, die die
woechentliche Org-Door waehlt; andere Rollen sollen sich danach weitgehend an
Taskwarrior orientieren. Das ist eine anpassbare Arbeitsrichtung. Daniels
persoenlicher General's Tent und Core4-Score sind nicht der Org-Tent oder
Org-Score.

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
