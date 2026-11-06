/**
 * auto-doc-engines.mjs — geteilte Modell-Engine-Kette der Auto-Doc-Dienste.
 *
 * Kette (User-Vorgabe 2026-11-05): Claude Haiku → Codex luna → Vibe low.
 * Reine Textgenerierung (keine Tools), je 300s Timeout; schlägt eine Stufe
 * fehlt, fällt der Lauf auf die nächste zurück. Manuell: gemini (Key aus
 * ~/.env/, gemini.env zuerst).
 *
 * Alle ask-Funktionen nehmen den KOMPLETTEN Prompt und liefern geparstes
 * JSON (parseModelJson extrahiert das erste { … letzte } Objekt robust).
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export const ENGINE_TIMEOUT_MS = 300_000;

export function parseModelJson(text) {
  const stripped = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  const parsed = JSON.parse(stripped.slice(start, end + 1));
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Antwort ist kein JSON-Objekt');
  }
  return parsed;
}

export function askClaude(promptText) {
  const res = spawnSync('claude', ['-p', '--model', 'haiku', '--output-format', 'text'],
    { input: promptText, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: ENGINE_TIMEOUT_MS });
  if (res.status !== 0 || res.error || !res.stdout?.trim()) {
    throw new Error(`claude CLI ${res.error?.code ?? 'exit ' + res.status}: ${(res.stderr || '').slice(0, 160)}`);
  }
  return parseModelJson(res.stdout);
}

export function askCodex(promptText) {
  const res = spawnSync('codex',
    ['exec', '-m', 'luna', '-s', 'read-only', '--skip-git-repo-check', '-'],
    { input: promptText, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: ENGINE_TIMEOUT_MS });
  if (res.status !== 0 || res.error || !res.stdout?.trim()) {
    throw new Error(`codex CLI ${res.error?.code ?? 'exit ' + res.status}: ${((res.stderr || '') + (res.stdout || '')).slice(0, 160)}`);
  }
  return parseModelJson(res.stdout);
}

export function askVibe(promptText, stateDir) {
  const dir = stateDir || resolve(homedir(), '.local/state/vitalos-thin-results');
  const promptFile = join(dir, `vibe-prompt-${process.pid}-${Date.now()}.txt`);
  writeFileSync(promptFile, promptText, 'utf8');
  try {
    const res = spawnSync('vibe',
      ['--prompt-file', promptFile, '--model', 'mistral-medium-3.5',
       '--agent', 'ask', '--max-turns', '2', '--output', 'text', '--time-limit', String(ENGINE_TIMEOUT_MS / 1000 - 10)],
      { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: ENGINE_TIMEOUT_MS });
    if (res.status !== 0 || res.error || !res.stdout?.trim()) {
      throw new Error(`vibe CLI ${res.error?.code ?? 'exit ' + res.status}: ${(res.stderr || '').slice(0, 160)}`);
    }
    return parseModelJson(res.stdout);
  } finally {
    try { unlinkSync(promptFile); } catch {}
  }
}

function loadGeminiEnv() {
  for (const name of ['gemini.env', 'fuel.env', 'relax.env', 'aos.env']) {
    const envFile = resolve(homedir(), '.env', name);
    if (!existsSync(envFile)) continue;
    const out = {};
    for (const line of readFileSync(envFile, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.+)$/);
      if (m) out[m[1]] = m[2].trim();
    }
    if (out.GEMINI_API_KEY) return out;
  }
  throw new Error('Kein GEMINI_API_KEY in ~/.env/ gefunden.');
}

export async function askGemini(promptText) {
  const env = loadGeminiEnv();
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
  return parseModelJson(text);
}

/**
 * Läuft die Engine-Kette und liefert { out, usedEngine } des ersten
 * Erfolgs. onStage(name, fehlertext|null) wird pro Stufe informiert.
 * engineArg 'gemini' erzwingt die API-Engine statt der Kette.
 */
export async function runEngineChain(promptText, { engineArg, onStage, stateDir } = {}) {
  const stages = engineArg === 'gemini'
    ? [{ name: 'gemini', run: async (p) => askGemini(p) }]
    : [
        { name: 'claude/haiku', run: (p) => askClaude(p) },
        { name: 'codex/luna', run: (p) => askCodex(p) },
        { name: 'vibe/mistral-medium-3.5', run: (p) => askVibe(p, stateDir) },
      ];
  let lastError = null;
  for (const stage of stages) {
    try {
      const out = await stage.run(promptText);
      onStage?.(stage.name, null);
      return { out, usedEngine: stage.name };
    } catch (e) {
      lastError = String(e.message).slice(0, 140);
      onStage?.(stage.name, lastError);
    }
  }
  throw new Error(`keine Engine erreichbar (${lastError})`);
}
