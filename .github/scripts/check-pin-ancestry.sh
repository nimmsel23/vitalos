#!/usr/bin/env bash
# Jeder Mini-App-Gitlink muss Vorfahre oder gleich des *-dev-master sein.
# ahead/diverged ist der Zustand von ce2bd836 (6pack-app auf einem
# vitalos-Zweig) und bricht hier mit einer eigenen Meldung ab.
set -euo pipefail

pin_relation_on_master() {
  case "$1" in
    identical|behind) return 0 ;;
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
  expect 0 "identical" pin_relation_on_master identical
  expect 0 "behind" pin_relation_on_master behind
  expect 1 "ahead" pin_relation_on_master ahead
  expect 1 "diverged" pin_relation_on_master diverged
  expect 1 "leer" pin_relation_on_master ""
  exit "$fail"
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
cd "$ROOT"

fail=0
while read -r key path; do
  name="${key#submodule.}"
  name="${name%.path}"
  url="$(git config -f .gitmodules --get "submodule.${name}.url")"
  repo="${url#*github.com:}"
  repo="${repo#https://github.com/}"
  repo="${repo%.git}"
  current="$(git rev-parse "HEAD:${path}")"
  master="$(gh api "repos/${repo}/commits/master" -q .sha)"
  relation="$(gh api "repos/${repo}/compare/${master}...${current}" -q .status)"
  short_cur="${current:0:12}"
  short_master="${master:0:12}"
  if pin_relation_on_master "$relation"; then
    echo "ok  ${path} ${short_cur} ist ${relation} von ${repo}@${short_master}"
  else
    echo "::error title=Pin liegt nicht auf master::${path} (${repo}) ${short_cur} ist '${relation}' gegenüber master ${short_master}. Pin auf master zurücksetzen."
    fail=1
  fi
done < <(git config -f .gitmodules --get-regexp '^submodule\..*\.path$')

exit "$fail"
