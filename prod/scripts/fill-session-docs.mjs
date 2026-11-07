#!/usr/bin/env node
/**
 * fill-session-docs.mjs — nächtlicher Handoff-Fill für Vibe-Sessions.
 *
 * Pendant zu Claudes PreCompact-Hook (~/.claude/hooks/pre-compact-docs.sh):
 * Vibe hat KEIN Compact-Hook-Event (Stand 3.1.0, nur post_agent/pre_tool/
 * post_tool), deshalb trägt der tägliche Dienst nach: Er liest die.de SESSIONS
 * aus ~/.vibe/logs/session/unified/ (journal/*.jsonl als Transcript) und füllt
 * AUSSCHLIESSLICH die Submodule-Checkouts des VitalOS-Meta-Repos (dieselben
 * Docs, die thin-results.mjs ausdünnt). Meta-Root-Sessions werden per
 * Transcript-Nennungen dem dominanten Submodule zugeordnet; alle anderen
 * Arbeitsordner (Home, dev- und Fremd-Repos) werden mit Grund geskippt.
 * Je Repo läuft die Engine-Kette (auto-doc-engines.mjs):
 *   - RESULTS.md: neuen Eintrag ganz oben im bestehenden Format anfügen
 *   - NEXT.md: offene Punkte als Bullets oben ergänzen (nur was wirklich
 *     offen blieb — nie Erledigtes duplizieren)
 * Commit NUR dieser Dateien (--no-verify), KEIN Push.
 *
 * Guards: nur Sessions mit echtem Arbeitsumfang (Journal-Bytes über
 * MIN_JOURNAL_BYTES), nur Ziel-Repos nach resolveDocTarget, Lock via flock,
 * Model-/Parse-Fehler lässt das Repo unverändert. State sorgt dafür, dass
 * nur Sessions seit dem letzten Lauf gefüllt werden.
 *
 * Aufruf:
 *   node fill-session-docs.mjs [--dry-run] [--status] [--hours N]
 *     --hours N: Sessions der letzten N Stunden betrachten (Test; Default:
 *     seit letztem Lauf, maximal 48h).
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, openSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEngineChain } from './auto-doc-engines.mjs';

const SESSIONS_DIR = resolve(homedir(), '.vibe/logs/session/unified');
// Einziges legitimes Fill-Ziel: Submodule-Checkouts des VitalOS-Meta-Repos —
// exakt die Docs, die thin-results.mjs auch liest (dort passiert das Ausdünnen).
const META = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STATE_DIR = resolve(homedir(), '.local/state/vitalos-thin-results');
const STATE_FILE = join(STATE_DIR, 'fill-last-run.json');
const MIN_JOURNAL_BYTES = 6_000;
const TRANSCRIPT_CAP = 150_000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const statusOnly = args.includes('--status');
const hoursIdx = args.indexOf('--hours');
const hoursArg = hoursIdx >= 0 ? Number(args[hoursIdx + 1]) : null;
const TODAY = new Date().toISOString().slice(0, 10);

function git(path, ...gitArgs) {
  return execFileSync('git', gitArgs, { cwd: path, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }).trim();
}

function loadLastRun() {
  if (existsSync(STATE_FILE)) {
    try { return new Date(JSON.parse(readFileSync(STATE_FILE, 'utf8')).at); }
    catch { /* fallthrough */ }
  }
  return new Date(Date.now() - 24 * 3600 * 1000);
}

function saveLastRun() {
  writeFileSync(STATE_FILE, JSON.stringify({ at: new Date().toISOString() }, null, 1), 'utf8');
}

function hasConvention(repoPath) {
  return existsSync(join(repoPath, 'RESULTS.md')) || existsSync(join(repoPath, 'NEXT.md'));
}

/** Submodule-Pfade aus .gitmodules eines Checkouts (null, wenn kein Meta-Layout). */
function metaSubmodules(root) {
  const gm = join(root, '.gitmodules');
  if (!existsSync(gm)) return null;
  const names = [...readFileSync(gm, 'utf8').matchAll(/^\s*path\s*=\s*(\S+)\s*$/gm)].map((m) => m[1]);
  return names.length ? names : null;
}

