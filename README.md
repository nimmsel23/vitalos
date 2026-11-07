# VitalOS

Ein Meta-Repository für die private VitalOS-PWA und die Store-Produktvariante.
Beide verwenden dieselben gepinnten App-Submodule. Produkt-Firebase und native
Paketierung bleiben eigene Build- und Release-Ziele.

```text
src/                       private Shell
fitness-app/, fuel-app/…    gemeinsame App-Submodule
prod/src/                  Store-Shell: Observe / Operate
prod/android/, prod/ios/    gemeinsames natives Produkt
prod/platforms/fitness-twa/ separater Fitness-TWA-Pilot
pnpm-workspace.yaml        gemeinsamer Workspace einschließlich prod
pnpm-lock.yaml             gemeinsamer Abhängigkeitsstand
```

## Einstieg

| Aufgabe | Zuständige Doku |
| --- | --- |
| Repo-Rollen, Branches und erlaubte Edit-Orte | [AGENTS.md](AGENTS.md) |
| Gemeinsame Quellen, Befehle und Produkt-Pinning | [Produktstruktur](docs/UNIFIED-PRODUCT.md) |
| Produktstand und nächste Schritte | [Produktstatus](prod/docs/PRODUCT-CHECKOUT.md) |
| Produkt-Firebase, lokale Konfiguration, Deployment | [Firebase-Runbook](prod/docs/FIREBASE.md) |
| Android/TWA, Signing und Store-Release | [Store-Plan](prod/docs/STORE-PUBLISHING-PLAN.md) |
| Private App-/Shell-Veröffentlichung | [Deployment](docs/DEPLOYMENT.md) |

Der Umbau ist lokal auf `dev-product` integriert. Ein Branchname allein ist
kein Veröffentlichungsnachweis. Ein App-Update wird einmal über den jeweiligen
Dev-/Release-Weg in den gemeinsamen Gitlink übernommen; beide Varianten bauen
danach aus diesem Stand. Ein `product-*`-Tag kann einen geprüften Gesamtstand
festhalten. CI lädt seine gespeicherten Gitlinks ohne `--remote`.

`~/vitalos-prod` zeigt lokal als Symlink auf den Produktbereich `~/vitalos/prod`.
Der frühere Altstand mit Artefakten und Koordination liegt archiviert unter
`~/vitalos-prod-legacy-2026-11-07`.
Es ist nicht die Quellbasis der neuen Produkt-Builds. Ein gelungener Umzug ist
noch kein neuer Android-Build oder Store-Release.
