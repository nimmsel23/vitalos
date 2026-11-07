# Auftrag: VitalOS-Produktumbau jetzt lokal umsetzen

Du bist der ausführende Vibe-Agent. Codex koordiniert diese Arbeit als CEO und
liest deinen Fortschritt etwa alle 20 Minuten. Die neueste direkte User-Vorgabe
lautet: keine Tests mehr, zügig umsetzen. Der User hat ausdrücklich freie Fahrt
für lokale Ordner, Dateien und erforderliche Freigaben erteilt.

## Verbindliches Ziel

Ein einziges Meta-Repo `/home/alpha/vitalos`. Die bestehende private PWA bleibt
im Root. Die Store-/Android-Produktvariante wird als NORMAL GETRACKTER Ordner
`/home/alpha/vitalos/prod` übernommen. `prod/` ist weder ignoriert noch ein
separates Git-Repo oder Submodul. Apps bleiben EINMAL im Meta-Repo als
`fitness-app`, `fuel-app`, `journal-app`, `habit-app`, `learn-app`, `relax-app`,
`6pack-app`, `plan-app`, `skills-app`. Das Produkt baut aus genau diesen
gemeinsamen Quellen im Parent. Es bekommt keine zweiten App-Checkouts,
Gitlinks, Branch-Sonderwege oder ein zweites Lockfile. Ein Meta-Commit/Tag
pinnt Root, Produkt und sämtliche App-Gitlinks gemeinsam.

Das bestehende GitHub-Repo `nimmsel23/vitalos-prod` darf als späteres
Release-Ziel erhalten bleiben, z. B. Remote `product`; Hauptremote `origin`
bleibt `nimmsel23/vitalos`. Jetzt NICHT pushen oder veröffentlichen. Kein
Force-Push, kein Überschreiben der bisherigen Produkt-Historie. Ein alleiniger
Export von prod/ wäre unvollständig, da Apps und Lockfile im Parent liegen.

## Bereits vorhandene, konkrete Vorarbeit

- Isolierter vorbereiteter Dev-Checkout: `/tmp/vitalos-product-prep-20261106`.
- Vorbereiteter Commit: `ff5d45936f8595c6f05fffa28852c9c825ae5044` auf `dev`.
- Dessen private Basis: `8b9b45c65312b5dc771e11438b5cadf28cc6e382`.
- Transfer-Bundle: `/home/alpha/vitalos-prod/migration/unified-product/artifacts/prepared.bundle`.
  Zweite Kopie `/tmp/vitalos-product-prep-20261106.bundle`.
- Der Entwurf enthält 578 committed Produktdateien aus Quellcommit `a3c3725`,
  sechs auf gemeinsame App-Besitzer umgestellte Symlinks, Produkt-Vite-/Wrapper-
  Pfade, Tailwind, Functions-Quellpfade, native Quellen, Produktmodus-Guards,
  manuelle CI-Vorlagen und Release-Manifest-Generator. Die Implementierung liegt
  bereits vor; bitte nicht bei null anfangen.
- Lagebericht: `/home/alpha/vitalos-prod/docs/LAGEBERICHT-PROD-IN-VITALOS-2026-11-06.md`.
- Git-Audit: `/home/alpha/vitalos-prod/docs/GIT-AUDIT-2026-11-06.md`.
- Reproduzierbarer Importer und Vorlagen in
  `/home/alpha/vitalos-prod/scripts/prepare-unified-product.py` sowie
  `/home/alpha/vitalos-prod/migration/unified-product/files/`.
- Die Vorbereitungswerkzeuge und der Lagebericht sind im alten Produkt-Repo
  in `3041b12` committet. Das ist nicht der eigentliche Umbau-Commit.

Lies zuerst die gemeinsame TODO.md (Pfad unten), den Lagebericht und die
AGENTS.md der tatsächlich betroffenen Checkouts. Historische Regeln über einen
eigenständigen Produkt-Fork sind durch diese ausdrücklich gewünschte Architektur
überholt. Die App-Quellrepos bleiben die Dev-Repos. Normale Git-Inspektion ist
erlaubt und notwendig; keine Testkommandos oder neuen Tests schreiben/starten.

## Bereits geklärte Git-Fakten – nicht erneut stundenlang diskutieren

