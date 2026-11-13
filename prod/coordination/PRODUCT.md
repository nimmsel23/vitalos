# PRODUCT.md — Produktlandschaft (Stand 2026-11-11)

**Namen:** `vitalos` = Projekt+Repo · **VitalOS** = System · `vos` = Org-Git.
Philosophie: User = doing/thinking/feeling/being (kein 4B-Domain-Zeug);
Owner-Alpha unsichtbar — `~/.vos/org/PHILOSOPHY.md`.

Vertiefung: UNIFIED-PRODUCT.md (Meta-Repo docs/), prod/docs/SCOPE-OBSERVE-V1.md,
prod/docs/PRODUCT-CHECKOUT.md, STORE-PUBLISHING-PLAN.md. APPS.md-Prinzip: Diese
Tabelle IST die Apps-Liste — jede Zeile verifiziert am .gitmodules-Kopf.
Strategie-SOT: `VitalOS-Produktstrategie-V1.3.0.md` (Owner E1 Ja, 2026-11-08).
Feature-Freeze bis 2027-02-07 (E2): fitness/fuel/relax/plan/6pack nur Wartung
mit Nutzerbezug. Coaching/Patreon parallel freigegeben (E3), Ausfuehrung Owner.

## Portal — App-Links & APK-Downloads (kein Dashboard)

Lebende Karten inkl. Auth-/Login-Gate-/ROT-Tags — **App-Links + APK-Downloads, kein Org-Board**:
[docs/DEV-DASHBOARD.md](../../docs/DEV-DASHBOARD.md) ·
[portal/index.html](../../portal/index.html) ·
Pages: https://nimmsel23.github.io/vitalos/dev-dashboard.html ·
je Repo `docs/apps.html` (z. B. https://nimmsel23.github.io/fuel-dev/apps.html).

**Org-Dashboards (Bot-Boards):** https://vos-dev-dashboards.web.app
(Alias https://vitalos-dev.web.app) · Quelle `~/dashboards` / `nimmsel23/dashboards`.

**Hosting-Kanon:** jede Surface = `vos-<slug>.web.app`
([docs/HOSTING-TARGETS.md](../../docs/HOSTING-TARGETS.md)). Ist noch gemischt
(`fuel-vos` vs `vos-fuel-log` vs `fitness-aos`) — das speist OAuth-Mismatch.
Neue Sites nur noch kanonisch; Alt-Namen Alias/Redirect.

Owner: **CTO** aktualisiert Portal (`vos-portal --all` / `--check` + Hosting-Kanon);
**PM** liest als Surface-Inventar — keine parallele Apps-HTML von Hand. Overlay:
`portal/dev-status.json`.

## Projekt `vitalos` (Shell, 9 Apps, Meta-Repo ~/vitalos)

Technik-Stand des **Projekts**. **VitalOS** ist das komplette System drumherum
(Apps + Coaching/Brand + AlphaOS-/Warrior-Disziplin) — nicht jeder App-Ship =
„VitalOS fertig“.

Shell: Web/Firebase (vitalos.web.app) + Android (prod/android, Capacitor,
com.vitalos.app) + Pages-Kanal (github.io/vitalos, Bewertung offen).

Lineage: **`~/aos`** ist der Ursprung — daraus entstanden u.a. `fitness-dev`
und `fuel-dev` (siehe `~/.vos/org/PHILOSOPHY.md`).

## APPS (App-Ordner im Meta-Repo <-> Quell-Repo in ~/dev, Branch vitalos)
| App (Meta) | Quell-Repo | App-Thema |
| --- | --- | --- |
| fitness-app | fitness-dev | Fitness/Training (Skill-App) |
| fuel-app | fuel-dev | Ernaehrung/Fuel (Skill-App) |
| journal-app | journal-dev | Journal/SmartLog (Skill-App, M1-Kern) |
| habit-app | habits-dev | Habits (Skill-App) |
| learn-app | learn-dev | Lernbereich |
| relax-app | relax-dev | Entspannung/Praxis (Atem, Releases aktiv) |
| 6pack-app | 6pack-dev | 6pack-Spiel/Sammlung |
| plan-app | plan-dev | Planer/Termine |
| skills-app | skills-dev | Uebungs-/Skills-Katalog der Fitness-Linie (APP!) |

Hinweis fuer CEO-Sessions: skills-app ist ein PRODUKT (Katalog-App), die
Agenten-Faehigkeiten heissen Org-Skills und liegen in ~/.vos (Primär Cursor).

## Release-Fluss (je App)
dev (Quell-Repo) -> push origin dev -> CI Check -> Auto-Promote -> master
-> Live-Deploy (firebase site je App). Gitlink-Bump im Meta-Repo via Runner.
Fremde Ausnahmen: Coach (eigenstaendig, firewall.rules.part importiert).
