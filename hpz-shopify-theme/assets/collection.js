/* HPZ - collection & search results page
   Ajax filtering through the Section Rendering API (?section_id=...), history.pushState,
   density, load-more, casting toggle, mobile filter panel, recently viewed rail.
   Progressive enhancement: every control also works as a plain GET link/form. */
HPZ.ready(function () {
  var H = window.HPZ, $ = H.$, $$ = H.$$, t = H.t, esc = H.esc, LS = H.LS;
  var root = $('[data-col-root]');
  if (!root) { initRecent(); return; }
  var sid = root.dataset.sectionId;
  var seq = 0, ctrl = null;
  var cols = parseInt(LS.get('cols', root.dataset.cols || 4), 10) || 4;

  var filtersEl = function () { return $('#filters', root); };
  var resultsEl = function () { return $('[data-part="results"]', root); };
  var gridEl = function () { return $('#grid', root); };

  /* ---------- density ---------- */
  function setCols(n) {
    cols = n;
    var g = gridEl(); if (g) g.style.setProperty('--cols', n);
    $$('#dens button', root).forEach(function (b) { b.classList.toggle('is-on', +b.dataset.cols === n); });
  }

  /* ---------- casting ----------
     Verified casting: the toggle hides cards where HPZ.fits() is 'no'.
     Unverified (estimated) casting: HPZ.fits() returns null by design, so we never hide; cards sized for the
     casting (by diameter) are sorted first and highlighted, and everything is labelled "estimated". */
  function cur() { return H.garage && H.garage.current ? H.garage.current() : null; }
  function castOnly() { return !!(cur() && LS.get('castOnly', false)); }
  function qfEl() { return $('[data-qf]', root); }
  function qfStr(k, fb) { var q = qfEl(); return (q && q.getAttribute('data-' + k)) || fb; }
  function estWord() { return qfStr('est', t('estimated', 'perkiraan', '推定')); }
  function cardFacts(card) {
    var meta = card.querySelector('.pc-meta span');
    var spec = card.querySelector('.pc-spec');
    return {
      dia: parseFloat(card.getAttribute('data-dia')) || null,
      maker: meta ? meta.textContent.trim() : '',
      bearing: !!(spec && /bearing|ベアリング/i.test(spec.textContent))
    };
  }

  function applyCast() {
    var g = gridEl(); if (!g) return;
    var c = cur(), on = castOnly(), verified = !!(c && c.verified), hiddenN = 0, estN = 0;
    $$('.pc', g).forEach(function (card) {
      var hide = false, rank = '', slot = card.querySelector('[data-fit-slot]');
      card.classList.remove('is-est', 'is-est-close');
      if (slot && slot.hasAttribute('data-est-slot')) { slot.innerHTML = ''; slot.removeAttribute('data-est-slot'); }
      if (on && verified) {
        var res = H.fits({
          dia: parseFloat(card.getAttribute('data-dia')) || null,
          madeFor: (card.getAttribute('data-made-for') || '').split(',').filter(Boolean),
          kind: card.getAttribute('data-kind') || ''
        }, c);
        hide = res === 'no';
      } else if (on && c && c.dia && card.getAttribute('data-kind') === 'wheels') {
        var d = parseFloat(card.getAttribute('data-dia'));
        if (d) {
          var diff = Math.abs(d - c.dia);
          if (diff === 0) rank = 'match'; else if (diff <= 0.5) rank = 'close';
        }
      }
      card.style.display = hide ? 'none' : '';
      card.style.order = rank === 'match' ? '-2' : rank === 'close' ? '-1' : '';
      if (rank) {
        if (rank === 'match') estN++;
        card.classList.add(rank === 'match' ? 'is-est' : 'is-est-close');
        if (slot && !slot.innerHTML.trim()) {
          slot.setAttribute('data-est-slot', '');
          slot.innerHTML = '<span class="fit fit-est ' + (rank === 'match' ? 'fit-ok' : 'fit-close') + '">' + (rank === 'match' ? H.icon('check') : '') + esc(qfStr(rank === 'match' ? 'est-tag' : 'est-close', rank)) + '</span>';
        }
      }
      if (hide) hiddenN++;
    });
    var note = $('[data-cast-note]', root);
    if (note) {
      if (on && !verified && c) {
        note.hidden = !estN;
        note.textContent = estN ? '· ' + qfStr('est-note', '__n__ __name__').replace('__n__', estN).replace('__name__', c.name) : '';
      } else {
        note.hidden = !hiddenN;
        note.textContent = hiddenN ? '· ' + hiddenN + ' ' + t('hidden (do not fit)', 'disembunyikan (tidak pas)', '非表示(不適合)') : '';
      }
    }
    applyQuick();
  }

  /* ---------- client-side quick filter (cards currently loaded; separate from server facets) ---------- */
  var qs = { dia: [], maker: [], bearing: false };
  function chipHTML(attr, val, label, n, on) {
    return '<button type="button" class="chip' + (on ? ' is-on' : '') + '" ' + attr + '="' + esc(val) + '">' + esc(label) + (n != null ? ' <span class="ct">' + n + '</span>' : '') + '</button>';
  }
  function buildQuick() {
    var q = qfEl(), g = gridEl(); if (!q || !g) return;
    var cards = $$('.pc', g);
    if (cards.length < 6) { q.hidden = true; q.innerHTML = ''; qs = { dia: [], maker: [], bearing: false }; applyQuick(); return; }
    var dias = {}, makers = {}, nb = 0;
    cards.forEach(function (c) {
      var f = cardFacts(c);
      if (f.dia) dias[f.dia] = (dias[f.dia] || 0) + 1;
      if (f.maker) makers[f.maker] = (makers[f.maker] || 0) + 1;
      if (f.bearing) nb++;
    });
    var dk = Object.keys(dias).sort(function (a, b) { return a - b; });
    var mk = Object.keys(makers).sort(function (a, b) { return makers[b] - makers[a]; }).slice(0, 8);
    qs.dia = qs.dia.filter(function (d) { return dias[d]; });
    qs.maker = qs.maker.filter(function (m) { return makers[m]; });
    var html = '', groups = 0;
    if (dk.length > 1) { groups++; html += '<div class="qf-g"><span class="lbl">&empty;</span>' + dk.map(function (d) { return chipHTML('data-qf-dia', d, d + ' mm', dias[d], qs.dia.indexOf(d) > -1); }).join('') + '</div>'; }
    if (nb > 0 && nb < cards.length) { groups++; html += '<div class="qf-g">' + chipHTML('data-qf-bearing', '1', qfStr('bearing', 'Bearing'), nb, qs.bearing) + '</div>'; }
    else qs.bearing = false;
    if (mk.length > 1) { groups++; html += '<div class="qf-g">' + mk.map(function (m) { return chipHTML('data-qf-maker', m, m, makers[m], qs.maker.indexOf(m) > -1); }).join('') + '</div>'; }
    if (!groups) { q.hidden = true; q.innerHTML = ''; applyQuick(); return; }
    var note = qfStr('note', '').replace('__n__', cards.length);
    q.innerHTML = (note ? '<span class="qf-note">' + esc(note) + '</span>' : '') + html + '<button type="button" class="link xs qf-reset" data-qf-reset hidden>' + esc(qfStr('clear', 'Reset')) + '</button>';
    q.hidden = false;
    applyQuick();
  }
  function applyQuick() {
    var g = gridEl(); if (!g) return;
    var any = qs.dia.length || qs.maker.length || qs.bearing;
    $$('.pc', g).forEach(function (card) {
      var f = cardFacts(card), hide = false;
      if (qs.dia.length && qs.dia.indexOf(String(f.dia)) < 0) hide = true;
      if (qs.maker.length && qs.maker.indexOf(f.maker) < 0) hide = true;
      if (qs.bearing && !f.bearing) hide = true;
      card.classList.toggle('qf-hide', !!hide);
    });
    var rs = $('[data-qf-reset]', root); if (rs) rs.hidden = !any;
  }
  function toggleIn(arr, v) { var i = arr.indexOf(v); if (i > -1) arr.splice(i, 1); else arr.push(v); }

  function syncCast() {
    var c = cur(), on = castOnly();
    var box = $('[data-cast-on]', root);
    if (box) {
      box.hidden = !on;
      if (on) {
        box.innerHTML = '<span class="g-sil">' + H.silhouette(c.body) + '</span><div><span class="eyebrow">' + esc(t('Showing parts for', 'Parts untuk', '適合車種')) + '</span><b>' + esc(c.name) + '</b><em class="mono">Ø' + esc(c.dia) + ' mm · ' + esc(c.axle) + (c.verified ? '' : ' · ' + esc(estWord())) + '</em></div><button type="button" class="dr-x" data-uncast aria-label="' + esc(t('Remove', 'Hapus', '解除')) + '">' + H.icon('close') + '</button>';
      }
    }
    var off = $('[data-cast-off]', root);
    if (off) {
      off.hidden = on;
      if (c) { off.removeAttribute('data-open'); off.setAttribute('data-cast-enable', ''); }
      else { off.setAttribute('data-open', 'garage'); off.removeAttribute('data-cast-enable'); }
    }
    var tg = $('[data-cast-toggle]', root);
    if (tg) {
      tg.classList.toggle('is-dis', !c);
      var inp = $('[data-cast-only]', tg); inp.disabled = !c; inp.checked = on;
      var nm = $('[data-cast-name]', tg), add = $('[data-cast-add]', tg);
      nm.hidden = !c; add.hidden = !!c; nm.textContent = c ? c.name + (c.verified ? '' : ' (' + estWord() + ')') : '';
    }
    var hint = $('[data-dia-hint]', root);
    if (hint) {
      hint.hidden = !c || !c.dia;
      if (c && c.dia) hint.lastElementChild.innerHTML = esc(t('Recommended for', 'Disarankan untuk', '推奨')) + ' ' + esc(c.name) + ': <b>' + esc(c.dia) + ' mm</b>' + (c.verified ? '' : ' (' + esc(estWord()) + ')');
    }
    applyCast();
  }

  /* ---------- Ajax filtering ---------- */
  function params() {
    var form = $('#col-form'), p = new URLSearchParams();
    if (form) new FormData(form).forEach(function (v, k) { if (v !== '') p.append(k, v); });
    var pr = $('.fprice', root);
    if (pr) {
      var rs = $$('input[type=range]', pr), a = +rs[0].value, b = +rs[1].value;
      var lo = Math.min(a, b), hi = Math.max(a, b);
      if (lo > +pr.dataset.bmin) p.set(pr.dataset.minName, lo);
      if (hi < +pr.dataset.bmax) p.set(pr.dataset.maxName, hi);
    }
    return p;
  }

  function skeletons(n) {
    var s = ''; for (var i = 0; i < n; i++) s += '<div class="skel-card"><div class="skel"></div><i class="skel"></i><i class="skel"></i></div>';
    return s;
  }

  function load(qs, push) {
    var path = location.pathname;
    var url = path + (qs ? '?' + qs : '');
    var my = ++seq;
    if (ctrl) ctrl.abort();
    ctrl = window.AbortController ? new AbortController() : null;
    root.classList.add('is-loading');
    var g = gridEl(); if (g && !$('.empty', g)) g.insertAdjacentHTML('beforeend', skeletons(4));
    fetch(url + (qs ? '&' : '?') + 'section_id=' + encodeURIComponent(sid), { signal: ctrl ? ctrl.signal : undefined, credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('bad'); return r.text(); })
      .then(function (html) {
        if (my !== seq) return;
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var nr = doc.querySelector('[data-col-root]');
        if (!nr) throw new Error('no root');
        var f = filtersEl(), state = {};
        $$('.fg', f).forEach(function (e) { state[e.dataset.fg] = e.classList.contains('is-open'); });
        f.innerHTML = nr.querySelector('#filters').innerHTML;
        resultsEl().innerHTML = nr.querySelector('[data-part="results"]').innerHTML;
        $$('.fg', f).forEach(function (e) {
          var id = e.dataset.fg; if (!(id in state)) return;
          var open = state[id], body = $('.acc-b', e);
          e.classList.toggle('is-open', open);
          $('.acc-h', e).setAttribute('aria-expanded', open);
          if (body) body.style.height = open ? 'auto' : '0px';
        });
        H.acc(f);
        enhance(resultsEl());
        buildQuick();
        syncCast();
        if (push) history.pushState({ hpz: 1 }, '', url);
        root.classList.remove('is-loading');
      })
      .catch(function (e) {
        if (e && e.name === 'AbortError') return;
        location.href = url;
      });
  }

  function apply() { load(params().toString(), true); }

  function enhance(scope) {
    setCols(cols);
    $$('[data-pages]', scope).forEach(function (n) { n.hidden = true; });
    if (H.reveal) H.reveal(scope);
    if (H.tagFit) H.tagFit(scope);
  }

  /* ---------- load more ---------- */
  function loadMore(btn) {
    if (btn.classList.contains('is-loading')) return;
    var href = btn.getAttribute('href');
    if (!href) return;
    var grid = gridEl();
    btn.classList.add('is-loading');
    btn.insertAdjacentHTML('beforeend', '<span class="spin"></span>');
    grid.insertAdjacentHTML('beforeend', skeletons(4));
    fetch(href + (href.indexOf('?') > -1 ? '&' : '?') + 'section_id=' + encodeURIComponent(sid), { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('bad'); return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var ng = doc.querySelector('#grid'), np = doc.querySelector('#pager');
        if (!ng) throw new Error('no grid');
        $$('.skel-card', grid).forEach(function (e) { e.remove(); });
        Array.prototype.slice.call(ng.children).forEach(function (c) { if (!c.classList.contains('empty')) grid.appendChild(document.importNode(c, true)); });
        var pager = $('#pager', root);
        if (pager && np) pager.innerHTML = np.innerHTML;
        enhance(resultsEl());
        buildQuick();
        applyCast();
      })
      .catch(function () { location.href = href; });
  }

  /* ---------- events ---------- */
  var applyDebounced = H.debounce(apply, 250);

  document.addEventListener('change', function (e) {
    var tg = e.target;
    if (!root.contains(tg) && tg.id !== 'sort') return;
    if (tg.matches('[data-cast-only]')) { LS.set('castOnly', tg.checked); syncCast(); return; }
    if (tg.matches('[data-r]')) { applyDebounced(); return; }
    if (tg.id === 'sort' || (tg.form && tg.form.id === 'col-form') || tg.getAttribute('form') === 'col-form') {
      var lab = tg.closest('.fdia-b, .fcol-b');
      if (lab) lab.classList.toggle('is-on', tg.checked);
      apply();
    }
  });

  document.addEventListener('input', function (e) {
    var r = e.target.closest ? e.target.closest('[data-r]') : null;
    if (!r) return;
    var box = r.closest('.fprice'), rs = $$('input[type=range]', box);
    var lo = Math.min(+rs[0].value, +rs[1].value), hi = Math.max(+rs[0].value, +rs[1].value);
    var bmin = +box.dataset.bmin, bmax = +box.dataset.bmax, pc = function (v) { return (v - bmin) / ((bmax - bmin) || 1) * 100; };
    var fill = $('.fill', box); if (fill) { fill.style.left = pc(lo) + '%'; fill.style.right = (100 - pc(hi)) + '%'; }
    $('#pmin', box).textContent = H.money(lo * 100); $('#pmax', box).textContent = H.money(hi * 100);
  });

  document.addEventListener('submit', function (e) {
    if (!e.target.matches || !e.target.matches('#col-form')) return;
    e.preventDefault();
    closePanel();
    apply();
  });

  function openPanel() { var f = filtersEl(); if (f) { f.classList.add('is-open'); document.body.classList.add('is-locked'); } }
  function closePanel() { var f = filtersEl(); if (f) f.classList.remove('is-open'); document.body.classList.remove('is-locked'); }

  document.addEventListener('click', function (e) {
    var tg = e.target;
    if (!tg.closest) return;
    var aj = tg.closest('a[data-ajax]');
    if (aj && root.contains(aj) && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      var u = new URL(aj.href, location.href);
      load(u.search.replace(/^\?/, ''), true);
      return;
    }
    var more = tg.closest('#more');
    if (more && root.contains(more)) { e.preventDefault(); loadMore(more); return; }
    var dn = tg.closest('button[data-cols]');
    if (dn && root.contains(dn)) { setCols(+dn.dataset.cols); LS.set('cols', +dn.dataset.cols); return; }
    if (tg.closest('#open-filters')) { openPanel(); return; }
    if (tg.closest('[data-fclose]')) { closePanel(); return; }
    if (tg.closest('[data-uncast]')) { LS.set('castOnly', false); syncCast(); return; }
    var qd = tg.closest('[data-qf-dia]'); if (qd) { toggleIn(qs.dia, qd.getAttribute('data-qf-dia')); qd.classList.toggle('is-on'); applyQuick(); return; }
    var qm = tg.closest('[data-qf-maker]'); if (qm) { toggleIn(qs.maker, qm.getAttribute('data-qf-maker')); qm.classList.toggle('is-on'); applyQuick(); return; }
    var qb = tg.closest('[data-qf-bearing]'); if (qb) { qs.bearing = !qs.bearing; qb.classList.toggle('is-on', qs.bearing); applyQuick(); return; }
    if (tg.closest('[data-qf-reset]')) { qs = { dia: [], maker: [], bearing: false }; buildQuick(); return; }
    if (tg.closest('[data-cast-enable]')) { LS.set('castOnly', true); syncCast(); return; }
  });

  window.addEventListener('popstate', function () {
    load(location.search.replace(/^\?/, ''), false);
  });

  H.on('garage', function () { syncCast(); });

  /* ---------- init ---------- */
  enhance(root);
  buildQuick();
  syncCast();
  initRecent();

  /* ---------- recently viewed rail ---------- */
  function initRecent() {
    var sec = $('#recent-s'), track = $('#recent');
    if (!sec || !track) return;
    var handles = H.recent ? H.recent.get() : (LS.get('recent', []) || []);
    handles = handles.slice(0, 10);
    if (handles.length < 2) return;
    var base = ((H.cfg.routes && H.cfg.routes.root) || '/').replace(/\/$/, '');
    Promise.all(handles.map(function (h) {
      return fetch(base + '/products/' + encodeURIComponent(h) + '?section_id=product-card-single', { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (html) {
          if (!html) return '';
          var el = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-single]');
          return el && el.firstElementChild ? el.firstElementChild.outerHTML : '';
        }).catch(function () { return ''; });
    })).then(function (cards) {
      cards = cards.filter(Boolean);
      if (cards.length < 2) return;
      track.innerHTML = cards.join('');
      sec.hidden = false;
      if (H.rail) H.rail(track);
      if (H.reveal) H.reveal(track);
      if (H.tagFit) H.tagFit(track);
    });
  }
});
