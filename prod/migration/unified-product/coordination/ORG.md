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
| CEO | `~/.vibe/skills/vitalos-ceo/SKILL.md`; `CEO.md` -> dieses `ORG.md` -> `PRODUCT.md` | `product-strategy`, `opportunity-solution-tree` und `prioritization-frameworks` aufgenommen. Letzteres fuer die CEO-Wahl der Wochen-Door; nur als Zusatzperspektive zu Chapter 27 und Taskwarrior. |
| CTO | `~/.vibe/skills/vitalos-cto/SKILL.md`; `CTO.md` und Koordinations-TODO | `skill-creator` als Codex-Methodenhilfe fuer Skill-Pflege; `commit-analyzer` optional lesend; Claude-mem als Gedaechtnis-Kandidat nach Integrations-/Datenflusspruefung. Sweep AI und Pythagora sind CI-Agenten-Kandidaten, keine Skills. |
| PM | Produkt-Backlog und CEO-freigegebener Scope; kein eigenes PM-SKILL in `~/.vibe/skills/` gefunden | Bei Produktpaketen koennen `product-strategy` und `opportunity-solution-tree` als CEO-Stack-Methoden mitgenutzt werden. |
| ALs / Ausfuehrung | `~/.vibe/skills/vos-warrior/SKILL.md` plus jeweiliges Repo-Runbook und Quell-AGENTS | Ponytail und Andrej Karpathy Skills fuer Coding; Impeccable und Taste fuer UI/Frontend. Noch als passende Ergaenzungen vorgemerkt. |
| Quer ueber Rollen | `vos-warrior` fuer Org-Tasks, Kontext und Session-Abschluss | GitClassic fuer read-only Public-GitHub-Lektuere; Logseq fuer Wissens-/Graph-Arbeit; Caveman als Antwortstil auf Abruf. Noch keine aktiven Skills. |

`vos-door-plan` ist ein Door-Phasen-/Chapter-Workflow-SKILL, keine Rolle. Er
unterstuetzt CEO-Arbeit an der Door; die Rolle, die die Org-Wochentuer waehlt,
ist CEO.

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
