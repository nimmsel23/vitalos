#!/usr/bin/env node
/**
 * docs-sync.mjs — MANUELLES CTO-Werkzeug: RESULTS/NEXT aus Commit-Reichweiten.
 *
 * Owner-Entscheidung 2026-11-07: Der nächtige Lauf BAUT keine Doku mehr — der
 * jeweils aktive Agent, der committet, zieht die Docs sofort mit eigenem
 * Kontext nach (post-commit-Erinnerung über das Hilfsskript vos-docs-dirty,
 * siehe ~/AGENTS.md-Regel). Dieses Skript läuft NICHT mehr im Dienst, sondern
 * nur noch auf CTO-Anweisung als Rückfall-Linie, wenn jemand Marker liegen
 * lässt (vos-docs-dirty list): Es verarbeitet pendente Marker anhand der
 * Commit-Reichweite seit dem zuletzt dokumentierten SHA.
 *
 * lässt (vos-docs-dirty list): Es liest je pending-Slug die Commit-Reichweite
 * seit dem zuletzt dokumentierten SHA, lässt die Engine-Kette
 * (auto-doc-engines.mjs) einen RESULTS.md-Eintrag im bestehenden Format
 * schreiben, committet NUR diese Dateien (--no-verify) im zugehörigen
 * Submodule-Checkout und räumt die Marke mit dem dokumentierten SHA ab.
 *
 * Docs-Ziel: ausschließlich Submodule-Checkouts des Meta-Repos — dasselbe
 * Set, das thin-results.mjs ausdünnt.
 *
 * Guards: Reichweite leer → nur abreissen; Parse-/Engine-Fehler → Marke
 * bleibt liegen (nächster Lauf wiederholt); Commit-Fehler → Marke bleibt.
 *
 * Aufruf:
 *   node docs-sync.mjs [--dry-run] [--status] [--slug <slug>]
 *     --slug: nur dieses Repo verarbeiten (Test).
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEngineChain } from './auto-doc-engines.mjs';

const META = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STATE_DIR = resolve(homedir(), '.local/state/vitalos-docs');
const PENDING = join(STATE_DIR, 'pending');
const DONE = join(STATE_DIR, 'done');
const TODAY = new Date().toISOString().slice(0, 10);
const LOG_CAP = 6000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const statusOnly = args.includes('--status');
const slugIdx = args.indexOf('--slug');
const onlySlug = slugIdx >= 0 ? args[slugIdx + 1] : null;

function git(path, ...gitArgs) {
  return execFileSync('git', gitArgs, { cwd: path, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }).trim();
}

/** slug -> Submodule-Pfad im Meta-Repo, aus .gitmodules (url-Basisname = slug). */
function submoduleSlugMap() {
  const map = {};
  const raw = git(META, 'config', '-f', '.gitmodules', '--list');
  const bySection = {};
  for (const line of raw.split('\n')) {
    let m = line.match(/^submodule\.(.+)\.path=(.+)$/);
    if (m) bySection[m[1]] = { path: m[2] };
    m = line.match(/^submodule\.(.+)\.url=(.+)$/);
    if (m && bySection[m[1]]) {
      bySection[m[1]].url = m[2];
    }
  }
  for (const { path, url } of Object.values(bySection)) {
    const slug = url && basename(url.replace(/\.git$/, ''));
    if (slug) map[slug] = path;
  }
  return map;
}

function hasConvention(repoPath) {
  return existsSync(join(repoPath, 'RESULTS.md')) || existsSync(join(repoPath, 'NEXT.md'));
}

function readMarker(slug) {
  const raw = readFileSync(join(PENDING, slug), 'utf8').split('\n');
  return { top: raw[0], sha: raw[1], at: raw[2] };
}

function clearMarker(slug, sha) {
  mkdirSync(DONE, { recursive: true });
  writeFileSync(join(DONE, slug), sha + '\n', 'utf8');
  if (existsSync(join(PENDING, slug))) execFileSync('rm', [join(PENDING, slug)]);
}

