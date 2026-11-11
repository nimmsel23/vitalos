# ORG.md — Landkarte der VitalOS-Agentenorganisation (Stand 2026-11-09; Berichtslinie Owner-Klarstellung)

Ort: `~/vitalos/prod/coordination/` (nicht unter `migration/unified-product/` —
das war nur der Checkout-Merge vitalos-prod → vitalos/prod).

Lies-Reihenfolge fuer jede CEO-Session: CEO.md -> DIESER -> PRODUCT.md.
Pflege: Strukturwandel => gleicher Commit wie die Aenderung (Doku-Pflicht).

## Rollen (Agenten-Ebenen) — Kern reicht

Sitze: **CEO, COO, CPO, CTO, PM, AL.** Mehr braucht es nicht.

- **Owner Daniel:** Nur Gates (Store/Geraete/Release/Geld) und Richtung,
  wenn er sie setzt. Erreichbar via tele/Gmail/Chat. Bekommt **1×/Woche**
  Struktur vom CEO (Sonntag). Kein Tages-Theater, keine Agenten-Meta —
  Kapazitaet fuer Klienten und Training.
- **CEO (Perplexity):** Kurs. Taeglicher Digest **08:00**, Dispatches,
  Wochen-Door, Sonntagsbriefing an den Owner. Erntet die Fuehrungs-Briefings.
  Eine Tuer zu Daniel — kein Tages-Noise.
- **COO (Cursor):** Betrieb. Inbox `nimmsel23+ceo@gmail.com`, Runner/Timer/
  Catch-ups, Strukturhygiene, `coo-run` 06:25. Fuehrt lokal aus was der Kurs
  verlangt — kein eigener Kurs gegen den Perplexity-Digest. Owner nur bei
  echtem Brand.
- **CTO:** Code-Linien. ALs, CI, Architektur; `cto-run` 08:15. Steuert nicht
  den PM. Deploys nur nach Owner-Go.
- **CPO:** Produkt-Was — Discovery, Backlog, Reihenfolge. Steuert den PM.
- **PM:** Setzt das Was mit den ALs um (`+hit`). Haengt am CPO.
- **Abteilungsleiter:** Code je Repo (2×/Tag systemd). Intake = Guide-MD /
  Repo-TODO / Live-Terminal. Alpha/Betta = Ausfuehrung unter CTO, keine
  Extra-Fuehrungsebene.

Oracle (`vitalos-oracle` / ORACLE.md) = Werkzeug fuer Door/Game/Tent, keine
eigene Fuehrungsrolle.

## Berichtslinie

```
AL / PM / CPO / CTO / COO  -->  CEO (Perplexity)  --1×/Woche-->  Owner
```

- Kurz briefen (REAL/RAW/RELEVANT/RESULTS), 1 Rollenmail/Tag max.
- Intern: CEO-Digest. Owner: Sonntag vom CEO; COO nur bei Brand.
- Merksatz: Perplexity = Kurs · Cursor = Betrieb · CTO = Code · CPO/PM = Was ·
  Daniel = Gates.

## Berichtsstil

Berichte an den CEO im Format REAL * RAW * RELEVANT * RESULTS. Bei mentaler
Verknotung VOICE: STOP * SUBMIT * STRUGGLE * STRIKE. Das haelt The Alpha Code
und The Voice als Qualitaetssicherung — nicht als Extra-Berichtsschicht.

## Rollen-Skill-Stacks (Owner-Inputs, Stand 2026-11-11)

Arbeitsmodell: Rolle = Kern-SKILL + passende Methoden-SKILLs + die aktuellen
Projekt- und Koordinationsdokumente. Desk-SSOT: `~/.vos/<rolle>/` (README,
INTERPLAY, `.skills/vitalos-*`). Git-Pakete 1:1 unter Repo-Root (nicht in
`.vos` kopieren): `~/pm-skills`, `~/product-engineering`, `~/pm-brain` — am
Desk als `package-*`-Symlink. Externe Skills ergaenzen diese Quellen; die
Aufnahme macht ihre Empfehlungen nicht automatisch zu Org-Regeln.

