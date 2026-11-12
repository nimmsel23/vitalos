// Lagezelt — liest die Koordinations-Markdowns live (fetch) und rendert sie ohne Abhängigkeiten.

const DOCS = [
  { key: "status", path: "../STATUS.md", label: "Status", group: "Lage" },
  { key: "todo", path: "../TODO.md", label: "TODO", group: "Lage" },
  { key: "backlog", path: "../PRODUKT-BACKLOG.md", label: "Produkt-Backlog", group: "Lage" },
  { key: "org", path: "../ORG.md", label: "Org", group: "Org" },
  { key: "cto", path: "../CTO.md", label: "CTO", group: "Org" },
  { key: "cpo", path: "../CPO.md", label: "CPO", group: "Org" },
  { key: "oracle", path: "../ORACLE.md", label: "Oracle", group: "Org" },
  { key: "product", path: "../PRODUCT.md", label: "Produkt", group: "Produkt" },
  { key: "auftrag", path: "../AUFTRAG-ANDROID-LINIE.md", label: "Android-Linie", group: "Produkt" },
  { key: "scope", path: "../CEO-SCOPE-OBSERVE-V1.md", label: "Scope Observe v1", group: "Produkt" },
  { key: "roadmap", path: "../CEO-ROADMAP-STATUS.md", label: "Roadmap", group: "Produkt" },
  { key: "strategy", path: "../CEO-STRATEGY-DELTA.md", label: "Strategie-Delta", group: "Produkt" },
  { key: "game", path: "../game/README.md", label: "Game", group: "Ritual" },
  { key: "readme", path: "../README.md", label: "README", group: "Ritual" },
];
const DOC = Object.fromEntries(DOCS.map((d) => [d.key, d]));

const ROLE_ORDER = ["ceo", "coo", "cto", "cpo", "pm", "al", "alpha", "betta", "oracle", "mentor", "owner", "org"];
const ROLE_LABEL = { ceo: "CEO", coo: "COO", cto: "CTO", cpo: "CPO", pm: "PM", al: "AL", alpha: "Alpha", betta: "Betta", oracle: "Oracle", mentor: "Mentor", owner: "Owner", org: "Org" };
const ROLE_DOC = { cto: "cto", cpo: "cpo", oracle: "oracle" };
const HUES = ["var(--ember)", "var(--sky)", "var(--brass)", "var(--moss)", "var(--lilac)", "var(--teal)", "var(--rose)"];
const MONTHS = ["Jan", "Feb", "März", "Apr", "Mai", "Juni", "Juli", "Aug", "Sep", "Okt", "Nov", "Dez"];
const PAGE = 30;

const state = {
  view: "lage",
  arg: "",
  text: {},
  errors: {},
  syncedAt: null,
  q: "",
  role: "alle",
  limit: PAGE,
};

const $ = (sel, root = document) => root.querySelector(sel);

/* ── Text-Helfer ────────────────────────────────────── */

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function plain(s) {
  return String(s ?? "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(s) {
  return plain(s).toLowerCase()
    .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || "abschnitt";
}

function safeHref(href) {
  const h = href.trim();
  if (/^(javascript|data|vbscript):/i.test(h)) return "#";
  if (/^(https?:|mailto:|#|\/)/i.test(h)) return h;
  return "../" + h; // Links in den Docs sind relativ zu coordination/, die UI liegt in ui/
}

function inline(t) {
  let s = esc(t);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*)\*(?!\*)/g, "$1<em>$2</em>");
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, href) => {
    const h = safeHref(href.replaceAll("&amp;", "&"));
    const ext = /^https?:/i.test(h) ? ' target="_blank" rel="noopener"' : "";
    return `<a href="${esc(h)}"${ext}>${txt}</a>`;
  });
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  return s;
}

