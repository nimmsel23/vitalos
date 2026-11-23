#!/usr/bin/env bash
# Reine Shell-Pin-Bumps: welche Pfade und welche Autoren automergefähig sind.
# Kein Netzwerk. org-bot-classify.sh und auto-shell-pins.sh sourcen diese Datei.
set -euo pipefail

# Gitlinks der neun Mini-Apps plus das gemeinsame Lockfile. Fuel ist dabei.
# Jeder andere Pfad (Workflow, .gitmodules, Quellcode) fällt aus der Klasse.
PIN_PATH_RE='^(fitness-app|fuel-app|journal-app|habit-app|learn-app|relax-app|6pack-app|plan-app|skills-app|pnpm-lock\.yaml)$'

pin_files_ok() {
  local files="$1"
  local any=0
  local f
  [ -n "$files" ] || return 1
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    any=1
    [[ "$f" =~ $PIN_PATH_RE ]] || return 1
  done <<< "$files"
  [ "$any" = 1 ]
}

# Autor ist die GitHub App vitalos-org-bot. gh liefert je nach API
# "app/vitalos-org-bot" oder "vitalos-org-bot[bot]". Alternativ reicht der
# Head-Branch codex/shell-pins-<datum>, wenn ein Mensch den PR selbst öffnet.
pin_actor_ok() {
  local login="$1"
  local branch="$2"
  [[ "$login" == *vitalos-org-bot* ]] && return 0
  [[ "$branch" == codex/shell-pins-* ]]
}

if [[ "${BASH_SOURCE[0]}" == "$0" && "${1:-}" == "--self-test" ]]; then
  fail=0
  expect() {
    local want="$1" desc="$2"
    shift 2
    if "$@"; then got=0; else got=1; fi
    if [ "$got" -eq "$want" ]; then
      echo "ok  $desc"
    else
      echo "FAIL $desc (exit $got, want $want)"
      fail=1
    fi
  }
  expect 0 "fuel + lockfile" pin_files_ok $'fuel-app\npnpm-lock.yaml'
  expect 0 "nur fuel" pin_files_ok "fuel-app"
  expect 1 "workflow daneben" pin_files_ok $'fuel-app\n.github/workflows/org-bot.yml'
  expect 1 "gitmodules" pin_files_ok $'fuel-app\n.gitmodules'
  expect 1 "leer" pin_files_ok ""
  expect 0 "bot, anderer codex-branch" pin_actor_ok 'vitalos-org-bot[bot]' 'codex/shell-fuel-pin-2026-11-23'
  expect 0 "gh-login der app" pin_actor_ok 'app/vitalos-org-bot' 'codex/shell-fuel-pin-2026-11-23'
  expect 0 "mensch, shell-pins-branch" pin_actor_ok 'nimmsel23' 'codex/shell-pins-2026-11-23'
  expect 1 "mensch, fuel-pin-branch" pin_actor_ok 'nimmsel23' 'codex/shell-fuel-pin-2026-11-23'
  expect 1 "fremd" pin_actor_ok 'someone' 'cursor/evil'
  exit "$fail"
fi