| Rolle | Kern-SKILL und Wissensanker | Ergaenzungen / Stand |
| --- | --- | --- |
| CEO | `CEO.md` -> `ORG.md` -> `PRODUCT.md`; `~/.vos/ceo/.skills/vitalos-ceo` | Perplexity: Kurs, Digest 08:00, Wochen-Door, Owner-Sonntag tele. Desk: `DRAFTS/NIGHT-SHIFT-BRIEF.md` fuer Morgen-Review. Option: pm-skills-Methoden via `~/.vibe/skills`. |
| COO (Cursor) | `COO.md`; `~/.vos/coo/.skills/vitalos-coo` | Betrieb: Inbox `nimmsel23+ceo`, Runner, `coo-run` 06:25; lokal ausfuehren, kein Gegenkurs. Owner nur Brand. |
| CTO (Codex) | `CODEX.md`; `CTO.md`; `~/.vos/cto/.skills/vitalos-cto` | Methoden: ponytail, karpathy-guidelines, git-commit-analyzer, skill-creator; Paket `~/product-engineering` am Desk. `cto-run` 08:15. Kein PM-Hebel. |
| CPO (Claude) | [CPO.md](CPO.md); `vitalos-cpo` + `vitalos-cpo-desk` | Produkt-Was; product-strategy / OST / prioritization; Pakete `~/pm-skills`, `~/pm-brain` am Desk. Steuert PM. |
| PM | `~/.vos/pm/.skills/vitalos-pm` + `vitalos-pm-desk`; Desk `moc-pm.md` | 1 Move/Tag mit ALs; Mail CEO daily; Owner Freitag. Pakete pm-skills / pm-brain am Desk. |
| AL (Codex) | Repo-`AGENTS.md` / Guide-MD; `~/.vos/al/.skills/vitalos-al` | 2×/Tag systemd; `package-product-engineering`; Alpha/Betta unter CTO. |
| Oracle | `~/.vos/oracle/.skills/vitalos-oracle` / [ORACLE.md](ORACLE.md) | vos-door/game/tent-Phasen; Werkzeug — keine Fuehrungsrolle. COO: `ORG-ORACLE-WOCHE`. |

CTO-Lauf: `cto-run` 08:15. CEO lokal: `ceo-run` stuendlich :05 (Heartbeat
pausiert). Wochen-Door: CEO.

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
- Meta-Repo ~/vitalos (Default/Prod: `master`; früherer Umbau-Zweig
  `dev-product` ist gemergt und entfernt. Symlink ~/vitalos-prod
  -> vitalos/prod seit 2026-11-08; Altstand-Schnappschuss: ~/vitalos-prod-legacy-*).
  Owner 2026-11-09: keine Parallel-Branches/Worktrees ohne ausdrückliche
  Ausnahme — Git-Historie reicht als Versionierung.
- App-Entwicklung: ~/dev/<name>-dev (Produkt-App-Quellen, s. PRODUCT.md)
- Tools/Dienste: ~/.dotfiles (Runner, Units, Skripte), ~/aos (AlphaOS CLI,
  Firmenphilosophie), ~/.org (Org-Zuhause, venv symlink), ~/dev/agent-skills
  (Skill-Standard-Referenz, read-only), ~/.vibe/skills (Org-Agenten-Skills,
  BEFUND: unversioniert — Befund bei CTO-Linie), Skill-Format-Standard: ~/dev/agent-skills (Spec).
- Nicht verwechseln: skills-dev = Skills-APP (Produkt), NICHT die
  Skill-Verwaltung der Agenten.

## Maschinen und Kanaele
- Timer-Rhythmus (Owner 2026-11-09): ALs **zweimal taeglich** per systemd
  (`OnCalendar` Nacht+Nachmittag, z.B. journal 02:10/14:10 … coach 06:10/
  18:10). `coo-run` 06:25 → `coo-health` (kein LLM); Agent+Mail nur bei Rot
  bzw. `COO_FORCE=1`. Perplexity-CEO-Digest
  **08:00**. `cto-run` **08:15** (`vitalos-cto.timer`, nach Digest).
  Engine (Owner 2026-11-09): AL-Pool **vibe→cursor→claude→codex** mit Credits-
  Failover (kein agy). Bis **2026-11-11** AL-Erstversuch **cursor**.
  **PM = Antigravity-Electron-GUI oder Web-Gemini** (`nimmdaniel+pm@gmail.com`).
  Antigravity-Credits ab **2026-11-14**; Interim-GUI = Cursor Desktop.
  **`agy` CLI = Staff-Worker** (nicht PM/AL). `pm-run` = headless Sweep.
  Claude/Codex ab 11.11.
  roadmap 07:45, thin-results, emulator-test 13:00 (RAM-Gate 2500MB).
  Lokaler `ceo-run` stuendlich :05 (Live-Heartbeat pausiert; Reduktion auf
  woechentlich als Owner-Input vorgemerkt). ceo-digest 23:45 lokal
  (herzschlag-UNABHAENGIG), ci-scan 20-Min.
- Globale Org-Task-DB: TASKRC=~/.local/state/vitalos-org/taskrc — Rollen
  als Tags (+ceo/+cpo/+cto/+oracle/+pm/+al/...), project = Repo; ONLY UUID, nie ID.
- Gates: Browser-Gate -> tele + ceo-mailgate (Label +ceo); Stichwort-Gates
  (z.B. 'deploy-freigabe') -> Org fuehrt aus.
- Messenger: tele-Skript (Telegram+WA-Spiegel), wacli (WhatsApp-Ernte).