const skippedSessions = [];

/**
 * Ziel-Doc-Auflösung (CTO 2026-11-07): Nur die VitalOS-Submodule-Checkouts
 * werden gefüllt — dasselbe Set, das thin-results.mjs liest.
 *  - Arbeit direkt im Submodule-Checkout des Haupt-Meta-Repos → dorthin.
 *  - Arbeit in einem Meta-Checkout-Root (oft der Session-Startordner) →
 *    Zuordnung per Transcript-Nennungen zum dominanten Submodule (>= 8),
 *    sonst Skip mit Grund.
 *  - Alles andere (Home, dev-*-/Fremd-Repos, abermalige Meta-Checkouts mit
 *    eigener Konvention) → Skip mit Grund, keine Doc-Verschmutzung mehr.
 */
function resolveDocTarget(wd, transcript) {
  const subsHere = metaSubmodules(wd);
  if (subsHere) {
    let best = null;
    let bestScore = 0;
    let secondScore = 0;
    for (const name of subsHere) {
      const score = (transcript.match(new RegExp(`/${name}[/\\s"']`, 'g')) || []).length;
      if (score > bestScore) { secondScore = bestScore; best = name; bestScore = score; }
      else if (score > secondScore) secondScore = score;
    }
    const target = best ? join(wd, best) : null;
    // Schwelle 8 UND klare Dominanz (2x Zweitplatzierter) — sonst kein Eintrag
    // in ein evtl. falsches Submodule-Doc (Beleg: Android-Session, nur 11 flüchtige
    // Nennungen eines Submodules, reale Arbeit woanders im Meta-Checkout).
    if (target && bestScore >= 8 && bestScore >= 2 * secondScore && hasConvention(target)) {
      return { repo: target, note: `Meta-Checkout → Submodule "${best}" (${bestScore} Transcript-Nennungen)` };
    }
    skippedSessions.push(`${wd}: Meta-Checkout ohne klare Submodule-Zuordnung (best "${best}"=${bestScore})`);
    return null;
  }
  const metaSubs = metaSubmodules(META);
  const rel = relative(META, wd);
  if (metaSubs && rel && !rel.startsWith('..') && !isAbsolute(rel) && metaSubs.includes(rel) && hasConvention(wd)) {
    return { repo: wd, note: null };
  }
  skippedSessions.push(`${wd}: kein VitalOS-Submodule — RESULTS/NEXT dort ist nicht Ziel der Fill-Kette`);
  return null;
}

function collectSession(repoPath, sessionDir) {
  const journalDir = join(sessionDir, 'journal');
  if (!existsSync(journalDir)) return null;
  let bytes = 0;
  const parts = [];
  for (const f of readdirSync(journalDir).sort().reverse()) {
    if (!f.endsWith('.jsonl')) continue;
    const p = join(journalDir, f);
    const size = statSync(p).size;
    bytes += size;
    if (size > 0) parts.push(p);
  }
  if (bytes < MIN_JOURNAL_BYTES) return null;
  // Neueste Journaleteile zuerst einlesen, Gesamtgröße begrenzen.
  let text = '';
  for (const p of parts) {
    const t = readFileSync(p, 'utf8');
    text = t + '\n' + text;
    if (text.length >= TRANSCRIPT_CAP) break;
  }
  return text.slice(-TRANSCRIPT_CAP);
}

