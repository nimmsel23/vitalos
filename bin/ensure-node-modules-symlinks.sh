#!/bin/bash
# ensure-node-modules-symlinks.sh
#
# Jedes ~/*-dev Repo hat eine Zwillings-Checkout unter ~/vitalos/<name-app>
# (git submodule + worktree desselben Repos, siehe ~/vitalos/.gitmodules).
# node_modules (und ggf. functions/node_modules) NICHT doppelt installieren —
# ~/*-dev behält die echte Installation, ~/vitalos/<name-app> bekommt einen
# Symlink darauf. Idempotent: läuft mehrfach ohne Schaden, legt fehlende
# Symlinks an, lässt existierende echte Verzeichnisse unangetastet (kein
# automatisches rm -rf — das entscheidet ein Mensch einmalig manuell).
#
# Aufruf: ohne Argumente (prüft alle bekannten Paare) oder mit einem
# Repo-Namen (z.B. "fuel-dev"), um nur dieses Paar zu prüfen.

set -u

have_gum() { command -v gum >/dev/null 2>&1; }
log_info() { have_gum && gum log --level info "$1" || echo "[info] $1"; }
log_warn() { have_gum && gum log --level warn "$1" || echo "[warn] $1" >&2; }

# dev-repo-name:vitalos-app-pfad
PAIRS=(
  "fitness-dev:fitness-app"
  "fuel-dev:fuel-app"
  "journal-dev:journal-app"
  "habits-dev:habit-app"
  "learn-dev:learn-dev"
)

only="${1:-}"

ensure_link() {
  local devpath="$1" apppath="$2"
  [ -d "$devpath" ] || return 0  # dev-Seite hat's nicht -> nichts zu tun

  if [ -L "$apppath" ]; then
    local target
    target="$(readlink "$apppath")"
    if [ "$target" = "$devpath" ]; then
      return 0  # bereits korrekt verlinkt
    fi
    log_warn "$apppath ist Symlink, zeigt aber auf $target statt $devpath — manuell prüfen"
    return 0
  fi

  if [ -e "$apppath" ]; then
    log_warn "$apppath existiert als echtes Verzeichnis/Datei — nicht automatisch gelöscht. Manuell: rm -rf '$apppath' && ln -s '$devpath' '$apppath'"
    return 0
  fi

  ln -s "$devpath" "$apppath"
  log_info "Symlink angelegt: $apppath -> $devpath"
}

for pair in "${PAIRS[@]}"; do
  dev="${pair%%:*}"
  app="${pair##*:}"
  [ -n "$only" ] && [ "$only" != "$dev" ] && continue

  devroot="/home/alpha/$dev"
  approot="/home/alpha/vitalos/$app"
  [ -d "$devroot" ] || continue
  [ -d "$approot" ] || continue

  ensure_link "$devroot/node_modules" "$approot/node_modules"
  ensure_link "$devroot/functions/node_modules" "$approot/functions/node_modules"
done
