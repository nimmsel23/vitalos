#!/usr/bin/env node
/**
 * thin-results.mjs — tägliche RESULTS.md-Hygiene in den Submodulen des
 * Submodule des Meta-Repos (~/vitalos). NICHT die ~/dev/*-dev-Worktrees —
 * die sind aktive Entwicklungscheckouts und bleiben unberührt ("dev is ja eh dev").
 *
 * Pro Submodule-Checkout (~/vitalos/<path>, sauberer Worktree, RESULTS.md
 * ab THRESHOLD Zeilen, HEAD im .gitmodules-Branch von origin enthalten):
 *   1. Die aktive Engine destilliert dauerhaft relevantes Wissen aus
 *      RESULTS.md → wird der ARCHITECTURE.md NUR ANGEHÄNGT (nie umgeschrieben;
 *      fehlt sie, wird sie angelegt).
 *   2. Dieselbe Antwort enthält eine ausgedünnte RESULTS.md (offene Punkte +
 *      aktuelle Notizen; Abgeschlossenes nur noch im Destillat).
 *   2b. PATTERNS.md: wiederkehrende Fehler/Muster ("Jahreszeiten-Fehler")
 *      werden erkannt und die Datei pro Lauf fortgeführt (Upsert).
 *   2c. Sicherheitsnetz OHNE Modell: jede offene TODO/FIXME/"offen"-Zeile der
 *      alten RESULTS muss in neuer RESULTS, Destillat oder PATTERNS überleben;
 *      sonst stoppt der Bot sie zurück in die RESULTS.
 *   3. Der Checkout wird dafür auf seinen .gitmodules-Branch (z. B.
 *      vitalos) gestellt, Commit NUR der drei
 *      Doku-Dateien (--no-verify), KEIN Push.
 *   4. Zentraler Lauf-Digest in docs/AUTO-DOC.md des Meta-Repos (committed,
 *      kein Push).
 *   5. Der Gitlink im Meta-Repo bleibt BEWUSST ungebumpst: die Bot-Commits
 *      sind lokal-only und reisen mit dem nächsten Skill-Release (Branch-Push)
 *      nach draußen. Pointer nicht vor dem Push bumpen (fatal: not our ref).
 *
 * Guards: dirty Worktree, Detached-HEAD ohne Branchzugehörigkeit, fehlende
 * RESULTS.md, Zeilenschwelle, JSON/Parse-Fehler → Repo bleibt unverändert.
 * Lock via flock gegen überlappende Läufe.
 *
 * Aufruf:
 *   node thin-results.mjs                     # normaler Lauf (schreibt + committet)
 *   node thin-results.mjs --engine gemini     # nur Gemini-API statt Engine-Kette
 *   node thin-results.mjs --dry-run           # plant nur, schreibt nichts
 *   node thin-results.mjs --status            # zeigt nur, was anfallen würde
 *   node thin-results.mjs --repo journal-app  # einzelnes Submodule
 *
 * Engine-Kette (reine Textgenerierung, keine Tools → kann nichts anderes
 * anfassen; pro Repo fällt der Lauf bei Ausfall auf die nächste Stufe):
 *   1. claude -p --model haiku
 *   2. codex exec -m luna (read-only-Sandbox; verfügbar, sobald das Konto luna Zugriff gibt)
 *   3. vibe --model mistral-medium-3.5 (agent ask, headless)
 * Manuell zusätzlich: --engine gemini (Key/Modell aus ~/.env/, gemini.env zuerst).
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, openSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEngineChain } from './auto-doc-engines.mjs';

// Meta-Repo-Wurzel: prod/scripts/ → zwei Ebenen aufwärts.
const META = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SUBMODULES = ['fitness-app', 'fuel-app', 'journal-app', 'habit-app', 'learn-app',
                    'relax-app', 'plan-app', 'skills-app', '6pack-app'];
const THRESHOLD_LINES = 150;
const TODAY = new Date().toISOString().slice(0, 10);
const STATE_DIR = resolve(homedir(), '.local/state/vitalos-thin-results');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const statusOnly = args.includes('--status');
const engineArg = args.find((a, i) => args[i - 1] === '--engine'); // 'gemini' erzwingt die API-Engine statt der Kette
const repoArg = args.find((a, i) => args[i - 1] === '--repo');
const repos = repoArg ? [repoArg] : SUBMODULES;

function git(path, ...gitArgs) {
  return execFileSync('git', gitArgs, { cwd: path, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }).trim();
}

function submoduleBranches() {
  const raw = git(META, 'config', '-f', '.gitmodules', '--list').split('\n');
  const byPath = {};
  for (const line of raw) {
    const m = line.match(/^submodule\.(.+)\.path=(.+)$/);
    if (m) byPath[line.split('=')[1]] = { section: m[1] };
  }
  for (const line of raw) {
    const m = line.match(/^submodule\.(.+)\.branch=(.+)$/);
    if (m) for (const [path, entry] of Object.entries(byPath)) {
      if (entry.section === m[1]) entry.branch = m[2];
    }
  }
  return byPath;
}

function planRepo(entry) {
  const path = join(META, entry.repo);
  const resultsPath = join(path, 'RESULTS.md');
  if (!existsSync(path)) return { repo: entry.repo, action: 'skip', reason: 'Checkout fehlt' };
  if (!existsSync(resultsPath)) return { repo: entry.repo, action: 'skip', reason: 'keine RESULTS.md' };
  const lines = readFileSync(resultsPath, 'utf8').split('\n').length;
  if (lines < THRESHOLD_LINES) return { repo: entry.repo, action: 'skip', reason: `nur ${lines} Zeilen (< ${THRESHOLD_LINES})` };
  if (git(path, 'status', '--porcelain') !== '') return { repo: entry.repo, action: 'skip', reason: 'Worktree nicht sauber' };
  const branch = entry.branchInfo?.branch;
  if (!branch) return { repo: entry.repo, action: 'skip', reason: 'kein branch= in .gitmodules' };
  const head = git(path, 'rev-parse', 'HEAD');
  const containing = git(path, 'branch', '-r', '--contains', head).split('\n').filter(Boolean);
  if (!containing.includes(`origin/${branch}`)) {
    return { repo: entry.repo, action: 'skip', reason: `Gitlink-Commit nicht auf origin/${branch}` };
  }
  return { repo: entry.repo, action: 'process', lines, path, resultsPath, branch };
}

function prompt(resultsContent, repoName, existingPatterns, docCandidates) {
  return `Du bist Dokumentations-Archivar für das Submodule-Checkout "${repoName}" (VitalOS-Produkt-Checkout, deutsche Doku).
Die Datei RESULTS.md ist ein gewachsener Arbeitslog. Drei Aufgaben:

1. DESTILLAT → THEMATISCH PASSENDE ZIEL-DOCS: Extrahiere daraus das dauerhaft relevante
   Wissen — Architektur-Entscheidungen, etablierte Muster, Abläufe, Stolpersteine,
   abgeschlossene Errungenschaften, die man beim Weiterarbeiten wissen muss. Keine offenen
   Aufgaben, kein Prozess-Talk. Knapp, stichpunktartig, deutsch.
   VERTEILE es thematisch auf die BESTEHENDEN Doku-Dateien der Kandidatenliste ("file" exakt
   wie angegeben) — die Liste zeigt pro Datei Erstzeile und Themen-Überschriften, wähle
   danach. Die Liste umfasst auch TIEFERE, verzeichnisspezifische Doks (z. B. AGENTS.md oder
   ARCHITECTURE.md in Unterordnern): Wissen zu einem Modul gehört in das SPEZIFISCHSTE
   passende Verzeichnis-Dok, allgemeines Wissen in übergeordnete Doks.
   Für ein klar umrissenes Thema OHNE passendes Zuhause DARfst du EINE neue Root-Doku-Datei
   mit konventionellem Thementitel anlegen (SCREAMING-KEBAB.md, z. B. DEPLOY.md, FIREBASE.md,
   AUTH.md, PUSH.md) — neue Dateien nur im Root, nur wenn die Kandidaten dafür wirklich nichts
   hergeben, sonst bestehende erweitern.
   Passt nichts ( weder Kandidat noch sinnvolles neues Themen-Dok): "ARCHITECTURE.md"
   (wird dann ggf. angelegt).

2. RESULTS.md AUSGEDÜNNT: Behalte nur offene Punkte, aktive Arbeit und Notizen der ungefähren
   letzten 14 Tage (im Text erkennbar). Abgeschlossenes fließt NUR in die Ziel-Docs. Behalte den
   Stil der Datei (Markdown). Starte mit dem Marker:
   "# RESULTS — Arbeitslog (ausgedünnt ${TODAY}; Destillat in den Doku-Dateien des Repos)"
   Danach die verbliebenen offenen Punkte; wenn nichts offen: Marker plus "## Offen\n- (nichts offen)".

3. PATTERNS — WIEDERKEHRENDE FEHLER UND MUSTER: Erkennt aus RESULTS.md Fehler und Probleme,
   die MEHRFACH oder PERIODISCH auftauchen (Datums-Hinweise im Text beachten: saisonal/wiederkehrend
   gilt als Muster). Gibt es bereits PATTERNS.md-Inhalt (siehe unten), pflege ihn FORT: bestehende
   Einträge behalten und um neue Vorkommnisse ergänzen, Duplikate zusammenführen, gelöste Muster
   entfernen — ansonsten lege die Datei neu an. Format je Eintrag:
   "### <Muster-Titel>\\nVorkommnisse: <Datumsangaben aus dem Log>; Lektion/Gegenmaßnahme: <kurz>\\n"
   Wenn kein Muster erkennbar: leere Sektion mit "- (keine wiederkehrenden Muster erkannt)".

Antworte AUSSCHLIESSLICH mit einem einzigen JSON-Objekt, ohne Markdown-Zaun:
{"sections": [{"file": "<Pfad aus der Kandidatenliste oder ARCHITECTURE.md>", "content": "<markdown-Abschnitt>"}],
 "results_thinned": "<markdown>", "patterns_md": "<markdown>"}

Kandidaten-Liste der vorhandenen Doku-Dateien (file; erste Zeile zur Orientierung):
${docCandidates}

${existingPatterns ? `Bestehende PATTERNS.md (FORTFÜHREN, nicht neu erfinden):\n\n${existingPatterns}\n` : ''}
RESULTS.md folgt vollständig:

${resultsContent}`;
}

// Vorhandene thematischen Ziel-Docs des Repos sammeln (Root *.md + docs/*.md),
// ohne Arbeits-/Queue-Dateien und ohne bereits automatisch gepflegte Dateien.
// Arbeits-/Queue-Dateien kommen nie als Ziel in Frage (Basename, auf jeder Ebene).
// Die Root-ARCHITECTURE.md ist bewusst kein Kandidat: sie ist der legale Fallback
// für Wissen ohne passendes Ziel-Doc. Verschachtelte ARCHITECTURE.md und
// AGENTS.md (z. B. src/views/*/ARCHITECTURE.md) sind Kandidaten.
const DESTINATION_EXCLUDE = new Set(['RESULTS.md', 'NEXT.md', 'PATTERNS.md', 'TODO.md', 'AUTO-DOC.md']);
const SKIP_DIRS = new Set(['.git', 'node_modules', '.worktrees', '.idea', '.firebase', 'dist', 'dist-firebase', 'dist-store', 'dist-native', 'dist-observe', 'dist-operate', 'build', '.cache', 'archive', 'archiv']);
const MAX_DEPTH = 3;
const MAX_CANDIDATES = 40;
const COLLECT_CAP = 250;
// Dok-Typ-Priorität: Struktur-/Agenten-Doks zuerst, dann READMEs, dann Rest.
// So landen verzeichnistiefe ARCHITECTURE.md/AGENTS.md sicher in der Liste,
// auch wenn ein Repo viele thematische Doks hat.
function docScore(name) {
  if (name === 'ARCHITECTURE.md' || name === 'AGENTS.md' || name === 'CLAUDE.md') return 0;
  if (name === 'README.md' || name === 'DEPLOYMENT.md' || name === 'DEPLOY.md') return 1;
  return 2;
}

