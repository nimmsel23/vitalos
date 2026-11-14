# Gemeinsame Quellen für private PWA und Store-Produkt

## Besitz und Arbeitsorte

| Ort | Inhalt / Rolle |
| --- | --- |
| `~/vitalos/src` | private Shell |
| `~/vitalos/prod` | getrackte Produkt-Shell, native Projekte, Produkt-Runbooks |
| `~/vitalos/*-app` | einmalige, gepinnte App-Integration für beide Shells |
| `~/dev/*-dev` | eigentliche App-Entwicklung; teilweise Worktrees der App-Repos |
| Root `pnpm-workspace.yaml`, `pnpm-lock.yaml` | gemeinsamer Workspace und Abhängigkeitsstand |
| `~/vitalos-prod` | lokaler Symlink auf `~/vitalos/prod` (kein eigener Checkout) |
| `~/vitalos-prod-legacy-2026-11-07` | archivierter Alt-Checkout; keine Quelle der Produkt-Builds |

Der Haupt-Checkout arbeitet auf `master`. Der frühere Umbau-Zweig `dev-product`
ist nach `master` gemergt (`2fe70f3`) und entfernt (siehe `AGENTS.md`).
`prod/` wird weder ignoriert noch als eigenes Repository geführt. Eine Änderung
am gemeinsamen App-Pin gilt für beide Varianten; Unterschiede im Verhalten
werden ausdrücklich in Shell, Adaptern oder Produkt-Buildmodus umgesetzt.

## Owner-Klarstellung 2026-11-11: Quelle vs. Store-Gewand

Owner-Aussagen aus der Session 2026-11-11 (Architektur-Metapher und
Betriebsgrenzen). Operative Details zu Firebase bleiben in
[FIREBASE.md](../prod/docs/FIREBASE.md).

### Analogie zur Fitness-Linie

| Schicht | Fitness | VitalOS-Shell |
| --- | --- | --- |
| Quellcode | `fitness-dev` | private Shell `src/` + Subapps (`~/dev/*-dev` → Root-Pins `*-app`) |
| Auslieferung im schönen Gewand | `vos-fitness` („vos-app“ / „vitalos-app“) | `prod/` — Play-/App-Store-Vertreter derselben Shell |
| Zweck | dem Klienten zur Unterstützung mitgegeben | dieselbe Kombi auch als Verkaufsprodukt |

`src/` ist der Shell-Quellcode der herkömmlichen/privaten VitalOS-Shell.
`prod/` ist nicht ein zweites App-Ökosystem mit eigenen Submodule-Pins, sondern
der Store- und Klienten-Vertreter derselben Quellkombi.

### Zwei Nutzergruppen, ein Quellcode

Es gibt **Store-User** und **private Klienten**. Beide bekommen im Wesentlichen
denselben Quellcode, aber in **unterschiedlichen** Firebase-/Firestore-Hostings,
Projekten und Accounts:

| Gruppe | Rolle | typisches Ziel |
| --- | --- | --- |
| private Klienten | Coaching-Unterstützung (VOS-App mitgeben) | private Linie, Firebase-Projekt `fitness-aos` |
| Store-User | Verkauf über Play/App Store | Produktlinie `prod/`, Firebase-Projekt `vitalos-prod`, Paket `com.vitalos.app` |

Doppelzweck: die App bzw. Subapp-Kombi ist gut genug für Coaching **und** wird
verkauft.

### Google-Accounts (Owner)

| Bereich | Konto |
| --- | --- |
| privat und Org | `nimmsel23@gmail` |
| alles nach außen (Store, öffentliche Produktlinie) | `nimmdaniel@gmail` |

### Release-Folge (Session)

Die Release-Schiene für private/classic Shell + Subapps wird etwas
**aufgelockert**. Gegenstück: CI und Deployment für `vitalos/prod` müssen
**deppensicher** und fail-closed vom privaten Pfad getrennt bleiben (kein
versehentliches Mischen von Projekten, Hostings oder Accounts). Owner parallel:
Console-Arbeit laut Gate (Play Closed-Test / zugehörige Firebase-Schritte) —
Owner-Hand, kein stiller Auto-Deploy nach `vitalos-prod` allein aus dieser
Klarstellung.

