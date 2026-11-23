#!/usr/bin/env bash
# Genau ein offenes Issue für fehlgeschlagene Shell-Pin-Bumps. Gleicher
# Fingerabdruck wird nicht noch einmal geschrieben.
set -euo pipefail

PIN_ISSUE_TITLE='Shell-Pin: Build oder Checks rot'
PIN_ISSUE_MARKER='<!-- shell-pin-failure -->'

pin_issue_fingerprint() {
  printf '%s' "$1" | sha256sum | awk '{print $1}'
}

pin_issue_find_open() {
  gh issue list -R "$REPO" --state open --limit 100 --json number,body \
    -q "[.[] | select(.body != null and (.body | contains(\"${PIN_ISSUE_MARKER}\"))) | .number][0] // empty"
}

# $1 = stabiler Grund (ohne Lauf-URL). Schreibt oder aktualisiert das eine Issue.
pin_issue_upsert() {
  local reason="$1"
  local fp body number old
  fp="$(pin_issue_fingerprint "$reason")"
  body=$(cat <<EOF
${PIN_ISSUE_MARKER}
fingerprint: ${fp}

${reason}
EOF
)
  number="$(pin_issue_find_open || true)"
  if [ -z "$number" ]; then
    if [ "${DRY_RUN:-}" = 1 ]; then
      echo "DRY-RUN: würde Issue anlegen: ${PIN_ISSUE_TITLE}"
      printf '%s\n' "$reason"
      return 0
    fi
    gh issue create -R "$REPO" --title "$PIN_ISSUE_TITLE" --body "$body" >/dev/null
    echo "Issue angelegt (${PIN_ISSUE_TITLE})."
    return 0
  fi
  old="$(gh issue view "$number" -R "$REPO" --json body -q .body)"
  if printf '%s\n' "$old" | grep -q "fingerprint: ${fp}"; then
    echo "Issue #${number} steht schon auf diesem Stand."
    return 0
  fi
  if [ "${DRY_RUN:-}" = 1 ]; then
    echo "DRY-RUN: würde Issue #${number} aktualisieren."
    return 0
  fi
  gh issue edit "$number" -R "$REPO" --title "$PIN_ISSUE_TITLE" --body "$body" >/dev/null
  echo "Issue #${number} aktualisiert."
}

pin_issue_close_if_open() {
  local comment="$1"
  local number
  number="$(pin_issue_find_open || true)"
  [ -n "$number" ] || return 0
  if [ "${DRY_RUN:-}" = 1 ]; then
    echo "DRY-RUN: würde Issue #${number} schließen."
    return 0
  fi
  gh issue close "$number" -R "$REPO" --reason completed --comment "$comment" >/dev/null
  echo "Issue #${number} geschlossen."
}
