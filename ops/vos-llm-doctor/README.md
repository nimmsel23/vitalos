# vos-llm-doctor

LLM-Doctor für die VitalOS-Module. Ergänzt `bin/vos-doctor` (deterministische Pre-Flight-Checks).

- **Repair:** offene PRs aus dem eigenen Repo (Branch passt auf `head_regex` in `repos.conf`) mit rotem Check.
  Kette claude (Haiku) → codex → agy; Änderung nur außerhalb von `.github/`, Firebase-/Firestore-Config,
  Deploy-Skripten, Secrets; max. 30 Dateien; max. 2 Doctor-Commits pro PR. Die CI prüft den Fix nach dem Push.
- **Diagnose:** ungelöste rote Läufe auf dem Default-Branch → read-only Analyse in
  `~/.local/state/vos-llm-doctor/diagnoses/` + Desktop-Benachrichtigung. Es wird nichts öffentlich gepostet.
- Merge bleibt immer manuell. Fork-/Fremd-PRs werden ignoriert (die Repos sind öffentlich).

```bash
bin/vos-llm-doctor --dry                       # nur anzeigen
bin/vos-llm-doctor --repo nimmsel23/fitness-dev
VOS_DOCTOR_ALL=1 bin/vos-llm-doctor --repo R   # auch bereits gelöste rote Läufe diagnostizieren (Test)
```

Installation (user-scope, nach dem Merge):

```bash
ln -sfn ~/vitalos/ops/vos-llm-doctor/vos-llm-doctor.{service,timer} ~/.config/systemd/user/
systemctl --user daemon-reload && systemctl --user enable --now vos-llm-doctor.timer
```

Neue Module: Zeile in `repos.conf` (`repo|default-branch|head_regex`).
