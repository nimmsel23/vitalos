# prod/coordination — Org- & Produkt-Koordination

Kanonischer Ort für Rollenlandkarte, CEO/CTO/CPO-Anker, Oracle/Game-Maps,
Produkt-TODO/STATUS und Backlog.

| Datei / Ordner | Zweck |
| --- | --- |
| `ui/` | „Lagezelt“: HTML-UI über Koordinations-Docs + Living-Boards-Ansicht (Lokal-Server, liest live) |
| `BOARDS.md` | Bridge zu `~/DASHBOARDS.md` / vitalos#27–#33 |
| `ORG.md` | Rollenroster (CEO, COO, CPO, CTO, PM, AL) + Berichtslinie |
| `ORACLE.md` | AlphaOS-Guidance (Door 4P, Game 4F, Tent) |
| `PRODUCT.md` | Produktzusammensetzung (+ Link Dev-Dashboard) |
| `CPO.md` / `CTO.md` | Rollenanker |
| `TODO.md` / `STATUS.md` | Produkt-/Android-Linien-Lage |
| `game/` | Frame/Freedom/Focus/Fire + Tent |
| Meta `docs/DEV-DASHBOARD.md` / `portal/` | Hosting-Apps Dev-Dashboard (CTO pflegt, PM liest) |

**UI starten:** `cd ~/vitalos/prod/coordination && python3 -m http.server 8765 --bind 127.0.0.1`
dann http://127.0.0.1:8765/ui/ — liest die Markdown-Dateien live per `fetch`.

**Living Boards befüllen:** `./ui/gen-boards.py` schreibt `boards/{workspace,vitaltrainer,creator,business,vitalos,coach}.md` aus lokaler Repo-Evidenz und aktualisiert Manifest + `BOARDS.md`.
**SSOT der Boards = GitHub origin** (Owner 2026-11-13): maßgeblich ist, was CI `living-boards.yml` aus den origin-Klonen generiert und nach master committet. Lokaler Lauf = Vorschau (liest lokale Working Trees inkl. Ungepushtem) — nicht committen, vorher `git pull`.  
Nach weiteren `*.md`: `./ui/gen-manifest.sh`. Ansicht **Boards** (`#boards` / Taste `4`).  
CI: `.github/workflows/living-boards.yml` (Mo + bei coordination-Push; ohne Sibling-Repos viele „fehlt“).  
Firebase-Hosting-Inventar bleibt `vos-portal` / `docs/DEV-DASHBOARD.md`.

Laufzeit-Logs der Runner liegen **nicht** hier, sondern unter
`~/.local/state/vitalos-<rolle>/`.

Historischer Pfad `prod/migration/unified-product/coordination/` ist nur noch
ein Symlink hierher (Merge-Rest der Checkout-Konsolidierung Nov 2026).

**Lagezelt als Dienst (seit 2026-11-13):** `lagezelt.service` (User-Unit aus `~/.dotfiles/config/systemd/user/`)
serviert diesen Ordner dauerhaft auf `http://127.0.0.1:8765/ui/` — kein Handstart mehr nötig. Am Handy übers
Tailnet: `https://ideapad.tail7a15d6.ts.net:8443/lagezelt/ui/` (`tailscale serve --https=8443 --set-path /lagezelt
http://127.0.0.1:8765`, tailnet only, nicht gefunnelt). Bleibt bewusst lokal/privat (liest das gitignorierte
`STATUS.md`); kein Firebase/Pages. Git und Deploys laufen über CI — das Lagezelt verlinkt dorthin (Sidebar
„Dashboards & Git“: Org-Cockpit, Master/Coaching, CEO, Entwicklung, App-Links, offene PRs, CI). `gen-manifest.sh`
listet `STATUS.md` immer, auch wenn CI das Manifest aus einem frischen Klon erzeugt.