1. `/home/alpha/dev/fitness-dev` ist ein Worktree der gemeinsamen Git-Verwaltung
   von `/home/alpha/vitalos/fitness-app`. Der frühere Produkt-Fitness-Checkout
   `/home/alpha/vitalos-prod/fitness-app` ist ein getrennter Clone desselben
   GitHub-Repos `nimmsel23/fitness-dev`. Ordnername und Repo-Name sind verschieden.
2. Fitness-Produktpin `574f6619` ist Vorfahr des gemeinsamen `vitalos`-Stands
   `16436287`. Der Remote-Branch `fitness-dev/product/vitalos-prod` ist auf
   GitHub inzwischen nicht mehr vorhanden; der Commit bleibt auf master/vitalos
   erreichbar. Lokale Branches wurden angelegt, lokales Produkttracking ist
   [gone]. Es muss für die neue Struktur nicht künstlich wiederhergestellt werden.
3. Fuel-Produktpatch `e351845` ist patchgleich zu `84f8cfd` im gemeinsamen
   vitalos-Stand. Journal-Produktpatch `3db5810` ist patchgleich zu `2d5cdf0`.
   `git cherry` zeigte beide mit '-'. Nicht erneut anwenden oder nur wegen
   verschiedener Commit-IDs mergen. Die mitgelieferten Patches sind Nachweise.
4. Die vorhandenen Android-Quellen von Fuel, 6Pack, Relax und Skills liegen
   bereits auf deren gemeinsamen vitalos-Ständen. Zusätzlicher Branch-Merge
   dafür ist nicht erforderlich. Das Fitness-TWA-Draft aus dem Produkt-Meta-Repo
   ist im Entwurf unter prod/platforms/fitness-twa übernommen. Ignorierte lokale
   APK/AAB sind Build-Artefakte und keine erneut einzuführenden Quellkopien.
5. Die bestehenden App-Gitlinks der privaten Basis sind:
   Fitness 16436287, Fuel d4089969, Journal 85759afa, Habits 719c6afe,
   Learn 2c436dd0, Relax 75c5422b, 6Pack 79760537, Plan 002bbff1, Skills f4b38d15.
   Diese Werte sind ein Snapshot; inzwischen kann parallel weitergearbeitet
   worden sein. Aktuellen echten Stand ansehen und keinen Fortschritt zurücksetzen.

## Dein Arbeitsplan – bis zum tatsächlichen lokalen Ergebnis durcharbeiten

1. STATUS.md anlegen und aktuellen Ist-Zustand aufnehmen. Der private Root
   stand bei der letzten Sichtung auf master `240a66a`, und ein lokaler dev-
   Branch existiert inzwischen. Die vorbereitete Basis ist älter. Nicht blind
   ff-merge, reset oder branch -f benutzen. Unterschiede erhalten und die
   Vorbereitung in einen passenden dev-Worktree integrieren. Nur dev für
   Quelledits, nie direkt Quellcode auf master ändern.
2. Den vorhandenen Entwurf ff5d459 übernehmen und auf den aktuellen privaten
   Meta-Stand anpassen. Git-Objekte kannst du lokal aus dem Vorbereitungscheckout
   oder Bundle holen. Hooks bewusst prüfen: geerbte Hooks können deployen oder
   fremde Pointer stagen. Keine Hooks ausführen, die Tests/Deploys oder Änderungen
   außerhalb des Auftrags verursachen. Scoped Commits sind verbindlich.
3. Gemeinsames Root-Lockfile vervollständigen. Der eine bisher gestartete Lauf
   `pnpm install --lockfile-only --ignore-scripts` wurde nach wiederholten
   Registry-Fehlern (23), ETIMEDOUT und Minuten Wartezeit mit Ctrl-C beendet.
   Es fehlt noch der prod-Importer. Im Entwurf ist der Release-/Layout-Guard
   deshalb absichtlich geschlossen. pnpm@11.3.0 beibehalten, keine direkten
   Vite-Bypässe oder heimlichen Policy-Abschaltungen. Keine endlose Retry-Schleife.
   Installation/Lockfile-Synchronisierung ist vom Auftrag gedeckt, Tests nicht.
   Falls die Registry weiter unbrauchbar ist, konkret dokumentieren und andere
   lokale Migrationsschritte trotzdem abschließen.
