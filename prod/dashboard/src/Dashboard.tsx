'use client';
import {useState, useEffect} from 'react';
import {
  Task,
  SNAPSHOT,
  KW,
  areas,
  summaries,
  tasks,
  phases,
  history,
  changes,
  evidence,
  roles,
  timers,
  workspaces,
  businessOffers,
} from './data';

const views = ['Überblick', 'Fitness', 'Organisation', 'Betrieb', 'Roadmap', 'Wochenansicht', 'Business', 'Stack & Varianten'] as const;
type View = (typeof views)[number];

const statusClass = (s: string) =>
  s === 'Erledigt' ? 'done' : s === 'Blockiert' ? 'blocked' : s === 'Unbekannt' ? 'unknown' : 'open';

const timerClass = (s: 'ok' | 'fail' | 'watch') => (s === 'ok' ? 'done' : s === 'fail' ? 'blocked' : 'unknown');

const fitnessDecisions = [
 ['Anfänger zuerst','Bestätigt','P0','Angeleitet ins Training starten und den eigenen Körper besser verstehen.','Erstes Workout ohne zusätzliche Erklärung beginnen können.'],
 ['Coach-Plan oder Vorlage','Bestätigt','P0','Ein bereitgestellter Coach-Plan oder ein vorgefertigtes Workout gibt den Einstieg.','Umfang der Planerstellung und Zuweisung durch Coaches klären.'],
 ['Explizit bestätigen','Bestätigt','P0','Übungen und Sätze abhaken; Eingaben und Korrekturen bleiben möglich. Planwerte sind keine automatisch absolvierten Werte.','Abhaken, Ändern und Überspringen im Ablauf konkretisieren.'],
 ['Freiwillige Detailtiefe','Bestätigt','P0','Auch ein Split ohne Übungen ist ein gültiger Eintrag. Auswertungen bleiben auf die vorhandenen Daten begrenzt.','Für jede Eingabestufe nachvollziehbare Auswertungen definieren.'],
 ['Zwei Trainingsmodi','Bestätigt','P1','Skills-Runner für Zirkel, Calisthenics und Sixpack; freies Logging über vorausgefüllte Session oder Plan-Tab.','Beide Abläufe an einem Beispielworkout durchspielen.'],
 ['Gemeinsamer Session-Kern','Vorschlag','P1','Beide Modi könnten denselben Plan, dieselben Bestätigungen und dieselbe Historie nutzen.','Mit vorhandener Architektur abgleichen; noch keine Umsetzung bestätigt.'],
 ['Belastung & Superkompensation','Offen','P1','Muskelvisualisierung und relative Superkompensationswerte gehören zur ursprünglichen Vision. Modell, Datenbasis und Aussagegrenzen sind offen.','Modell fachlich prüfen; Schätzungen sichtbar von gemessenen Daten trennen.'],
 ['Skills, Coaching & Tarife','Offen','P2','Bedeutung von Skills, Coach-Editor, Plan-Zuweisung und Fitness-Grenzen zwischen Observe/Free und Operate/Premium sind noch offen.','Entscheidungen im CPO-Gespräch treffen; keine Tarifzuordnung vorwegnehmen.']
];
function FitnessDashboard(){
 const [mode,setMode]=useState('Runner'),[level,setLevel]=useState(0),[state,setState]=useState('Alle'),[prio,setPrio]=useState('Alle');
 const levels=[['Nur Split','Push / Pull / Legs','Split-Ratio im Trainingszyklus','Keine konkreten Übungen, keine individuelle Muskelbelastung.'],['Übungen','Split + ausgeführte Übungen','Zuordnung zu beanspruchten Muskeln','Keine quantifizierte Belastung ohne weitere Angaben.'],['Sätze & Wiederholungen','Übungen + bestätigte Sätze / Wiederholungen','Dokumentierter Trainingsumfang','Gewicht, Anstrengung und Erholung bleiben unbekannt.'],['Weitere Details','Zusätzlich Gewicht und optional Anstrengung','Detaillierter Verlauf vergleichbarer Einträge','Kein direkt gemessener Erholungs- oder Superkompensationswert.']];
 const list=fitnessDecisions.filter(x=>(state==='Alle'||x[1]===state)&&(prio==='Alle'||x[2]===prio));
 return <div className="fitness">
 <section className="fitness-hero"><div><div className="eyebrow">VITALOS / FITNESS · PRODUKTVISION</div><h2>Wissen, was zu tun ist.<br/>Verstehen, was es bewirkt.</h2><p>Anfänger starten mit einem Plan, dokumentieren so viel sie möchten und entdecken ihr Training durch verständliche Visualisierungen.</p><span className="fitness-stamp">Konzeptstand · 13. November 2026</span></div><div className="fitness-cycle"> <span>01 <b>Orientierung</b><small>Coach-Plan oder Workout-Vorlage</small></span><span>02 <b>Durchführung</b><small>Explizit abhaken und frei ergänzen</small></span><span>03 <b>Verständnis</b><small>Auswertung passend zur Datentiefe</small></span></div></section>
 <div className="fitness-metrics"><div><strong>2</strong><span>Trainingsmodi</span></div><div><strong>4</strong><span>Stufen der Eingabetiefe</span></div><div><strong>5</strong><span>Bestätigte Produktentscheidungen</span></div><div><strong>Offen</strong><span>Implementierungsnachweis</span></div></div>
 <div className="sectiontitle"><h2>Ein Training. Zwei Bedienweisen.</h2><span>Beschlossener Produktumfang</span></div>
 <section className="fitness-panel"><div className="segmented" aria-label="Trainingsmodus">{['Runner','Freies Logging'].map(x=><button key={x} aria-pressed={mode===x} className={mode===x?'on':''} onClick={()=>setMode(x)}>{x==='Runner'?'Skills-Runner':x}</button>)}</div><div className="fitness-mode"><div><div className="eyebrow">{mode==='Runner'?'GEFÜHRTER ABLAUF':'FLEXIBLE SESSION'}</div><h3>{mode==='Runner'?'Schritt für Schritt durchs Workout':'Der Plan bleibt sichtbar. Du bleibst flexibel.'}</h3><p>{mode==='Runner'?'Für Zirkeltraining, Calisthenics und Sixpack-Workouts: Die aktuelle Station steht im Mittelpunkt. Ausgeführte Schritte werden ausdrücklich bestätigt; Angaben lassen sich ergänzen.':'Start über eine vorausgefüllte Session oder einen eigenen Plan-Tab. Übungen und Sätze sind frei zugänglich, editierbar und einzeln bestätigbar.'}</p></div><ol>{(mode==='Runner'?['Workout auswählen','Aktuelle Übung ausführen','Abhaken und Angaben ergänzen','Zum nächsten Schritt wechseln']:['Session oder Plan öffnen','Übung und Satz auswählen','Ausführung bestätigen und Werte eingeben','Session mit tatsächlichen Einträgen abschließen']).map(x=><li key={x}>{x}</li>)}</ol></div><p className="notice">Gemeinsame Regel: Geplant ist nicht absolviert. Nur bestätigte Ausführung fließt in die Trainingshistorie ein. Dies ist eine Ablaufbeschreibung, kein laufender Workout-Tracker.</p></section>
 <div className="sectiontitle"><h2>Du bestimmst die Detailtiefe.</h2><span>Interaktive Produktlogik</span></div>
 <section className="fitness-panel"><div className="fitness-levels">{levels.map((x,i)=><button key={x[0]} aria-pressed={level===i} className={level===i?'chosen':''} onClick={()=>setLevel(i)}><small>0{i+1}</small>{x[0]}</button>)}</div><div className="fitness-data" aria-live="polite"><div><small>ERFASST</small><h3>{levels[level][1]}</h3></div><div><small>DARAUS SICHTBAR</small><h3>{levels[level][2]}</h3></div></div><p className="notice"><b>Aussagegrenze:</b> {levels[level][3]} Mehr Details sind optional. Es werden keine fehlenden Werte erfunden.</p></section>
 <div className="sectiontitle"><h2>Entscheidungen & offene Fragen</h2><span>{list.length} von {fitnessDecisions.length} Punkten</span></div><div className="filters"><select aria-label="Fitness Entscheidungsstatus" value={state} onChange={e=>setState(e.target.value)}>{['Alle','Bestätigt','Vorschlag','Offen'].map(x=><option key={x}>{x}</option>)}</select><select aria-label="Fitness Priorität" value={prio} onChange={e=>setPrio(e.target.value)}>{['Alle','P0','P1','P2'].map(x=><option key={x}>{x}</option>)}</select><button className="reset" onClick={()=>{setState('Alle');setPrio('Alle')}}>Zurücksetzen</button></div><p className="fitness-caption">„Bestätigt“ = im Gespräch entschieden, nicht entwickelt oder veröffentlicht. Prioritäten sind ein CPO-Vorschlag.</p>
 <div className="fitness-decisions">{list.map(([title,status,p,detail,next])=><details key={title}><summary><span className={'badge '+(status==='Bestätigt'?'done':'open')}>{status}</span><strong>{title}</strong><span className="priority">{p}</span><span>⌄</span></summary><div><p>{detail}</p><p className="next"><b>Nächster Schritt:</b> {next}</p></div></details>)}{!list.length&&<p className="empty">Keine Punkte für diese Filter.</p>}</div>
 <div className="sectiontitle"><h2>Roadmap für das Fitness-Produkt</h2><span>Vorschlag · keine zugesagten Termine</span></div><div className="fitness-roadmap">{[['01','Produktregeln festhalten','Eingabetiefe, Bestätigung und die zwei Modi sind beschrieben.','Nächster Schritt: offene Begriffe und Coach-Rolle entscheiden.'],['02','Einen Trainingsablauf erproben','Eine Vorlage durch Runner und freie Session führen.','Abnahmevorschlag: Ein Anfänger startet und beendet das Workout ohne mündliche Hilfe; keine Planwerte werden ungefragt als Leistung gespeichert.'],['03','Visualisierung prüfen','Split-Ratio und Muskelzuordnung getrennt entwickeln und testen.','Gate: Erfasste Daten und Aussagegrenzen sind sichtbar; ein Belastungs- oder Erholungsmodell benötigt einen eigenen fachlichen Nachweis.']].map(([n,t,d,a])=><details key={n}><summary><b>{n}</b><strong>{t}</strong><span>⌄</span></summary><p>{d}</p><p className="notice">{a}</p></details>)}</div>
 <section className="fitness-panel fitness-source"><div className="eyebrow">HERKUNFT & EINORDNUNG</div><h3>Aus Erfahrung mit Fitness-Apps entstanden.</h3><div className="fitness-tags">{['Madbarz','Thenics','6 Pack Promise','Strong'].map(x=><span key={x}>{x}</span>)}</div><p>Vom Gründer genannte Inspirationsquellen. Welche konkreten Funktionen übernommen oder verbessert werden sollen, ist noch zu klären; kein geprüfter Vergleich der Apps.</p><p><b>Quelle:</b> CPO-Gespräch in diesem Thread, 13.11.2026. Fitness ist Teil des VitalOS Skill Stacks. Die Zuordnung zu Observe/Free und Operate/Premium bleibt offen.</p><p><b>Wochenänderung · KW 46:</b> Ursprüngliche Fitness-Vision, Anfänger-Einstieg, freiwillige Detailtiefe, explizites Abhaken und zwei Trainingsmodi erstmals als Produktdashboard festgehalten.</p><p className="notice">Kein neuer Git-/Release-Abgleich für Fitness in dieser Ergänzung. Bestehende Projekt- und Wochenstände bleiben erhalten. Die Produktplanung ist keine Freigabe einer App-Implementierung oder einer Änderung des dokumentierten Feature-Freeze.</p></section>
 </div>
}

