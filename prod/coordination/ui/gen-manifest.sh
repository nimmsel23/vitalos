#!/usr/bin/env bash
# Schreibt ui/manifest.json: alle lesbaren Koordinations-Markdowns fürs Lagezelt.
# Aufruf: ./ui/gen-manifest.sh   (cwd egal)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UI="$ROOT/ui"
OUT="$UI/manifest.json"

# key|relpath|label|group
map_doc() {
  local f="$1" base key label group rel
  base="$(basename "$f" .md)"
  rel="${f#"$ROOT"/}"
  case "$rel" in
    STATUS.md) key=status; label=Status; group=Lage ;;
    TODO.md) key=todo; label=TODO; group=Lage ;;
    PRODUKT-BACKLOG.md) key=backlog; label="Produkt-Backlog"; group=Lage ;;
    BOARDS.md) key=boards; label="Living Boards"; group=Lage ;;
    ORG.md) key=org; label=Org; group=Org ;;
    CTO.md) key=cto; label=CTO; group=Org ;;
    CPO.md) key=cpo; label=CPO; group=Org ;;
    ORACLE.md) key=oracle; label=Oracle; group=Org ;;
    PRODUCT.md) key=product; label=Produkt; group=Produkt ;;
    AUFTRAG-ANDROID-LINIE.md) key=auftrag; label="Android-Linie"; group=Produkt ;;
    CEO-SCOPE-OBSERVE-V1.md) key=scope; label="Scope Observe v1"; group=Produkt ;;
    CEO-ROADMAP-STATUS.md) key=roadmap; label=Roadmap; group=Produkt ;;
    CEO-STRATEGY-DELTA.md) key=strategy; label="Strategie-Delta"; group=Produkt ;;
    CEO-ARCHITECTURE-STATUS.md) key=arch; label=Architektur; group=Produkt ;;
    CEO-DEPARTMENTS-KONZEPT.md) key=departments; label=Departments; group=Org ;;
    CEO-STUNDEN-PROMPT.md) key=stunden; label="CEO-Stunden"; group=Ritual ;;
    DESIGN-CLOUD-CTO.md) key=cloudcto; label="Cloud-CTO Design"; group=Org ;;
    P2-WEEKLY-BESTANDSAUFNAHME.md) key=p2weekly; label="P2 Weekly"; group=Ritual ;;
    VIBE-PROMPT.md) key=vibe; label="Vibe-Prompt"; group=Ritual ;;
    README.md) key=readme; label=README; group=Ritual ;;
    game/README.md) key=game; label=Game; group=Ritual ;;
    game/TENT-*.md)
      key="tent-$(echo "$base" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')"
      label="$base"; group=Ritual ;;
    game/GAME-RUN-*.md)
      key="gamerun-$(echo "$base" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')"
      label="$base"; group=Ritual ;;
    boards/*)
      key="board-$(echo "$base" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')"
      label="Board · $base"; group=Boards ;;
    PM-DRAFT-*)
      key="$(echo "$base" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')"
      label="$base"; group=Entwurf ;;
    *)
      key="$(echo "$base" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')"
      label="$base"; group=Weitere ;;
  esac
  printf '%s\t%s\t%s\t%s\n' "$key" "../$rel" "$label" "$group"
}

TMP="$(mktemp)"
{
  # Kern zuerst (stabile Keys)
  for f in STATUS.md TODO.md PRODUKT-BACKLOG.md BOARDS.md ORG.md CTO.md CPO.md ORACLE.md \
           PRODUCT.md AUFTRAG-ANDROID-LINIE.md CEO-SCOPE-OBSERVE-V1.md CEO-ROADMAP-STATUS.md \
           CEO-STRATEGY-DELTA.md CEO-ARCHITECTURE-STATUS.md CEO-DEPARTMENTS-KONZEPT.md \
           DESIGN-CLOUD-CTO.md P2-WEEKLY-BESTANDSAUFNAHME.md CEO-STUNDEN-PROMPT.md \
           VIBE-PROMPT.md README.md game/README.md; do
    [ -f "$ROOT/$f" ] && map_doc "$ROOT/$f"
  done
  # Game-Rituale + PM-Drafts + generierte Boards
  shopt -s nullglob
  for f in "$ROOT"/game/TENT-*.md "$ROOT"/game/GAME-RUN-*.md "$ROOT"/PM-DRAFT-*.md "$ROOT"/boards/*.md; do
    map_doc "$f"
  done
} | awk -F'\t' '!seen[$1]++' > "$TMP"

python3 - "$TMP" "$OUT" <<'PY'
import json, sys, datetime
from pathlib import Path
rows = Path(sys.argv[1]).read_text().splitlines()
docs = []
for line in rows:
    if not line.strip():
        continue
    key, path, label, group = line.split("\t")
    docs.append({"key": key, "path": path, "label": label, "group": group})
payload = {
    "generated": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
    "docs": docs,
}
Path(sys.argv[2]).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
print(f"wrote {sys.argv[2]} ({len(docs)} docs)")
PY
rm -f "$TMP"
