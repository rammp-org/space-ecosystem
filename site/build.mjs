// Renders the repo's Markdown (PRD, ADRs, node pages, status) into a static site in dist/.
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

const adrs = fs.readdirSync(path.join(ROOT, 'docs/adr')).filter(f => /^\d{4}-.*\.md$/.test(f)).sort().map(f => {
  const { data, content } = matter(read(`docs/adr/${f}`)); data.date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
  return page(`docs/adr/${f}`, `decisions/${data.id}.html`, { kind: 'adr', data, content });
});
const STAGES = ['concept', 'schematic', 'layout', 'bring-up', 'in development', 'in use', 'validated'];
const nodes = fs.readdirSync(path.join(ROOT, 'docs/nodes')).filter(f => f.endsWith('.md')).map(f => {
  const { data, content } = matter(read(`docs/nodes/${f}`));
  return page(`docs/nodes/${f}`, `nodes/${f.replace(/\.md$/, '.html')}`, { kind: 'node', data, content });
}).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
const day = d => d instanceof Date ? d.toISOString().slice(0, 10) : d;
const md = (src, out, kind) => { const { data, content } = matter(read(src)); for (const k in data) data[k] = day(data[k]); return page(src, out, { kind, data, content }); };
const status = md('docs/status.md', 'index.html', 'status');
const arch = md('docs/architecture.md', 'architecture.html', 'doc');
const questions = md('docs/open-questions.md', 'questions.html', 'doc');
const prd = md('PACE_ECOSYSTEM_PRD.md', 'prd.html', 'prd');
const glossary = md('CONTEXT.md', 'glossary.html', 'doc');
page('docs/adr', 'decisions/index.html', { kind: 'adr-index' });
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

const STATUS_CLASS = { met: 'good', partial: 'warning', open: '', accepted: 'good', proposed: 'warning', rejected: 'critical', superseded: '' };
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
const NAV = [['index.html', 'Status'], ['architecture.html', 'Architecture'], ['decisions/index.html', 'Decisions'], ['nodes/index.html', 'Nodes'], ['questions.html', 'Questions'], ['prd.html', 'PRD v0.1'], ['glossary.html', 'Glossary']];

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

const discussUrl = a => `${GH}/issues/new?title=${encodeURIComponent(`ADR-${a.data.id}: ${a.data.title}`)}&labels=decision&body=${encodeURIComponent(`Discussion for [ADR-${a.data.id}](${GH}/blob/${cfg.branch}/${a.src}).\n\n`)}`;
const threadsUrl = a => `${GH}/issues?q=${encodeURIComponent(`is:issue "ADR-${a.data.id}"`)}`;
const pillarTags = ps => (ps || []).map(x => `<span class="pillar p-${x}">${x}</span>`).join('');
const stageChip = n => n.data.needs_info ? `<span class="ax-status warning">Needs info</span>` : `<span class="ax-status ${n.data.stage === 'validated' || n.data.stage === 'in use' ? 'good' : ''}">${esc(cap(n.data.stage))}</span>`;
const today = new Date().toISOString().slice(0, 10);

// ── Pages ───────────────────────────────────────────────────────────
const render = {};

