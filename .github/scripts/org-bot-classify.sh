#!/usr/bin/env bash
# Klasse bestimmen und mergen. Läuft nur mit dem Org-Bot-Token, und nur
# gegen Code aus dem Default-Branch (pull_request_target checkt den PR nicht aus).
#
# Pin-Bump (Klasse A, kein peer-ok), wenn alle drei gelten:
#   1. Jede geänderte Datei ist ein Mini-App-Gitlink oder pnpm-lock.yaml.
#   2. Base und Head jedes Gitlinks sind weiter Submodules unter nimmsel23/.
#   3. Autor ist vitalos-org-bot, oder der Branch heißt codex/shell-pins-*.
# Danach Squash, sobald jeder fremde Check grün ist. owner-gate bleibt davor.
# PIN_ONLY=1 (Sweep, check_suite, check_run) mergt nichts anderes.
set -euo pipefail

: "${REPO:?}" "${PR:?}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=pin-bump-policy.sh
source "$HERE/pin-bump-policy.sh"
# shellcheck source=shell-pin-issue.sh
source "$HERE/shell-pin-issue.sh"

MODE="${MODE:-docs}"
EVENT="${EVENT:-pull_request_target}"
DRY_RUN="${DRY_RUN:-}"
PIN_ONLY="${PIN_ONLY:-}"

ensure_label() {
  gh label create "$1" -R "$REPO" --color "$2" --description "$3" 2>/dev/null || true
}

meta_json="$(gh pr view "$PR" -R "$REPO" --json author,headRefName,baseRefOid,headRefOid,isDraft,state,title)"
state="$(printf '%s' "$meta_json" | jq -r .state)"
[ "$state" = "OPEN" ] || { echo "PR #${PR} ist ${state}."; exit 0; }
draft="$(printf '%s' "$meta_json" | jq -r .isDraft)"
[ "$draft" = "true" ] && { echo "PR #${PR} ist Draft."; exit 0; }

login="$(printf '%s' "$meta_json" | jq -r .author.login)"
branch="$(printf '%s' "$meta_json" | jq -r .headRefName)"
base_sha="$(printf '%s' "$meta_json" | jq -r .baseRefOid)"
head_sha="$(printf '%s' "$meta_json" | jq -r .headRefOid)"
title="$(printf '%s' "$meta_json" | jq -r .title)"
files="$(gh api --paginate "repos/${REPO}/pulls/${PR}/files" -q '.[].filename')"
labels="$(gh pr view "$PR" -R "$REPO" --json labels -q '.labels[].name')"

