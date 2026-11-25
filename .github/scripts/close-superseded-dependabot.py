#!/usr/bin/env python3
"""Schließt Dependabot-PRs, deren Zielversionen der Basis-Lockfile schon hat.

Ein Bündel-PR (z. B. vitalos#70) schreibt die Versionen ins Lockfile und
lässt die einzelnen Dependabot-PRs offen. Dieser Lauf schließt nur PRs,
deren sämtliche ``Updates `pkg` from A to B``-Zeilen im Lockfile der Basis
schon mit Version >= B stehen, und deren Diff nur Lockfiles und
package.json betrifft. Ein Major, der bewusst draußen blieb (#66,
firebase-functions 7), bleibt offen.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys

UPDATE_RE = re.compile(r"^Updates `([^`]+)` from (\S+) to (\S+)\s*$", re.M)
BUMP_RE = re.compile(r"^Bumps \[([^\]]+)\]\([^)]+\) from (\S+) to (\S+?)\.?\s*$", re.M)
LOCK_NAMES = {
    "package-lock.json",
    "npm-shrinkwrap.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "package.json",
}


def parse_version(raw: str):
    text = raw.strip().rstrip(".,);")
    if text.startswith("v"):
        text = text[1:]
    main, sep, pre = text.partition("-")
    parts = []
    for piece in main.split("."):
        if not piece.isdigit():
            return None
        parts.append(int(piece))
    if not parts:
        return None
    return (tuple(parts), pre if sep else "")


def version_ge(base: str, target: str) -> bool:
    parsed_base = parse_version(base)
    parsed_target = parse_version(target)
    if parsed_base is None or parsed_target is None:
        return base.strip() == target.strip()
    if parsed_base[1] or parsed_target[1]:
        return parsed_base == parsed_target
    width = max(len(parsed_base[0]), len(parsed_target[0]))
    left = parsed_base[0] + (0,) * (width - len(parsed_base[0]))
    right = parsed_target[0] + (0,) * (width - len(parsed_target[0]))
    return left >= right


def updates_in(body: str) -> list[tuple[str, str]]:
    text = body or ""
    found = [(name, target.rstrip(".")) for name, _old, target in UPDATE_RE.findall(text)]
    found += [(name, target.rstrip(".")) for name, _old, target in BUMP_RE.findall(text)]
    return found


def resolved_version(lock: dict, name: str) -> str | None:
    packages = lock.get("packages")
    if not isinstance(packages, dict):
        return None
    exact = packages.get(f"node_modules/{name}")
    if isinstance(exact, dict) and exact.get("version"):
        return str(exact["version"])
    suffix = f"node_modules/{name}"
    found = []
    for key, meta in packages.items():
        if key == suffix or key.endswith("/" + suffix):
            if isinstance(meta, dict) and meta.get("version"):
                found.append(str(meta["version"]))
    if not found:
        return None
    return max(found, key=lambda item: parse_version(item) or ((), ""))


def files_are_manifests(paths: list[str]) -> bool:
    if not paths:
        return False
    for path in paths:
        base = path.rsplit("/", 1)[-1]
        if base not in LOCK_NAMES:
            return False
    return True


def superseded(body: str, paths: list[str], locks: list[dict]) -> tuple[bool, str]:
    if not files_are_manifests(paths):
        return False, "Diff enthält mehr als Lockfile/package.json"
    bumps = updates_in(body)
    if not bumps:
        return False, "keine Updates-Zeile"
    notes = []
    for name, target in bumps:
        have = None
        for lock in locks:
            have = resolved_version(lock, name)
            if have:
                break
        if not have:
            return False, f"{name}@{target} fehlt im Lockfile"
        if not version_ge(have, target):
            return False, f"{name} im Lockfile ist {have}, Ziel ist {target}"
        notes.append(f"{name} {have} (>= {target})")
    return True, ", ".join(notes)


def gh_json(args: list[str]) -> object:
    out = subprocess.check_output(["gh", *args], text=True)
    return json.loads(out)


def load_lock(repo: str, ref: str, path: str) -> dict | None:
    if not path.endswith("package-lock.json") and not path.endswith("npm-shrinkwrap.json"):
        return None
    try:
        raw = subprocess.check_output(
            ["gh", "api", f"repos/{repo}/contents/{path}?ref={ref}", "-q", ".content"],
            text=True,
        )
    except subprocess.CalledProcessError:
        return None
    import base64

    try:
        return json.loads(base64.b64decode(raw))
    except (json.JSONDecodeError, ValueError):
        return None


def close_prs(repo: str, base: str, dry_run: bool) -> int:
    pulls = gh_json(
        [
            "pr",
            "list",
            "-R",
            repo,
            "--state",
            "open",
            "--limit",
            "50",
            "--json",
            "number,title,body,author,files,baseRefName",
        ]
    )
    closed = 0
    for pr in pulls:
        author = (pr.get("author") or {}).get("login") or ""
        if author != "dependabot":
            # gh --json author.login ist "dependabot" ohne [bot], je nach API.
            if "dependabot" not in author:
                continue
        paths = [item.get("path") or "" for item in pr.get("files") or []]
        lock_paths = [
            path
            for path in paths
            if path.endswith("package-lock.json") or path.endswith("npm-shrinkwrap.json")
        ]
        locks = []
        for path in lock_paths:
            loaded = load_lock(repo, pr.get("baseRefName") or base, path)
            if loaded is not None:
                locks.append(loaded)
        ok, reason = superseded(pr.get("body") or "", paths, locks)
        number = pr["number"]
        if not ok:
            print(f"offen #{number}: {reason}")
            continue
        print(f"überholt #{number}: {reason}")
        if dry_run:
            continue
        comment = (
            "Geschlossen, weil diese Versionen auf der Basis schon im Lockfile stehen "
            f"({reason}). Der einzelne Dependabot-PR ist damit überholt."
        )
        subprocess.check_call(
            ["gh", "pr", "close", str(number), "-R", repo, "--comment", comment]
        )
        closed += 1
    return closed


def self_test() -> None:
    lock = {
        "packages": {
            "node_modules/qs": {"version": "6.16.2"},
            "node_modules/express": {"version": "4.22.3"},
            "node_modules/firebase-admin": {"version": "12.7.0"},
            "node_modules/firebase-functions": {"version": "5.1.1"},
            "node_modules/body-parser": {"version": "1.20.9"},
        }
    }
    body65 = "Updates `qs` from 6.15.3 to 6.16.2\nUpdates `express` from 4.22.2 to 4.22.3\n"
    body69 = "Bumps [body-parser](https://github.com/expressjs/body-parser) from 1.20.6 to 1.20.9.\n"
    ok, reason = superseded(body69, ["prod/functions/package-lock.json"], [lock])
    assert ok, reason
    body67 = "Bumps [@grpc/grpc-js](https://github.com/grpc/grpc-node) from 1.14.4 to 1.14.7.\n"
    ok, reason = superseded(body67, ["prod/functions/package-lock.json"], [{
        "packages": {"node_modules/@grpc/grpc-js": {"version": "1.14.3"}}
    }])
    assert not ok, reason
    ok, reason = superseded(body65, ["prod/functions/package-lock.json"], [lock])
    assert ok, reason
    body66 = (
        "Updates `firebase-admin` from 12.7.0 to 14.5.1\n"
        "Updates `firebase-functions` from 5.1.1 to 7.4.0\n"
    )
    ok, reason = superseded(body66, ["prod/functions/package-lock.json", "prod/functions/package.json"], [lock])
    assert not ok, reason
    assert version_ge("1.20.10", "1.20.9")
    assert not version_ge("1.20.9", "1.20.10")
    assert version_ge("6.16.2", "6.16.2")
    ok, reason = superseded(body65, ["prod/functions/index.js"], [lock])
    assert not ok and "Diff" in reason
    ok, _reason = superseded("keine zeile", ["prod/functions/package-lock.json"], [lock])
    assert not ok
    print("self-test ok")


def main() -> int:
    if "--self-test" in sys.argv:
        self_test()
        return 0
    repo = os.environ.get("REPO", "nimmsel23/vitalos")
    base = os.environ.get("BASE", "master")
    dry = os.environ.get("DRY_RUN", "") == "1"
    close_prs(repo, base, dry)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
