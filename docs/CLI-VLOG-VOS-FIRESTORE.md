# `bin/vlog` und `bin/vos-firestore`

Aus `CLAUDE.md` ausgelagert.

## `bin/vlog` — Fitness + Relax + Fuel loggen ohne Server (seit 2026-10-16)

Ein typer-Skript (`~/vitalos/bin` ist im PATH), das Tages-Logs schreibt, ohne dass
`fitness-api` (:9150), Fuel-Node (:9000) oder Relax-API (:9123) laufen müssen.

```bash
vlog fitness "Kreuzheben 60" "Back Squat 3x5@60" --block Legs --art Kraft --ort "Fitness First, 1030 Wien" --zeit 13-14
vlog relax Sauna 20 --note "nach Workout"
vlog fuel "360g Käseleberkäse, 3 Semmeln" --zeit 14:30
vlog day "<Freitext>"      # Gemini zerlegt → Vorschau als vlog-Kommandos → Rückfrage → schreibt
```

- **fitness:** re-exec't in die uv-venv `~/.local/share/uv/tools/fitness-agent` und ruft dieselben
  Funktionen wie `POST /session` (`_freeze_snapshot`, `_write_json`, `_sync_session_to_db`,
  `mirror_session`, `_queue_unreviewed_enrichment`) im eigenen Prozess auf. Identische
  Übung+Sätze werden übersprungen (`--nochmal` hängt an). Firestore-Mirror braucht Netz, keinen
  Server (`--offline` überspringt ihn). `import http.client` + `firebase_admin` MÜSSEN vor
  `fitness.*` importiert werden, sonst überschattet `fitness/http.py` das stdlib-`http`.
- **relax / fuel:** dünne Wrapper um `relax-add` bzw. `fuel-meal log`. `relax-add` setzt Stimmung
  3→4 als Default, wenn `--vorher/--nachher` fehlen.
- **day:** schreibt nie bei offenen Rückfragen (Exit 2); Gemini darf nichts erfinden, Unklares
  (z.B. „360dag") kommt als Rückfrage. Key aus `~/.env/gemini.env`.
- Test ohne echte Daten: `HOME=<scratch> VLOG_FITNESS_ENV=1 <fitness-venv-python> -I vlog fitness … --uid x --offline --no-enrich`
  (Pfade folgen `$HOME`; SQLite-History liegt dann ebenfalls im Scratch).

---

## `bin/vos-firestore` — lokale VOS-Daten ↔ Firestore ohne Server (seit 2026-10-16)

```bash
vos-firestore status
vos-firestore push fuel|fitness|relax|alle [--uid U] [--dry-run]
vos-firestore pull fuel|fitness|relax|alle [--uid U] [--dry-run]
```

- Läuft in der fitness-agent-uv-venv, nutzt `fitness.firestore.*` aus fitness-dev (kein Fork).
- **pull** (Fitness/Fuel) spielt die Handler des `fitness-firestore-daemon` einmalig als
  ADDED-Replay ab (`mirror.on_session/on_journal/on_habits/on_habit_records/on_habit_journals/
  on_nutrition/on_supplements/on_supplements_catalog`) — gleiche rev-Konfliktprüfung,
  `owner_uid`-Schutz und SQLite-Gateway wie der Daemon beim Start. Der Daemon selbst
  (Echtzeit) startet/stoppt mit `fitness-log console` (`console/daemon.py`).
  Nicht enthalten: Katalog-Listener (`inbox`, `kb/exercises` — gehören zum :9150-Prozess).
- **push** nutzt `fitness.firestore.sync.push` / `fuel.push_fuel` / eigenen Relax-Push.
- **UID-Schutz:** nur Operator + `~/vital/Klienten/*/client.json`-UIDs; andere Ordner
  (z.B. `~/.aos/fitness/users/matthias`) und Test-UIDs in Firestore werden gemeldet, übersprungen.
- **Relax:** schreibt im PWA-Format nach `relax/{operator-uid}/sessions/{date}` im Projekt
  `fitness-aos`. Das alte `relax-firestore.py` schrieb nach `relax/default/...` mit einem
  Service-Account des Projekts `relax-aos` und erreichte die PWA nie.
- Bekannt: `sync.push` schreibt bei fehlendem Firestore-Vorsprung immer alles neu (kein
  Skip bei Gleichstand); `remote_wins` bricht bei Simon mit `str > dict` ab (`saved_at` als
  Dict) — pro UID abgefangen. Für einen Stunden-Timer beides vorher beheben.

**Update 2026-10-16 (Daemon-Ablösung):** Fitness-**Sessions** gehen jetzt über das neue Backend
(`python -m backend sync pull|push sessions`, fitness-dev) — `vos-firestore push fitness` ruft
`sync push sessions --uid U` (ohne `--dry-run` mit `--apply`), `pull fitness` ruft
`sync pull sessions --uid …` (Lock + `decide()`). Journal, Habits, Habit-Records und Habit-Journals
zieht `pull fitness` weiter über die Handler des alten Daemons (das neue Backend kennt nur Sessions);
Fuel-Pull nutzt die Daemon-Handler für den Operator und `pull_fuel` für Klienten. Live-Sync während
der Console: `fitness-sync.service` (siehe `fitness-dev/fitness/log/console/CLAUDE.md`).

**Klienten-Namen statt UIDs (2026-10-16):** `vos-firestore pull|push fuel|fitness [KLIENT…]` — Name,
Slug oder Vorname aus `~/vital/Klienten/*/client.json` (z.B. `vos-firestore pull fitness jakob matthias`);
`ich`/`operator`/`coach` = Operator. Trefferreihenfolge exakt → Präfix → Teilstring; mehrdeutig oder
unbekannt bricht mit Liste der bekannten Klienten ab. Relax akzeptiert nur den Operator. `--uid` bleibt
als exakte Alternative.

**Journal & Habits als eigene Pull-Bereiche (2026-10-16):** `vos-firestore pull journal|habits [KLIENT…] [--dry-run]`;
`pull fitness` = Sessions + Journal + Habits. Handler des alten Mirrors schreiben (Format-SOT), aber die
„bereits gesehen"-Listen werden geleert (später in Firestore geänderte Einträge kommen an), eine leere/kaputte
`habits/definitions.json` wird als `.bak-<zeit>` beiseitegelegt (lag als 0-Byte-Datei vor), der Dry-Run läuft auf
einer Kopie und listet exakt neue (+) und geänderte (~) Dateien. Es wird nie lokal gelöscht. **Kein Push:**
Firestore ist die Quelle; ein Push lokaler Reste (z.B. die beiden gelöschten Test-Einträge vom 2026-05-20) würde
in Firestore gelöschte Einträge wiederbeleben.
