# ORG.md — Landkarte der VitalOS-Org (Stand 2026-11-11)

Ort: `~/vitalos/prod/coordination/`. Pflege = gleicher Commit wie die Aenderung.
Owner-Vertrag (Gates, Einschreiten, Anti-Meta, Perplexity-Optionen):
`~/.vos/org/OWNER-CONTRACT.md` (`nimmsel23/vos`).

Lies bei Kurs-Arbeit: OWNER-CONTRACT -> DIESER -> PRODUCT.md (-> CEO.md nur
als Laufgedächtnis).

## Gleichrangig — Skills, keine Fantasie-Charaktere

Agenten sind **gleich**, egal Cursor / Claude / ChatGPT / Grok / Perplexity.
**Rolle = Skill** (`vitalos-*` + Methoden), geladen wenn die Arbeit es braucht
— passend zum Solopreneur (Vitaltrainer / Creator / VitalOS), nicht als
Hierarchie zwischen Chats.

Skill-Sitze die reichen: **CEO, COO, CPO, CTO, PM, AL** (+ Oracle-Werkzeug).
Kein Shadow-CEO-Orchester. Ping-Pong verboten: nicht „brief die andere Rolle“,
sondern Skill laden / Task+Tag / Commit.

- **Owner Daniel:** High-Level Business-Orders + Owner-Gates + optional Freitag /
  Sonntag. Kein Tages-Dispatcher. Kapazitaet = Klienten, Training, Brand.
- **CEO-Skill:** Kurs buendeln, Gates schaerfen, Sonntags-Zusammenfassung —
  **wer** den Skill laedt (Cursor o.a.), ist egal. Kein Pflicht-WebApp-CEO.
- **COO-Skill:** Betrieb, Inbox, Runner (`coo-run` 06:25). Owner nur bei Brand.
- **CTO-Skill:** Code/CI/AL (`cto-run` 08:15). Deploy nach Owner-Go.
- **CPO-Skill:** Produkt-Was / Discovery / Reihenfolge.
- **PM-Skill:** Ein Move/Tag mit ALs (`+hit`).
- **AL:** Repo-Ship 2×/Tag; Intake Guide-MD / TODO / Live.
- **Perplexity (Default B):** Research auf Auftrag (vos-Commit oder WebApp-
  Dauerauftrag). **Keine Fuehrungsrolle.** Optionen A/C in OWNER-CONTRACT.

Oracle = Door/Game/Tent-Werkzeug, keine Fuehrung.

## Git = Organisation; Owner = Gates

```
Arbeit / Entscheidung  -->  Commit (vos | vitalos | App-Repo) + Org-Task
Owner                  <--  Gate-Mail (+org) | ORDER | Freitag | Brand | So optional
```

- Keine Berichtskette Rolle→Rolle→Owner.
- REAL/RAW/RELEVANT/RESULTS nur wenn ein Bericht noetig ist (Gate/Digest) —
  nicht als taegliches Ping-Ritual.
- Merksatz: **Git = Stand · Skills = Kompetenz · Daniel = Orders+Gates ·
  Perplexity = Research (Default).**

## Berichtsstil

Nur wenn ein Bericht noetig ist (Gate, Brand, optionaler Digest): REAL * RAW *
RELEVANT * RESULTS. Bei Verknotung VOICE: STOP * SUBMIT * STRUGGLE * STRIKE.
Kein taegliches Melde-Ritual.

## Rollen-Skill-Stacks (Owner-Inputs, Stand 2026-11-11)

Arbeitsmodell: Rolle = Kern-SKILL + passende Methoden-SKILLs + die aktuellen
Projekt- und Koordinationsdokumente. Desk-SSOT: `~/.vos/<rolle>/` (README,
INTERPLAY, `.skills/vitalos-*`). Git-Pakete 1:1 unter Repo-Root (nicht in
`.vos` kopieren): `~/pm-skills`, `~/product-engineering`, `~/pm-brain` — am
Desk als `package-*`-Symlink. Externe Skills ergaenzen diese Quellen; die
Aufnahme macht ihre Empfehlungen nicht automatisch zu Org-Regeln.

