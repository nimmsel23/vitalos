# ORG.md — Landkarte der Org um Projekt vitalos (Stand 2026-11-11)

Ort: `~/vitalos/prod/coordination/`. Pflege = gleicher Commit wie die Aenderung.
Owner-Vertrag: `~/.vos/org/OWNER-CONTRACT.md` (`nimmsel23/vos`).

**Namen:** `vitalos` = Projekt+Repo · **VitalOS** = System · `vos` = Org-Git/
WebApps · **core4-aos** = Firebase zu `~/aos`. Philosophie-SSOT:
`~/.vos/org/PHILOSOPHY.md` — User: nur DFTB (doing/thinking/feeling/being);
4B-Domains = Owner only; Org = Business-Dominion.

Lies bei Kurs-Arbeit: OWNER-CONTRACT -> DIESER -> PRODUCT.md (-> CEO.md nur
als Laufgedächtnis).

## Zwei Schichten: `vos` (WebApps) vs Org (Laptop)

| Schicht | Wer | Was |
| --- | --- | --- |
| **`vos`** | WebApps (Perplexity, Grok, ChatGPT-/Claude-Web, …) + Git `nimmsel23/vos` | Denk-/Research-/Order-Fläche. WebApps sind **basically vos**. |
| **Org** | Laptop-Agenten mit `orgsh` + Shell + Runner | Ausfuehrung. Skills `vitalos-*`. Gleichrangig. |

WebApp-Output zählt als vos-Commit / Gate / `+org` — dann greift die Org.
Kein zweites Abteilungs-Orchester im Browser.

Skill-Sitze (Laptop): **CEO, COO, CPO, CTO, PM, AL** (+ Oracle).
Owner: Orders + Gates; optional Freitag/Sonntag; Brand.

**Org-Norm:** Jeder Laptop-Agent hält sich an **AOS Chapters**
(`orgsh -c 'aos chapter …'`). **Fire Map** = Owner (Daniel) — was **er**
machen muss; Org-TW ≠ Owner-Fire-Map.

## Stand & Gates

```
vos / WebApp  -->  Commit | Gate | +org
Org (Laptop)  -->  Taskwarrior + Shell + Ship  (Agenten-Arbeit)
Owner         -->  Fire Map | ORDER | Gate | Freitag | Brand
```

- Merksatz: **vos = WebApps/Git · Org = Laptop TW+Shell · Daniel =
  Fire Map + Orders + Gates.**
- **Org-Agenten:** AOS Chapters; Org-TW priorisiert ihre Arbeit — nicht
  Daniels Fire Map.

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
| vos / WebApps | Perplexity & Co. | Basically vos; Output = Commit/`+org`. |

CTO-Lauf: `cto-run` 08:15. `ceo-run` :05 nur bei altem Heartbeat.

### Plattformen (Werkzeug, kein Rang)

| Werkzeug | Nutzen |
| --- | --- |
| **Cursor** | Primär-Alltag / Execution |
| Claude / ChatGPT / Codex | Skills bei Bedarf; AL-Failover |
| Perplexity / Grok / ChatGPT-Web / Claude-Web | **vos-Schicht** — Git, kein TW/Shell |

Org = Laptop + Taskwarrior + Shell. vos/WebApps ≠ Org-Abteilung.

Org-Rollen priorisieren ueber Taskwarrior-Urgency in der Org-DB (Tags
`+ceo`/`+cpo`/`+cto`/…). Das ist **Agenten-Arbeit**, nicht Daniels **Fire
Map**. Fire Map = Owner-Ausfuehrung (The Game). Tent und Core4-Score bleiben
Daniels persoenlicher Kreis.

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
  bzw. `COO_FORCE=1`. `cto-run` **08:15**. Engine: **Cursor-first**
  AL-Pool **cursor→claude→codex** (Vibe pausiert). Skill-SSOT: `~/.vos`.
  vos/WebApps = Research-Schicht (OWNER-CONTRACT B). Owner-Gates: `+org`.
  roadmap 07:45, thin-results, emulator-test 13:00 (RAM-Gate 2500MB).
  Lokaler `ceo-run` stuendlich :05 (Live-Heartbeat pausiert; Reduktion auf
  woechentlich als Owner-Input vorgemerkt). ceo-digest 23:45 lokal
  (herzschlag-UNABHAENGIG), ci-scan 20-Min.
- Globale Org-Task-DB: TASKRC=~/.local/state/vitalos-org/taskrc — Rollen
  als Tags (+ceo/+cpo/+cto/+oracle/+pm/+al/...), project = Repo; ONLY UUID, nie ID.
- Gates: Browser-Gate -> tele + ceo-mailgate (Label +ceo); Stichwort-Gates
  (z.B. 'deploy-freigabe') -> Org fuehrt aus.
- Messenger: tele-Skript (Telegram+WA-Spiegel), wacli (WhatsApp-Ernte).