gitlink_ok() {
  local path="$1" sha="$2" typ url
  typ="$(gh api "repos/${REPO}/contents/${path}?ref=${sha}" -q .type 2>/dev/null || echo missing)"
  [ "$typ" = "submodule" ] || return 1
  url="$(gh api "repos/${REPO}/contents/${path}?ref=${sha}" -q .submodule_git_url)"
  [[ "$url" == *nimmsel23/* ]]
}

pin_gitlinks_ok() {
  local f
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    [ "$f" = "pnpm-lock.yaml" ] && continue
    gitlink_ok "$f" "$base_sha" || return 1
    gitlink_ok "$f" "$head_sha" || return 1
  done <<< "$files"
}

# Neueste Conclusion je Check-Name. classify-merge und open-pr sind der Bot
# selbst und dürfen ihn nicht blockieren (sonst sieht er sich ewig als laufend).
checks_state() {
  local sha="$1"
  local pending=0 failed=0
  local names=""
  local row name status conclusion
  while IFS=$'\t' read -r name status conclusion; do
    [ -n "$name" ] || continue
    case " $names " in
      *" $name "*) continue ;;
    esac
    names="$names $name"
    case "$name" in
      classify-merge | open-pr) continue ;;
    esac
    if [ "$status" != "completed" ]; then
      pending=1
      continue
    fi
    case "$conclusion" in
      success | skipped | neutral) ;;
      *)
        failed=1
        printf 'rot: %s (%s)\n' "$name" "$conclusion" >&2
        ;;
    esac
  done < <(gh api "repos/${REPO}/commits/${sha}/check-runs?per_page=100" \
    -q '.check_runs[] | [.name, .status, (.conclusion // "")] | @tsv')

  local commit_state count
  commit_state="$(gh api "repos/${REPO}/commits/${sha}/status" -q .state)"
  count="$(gh api "repos/${REPO}/commits/${sha}/status" -q .total_count)"
  if [ "$count" != "0" ]; then
    case "$commit_state" in
      failure | error) failed=1 ;;
      pending) pending=1 ;;
    esac
  fi

  if [ "$failed" = 1 ]; then
    echo failure
  elif [ "$pending" = 1 ]; then
    echo pending
  else
    echo green
  fi
}

merge_pin() {
  if [ "$DRY_RUN" = 1 ]; then
    echo "DRY-RUN: würde PR #${PR} squash-mergen (${title})."
    return 0
  fi
  ensure_label "merge:A" C2E0C6 "Vom Org-Bot gemergt (Klasse A)"
  gh pr edit "$PR" -R "$REPO" --add-label "merge:A" --remove-label "needs-peer" >/dev/null 2>&1 \
    || gh pr edit "$PR" -R "$REPO" --add-label "merge:A" >/dev/null
  if gh pr merge "$PR" -R "$REPO" --squash --auto --delete-branch; then
    echo "PR #${PR} per Auto-Merge (Squash) eingereiht."
    return 0
  fi
  if gh pr merge "$PR" -R "$REPO" --squash --delete-branch; then
    echo "PR #${PR} squash-gemergt."
    return 0
  fi
  local now
  now="$(gh pr view "$PR" -R "$REPO" --json state -q .state)"
  [ "$now" = "MERGED" ] && return 0
  return 1
}

if pin_files_ok "$files" && pin_actor_ok "$login" "$branch" && pin_gitlinks_ok; then
  if printf '%s\n' "$labels" | grep -qx 'owner-gate'; then
    echo "PR #${PR}: owner-gate, kein Pin-Merge."
    exit 0
  fi
  echo "PR #${PR}: Pin-Bump Klasse A (${login}, ${branch}). Kein peer-ok."
  check_state="$(checks_state "$head_sha" 2>/tmp/pin-checks.txt || true)"
  if [ "$EVENT" = "pull_request_target" ] && [ "$check_state" = "green" ]; then
    sleep "${PIN_CHECK_SETTLE_SECONDS:-25}"
    check_state="$(checks_state "$head_sha" 2>/tmp/pin-checks.txt || true)"
  fi
  case "$check_state" in
    green)
      merge_pin || pin_issue_upsert "$(printf 'PR #%s konnte nicht gemergt werden (%s).\n%s' "$PR" "$title" "https://github.com/${REPO}/pull/${PR}")"
      ;;
    pending)
      echo "PR #${PR}: Checks noch nicht fertig."
      ;;
    *)
      pin_issue_upsert "$(printf 'PR #%s (%s) hat rote Checks.\n%s\n%s\n' "$PR" "$title" "https://github.com/${REPO}/pull/${PR}" "$(cat /tmp/pin-checks.txt 2>/dev/null || true)")"
      echo "PR #${PR}: Checks rot, kein Merge."
      ;;
  esac
  exit 0
fi

if [ "$PIN_ONLY" = 1 ]; then
  echo "PR #${PR}: kein abgesicherter Pin-Bump."
  exit 0
fi

class=A
[ "$MODE" = "code" ] && class=B
reason=""
while IFS= read -r f; do
  [ -n "$f" ] || continue
  case "$f" in
    .github/workflows/*|firebase.json|.firebaserc|*/firebase.json|*/.firebaserc|\
    *.env|*.env.*|*secret*|*Secret*|*credential*|*.pem|*.key|*keystore*|*.jks|\
    AGENTS.md|org/OWNER-CONTRACT.md|dashboard/publish.sh|*datenschutz*|*privacy*)
      class=B
      reason="$reason $f"
      ;;
  esac
done <<< "$files"
printf '%s\n' "$labels" | grep -qx 'owner-gate' && class=C

if [ "$class" = "C" ]; then
  echo "Label owner-gate: wartet auf CEO-Bündel, kein Merge."
  exit 0
fi

if [ "$class" = "B" ] && ! printf '%s\n' "$labels" | grep -qx 'peer-ok'; then
  ensure_label peer-ok 0E8A16 "Klasse B: von einem anderen Agenten als dem Autor geprüft"
  if [ -n "$reason" ] && ! printf '%s\n' "$labels" | grep -qx 'needs-peer'; then
    ensure_label needs-peer FBCA04 "Klasse B: braucht Prüfung durch einen anderen Agenten"
    if [ "$DRY_RUN" != 1 ]; then
      gh pr edit "$PR" -R "$REPO" --add-label needs-peer
    fi
  fi
  echo "Klasse B: wartet auf Label peer-ok.${reason}"
  exit 0
fi

if [ "$DRY_RUN" = 1 ]; then
  echo "DRY-RUN: würde Klasse ${class} squash-mergen."
  exit 0
fi

ensure_label "merge:$class" C2E0C6 "Vom Org-Bot gemergt (Klasse $class)"
gh pr edit "$PR" -R "$REPO" --add-label "merge:$class" || true
# Auto-Merge wartet auf Pflicht-Checks, wo Branch-Schutz sie verlangt.
# Code und sensible Pfade nie ohne Pflicht-Checks mergen: dort nur --auto.
if ! gh pr merge "$PR" -R "$REPO" --squash --auto --delete-branch; then
  if [ "$class" = "A" ]; then
    gh pr merge "$PR" -R "$REPO" --squash --delete-branch
  else
    echo "::warning::Auto-Merge nicht möglich (Branch-Schutz mit Pflicht-Checks fehlt?). Kein Direkt-Merge im Modus code."
  fi
fi
