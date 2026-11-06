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

## Wrapper und Lockfiles im Produkt

Alle `product:*`-Befehle lösen ihre Abhängigkeiten ausschließlich über den
gemeinsamen Importer `prod` im Root-Lockfile. Die Wrapper im Produktordner
tragen bewusst keine eigene Dependency-Landschaft:

- `prod/vos-fitness` liefert nur Quelltext über den Alias `@pulse ->
  prod/vos-fitness/src/pulse`; `package.json` hat keine Abhängigkeiten. Das
  mitgeführte leere `package-lock.json` (185 Byte, ohne Pakete) ist ein
  Standalone-Relikt und pinnt nichts — im nächsten produktseitigen Pflegeschritt
  entfernen.
- `prod/fuel-os` ist die unabhängige Fuel-OS-Kopie und liegt NICHT im
  Produkt-Shell-Buildpfad (die Shell bezieht Fuel über `fuel-app` aus dem
  Parent). Sein `package.json` hat Abhängigkeiten, aber kein Lockfile; ein
  späterer Fuel-OS-Standalone-Build braucht dann eine eigene Pinning-Entscheidung
  (Workspace-Mitgliedschaft oder eigenes Lockfile).
- `prod/vos-observe`, `prod/vos-fuel-mini`: keine Abhängigkeiten, nicht im
  Shell-Buildpfad.
- `prod/functions/package-lock.json`: Firebase-Deploy-Standard, bleibt.

Damit pinnt ein Meta-Commit/-Tag heute den vollständigen Abhängigkeitsstand
beider Shells; nur ein künftiger Fuel-OS-Standalone-Weg erzeugt eigene
Pflichten.

## Produkt-Functions (Smart-Log-Komposition)

Der Produkt-Functions-Deploy nach `vitalos-prod` besteht aus zwei getrennten,
beide fail-closed gepolten Codebases:

- **`vitalos`-Codebase** (`prod/firebase.json`, Source `prod/functions`):
  bewusst eigenständige Push-Reminder-Implementierung mit eigenem
  `package-lock.json` (Firebase-Deploy-Standard). Dass `prod/functions/index.js`
  nur Reminders enthält, ist korrekt, keine Lücke: Smart-Log gehört nicht in
  die Shell-Codebase.
- **`journal`-Codebase** (`prod/firebase.product-journal.json`, Source
  `../journal-app/functions`): deployt direkt aus dem gemeinsamen Submodule —
  keine Kopie, kein zweiter Pin. Damit gelangen `analyzeSmartLog` und
  `getSmartLogQuota` (`smart-log.js`: Quota, Entitlement observe/operate,
  `observeWeeklyLimit ?? 1`, requestId-Dedup, uid-Check) in den Produkt-Deploy;
  im selben Whole-Codebase-Deploy liegen auch die `googleLink*`-Callables und
  die geplanten Journal-/Door-Reminder.

Predeploy-Guards (`prod/scripts/`): `check-product-journal.mjs` fordert
`GCLOUD_PROJECT=vitalos-prod`, Journal-Checkout exakt gleich dem committeten
Gitlink, sauberen getrackten Worktree, den geprüften Vorläufer-Commit
`a1018cf` als Vorfahren und die geforderten Callables im Export;
`check-product-ai-access.mjs` prüft über gcloud-Metadaten, dass direkte
Firebase-AI-Zugriffe gesperrt und API-Key-Einschränkungen gesetzt sind
(`VOS_GEMINI_SERVER_KEY_ID`). Preview-Push-Deploys laufen über
`prod/firebase.push.json` mit denselben drei Quellen (vitalos, fitness,
journal).

Vor einem echten Deploy fehlen Secrets/Parameter in `vitalos-prod`
(`GEMINI_API_KEY`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_CLIENT_ID`).
Kein Deploy wurde durchgeführt. Die Entscheidung, ob der Whole-Codebase-Deploy
alle Journal-Functions ausbringt oder Callables gezielt ausgewählt werden
(`prod/docs/FIREBASE.md`), bleibt Owner-Entscheidung. Der
Smart-Log-Quota/Entitlement-Entwurf des Observe v1-Scopes liegt in
`prod/docs/SCOPE-OBSERVE-V1.md`.

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
erhalten. Der systemd-Dienst `vitalos-thin-results` wurde am 2026-11-06 auf
das Meta-Repo umgestellt (Unit zeigt auf `/home/alpha/vitalos`, Skripte auf
`prod/scripts/`, Meta-Wurzel wird aus der Skriptlage aufgelöst; Digest wie
zuvor `docs/AUTO-DOC.md`, nur Doku-Commits, kein Push). Ein vollständiges
Branch-Backup des Alt-Checkouts liegt gitignored unter
`migration/unified-product/artifacts/vitalos-prod-legacy-20261106.bundle`;
der Checkout selbst bleibt bis zur Klärung seiner lokal-exklusiven Commits
und uncommitteten Änderungen unangetastet. Keine Dienste als Nebenwirkung
von Quell- oder Doku-Arbeiten neu starten.
