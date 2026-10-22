// Shared, dependency-free release dialog. Works with React and other app shells.
export function showVosChangelogScreen({ release, appId, appName = appId, accent = '#6ee7b7', storageKey = `${appId}:seen-release` } = {}) {
  if (!appId || typeof release?.id !== 'string' || typeof document === 'undefined') return null;
  // The shell owns its single combined dialog; embedded apps stay silent.
  if (appId !== 'vitalos' && (document.documentElement.dataset.vosShell === 'true' || window.self !== window.top)) return null;

  const hasSeenRelease = () => {
    try { if (localStorage.getItem(storageKey) === release.id) return true; } catch { /* Try session storage below. */ }
    try { return sessionStorage.getItem(storageKey) === release.id; } catch { return false; }
  };
  if (hasSeenRelease() || document.getElementById('vos-changelog-screen')) return null;

  const groups = (Array.isArray(release.sections) && release.sections.length ? release.sections : [release])
    .map(section => ({
      appName: section.appName || appName,
      repository: section.repository,
      commits: Array.isArray(section.commits) ? section.commits.filter(commit => typeof commit?.message === 'string') : [],
    }))
    .filter(section => section.commits.length);
  if (!groups.length) return null;

  const previousFocus = document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.id = 'vos-changelog-screen';
  dialog.setAttribute('aria-labelledby', 'vos-changelog-title');
  dialog.setAttribute('aria-describedby', 'vos-changelog-description');
  dialog.style.setProperty('--vos-accent', accent);
  const style = document.createElement('style');
  style.textContent = `
    #vos-changelog-screen { box-sizing:border-box; display:flex; flex-direction:column; width:min(38rem,calc(100% - 1.25rem)); max-height:min(82dvh,48rem); margin:auto; padding:0; border:1px solid color-mix(in srgb,var(--vos-accent) 24%,transparent); border-radius:1.5rem; background:linear-gradient(155deg,#151c22 0%,#0b0e14 78%); color:#f3f7f5; box-shadow:0 28px 90px #000b; font:14px/1.5 system-ui,-apple-system,sans-serif; overflow:hidden; }
    #vos-changelog-screen::backdrop { background:#05080bd9; backdrop-filter:blur(7px); }
    #vos-changelog-screen header { flex:none; padding:1.45rem 1.5rem 1rem; border-bottom:1px solid #ffffff10; }
    #vos-changelog-screen .vos-label { display:flex; align-items:center; gap:.55rem; margin:0 0 .55rem; color:var(--vos-accent); font-size:.68rem; font-weight:750; letter-spacing:.16em; text-transform:uppercase; }
    #vos-changelog-screen .vos-label::before { width:.45rem; height:.45rem; border-radius:50%; background:var(--vos-accent); box-shadow:0 0 14px color-mix(in srgb,var(--vos-accent) 60%,transparent); content:""; }
    #vos-changelog-screen h2 { margin:0; font-size:1.6rem; line-height:1.2; letter-spacing:-.03em; }
    #vos-changelog-screen .vos-description { margin:.45rem 0 0; color:#a5b1ae; font-size:.84rem; }
    #vos-changelog-screen main { min-height:0; padding:.85rem 1.1rem; overflow:auto; overscroll-behavior:contain; }
    #vos-changelog-screen .vos-push { margin:.45rem 0; padding:.9rem 1rem; border:1px solid #ffffff10; border-radius:1rem; background:#ffffff05; }
    #vos-changelog-screen .vos-push-head { display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom:.5rem; }
    #vos-changelog-screen h3 { min-width:0; margin:0; font-size:.96rem; font-weight:700; }
    #vos-changelog-screen .vos-count { flex:none; padding:.22rem .55rem; border:1px solid color-mix(in srgb,var(--vos-accent) 24%,transparent); border-radius:999px; color:var(--vos-accent); font-size:.68rem; font-weight:700; white-space:nowrap; }
    #vos-changelog-screen .vos-lead { margin:0; color:#e3e9e6; font-size:.9rem; overflow-wrap:anywhere; }
    #vos-changelog-screen .vos-sha { margin-left:.35rem; color:#8e9b96; font-size:.75rem; text-decoration:none; white-space:nowrap; }
    #vos-changelog-screen details { margin-top:.55rem; color:#aab5b1; font-size:.8rem; }
    #vos-changelog-screen summary { width:max-content; max-width:100%; color:#c3ceca; cursor:pointer; }
    #vos-changelog-screen ul { display:grid; gap:.4rem; margin:.5rem 0 0; padding-left:1.1rem; }
    #vos-changelog-screen li { padding-left:.1rem; overflow-wrap:anywhere; }
    #vos-changelog-screen li::marker { color:var(--vos-accent); }
    #vos-changelog-screen a { color:var(--vos-accent); }
    #vos-changelog-screen .vos-all-commits { display:inline-block; margin-top:.55rem; color:#94a69f; font-size:.75rem; text-decoration:none; }
    #vos-changelog-screen .vos-all-commits:hover,#vos-changelog-screen .vos-sha:hover { color:var(--vos-accent); text-decoration:underline; }
    #vos-changelog-screen footer { display:flex; flex:none; align-items:center; justify-content:flex-end; padding:.9rem 1.5rem calc(.9rem + env(safe-area-inset-bottom,0px)); border-top:1px solid #ffffff10; background:#0d1218; }
    #vos-changelog-screen button { min-width:8.5rem; border:0; border-radius:.8rem; padding:.72rem 1.1rem; background:var(--vos-accent); color:#0b0e14; font:750 14px system-ui,sans-serif; cursor:pointer; transition:filter .15s ease,transform .15s ease; }
    #vos-changelog-screen button:hover { filter:brightness(1.07); }
    #vos-changelog-screen button:active { transform:scale(.98); }
    #vos-changelog-screen :focus-visible { outline:2px solid var(--vos-accent); outline-offset:3px; }
    @media(max-width:420px) { #vos-changelog-screen { width:calc(100% - .75rem); max-height:88dvh; border-radius:1.15rem; } #vos-changelog-screen header { padding:1.2rem 1.1rem .85rem; } #vos-changelog-screen main { padding:.65rem .7rem; } #vos-changelog-screen footer { padding:.75rem 1rem calc(.75rem + env(safe-area-inset-bottom,0px)); } }
    @media(prefers-reduced-motion:reduce) { #vos-changelog-screen button { transition:none; } }
  `;
  dialog.append(style);
  const element = (tag, text, parent) => {
    const node = document.createElement(tag);
    node.textContent = text;
    parent.append(node);
    return node;
  };
  const repositoryUrl = (value) => {
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && !url.username && !url.password) return url.origin + url.pathname.replace(/\/$/, '');
    } catch { /* Missing/invalid repository: display notes without links. */ }
    return null;
  };
  const link = (text, href, parent, className = '') => {
    const node = element('a', text, parent);
    node.href = href;
    node.target = '_blank';
    node.rel = 'noopener noreferrer';
    if (className) node.className = className;
    return node;
  };

  const header = document.createElement('header');
  element('p', `${appName} · Update`, header).className = 'vos-label';
  element('h2', 'Was ist neu?', header).id = 'vos-changelog-title';
  element('p', `${groups.length} ${groups.length === 1 ? 'Bereich wurde' : 'Bereiche wurden'} aktualisiert.`, header).id = 'vos-changelog-description';
  header.lastElementChild.className = 'vos-description';
  dialog.append(header);

  const main = document.createElement('main');
  for (const group of groups) {
    const card = document.createElement('section');
    card.className = 'vos-push';
    const head = document.createElement('div');
    head.className = 'vos-push-head';
    element('h3', group.appName, head);
    const count = group.commits.length;
    element('span', `Push · ${count} ${count === 1 ? 'Commit' : 'Commits'}`, head).className = 'vos-count';
    card.append(head);

    const repository = repositoryUrl(group.repository);
    const newest = group.commits.at(-1);
    const lead = element('p', newest.message, card);
    lead.className = 'vos-lead';
    if (repository && /^[a-f0-9]{7,64}$/i.test(newest.sha)) {
      link(newest.sha.slice(0, 7), `${repository}/commit/${newest.sha}`, lead, 'vos-sha');
    }

    const older = group.commits.slice(0, -1);
    if (older.length) {
      const details = document.createElement('details');
      const summary = element('summary', `${older.length} weitere ${older.length === 1 ? 'Änderung' : 'Änderungen'} anzeigen`, details);
      summary.setAttribute('aria-label', `${older.length} weitere Commits aus dem Push anzeigen`);
      const list = document.createElement('ul');
      for (const commit of older) {
        const item = element('li', commit.message, list);
        if (repository && /^[a-f0-9]{7,64}$/i.test(commit.sha)) {
          item.append(document.createTextNode(' '));
          link(commit.sha.slice(0, 7), `${repository}/commit/${commit.sha}`, item, 'vos-sha');
        }
      }
      details.append(list);
      card.append(details);
    }
    if (repository) link('Alle Commits ansehen', `${repository}/commits`, card, 'vos-all-commits');
    main.append(card);
  }
  dialog.append(main);

  const footer = document.createElement('footer');
  const button = element('button', 'Weiter', footer);
  button.type = 'button';
  button.autofocus = true;
  button.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    dialog.remove();
    if (previousFocus?.isConnected) previousFocus.focus();
  }, { once: true });
  dialog.append(footer);
  document.body.append(dialog);
  if (typeof dialog.showModal !== 'function') { dialog.remove(); return null; }
  try { dialog.showModal(); }
  catch { dialog.remove(); return null; }

  // Mark on display so a reload or hard reload cannot reopen the same release.
  try { localStorage.setItem(storageKey, release.id); }
  catch { try { sessionStorage.setItem(storageKey, release.id); } catch { /* Storage can be unavailable. */ } }
  return dialog;
}
