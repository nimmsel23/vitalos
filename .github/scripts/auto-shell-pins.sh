#!/usr/bin/env bash
# Shell-Pin: jede Mini-App (Fuel eingeschlossen) auf den neuesten
# origin/master-Commit, dessen Check-Job „check“ grün ist. Ein Pin, der
# kein Vorfahre von origin/master ist (diverged oder ahead), wird auf
# diesen Stand zurückgesetzt. Lockfile danach neu schreiben und mit
# pnpm install --frozen-lockfile prüfen.
#
# Idempotent: kein Commit und kein PR, wenn kein Gitlink sich ändert.
# Liegt schon ein offener PR auf codex/shell-pins-*, wird der nachgezogen
# statt ein zweiter geöffnet.
#
# DRY_RUN=1 listet die SHAs und ändert nichts.
# REPORT=deploy wertet einen abgeschlossenen Deploy-/Product-Lauf aus
# (WORKFLOW_NAME, WORKFLOW_CONCLUSION, WORKFLOW_SHA, WORKFLOW_BRANCH, WORKFLOW_URL).
set -euo pipefail

# GitHub compare master...pin: behind/identical = Pin ist Vorfahre oder gleich.
# ahead/diverged = der Pin enthält Commits, die nicht auf master sind.
pin_relation_needs_reset() {
  case "$1" in
    ahead|diverged) return 0 ;;
    *) return 1 ;;
  esac
}

if [[ "${1:-}" == "--self-test" ]]; then
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
  expect 0 "diverged wird zurückgesetzt" pin_relation_needs_reset diverged
  expect 0 "ahead wird zurückgesetzt" pin_relation_needs_reset ahead
  expect 1 "behind bleibt" pin_relation_needs_reset behind
  expect 1 "identical bleibt" pin_relation_needs_reset identical
  expect 1 "unbekannt bleibt" pin_relation_needs_reset unknown
  exit "$fail"
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
cd "$ROOT"
# shellcheck source=pin-bump-policy.sh
source "$HERE/pin-bump-policy.sh"
# shellcheck source=shell-pin-issue.sh
source "$HERE/shell-pin-issue.sh"

REPO="${REPO:-nimmsel23/vitalos}"
DRY_RUN="${DRY_RUN:-}"
LOOKBACK="${LOOKBACK:-30}"

api_get() {
  local path="$1"
  local tmp code
  tmp="$(mktemp)"
  code="$(curl -sS -o "$tmp" -w '%{http_code}' \
    -H "Authorization: Bearer ${GH_TOKEN:-}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/${path}")"
  if [ "$code" = "401" ] || [ "$code" = "403" ]; then
    code="$(curl -sS -o "$tmp" -w '%{http_code}' \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com/${path}")"
  fi
  if [ "$code" != "200" ]; then
    echo "GitHub API ${path} -> HTTP ${code}" >&2
    cat "$tmp" >&2
    rm -f "$tmp"
    return 1
  fi
  cat "$tmp"
  rm -f "$tmp"
}

# Neuester Check namens „check“ muss completed/success sein. Sonst weiter zurück.
latest_green_master() {
  local repo="$1"
  local sha status conclusion payload
  while IFS= read -r sha; do
    [ -n "$sha" ] || continue
    payload="$(api_get "repos/${repo}/commits/${sha}/check-runs?per_page=100")"
    status="$(printf '%s' "$payload" | jq -r '[.check_runs[] | select(.name=="check")][0].status // empty')"
    conclusion="$(printf '%s' "$payload" | jq -r '[.check_runs[] | select(.name=="check")][0].conclusion // empty')"
    if [ "$status" = "completed" ] && [ "$conclusion" = "success" ]; then
      printf '%s' "$sha"
      return 0
    fi
  done < <(api_get "repos/${repo}/commits?sha=master&per_page=${LOOKBACK}" | jq -r '.[].sha')
  return 1
}

