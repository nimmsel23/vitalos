# Bekannte Baustellen (Stand 2026-08-16)

Aus `CLAUDE.md` ausgelagert; teils veraltet, vor Verwendung prüfen.

### Bekannte Baustellen (Stand 2026-08-16)

- fuel-app/learn-dev: `.firebase/hosting.*.cache` ändert sich bei jedem
  lokalen Deploy → Dauer-Dirty der Submodules im Meta-Repo (` m`-Marker).
- `.bak`-Workflows (`workflows.disabled/`) in allen 5 Sub-Repos sind
  deaktivierte Historie (per-Repo-CI konnte wegen Cross-Repo-Aliases nie
  bauen, deshalb zentralisiert 2026-07-03). GitHub ignoriert sie, aber
  Aufräumen steht noch aus.
- relax-app hat weder `core.hooksPath` noch ein `.githooks/`-Verzeichnis
  (siehe Git-Hooks-Tabelle oben) — einziges Sub-Repo ohne Hook-Absicherung.
- Hub.jsx zeigt für Journal/Habits/Learn bewusst keine Live-Stats, weil
  `@habits-db` hart `@fitness-db/index.firestore.js` importiert (auch im
  Coach/Local-Build) — 3 von 6 Tempeln ohne sauberen eigenen Datenpfad zum
  Hub (siehe `src/shell/CLAUDE.md`).
- Behoben seit 2026-07-16 (aus dieser Liste entfernt): learn-dev hatte
  `dist-firebase/`/`node_modules/` eingecheckt (jetzt 0 getrackte Dateien).
- Meta-Repo-Branch-Leichen `merge` (0 commits ahead, voll gemerged),
  `mobile/mobile-optimizations-safe-area` (uralter Snapshot vor der
  Fitness-Pfadtrennung) und `rename/local-app-dirs` (identisch zu master) —
  Löschung ausstehend, User-Bestätigung angefragt (2026-08-16).
