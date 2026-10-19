// Mode toggle, status-page chart, and PRD contents highlighting.
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('mode-toggle');
  const label = () => { if (btn) btn.textContent = root.dataset.mode === 'light' ? 'Dark mode' : 'Light mode'; };
  label();
  btn?.addEventListener('click', () => {
    root.dataset.mode = root.dataset.mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('space-mode', root.dataset.mode);
    label(); drawCharts();
  });

  function drawCharts() {
    const svg = document.getElementById('req-bars');
    if (!svg || !window.axBars) return;
    const rows = JSON.parse(svg.dataset.rows);
    const max = Math.max(...rows.map(r => r[1]));
    axBars(svg, { rows, max: Math.ceil(max / 5) * 5, width: 460, xLabel: 'Requirements open or partial, count', yLabel: 'Area' });
  }
  drawCharts();

  const toc = document.querySelector('.toc');
  if (toc) {
    const links = [...toc.querySelectorAll('a')];
    const targets = links.map(a => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter(Boolean);
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('on', a.hash.slice(1) === e.target.id));
    }), { rootMargin: '0px 0px -70% 0px' });
    targets.forEach(t => io.observe(t));
  }
})();
