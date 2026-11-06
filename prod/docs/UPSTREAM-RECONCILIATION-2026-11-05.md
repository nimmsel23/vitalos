# Upstream-Abgleich vom 5. November 2026

Verglichen wurden der Produktstand `f25b885` und der lokale Stand des privaten
Meta-Repos `1c71808`. `upstream/master` wurde aus `/home/alpha/vitalos`
aktualisiert; ein Abgleich mit GitHub fand dabei nicht statt. Das automatische
Nachladen von Submodulen scheiterte an der lokalen SSH-Konfiguration. Die
Gitlink-Vergleiche beziehen sich auf die genannten Meta-Repo-Commits, nicht
auf möglicherweise weiterentwickelte Arbeitsverzeichnisse.

## Einordnung

- Produkt-Firebase, Hosting, Store-Builds, Observe/Operate und die Produkt-Branches
  sind bewusste Unterschiede. Private Deploy-Workflows dürfen nicht pauschal
  übernommen oder aktiviert werden.
- Upstream enthält Verbesserungen im Fitness-Wrapper, unter anderem zum Pulse,
  Logbuch und zur Datumswahl. Produkt und Upstream ändern dort teilweise dieselben
  Dateien; insbesondere `Pages.jsx`, `PulseApp.jsx` und das Wrapper-Paket
  müssen fachlich zusammengeführt werden. Ein kompletter Ersatz würde auch
  Produktanpassungen an Authentifizierung und Kontobindung gefährden.
- Der Upstream hat Fuel-Mini-App-Submodule entfernt und einen Fuel-Wrapper
  eingeführt. Diese Strukturänderung braucht eine gesonderte Prüfung der
  Produktnavigation und des Builds; sie ist kein bloßes Pointer-Update.
- Der Upstream-Fix für `proxy-addr` 2.0.8 und die Node-22-Angabe im
  Push-Functions-Lockfile wird separat übernommen. Das aktiviert und deployt
  keine Functions.

## Skill-Gitlinks

| Skill | Produkt | Upstream | Beziehung anhand lokal vorhandener Objekte |
| --- | --- | --- | --- |
| Fitness | `574f661` | `4b26e959` | Upstream baut auf Produkt-Gitlink auf |
| Fuel | `e351845` | `c56e42f` | auseinanderentwickelt |
| Journal | `3db5810` | `173f434` | auseinanderentwickelt |
| Habits | `74e226f` | `95c0853` | auseinanderentwickelt |
| Plan | `f7dea5b` | `efb48ffe` | Upstream baut auf Produkt-Gitlink auf |
| Relax | `059c709` | `f589d18` | Upstream baut auf Produkt-Gitlink auf |
| 6Pack | `4569bdc` | `4362756` | Upstream baut auf Produkt-Gitlink auf |

Die lokalen Arbeitsverzeichnisse von Fuel, Journal und 6Pack stehen zusätzlich
auf anderen Commits als die Produkt-Gitlinks. Diese Abweichungen wurden nicht
verändert. Ein Gitlink darf erst nach Prüfung des Skill-Inhalts, der
Erreichbarkeit des Commits und der Build-Kompatibilität übernommen werden.

## Reihenfolge

1. Die fehlenden Fitness-, Plan- und 6Pack-Objekte wurden aus den lokalen
   privaten Checkouts geladen; die Arbeitsstände blieben unverändert. Vor
   einer Übernahme zusätzlich die Erreichbarkeit auf dem Remote prüfen.
2. Fitness-Wrapper-Änderungen gegen die Produktfassung prüfen und gezielt
   integrieren; anschließend den isolierten Produkt-Build prüfen.
3. Die Produkt-Skill-Branches mit ihren jeweiligen `vitalos`-Ständen abgleichen,
   Änderungen in den Quell-Repos zusammenführen und veröffentlichte Commits
   gezielt als Gitlinks übernehmen. Lockfile bei Bedarf synchronisieren.
4. Fuel-Struktur und Relax-/Plan-Updates gesondert auf ihre Wirkung für die
   Produkt-Shell prüfen. Deploy-Konfiguration und Produkt-Firebase bleiben
   eigenständig.

Ein rein virtueller Merge meldete Konflikte in Repo-Dokumentation,
`pnpm-lock.yaml`, vier Skill-Gitlinks und Fitness-Wrapper-Dateien; er hat den
Arbeitsbaum nicht verändert. Sein Ergebnis ersetzt keine Skill-Integration.

## Erste Fitness-Übernahme

Der Pulse-Parser unterstützt die Upstream-Schreibweisen mit `×`, optionalem
Gewicht sowie Cardio-Dauer und -Strecke und begrenzt die Anzahl erzeugter Sätze.
Die Eingabe sendet während einer Texteingabekomposition nicht vorzeitig ab.
Tailwind erfasst zusätzlich die Plan-Skill-Quellen. Die Übernahme ersetzt weder
die produktseitige Authentifizierung noch die kontogebundene Navigation. Die
übrigen Upstream-Änderungen an Pulse-Speicherung und Seiten bleiben gesondert
zu prüfen.

Die fehlenden Git-Objekte für Fitness, Plan und 6Pack wurden anschließend lokal
aus `~/vitalos` geladen. Ihre Upstream-Gitlinks sind Nachfahren der jeweiligen
Produkt-Gitlinks. Das allein bestätigt weder Remote-Verfügbarkeit noch
Produktkompatibilität.

Der lokale Fitness-Produktbuild mit Produktkonfiguration und die anschließende
Firebase-Isolationsprüfung liefen nach der ersten Übernahme erfolgreich. Der
Build verwendete die vorhandenen Submodul-Arbeitsstände; Fuel, Journal und
6Pack wichen dabei vom Gitlink ab. Ein Geräte- oder Nutzertest und ein Build
eines sauberen Checkouts sind damit nicht belegt.


## 6Pack-Pointer und Lockfile

Der Produkt-Gitlink kann auf den veröffentlichten VitalOS-Commit
`79760537eb6db86b293d9c25ba40e3a9dc238ace` zeigen. Der isolierte Build dieses
Commits mit den vorhandenen 6Pack-Dev-Abhängigkeiten lief durch (Vite 6.4.5,
2099 Module, Service-Worker/Splash gestempelt). Der Produkt-Lockfile erhielt
gezielt den 6Pack-Importer und dessen fehlende Auflösungen aus dem VitalOS-Lockfile:
81 Paket-Metadaten und 84 Snapshots. Die anderen Importer und die Produkt-Root-
Abhängigkeiten bleiben aus dem Produkt-Lockfile erhalten. Eine frische pnpm-
Installation konnte wegen nicht verfügbarer Registry-DNS nicht bestätigt werden.
