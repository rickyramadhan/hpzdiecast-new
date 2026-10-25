/* HPZ Academy: article step rail, reading bar, checklist (localStorage) and index helpers.
   Steps are built client-side from the <h2> headings in the article body. */
(function () {
  const H = window.HPZ;
  const qs = (r, s) => r.querySelector(s);
  const qsa = (r, s) => Array.from(r.querySelectorAll(s));
  const KEY = h => 'guide.' + h;
  const doneOf = h => { const v = H.LS.get(KEY(h), []); return Array.isArray(v) ? v : []; };
  const totalOf = h => +H.LS.get(KEY(h) + '.n', 0) || 0;
  const pad = n => String(n).padStart(2, '0');
  let cleanup = [];

  /* ---------- article ---------- */
  function initArticle(root) {
    const handle = root.dataset.handle;
    const content = qs(root, '#ar-content');
    const arb = qs(root, '[data-arb]');
    const rail = qs(root, '#rail-s');
    const host = qs(root, '#ar-body');
    const bar = document.getElementById('readbar');
    if (!content || !handle) return;
    const lblTip = root.dataset.lblTip, lblWarn = root.dataset.lblWarn;

    /* callouts: <p|div class="callout tip|warn"> -> .co block */
    qsa(content, '.callout').forEach(el => {
      const warn = el.classList.contains('warn');
      const inner = el.innerHTML.trim();
      const body = /<p[\s>]/i.test(inner) ? inner : '<p>' + inner + '</p>';
      const aside = document.createElement('aside');
      aside.className = 'co ' + (warn ? 'co-warn' : 'co-tip');
      aside.innerHTML = '<span class="co-ic">' + (warn ? '!' : (H.ICON && H.ICON.info) || 'i') + '</span><div><b>' + H.esc(warn ? lblWarn : lblTip) + '</b>' + body + '</div>';
      el.replaceWith(aside);
    });

    const nodes = Array.from(content.childNodes);
    const heads = nodes.filter(n => n.nodeType === 1 && n.tagName === 'H2');
    if (!heads.length) { arb.classList.add('no-rail'); return; }

    /* split into intro + step articles */
    const frag = document.createDocumentFragment();
    const intro = document.createElement('div'); intro.className = 'ar-intro';
    let cur = null, i = -1;
    const N = heads.length;
    nodes.forEach(n => {
      if (n.nodeType === 1 && n.tagName === 'H2') {
        i++;
        cur = document.createElement('article'); cur.className = 'st'; cur.id = 'step-' + (i + 1); cur.dataset.st = i;
        const head = document.createElement('div'); head.className = 'st-h';
        head.innerHTML = '<span class="st-num mono">' + pad(i + 1) + '</span><div><span class="mono st-m">' + H.t('Step', 'Langkah', 'ステップ') + ' ' + (i + 1) + ' / ' + N + '</span></div>';
        n.classList.add('h3'); head.lastChild.appendChild(n);
        const b = document.createElement('div'); b.className = 'st-b'; cur.appendChild(head); cur.appendChild(b);
        cur._b = b; frag.appendChild(cur);
      } else if (cur) cur._b.appendChild(n);
      else intro.appendChild(n);
    });
    content.innerHTML = '';
    if (intro.childNodes.length && intro.textContent.trim() + intro.querySelectorAll('img,iframe,table').length) content.appendChild(intro);
    content.appendChild(frag);

    let done = doneOf(handle).filter(x => x < N);
    H.LS.set(KEY(handle) + '.n', N);
    const steps = qsa(content, '[data-st]');

    /* rail + checkbox per step */
    const ol = qs(rail, 'ol');
    ol.innerHTML = steps.map((st, k) => '<li><a href="#step-' + (k + 1) + '" data-rs="' + k + '" class="' + (done.includes(k) ? 'is-done' : '') + '"><span class="rs-n mono">' + pad(k + 1) + '</span><span class="rs-t">' + H.esc(st.querySelector('h2').textContent) + '</span><span class="rs-ck">' + H.ICON.check + '</span></a></li>').join('');
    steps.forEach((st, k) => {
      const on = done.includes(k);
      st.classList.toggle('is-done', on);
      const lab = document.createElement('label'); lab.className = 'mk';
      lab.innerHTML = '<input type="checkbox" data-mk="' + k + '"' + (on ? ' checked' : '') + '><span class="mk-box">' + H.ICON.tick + '</span><span class="mk-t">' + (on ? H.t('Done', 'Selesai', '完了') : H.t('Mark step done', 'Tandai selesai', '完了にする')) + '</span>';
      qs(st, '.st-b').appendChild(lab);
    });
    rail.hidden = false;
    const sn = qs(root, '[data-meta-steps]'); if (sn) { sn.hidden = false; qs(sn, '[data-steps-n]').textContent = N; }
    const mp = qs(root, '[data-meta-progress]'); if (mp) mp.hidden = false;
    const fin = qs(root, '#fin'); fin.hidden = false;

    const R = 21, L = 2 * Math.PI * R, ring = qs(root, '#ar-ring');
    if (ring) ring.style.strokeDasharray = L;

    function upd(fromClick) {
      const n = done.length, pc = n / N;
      if (ring) ring.style.strokeDashoffset = L - L * pc;
      qs(root, '#ar-pt').textContent = n + ' / ' + N;
      qs(root, '#rs-bar').style.width = pc * 100 + '%';
      qs(root, '#rs-n').textContent = n + '/' + N + ' ' + H.t('done', 'selesai', '完了');
      fin.className = 'fin' + (n === N ? ' is-done' : '');
      fin.innerHTML = n === N
        ? '<span class="fin-badge mono">' + H.ICON.check + '</span><div><b>' + H.t('Guide complete', 'Panduan selesai', 'ガイド完了') + '</b><p>' + H.t('Nice work. Share the result with #hpzacademy.', 'Kerja bagus. Bagikan hasilnya dengan #hpzacademy.', 'お疲れさまでした。#hpzacademy で共有を。') + '</p></div><button class="btn btn-sm btn-line" type="button" id="fin-reset">' + H.t('Reset checklist', 'Reset checklist', 'リセット') + '</button>'
        : '<span class="mono fin-n">' + n + '/' + N + '</span><div><b>' + (n ? H.t('Keep going', 'Lanjutkan', 'その調子') : H.t('Track your progress', 'Catat progresmu', '進捗を記録')) + '</b><p>' + H.t('Tick each step as you finish it. Your checklist is saved on this device, so you can come back mid-build.', 'Centang tiap langkah. Checklist tersimpan di perangkat ini, jadi bisa lanjut kapan saja.', '各ステップにチェック。この端末に保存されます。') + '</p></div>' + (n ? '<button class="btn btn-sm btn-ghost" type="button" id="fin-reset">' + H.t('Reset', 'Reset', 'リセット') + '</button>' : '');
      const rs = qs(root, '#fin-reset');
      if (rs) rs.onclick = () => { done = []; H.LS.set(KEY(handle), done); qsa(root, '[data-mk]').forEach(c => { c.checked = false; setStep(+c.dataset.mk, false); }); upd(); };
      if (fromClick && n === N) { fin.classList.add('is-pop'); if (H.toast) H.toast({ title: H.t('Guide complete', 'Panduan selesai', 'ガイド完了'), sub: root.querySelector('h1').textContent, icon: H.ICON.check }); }
    }
    function setStep(k, on) {
      const st = qs(root, '[data-st="' + k + '"]'), a = qs(root, '[data-rs="' + k + '"]');
      st.classList.toggle('is-done', on); a.classList.toggle('is-done', on);
      qs(st, '.mk-t').textContent = on ? H.t('Done', 'Selesai', '完了') : H.t('Mark step done', 'Tandai selesai', '完了にする');
      if (on) { st.classList.remove('is-flash'); void st.offsetWidth; st.classList.add('is-flash'); }
    }
    root.addEventListener('change', e => {
      const c = e.target.closest('[data-mk]'); if (!c) return;
      const k = +c.dataset.mk;
      done = c.checked ? [...new Set([...done, k])].sort((a, b) => a - b) : done.filter(x => x !== k);
      H.LS.set(KEY(handle), done); setStep(k, c.checked); upd(true);
      if (c.checked && k < N - 1 && done.length < N) {
        const nx = qs(root, '#step-' + (k + 2));
        if (nx && nx.getBoundingClientRect().top > innerHeight * .85) setTimeout(() => nx.scrollIntoView({ behavior: 'smooth', block: 'start' }), 450);
      }
    });
    rail.addEventListener('click', e => {
      const a = e.target.closest('[data-rs]'); if (!a) return;
      e.preventDefault(); qs(root, '#step-' + (+a.dataset.rs + 1)).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    /* scroll spy */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => {
        es.forEach(e => {
          if (!e.isIntersecting) return;
          const k = e.target.dataset.st;
          qsa(root, '[data-rs]').forEach(a => a.classList.toggle('is-cur', a.dataset.rs === k));
        });
      }, { rootMargin: '-35% 0px -60% 0px' });
      steps.forEach(s => io.observe(s));
      cleanup.push(() => io.disconnect());
    }
    /* reading progress bar */
    const onScroll = () => {
      if (!bar) return;
      const r = host.getBoundingClientRect(), total = r.height - innerHeight * .6;
      const p = Math.max(0, Math.min(1, (-r.top + innerHeight * .4) / (total || 1)));
      bar.style.setProperty('--p', p); bar.classList.toggle('is-on', r.top < innerHeight * .5 && r.bottom > 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanup.push(() => window.removeEventListener('scroll', onScroll));
    upd(false); onScroll();
    if (H.reveal) H.reveal(root);
    if (/^#step-\d+$/.test(location.hash)) setTimeout(() => { const el = qs(root, location.hash); el && el.scrollIntoView(); }, 100);
  }

  /* ---------- index: progress + glossary filter ---------- */
  function initIndex(root) {
    const rows = qsa(root, '[data-guide]');
    const bar = h => {
      const n = totalOf(h), d = doneOf(h).length;
      return '<span class="pg ' + (d && d === n ? 'is-full' : '') + '" title="' + d + '/' + n + '"><i style="--p:' + (n ? d / n * 100 : 0) + '%"></i></span><span class="mono pg-t">' + (d ? d + '/' + n : H.t('Not started', 'Belum mulai', '未着手')) + '</span>';
    };
    rows.forEach(a => {
      const h = a.dataset.guide, n = totalOf(h);
      const pg = qs(a, '[data-pg]'); if (pg) pg.innerHTML = bar(h);
      const st = qs(a, '[data-steps]'); if (st && n) st.textContent = (a.querySelector('.al-m') && a.querySelector('.al-m').firstChild && a.querySelector('.al-m').firstChild.textContent.trim() ? ' / ' : '') + n + ' ' + H.t('steps', 'langkah', 'ステップ');
    });
    const known = rows.filter(a => totalOf(a.dataset.guide));
    const panel = qs(root, '#ach-prog');
    if (panel && known.length) {
      const all = known.reduce((s, a) => s + totalOf(a.dataset.guide), 0), dn = known.reduce((s, a) => s + doneOf(a.dataset.guide).length, 0);
      const started = known.filter(a => doneOf(a.dataset.guide).length), full = known.filter(a => doneOf(a.dataset.guide).length === totalOf(a.dataset.guide));
      const R = 34, L = 2 * Math.PI * R, pc = all ? dn / all : 0;
      panel.hidden = false;
      panel.innerHTML = '<div class="ap-h mono"><span>' + H.t('Your bench log', 'Log kerja kamu', 'あなたの記録') + '</span><span>' + H.t('saved on this device', 'tersimpan di perangkat ini', 'この端末に保存') + '</span></div>' +
        '<div class="ap-b"><svg class="ring" viewBox="0 0 80 80"><circle cx="40" cy="40" r="' + R + '" class="ring-bg"/><circle cx="40" cy="40" r="' + R + '" class="ring-fg" style="stroke-dasharray:' + L + ';stroke-dashoffset:' + (L - L * pc) + '"/></svg><span class="ap-pc mono"><b>' + Math.round(pc * 100) + '</b>%</span>' +
        '<dl><div><dt>' + H.t('Steps done', 'Langkah selesai', '完了ステップ') + '</dt><dd class="mono">' + dn + ' / ' + all + '</dd></div><div><dt>' + H.t('Guides started', 'Panduan dimulai', '開始') + '</dt><dd class="mono">' + started.length + '</dd></div><div><dt>' + H.t('Completed', 'Selesai', '完了') + '</dt><dd class="mono">' + full.length + '</dd></div></dl></div>';
    }
    /* glossary */
    const list = qs(root, '#gl-list');
    if (list) {
      const items = qsa(list, '.gl-i').sort((a, b) => a.dataset.term.localeCompare(b.dataset.term));
      items.forEach(i => list.insertBefore(i, qs(list, '#gl-none')));
      const q = qs(root, '#gl-q'), none = qs(list, '#gl-none');
      q.addEventListener('input', H.debounce(() => {
        const v = q.value.trim().toLowerCase(); let n = 0;
        items.forEach(i => { const ok = !v || i.dataset.text.includes(v); i.hidden = !ok; if (ok) n++; });
        none.hidden = n > 0;
      }, 80));
    }
    const h = qs(root, '#ach-h');
    if (h && H.splitLines) { h.classList.remove('is-in'); delete h.dataset.splitDone; H.splitLines(h); void h.offsetWidth; requestAnimationFrame(() => h.classList.add('is-in')); }
    if (H.reveal) H.reveal(root);
  }

  function initAll(scope) {
    scope = scope || document;
    qsa(scope, '[data-academy-article]').forEach(r => { if (!r.__ac) { r.__ac = 1; initArticle(r); } });
    qsa(scope, '[data-academy-index]').forEach(r => { if (!r.__ac) { r.__ac = 1; initIndex(r); } });
  }
  H.ready(() => initAll(document));
  document.addEventListener('shopify:section:load', e => {
    cleanup.splice(0).forEach(f => f());
    initAll(e.target);
  });
})();
