#!/usr/bin/env python3
"""Launch Vibe interactively with the complete local handoff as one argument."""
import os
from pathlib import Path

folder = Path(__file__).resolve().parent
prompt = (folder / 'VIBE-PROMPT.md').read_text()
os.execv('/home/alpha/.local/bin/vibe', [
    'vibe', '--workdir', '/tmp/vitalos-product-prep-20261106',
    '--add-dir', '/home/alpha/vitalos',
    '--add-dir', '/home/alpha/dev',
    '--add-dir', '/home/alpha/vitalos-prod',
    '--auto-approve', prompt,
])