/** Schlanker Markdown-Renderer für die Koordinations-Docs. */
function renderMd(src, { ids = false } = {}) {
  if (!src) return "";
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  const used = {};
  let list = null; // "ul" | "ol"
  let para = [];
  let table = [];
  let code = null;

  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((r) => !/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(r));
    out.push('<div class="tbl"><table>');
    rows.forEach((row, i) => {
      const cells = row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const tag = i === 0 ? "th" : "td";
      out.push("<tr>" + cells.map((c) => `<${tag}>${inline(c)}</${tag}>`).join("") + "</tr>");
    });
    out.push("</table></div>");
    table = [];
  };
  const flushAll = () => { flushPara(); closeList(); flushTable(); };

  for (const line of lines) {
    if (code !== null) {
      if (/^\s*```/.test(line)) {
        out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
        code = null;
      } else code.push(line);
      continue;
    }
    if (/^\s*```/.test(line)) { flushAll(); code = []; continue; }

    if (/^\s*\|.*\|\s*$/.test(line)) { flushPara(); closeList(); table.push(line); continue; }
    flushTable();

    if (/^\s*$/.test(line)) { flushPara(); closeList(); continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushAll();
      const lvl = h[1].length;
      let idAttr = "";
      if (ids) {
        let id = slug(h[2]);
        used[id] = (used[id] || 0) + 1;
        if (used[id] > 1) id += "-" + used[id];
        idAttr = ` id="${id}"`;
      }
      out.push(`<h${lvl}${idAttr}>${inline(h[2])}</h${lvl}>`);
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { flushAll(); out.push("<hr>"); continue; }

    const bq = line.match(/^\s*>\s?(.*)$/);
    if (bq) { flushAll(); out.push(`<blockquote>${inline(bq[1])}</blockquote>`); continue; }

    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const kind = ul ? "ul" : "ol";
      if (list !== kind) { closeList(); out.push(`<${kind}>`); list = kind; }
      out.push(`<li>${inline((ul || ol)[1])}</li>`);
      continue;
    }

    // Fortsetzungszeile eines Listenpunkts
    if (list && /^\s+\S/.test(line)) {
      out[out.length - 1] = out[out.length - 1].replace(/<\/li>$/, " " + inline(line.trim()) + "</li>");
      continue;
    }
    closeList();
    para.push(line.trim());
  }
  if (code !== null) out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
  flushAll();
  return out.join("\n");
}

