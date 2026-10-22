// Renders the repo's Markdown (overview, decisions, module pages, status, PRD) into a static site in dist/.
// Run from site/: `node build.mjs`. No framework; one page template, alex-style tokens.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { gfmHeadingId, getHeadingList, resetHeadings } from 'marked-gfm-heading-id';

const SITE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SITE, '..');
const OUT = path.join(SITE, 'dist');
const cfg = JSON.parse(fs.readFileSync(path.join(SITE, 'site.config.json'), 'utf8'));
const GH = `https://github.com/${cfg.repo}`;

const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const posix = p => p.split(path.sep).join('/');

// ── Sources ─────────────────────────────────────────────────────────
// Every page: source path (repo-relative) -> output path (dist-relative).
const pages = [];
const page = (src, out, extra = {}) => { const p = { src, out, ...extra }; pages.push(p); return p; };

const AREAS_D = ['Scope', 'Power', 'Safety', 'Network', 'Platform'];
const decisions = fs.readdirSync(path.join(ROOT, 'docs/decisions')).filter(f => f.endsWith('.md')).map(f => {
  const { data, content } = matter(read(`docs/decisions/${f}`));
  return page(`docs/decisions/${f}`, `decisions/${f.replace(/\.md$/, '.html')}`, { kind: 'decision', data, content, slug: f.replace(/\.md$/, '') });
}).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
const bySlug = new Map(decisions.map(d => [d.slug, d]));
const STAGES = ['concept', 'schematic', 'layout', 'bring-up', 'in development', 'in use', 'validated'];
const nodes = fs.readdirSync(path.join(ROOT, 'docs/nodes')).filter(f => f.endsWith('.md')).map(f => {
  const { data, content } = matter(read(`docs/nodes/${f}`));
  return page(`docs/nodes/${f}`, `nodes/${f.replace(/\.md$/, '.html')}`, { kind: 'node', data, content });
}).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
const day = d => d instanceof Date ? d.toISOString().slice(0, 10) : d;
const md = (src, out, kind) => { const { data, content } = matter(read(src)); for (const k in data) data[k] = day(data[k]); return page(src, out, { kind, data, content }); };
const overview = md('docs/overview.md', 'index.html', 'overview');
const status = md('docs/status.md', 'status.html', 'status');
const arch = md('docs/architecture.md', 'architecture.html', 'doc');
const prd = md('PACE_ECOSYSTEM_PRD.md', 'prd.html', 'prd');
const glossary = md('CONTEXT.md', 'glossary.html', 'doc');
page('docs/decisions', 'decisions/index.html', { kind: 'decision-index' });
page('docs/nodes', 'nodes/index.html', { kind: 'node-index' });

const bySrc = new Map(pages.map(p => [p.src, p]));

// ── Markdown ────────────────────────────────────────────────────────
// Relative .md links are rewritten to the rendered page, relative to the page being built.
function renderMd(text, cur) {
  const m = new Marked({ gfm: true });
  m.use(gfmHeadingId());
  m.use({
    walkTokens(t) {
      if (t.type !== 'link' || /^[a-z]+:|^#/i.test(t.href)) return;
      const [file, hash] = t.href.split('#');
      const target = bySrc.get(posix(path.normalize(path.join(path.dirname(cur.src), file))));
      t.href = target ? rel(cur, target.out) + (hash ? '#' + hash : '') : `${GH}/blob/${cfg.branch}/${posix(path.normalize(path.join(path.dirname(cur.src), file)))}`;
    },
  });
  resetHeadings();
  const html = m.parse(text);
  return { html: decorate(html), headings: getHeadingList() };
}
const rel = (from, to) => posix(path.relative(path.dirname(from.out), to)) || path.basename(to);

const STATUS_CLASS = { met: 'good', partial: 'warning', open: '', decided: 'good', leaning: 'warning', parked: '', accepted: 'good', proposed: 'warning', rejected: 'critical', superseded: '' };
const statusChip = s => `<span class="ax-status ${STATUS_CLASS[String(s).toLowerCase()] ?? ''}">${esc(cap(s))}</span>`;
const cap = s => String(s).charAt(0).toUpperCase() + String(s).slice(1);

// Table cells that hold only a status word become a status square + word. Tags become labels.
function decorate(html) {
  return html
    .replace(/<td>(?:<strong>)?(Met|Partial|Open)(?:<\/strong>)?((?: \([^<]*\))?)<\/td>/g, (_, s, rest) => `<td>${statusChip(s)}${rest ? `<span class="ax-muted">${rest}</span>` : ''}</td>`)
    .replace(/\[(MEASURED|PROPOSED)(?:[^\]]*)\]/g, (m, k) => `<span class="tag tag-${k.toLowerCase()}">${esc(m.slice(1, -1))}</span>`)
    .replace(/<table>/g, '<div class="tbl"><table>').replace(/<\/table>/g, '</table></div>');
}