export default function Page() {
  const [view, setView] = useState<View>('Überblick');
  const [area, setArea] = useState('Alle Bereiche');
  const [priority, setPriority] = useState('Alle Prioritäten');
  const [status, setStatus] = useState('Alle Status');
  const [variant, setVariant] = useState('Alle');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Task | null>(null);
  const [week, setWeek] = useState('Diese Woche');

  useEffect(()=>{if(window.location.hash==='#fitness')setView('Fitness');},[]);
  const filtered = tasks.filter(
    (t) =>
      (area === 'Alle Bereiche' || t.area === area) &&
      (priority === 'Alle Prioritäten' || t.p === priority) &&
      (status === 'Alle Status' || t.status === status) &&
      (variant === 'Alle' || t.variant === variant || t.variant === 'Beide') &&
      `${t.title} ${t.detail} ${t.area}`.toLowerCase().includes(query.toLowerCase()),
  );

  const count = (st: string) =>
    tasks.filter((t) => t.status === st && (variant === 'Alle' || t.variant === variant || t.variant === 'Beide')).length;

  const row = (t: Task) => (
    <button className="task" key={t.id} onClick={() => setSelected(t)}>
      <span className={'mark ' + statusClass(t.status)}>
        {t.status === 'Erledigt' ? '✓' : t.status === 'Blockiert' ? '!' : t.status === 'Unbekannt' ? '?' : '○'}
      </span>
      <span className="taskname">
        {t.title}
        <small>
          {t.area} · {t.variant === 'Beide' ? 'Gemeinsam' : t.variant}
        </small>
      </span>
      <span className="priority">{t.p}</span>
      <span className={'badge ' + statusClass(t.status)}>{t.status}</span>
      <span className="arrow">↗</span>
    </button>
  );

  const heading = view === 'Fitness' ? 'Fitness. Der Ursprung von VitalOS.' :
    view === 'Überblick'
      ? 'Org wach. Produkt klar. Daniel geschützt.'
      : view === 'Organisation'
        ? 'Rollen, Desks, Berichtslinie.'
        : view === 'Betrieb'
          ? 'Timer, Gates, Low Noise.'
          : view === 'Roadmap'
            ? 'Der Weg zum Release.'
            : view === 'Wochenansicht'
              ? 'Was sich bewegt hat.'
              : view === 'Business'
                ? 'Vitaltrainer trifft VitalOS.'
                : 'Eine Basis. Zwei Varianten.';

  const sub = view === 'Fitness' ? 'Produktentscheidungen, Trainingsmodi und offene Fragen · Konzept 13.11.2026.' :
    view === 'Überblick'
      ? 'Sieben Bereiche. Org-Cadence aktiv. Owner bekommt Struktur — nicht Theater.'
      : view === 'Organisation'
        ? 'Jedes Desk unter ~/.vos. Skills SSOT. Business-WSes bleiben eigenständig.'
        : view === 'Betrieb'
          ? 'systemd-Karte der Nachtprüfung. Betta-Catchup ist der sichtbare Rotpunkt.'
          : view === 'Roadmap'
            ? 'Etappen aufklappen, Aufgaben prüfen und Abhängigkeiten verstehen.'
            : view === 'Wochenansicht'
              ? 'Datierte Fortschritte und offene Prüfungen in einer kompakten Wochenübersicht.'
              : view === 'Business'
                ? 'PT Wien, 10er-Block, Observe/Operate und die Coaching-Spur — ohne Owner zu wecken.'
                : 'Observe und Operate teilen Daten und Tagespraxis. Premium erweitert die KI-Nutzung.';

  return (
    <div className="shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView('Überblick');
          }}
        >
          <b className="logo">V</b>VitalOS<span>ORG</span>
        </a>
        <div className="projectlabel">NIGHT SHIFT HUB</div>
        <nav>
          {views.map((n, i) => (
            <button className={view === n ? 'active' : ''} key={n} onClick={() => {setView(n);window.history.replaceState(null,'',n==='Fitness'?'#fitness':window.location.pathname)}}>
              <span>{['◫', '◇', '⬡', '⚙', '⌁', '▤', '€', '⊞'][i]}</span>
              {n}
              {n === 'Wochenansicht' && <em>{KW}</em>}
              {n === 'Betrieb' && <em>GAPS</em>}
            </button>
          ))}
        </nav>
        <div className="projectlabel">PROJEKTBEREICHE</div>
        <nav>
          {areas.map((a, i) => (
            <button
              key={a}
              className={area === a ? 'selected' : ''}
              onClick={() => {
                setArea(a);
                setView('Überblick');
              }}
            >
              <span className={'dot d' + i} />
              {a}
              <em>{tasks.filter((t) => t.area === a && t.status !== 'Erledigt').length}</em>
            </button>
          ))}
        </nav>
        <div className="sidebarfoot">
          <span className="live" /> Org läuft · Owner schläft
          <p>
            Daniel Nimmrichter
            <br />
            Privates Projektdashboard · Wien
          </p>
        </div>
      </aside>

      <main>
        <header>
          <div>
            Workspace <span>/</span> VitalOS <span>/</span> <b>{view}</b>
          </div>
          <span className="snapshot">◷ {SNAPSHOT}</span>
        </header>

        <div className="content">
          <div className="heading">
            <div className="eyebrow">BUILD WITH INTENTION</div>
            <h1>{heading}</h1>
            <p>{sub}</p>
          </div>

          {view === 'Fitness' && <FitnessDashboard/>}
          {view !== 'Fitness' && view !== 'Organisation' && view !== 'Betrieb' && view !== 'Business' && (
            <div className="topline">
              <div className="segmented">
                {['Alle', 'Observe', 'Operate'].map((x) => (
                  <button key={x} className={variant === x ? 'on' : ''} onClick={() => setVariant(x)}>
                    {x === 'Alle' ? 'Gesamtprojekt' : x + (x === 'Observe' ? ' / Free' : ' / Premium')}
                  </button>
                ))}
              </div>
              <span className="muted">Dokumentierter Stand · kein Live-Sync</span>
            </div>
          )}

          {(view === 'Überblick' || view === 'Roadmap' || view === 'Wochenansicht') && (
            <div className="stats">
              {(
                [
                  ['Erledigte Punkte', 'Erledigt', 'green'],
                  ['Offene Aufgaben', 'Offen', 'blue'],
                  ['Blocker', 'Blockiert', 'red'],
                  ['Noch zu klären', 'Unbekannt', 'gray'],
                ] as const
              ).map(([label, st, color]) => (
                <button
                  className={'stat ' + color}
                  key={st}
                  onClick={() => {
                    setStatus(status === st ? 'Alle Status' : st);
                    setView('Überblick');
                  }}
                >
                  <span>{label} ↗</span>
                  <strong>{count(st).toString().padStart(2, '0')}</strong>
                  <small>
                    {st === 'Erledigt'
                      ? 'Bestätigt oder dokumentiert'
                      : st === 'Blockiert'
                        ? 'Abhängigkeiten auflösen'
                        : st === 'Unbekannt'
                          ? 'Nachweise fehlen'
                          : 'Nächste Umsetzung'}
                  </small>
                </button>
              ))}
            </div>
          )}

          {(view === 'Überblick' || view === 'Roadmap') && (
            <div className="filters">
              <input
                aria-label="Aufgaben suchen"
                placeholder="⌕  Aufgaben durchsuchen …"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select aria-label="Bereich" value={area} onChange={(e) => setArea(e.target.value)}>
                {['Alle Bereiche', ...areas].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <select aria-label="Priorität" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {['Alle Prioritäten', 'P0', 'P1', 'P2'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {['Alle Status', 'Erledigt', 'Offen', 'Blockiert', 'Unbekannt'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <button
                className="reset"
                onClick={() => {
                  setArea('Alle Bereiche');
                  setPriority('Alle Prioritäten');
                  setStatus('Alle Status');
                  setQuery('');
                  setVariant('Alle');
                }}
              >
                Zurücksetzen
              </button>
            </div>
          )}

          {view === 'Überblick' && (
            <>
              <section className="focus">
                <span className="focusicon">↗</span>
                <div>
                  <div className="eyebrow">NÄCHSTER OWNER-MORGEN</div>
                  <h2>Gates gebündelt · Business-Drafts bereit</h2>
                  <p>
                    Org-Desks und Skills stehen. M1-RC und Play-Console bleiben Owner-Gates. PT-Strategien und
                    CEO-Vorlagen gehen an nimmdaniel+ceo@gmail.com — nicht per tele.
                  </p>
                </div>
                <button onClick={() => setView('Organisation')}>Organisation →</button>
              </section>
              <div className="sectiontitle">
                <h2>Projektbereiche</h2>
                <span>
                  {filtered.length} passende Punkte · P0 zuerst
                </span>
              </div>
              <div className="cards">
                {areas.map((a, i) => {
                  const list = filtered.filter((t) => t.area === a);
                  if (!list.length) return null;
                  const done = tasks.filter((t) => t.area === a && t.status === 'Erledigt').length;
                  const total = tasks.filter((t) => t.area === a).length;
                  return (
                    <section className="card" key={a}>
                      <div className="cardhead">
                        <span className={'areaicon d' + i}>{['◈', '⌘', '§', '◎', '▷', '€', '⬡'][i]}</span>
                        <span className="cardcount">
                          {done}/{total} dokumentiert erledigt
                        </span>
                      </div>
                      <h2>{a}</h2>
                      <p className="summary">{summaries[i]}</p>
                      <div className="bar">
                        <i style={{width: `${(done / total) * 100}%`}} />
                      </div>
                      {list
                        .slice()
                        .sort((x, y) => x.p.localeCompare(y.p))
                        .map(row)}
                    </section>
                  );
                })}
              </div>
              {!filtered.length && (
                <div className="empty">
                  Keine Aufgaben für diese Filter.{' '}
                  <button
                    onClick={() => {
                      setStatus('Alle Status');
                      setArea('Alle Bereiche');
                      setPriority('Alle Prioritäten');
                      setQuery('');
                    }}
                  >
                    Filter löschen
                  </button>
                </div>
              )}
            </>
          )}

          {view === 'Organisation' && (
            <section className="org">
              <p className="notice">
                Berichtslinie: AL / PM / CPO / CTO / COO → CEO (Perplexity) → Owner 1×/Woche. Oracle ist Werkzeug,
                keine Führungsebene. Skills: <code>~/.vos/&lt;rolle&gt;/.skills/</code>
              </p>
              <div className="rolegrid">
                {roles.map((r) => (
                  <article className="rolecard" key={r.id}>
                    <div className="rolehead">
                      <b>{r.id}</b>
                      <span>{r.title}</span>
                    </div>
                    <p>{r.focus}</p>
                    <dl>
                      <div>
                        <dt>Desk</dt>
                        <dd>
                          <code>{r.desk}</code>
                        </dd>
                      </div>
                      <div>
                        <dt>Engine</dt>
                        <dd>{r.engine}</dd>
                      </div>
                      <div>
                        <dt>Takt</dt>
                        <dd>{r.cadence}</dd>
                      </div>
                      <div>
                        <dt>Daniel</dt>
                        <dd>{r.daniel}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
              <h2 className="weeksubtitle">Workspaces</h2>
              <div className="wsgrid">
                {workspaces.map(([path, desc, kind]) => (
                  <div className="ws" key={path}>
                    <span className="badge done">{kind}</span>
                    <code>{path}</code>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
              <h2 className="weeksubtitle">Organisations-Aufgaben</h2>
              {filtered.filter((t) => t.area === 'Organisation').map(row)}
            </section>
          )}

          {view === 'Betrieb' && (
            <section className="ops">
              <section className="focus warn">
                <span className="focusicon">!</span>
                <div>
                  <div className="eyebrow">WATCH · MODUL-GAPS</div>
                  <h2>betta-vitalos-catchup</h2>
                  <p>
                    SSH-Environment repariert. Lauf endet mit exit 1 bei Modul-GAPS (fitness/fuel/journal/
                    habits/learn). Übrige vitalos-*-Timer enabled/active — Details in OPS-SYSTEMD.md.
                  </p>
                </div>
                <button onClick={() => setView('Organisation')}>Desks prüfen →</button>
              </section>
              <div className="sectiontitle">
                <h2>Timer-Karte</h2>
                <span>Stand systemctl --user · 11.11. ~01:05 CET</span>
              </div>
              <div className="timerlist">
                {timers.map((t) => (
                  <div className="timerrow" key={t.name}>
                    <span className={'badge ' + timerClass(t.status)}>
                      {t.status === 'ok' ? 'ok' : t.status === 'fail' ? 'fail' : 'watch'}
                    </span>
                    <code>{t.name}</code>
                    <strong>{t.when}</strong>
                    <span>{t.purpose}</span>
                  </div>
                ))}
              </div>
              <h2 className="weeksubtitle">Interplay mit Daniel</h2>
              <div className="interplay">
                <div>
                  <h3>Automatisch</h3>
                  <p>AL-Wellen, COO-Health, CTO/PM-Sweeps, CI-Scan, interner Digest. Kein tele.</p>
                </div>
                <div>
                  <h3>Owner-Kanal</h3>
                  <p>Sonntag 20:00 CEO-Briefing. Drafts an nimmdaniel+ceo@gmail.com. Gates nur auf Befehl.</p>
                </div>
                <div>
                  <h3>Nicht jetzt</h3>
                  <p>Kein Store-Upload, kein Meta-Push, kein Tent unter der Woche, kein Core4-Nörgeln nachts.</p>
                </div>
              </div>
            </section>
          )}

          {view === 'Roadmap' && (
            <section className="roadmap">
              <p className="notice">
                Reihenfolge statt zugesagter Termine. Release-Gates gelten erst nach belegter Abnahme als erfüllt.
              </p>
              {phases.map(([num, title, when, ids]) => {
                const list = filtered.filter((t) => ids.includes(t.id));
                return (
                  <details key={num} open={num === '01'}>
                    <summary>
                      <b className="phase">{num}</b>
                      <span>
                        <strong>{title}</strong>
                        <small>
                          {when} · {list.length} passende Aufgaben
                        </small>
                      </span>
                      <span className="chevron">⌄</span>
                    </summary>
                    <div className="phasebody">
                      {list.length ? list.map(row) : <p>Keine passenden Aufgaben unter den aktuellen Filtern.</p>}
                      <p className="accept">
                        <b>Abnahme:</b>{' '}
                        {num === '01'
                          ? 'Commit, Datenpfade und Konto-/Domainstatus sind nachvollziehbar dokumentiert.'
                          : num === '02'
                            ? 'Einträge bleiben nach Offline-Sync erhalten; erneute Übernahme erzeugt keine Duplikate.'
                            : num === '03'
                              ? 'Testpaket, finale URLs und Console-Angaben sind vollständig geprüft.'
                              : num === '04'
                                ? 'Tests und kontospezifische Freigaben sind abgeschlossen; Einreichung ist bestätigt.'
                                : 'Berechtigungen, Kontingente, Zahlungsstatus und Business-Spur sind geprüft.'}
                      </p>
                    </div>
                  </details>
                );
              })}
            </section>
          )}

          {view === 'Wochenansicht' && (
            <section className="week">
              <div className="sectiontitle">
                <h2>{week === 'Archiv KW 45' ? '02.–08. November · KW 45' : '09.–15. November · KW 46'}</h2>
                <select aria-label="Zeitraum" value={week} onChange={(e) => setWeek(e.target.value)}>
                  <option>Diese Woche</option>
                  <option>Seit letztem Quellenstand</option>
                  <option>Archiv KW 45</option>
                </select>
              </div>
              <p className="notice">
                Vergleich: Dashboard 09.11. → Nacht-Upgrade 11.11. Org-Desks, Skill-Packages und Betriebs-View neu.
                Produkt-Gates unverändert Owner-Sache.
              </p>
              {(week === 'Archiv KW 45' ? history : changes).map(([d, t, b]) => (
                <div className="event" key={d + t}>
                  <time>{d}</time>
                  <span className="eventdot" />
                  <div>
                    <h3>{t}</h3>
                    <p>{b}</p>
                  </div>
                </div>
              ))}
              <h2 className="weeksubtitle">{week === 'Archiv KW 45' ? 'Historie der ersten Version' : 'Neu bewertete Aufgaben'}</h2>
              {week !== 'Archiv KW 45' && filtered.filter((t) => t.date === '11.11.2026' || t.date === '09.11.2026').map(row)}
              <h2 className="weeksubtitle">Quellen & Prüfgrenzen</h2>
              <ul>
                {evidence.map(([title, url]) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer">
                      {title} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {view === 'Business' && (
            <section className="business">
              <p className="notice">
                Business-Workspaces bleiben außerhalb von ~/.vos. Vitaltrainer = PT Wien. Creator = Patreon /
                Build-in-public. App-Premium ≠ Coaching-Umsatz.
              </p>
              <div className="variants">
                {businessOffers.map(([name, price, note]) => (
                  <section className="variant" key={name}>
                    <span className="badge done">{note}</span>
                    <h2>{name}</h2>
                    <p>{price}</p>
                  </section>
                ))}
              </div>
              <h2 className="weeksubtitle">Kurzfristige Hebel (nach Org-HTML)</h2>
              <ol className="bizlist">
                <li>Vier wasserfeste PT-Marketingstrategien Wien in ~/vitaltrainer/marketing/</li>
                <li>CEO-/Produktstrategie-Drafts an nimmdaniel+ceo@gmail.com</li>
                <li>10er-Block + VitalOS als Lock-in klar kommunizieren</li>
                <li>Observe als Lead-Magnet, Operate/Patreon als zweite Spur (Owner-Gate)</li>
              </ol>
              {filtered.filter((t) => t.area === 'Monetarisierung' || t.title.includes('PT Wien')).map(row)}
            </section>
          )}

          {view === 'Stack & Varianten' && (
            <>
              <div className="variants">
                {(
                  [
                    ['Observe', 'FREE', 'Manuell vollständig. KI dosiert.', '1 KI-Verarbeitung pro Tag (V1.3.0)', 'vos-observe · Ordner im Meta-Repository'],
                    ['Operate', 'PREMIUM', 'Gleiche Praxis. Häufigeres Smart Logging.', 'Premium-Kontingent noch offen', 'Operate · Zugang im gemeinsamen Store-Produkt'],
                  ] as const
                )
                  .filter((x) => variant === 'Alle' || variant === x[0])
                  .map(([name, label, desc, quota, repo]) => (
                    <section className="variant" key={name}>
                      <span className="badge done">{label}</span>
                      <h2>{name}</h2>
                      <p>{desc}</p>
                      <ul>
                        <li>Journal, vier Deposits und manuelle Skills</li>
                        <li>Direkte Tags wie +hot</li>
                        <li>{quota}</li>
                        <li>Gemeinsame Speicher- und Punkteregeln</li>
                      </ul>
                      <code>{repo}</code>
                    </section>
                  ))}
              </div>
              <section className="stack">
                <h2>Technische Basis</h2>
                <div className="stackgrid">
                  {[
                    ['Frontend', 'React · pnpm'],
                    ['Hosting', 'Firebase Hosting + Sites'],
                    ['Daten', 'Cloud Firestore · eur3'],
                    ['Identität', 'Google Login · Firebase Auth'],
                    ['Analyse', 'Gemini · SmartLog serverseitig'],
                    ['Org', '~/.vos + systemd user timers'],
                  ].map(([a, b]) => (
                    <div key={a}>
                      <small>{a}</small>
                      <strong>{b}</strong>
                    </div>
                  ))}
                </div>
                <h2>Repositories & Zuständigkeit</h2>
                {(
                  [
                    ['vitalos', 'Meta-Repository, Integration und Skill-Submodule', 'https://github.com/nimmsel23/vitalos'],
                    ['journal-dev', 'Journal-Kern, Freitextanalyse, Übernahme', 'https://github.com/nimmsel23/journal-dev'],
                    ['Vitaltrainer website', 'Öffentliche Site + vitalos-dashboard', ''],
                  ] as const
                ).map(([r, d, url]) => (
                  <div className="repo" key={r}>
                    <code>{url ? <a href={url} target="_blank" rel="noreferrer">{r} ↗</a> : r}</code>
                    <span>{d}</span>
                  </div>
                ))}
              </section>
            </>
          )}

          <footer>
            VitalOS · Aufmerksamkeit und Alltag bewusster steuern.
            <span>{SNAPSHOT} · Low-Noise Org</span>
          </footer>
        </div>
      </main>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <section
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close" aria-label="Details schließen" autoFocus onClick={() => setSelected(null)}>
              ×
            </button>
            <div className="eyebrow">
              {selected.area} / {selected.variant}
            </div>
            <h2>{selected.title}</h2>
            <div className="detailtags">
              <span className={'badge ' + statusClass(selected.status)}>{selected.status}</span>
              <span className="priority">
                {selected.p} · {selected.p === 'P0' ? 'Release-relevant' : selected.p === 'P1' ? 'Hoch' : 'Später'}
              </span>
            </div>
            <h3>Aktueller Stand</h3>
            <p>{selected.detail}</p>
            <h3>Nächster Schritt</h3>
            <div className="next">→ {selected.next}</div>
            <h3>Nachweis & Einordnung</h3>
            <p>{selected.source}</p>
            <small>
              Quellen-/Prüfdatum: {selected.date}
              <br />
              Stand zusammengetragen am 11.11.2026
            </small>
            <p className="notice">
              „Erledigt“ bezieht sich nur auf den genannten Punkt. Verfügbarkeit und Umsetzung abhängiger Schritte
              sind separat ausgewiesen.
            </p>
            <button className="primary" onClick={() => setSelected(null)}>
              Zurück zum Dashboard
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