function findSessions(since) {
  if (!existsSync(SESSIONS_DIR)) return [];
  const found = [];
  for (const entry of readdirSync(SESSIONS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const metaPath = join(SESSIONS_DIR, entry.name, 'meta.json');
    if (!existsSync(metaPath)) continue;
    let meta;
    try { meta = JSON.parse(readFileSync(metaPath, 'utf8')); }
    catch { continue; }
    const wd = meta?.environment?.working_directory;
    const bump = meta?.bumped_at || meta?.end_time || meta?.start_time;
    if (!wd || !bump) continue;
    const bumped = new Date(bump);
    if (isNaN(bumped) || bumped < since) continue;
    if (!existsSync(join(wd, '.git'))) continue;
    if (!hasConvention(wd)) continue;
    const transcript = collectSession(wd, join(SESSIONS_DIR, entry.name));
    if (!transcript) continue;
    const target = resolveDocTarget(wd, transcript);
    if (!target) continue;
    found.push({ repo: target.repo, wd, note: target.note, sessionId: meta.session_id ?? entry.name, title: meta.title ?? '', transcript, bumped });
  }
  // Pro Repo nur die neueste Session füllen, ältere kürzen.
  const byRepo = new Map();
  for (const s of found.sort((a, b) => b.bumped - a.bumped)) {
    if (!byRepo.has(s.repo)) byRepo.set(s.repo, s);
  }
  return [...byRepo.values()];
}

function fillPrompt(s, currentResultsHead, currentNextHead, nextStyleHint) {
  return `Du bist Dokumentations-Archivar. Lies das Transcript (JSONL, ein Eintrag pro Zeile) einer Vibe-Agent-Session im Repo "${s.repo}" (Session: "${s.title}", ${s.sessionId}).

Kontext: RESULTS.md und NEXT.md in diesem Repo sind der Handoff zwischen Sessions — ein anderer Agent soll allein daraus weiterarbeiten können, ohne das Transcript gesehen zu haben. Denkmodell: RESULTS.md erklärt, was TATSÄCHLICH umgesetzt wurde; NEXT.md hält fest, was offen/unfertig blieb.

Aufgaben:
1. results_entry: Ein neuer RESULTS.md-Eintrag für DIESE Session. Füge nur tatsächlich umgesetzte Änderungen zusammen (Code/Doku/System), nicht Diskutiertes. Heutiges Datum: ${TODAY}. Format genau wie die bestehenden Einträge der Datei (siehe Auszug unten): "# Titel (${TODAY})", kurzer Prolog-Absatz, Bullet-Liste mit **Datei/Komponente**-Fettung, danach eine "---"-Trennzeile. Gibt es im Auszug bereits einen Eintrag mit selbem Thema und heutigem Datum: liefere results_entry als leeren String.

2. next_bullets: Was aus dieser Session offen/unfertig blieb (explizit genannte offene Punkte, vertagte Entscheidungen, bekannte Lücken) als Markdown-Bullets im Stil der NEXT.md (Auszug unten). Nie Punkte duplizieren, die im results_entry als erledigt stehen. Nichts offen: leeren String.

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt ohne Markdown-Zaun:
{"results_entry": "<markdown oder ''>", "next_bullets": "<markdown oder ''>"}

Vorhandene RESULTS.md (Anfang):
${currentResultsHead}

Vorhandene NEXT.md (Anfang):
${currentNextHead}

Transcript:
${s.transcript}`;
}

function prependEntry(filePath, entry, createHeader) {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, `${createHeader}\n\n${entry}`, 'utf8');
    return 'angelegt';
  }
  const current = readFileSync(filePath, 'utf8');
  const lines = current.split('\n');
  const firstHeading = lines.findIndex((l) => l.startsWith('# '));
  if (firstHeading === -1) {
    writeFileSync(filePath, entry + '\n' + current, 'utf8');
  } else {
    lines.splice(firstHeading, 0, entry.trimEnd());
    writeFileSync(filePath, lines.join('\n'), 'utf8');
  }
  return 'erweitert';
}