function headings(md, level = 2) {
  const re = new RegExp(`^#{${level}}\\s+`);
  const used = {};
  const out = [];
  let fence = false;
  for (const line of (md || "").split("\n")) {
    if (/^\s*```/.test(line)) { fence = !fence; continue; }
    if (fence) continue;
    const m = line.match(/^(#{1,4})\s+(.*)$/);
    if (!m) continue;
    let id = slug(m[2]);
    used[id] = (used[id] || 0) + 1;
    if (used[id] > 1) id += "-" + used[id];
    if (re.test(line)) out.push({ title: plain(m[2]), id });
  }
  return out;
}

function anchorOf(key, re) {
  return (headings(state.text[key], 2).find((h) => re.test(h.title)) || { id: "" }).id;
}

function section(md, re) {
  const lines = (md || "").replace(/\r\n/g, "\n").split("\n");
  let start = -1;
  let level = 2;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,3})\s+(.*)$/);
    if (m && re.test(m[2].trim())) { start = i + 1; level = m[1].length; break; }
  }
  if (start < 0) return "";
  const body = [];
  for (let i = start; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,3})\s+/);
    if (m && m[1].length <= level) break;
    body.push(lines[i]);
  }
  return body.join("\n").trim();
}

function listItems(md) {
  const items = [];
  for (const line of (md || "").split("\n")) {
    const hit = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*)$/);
    if (hit) { items.push(hit[1]); continue; }
    if (items.length && /^\s+\S/.test(line)) items[items.length - 1] += " " + line.trim();
  }
  return items.map(plain);
}

function h2Blocks(md) {
  const blocks = [];
  let cur = null;
  for (const line of (md || "").replace(/\r\n/g, "\n").split("\n")) {
    const m = line.match(/^##\s+(.*)$/);
    if (m) {
      if (cur) blocks.push(cur);
      cur = { title: m[1].trim(), body: [] };
    } else if (cur) cur.body.push(line);
  }
  if (cur) blocks.push(cur);
  return blocks.map((b) => ({ ...b, body: b.body.join("\n").trim() }));
}

/** Zeilen der ersten Tabelle im Abschnitt (ohne Kopf- und Trennzeile). */
function tableRows(md) {
  const rows = [];
  for (const line of (md || "").split("\n")) {
    if (!/^\s*\|/.test(line)) { if (rows.length) break; continue; }
    if (/^\s*\|?\s*:?-{2,}/.test(line)) continue;
    rows.push(line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim()));
  }
  return rows.slice(1); // Kopfzeile weg
}

/* ── Datum & Rollen ─────────────────────────────────── */

function parseWhen(s) {
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})(?:[^\d\n]{1,14}?(\d{1,2}):(\d)(\d|x))?/);
  if (!m) return null;
  const [, y, mo, d, hh, m1, m2] = m;
  const date = new Date(+y, +mo - 1, +d, hh ? +hh : 0, hh ? +(m1 + (m2 === "x" ? "0" : m2)) : 0);
  return { date, hasTime: Boolean(hh) };
}

function fmtWhen(w) {
  if (!w) return "ohne Datum";
  const d = w.date;
  const day = `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
  return w.hasTime ? `${day} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : day;
}

function ago(date) {
  if (!date) return "";
  const days = Math.floor((startOfDay(new Date()) - startOfDay(date)) / 864e5);
  if (days <= 0) return "heute";
  if (days === 1) return "gestern";
  return `vor ${days} Tagen`;
}
function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - y0) / 864e5 + 1) / 7);
}

function roleOf(title) {
  const head = title.slice(0, 48);
  const m = head.match(/\b(CEO|COO|CTO|CPO|PM|AL|Alpha|Betta|Oracle|Mentor|Owner|Daniel)\b/);
  if (!m) return "org";
  return m[1] === "Daniel" ? "owner" : m[1].toLowerCase();
}

function cleanTitle(t) {
  let s = plain(t)
    .replace(/^(REPORT|STATUS(\/FESTSTELLUNG)?|[A-Z]{2,3}-SEKTION|CEO-[A-Za-zäöüÄÖÜ-]+|CEO|CTO|CPO|COO)\b\s*(Alpha|Betta|Oracle|CTO|CEO)?\s*[—:–-]?\s*/, "")
    .replace(/\s*[(~]*\d{4}-\d{2}-\d{2}(\s*[~(]?\s*(ca\.\s*)?(nach\s*)?\d{1,2}:[\dx]{2}\w*(\s*(CET|UTC))?\)?)?\)?/g, "")
    .replace(/^[\s:—–-]+|[\s:—–,-]+$/g, "")
    .replace(/\s+[—–]\s*$/, "");
  return s || plain(t);
}

/* ── Abgeleitete Daten ──────────────────────────────── */

function entries() {
  const out = [];
  const add = (blocks, source) => {
    let last = null;
    blocks.forEach((b, i) => {
      const w = parseWhen(b.title) || parseWhen(b.body.slice(0, 200));
      if (w) last = w;
      out.push({
        id: `${source}-${i}`,
        source,
        raw: b.title,
        title: cleanTitle(b.title),
        role: roleOf(b.title),
        when: w || last,
        order: i,
        body: b.body,
        first: plain((b.body.split("\n").find((l) => l.trim() && !/^\s*(```|\|)/.test(l)) || "").replace(/^\s*(?:[-*+]|\d+[.)]|#+)\s+/, "")),
      });
    });
  };
  const status = h2Blocks(state.text.status).filter((b) => !/^(IST-?STAND|OFFEN|NEUE REPORTS)\b/i.test(b.title));
  add(status, "status");
  add(h2Blocks(state.text.todo), "todo");
  return out.sort((a, b) => (b.when?.date ?? 0) - (a.when?.date ?? 0) || (a.source === b.source ? b.order - a.order : 0));
}

