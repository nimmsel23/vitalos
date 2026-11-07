#!/usr/bin/env python3
"""Launch Vibe (Android prod line follow-up) interactively with the updated order."""
import os
from pathlib import Path

folder = Path(__file__).resolve().parent
prompt = (folder / 'AUFTRAG-ANDROID-LINIE.md').read_text()
os.execv('/home/alpha/.local/bin/vibe', [
    'vibe', '--workdir', '/home/alpha/vitalos',
    '--add-dir', '/home/alpha/vitalos-prod',
    '--add-dir', '/home/alpha/dev',
    '--add-dir', '/home/alpha/.worktrees/vitalos-master-flow',
    '--auto-approve', prompt,
])