render.status = p => {
  const count = s => reqs.filter(r => r.status === s).length;
  const proposed = adrs.filter(a => a.data.status === 'proposed');
  const high = issues.filter(i => /high/i.test(i.sev));
  const areaRows = Object.entries(AREAS).map(([k, name]) => {
    const rs = reqs.filter(r => r.area === k);
    return { k, name, met: rs.filter(r => r.status === 'Met').length, partial: rs.filter(r => r.status === 'Partial').length, open: rs.filter(r => r.status === 'Open').length, n: rs.length };
  });
  const pillarCol = (k, label) => `<div class="pcol"><div class="ax-label"><span class="pillar p-${k}">${k}</span> ${label}</div>${
    nodes.filter(n => n.data.pillar === k).map(n => `<a class="nodecard" href="${rel(p, n.out)}"><b>${esc(n.data.name)}</b>${stageChip(n)}<span class="ax-sub">${esc(n.data.mcu)}</span></a>`).join('') || '<div class="ax-cap">No nodes yet.</div>'}</div>`;
  const tile = (label, value, sub) => `<div class="ax-tile"><div class="ax-label">${label}</div><div class="ax-value">${value}</div><div class="ax-sub">${sub}</div></div>`;
  const body = `
  <section class="ax-tiles">
    ${tile('Nodes tracked', nodes.length, `${nodes.filter(n => ['validated', 'in use'].includes(n.data.stage)).length} in use or validated`)}
    ${tile('Requirements met', `${count('Met')}<small>of ${reqs.length}</small>`, `${count('Partial')} partial · ${count('Open')} open`)}
    ${tile('Decisions to make', proposed.length, `${adrs.filter(a => a.data.status === 'accepted').length} accepted`)}
    ${tile('High-severity issues', high.length, 'from PRD §14')}
  </section>

  <section class="ax-panel" style="margin-bottom:8px">
    <h2>Nodes by pillar</h2>
    <div class="ax-cap">Every board on or near the SPACE network. Click one for its page.</div>
    <div class="pillars">${pillarCol('S', 'Sensing')}${pillarCol('P', 'Power')}${pillarCol('A', 'Actuation')}${pillarCol('C', 'Control / comms')}</div>
  </section>

  <section class="ax-grid two">
    <div class="ax-panel">
      <h2>Unmet requirements by area</h2>
      <div class="ax-cap">Open plus partial, PRD v0.1 register with the updates below applied</div>
      <svg id="req-bars" data-rows='${esc(JSON.stringify(areaRows.map(a => [a.name, a.open + a.partial])))}'></svg>
    </div>
    <div class="ax-panel">
      <h2>Changed since PRD v0.1</h2>
      <div class="ax-cap">Requirement statuses that moved in other repos</div>
      <table><thead><tr><th>ID</th><th>Was</th><th>Now</th><th>Why</th></tr></thead><tbody>
      ${reqs.filter(r => r.was).map(r => `<tr><td class="ax-n">${r.id}</td><td>${statusChip(r.was)}</td><td>${statusChip(r.status)}</td><td class="note">${esc(r.note)}</td></tr>`).join('')}
      </tbody></table>
    </div>
  </section>

  <section class="ax-panel" style="margin-bottom:8px">
    <h2>Decision queue</h2>
    <div class="ax-cap">Proposed decisions, in the order to grill them</div>
    <table><thead><tr><th>ADR</th><th>Decision</th><th>Pillars</th><th>Status</th></tr></thead><tbody>
    ${adrs.map(a => `<tr><td class="ax-n"><a href="${rel(p, a.out)}">${a.data.id}</a></td><td><a href="${rel(p, a.out)}">${esc(a.data.title)}</a></td><td>${pillarTags(a.data.pillars)}</td><td>${statusChip(a.data.status)}</td></tr>`).join('')}
    </tbody></table>
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
    title: 'SPACE status',
    meta: [`PRD v0.1 · 2026-09-14`, `status ${esc(status.data.updated)}`, `built ${today}`],
    controls: `<a class="ax-btn primary" href="decisions/index.html" data-fx="ripple">Open decisions</a>`,
    body,
  });
};

render.adr = p => {
  const i = adrs.indexOf(p), prev = adrs[i - 1], next = adrs[i + 1];
  const body = `
  <div class="adr-layout">
    <article class="doc">${renderMd(p.content, p).html}</article>
    <aside class="ax-panel side">
      <div class="ax-label">Status</div><div>${statusChip(p.data.status)}</div>
      <div class="ax-label">Pillars</div><div>${pillarTags(p.data.pillars)}</div>
      <div class="ax-label">PRD sections affected</div><div class="ax-mono small">${(p.data.prd || []).map(esc).join(' · ') || 'none'}</div>
      <div class="ax-label">Discussion</div>
      <div class="stack"><a class="ax-btn" href="${threadsUrl(p)}">Read threads</a><a class="ax-btn" href="${discussUrl(p)}">Start a thread</a></div>
    </aside>
  </div>
  <nav class="pager">${prev ? `<a href="${rel(p, prev.out)}">ADR-${prev.data.id} ${esc(prev.data.title)}</a>` : '<span></span>'}${next ? `<a href="${rel(p, next.out)}">ADR-${next.data.id} ${esc(next.data.title)}</a>` : ''}</nav>`;
  return shell(p, { title: `ADR-${p.data.id} ${p.data.title}`, meta: [cap(p.data.status), esc(p.data.date)], body });
};

render['adr-index'] = p => {
  const body = `
  <section class="ax-panel">
    <h2>Architecture decision records</h2>
    <div class="ax-cap">Each ADR is a Markdown file in <code>docs/adr/</code>. Argue in the GitHub thread, then change the file.</div>
    <table><thead><tr><th>ADR</th><th>Decision</th><th>Pillars</th><th>PRD sections</th><th>Status</th><th>Discuss</th></tr></thead><tbody>
    ${adrs.map(a => `<tr><td class="ax-n"><a href="${rel(p, a.out)}">${a.data.id}</a></td><td><a href="${rel(p, a.out)}">${esc(a.data.title)}</a></td><td>${pillarTags(a.data.pillars)}</td><td class="ax-mono small">${(a.data.prd || []).map(esc).join(' · ')}</td><td>${statusChip(a.data.status)}</td><td><a href="${threadsUrl(a)}">threads</a></td></tr>`).join('')}
    </tbody></table>
  </section>
  <section class="doc notes">
    <h2>How a decision moves</h2>
    <p>An ADR starts as <b>proposed</b> with a recommendation and a list of questions. Discussion happens in a GitHub issue titled with the ADR number. When the team agrees, someone edits the file: status becomes <b>accepted</b> (or <b>rejected</b>), the questions get answers, and the PRD sections it names get updated in the same pull request.</p>
  </section>`;
  return shell(p, { title: 'Decisions', meta: [`${adrs.length} records`, `${adrs.filter(a => a.data.status === 'proposed').length} proposed`], body });
};

render.node = p => {
  const d = p.data;
  const facts = [['Pillar', `<span class="pillar p-${d.pillar}">${d.pillar}</span>`], ['Stage', stageChip(p)], ['MCU', esc(d.mcu)], ['Network', esc(d.link)], ['Power', esc(d.power)],
    ['Repos', (d.repos || []).map(r => /^[\w.-]+\/[\w.-]+$/.test(r) ? `<a href="https://github.com/${r}">${esc(r)}</a>` : esc(r)).join('<br>') || '<span class="ax-muted">None yet</span>']];
  const body = `
  <div class="adr-layout">
    <article class="doc">${renderMd(p.content, p).html}</article>
    <aside class="ax-panel side">${facts.map(([k, v]) => `<div class="ax-label">${k}</div><div>${v}</div>`).join('')}</aside>
  </div>`;
  return shell(p, { title: d.full || d.name, meta: [cap(d.stage)], body });
};

render['node-index'] = p => {
  const body = `
  <section class="ax-panel">
    <h2>Nodes</h2>
    <div class="ax-cap">Boards on or near the SPACE network, by pillar. Source: <code>docs/nodes/</code>.</div>
    <table><thead><tr><th>Node</th><th>Pillar</th><th>Stage</th><th>MCU</th><th>Network today</th></tr></thead><tbody>
    ${nodes.map(n => `<tr><td><a href="${rel(p, n.out)}">${esc(n.data.full || n.data.name)}</a></td><td><span class="pillar p-${n.data.pillar}">${n.data.pillar}</span></td><td>${stageChip(n)}</td><td>${esc(n.data.mcu)}</td><td>${esc(n.data.link)}</td></tr>`).join('')}
    </tbody></table>
  </section>`;
  return shell(p, { title: 'Nodes', meta: [`${nodes.length} nodes`], body });
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