// ── PRD tables parsed for the status page ───────────────────────────
const AREAS = { E: 'Ecosystem', H: 'Racer HW', F: 'Racer FW', B: 'ABC', T: 'Bench', S: 'Safety' };
const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
const plain = s => s.replace(/\*\*/g, '').replace(/`/g, '');
const reqs = prd.content.split('\n').filter(l => /^\| [EHFBTS]-\d\d \|/.test(l)).map(l => {
  const c = cells(l);
  const raw = plain(c[3]);
  return { id: c[0], text: plain(c[1]), priority: plain(c[2]), status: raw.split(/[\s(]/)[0], area: c[0][0] };
});
const overrides = new Map((status.data.overrides || []).map(o => [o.id, o]));
for (const r of reqs) { const o = overrides.get(r.id); if (o) { r.was = r.status; r.status = o.status; r.note = o.note; } }

const section = (title) => { const i = prd.content.indexOf(title); const rest = prd.content.slice(i); const end = rest.indexOf('\n## ', 5); return end > 0 ? rest.slice(0, end) : rest; };
const issues = section('## 14. Known issues').split('\n').filter(l => /^\| \d+ \|/.test(l)).map(l => { const c = cells(l); return { n: c[0], item: plain(c[1]), sev: plain(c[2]), area: c[3], fix: plain(c[4]) }; });
const roadmap = section('### 15.1').split('\n').filter(l => /^\| \*\*R\d/.test(l)).map(l => { const c = cells(l); return { m: plain(c[0]).replace(' — ', ': '), what: plain(c[1]), exit: plain(c[2]) }; });

// ── Template ────────────────────────────────────────────────────────
const NAV = [['index.html', 'Overview'], ['status.html', 'Status'], ['architecture.html', 'Architecture'], ['decisions/index.html', 'Decisions'], ['nodes/index.html', 'Modules'], ['prd.html', 'PRD v0.1'], ['glossary.html', 'Glossary']];

function shell(p, { title, meta = [], controls = '', body, wide = false }) {
  const to = target => rel(p, target);
  const section = p.out.split('/')[0];
  const nav = NAV.map(([href, label]) => {
    const on = href === p.out || (href.includes('/') && href.split('/')[0] === section);
    return `<a href="${to(href)}"${on ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');
  const editable = fs.existsSync(path.join(ROOT, p.src)) && fs.statSync(path.join(ROOT, p.src)).isFile();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · ${cfg.title}</title>
<script>document.documentElement.dataset.mode = localStorage.getItem('space-mode') || 'dark';</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Condensed:wght@500;700&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${to('assets/vendor/tokens.css')}">
<link rel="stylesheet" href="${to('assets/site.css')}">
<script src="${to('assets/vendor/ax-fx.js')}" defer></script>
<script src="${to('assets/vendor/ax-charts.js')}" defer></script>
<script src="${to('assets/site.js')}" defer></script>
</head>
<body class="ax">
<main class="ax-page${wide ? ' wide' : ''}">
  <nav class="nav"><a class="brand" href="${to('index.html')}">${cfg.title}</a>${nav}</nav>
  <header class="ax-mast">
    <div>
      <h1>${esc(title)}</h1>
      ${meta.length ? `<div class="ax-meta">${meta.map(m => `<span>${m}</span>`).join('')}</div>` : ''}
    </div>
    <div class="controls">${controls}<button class="ax-btn" id="mode-toggle" type="button">Light mode</button></div>
  </header>
${body}
  <footer class="foot">
    <span>${cfg.title}: ${esc(cfg.longTitle)}</span>
    ${editable ? `<a href="${GH}/edit/${cfg.branch}/${p.src}">Edit this page</a><a href="${GH}/commits/${cfg.branch}/${p.src}">History</a>` : ''}
  </footer>
</main>
</body>
</html>`;
}

const discussUrl = d => `${GH}/issues/new?title=${encodeURIComponent(d.data.question)}&labels=decision&body=${encodeURIComponent(`Discussion for [${d.data.question}](${GH}/blob/${cfg.branch}/${d.src}).\n\n`)}`;
const threadsUrl = d => `${GH}/issues?q=${encodeURIComponent(`is:issue "${d.slug}"`)}`;
const FAMILIES = ['Power distribution', 'Motor drive', 'I/O node', 'Net infrastructure'];
const modules = nodes.filter(n => n.data.kind !== 'application'), apps = nodes.filter(n => n.data.kind === 'application');
const decisionRows = (p, ds) => `<table><thead><tr><th>Question</th><th>Status</th><th>Source</th></tr></thead><tbody>${ds.map(d => `<tr><td><a href="${rel(p, d.out)}">${esc(d.data.question)}</a></td><td>${statusChip(d.data.status)}</td><td class="note">${esc(d.data.source)}</td></tr>`).join('')}</tbody></table>`;
const pillarTags = ps => (ps || []).map(x => `<span class="pillar p-${x}">${x}</span>`).join('');
const stageChip = n => n.data.needs_info ? `<span class="ax-status warning">Needs info</span>` : `<span class="ax-status ${n.data.stage === 'validated' || n.data.stage === 'in use' ? 'good' : ''}">${esc(cap(n.data.stage))}</span>`;
const today = new Date().toISOString().slice(0, 10);

// ── Pages ───────────────────────────────────────────────────────────
const render = {};

render.status = p => {
  const count = s => reqs.filter(r => r.status === s).length;
  const live = decisions.filter(d => ['open', 'leaning'].includes(d.data.status));
  const high = issues.filter(i => /high/i.test(i.sev));
  const areaRows = Object.entries(AREAS).map(([k, name]) => {
    const rs = reqs.filter(r => r.area === k);
    return { k, name, met: rs.filter(r => r.status === 'Met').length, partial: rs.filter(r => r.status === 'Partial').length, open: rs.filter(r => r.status === 'Open').length, n: rs.length };
  });
  const pillarCol = (k, label) => `<div class="pcol"><div class="ax-label">${label}</div>${
    (k === 'apps' ? apps : modules.filter(n => n.data.family === k)).map(n => `<a class="nodecard" href="${rel(p, n.out)}"><b>${esc(n.data.name)}</b>${stageChip(n)}<span class="ax-sub">${esc(n.data.mcu)}</span></a>`).join('') || '<div class="ax-cap">No nodes yet.</div>'}</div>`;
  const tile = (label, value, sub) => `<div class="ax-tile"><div class="ax-label">${label}</div><div class="ax-value">${value}</div><div class="ax-sub">${sub}</div></div>`;
  const body = `
  <section class="ax-tiles">
    ${tile('Modules', modules.length, `${apps.length} applications built on them`)}
    ${tile('Requirements met', `${count('Met')}<small>of ${reqs.length}</small>`, `${count('Partial')} partial · ${count('Open')} open`)}
    ${tile('Decisions to make', live.length, `${decisions.filter(d => d.data.status === 'decided').length} decided`)}
    ${tile('High-severity issues', high.length, 'from PRD §14')}
  </section>

  <section class="ax-panel" style="margin-bottom:8px">
    <h2>Modules by family, and the applications built on them</h2>
    <div class="ax-cap">Source: the October deck, PRD v0.1, the bus bar brief, and boards found in rammp-org repos (not yet confirmed with their owners).</div>
    <div class="pillars five">${FAMILIES.map(f => pillarCol(f, f)).join('')}${pillarCol('apps', 'Applications')}</div>
  </section>

  <section class="ax-grid two">
    <div class="ax-panel">
      <h2>Unmet requirements by area</h2>
      <div class="ax-cap">Open plus partial, PRD v0.1 register with the updates below applied</div>
      <svg id="req-bars" data-rows='${esc(JSON.stringify(areaRows.map(a => [a.name, a.open + a.partial])))}'></svg>
    </div>
    <div class="ax-panel">
      <h2>Changed since PRD v0.1</h2>
      <div class="ax-cap">Found by reading other rammp-org repos after the PRD was written. Verify with the owners.</div>
      <table><thead><tr><th>ID</th><th>Was</th><th>Now</th><th>Why</th></tr></thead><tbody>
      ${reqs.filter(r => r.was).map(r => `<tr><td class="ax-n">${r.id}</td><td>${statusChip(r.was)}</td><td>${statusChip(r.status)}</td><td class="note">${esc(r.note)}</td></tr>`).join('')}
      </tbody></table>
    </div>
  </section>

  <section class="ax-panel" style="margin-bottom:8px">
    <h2>Decisions still to make</h2>
    <div class="ax-cap">Open and leaning. The full list, including decided and parked, is on the decisions page.</div>
    ${decisionRows(p, live)}
  </section>

  <section class="ax-grid two">
    <div class="ax-panel">
      <h2>Known issues</h2>
      <div class="ax-cap">High and medium severity, PRD v0.1 §14</div>
      <table><thead><tr><th class="num">#</th><th>Issue</th><th>Severity</th></tr></thead><tbody>
      ${issues.filter(i => /high|medium/i.test(i.sev)).map(i => `<tr><td class="num">${i.n}</td><td>${esc(i.item)}</td><td><span class="ax-status ${/high/i.test(i.sev) ? 'critical' : 'warning'}">${esc(i.sev)}</span></td></tr>`).join('')}
      </tbody></table>
    </div>
    <div class="ax-panel">
      <h2>Roadmap, next quarter</h2>
      <div class="ax-cap">Written before the SPACE direction. Re-plan once the decisions settle.</div>
      <table><thead><tr><th>Milestone</th><th>Exit criteria</th></tr></thead><tbody>
      ${roadmap.map(r => `<tr><td>${esc(r.m)}</td><td>${esc(r.exit)}</td></tr>`).join('')}
      </tbody></table>
    </div>
  </section>

  <section class="doc notes">${renderMd(p.content, p).html}</section>`;
  return shell(p, {
    title: 'Engineering status',
    meta: [`PRD v0.1 · 2026-09-14`, `status ${esc(status.data.updated)}`, `built ${today}`],
    controls: `<a class="ax-btn" href="decisions/index.html">Decisions</a>`,
    body,
  });
};

render.overview = p => {
  const d = p.data, to = t => rel(p, t.replace(/\.md$/, '.html').replace(/^nodes\//, 'nodes/'));
  const li = xs => `<ul class="plain">${xs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const pairs = xs => xs.map(([k, v]) => `<div class="pair"><div class="ax-label">${esc(k)}</div><div>${esc(v)}</div></div>`).join('');
  const sec = (title, cap, inner, cls = '') => `<section class="ax-panel ov ${cls}"><h2>${title}</h2>${cap ? `<div class="ax-cap">${cap}</div>` : ''}${inner}</section>`;
  const fam = f => `<a class="famcard" href="${rel(p, f.node.replace(/\.md$/, '.html'))}"><div class="ax-label">${esc(f.name)}</div><b>${esc(f.label)}</b><span class="ax-status ${f.stage === 'in use' ? 'good' : ''}">${esc(cap(f.stage))}</span><p>${esc(f.what)}</p></a>`;
  const body = `
  <section class="hero">
    <p class="lede">${esc(d.lede)}</p>
    <p class="principle">${esc(d.principle)}</p>
  </section>

  <section class="ax-tiles">${d.racer.map(([v, u, s]) => `<div class="ax-tile"><div class="ax-label">The Racer today</div><div class="ax-value">${esc(v)}<small>${esc(u)}</small></div><div class="ax-sub">${esc(s)}</div></div>`).join('')}</section>
  <div class="ax-cap note">${esc(d.racer_note)}</div>

  <div class="ax-grid two">
    ${sec('Why SPACE', 'Lab robots rarely reach the people who need them', pairs(d.why) + `<p class="ax-muted">${esc(d.why_note)}</p>`)}
    ${sec('The correct solution was harder', 'Out-of-spec lab hardware', li(d.lab_pain) + `<p><b>${esc(d.principle)}</b></p>`)}
  </div>
  ${sec('The same robots keep coming up', 'Each needs bespoke power, actuation, and comms', `<div class="ax-grid two">${pairs(d.robots)}</div><p><span class="ax-label">One shared shape</span><br>${esc(d.shared_shape)}</p>`)}

  <div class="ax-grid two">
    ${sec('Compute at the edge', 'Every actuator is a full network node', li(d.edge) + `<p class="close">${esc(d.edge_close)}</p>`)}
    ${sec('Nodes with headroom simplify the main computer', 'Complexity moves into the modules, and the system gets simpler', pairs(d.headroom))}
  </div>

  <div class="ax-grid two">
    ${sec('SPACE and ATOS: where the seam is', '', li(d.atos))}
    ${sec('What exists next door', 'And what each is missing', pairs(d.compare))}
  </div>

  ${sec('Module families', 'From the deck. Click a family for its current page.', `<div class="fams">${d.families.map(fam).join('')}</div>`)}

  ${sec('Three form factors for three stages of a project', esc(d.pathway_note), `<div class="fams">${d.pathway.map(([stage, name, what]) => `<div class="famcard"><div class="ax-label">${esc(stage)}</div><b>${esc(name)}</b><p>${esc(what)}</p></div>`).join('')}</div>`)}

  <div class="ax-grid two">
    ${sec('Design principles', '', `<ol class="principles">${d.principles.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`)}
    ${sec('What SPACE is not', 'Open: does anyone disagree with any item on this list?', li(d.is_not))}
  </div>

  <div class="ax-grid two">
    ${sec('Power classes follow the robot', esc(d.power_note), `<table><thead><tr><th>Class</th><th>Current</th><th>Robots</th></tr></thead><tbody>${d.power_classes.map(([a, n, r]) => `<tr><td>${esc(n)}</td><td class="num">${esc(a)}</td><td>${esc(r)}</td></tr>`).join('')}</tbody></table>`)}
    ${sec('Load shedding in four layers', 'From polite to absolute', `<table><thead><tr><th class="num">#</th><th>Layer</th><th>What happens</th></tr></thead><tbody>${d.shedding.map(([l, w], i) => `<tr><td class="num">${i + 1}</td><td>${esc(l)}</td><td>${esc(w)}</td></tr>`).join('')}</tbody></table>`)}
  </div>

  <div class="ax-grid two">
    ${sec('The network', '', `<p>${esc(d.network)}</p>`)}
    ${sec('Every module ships with its evidence', 'Knowledge that lives with the design lets open hardware reach more places', li(d.evidence))}
  </div>

  ${sec('Open questions from the deck', 'Each links to its decision page, which records what has happened since', `<table><thead><tr><th>Question</th><th>Status now</th></tr></thead><tbody>${d.open.map(o => { const x = bySlug.get(o.decision); return `<tr><td>${x ? `<a href="${rel(p, x.out)}">${esc(o.q)}</a>` : esc(o.q)}</td><td>${x ? statusChip(x.data.status) : ''}</td></tr>`; }).join('')}</tbody></table>`)}

  <section class="ax-panel ov since">
    <h2>Since the deck</h2>
    <div class="ax-cap">New direction, not in the presentation</div>
    <p>Sensing joins the name: SPACE. Smart bus bars, managed switches, and single-pair Ethernet (10BASE-T1S, 100BASE-T1) for smaller components, with RJ45 kept for high-compute nodes. The <a href="${rel(p, 'nodes/smart-bus-bar.html')}">smart bus bar brief</a> is the first concrete piece. Every open question, from the deck, the bus bar brief, the PRD, and our grilling sessions, is on the <a href="${rel(p, 'decisions/index.html')}">decisions page</a>.</p>
  </section>`;
  return shell(p, { title: 'SPACE', meta: ['Sensing, Power, Actuation, and Control Electronics', esc(d.source)], controls: `<a class="ax-btn primary" href="${rel(p, 'decisions/index.html')}" data-fx="ripple">Decisions</a>`, body });
};

render.decision = p => {
  const draft = p.data.draft ? `<div class="banner ax-panel">The background on this page was drafted by Claude on 2026-10-19 and has not been reviewed by the team.</div>` : '';
  const sibs = decisions.filter(d => d.data.area === p.data.area), i = sibs.indexOf(p), prev = sibs[i - 1], next = sibs[i + 1];
  const body = `${draft}
  <div class="adr-layout">
    <article class="doc">${renderMd(p.content, p).html}</article>
    <aside class="ax-panel side">
      <div class="ax-label">Status</div><div>${statusChip(p.data.status)}</div>
      <div class="ax-label">Area</div><div>${esc(p.data.area)}</div>
      <div class="ax-label">Came from</div><div class="small">${esc(p.data.source)}</div>
      <div class="ax-label">Discussion</div>
      <div class="stack"><a class="ax-btn" href="${threadsUrl(p)}">Read threads</a><a class="ax-btn" href="${discussUrl(p)}">Start a thread</a></div>
    </aside>
  </div>
  <nav class="pager">${prev ? `<a href="${rel(p, prev.out)}">${esc(prev.data.question)}</a>` : '<span></span>'}${next ? `<a href="${rel(p, next.out)}">${esc(next.data.question)}</a>` : ''}</nav>`;
  return shell(p, { title: p.data.question, meta: [esc(p.data.area), cap(p.data.status)], body });
};

render['decision-index'] = p => {
  const count = st => decisions.filter(d => d.data.status === st).length;
  const body = `
  <section class="ax-tiles">${['open', 'leaning', 'decided', 'parked'].map(st => `<div class="ax-tile"><div class="ax-label">${cap(st)}</div><div class="ax-value">${count(st)}</div><div class="ax-sub">${{ open: 'not discussed or no lean yet', leaning: 'a recommendation to confirm', decided: 'settled; change it in a PR', parked: 'revisit later' }[st]}</div></div>`).join('')}</section>
  ${AREAS_D.map(a => `<section class="ax-panel ov"><h2>${a}</h2>${decisionRows(p, decisions.filter(d => d.data.area === a))}</section>`).join('')}
  <section class="doc notes">
    <h2>How a decision moves</h2>
    <p>Each question is a Markdown file in <code>docs/decisions/</code>. It starts <b>open</b>. When someone proposes an answer it becomes <b>leaning</b>. Talk it through in a GitHub thread (the buttons on each page), then edit the file: set <b>decided</b> and write the answer, or <b>parked</b> if it can wait.</p>
  </section>`;
  return shell(p, { title: 'Decisions', meta: [`${decisions.length} questions`, 'from the deck, the bus bar brief, PRD v0.1, and grilling sessions'], body });
};

render.node = p => {
  const d = p.data;
  const facts = [[d.kind === 'application' ? 'Application' : 'Family', esc(d.family)], ['Pillars', pillarTags(d.pillars)], ['Stage', stageChip(p)], ['MCU', esc(d.mcu)], ['Network', esc(d.link)], ['Power', esc(d.power)],
    ['Repos', (d.repos || []).map(r => /^[\w.-]+\/[\w.-]+$/.test(r) ? `<a href="https://github.com/${r}">${esc(r)}</a>` : esc(r)).join('<br>') || '<span class="ax-muted">None yet</span>']];
  const body = `
  <div class="adr-layout">
    <article class="doc">${renderMd(p.content, p).html}</article>
    <aside class="ax-panel side">${facts.map(([k, v]) => `<div class="ax-label">${k}</div><div>${v}</div>`).join('')}</aside>
  </div>`;
  return shell(p, { title: d.full || d.name, meta: [cap(d.stage)], body });
};

render['node-index'] = p => {
  const row = n => `<tr><td><a href="${rel(p, n.out)}">${esc(n.data.full || n.data.name)}</a></td><td>${pillarTags(n.data.pillars)}</td><td>${stageChip(n)}</td><td>${esc(n.data.mcu)}</td><td>${esc(n.data.link)}</td></tr>`;
  const table = ns => `<table><thead><tr><th>Board</th><th>Pillars</th><th>Stage</th><th>MCU</th><th>Network today</th></tr></thead><tbody>${ns.map(row).join('')}</tbody></table>`;
  const body = `
  ${FAMILIES.map(f => `<section class="ax-panel ov"><h2>${f}</h2>${table(modules.filter(n => n.data.family === f))}</section>`).join('')}
  <section class="ax-panel ov"><h2>Applications</h2><div class="ax-cap">Several modules put together for one robot. Robot-specific logic lives here, not in the modules.</div>${table(apps)}</section>`;
  return shell(p, { title: 'Modules', meta: [`${modules.length} modules`, `${apps.length} applications`, 'pillar tags: S sensing, P power, A actuation, C control'], body });
};

render.doc = p => {
  const { html } = renderMd(p.content.replace(/^# .*\n/, ''), p);
  const title = p.data.title || (p.content.match(/^# (.*)/m) || [, 'Untitled'])[1].replace(/:.*/, '');
  return shell(p, { title, meta: p.data.subtitle ? [esc(p.data.subtitle)] : [], body: `<article class="doc">${html}</article>` });
};

render.prd = p => {
  const { html, headings } = renderMd(p.content.replace(/^# .*\n/, '').replace(/## Table of contents[\s\S]*?\n---\n/, ''), p);
  const toc = headings.filter(h => h.level === 2 && /^\d/.test(h.raw ?? h.text)).map(h => `<a href="#${h.id}">${esc(h.raw ?? h.text)}</a>`).join('');
  const body = `
  <div class="banner ax-panel">This is the PRD as written on 2026-09-14, when the project was PACE and before the single-pair Ethernet direction. It is a baseline. Current status is on the <a href="index.html">status page</a>, and proposed changes are in the <a href="decisions/index.html">decisions</a>.</div>
  <div class="prd-layout">
    <nav class="toc"><div class="ax-label">Contents</div>${toc}</nav>
    <article class="doc">${html}</article>
  </div>`;
  return shell(p, { title: 'PRD v0.1 (baseline)', meta: ['PACE Ecosystem PRD', '2026-09-14', 'draft for review'], body, wide: true });
};

// ── Write ───────────────────────────────────────────────────────────
fs.rmSync(OUT, { recursive: true, force: true });
for (const p of pages) {
  const html = render[p.kind](p);
  const file = path.join(OUT, p.out);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
fs.cpSync(path.join(SITE, 'assets'), path.join(OUT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log(`built ${pages.length} pages -> ${posix(path.relative(process.cwd(), OUT)) || '.'} (${reqs.length} requirements, ${issues.length} issues, ${roadmap.length} milestones)`);
