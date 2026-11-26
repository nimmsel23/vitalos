
## Owner-Korrektur 2026-11-26: Produkt ist keine Produktionsstufe

`prod/` ist das eigenständige shipbare Play-/App-Store-Produkt, keine
Produktionsstufe der privaten VitalOS-Shell. Gemeinsame App-Gitlinks teilen
Quellcode; sie veröffentlichen weder das Produkt noch übertragen sie
Accounts, Entitlements oder Functions aus `fitness-aos` nach `vitalos-prod`.
Observe/Operate als Ansichten vergeben keine KI-Rechte. Diese prüft der Server.

Owner beauftragt die Korrektur der widersprüchlichen Smart-Logger-Verdrahtung:
Store-Sperre auch für Operate, veralteter Functions-Quellpfad und falsche
Behauptung „nie deployt“. Live geprüft am 2026-11-26: `analyzeSmartLog` und
`getSmartLogQuota` existieren in `vitalos-prod`; `voiceReflect` fehlt. Beide
Owner-Mails existieren dort mit eigenen UIDs ohne Operate-Entitlement. Die
Freischaltungen aus dieser Session betrafen ausschließlich `fitness-aos`.
KI-Freigabe im Code ersetzt keine Anpassung/Abnahme der öffentlichen
Datenschutzerklärung und Store-Datensicherheitsangaben vor Veröffentlichung.

# Produktstand im gemeinsamen VitalOS-Meta-Repo

## Aktuelle Quelle

`~/vitalos/prod` ist der getrackte Produktbereich des Meta-Repos `~/vitalos`.
Die gemeinsame Struktur wurde auf `dev-product` integriert. Der frühere
Checkout `~/vitalos-prod` wurde lokal als `~/vitalos-prod-legacy-2026-11-07`
archiviert; `~/vitalos-prod` ist jetzt ein Symlink auf `~/vitalos/prod`.
Der Archiv-Checkout bewahrt lokale Änderungen, Konfiguration,
Artefakte und Worktrees; neue Produkt-Builds beziehen ihre Apps aus dem Parent.
Observe und Operate verwenden denselben Produkt-Unterbau.

| Bereich | Nachgewiesener Stand der Übernahme |
| --- | --- |
| Produktquellen | `2fe70f3`, gemeinsame Root-App-Gitlinks |
| Gemeinsames Lockfile | Produkt-Importer seit `e9ec5e9` |
| Abschluss | `164e6a3`, sauberer Arbeitsbaum laut Abschlussbericht |
| Struktur und Quellmanifest | von Vibe erfolgreich gemeldet; Kandidat ohne Tag |
| Lokale Produktwerte | ignorierte Kopie in `.product-config/`, Original erhalten |
| Neuer nativer Build aus dieser Struktur | durch diesen Integrationsabschluss nicht belegt |
| Publish/Deploy/Store-Upload | durch die Migration nicht ausgeführt |

Die Tabelle dokumentiert den Integrationsabschluss, nicht jeden nachfolgenden
Agent-Schritt. Ein aktueller Build braucht einen eigenen Quellcommit und
Artefaktnachweis. Frühere native Builds im alten Checkout bleiben frühere Builds.

Erste native Artefakte aus dem gemeinsamen Workspace am 2026-11-06: Debug-APK
und signierte Release-AAB aus Meta-Commit `cb4a55b` (`dev-product`), inklusive
Toolchain, Hashes und Signaturprüfung dokumentiert unter
[STORE-PUBLISHING-PLAN.md](STORE-PUBLISHING-PLAN.md) → „Erste Artefakte aus
dem gemeinsamen Workspace“. Installation, Anmeldung und Upload bleiben
separate Nachweise.

## Nächste Schritte

1. Gewünschten gemeinsamen Quellstand festhalten. Der ältere Dev-Abgleich ist
   durch `6b088d9` dokumentiert; seine Produktarbeit stammt aus derselben Linie.
   Dafür ist kein pauschaler erneuter Merge historischer Root-Konfigurationen nötig.
2. Gemeinsame Abhängigkeiten bereitstellen, Produkt-Webausgabe bauen und native
   Projekte synchronisieren. Das vorhandene Lockfile ersetzt keinen Frozen-Install.
3. Android-APK/AAB aus den neuen Pfaden erzeugen — am 2026-11-06 erledigt
   (Nachweise siehe STORE-PUBLISHING-PLAN.md, „Erste Artefakte aus dem
   gemeinsamen Workspace“). Installation, Anmeldung und Store-Upload sind
   eigene Schritte; iOS braucht einen separaten Mac/Xcode-Build.
4. Erst nach geklärtem Quell-/Artefaktstand einen Produkt-Tag und gegebenenfalls
   den Release-Mirror auf `nimmsel23/vitalos-prod` beauftragen.
5. Alt-Checkout und Dienstpfade erst nach vollständiger Ablösung bereinigen.

## Produktgrenzen

Firebase-Ziel ist ausschließlich `vitalos-prod`. Der native Shell-Pfad verwendet
`com.vitalos.app`; der separate Fitness-TWA-Pilot liegt in
`platforms/fitness-twa` mit vorläufigem Paket `at.vitalos.fitness`.
Hosting, Auth, Rules, Functions, Push und Android-Signierung sind unterschiedliche
Ressourcen. Ein eingerichtetes Ziel oder ein Quellmanifest bestätigt keine
authentifizierte Nutzung oder Store-Freigabe.

