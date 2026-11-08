# PRODUCT.md — Zusammensetzung des VitalOS-Produkts (Stand 2026-11-08)

Vertiefung: UNIFIED-PRODUCT.md (Meta-Repo docs/), prod/docs/SCOPE-OBSERVE-V1.md,
prod/docs/PRODUCT-CHECKOUT.md, STORE-PUBLISHING-PLAN.md. APPS.md-Prinzip: Diese
Tabelle IST die Apps-Liste — jede Zeile verifiziert am .gitmodules-Kopf.
Strategie-SOT: `VitalOS-Produktstrategie-V1.3.0.md` (Owner E1 Ja, 2026-11-08).
Feature-Freeze bis 2027-02-07 (E2): fitness/fuel/relax/plan/6pack nur Wartung
mit Nutzerbezug. Coaching/Patreon parallel freigegeben (E3), Ausfuehrung Owner.

## Produkt (eine Shell, 9 Apps, Meta-Repo ~/vitalos)
Shell: Web/Firebase (vitalos.web.app) + Android (prod/android, Capacitor,
com.vitalos.app) + Pages-Kanal (github.io/vitalos, Bewertung offen).

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
Agenten-Faehigkeiten heissen Org-Skills und liegen in ~/.vibe/skills.

## Release-Fluss (je App)
dev (Quell-Repo) -> push origin dev -> CI Check -> Auto-Promote -> master
-> Live-Deploy (firebase site je App). Gitlink-Bump im Meta-Repo via Runner.
Fremde Ausnahmen: Coach (eigenstaendig, firewall.rules.part importiert).