function docCandidatesFor(repoPath) {
  const out = [];
  const walk = (dir, relDir, depth) => {
    if (depth > MAX_DEPTH || out.length >= COLLECT_CAP) return;
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const e of entries) {
      if (out.length >= COLLECT_CAP) return;
      if (e.isDirectory()) {
        if (e.name.startsWith('.') || e.name.startsWith('dist')) continue;
        if (SKIP_DIRS.has(e.name)) continue;
        walk(join(dir, e.name), relDir ? `${relDir}/${e.name}` : e.name, depth + 1);
      } else if (e.isFile() && e.name.endsWith('.md')) {
        if (DESTINATION_EXCLUDE.has(e.name)) continue;
        if (depth === 0 && e.name === 'ARCHITECTURE.md') continue; // Root nur als Fallback
        const rel = relDir ? `${relDir}/${e.name}` : e.name;
        let hint = '';
        try {
          const lines = readFileSync(join(dir, e.name), 'utf8').split('\n');
          const first = (lines.find((l) => l.trim().length > 0) || '').slice(0, 90);
          const headings = lines.filter((l) => l.startsWith('#')).slice(0, 10).join(' ; ').slice(0, 160);
          hint = first + (headings ? ` | Themen: ${headings}` : '');
        } catch { /* leere Datei */ }
        out.push({ rel, depth, score: docScore(e.name), hint });
      }
    }
  };
  walk(repoPath, '', 0);
  out.sort((a, b) => a.score - b.score || a.depth - b.depth || a.rel.localeCompare(b.rel));
  return out.slice(0, MAX_CANDIDATES).length
    ? out.slice(0, MAX_CANDIDATES).map((c) => `- ${c.rel} — ${c.hint}`).join('\n')
    : '(keine thematischen Doku-Dateien gefunden)';
}