report_deploy() {
  local files
  [ "${WORKFLOW_BRANCH:-}" = "master" ] || { echo "Nicht master, kein Pin-Report."; exit 0; }
  files="$(api_get "repos/${REPO}/commits/${WORKFLOW_SHA}" | jq -r '.files[]?.filename')"
  pin_files_ok "$files" || { echo "Commit ändert mehr als Pins."; exit 0; }
  if [ "$WORKFLOW_CONCLUSION" = "success" ] && [ "$WORKFLOW_NAME" = "Deploy VitalOS Shell" ]; then
    pin_issue_close_if_open "Deploy VitalOS Shell ist für den Pin-Commit grün: ${WORKFLOW_URL}"
    exit 0
  fi
  if [ "$WORKFLOW_CONCLUSION" = "failure" ]; then
    pin_issue_upsert "$(printf '%s ist rot für einen reinen Pin-Commit auf master.\n%s\nCommit %s\n' \
      "$WORKFLOW_NAME" "$WORKFLOW_URL" "$WORKFLOW_SHA")"
    exit 0
  fi
  echo "Kein Pin-Fehler (${WORKFLOW_NAME} ${WORKFLOW_CONCLUSION})."
}

if [ "${REPORT:-}" = "deploy" ]; then
  report_deploy
  exit 0
fi

configure_https_remotes() {
  git config --global url."https://github.com/".insteadOf "git@github.com:"
  git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"
  if [ -n "${GH_TOKEN:-}" ]; then
    git config --global url."https://x-access-token:${GH_TOKEN}@github.com/".insteadOf "https://github.com/"
  fi
}

date_vienna="$(TZ=Europe/Vienna date +%F)"
branch="codex/shell-pins-${date_vienna}"
if [ "$DRY_RUN" != 1 ]; then
  open_branch="$(gh pr list -R "$REPO" --state open --limit 30 --json number,headRefName \
    -q '[.[] | select(.headRefName | startswith("codex/shell-pins-"))][0].headRefName // empty')"
  if [ -n "$open_branch" ]; then
    echo "Offener Pin-PR auf ${open_branch}, es wird kein zweiter geöffnet."
    branch="$open_branch"
    git fetch origin "$branch"
    git checkout -B "$branch" "origin/${branch}"
    git merge --no-edit origin/master || {
      pin_issue_upsert "Pin-Branch ${branch} lässt sich nicht mit master zusammenführen."
      exit 1
    }
  fi
  # Lokal reicht nicht: `git submodule update` klont mit der SSH-URL aus
  # .gitmodules, und der Kindprozess sieht url.insteadOf nur global
  # (Lauf 45479978566: Permission denied publickey).
  configure_https_remotes
fi

rows=""
off_notes=""
changed=0
if [ "$DRY_RUN" != 1 ]; then
  trapped=0
  fail_bump() {
    [ "$trapped" = 1 ] && exit 1
    trapped=1
    pin_issue_upsert "auto-shell-pins abgebrochen (Branch ${branch}, Zeile ${1:-?})." || true
    exit 1
  }
  trap 'fail_bump $LINENO' ERR
fi

while read -r key path; do
  name="${key#submodule.}"
  name="${name%.path}"
  url="$(git config -f .gitmodules --get "submodule.${name}.url")"
  repo="${url#*github.com:}"
  repo="${repo#https://github.com/}"
  repo="${repo%.git}"
  current="$(git rev-parse "HEAD:${path}")"
  master="$(api_get "repos/${repo}/commits/master" | jq -r .sha)"
  relation="$(api_get "repos/${repo}/compare/${master}...${current}" | jq -r '.status // "unknown"')"
  note="\`check\` grün"
  if ! green="$(latest_green_master "$repo")"; then
    echo "::warning::${path}: kein grüner check in den letzten ${LOOKBACK} Commits auf master."
    if pin_relation_needs_reset "$relation"; then
      green="$master"
      note="kein grüner \`check\`, Pin lag nicht auf master"
    else
      rows="${rows}| ${path} | ${current:0:12} | unverändert | kein grüner \`check\` |"$'\n'
      continue
    fi
  fi
  short_green="${green:0:12}"
  short_cur="${current:0:12}"
  if [ "$current" = "$green" ]; then
    echo "${path} bleibt ${short_cur} (${relation})"
    continue
  fi
  changed=1
  echo "${path}: ${short_cur} -> ${short_green} (${relation})"
  rows="${rows}| ${path} | ${short_cur} | ${short_green} | ${note} |"$'\n'
  if pin_relation_needs_reset "$relation"; then
    only="$(api_get "repos/${repo}/compare/${master}...${current}" | jq -r '.commits[]? | "- \(.sha[0:12]) \(.commit.message | split("\n")[0] | .[0:120])"')"
    off_notes="${off_notes}"$'\n'"### ${path} (\`${repo}\`)"$'\n'"${only}"$'\n'
  fi
  if [ "$DRY_RUN" = 1 ]; then
    continue
  fi
  if [ ! -e "${path}/.git" ]; then
    git submodule update --init -- "$path"
  fi
  git -C "$path" fetch --depth=1 origin "$green"
  git -C "$path" checkout --detach "$green"
  git add -- "$path"
