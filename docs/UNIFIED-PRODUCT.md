# Gemeinsame Quellen für private PWA und Store-Produkt

## Besitz und Arbeitsorte

| Ort | Inhalt / Rolle |
| --- | --- |
| `~/vitalos/src` | private Shell |
| `~/vitalos/prod` | getrackte Produkt-Shell, native Projekte, Produkt-Runbooks |
| `~/vitalos/*-app` | einmalige, gepinnte App-Integration für beide Shells |
| `~/dev/*-dev` | eigentliche App-Entwicklung; teilweise Worktrees der App-Repos |
| Root `pnpm-workspace.yaml`, `pnpm-lock.yaml` | gemeinsamer Workspace und Abhängigkeitsstand |
| `~/vitalos-prod` | erhaltener Alt-Checkout; keine Quelle der neuen Produkt-Builds |

Der Haupt-Checkout enthält den Umbau auf `dev-product`. Die bestehende private
`master`-Linie, ältere Dev-Arbeit und andere Worktrees bleiben erhalten.
`prod/` wird weder ignoriert noch als eigenes Repository geführt. Eine Änderung
am gemeinsamen App-Pin gilt für beide Varianten; Unterschiede im Verhalten
werden ausdrücklich in Shell, Adaptern oder Produkt-Buildmodus umgesetzt.

## Befehle im Meta-Repo-Root

Ausführen unter `/home/alpha/vitalos`. Produkt-Buildwerte vorher aus der
freigegebenen lokalen Umgebung laden; Inhalte nicht ausgeben oder committen.
Paketmanager: `pnpm@11.3.0`.

| Befehl | Ergebnis |
| --- | --- |
| `pnpm run build:firebase` | private Shell; kein Produkt-Build |
| `pnpm run product:check` | prüft Besitzgrenzen und saubere, gepinnte gemeinsame Apps |
| `pnpm run product:build` | Store-Web-Ausgabe in `prod/dist-store` |
| `pnpm run product:build:observe` | Observe-Web-Ausgabe in `prod/dist-observe` |
| `pnpm run product:build:operate` | Operate-Web-Ausgabe in `prod/dist-operate` |
| `pnpm run product:build:native` | native Web-Ausgabe in `prod/dist-native`; noch keine APK |
| `pnpm run product:native:sync` | baut native Web-Ausgabe und synchronisiert Capacitor-Projekte |
| `pnpm run product:build:twa` | Fitness-TWA-Webvorbereitung; benötigt Paket/Fingerprint-Werte |
| `pnpm run product:manifest` | JSON-Quellnachweis für sauberen Gesamtstand; ohne Tag nur Kandidat |

`product:native:sync` enthält einen erneuten Web-Build. Bereits vorhandene
Web-Assets können bei Bedarf gezielt aus `prod/` mit `pnpm exec cap sync android`
oder `ios` synchronisiert werden. Synchronisierung ist kein nativer Build.
Details: [Firebase](../prod/docs/FIREBASE.md) und [Store](../prod/docs/STORE-PUBLISHING-PLAN.md).

## Pinning und Veröffentlichung

Ein Meta-Commit pinnt Root-Dateien, `prod/`, Lockfile und sämtliche App-Gitlinks.
Ein später autorisierter `product-*`-Tag bezeichnet genau diesen Gesamtstand.
CI verwendet `git submodule update --init --recursive`, ohne `--remote`.
Die Layout-Prüfung schützt vor abweichenden ausgecheckten App-Ständen; ein
Quellmanifest ist noch kein Funktions-, Geräte- oder Signing-Nachweis.

`origin` zeigt auf `nimmsel23/vitalos`, `product` auf `nimmsel23/vitalos-prod`.
Die Remote-Namen synchronisieren nichts. Ein Release-Mirror muss den gesamten
Meta-Repo-Stand einschließlich App-Pins und Root-Lockfile erhalten. Nur `prod/`
zu exportieren reicht nicht. Die alte Produkt-Historie wird nicht überschrieben.
Das VitalOS-Quellrepo ist öffentlich; dort gepushter Produktcode wäre ebenfalls
öffentlich. Konfiguration und Credentials gehören weiterhin nicht ins Git.

## Nachweisstand und nächste Arbeiten

Die Struktur wurde mit `2fe70f3`, der Produkt-Lockfile-Importer mit `e9ec5e9`
integriert. Vibes Abschlussbericht zu `164e6a3` meldet erfolgreiche Layout- und
Manifest-Guards. Das war keine neue APK, Geräteanmeldung oder Veröffentlichung.
Der anschließende Dev-Abgleich ist in `6b088d9` dokumentiert: Die ältere
Observe/Operate-Linie `f6243f6` ist Vorfahr des importierten Produktquellstands;
ihre betroffenen Pfade wurden den Produktquellen, historischen Dokumenten oder
bewusst getrennten Root-Konfigurationen zugeordnet. Ein pauschaler zusätzlicher
Merge dieser alten Linie ist dafür nicht erforderlich. Die weitere Arbeit
betrifft Abhängigkeiten, native Synchronisierung und Produktartefakte.
Noch nicht dokumentierte Ergebnisse dürfen nicht als bereits erledigt gelten.

Der Alt-Checkout und dortige Artefakte bleiben bis zur vollständigen Ablösung
erhalten. `vitalos-thin-results` verweist nach dem Integrationsbericht weiterhin
auf den alten Ort; das ist separat umzustellen. Keine Dienste als Nebenwirkung
von Quell- oder Doku-Arbeiten neu starten.