## Zuständige Runbooks

- [Gemeinsame Struktur und Root-Befehle](../../docs/UNIFIED-PRODUCT.md)
- [Herkunft und Integrationsnachweis](UNIFIED-PRODUCT.md)
- [Produkt-Firebase](FIREBASE.md)
- [Native Artefakte und Store-Release](STORE-PUBLISHING-PLAN.md)
- [Historischer Produktstand vor der Zusammenführung](archive/PRODUCT-CHECKOUT-BEFORE-UNIFICATION-2026-11-06.md)
- [Übernommene Dokumente aus dem alten Checkout](archive/vitalos-prod-legacy-2026-11-07/README.md)

Die Historie enthält datierte Hosting-, Auth-, Rules- und Android-Befunde sowie
ältere, teils überholte Aussagen. Sie wird bewahrt, aber nicht als aktueller
Build- oder Cloud-Zustand ausgegeben.

### Übergabe zum Fix (2026-11-26)

Journal-Quellfix lokal: `~/dev/journal-dev`, Commit `8d98ad7`. Die neue
optionale Prop `allowSmartLogging` aktiviert den serverseitigen Smart Logger
explizit im Produkt-Wrapper. Private Defaults und andere Store-Sperren bleiben
erhalten. Vorhandene Gemini-Offenlegung und manuelles Review bleiben aktiv.
Journal-Suite: 196/196 bestanden (lokaler Dev-Stand).

Achtung: Der lokale Journal-Dev-Stand liegt hinter `origin/dev`; dort liegen
zusätzlich fremde uncommitted Hosting-/Dokumentationsänderungen. Diese nicht
stashen, überschreiben oder als Teil dieses Fixes committen. Source-Push war
non-fast-forward; automatische Freigabeprüfung lehnt anschließende Veröffentlichung
ohne ausdrücklichen Auftrag ab. Deshalb wurde KEIN neuer Parent-Gitlink auf
einen unveröffentlichten Journal-Commit gesetzt. Der Produkt-Wrapper ist erst
nach Veröffentlichung/Integration des Journal-Fixes wirksam.

Backend-Produktweg lokal committed: `f205f31`, `a6e3c6b` in `~/dev/backend`;
noch nicht veröffentlicht/deployt. `firebase.product.json` nutzt dieselbe
Backend-Quelle mit eigenem Produktziel und AI-Metadaten-Preflight.
Kein Produkt-Hosting, keine Functions, keine Produkt-Entitlements verändert.

Validierung des lokalen Fixes: Journal-Firebase-Build erfolgreich; Produkt-
Store-Build erfolgreich, Bundle-Isolation bestätigt ausschließlich die
Produkt-Firebase-Identität. Boundary-Check, Rules-Generierungscheck und neun
gezielte Edition-/Store-/Runtime-Tests bestanden. Der Store-Build verwendet
weiter den veröffentlichten alten Journal-Pin: er beweist die Build-/Firebase-
Trennung, NICHT den bereits integrierten neuen Smart-Logger-Schalter. Kein
Browser-/Gerätetest oder echter Produkt-KI-Aufruf durchgeführt.
Backend-Dokumentation zusätzlich committed als `f6f715c`.

### Abschluss nach ausdrücklicher Push-Freigabe (2026-11-26)

Die vorherige Veröffentlichungssperre ist aufgehoben: Owner hat Source-Push
und anschließende lokale Journal-Integration ausdrücklich erlaubt.
Journal-Fix veröffentlicht als `e7420218076d87312e757c025b9209d5f37db61b`
auf `dev` und automatisch nach `master` übernommen. GitHub-Check
`45821835419`: erfolgreich, 197/197 Tests und Build. Backend-`dev` steht
veröffentlicht auf `f6f715c5f5716fc320de39009928fb7cc5ed1cfd`; keine neue
Backend-CI-Ausführung für diese Revision nachgewiesen.

Der lokale gemeinsame Journal-Gitlink pinnt jetzt den veröffentlichten
`origin/master`-Stand `e742021`. Keine Abhängigkeitsänderung, deshalb kein
Lockfile-Diff. Integrierter Produkt-Store-Build erfolgreich; Bundle-Isolation
bestätigt ausschließlich die Produkt-Firebase-Identität. Gebautes Artefakt
enthält die ausdrückliche Smart-Logger-Freigabe und Kontingentanzeige.
Boundary-Check und neun gezielte Produkt-Tests bestanden.

KEIN Meta-Push, Produkt-Hosting-/Functions-Deploy oder Store-Upload erfolgt.
Öffentliche Datenschutz-/Store-Angaben vor Veröffentlichung abgleichen.
Kein echter Produkt-KI-Aufruf oder Geräte-Abnahmetest. Private Journal-CI
kann durch die Source-Veröffentlichung ihren eigenen Release-Weg starten;
das ist kein Produkt-Deploy. Die fremden uncommitted Änderungen und der
alte lokale Dev-Branch im Journal-Quellcheckout wurden nicht umgeschrieben.
