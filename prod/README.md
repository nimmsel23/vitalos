# VitalOS Store-Produkt

`prod/` ist der Produktbereich des übergeordneten VitalOS-Meta-Repos.
Observe und Operate sind Produktvarianten; die gemeinsamen Apps liegen als
Submodule eine Ebene darüber. Hier gibt es kein eigenes Git oder Lockfile.

- [Aufbau und Root-Befehle](../docs/UNIFIED-PRODUCT.md)
- [Aktueller Produktstand](docs/PRODUCT-CHECKOUT.md)
- [Firebase und Build-Konfiguration](docs/FIREBASE.md)
- [Android, TWA und Veröffentlichung](docs/STORE-PUBLISHING-PLAN.md)
- [Produkt-Regeln für Agents](AGENTS.md)

Builds vom Meta-Repo-Root über `pnpm run product:*` starten. Native Shell:
`android/`, `ios/`, Paket `com.vitalos.app`. Separater Fitness-TWA-Pilot:
`platforms/fitness-twa/`, vorläufige Kennung `at.vitalos.fitness`.
Die beiden Android-Projekte sind unterschiedliche Auslieferungswege.

Lokale Werte liegen in ignoriertem `.product-config/`. Alte Build- und
Cloud-Berichte stehen unter `docs/archive/`; sie belegen keinen Build aus
dem neuen gemeinsamen Workspace.