function lanes() {
  const md = state.text.backlog || "";
  return ["P0", "P1", "P2"].map((p) => {
    const head = (md.match(new RegExp(`^##\\s+${p}\\b[^\\n]*`, "m")) || [""])[0].replace(/^##\s+/, "");
    const body = section(md, new RegExp(`^${p}\\b`));
    if (!head) return null;
    const title = plain(head.replace(new RegExp(`^${p}\\s*[—–-]\\s*`), ""));
    const paras = body.split(/\n\s*\n/).map((x) => x.replace(/\n/g, " ").trim());
    const goal = paras.find((x) => /^\*\*Produktziel/i.test(x));
    const stand = paras.find((x) => /^\*\*Stand/i.test(x));
    const bullets = listItems(body).map((x) => x.split(/:\s/)[0]);
    return {
      p,
      title,
      goal: goal ? plain(goal.replace(/^\*\*Produktziel:?\*\*:?/i, "")) : bullets.length ? `${bullets.length} Stränge` : "",
      standTag: stand ? plain((stand.match(/^\*\*([^*]+)\*\*/) || [, "Stand"])[1]).replace(/:$/, "") : "Stränge",
      stand: stand ? plain(stand.replace(/^\*\*[^*]+\*\*:?/, "")) : bullets.join(" · "),
    };
  }).filter(Boolean);
}

function statusStand() {
  const s = state.text.status || "";
  const head = (s.match(/^##\s+IST-?STAND[^\n]*/m) || [""])[0];
  return parseWhen(head);
}

/* ── Laden ──────────────────────────────────────────── */

async function fetchDoc(d) {
  try {
    const res = await fetch(d.path, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const text = await res.text();
    delete state.errors[d.key];
    return text;
  } catch (err) {
    state.errors[d.key] = String(err.message || err);
    return null;
  }
}

async function loadAll() {
  const texts = await Promise.all(DOCS.map(fetchDoc));
  let changed = false;
  DOCS.forEach((d, i) => {
    if (state.text[d.key] !== texts[i]) changed = true;
    state.text[d.key] = texts[i];
  });
  state.syncedAt = new Date();
  paintSync();
  return changed;
}

function paintSync() {
  const el = $("#sync");
  const missing = Object.keys(state.errors).length;
  const t = state.syncedAt;
  const hhmm = t ? `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}` : "";
  el.className = "sync " + (missing === DOCS.length ? "bad" : "ok");
  $("#sync-text").textContent = missing === DOCS.length
    ? "keine Dateien lesbar"
    : missing ? `live · ${hhmm} · ${missing} fehlen` : `live · ${hhmm}`;
}

/* ── Ansichten ──────────────────────────────────────── */

function errNote() {
  if (state.errors.status && state.errors.todo) {
    return `<div class="note bad rise">Die Markdown-Dateien sind nicht erreichbar. Server im Ordner <code>coordination/</code> starten:
      <code>python3 -m http.server 8765 --bind 127.0.0.1</code> und <code>/ui/</code> öffnen.</div>`;
  }
  return "";
}

function roleChip(role) {
  return `<span class="role-chip r-${role}">${ROLE_LABEL[role] || role}</span>`;
}

function viewLage() {
  const now = new Date();
  const hr = now.getHours();
  const greet = hr < 5 ? "Nachtwache" : hr < 11 ? "Guten Morgen" : hr < 17 ? "Guten Tag" : hr < 22 ? "Guten Abend" : "Späte Runde";
  const offen = listItems(section(state.text.status, /^OFFEN\b/i));
  const feed = entries();
  const today = feed.filter((e) => e.when && ago(e.when.date) === "heute").length;
  const last = feed[0];
  const stand = statusStand();
  const apps = tableRows(section(state.text.product, /^APPS\b/i)).length;
  const roles = tableRows(section(state.text.org, /^Rollen-Skill/i)).length;
  const ls = lanes();
  const ist = section(state.text.status, /^IST-?STAND\b/i);
  const gates = section(state.text.backlog, /^Owner-Gates\b/i);
  const weekday = now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });

  let i = 0;
  const r = () => `style="--i:${i++}"`;

  return `
    ${errNote()}
    <header class="hero">
      <div class="rise" ${r()}>
        <p class="eyebrow">Lagebild · KW ${isoWeek(now)}</p>
        <h1>${greet}.<br><em>Was zählt jetzt?</em></h1>
        <p class="lede">${offen.length} Punkte in der Rangfolge${last ? `, letzter Eintrag ${ago(last.when?.date)} von ${ROLE_LABEL[last.role]}` : ""}. Alles hier liest live aus <code>coordination/</code>.</p>
      </div>
      <div class="clock rise" ${r()}><b id="clock">${now.toTimeString().slice(0, 5)}</b>${esc(weekday)}</div>
    </header>

    <div class="ticker rise" ${r()}>
      <a class="tick hot" href="#docs/status/${anchorOf("status", /^OFFEN\b/i)}"><div class="n">${offen.length}</div><div class="l">offen in der Rangfolge</div></a>
      <a class="tick" href="#logbuch"><div class="n">${today}</div><div class="l">Logbuch-Einträge heute</div></a>
      <a class="tick" href="#produkt"><div class="n">${apps || "–"}</div><div class="l">Apps im Projekt</div></a>
      <a class="tick" href="#rollen"><div class="n">${roles || "–"}</div><div class="l">Rollen an Bord</div></a>
    </div>

    <div class="cols">
      <section class="panel rise" ${r()}>
        <div class="sec-title"><h2>Rangfolge</h2><span class="src">STATUS · ${stand ? `Stand ${fmtWhen(stand)} (${ago(stand.date)})` : "OFFEN"}</span></div>
        ${offen.length ? `<ol class="rank">${offen.map((t, n) => {
          const cut = t.indexOf(":");
          const head = cut > 0 && cut < 70 ? t.slice(0, cut) : t.split(/(?<=[.;])\s/)[0].slice(0, 90);
          const rest = t.slice(head.length).replace(/^[:\s]+/, "");
          return `<li><span class="num">${n + 1}</span><div><div class="head">${esc(head)}</div>${rest ? `<div class="rest">${esc(rest)}</div>` : ""}</div></li>`;
        }).join("")}</ol>` : `<p class="muted">Keine OFFEN-Liste in STATUS.md gefunden.</p>`}
      </section>

      <section class="panel rise" ${r()}>
        <div class="sec-title"><h2>Funkverkehr</h2><a class="src" href="#logbuch">alle ${feed.length} →</a></div>
        ${feed.length ? `<ul class="feed">${feed.slice(0, 7).map((e) => `
          <li class="r-${e.role}">
            <div class="when">${roleChip(e.role)}<span>${fmtWhen(e.when)}</span></div>
            <button type="button" data-entry="${e.id}" title="${esc(e.raw)}">${esc(e.title)}</button>
          </li>`).join("")}</ul>` : `<p class="muted">Noch keine Einträge.</p>`}
      </section>
    </div>

    ${ls.length ? `
    <section class="block">
      <div class="sec-title rise" ${r()}><h2>Lieferstatus</h2><a class="src" href="#docs/backlog">Produkt-Backlog →</a></div>
      <div class="lanes">${ls.map((l) => `
        <article class="lane ${l.p.toLowerCase()} rise" ${r()} data-p="${l.p}">
          <h3>${esc(l.title)}</h3>
          ${l.goal ? `<p class="goal">${esc(l.goal)}</p>` : ""}
          ${l.stand ? `<p class="stand"><span class="tag">${esc(l.standTag)}</span>${esc(l.stand)}</p>` : ""}
        </article>`).join("")}</div>
    </section>` : ""}

    ${ist ? `<details class="fold panel rise" ${r()}><summary>Ist-Stand der Schicht<span class="src">STATUS.md</span></summary><div class="md" style="margin-top:1rem">${renderMd(ist)}</div></details>` : ""}
    ${gates ? `<details class="fold panel rise" ${r()}><summary>Owner-Gates<span class="src">PRODUKT-BACKLOG.md</span></summary><div class="md" style="margin-top:1rem">${renderMd(gates)}</div></details>` : ""}
  `;
}

function viewRollen() {
  const rows = tableRows(section(state.text.org, /^Rollen-Skill/i));
  const intro = section(state.text.org, /^Stand & Gates/i);
  return `
    ${errNote()}
    <header class="page-head rise">
      <div><p class="eyebrow">Wer sitzt am Tisch</p><h1>Rollen</h1><p class="lede">Skill-Sitze der Org aus <code>ORG.md</code> — Klick öffnet das Rollendokument.</p></div>
    </header>
    ${rows.length ? `<div class="roles">${rows.map((c, n) => {
      const name = plain(c[0]).replace(/-Skill$/i, "");
      const key = name.toLowerCase().split(/[\s/]/)[0];
      const role = ROLE_LABEL[key] ? key : "org";
      const doc = ROLE_DOC[key];
      const target = doc ? `docs/${doc}` : `docs/org/${anchorOf("org", /^Rollen-Skill/i)}`;
      return `
        <button type="button" class="role r-${role} rise" style="--i:${n}" data-go="${target}">
          <span class="mono">${esc(name.replace(/[^A-Za-zÄÖÜäöü]/g, "").slice(0, 2))}</span>
          <strong>${esc(name)}</strong>
          <span class="kern">${inline(c[1] || "")}</span>
          <span class="stand">${inline(c[2] || "")}</span>
          <span class="go">${doc ? `${DOC[doc].path.replace("../", "")} →` : "ORG.md →"}</span>
        </button>`;
    }).join("")}</div>` : `<p class="note">Rollentabelle in ORG.md nicht gefunden.</p>`}
    ${intro ? `<section class="panel block rise" style="--i:${rows.length}"><div class="sec-title"><h2>Stand &amp; Gates</h2><span class="src">ORG.md</span></div><div class="md">${renderMd(intro)}</div></section>` : ""}
  `;
}

function viewProdukt() {
  const apps = tableRows(section(state.text.product, /^APPS\b/i));
  const flow = section(state.text.product, /^Release-Fluss/i);
  const ls = lanes();
  return `
    ${errNote()}
    <header class="page-head rise">
      <div><p class="eyebrow">Projekt vitalos</p><h1>Produkt</h1><p class="lede">Die Apps im Meta-Repo und wohin die Lieferung gerade zielt.</p></div>
    </header>
    ${apps.length ? `<div class="apps">${apps.map((c, n) => `
      <div class="app rise" style="--i:${n};--hue:${HUES[n % HUES.length]}">
        <span class="glyph">${esc(plain(c[0]).charAt(0).toUpperCase())}</span>
        <b>${esc(plain(c[0]))}</b>
        <span class="repo">${esc(plain(c[1]))}</span>
        <p>${esc(plain(c[2] || ""))}</p>
      </div>`).join("")}</div>` : `<p class="note">APPS-Tabelle in PRODUCT.md nicht gefunden.</p>`}
    ${ls.length ? `<section class="block"><div class="sec-title"><h2>Lieferstatus</h2><a class="src" href="#docs/backlog">Backlog →</a></div>
      <div class="lanes">${ls.map((l, n) => `
        <article class="lane ${l.p.toLowerCase()} rise" style="--i:${apps.length + n}" data-p="${l.p}">
          <h3>${esc(l.title)}</h3>
          ${l.goal ? `<p class="goal">${esc(l.goal)}</p>` : ""}
          ${l.stand ? `<p class="stand"><span class="tag">${esc(l.standTag)}</span>${esc(l.stand)}</p>` : ""}
        </article>`).join("")}</div></section>` : ""}
    ${flow ? `<section class="panel block"><div class="sec-title"><h2>Release-Fluss</h2><span class="src">PRODUCT.md</span></div><div class="md">${renderMd(flow)}</div></section>` : ""}
    <details class="fold panel"><summary>PRODUCT.md komplett<span class="src">Quelle</span></summary><div class="md" style="margin-top:1rem">${renderMd(state.text.product || "")}</div></details>
  `;
}

function highlight(text, q) {
  const e = esc(text);
  if (!q) return e;
  const re = new RegExp(esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return e.replace(re, (m) => `<mark>${m}</mark>`);
}

function filtered() {
  const q = state.q.trim().toLowerCase();
  return entries().filter((e) =>
    (state.role === "alle" || e.role === state.role) &&
    (!q || (e.raw + "\n" + e.body).toLowerCase().includes(q)));
}

function viewLogbuch() {
  const all = entries();
  const counts = {};
  all.forEach((e) => { counts[e.role] = (counts[e.role] || 0) + 1; });
  const roles = ROLE_ORDER.filter((r) => counts[r]);
  return `
    ${errNote()}
    <header class="page-head rise">
      <div><p class="eyebrow">TODO + STATUS, neueste zuerst</p><h1>Logbuch</h1><p class="lede">Jede Sektion ein Eintrag. Aufklappen zum Lesen, <kbd>/</kbd> zum Suchen.</p></div>
    </header>
    <div class="toolbar rise" style="--i:1">
      <input class="search" id="search" type="search" placeholder="Im Logbuch suchen…" value="${esc(state.q)}" aria-label="Logbuch durchsuchen">
      <button type="button" class="chip ${state.role === "alle" ? "on" : ""}" data-role="alle">Alle</button>
      ${roles.map((r) => `<button type="button" class="chip r-${r} ${state.role === r ? "on" : ""}" data-role="${r}">${ROLE_LABEL[r]} <span class="muted">${counts[r]}</span></button>`).join("")}
    </div>
    <div id="entries"></div>
  `;
}

function paintEntries() {
  const box = $("#entries");
  if (!box) return;
  const list = filtered();
  const q = state.q.trim();
  const shown = list.slice(0, state.limit);
  box.innerHTML = `
    <div class="count" style="margin:0 0 .6rem">${list.length} Einträge${q ? ` für „${esc(q)}“` : ""}</div>
    <div class="entries">${shown.map((e) => `
      <details class="entry" id="${e.id}" data-id="${e.id}">
        <summary>
          <span class="d">${fmtWhen(e.when)}<br>${e.source === "status" ? "STATUS" : "TODO"}</span>
          <span><span class="t" title="${esc(e.raw)}">${highlight(e.title, q)}</span><span class="s">${highlight(e.first.slice(0, 180), q)}</span></span>
          ${roleChip(e.role)}
        </summary>
        <div class="body md"></div>
      </details>`).join("") || `<p class="note">Nichts gefunden.</p>`}</div>
    ${list.length > shown.length ? `<button type="button" class="more" id="more">${Math.min(PAGE, list.length - shown.length)} weitere laden</button>` : ""}
  `;
  box.querySelectorAll("details.entry").forEach((d) => {
    d.addEventListener("toggle", () => {
      const body = d.querySelector(".body");
      if (d.open && !body.innerHTML) {
        const e = list.find((x) => x.id === d.dataset.id);
        body.innerHTML = renderMd(e?.body || "") || `<p class="muted">Leer.</p>`;
      }
    });
  });
  $("#more")?.addEventListener("click", () => { state.limit += PAGE; paintEntries(); });
}

function openEntry(id) {
  const pos = filtered().findIndex((e) => e.id === id);
  if (pos >= state.limit) { state.limit = Math.ceil((pos + 1) / PAGE) * PAGE; paintEntries(); }
  const el = document.getElementById(id);
  if (el) {
    el.open = true;
    el.dispatchEvent(new Event("toggle"));
    requestAnimationFrame(() => el.scrollIntoView({ block: "start", behavior: "smooth" }));
  }
}

function viewDocs() {
  const [key = "status", anchor = ""] = state.arg.split("/");
  const d = DOC[key] || DOC.status;
  const text = state.text[d.key];
  const toc = headings(text, 2);
  let lastGroup = "";
  const nav = DOCS.map((x) => {
    const grp = x.group !== lastGroup ? `<div class="grp">${x.group}</div>` : "";
    lastGroup = x.group;
    const cls = [x.key === d.key ? "on" : "", state.errors[x.key] ? "off" : ""].join(" ");
    return `${grp}<button type="button" class="${cls}" data-go="docs/${x.key}">${esc(x.label)}${state.errors[x.key] ? "<span>–</span>" : ""}</button>`;
  }).join("");
  setTimeout(() => {
    if (!anchor) return;
    document.getElementById(anchor)?.scrollIntoView({ block: "start" });
  }, 0);
  return `
    <header class="page-head rise">
      <div><p class="eyebrow">${esc(d.group)} · <code>${esc(d.path.replace("../", "coordination/"))}</code></p><h1>${esc(d.label)}</h1></div>
    </header>
    <div class="reader">
      <nav class="doclist rise" style="--i:1" aria-label="Dokumente">${nav}</nav>
      <article class="paper rise" style="--i:2">
        ${state.errors[d.key] ? `<div class="note bad">Nicht lesbar: ${esc(state.errors[d.key])}${d.key === "status" ? " — STATUS.md ist gitignored und existiert nur lokal." : ""}</div>` : ""}
        ${toc.length > 2 ? `<nav class="toc" aria-label="Inhalt">${toc.slice(0, 40).map((h) => `<a href="#docs/${d.key}/${h.id}">${esc(h.title)}</a>`).join("")}</nav>` : ""}
        <div class="md">${text ? renderMd(text, { ids: true }) : `<p class="muted">Keine Inhalte.</p>`}</div>
      </article>
    </div>
  `;
}

/* ── Routing & Rendering ────────────────────────────── */

const VIEWS = { lage: viewLage, rollen: viewRollen, produkt: viewProdukt, logbuch: viewLogbuch, docs: viewDocs };

function route() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, ""));
  const [view, ...rest] = raw.split("/");
  const prevView = state.view;
  state.view = VIEWS[view] ? view : "lage";
  state.arg = rest.join("/");
  // Gleiches Dokument, nur Anker gewechselt → nur scrollen
  if (prevView === "docs" && state.view === "docs" && $("#main .paper") && rest[0] === renderedDoc) {
    if (rest[1]) document.getElementById(rest[1])?.scrollIntoView({ block: "start", behavior: "smooth" });
    return;
  }
  render(prevView !== state.view);
}