done < <(git config -f .gitmodules --get-regexp '^submodule\..*\.path$')

if [ "$changed" = 0 ]; then
  echo "Keine Pin-Änderung. Kein PR."
  exit 0
fi

if [ "$DRY_RUN" = 1 ]; then
  echo "DRY-RUN: würde Branch ${branch} und einen PR öffnen."
  printf '%s\n' "$rows"
  exit 0
fi

if ! pnpm install --lockfile-only --no-frozen-lockfile; then
  pin_issue_upsert "pnpm-lock.yaml ließ sich nach dem Pin-Bump nicht schreiben (Branch ${branch})."
  exit 1
fi
git add -- pnpm-lock.yaml || true
if ! pnpm install --frozen-lockfile; then
  pin_issue_upsert "pnpm install --frozen-lockfile ist nach dem Pin-Bump rot (Branch ${branch})."
  exit 1
fi

git config user.name "vitalos-org-bot[bot]"
git config user.email "357914247+vitalos-org-bot[bot]@users.noreply.github.com"
if git diff --cached --quiet; then
  echo "Index leer nach Lockfile-Lauf. Kein PR."
  exit 0
fi
git -c core.hooksPath=/dev/null commit -m "chore(submodules): Shell-Pins ${date_vienna}"

git push origin "HEAD:refs/heads/${branch}"

body=$(cat <<EOF
Automatisch von Auto Shell Pins (vitalos-org-bot).

## Pins

| Modul | vorher | nachher | CI |
| --- | --- | --- | --- |
${rows}
Lockfile: \`pnpm install --lockfile-only --no-frozen-lockfile\`, danach \`pnpm install --frozen-lockfile\`.
${off_notes:+
## Nicht auf *-dev master

Diese Pins waren kein Vorfahre von \`master\` (ahead oder diverged). Der Pin geht auf den grünen master-HEAD. Die Commits bleiben in den Dev-Repos.

${off_notes}
}
## Merge

Reiner Pin-Bump. \`classify-merge\` stuft das als Klasse A ein (kein \`peer-ok\`) und squash-mergt, sobald alle Checks außer \`open-pr\`/\`classify-merge\` grün sind. Danach läuft Deploy VitalOS Shell auf \`master\`.

Absicherung: Diff nur Mini-App-Gitlinks und \`pnpm-lock.yaml\`, beide Seiten bleiben Submodules unter \`nimmsel23/\`, Autor ist vitalos-org-bot oder der Branch heißt \`codex/shell-pins-*\`.
EOF
)

existing="$(gh pr list -R "$REPO" --head "$branch" --state open --json number -q '.[0].number // empty')"
if [ -n "$existing" ]; then
  gh pr edit "$existing" -R "$REPO" --title "chore(submodules): Shell-Pins ${date_vienna}" --body "$body" >/dev/null
  echo "PR #${existing} aktualisiert."
  exit 0
fi
# Der Push auf codex/** lässt den Org-Bot denselben PR anlegen. Kurz warten, dann nachziehen.
sleep 15
existing="$(gh pr list -R "$REPO" --head "$branch" --state open --json number -q '.[0].number // empty')"
if [ -n "$existing" ]; then
  gh pr edit "$existing" -R "$REPO" --title "chore(submodules): Shell-Pins ${date_vienna}" --body "$body" >/dev/null
  gh pr ready "$existing" -R "$REPO" >/dev/null 2>&1 || true
  echo "PR #${existing} vom Org-Bot übernommen."
  exit 0
fi
if ! gh pr create -R "$REPO" --head "$branch" --base master \
  --title "chore(submodules): Shell-Pins ${date_vienna}" \
  --body "$body"; then
  existing="$(gh pr list -R "$REPO" --head "$branch" --state open --json number -q '.[0].number // empty')"
  [ -n "$existing" ] || exit 1
  gh pr edit "$existing" -R "$REPO" --title "chore(submodules): Shell-Pins ${date_vienna}" --body "$body" >/dev/null
  echo "PR #${existing} nachgezogen."
fi