| Rolle | Kern-SKILL und Wissensanker | Ergaenzungen / Stand |
| --- | --- | --- |
| CEO-Skill | `~/.vos/ceo/.skills/vitalos-ceo`; Lauf `CEO.md` | Kurs buendeln, Gates; Sonntag optional. Beliebige Engine. |
| COO-Skill | `~/.vos/coo/.skills/vitalos-coo` | Inbox `nimmsel23+ceo`, Runner, `coo-run` 06:25. Brand → Owner. |
| CTO-Skill | `~/.vos/cto/.skills/vitalos-cto` | `cto-run` 08:15; `~/product-engineering`. |
| CPO-Skill | `vitalos-cpo` (+ desk) | Was/Discovery; `~/pm-skills`, `~/pm-brain`. |
| PM-Skill | `vitalos-pm` (+ desk); `moc-pm.md` | 1 Move/Tag; Owner Freitag optional. |
| AL | Repo-Guide; `vitalos-al` | 2×/Tag systemd. |
| Oracle | `vitalos-oracle` | Door/Game/Tent — Werkzeug. |
| Research | Perplexity (Default B) | Auftrag via vos-Commit / WebApp-Dauerauftrag → Ergebnis committen. |

CTO-Lauf: `cto-run` 08:15. `ceo-run` :05 nur bei altem Heartbeat.

### Plattformen (Werkzeug, kein Rang)

| Werkzeug | Nutzen |
| --- | --- |
| **Cursor** | Primär-Alltag / Execution |
| Claude / ChatGPT / Codex | Skills bei Bedarf; AL-Failover |
| Perplexity | Research (nicht Führung, Default B) |
| Grok | Optional adversarial / Narrative — **kein** Shadow-CEO |

Keine parallelen „Charakter-CEOs“. Gleicher Skill-Text, gleiche Gates.

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
  (Skill-Standard-Referenz, read-only), ~/.vos (Org-Skill-SSOT, Git
  nimmsel23/vos); ~/.vibe/skills nur Mount/Symlink. Skill-Format-Standard:
  ~/dev/agent-skills (Spec).
- Nicht verwechseln: skills-dev = Skills-APP (Produkt), NICHT die
  Skill-Verwaltung der Agenten.

## Maschinen und Kanaele
- Timer-Rhythmus (Owner 2026-11-09): ALs **zweimal taeglich** per systemd
  (`OnCalendar` Nacht+Nachmittag, z.B. journal 02:10/14:10 … coach 06:10/
  18:10). `coo-run` 06:25 → `coo-health` (kein LLM); Agent+Mail nur bei Rot
  bzw. `COO_FORCE=1`. Perplexity-CEO-Digest
  **08:00**. `cto-run` **08:15** (`vitalos-cto.timer`, nach Digest).
  Engine: **Cursor-first** AL-Pool **cursor→claude→codex** (Vibe pausiert).
  Skill-SSOT: `~/.vos`. Perplexity = Research (OWNER-CONTRACT B).
  Owner-Gates: `+org` / `org-mail` — kein Rollen-Pingpong.
  roadmap 07:45, thin-results, emulator-test 13:00 (RAM-Gate 2500MB).
  Lokaler `ceo-run` stuendlich :05 (Live-Heartbeat pausiert; Reduktion auf
  woechentlich als Owner-Input vorgemerkt). ceo-digest 23:45 lokal
  (herzschlag-UNABHAENGIG), ci-scan 20-Min.
- Globale Org-Task-DB: TASKRC=~/.local/state/vitalos-org/taskrc — Rollen
  als Tags (+ceo/+cpo/+cto/+oracle/+pm/+al/...), project = Repo; ONLY UUID, nie ID.
- Gates: Browser-Gate -> tele + ceo-mailgate (Label +ceo); Stichwort-Gates
  (z.B. 'deploy-freigabe') -> Org fuehrt aus.
- Messenger: tele-Skript (Telegram+WA-Spiegel), wacli (WhatsApp-Ernte).