async function main() {
  mkdirSync(STATE_DIR, { recursive: true });
  const lockFd = openSync(join(STATE_DIR, 'run.lock'), 'w');
  try { execFileSync('flock', ['-n', String(lockFd), 'true']); }
  catch { console.error('Es läuft bereits eine Instanz — Abbruch.'); process.exit(1); }

  const since = hoursArg
    ? new Date(Date.now() - hoursArg * 3600 * 1000)
    : new Date(Math.max(loadLastRun().getTime(), Date.now() - 48 * 3600 * 1000));
  console.log(`Scanne Vibe-Sessions seit ${since.toISOString()} …`);
  const sessions = findSessions(since);
  for (const skip of skippedSessions) console.log(`- SKIP ${skip}`);
  if (!sessions.length) { console.log('Keine qualifizierten Sessions (VitalOS-Submodule + Arbeitsumfang).'); return; }
  for (const s of sessions) {
    console.log(`- ${s.repo} (Session "${s.title}", ${s.sessionId}, ${(s.transcript.length / 1000).toFixed(0)}k Transcript${s.note ? `, ${s.note}` : ''})`);
  }
  if (statusOnly) return;

  let filled = 0;
  for (const s of sessions) {
    const hasResults = existsSync(join(s.repo, 'RESULTS.md'));
    const hasNext = existsSync(join(s.repo, 'NEXT.md'));
    const resultsHead = hasResults ? readFileSync(join(s.repo, 'RESULTS.md'), 'utf8').split('\n').slice(0, 60).join('\n') : '(nicht vorhanden)';
    const nextHead = hasNext ? readFileSync(join(s.repo, 'NEXT.md'), 'utf8').split('\n').slice(0, 40).join('\n') : "(nicht vorhanden — lege mit '# NEXT — offene Punkte für den nächsten Agenten' an)";

    process.stdout.write(`${s.repo.split('/').pop()}: frage Engine-Kette … `);
    let out;
    try {
      ({ out } = await runEngineChain(
        fillPrompt(s, resultsHead, nextHead),
        { stateDir: STATE_DIR, onStage: (name, err) => { if (err) console.log(`[${name}: ${err}] `); } }));
      console.log('ok.');
    } catch (e) {
      console.log(e.message);
      continue;
    }
    const entry = (out.results_entry || '').trim();
    const bullets = (out.next_bullets || '').trim();
    if (!entry && !bullets) { console.log('  nichts Relevantes/Neues — Repo bleibt unverändert.'); continue; }
    if (dryRun) { console.log(`  [dry-run] Eintrag ${entry.length} Z., NEXT ${bullets.length} Z. — kein Schreiben.`); continue; }

    const touched = [];
    try {
      if (entry) {
        const mode = prependEntry(join(s.repo, 'RESULTS.md'), `${entry}\n`,
          `# RESULTS — Arbeitslog\n\n(angelegt vom fill-session-docs-Dienst am ${TODAY})`);
        touched.push(`RESULTS.md ${mode} (${entry.split('\n').length} Z.)`);
      }
      if (bullets) {
        const nextPath = join(s.repo, 'NEXT.md');
        if (!existsSync(nextPath)) {
          writeFileSync(nextPath, `# NEXT — offene Punkte für den nächsten Agenten\n\n${bullets}\n`, 'utf8');
          touched.push('NEXT.md angelegt');
        } else {
          const current = readFileSync(nextPath, 'utf8');
          const lines = current.split('\n');
          const firstHeading = lines.findIndex((l) => l.startsWith('# '));
          lines.splice(firstHeading + 1, 0, bullets);
          writeFileSync(nextPath, lines.join('\n'), 'utf8');
          touched.push(`NEXT.md ergänzt (${bullets.split('\n').length} Z.)`);
        }
      }
      const files = [entry && 'RESULTS.md', bullets && 'NEXT.md'].filter(Boolean);
      git(s.repo, 'add', ...files);
      git(s.repo, 'commit', '--no-verify', '-m',
        `docs: Session-Handoff aus Vibe-Session ${s.sessionId} (${TODAY})\n\nAutomatisch vom fill-session-docs-Dienst: RESULTS.md/NEXT.md fortgeschrieben, damit der nächste Agent ohne das Session-Transcript weiterarbeiten kann. Nur Doku, kein Code.`);
      console.log(`  committet: ${touched.join(', ')}. Kein Push.`);
      filled++;
    } catch (e) {
      console.error(`  Commit fehlgeschlagen — Dateien teils geschrieben, bitte prüfen: ${e.message}`);
    }
  }
  if (!dryRun) saveLastRun();
  console.log(`Fertig: ${filled}/${sessions.length} Repos gefüllt.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
