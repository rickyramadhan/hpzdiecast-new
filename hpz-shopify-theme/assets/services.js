/* HPZ services page + contact hours. Reads data-attributes rendered by snippets/service-*.liquid
   (all prices/tiers come from section settings). Strings built here use HPZ.t(en,id,ja). */
(function () {
  const H = window.HPZ;
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const timers = [];

  function needEmail(inp) {
    const ok = reEmail.test(inp.value.trim());
    inp.classList.toggle('is-err', !ok);
    if (!ok) inp.focus();
    return ok;
  }
  const qs = (r, s) => r.querySelector(s);
  const qsa = (r, s) => Array.from(r.querySelectorAll(s));
  const SVC_FX = +((window.HPZ_RAW && HPZ_RAW.settings && HPZ_RAW.settings.svcFactor) || 1) || 1; // services amounts are authored in USD
  const money = n => H.money(Math.round(n * 100 * SVC_FX));
  const lang = () => document.documentElement.lang || 'en';

  /* a contact form posted OK -> Shopify returns to /page?contact_posted=true#form-id.
     Only keep success state for the form that matches the hash. */
  function reconcilePosted(root) {
    const id = (location.hash || '').slice(1);
    qsa(root, '[data-posted]').forEach(m => {
      const form = m.closest('form');
      if (form && form.id === id) form.classList.add('is-sent');
    });
    qsa(root, '[data-sent]').forEach(el => {
      const keep = el.dataset.sent === id && /contact_posted=true/.test(location.search);
      if (el.closest('form')) {
        const body = el.parentElement.querySelector('[data-form-body]');
        el.hidden = !keep;
        if (body) body.hidden = keep;
      } else {
        const live = el.parentElement.querySelector('[data-live]');
        el.hidden = !keep;
        if (live) live.hidden = keep;
      }
    });
  }

  function submitGuard(form, btn, checks) {
    if (!form) return;
    form.addEventListener('submit', e => {
      if (!checks()) { e.preventDefault(); return; }
      if (btn) btn.classList.add('is-loading');
    });
  }

  /* ---------- casting selects (optgroup by maker) ---------- */
  function fillCastings(sel, extraTop, extraBottom) {
    if (!sel) return;
    const list = (H.cfg && H.cfg.castings) || [];
    if (!list.length) return;
    const keep = sel.value;
    const makers = [...new Set(list.map(c => c.maker || ''))];
    let html = extraTop || '';
    makers.forEach(m => {
      const items = list.filter(c => (c.maker || '') === m);
      const opts = items.map(c => '<option value="' + H.esc(c.name) + '">' + H.esc(c.name) + '</option>').join('');
      html += m ? '<optgroup label="' + H.esc(m) + '">' + opts + '</optgroup>' : opts;
    });
    sel.innerHTML = html + (extraBottom || '');
    if (keep && Array.from(sel.options).some(o => o.value === keep)) sel.value = keep;
  }

  /* ---------- hero index count ---------- */
  function initHero(root) {
    const n = root.querySelectorAll('#svh-idx li').length;
    const c = qs(root, '[data-svc-count]');
    if (c) c.textContent = String(n).padStart(2, '0');
    const h = qs(root, '#svh-h');
    if (h && H.splitLines) {
      h.classList.remove('is-in'); delete h.dataset.splitDone; H.splitLines(h);
      void h.offsetWidth; requestAnimationFrame(() => h.classList.add('is-in'));
    }
  }

  /* ---------- decal estimator ---------- */
  function initDecal(root) {
    const grid = qs(root, '#ds-root'); if (!grid) return;
    const d = grid.dataset;
    const form = qs(grid, '#ds-form');
    const cfg = { rush: +d.rush || 0, rushDays: +d.rushDays || 50, fee: +d.measureFee || 0, feeDays: +d.measureDays || 0, max: +d.max || 20, bulkFrom: +d.bulkFrom || 999, bulkDays: +d.bulkDays || 0 };
    const sel = qs(form, '#ds-cast');
    fillCastings(sel, '', '<option value="other">' + H.esc(sel.dataset.other) + '</option>');
    const st = { q: Math.max(1, Math.min(cfg.max, +qs(form, '#ds-q').value || 1)), rush: false };
    let lastTotal = 0;

    const cur = n => { const r = qs(form, 'input[data-ds="' + n + '"]:checked'); return r ? r.dataset : null; };
    function calc() {
      const cx = cur('cx') || { usd: 0, days: 0, name: '' }, ty = cur('type') || { add: 0, sheet: 0, days: 0, name: '' };
      const lines = [[H.t('Artwork & template fitting', 'Artwork & penyesuaian template', 'デザイン・テンプレート調整') + ' - ' + cx.name, +cx.usd]];
      if (+ty.add) lines.push([ty.name + ' ' + H.t('print', 'cetak', '印刷'), +ty.add]);
      if (st.q > 1 && +ty.sheet) lines.push([H.t('Extra sheets', 'Sheet tambahan', '追加シート') + ' ' + (st.q - 1) + ' x ' + money(+ty.sheet), (st.q - 1) * +ty.sheet]);
      let days = (+cx.days) + (+ty.days) + (st.q > cfg.bulkFrom ? cfg.bulkDays : 0);
      if (sel.value === 'other' && cfg.fee) { lines.push([H.t('Measure a new casting', 'Ukur casting baru', '新規車種の採寸'), cfg.fee]); days += cfg.feeDays; }
      const sub = lines.reduce((s, l) => s + l[1], 0);
      if (st.rush && cfg.rush) {
        lines.push([H.t('Rush', 'Rush', '特急') + ' (+' + cfg.rush + '%)', Math.round(sub * cfg.rush) / 100]);
        days = Math.max(2, Math.ceil(days * cfg.rushDays / 100));
      }
      const total = lines.reduce((s, l) => s + l[1], 0);
      const proof = Math.max(1, Math.round(days * .45)), print = Math.max(1, days - proof - 1);
      return { lines, total, days, split: [proof, print, Math.max(0, days - proof - print)], cx, ty };
    }
    function addWorkdays(n) {
      const dt = new Date(); let left = n;
      while (left > 0) { dt.setDate(dt.getDate() + 1); const w = dt.getDay(); if (w !== 0 && w !== 6) left--; }
      return dt;
    }
    const fmtDate = dt => dt.toLocaleDateString(lang(), { day: 'numeric', month: 'short' });

    function drawSteps(q) {
      const el = qs(root, '#ds-steps');
      const steps = [
        [H.t('Brief', 'Brief', 'ご依頼'), H.t('You send references', 'Kamu kirim referensi', '参考資料を送付'), H.t('Day 0', 'Hari 0', '0日目')],
        [H.t('Artwork proof', 'Proof artwork', 'デザイン校正'), H.t('PDF on the template, revisions included', 'PDF di template, termasuk revisi', 'テンプレート上のPDF'), H.t('Day ', 'Hari ', '') + q.split[0] + H.t('', '', '日目')],
        [H.t('Test print', 'Cetak tes', 'テスト印刷'), H.t('Check on a real casting', 'Cek di casting asli', '実車で確認'), H.t('Day ', 'Hari ', '') + (q.split[0] + q.split[1]) + H.t('', '', '日目')],
        [H.t('Ship', 'Kirim', '発送'), H.t('Packed and tracked', 'Dikemas, dilacak', '梱包・追跡付き'), H.t('Day ', 'Hari ', '') + q.days + H.t('', '', '日目')]
      ];
      el.style.setProperty('--done', 0);
      el.innerHTML = steps.map((s, i) => '<li class="' + (i === 0 ? 'is-cur' : '') + '" style="--i:' + i + '"><span class="st-n mono">' + String(i + 1).padStart(2, '0') + '</span><div><b>' + s[0] + '</b><em>' + s[1] + '</em></div><span class="st-d mono">' + s[2] + '</span></li>').join('') + '<i class="st-line"><b></b></i>';
      if (H.reveal) H.reveal(el.parentElement);
    }
    function draw() {
      const live = qs(grid, '[data-live]'); if (!live) return;
      const q = calc();
      const castName = sel.value === 'other' ? H.t('Your casting', 'Casting kamu', 'お手持ちの車種') : (sel.options[sel.selectedIndex] || {}).text || '';
      qs(live, '#q-cast').innerHTML = '<b>' + H.esc(castName) + '</b><span class="mono">' + H.esc(q.ty.name || '') + ' &middot; ' + st.q + ' ' + H.t(st.q > 1 ? 'sheets' : 'sheet', 'sheet', '枚') + '</span>';
      qs(live, '#q-lines').innerHTML = q.lines.map(l => '<li><span>' + H.esc(l[0]) + '</span><b class="mono">' + money(l[1]) + '</b></li>').join('');
      const tot = qs(live, '#q-tot');
      if (Math.abs(q.total - lastTotal) > .001) { tot.classList.remove('is-tick'); void tot.offsetWidth; tot.classList.add('is-tick'); }
      if (H.countUp) H.countUp(tot, q.total, { from: lastTotal, dur: 650, fmt: v => money(v) }); else tot.textContent = money(q.total);
      const dEl = qs(live, '#q-days');
      if (H.countUp) H.countUp(dEl, q.days, { from: +dEl.textContent || 0, dur: 500 }); else dEl.textContent = q.days;
      lastTotal = q.total;
      qs(live, '#q-date').textContent = fmtDate(addWorkdays(q.days));
      const max = 12, bar = qs(live, '#q-bar');
      bar.style.setProperty('--p', q.split[0] / max * 100 + '%'); bar.style.setProperty('--r', q.split[1] / max * 100 + '%'); bar.style.setProperty('--s', q.split[2] / max * 100 + '%');
      qs(form, '#ds-estimate').value = [castName, q.cx.name, q.ty.name, st.q + ' sheet(s)', st.rush ? 'rush' : 'standard', 'estimate ' + money(q.total), q.days + ' working days'].join(' / ');
      const note = qs(form, '#ds-cast-note');
      if (sel.value === 'other') note.textContent = note.dataset.noteOther;
      else {
        const c = ((H.cfg && H.cfg.castings) || []).find(x => x.name === sel.value);
        note.textContent = c ? [c.maker, c.year].filter(Boolean).join(' / ') : '';
      }
      drawSteps(q);
    }
    form.addEventListener('change', e => {
      const t = e.target;
      if (t.matches('input[type=radio]')) qsa(form, 'input[name="' + t.name.replace(/"/g, '\\"') + '"]').forEach(r => r.closest('.oc').classList.toggle('is-on', r.checked));
      if (t.id === 'ds-rush') st.rush = t.checked;
      if (t.id === 'ds-q') { st.q = Math.max(1, Math.min(cfg.max, parseInt(t.value, 10) || 1)); t.value = st.q; }
      draw();
    });
    form.addEventListener('click', e => {
      const b = e.target.closest('[data-q]');
      if (b) { st.q = Math.max(1, Math.min(cfg.max, st.q + +b.dataset.q)); qs(form, '#ds-q').value = st.q; draw(); }
    });
    submitGuard(form, qs(grid, '#ds-go'), () => needEmail(qs(form, '#ds-mail')));
    draw();
  }

  /* ---------- commission build ---------- */
  function initBuild(root) {
    const cb = qs(root, '#cb-root'); if (!cb) return;
    const form = qs(cb, '#cb-form');
    fillCastings(qs(cb, '#cb-cast'), '<option value="' + H.esc(qs(cb, '#cb-cast').dataset.own) + '">' + H.esc(qs(cb, '#cb-cast').dataset.own) + '</option>', '');
    const tierBtns = () => qsa(root, '#cmp th [data-tier]');
    function setTier(k) {
      qsa(root, '#cmp [data-col]').forEach(x => x.classList.toggle('is-on', x.dataset.col === String(k)));
      qsa(root, '#cmp [data-choose]').forEach(b => {
        const on = b.dataset.tier === String(k);
        b.classList.toggle('btn-ink', on); b.classList.toggle('btn-ghost', !on);
        b.textContent = on ? cb.dataset.selected : cb.dataset.choose;
      });
      qsa(cb, '#cb-tier [data-tier]').forEach(b => b.classList.toggle('is-on', b.dataset.tier === String(k)));
      const th = tierBtns().find(b => b.dataset.tier === String(k));
      const v = qs(cb, '#cb-tier-v'), foot = qs(cb, '#cb-foot');
      if (th) {
        v.value = th.dataset.name;
        if (foot) foot.innerHTML = H.esc(th.dataset.name) + ': ' + H.esc(cb.dataset.from) + ' <b class="mono">' + H.esc(th.dataset.price) + '</b> &middot; ' + H.esc(th.dataset.ta) + '. ' + H.esc(cb.dataset.foot);
      }
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('#build [data-tier]');
      if (b) { e.preventDefault(); setTier(b.dataset.tier); }
    });
    const cmp = qs(root, '#cmp');
    if (cmp) {
      cmp.addEventListener('mouseover', e => { const c = e.target.closest('[data-col]'); qsa(cmp, '[data-col]').forEach(x => x.classList.toggle('is-hov', !!c && x.dataset.col === c.dataset.col)); });
      cmp.addEventListener('mouseleave', () => qsa(cmp, '.is-hov').forEach(x => x.classList.remove('is-hov')));
    }
    setTier(cb.dataset.sel || 0);
    // silhouettes + flags on the bench board
    qsa(cb, '[data-sil]').forEach(el => { if (H.silhouette) el.innerHTML = H.silhouette(el.dataset.sil); });
    qsa(cb, '[data-flag]').forEach(el => { if (el.dataset.flag && H.flag) el.innerHTML = H.flag(el.dataset.flag.toUpperCase()); });
    const slots = qs(root, '#slots');
    if (slots && 'IntersectionObserver' in window) {
      const ob = new IntersectionObserver(es => { if (es[0].isIntersecting) { slots.classList.add('is-in'); ob.disconnect(); } }, { threshold: .6 });
      ob.observe(slots);
      if (H.countOnView) H.countOnView(slots);
    } else if (slots) slots.classList.add('is-in');
    const board = qs(cb, '#board');
    if (board && !board.hidden && 'IntersectionObserver' in window) {
      const ob2 = new IntersectionObserver(es => { if (es[0].isIntersecting) { board.classList.add('is-in'); ob2.disconnect(); } }, { threshold: .3 });
      ob2.observe(board);
    } else if (board) board.classList.add('is-in');
    submitGuard(form, qs(cb, '#cb-go'), () => needEmail(qs(cb, '#cb-mail')));
  }

  /* ---------- wholesale ---------- */
  function initWholesale(root) {
    const calc = qs(root, '#ws-calc');
    if (calc) {
      const rrp = +calc.dataset.rrp || 0, min = +calc.dataset.min, max = +calc.dataset.max;
      const rows = qsa(calc, '[data-wt]').map(r => ({ el: r, m: +r.dataset.min, p: +r.dataset.pct }));
      const r = qs(calc, '#ws-n');
      let last = 0;
      const disc = n => { let d = 0; rows.forEach(x => { if (n >= x.m) d = x.p; }); return d; };
      const upd = () => {
        const n = +r.value, d = disc(n);
        qs(calc, '#ws-nv').textContent = n;
        r.style.setProperty('--v', (n - min) / (max - min) * 100 + '%');
        rows.forEach(x => x.el.classList.toggle('is-on', x.p === d && d > 0));
        const dEl = qs(calc, '#ws-d');
        if (d !== last) { if (H.countUp) H.countUp(dEl, d, { from: last, dur: 500 }); else dEl.textContent = d; last = d; }
        qs(calc, '#ws-tot').textContent = money(n * rrp * (1 - d / 100));
        qs(calc, '#ws-m').textContent = d ? money(n * rrp * d / 100) : H.t('Below the first tier', 'Di bawah level pertama', '最初のランク未満');
        calc.classList.toggle('is-min', !d);
      };
      r.addEventListener('input', upd);
      upd();
    }
    const f = qs(root, '#ws-apply');
    submitGuard(f, qs(root, '#ws-go'), () => needEmail(qs(root, '#ws-mail')));
    if (H.reveal) H.reveal(root);
  }

  /* ---------- part request ---------- */
  function initRequest(root) {
    const f = qs(root, '#rq-form'); if (!f) return;
    const sel = qs(f, '#rq-cast');
    fillCastings(sel, '<option value="' + H.esc(sel.dataset.any) + '">' + H.esc(sel.dataset.any) + '</option>', '<option value="' + H.esc(sel.dataset.other) + '">' + H.esc(sel.dataset.other) + '</option>');
    submitGuard(f, qs(f, '#rq-go'), () => {
      const w = qs(f, '#rq-what'), okW = w.value.trim().length > 2;
      w.classList.toggle('is-err', !okW);
      if (!okW) { w.focus(); return false; }
      return needEmail(qs(f, '#rq-mail'));
    });
  }

  /* ---------- Pit Points ---------- */
  function initPoints(root) {
    const rt = qs(root, '#pp-root'); if (!rt) return;
    const d = rt.dataset, MAX = +d.max || 4000, SPEND_MAX = +d.spendMax || 800;
    const REV = (+d.review || 0) * 2, FEAT = +d.feature || 0, RP = +d.redeemPts || 1000, RV = +d.redeemValue || 0;
    const tiers = qsa(rt, '[data-tier-k]').map(a => ({ el: a, k: a.dataset.tierK, n: a.dataset.name, at: +a.dataset.at, rate: +a.dataset.rate }));
    const marks = qsa(rt, '[data-tk]');
    const s = qs(rt, '#pp-s'), r = qs(rt, '#pp-r'), f = qs(rt, '#pp-f');
    let last = 0;
    const tierFor = pts => tiers.filter(x => pts >= x.at).pop() || tiers[0];
    function upd() {
      const spend = +s.value;
      let tr = tierFor(spend * tiers[0].rate);
      let pts = Math.round(spend * tr.rate) + (r.checked ? REV : 0) + (f.checked ? FEAT : 0);
      tr = tierFor(pts);
      pts = Math.round(spend * tr.rate) + (r.checked ? REV : 0) + (f.checked ? FEAT : 0);
      tr = tierFor(pts);
      qs(rt, '#pp-sv').textContent = money(spend);
      s.style.setProperty('--v', spend / SPEND_MAX * 100 + '%');
      const pc = Math.min(100, pts / MAX * 100);
      qs(rt, '#pp-fill').style.width = pc + '%'; qs(rt, '#pp-you').style.left = pc + '%';
      const pe = qs(rt, '#pp-pts');
      if (H.countUp) H.countUp(pe, pts, { from: last, dur: 500 }); else pe.textContent = pts;
      last = pts;
      marks.forEach(m => m.classList.toggle('is-on', +m.dataset.at <= pts));
      tiers.forEach(t => t.el.classList.toggle('is-on', t.k === tr.k));
      const next = tiers.find(x => x.at > pts);
      qs(rt, '#pp-sum').innerHTML = '<span>' + H.t('You would be', 'Kamu akan jadi', 'あなたのランク') + ' <b>' + H.esc(tr.n) + '</b></span>' +
        (RP && RV ? '<span>' + H.t('Worth', 'Senilai', '価値') + ' <b class="mono">' + money(pts / RP * RV) + '</b> ' + H.t('in rewards', 'potongan', '分の特典') + '</span>' : '') +
        '<span>' + (next ? '<b class="mono">' + (next.at - pts).toLocaleString('en-US') + '</b> ' + H.t('pts to', 'poin lagi ke', 'pt で') + ' ' + H.esc(next.n) : H.t('Top tier reached', 'Level tertinggi', '最上位ランク')) + '</span>';
    }
    s.addEventListener('input', upd); r.addEventListener('change', upd); f.addEventListener('change', upd);
    upd();
  }

  /* ---------- help centre: tabs + accordions ---------- */
  function initHelp(root) {
    const tabs = qs(root, '#hc-tabs');
    if (tabs) {
      const show = k => qsa(root, '[data-faq]').forEach(p => {
        const on = p.dataset.faq === k;
        if (on && p.hidden) { p.hidden = false; p.classList.remove('is-swap'); void p.offsetWidth; p.classList.add('is-swap'); }
        else if (!on) p.hidden = true;
      });
      if (H.tabs) H.tabs(tabs, show);
      tabs.addEventListener('click', e => {
        const b = e.target.closest('[data-tab]'); if (!b) return;
        qsa(tabs, '[data-tab]').forEach(x => x.classList.toggle('is-on', x === b));
        show(b.dataset.tab);
      });
    }
    qsa(root, '.hc-faq').forEach(p => H.acc && H.acc(p));
  }

  /* ---------- live open/closed status (services help + contact page) ---------- */
  function drawHours(root) {
    qsa(root, '[data-hours]').forEach(el => {
      const d = el.dataset, days = (d.days || '').split(',').map(x => +x.trim());
      const o = +d.open, c = +d.close, tz = +d.tz;
      const now = new Date();
      const w = new Date(now.getTime() + (now.getTimezoneOffset() + tz * 60) * 60000);
      const hr = w.getHours() + w.getMinutes() / 60;
      const open = days.includes(w.getDay()) && hr >= o && hr < c;
      el.classList.toggle('is-open', open);
      const dot = qs(el, '[data-hours-dot]'); if (dot) { dot.classList.toggle('pulse', open); dot.classList.toggle('out', !open); }
      const hhmm = String(w.getHours()).padStart(2, '0') + ':' + String(w.getMinutes()).padStart(2, '0');
      const tx = qs(el, '[data-hours-text]');
      if (tx) tx.innerHTML = H.esc(open ? d.tOpen : d.tClosed) + ' &middot; <b class="mono">' + hhmm + '</b> ' + H.esc(d.tzLabel || '');
      const off = -now.getTimezoneOffset() / 60 - tz;
      const loc = qs(root, '[data-hours-local]');
      if (loc) {
        const lt = x => { const v = ((x + off) % 24 + 24) % 24; return String(Math.floor(v)).padStart(2, '0') + ':' + (v % 1 ? '30' : '00'); };
        loc.innerHTML = off ? H.esc(H.t('That is', 'Yaitu', '現地時間')) + ' <b class="mono">' + lt(o) + '-' + lt(c) + '</b> ' + H.esc(d.tYours || '') : '';
      }
    });
  }

  function init(root) {
    if (!root || root.__svInit) return;
    const hasSvc = root.matches && root.matches('[data-svc]') ? root : qs(root, '[data-svc]');
    const scope = hasSvc || root;
    if (hasSvc) {
      scope.__svInit = true;
      initHero(scope); initDecal(scope); initBuild(scope); initWholesale(scope); initRequest(scope); initPoints(scope); initHelp(scope);
      reconcilePosted(scope);
      if (H.countOnView) H.countOnView(scope);
      if (H.reveal) H.reveal(scope);
    }
    if (qs(scope, '[data-hours]') || scope.querySelector('[data-hours]')) {
      drawHours(scope);
      timers.push(setInterval(() => drawHours(scope), 60000));
    }
  }

  function initAll() { qsa(document, '[data-svc], [data-contact-page]').forEach(init); }
  H.ready(initAll);
  document.addEventListener('shopify:section:load', e => {
    timers.splice(0).forEach(clearInterval);
    const t = e.target;
    qsa(t, '[data-svc], [data-contact-page]').forEach(n => { n.__svInit = false; init(n); });
    if (t.matches && t.matches('[data-svc], [data-contact-page]')) { t.__svInit = false; init(t); }
  });
})();