### TWA-APK in privaten Settings (Owner-Notiz)

Owner 2026-11-11: TWA-APK-Releases können in den **Settings-Tabs der
`fitness-aos`-Apps** (private Linie) als **Git-/Release-Link** angeboten
werden — analog zu bestehenden GitHub-Release-APKs (z. B. Skills
`android-latest`). Zweck: Klienten die VOS-/TWA-App zum Sideload aus der
laufenden privaten App heraus erreichen, ohne Play-Store-Zwang. Noch keine
Umsetzung in diesem Doc-Schritt; Verteilweg-Vorbild bleibt
[M2-TESTUSER-APK-VERTEILWEG.md](../prod/docs/M2-TESTUSER-APK-VERTEILWEG.md).

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
GitHub Pages am Meta-Repo (`master`/`docs` → `https://nimmsel23.github.io/vitalos/`)
ist **kein** Produkt- oder privates Firebase-Hosting; Erfassung und
Owner-Empfehlung stehen unter
[FIREBASE.md § GitHub Pages](../prod/docs/FIREBASE.md#github-pages-meta-repo-kein-firebase-hosting).

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
beide fail-closed gepolten Codebases. Owner-Entscheid 2026-11-07: Die
paarigen Journal-Functions (`analyzeSmartLog`, `getSmartLogQuota`,
`googleLink*`) sind aus dem Produkt-Deploy-Workflow GENOMMEN und bis
Operate (Phase 06) zurueckgestellt — vitalos-prod hatte nie einen
Functions-Deploy und bleibt bewusst dabei:

- **`vitalos`-Codebase** (`prod/firebase.json`, Source `prod/functions`):
  bewusst eigenständige Push-Reminder-Implementierung mit eigenem
  `package-lock.json` (Firebase-Deploy-Standard). Dass `prod/functions/index.js`
  nur Reminders enthält, ist korrekt, keine Lücke: Smart-Log gehört nicht in
  die Shell-Codebase. Von der Zurueckstellung UNBERUEHRT.
- **`journal`-Codebase** (`prod/firebase.product-journal.json`): seit PR #28
  (`e6e3170`) enthaelt das journal-app-Submodule KEINE Functions-Quellen mehr
  (`functions/` nur noch `MIGRATED.md`, Lockfiles, .env-Referenz); Quellen-SOT
  fuer die Journal-Callables ist `~/dev/backend/functions/journal`. Die
  Journal-Functions laufen NUR im privaten Projekt (laufende Deploys der
  privaten Linie aus dem Backend-SOT, inkl. Tagesbudget `213d5c9`). Die
  Konfiguration bleibt als Operate-Vorausarbeitung im Repo (Vermerk:
  „Functions-Deploy zurueckgestellt bis Operate“), ebenso die Predeploy-Guards;
  bei Nicht-Deploy werden sie nicht ausgefuehrt — ein journal-app-Gitlink-Bump
  bricht dadurch nichts. Die Kompositionsfrage fuer die spaetere
  Operate-Aufnahme (vos-backend-Submodule o. ae.) ist als Blocker aufgeloest
  und als spaetere Entscheidung in die Phase-06-Liste gewandert.

Predeploy-Guards (`prod/scripts/`, mit gleichem Vermerk versehen):
`check-product-journal.mjs` fordert `GCLOUD_PROJECT=vitalos-prod`,
Journal-Checkout exakt gleich dem committeten Gitlink, sauberen getrackten
Worktree, den geprueften Vorlaeufer-Commit `a1018cf` als Vorfahren und die
geforderten Callables im Export — lauffaehig erst wieder nach Rueckfuehrung
der Functions in den journal-App-Pin (Operate); `check-product-ai-access.mjs`
prueft ueber gcloud-Metadaten, dass direkte Firebase-AI-Zugriffe gesperrt und
API-Key-Einschraenkungen gesetzt sind (`VOS_GEMINI_SERVER_KEY_ID`).
Preview-Push-Deploys laufen ueber `prod/firebase.push.json`.

Vor einem spaeteren echten Deploy fehlen Secrets/Parameter in `vitalos-prod`
(`GEMINI_API_KEY`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_CLIENT_ID`).
Kein Deploy wurde durchgefuehrt; die Deploy-Freigabe bleibt Owner-Gate
(`prod/docs/FIREBASE.md` beschreibt den Zielweg). Der
Smart-Log-Quota/Entitlement-Entwurf des Observe v1-Scopes liegt in
`prod/docs/SCOPE-OBSERVE-V1.md`; das dort beschlossene Tagesbudget
(1 KI-Analyse/Tag, `observeDailyLimit`) ist in der Backend-Quelle
(`~/dev/backend`, Commit `213d5c9`) umgesetzt und im privaten Projekt
live. Das Produkt (vitalos-prod) hat entsprechend der Zurueckstellung
keine KI-Analysen — die Journal-v2-UI verhaelt sich dort fail-closed
(Disclosure bleibt, Analyse-Aktion scheitert kontrolliert); dieses
Verhalten ist Emulator-Abnahme-Punkt statt eines funktionalen Tests.

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

Der Alt-Checkout (`~/vitalos-prod-legacy-2026-11-07`) und dortige Artefakte
bleiben bis zur vollständigen Ablösung erhalten. Der systemd-Dienst `vitalos-thin-results` wurde am 2026-11-06 auf
das Meta-Repo umgestellt (Unit zeigt auf `/home/alpha/vitalos`, Skripte auf
`prod/scripts/`, Meta-Wurzel wird aus der Skriptlage aufgelöst; Digest wie
zuvor `docs/AUTO-DOC.md`, nur Doku-Commits, kein Push). Ein vollständiges
Branch-Backup des Alt-Checkouts liegt gitignored unter
`migration/unified-product/artifacts/vitalos-prod-legacy-20261106.bundle`;
der Checkout selbst bleibt bis zur Klärung seiner lokal-exklusiven Commits
und uncommitteten Änderungen unangetastet. Keine Dienste als Nebenwirkung
von Quell- oder Doku-Arbeiten neu starten.

## Core Skills und gemeinsames App-Setup (2026-11-14)

Produkt- und private Shell zeigen Skills und die vollständige eingebettete
6Pack-Oberfläche gemeinsam als **Core Skills**. Die frühere 6Pack-Hauptroute
bleibt als Altlink erreichbar; die Produkt-Shell kanonisiert sie nach
`#skills/sixpack/...`. Die importierte UI läuft im Skills-CSS-Wrapper.
Workout-Callbacks, Programmspeicher und die Firebase-Instanz bleiben beim Host.
Store-Beschränkungen der App bleiben erhalten.

Das gemeinsame Setup enthält die vorhandenen Fitness-/Profil-/Trainings- und
Darstellungseinstellungen sowie vollständiges Fuel-Setup, Journal-Darstellung
und Erinnerungen, Habit-Erinnerungen, Relax-Setup und Core Skills/6Pack-Setup.
Die Sektionen mounten erst beim Öffnen. Konto-/Sync-/Import-/Lösch-/Rechtsinfos
von Skills erscheinen nur im Setup, nicht unter der Trainingsoberfläche.
Die jeweiligen Komponenten und Speicherverträge stammen weiterhin aus den Apps.
Plan und Learn verwenden die gemeinsamen Fitness-/Darstellungseinstellungen.

Skills, 6Pack, Plan und Learn erhalten Standalone-Setup-URLs; Journal und sein
Habits-Flavor teilen `#settings`. App-Quelländerungen liegen in den Dev-Repos.
Die Meta-Gitlinks werden dafür nicht auf unveröffentlichte lokale Commits gesetzt.
Builds gegen aktuelle Arbeitscheckouts ersetzen weder den Release der Quellen
noch einen gepinnten CI-Build, Login-/Gerätetest oder Hosting-/Store-Deploy.