async function main() {
  mkdirSync(STATE_DIR, { recursive: true });
  const lockFd = openSync(join(STATE_DIR, 'run.lock'), 'w');
  try { execFileSync('flock', ['-n', String(lockFd), 'true']); }
  catch { console.error('Es läuft bereits eine Instanz — Abbruch.'); process.exit(1); }

  const branchInfo = submoduleBranches();
  const plans = repos.map((repo) => planRepo({ repo, branchInfo: branchInfo[repo] }));
  for (const p of plans) {
    console.log(`${p.repo}: ${p.action === 'process' ? `verarbeiten (${p.lines} Zeilen, Branch ${p.branch})` : `skip (${p.reason})`}`);
  }
  if (statusOnly) return;

  const processed = [];
  for (const p of plans.filter((x) => x.action === 'process')) {
    const oldResults = readFileSync(p.resultsPath, 'utf8');
    const patternsPath = join(p.path, 'PATTERNS.md');
    const existingPatterns = existsSync(patternsPath) ? readFileSync(patternsPath, 'utf8') : null;
    const docCandidates = docCandidatesFor(p.path);
    process.stdout.write(`${p.repo}: frage Engine-Kette … `);
    let out;
    let usedEngine;
    try {
      ({ out, usedEngine } = await runEngineChain(
        prompt(oldResults, p.repo, existingPatterns, docCandidates),
        { engineArg, stateDir: STATE_DIR, onStage: (name, err) => { if (err) console.log(`[${name} nicht verfügbar: ${err}] `); } }));
      if (!Array.isArray(out.sections) || !out.sections.length
          || typeof out.results_thinned !== 'string' || typeof out.patterns_md !== 'string') {
        throw new Error('Antwort ohne sections/results_thinned/patterns_md');
      }
      console.log(`ok (${usedEngine}).`);
    } catch (e) {
      console.log(e.message);
      continue;
    }

    // Pfad-Validierung der gewählten Ziel-Docs: existierende Dateien aus dem
    // Checkout, ODER (max. eine) neue konventionelle Themen-Datei im Root
    // (SCREAMING-KEBAB.md). ARCHITECTURE.md im Root bleibt legaler Fallback.
    const NEW_ROOT_DOC = /^[A-Z0-9][A-Z0-9-]*\.md$/;
    let newDocsUsed = 0;
    const wantedDestinations = [];
    for (const s of out.sections) {
      if (typeof s?.file !== 'string' || typeof s?.content !== 'string' || !s.content.trim()) continue;
      const rel = resolve(p.path, s.file);
      if (rel !== p.path && !rel.startsWith(p.path + '/')) continue;
      if (!rel.endsWith('.md')) continue;
      const rootRel = relative(p.path, rel);
      const isRootFile = !rootRel.includes('/');
      const isExcluded = DESTINATION_EXCLUDE.has(rootRel.split('/').pop());
      if (existsSync(rel)) {
        if (isExcluded) continue;
        wantedDestinations.push({ rel, content: s.content.trim(), isNew: false });
      } else if (isRootFile && NEW_ROOT_DOC.test(rootRel) && !isExcluded && newDocsUsed === 0) {
        wantedDestinations.push({ rel, content: s.content.trim(), isNew: true, name: rootRel });
        newDocsUsed += 1;
      }
    }
    if (!wantedDestinations.length) {
      console.log('  keine gültigen Ziel-Docs in der Antwort — Checkout bleibt unverändert.');
      continue;
    }

    // Sicherheitsnetz (deterministisch, kein Modell): jede offene Zeile der alten
    // RESULTS muss in der neuen RESULTS, in den Ziel-Docs oder in PATTERNS überleben.
    const openGuardRe = /(offen|TODO|FIXME|klärung nötig|unklar)/i;
    const oldOpen = [...new Set(oldResults.split('\n')
      .filter((l) => openGuardRe.test(l) && l.trim().length > 12))];
    let guarded = 0;
    if (oldOpen.length) {
      const corpus = `${out.results_thinned}\n${out.patterns_md}\n${wantedDestinations.map((d) => d.content).join('\n')}`.toLowerCase();
      const lost = oldOpen
        .filter((l) => !corpus.includes(l.trim().toLowerCase().slice(0, 40)));
      if (lost.length) {
        guarded = lost.length;
        out.results_thinned = out.results_thinned.trimEnd()
          + `\n\n## Offen (Sicherheitsnetz ${TODAY}: vom Bot zurückgestopft, in den Ziel-Docs nicht auffindbar)\n`
          + lost.map((l) => `- ${l.trim().replace(/^[-*]\s*/, '')}`).join('\n') + '\n';
        console.log(`  Sicherheitsnetz: ${lost.length} offene Zeile(n) zurückgestopft.`);
      }
    }

    if (dryRun) {
      console.log(`  [dry-run] Ziel-Docs: ${wantedDestinations.map((d) => `${relative(p.path, d.rel)} (${d.content.length} Z.)`).join(', ')}; RESULTS dünn ${out.results_thinned.length} Z.; Patterns ${out.patterns_md.length} Z. — kein Schreiben.`);
      continue;
    }
    for (const d of wantedDestinations) {
      const header = `\n\n## Destillat aus der RESULTS.md (${TODAY})\n\nKurzfassung dauerhaft relevanten Wissens aus dem früheren Arbeitslog, thematisch einsortiert vom thin-results-Dienst.\n\n`;
      if (!d.isNew && existsSync(d.rel)) {
        writeFileSync(d.rel, readFileSync(d.rel, 'utf8').replace(/\s+$/, '') + header + d.content + '\n', 'utf8');
      } else if (d.name === 'ARCHITECTURE.md') {
        writeFileSync(d.rel, `# ARCHITECTURE — ${p.repo}\n\nStruktur- und Wissensdokumentation dieses Submodules. Angelegt automatisch am ${TODAY}, weil die RESULTS.md dafür keinen thematisch passenderen Ziel-Doc fand; bei passenden Änderungen mitschreiben (Regel der VitalOS AGENTS.md).${header}${d.content}\n`, 'utf8');
        console.log(`  neues Themen-Doc: ${d.name}`);
      } else {
        writeFileSync(d.rel, `# ${d.name.replace('.md', '')}\n\nThemen-Doku, angelegt vom thin-results-Dienst am ${TODAY} aus dem Destillat der RESULTS.md (kein passendes Zuhause vorhanden); proaktiv mitschreiben (Regel der VitalOS AGENTS.md).${header}${d.content}\n`, 'utf8');
        console.log(`  neues Themen-Doc: ${d.name}`);
      }
    }
    writeFileSync(p.resultsPath, out.results_thinned.trim() + '\n', 'utf8');
    writeFileSync(patternsPath, out.patterns_md.trim() + '\n', 'utf8');
    try {
      const wasDetached = (git(p.path, 'branch', '--show-current') === '');
      git(p.path, 'checkout', '-q', p.branch);
      const addFiles = ['RESULTS.md', 'PATTERNS.md',
        ...wantedDestinations.map((d) => relative(p.path, d.rel))];
      git(p.path, 'add', ...addFiles);
      git(p.path, 'commit', '--no-verify', '-m',
        `docs: RESULTS.md ausgedünnt, Wissen in thematisch passende Doku-Dateien destilliert (${TODAY})\n\nAutomatisierter Tageslauf des thin-results-Dienstes (VitalOS Meta-Repo), Engine ${usedEngine}. Nur Doku, kein Code. Gitlink im Meta-Repo bleibt bewusst ungebumpst bis zum nächsten Skill-Release.`);
      const sha = git(p.path, 'rev-parse', '--short', 'HEAD');
      const patternTitles = out.patterns_md.split('\n').filter((l) => l.startsWith('### ')).map((l) => l.slice(4).trim());
      const destinations = wantedDestinations.map((d) => relative(p.path, d.rel));
      processed.push({ repo: p.repo, engine: usedEngine, before: p.lines,
        after: out.results_thinned.split('\n').length, guarded, patternTitles, destinations });
      console.log(`  committet ${sha} auf ${p.branch} (${wasDetached ? 'Checkout war detached am Gitlink, jetzt auf Branch' : ''} RESULTS.md ${p.lines} → ${out.results_thinned.split('\n').length} Zeilen, PATTERNS.md ${patternTitles.length} Muster, Ziel-Docs: ${destinations.join(', ')}). Kein Push; Gitlink bleibt ungebumpst.`);
    } catch (e) {
      console.error(`  Commit fehlgeschlagen — Dateien geschrieben, bitte prüfen: ${e.message}`);
    }
  }

  // Zentraler Digest im Meta-Repo: Laufprotokoll + Muster je Repo.
  if (!dryRun && !statusOnly && processed.length) {
    const digestPath = join(META, 'docs/AUTO-DOC.md');
    mkdirSync(join(META, 'docs'), { recursive: true });
    const base = existsSync(digestPath)
      ? readFileSync(digestPath, 'utf8').replace(/\s+$/, '')
      : `# VitalOS Auto-Doc — Laufprotokoll des thin-results-Dienstes\n\nTägliche Doku-Hygiene (systemd \`vitalos-thin-results\`, Skript \`scripts/thin-results.mjs\`). Pro Lauf: RESULTS.md der Submodule ausdünnen, Destillat in die vom Modell gewählten thematisch passenden Doku-Dateien des Repos (Fallback ARCHITECTURE.md), wiederkehrende Fehler nach PATTERNS.md, offene Punkte bleiben garantiert erhalten (Sicherheitsnetz). Regeln: \`AGENTS.md\`.`;
    const skipped = plans.filter((x) => x.action === 'skip').map((x) => `${x.repo} (${x.reason})`).join(', ');
    const section = `\n\n## Lauf ${TODAY}\n\n${processed.map((r) => `### ${r.repo} — Engine ${r.engine}\n- RESULTS.md ${r.before} → ${r.after} Zeilen${r.guarded ? `; Sicherheitsnetz: ${r.guarded} offene Punkte zurückgestopft` : ''}\n- PATTERNS.md Muster: ${r.patternTitles.length ? r.patternTitles.join(' · ') : 'keine'}\n- Ziel-Docs: ${r.destinations.join(' · ')}\n`).join('')}Skips: ${skipped || 'keine'}\n`;
    writeFileSync(digestPath, base + section, 'utf8');
    try {
      git(META, 'add', 'docs/AUTO-DOC.md');
      git(META, 'commit', '--no-verify', '-m',
        `docs(auto-doc): Laufprotokoll ${TODAY} — ${processed.length} Submodule verarbeitet\n\nAutomatisch vom thin-results-Dienst committed (dev, kein Push).`,
        '--', 'docs/AUTO-DOC.md');
      console.log(`Digest: docs/AUTO-DOC.md committet (${processed.length} Repos).`);
    } catch (e) {
      console.error(`Digest-Commit fehlgeschlagen (Datei geschrieben): ${e.message}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
