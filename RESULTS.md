## 2026-10-17 — 6pack übernimmt den VitalOS-Login

- Ursache: Der eigenständige Shell-Tab importierte noch 6pack-app b3e070b und übergab keine UID. Der bereits veröffentlichte Fitness-Release nutzte dagegen den neuen 6pack-Stand. Deshalb zeigte die Shell trotz Anmeldung die alte Login-Sperre.
- 6pack-app auf 21c804d (vereinigter Photo-Auth/Cloud-Sync, identisch zur Fitness-Integration) aktualisiert. Shell übergibt user.uid; Account-Wechsel remountet 6pack. Die neue Foto-Auth verwendet die vorhandene Firebase-App und deren Sitzung.
- Tailwind scannt die flachen 6pack-Quellen beider Einbindungen gezielt statt deren node_modules rekursiv einzulesen.
- Firebase-Shell-Build erfolgreich; Auth-Regression läuft zusätzlich in Production-/PR-Preview-CI.
- Regressionstest führt den tatsächlichen Shell-Views-Code und den Photo-Auth-Adapter aus: UID für zwei Konten/abgemeldet, Remount-Key, Navigation und bestehende Firebase-Sitzung ohne zweite initializeApp. Cloud-/Import-Regression ebenfalls grün.

# RESULTS.md

Session-Log mit datierten Ergebnis-Bullets (vitalos Meta-Repo). Wird vom globalen PreCompact-Hook
(`~/.claude/hooks/pre-compact-docs.sh`) fortgeschrieben, wenn eine Session hier gearbeitet hat.

## 2026-10-16: Fuel-Mini-Apps im Meta-Repo nachgezogen

- **`.github/workflows/deploy-fuel.yml`:** Deploy nur noch `--only hosting:client` — `fuel-dev` hat jetzt fünf
  Hosting-Targets (`client`=`fuel-vos`, `log`, `supplements`, `mikros`, `protokoll`); ein nacktes
  `--only hosting` würde sie alle deployen und an den fehlenden `dist-solo-*` scheitern.
- **`CLAUDE.md`:** Deploy-Tabelle um die vier Mini-App-Sites `vos-fuel-<x>` ergänzt (gebaut/deployt aus
  `fuel-dev`, nicht aus eigenen Submodulen).
- **Release:** `fuel-release --yes` → `fuel-app` auf `vitalos` gemergt, Pointer-Bump `5f93106`, `master` gepusht.
- **Nicht gebaut:** Mini-App-CI im Meta-Repo (Workflows `deploy-fuel-<x>.yml`) — berührt Workspace/Lockfile.

---

## 2026-10-16: Plan Strong-Workflow und Fitness-Backend veröffentlicht

Plan-Feature und Backend-Verträge nach dev gemergt und gepusht; über
`vos-release --yes plan fitness` in die jeweiligen vitalos-Release-Branches
übernommen, verschachtelte Submodule initialisiert, Firebase-Hosting veröffentlicht
und beide Parent-Gitlinks mit `bd551c8` gepusht. Plan-Release: `31f6595`;
Fitness-Release: `0cc9e6a`. Der Hook-Konflikt im Plan-Release betraf ausschließlich
`.githooks/pre-push` und wurde vom Release-Wrapper mit der dev-Fassung aufgelöst.

Erfolgreiche GitHub-Actions-Läufe für Parent `bd551c8`: Plan `38959199587`,
Fitness `38959199831`, VitalOS Shell `38959199908`. Auch Plan-dev-Preview
`38958876264` sowie Fitness-dev/vitalos `38959101504`/`38959189447` erfolgreich.
Plan unter https://vos-plan.web.app live; ausgeliefertes Hauptbundle auf neue
Coach-Verwaltung, Planbereitstellung, Vorlagenaktualisierung und Yuhonas geprüft.
Der CI-Rebuild hat eigene Asset-Hashes; kein bytegleicher Vergleich zum lokalen
Vor-CI-Build behauptet. Authentifizierter Coach-/Klienten-Cloud-Durchlauf bleibt offen.

Lokales Fitness-Staging ist auf :8100 erfolgreich aktualisiert und healthy.
:6100, :9100 und :9150 waren beim Abschluss nicht aktiv; diese separaten Dienste
wurden nicht gestartet. Der Firebase-Release und die lokalen Dienst-Owner bleiben
getrennt. Paketmanager-bedingte supports-color-Peer-Normalisierung im Plan-Lockfile
wurde gesichert und aus den Arbeitskopien entfernt; keine neue Dependency-Version
oder Lockfile-Änderung wurde in den Release aufgenommen.

Das anschließende Coach-Upgrade liegt separat als geprüfter Entwicklungscommit
`af1f4cd` in coach-dev (gemeinsamer Plan-Editor und Klientenablauf). Es ist nicht
Teil dieses bereits ausgeführten Plan-/Fitness-Releases.


## 2026-10-16: Coach Strong-Workflow veröffentlicht

Coach-Upgrade `af1f4cd` über dev in den vitalos-Release-Branch übernommen;
finaler Coach-Stand `5a0d012`, Parent-Verweis `b419ff9`, alle Branches gepusht.
Firebase Hosting unter https://vos-coach.web.app erfolgreich veröffentlicht.
Vorlageneditor, Trainingsplanbereitstellung, Yuhonas-Auswahl und Workout-Ergebnisse
im ausgelieferten JavaScript sowie gemeinsame Plan-Dialogklassen im Live-CSS
geprüft. Authentifizierte reale Coach-/Klienten-Cloud-Schreibvorgänge bleiben
unverifiziert; der isolierte Browser-Durchlauf verwendete Testdaten.

Der erste Upload scheiterte am Netzwerk und wurde erfolgreich wiederholt.
Zusätzlich Tailwind auf die eingebundenen Plan-Quellen erweitert. Preview-CI
repariert: vollständiger Plan-Commit statt Kurz-ID, pnpm statt npm für die
Standalone-Installation und explizite temporäre Workspace-Konfiguration.
Preview `38965346842` erfolgreich. Produktions-CI Coach `38964936285` und
`38965094966` sowie Shell `38964936288` und `38965094970` erfolgreich.
Der abschließende Parent-Sync übernimmt ausschließlich die weiteren CI- und
Dokumentationskorrekturen; die veröffentlichte Produktfunktion bleibt gleich.
