# Auftrag: Android-Produktlinie im vereinten VitalOS fortführen

Du bist der ausführende Vibe-Agent (Nachfolge-Session mit frischem Kontext).
Codex koordiniert als CEO und liest deinen Fortschritt etwa alle 20 Minuten.
Direkte User-Vorgabe: keine Tests, zügig umsetzen. Lokale Datei-, Ordner- und
Git-Arbeiten sind freigegeben.

## Koordination (verbindlich)

- Lies zuerst `TODO.md` in diesem Ordner (nicht eigenmächtig löschen/ersetzen).
- Führe `STATUS.md` weiter (gleicher Ordner, Zeitstempel UTC, Repo/Branch,
  aktuelle Aufgabe, letzte Commits, Blockaden, nächster Schritt). Update etwa
  alle 5-10 Minuten; bei Abschluss mit DONE oder BLOCKED + exaktem Restpunkt.
- Keine Behauptung von Build-/Release-Erfolgen, die nicht tatsächlich liefen.

## Ist-Stand (verifizieren, nicht neu anfangen)

- Ein Meta-Repo `/home/alpha/vitalos` auf Branch `master` (Default; früherer
  Umbau-Zweig `dev-product` ist gemergt und entfernt). Parallele Agents bauen
  ggf. Feature-Branches/Worktrees ab: Arbeitsbäume vor jedem Edit prüfen,
  fremde Änderungen niemals aufnehmen oder zurücksetzen.
- `prod/` ist ein normal getrackter Ordner (kein `.git`, keine `.gitmodules`,
  kein zweites Lockfile). Layout-Guard und Release-Manifest laufen grün:
  `node prod/scripts/check-shared-layout.mjs` und
  `node prod/scripts/release-manifest.mjs` (aus `/home/alpha/vitalos`).
- Gemeinsames Lockfile enthält den `prod`-Importer; Workspace ist komplett
  installiert. Bei Registry-Timeouts: `pnpm install --fetch-timeout 600000
  --fetch-retries 5`, nie Policies abschalten, nie Vite direkt umgehen.
- Produkt-Bundle bereits aus dieser Struktur gebaut: `prod/dist-native`
  (Firebase-Isolation PASS). `cap sync android` lief erfolgreich.
  Builds brauchen `. prod/.product-config/product.env` in der Shell.
- Signing verdrahtet: `prod/android/keystore.properties` (gitignored) verweist
  auf den Draft-Release-Keystore in `prod/.product-config/android/`
  (Alias `vitalos`, SHA-256-Fingerprint beginnt `3D:4F:62:E0`). Debug nutzen
  den Standard-Keystore (`~/.android/debug.keystore`). versionName 0.1.0.
- `prod/android/local.properties` zeigt auf `~/Android/Sdk` (android-36,
  build-tools 36). `ANDROID_HOME=/opt/android-sdk` ist LEER — nicht nutzen.
- Kopfproblem: Gradle 8.14.3/AGP 8.13/compileSdk 36 braucht EXAKT JDK 21.
  JDK 17 kennt Source-Level 21 nicht; JDK 27 bricht an der jlink-Transformation
  (core-for-system-modules.jar); JBR 25 ist zu neu (Classfile 69 für Gradle).
- Offene Console-Aktionen (Owner, nicht dir): Identity Platform aktivieren
  (war SERVICE_DISABLED), Release-SHA-1 registrieren, google-services.json
  danach neu ziehen. Siehe `prod/docs/STORE-PUBLISHING-PLAN.md`.

## Aufgaben (in dieser Reihenfolge)

1. STATUS.md weiterführen; Ist-Stand kurz prüfen (`git status`, `prod`
   vorhanden, Branchlagen).
2. Temurin JDK 21 ohne sudo nach `~/jdks` installieren (Adoptium-Tarball,
   Download ggf. mit curl `--retry`, im Hintergrund laufen lassen).
3. `cd /home/alpha/vitalos/prod/android && JAVA_HOME=<jdk21-Verzeichnis>
   ./gradlew assembleDebug` → Debug-APK bauen. Dokumentieren: Pfad,
   Buildkommando, Quellcommit, JDK-Version.
4. `./gradlew bundleRelease` → signierte Release-AAB. Signatur prüfen
   (apksigner/jarsigner verify) und dokumentieren. Ohne Keystore-Sync
   bleibt der Build unsigned — dann STATUS.md klären, nicht raten.
5. Release-Nachweis: `node prod/scripts/release-manifest.mjs` und
   `node prod/scripts/build-product-rules.mjs --check` laufen lassen und
   Ergebnisse dokumentieren.
6. `prod/docs/STORE-PUBLISHING-PLAN.md` (Abschnitt Erreichter Schritt /
   Artefaktnachweis) mit Artefaktpfad, Hash, Toolchain und Quellcommit
   ergänzen; ggf. `docs/PRODUCT-CHECKOUT.md`.
7. Jeden funktionierenden Zwischenstand scoped committen (nur eigene Dateien,
   Doku im selben Commit). Feature-Branches nach Freigabe nach `master`
   mergen (kein Parallel-Umbau-Zweig mehr).

## Verbindliche Grenzen

- KEINE Tests schreiben oder starten. KEIN Push auf Remotes, kein Deploy,
  kein Store-Upload, kein sudo, keine Service-Neustarts oder Kills, kein
  Löschen/Umziehen fremder Checkouts oder des alten Produkt-Checkouts
  (`/home/alpha/vitalos-prod` bleibt unangetastet außer STATUS.md/TODO.md).
- Keine Geheimnisse (product.env, keystore.properties, Service-Account-JSON,
  Passwörter) in Ausgaben, Doku oder Commits.
- Bei 2 gescheiterten Versuchen desselben Ziels: Strategie wechseln und im
  STATUS.md eskalieren statt endlos wiederholen.