let renderedDoc = null;

function render(scrollTop = false) {
  const main = $("#main");
  document.querySelectorAll(".nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.view === state.view);
    a.setAttribute("aria-current", a.dataset.view === state.view ? "page" : "false");
  });
  if (state.view === "logbuch" && state.arg && !filtered().some((e) => e.id === state.arg)) {
    state.q = "";
    state.role = "alle";
  }
  main.innerHTML = VIEWS[state.view]();
  renderedDoc = state.view === "docs" ? (state.arg.split("/")[0] || "status") : null;
  if (scrollTop) window.scrollTo({ top: 0 });

  if (state.view === "logbuch") {
    paintEntries();
    const input = $("#search");
    input?.addEventListener("input", () => { state.q = input.value; state.limit = PAGE; paintEntries(); });
    main.querySelectorAll("[data-role]").forEach((b) => b.addEventListener("click", () => {
      state.role = b.dataset.role;
      state.limit = PAGE;
      main.querySelectorAll("[data-role]").forEach((x) => x.classList.toggle("on", x === b));
      paintEntries();
    }));
    if (state.arg) openEntry(state.arg);
  }
}

document.addEventListener("click", (ev) => {
  const go = ev.target.closest("[data-go]");
  if (go) { location.hash = go.dataset.go; return; }
  const entry = ev.target.closest("[data-entry]");
  if (entry) location.hash = "logbuch/" + entry.dataset.entry;
});