4. Den getrackten Produktordner im tatsächlichen Ziel `/home/alpha/vitalos/prod`
   verfügbar machen, dabei die privaten Root-Quellen und App-Stände erhalten.
   Einen aktiven Checkout nicht mit nicht gesicherter Arbeit umschalten.
   Private lokale Commits und neue Dev-Branches anderer Agents nicht überschreiben.
   Den Haupt-Checkout nur nach sauberer Abgrenzung auf den gewünschten dev-Stand
   bringen; kein Merge/Push nach Produktions-master als Nebenwirkung.
5. Produktwerte lokal für den neuen Ort verfügbar machen, wenn nötig durch
   geschützte lokale Kopie/Link der bisher ignorierten Konfiguration, NIE ausgeben,
   committen oder in Report/Prompt schreiben. Original nicht löschen. Prüfen, ob
   es noch app-spezifische lokale Produkt-/Android-Quellen gibt, bevor irgendetwas
   als abgelöst gilt. Vorhandene APKs/Keystores ebenfalls erhalten.
6. Alle tatsächlich nötigen Pfadverweise in den relevanten Skripten, Runbooks,
   Worktree-Einträgen und bei echter Verzeichnisumstellung boot-notify-enhanced
   anpassen. Keine Services neu starten/killen, keine lokalen Daten migrieren,
   keine AlphaOS-Projekte einbeziehen. Keine sudo-Befehle.
7. Produkt-Release-Weg mit gemeinsamen Pins, einem Lockfile und optionalem
   product-Tag dokumentieren. root/prod besitzt keine eigene .git/.gitmodules.
   Die bisherigen Produktdateien sind gesichert; den alten Checkout nicht
   ungeprüft entfernen. Eine endgültige Bereinigung darf keine exklusiven
   Änderungen oder Userdaten vernichten.
8. Jeden funktionierenden Zwischenstand scoped committen, passende Doku im
   selben Commit. Keine pauschalen git add -A in den aktiven verschmutzten
   Checkouts. Dem CEO einen klaren Abschlussbericht liefern: Zielpfad, Branch,
   Commits, wirklich übernommene Dateien, verbleibende technische Blockaden.

## Vorhandene fremde Änderungen unbedingt erhalten

Im alten `/home/alpha/vitalos-prod` sind seit vor diesem Auftrag diverse
staged/unstaged IDE-Dateien, Löschungen, gegenläufige Lockfile- und Doku-
Änderungen sowie abweichende Fuel/Journal/6Pack-Checkouts vorhanden. Nicht
zurücksetzen, in fremde Commits aufnehmen oder als fehlende Arbeit deuten.
Auch `/home/alpha/dev/fitness-dev` war zuletzt wieder einen Commit vor origin/dev.
Es gibt weitere Worktrees und parallele Agents. Status live prüfen.

## Koordination

Gemeinsamer dauerhafter Ordner:
`/home/alpha/vitalos-prod/migration/unified-product/coordination/`

- `TODO.md`: CEO-Anweisungen, zu Beginn und nach jedem wesentlichen Schritt lesen.
  Inhalt nicht eigenmächtig löschen oder ersetzen. CEO ergänzt dort bei Bedarf.
- `STATUS.md`: dein Fortschritt, von dir pflegen; Zeitstempel, Arbeitsrepo/Branch,
  aktuelle Aufgabe, letzte Commits, Blockaden, nächster Schritt. Etwa alle fünf
  bis zehn Minuten oder bei jedem wesentlichen Wechsel aktualisieren.
- Bei Abschluss STATUS.md deutlich mit `DONE` oder `BLOCKED` kennzeichnen und
  den genauen Restpunkt nennen. Kein erfolgreiches Build/Test/Release behaupten,
  das nicht tatsächlich stattgefunden hat.

Du sollst UMSETZEN, nicht nur beraten oder weitere Architekturvarianten erfinden.
Keine Tests, keine Test-Wartezeiten. Lokale Backup-/Datei-/Ordner- und Git-Arbeiten
sind ausdrücklich erlaubt. Für Push/Deploy/Store und Dienst-Neustarts besteht
keine Freigabe. Arbeite jetzt los.