function commitRange(top, doneSha, sha) {
  let out = null;
  if (doneSha && doneSha !== sha) {
    try { out = git(top, 'log', '--no-merges', '--date=short', '--format=%h|%ad|%s|%b', `${doneSha}..${sha}`); }
    catch { out = null; } // doneSha nach Rebase verloren — Fallback letzte 15
  }
  if (!out) out = git(top, 'log', '-n', '15', '--no-merges', '--date=short', '--format=%h|%ad|%s|%b', `${sha}`);
  return out.split('\n').slice(0, LOG_CAP).join('\n').slice(0, LOG_CAP);
}

function resultsPrompt(slug, range, resultsHead, nextHead) {
  return `Du bist Arbeitslog-Schreiber für das VitalOS-Repo "${slug}". Der post-commit-Marker des Repos hat folgende Commits seit der letzten Doku-Erfassung gemeldet (Format h|datum|subject|body):

${range}

Aufgaben:
1. results_entry: EIN neuer RESULTS.md-Eintrag, der diese Commits zusammenfasst. Format exakt wie die bestehenden Einträge (Auszug unten): "# <Kurztitel> (${TODAY})", kurzer Prolog-Absatz, Bullet-Liste mit **Fett**-Markierung der betroffenen Datei/Komponente, am Ende eine "---"-Trennzeile. Nur Commits mit Substanz aufnehmen (Docs-Kommits, die diese Doku selbst betreffen, NICHT als eigenen Punkt verwerten). Wenn die Commits keine nennenswerte Änderung tragen (z. B. nur Pipeline-Noise): leeren String.
2. next_bullets: Offenes, das die Commit-Bodies explizit als offen/TODO/follow-up markieren, als Markdown-Bullets im Stil der NEXT.md (Auszug unten). Nichts offen: leeren String.

Antworte AUSSCHLIESSLICH mit einem JSON-Objekt ohne Markdown-Zaun:
{"results_entry": "<markdown oder ''>", "next_bullets": "<markdown oder ''>"}

Vorhandene RESULTS.md (Anfang):
${resultsHead}

Vorhandene NEXT.md (Anfang):
${nextHead}`;
}

function prependEntry(filePath, entry, createHeader) {
  if (!existsSync(filePath)) {
    writeFileSync(filePath, `${createHeader}\n\n${entry}`, 'utf8');
    return 'angelegt';
  }
  const lines = readFileSync(filePath, 'utf8').split('\n');
  const firstHeading = lines.findIndex((l) => l.startsWith('# '));
  if (firstHeading === -1) {
    writeFileSync(filePath, entry + '\n' + lines.join('\n'), 'utf8');
  } else {
    lines.splice(firstHeading, 0, entry.trimEnd());
    writeFileSync(filePath, lines.join('\n'), 'utf8');
  }
  return 'erweitert';
}

function insertBullets(nextPath, bullets) {
  if (!existsSync(nextPath)) {
    writeFileSync(nextPath, `# NEXT — offene Punkte für den nächsten Agenten\n\n${bullets}\n`, 'utf8');
    return 'angelegt';
  }
  const lines = readFileSync(nextPath, 'utf8').split('\n');
  const firstHeading = lines.findIndex((l) => l.startsWith('# '));
  lines.splice(firstHeading === -1 ? 0 : firstHeading + 1, 0, bullets);
  writeFileSync(nextPath, lines.join('\n'), 'utf8');
  return 'ergänzt';
}

function slugStage(slug, map) {
  const sub = map[slug];
  if (!sub) return { error: `kein Submodule-Ziel für "${slug}" — Marke bleibt liegen` };
  const target = join(META, sub);
  if (!existsSync(target)) return { error: `Submodule-Checkout fehlt: ${target}` };
  if (!hasConvention(target)) return { error: `${sub}: keine RESULTS/NEXT-Konvention — Marke bleibt liegen` };
  const marker = readMarker(slug);
  const doneSha = existsSync(join(DONE, slug)) ? readFileSync(join(DONE, slug), 'utf8').trim() : null;
  const range = commitRange(marker.top, doneSha, marker.sha);
  if (!range.trim()) return { cleared: true, note: 'keine neuen Commits — nur Marke abgerissen' };
  return { slug, sub, target, marker, range };
}