/* ── Theme, Tastatur, Live-Sync ─────────────────────── */

function store(k, v) {
  try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch { return null; }
  return null;
}

function applyTheme(t) {
  if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
}

function toggleTheme() {
  const cur = document.documentElement.dataset.theme
    || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  const next = cur === "light" ? "dark" : "light";
  applyTheme(next);
  store("lagezelt-theme", next);
}

async function reload(force = false) {
  const changed = await loadAll();
  const typing = document.activeElement?.tagName === "INPUT";
  if ((changed || force) && !typing) render();
}

document.addEventListener("keydown", (ev) => {
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
  const inInput = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || "");
  if (ev.key === "Escape" && inInput) { document.activeElement.blur(); return; }
  if (inInput) return;
  const views = ["lage", "rollen", "produkt", "logbuch", "docs"];
  if (/^[1-5]$/.test(ev.key)) { location.hash = views[+ev.key - 1]; return; }
  if (ev.key === "/") {
    ev.preventDefault();
    if (state.view !== "logbuch") location.hash = "logbuch";
    requestAnimationFrame(() => $("#search")?.focus());
    return;
  }
  if (ev.key === "r") reload(true);
  if (ev.key === "t") toggleTheme();
});

$("#btn-reload").addEventListener("click", () => reload(true));
$("#btn-theme").addEventListener("click", toggleTheme);
window.addEventListener("hashchange", route);
window.addEventListener("focus", () => reload());
setInterval(() => {
  const c = $("#clock");
  if (c) c.textContent = new Date().toTimeString().slice(0, 5);
}, 15000);
setInterval(() => { if (document.visibilityState === "visible") reload(); }, 60000);

applyTheme(store("lagezelt-theme"));
loadAll().then(route);