async function main() {
  mkdirSync(PENDING, { recursive: true });
  const map = submoduleSlugMap();
  const slugs = (onlySlug ? [onlySlug] : readdirSync(PENDING).filter((s) => !s.startsWith('.'))).sort();
  if (!slugs.length) { console.log('Keine pending-Marker — nichts zu tun (Commits melden sich selbst per post-commit-Hook).'); return; }
  for (const slug of slugs) {
    const st = slugStage(slug, map);
    if (st.error) { console.log(`- ${slug}: SKIP ${st.error}`); continue; }
    if (st.cleared) { console.log(`- ${slug}: ${st.note}`); if (!dryRun && !statusOnly) clearMarker(slug, st.marker.sha); continue; }
    console.log(`- ${slug} → ${st.sub} (Marke ${st.marker.sha.slice(0, 7)}, Reichweite ${st.range.split('\n').filter((l) => l.includes('|')).length} Commits)`);
    if (statusOnly) continue;
    const resultsPath = join(st.target, 'RESULTS.md');
    const nextPath = join(st.target, 'NEXT.md');
    const resultsHead = existsSync(resultsPath) ? readFileSync(resultsPath, 'utf8').split('\n').slice(0, 60).join('\n') : '(nicht vorhanden)';
    const nextHead = existsSync(nextPath) ? readFileSync(nextPath, 'utf8').split('\n').slice(0, 40).join('\n') : '(nicht vorhanden)';
    process.stdout.write(`  ${st.sub}: frage Engine-Kette … `);
    let out;
    try {
      ({ out } = await runEngineChain(resultsPrompt(slug, st.range, resultsHead, nextHead),
        { stateDir: STATE_DIR, onStage: (name, err) => { if (err) console.log(`[${name}: ${err}] `); } }));
      console.log('ok.');
    } catch (e) { console.log(e.message); continue; } // Marke bleibt, nächster Lauf wiederholt
    const entry = (out.results_entry || '').trim();
    const bullets = (out.next_bullets || '').trim();
    if (!entry && !bullets) { console.log('  nichts Relevantes — Marke wird trotzdem abgerissen (Commits dokumentiert).'); }
    if (dryRun) { console.log(`  [dry-run] entry ${entry.length} Z., NEXT ${bullets.length} Z. — kein Schreiben.`); continue; }
    const touched = [];
    try {
      if (entry) touched.push(`RESULTS.md ${prependEntry(resultsPath, `${entry}\n`, `# RESULTS — Arbeitslog\n\n(angelegt vom docs-sync am ${TODAY})`)} (${entry.split('\n').length} Z.)`);
      if (bullets) touched.push(`NEXT.md ${insertBullets(nextPath, bullets)} (${bullets.split('\n').length} Z.)`);
      if (entry || bullets) {
        git(st.target, 'add', ...(entry && bullets ? ['RESULTS.md', 'NEXT.md'] : [entry ? 'RESULTS.md' : 'NEXT.md']));
        git(st.target, 'commit', '--no-verify', '-m', `docs: Commit-Sync ${slug} ${st.marker.sha.slice(0, 7)} (${TODAY})\n\nAutomatisch vom docs-sync-Dienst: Marker der letzten Commits verarbeitet. Nur Doku, kein Code.`);
      }
      clearMarker(slug, st.marker.sha);
      console.log(`  committet: ${touched.join(', ') || 'keine Änderung'}. Marke abgerissen. Kein Push.`);
    } catch (e) {
      console.error(`  Commit fehlgeschlagen — Marke bleibt liegen: ${e.message}`);
    }
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
