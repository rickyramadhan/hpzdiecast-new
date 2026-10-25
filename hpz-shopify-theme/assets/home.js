/* HPZ homepage sections.
   Loaded (deferred) by every home section; guarded so it only runs once.
   Each section root carries data-home="<name>"; init is idempotent and is re-run on
   shopify:section:load for the theme editor. */
(function () {
  if (window.__hpzHome) return; window.__hpzHome = true;

  var H = window.HPZ;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* fallbacks in case theme.js lacks a helper */
  function splitLines(el) {
    if (H.splitLines) return H.splitLines(el);
    if (el.dataset.splitDone) return; el.dataset.splitDone = 1;
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map(function (l, i) { return '<span class="split-line" style="--i:' + i + '"><span>' + l + '</span></span>'; }).join('');
  }
  function countOnView(root) {
    if (H.countOnView) return H.countOnView(root);
  }
  function tabsInk(el, fn) {
    if (H.tabs) return H.tabs(el, fn);
  }

  /* ---------- hero ---------- */
  function initHero(root) {
    var h1 = $('[data-hero-h]', root);
    function intro() {
      h1.classList.remove('is-in'); delete h1.dataset.splitDone; splitLines(h1);
      void h1.offsetWidth; requestAnimationFrame(function () { h1.classList.add('is-in'); });
    }
    intro();

    var spin = $('[data-bw-spin]', root), fin = 'gold';
    var draw = function () { spin.innerHTML = H.wheelSVG({ spokes: 6, finish: fin, disc: 1 }); };
    draw();
    var ang = 0, vel = 0, boost = 0, lastY = window.scrollY;
    (function loop() {
      if (!root.isConnected) return;
      var dy = window.scrollY - lastY; lastY = window.scrollY;
      vel += (dy * 0.9 - vel) * 0.12; boost *= 0.94;
      ang += reduce ? 0 : 0.25 + vel + boost;
      spin.style.transform = 'rotate(' + ang + 'deg)';
      requestAnimationFrame(loop);
    })();
    var fins = $('[data-bw-fin]', root);
    if (fins) fins.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fin]'); if (!b || b.dataset.fin === fin) return;
      fin = b.dataset.fin; boost = 34;
      $$('button', fins).forEach(function (x) { x.classList.toggle('is-on', x === b); });
      spin.classList.add('is-blur'); setTimeout(draw, 160); setTimeout(function () { spin.classList.remove('is-blur'); }, 520);
    });

    var bench = $('[data-bench]', root);
    bench.addEventListener('pointermove', function (e) {
      var r = bench.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      $$('.bc', bench).forEach(function (c, i) { var k = (i % 2 ? -1 : 1) * (8 + i * 3); c.style.setProperty('--px', (x * k) + 'px'); c.style.setProperty('--py', (y * k) + 'px'); });
    });
    bench.addEventListener('pointerleave', function () { $$('.bc', bench).forEach(function (c) { c.style.setProperty('--px', '0px'); c.style.setProperty('--py', '0px'); }); });

    requestAnimationFrame(function () { root.classList.add('is-in'); });
    countOnView(root);
  }

  /* ---------- tabs (collection rail + product tabs) ---------- */
  function initTabs(root) {
    var target = $('[data-tabs-target]', root), bar = $('[data-tabs]', root);
    var more = $('[data-tabs-more]', root), fade = root.dataset.tabsFade === 'true';
    var prev = $('[data-rail-prev]', root), next = $('[data-rail-next]', root);
    if (target.classList.contains('rail')) H.rail(target, prev, next);
    if (!bar) return;
    var firstBtn = $('button', bar), cache = {};
    cache[firstBtn.dataset.tab] = { html: target.innerHTML, href: more && more.getAttribute('href'), count: more && more.dataset.count };
    $$('template[data-tab-tpl]', root).forEach(function (t) { cache[t.dataset.tabTpl] = { html: t.innerHTML, href: t.dataset.href, count: t.dataset.count }; });
    var token = 0, active = firstBtn.dataset.tab;

    // Liquid can only approximate sorts: pull the real ?sort_by= order from the collection page.
    function refreshSorted(btn) {
      var coll = btn.dataset.coll, sort = btn.dataset.sort, lim = parseInt(btn.dataset.limit, 10) || 8, k = btn.dataset.tab;
      if (!coll || !sort || !window.fetch || !window.DOMParser) return;
      fetch('/collections/' + encodeURIComponent(coll) + '?sort_by=' + encodeURIComponent(sort))
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (html) {
          if (!html) return;
          var all = $$('.pc', new DOMParser().parseFromString(html, 'text/html'));
          // in-stock cards first, sold-out only to fill the row
          var cards = all.filter(function (n) { return !n.classList.contains('is-out'); }).concat(all.filter(function (n) { return n.classList.contains('is-out'); })).slice(0, lim);
          if (!cards.length || !cache[k]) return;
          cache[k].html = cards.map(function (n) { return n.outerHTML; }).join('');
          if (active === k && root.isConnected) {
            target.innerHTML = cache[k].html;
            if (H.reveal) H.reveal(target); if (H.tagFit) H.tagFit(target);
            if (target.classList.contains('rail')) target.dispatchEvent(new Event('scroll'));
          }
        }).catch(function () { });
    }
    $$('button[data-sort]', bar).forEach(refreshSorted);

    tabsInk(bar, function (k) {
      active = k;
      var c = cache[k]; if (!c) return;
      var my = ++token;
      var swap = function () {
        if (my !== token) return;
        target.innerHTML = c.html; target.classList.remove('is-swap'); target.scrollLeft = 0;
        if (H.reveal) H.reveal(target); if (H.tagFit) H.tagFit(target);
        if (target.classList.contains('rail')) target.dispatchEvent(new Event('scroll'));
        if (more && c.href) { more.setAttribute('href', c.href); var n = $('.mono', more); if (n && c.count) n.textContent = c.count; }
      };
      target.classList.add('is-swap');
      reduce ? swap() : setTimeout(swap, fade ? 180 : 140);
    });
  }

  /* ---------- anatomy ---------- */
  function initAnatomy(root) {
    var w = $('[data-anat-wheel]', root); if (w) w.innerHTML = H.wheelSVG({ spokes: 6, finish: 'gold', disc: 1 });
    var set = function (k) {
      root.dataset.part = k || '';
      $$('[data-part]', root).forEach(function (e) { e.classList.toggle('is-on', e.dataset.part === k); });
      $$('[data-hl]', root).forEach(function (e) { e.classList.toggle('is-on', e.dataset.hl === k); });
    };
    $$('[data-part]', root).forEach(function (el) {
      el.addEventListener('mouseenter', function () { set(el.dataset.part); });
      el.addEventListener('mouseleave', function () { set(null); });
      el.addEventListener('click', function () { set(el.dataset.part); });
    });
  }

  /* ---------- UGC hotspots ---------- */
  function initUgc(root) {
    root.addEventListener('click', function (e) {
      var d = e.target.closest('.hs-dot'); if (!d) return;
      e.preventDefault();
      var hs = d.parentElement;
      $$('.hs.is-open', root).forEach(function (x) { if (x !== hs) x.classList.remove('is-open'); });
      hs.classList.toggle('is-open');
    });
    document.addEventListener('click', function (e) { if (!root.isConnected) return; if (!e.target.closest('.hs')) $$('.hs.is-open', root).forEach(function (x) { x.classList.remove('is-open'); }); });
    if (H.reveal) H.reveal(root);
  }

  /* ---------- reviews ---------- */
  function initReviews(root) {
    H.rail($('[data-rev-rail]', root), $('[data-rail-prev]', root), $('[data-rail-next]', root));
    var bars = $('[data-rev-bars]', root);
    if (bars) {
      if (!('IntersectionObserver' in window)) bars.classList.add('is-in');
      else { var ob = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { bars.classList.add('is-in'); ob.disconnect(); } }, { threshold: 0.5 }); ob.observe(bars); }
    }
    $$('[data-flag]', root).forEach(function (el) {
      var code = el.dataset.flag;
      el.innerHTML = typeof H.flag === 'function' ? H.flag(code) : '<span class="mono" style="font-size:11px">' + esc(code) + '</span>';
    });
    countOnView(root);
  }

  /* ---------- fitment finder ---------- */
  function initFitment(root) {
    var sel = $('[data-fit-sel]', root), read = $('[data-fit-read]', root), go = $('[data-fit-go]', root), vis = $('[data-fit-vis]', root);
    var D = root.dataset, wheelsUrl = D.wheelsUrl, showMade = D.madeFor !== 'false';
    var ctrl = null, own = false;

    // no server-rendered castings (metaobjects empty): build from HPZ.cfg.castings
    if (!sel.options.length) {
      var list = (H.cfg && H.cfg.castings) || [], groups = {};
      if (!list.length) { try { list = JSON.parse($('[data-fit-fallback]', root).textContent); } catch (e) { list = []; } }
      list.forEach(function (c) { (groups[c.maker || 'Other'] = groups[c.maker || 'Other'] || []).push(c); });
      sel.innerHTML = Object.keys(groups).map(function (g) {
        return '<optgroup label="' + esc(g) + '">' + groups[g].map(function (c) {
          return '<option value="' + esc(c.handle) + '" data-name="' + esc(c.name) + '" data-maker="' + esc(c.maker) + '" data-year="' + esc(c.year || '') + '" data-body="' + esc(c.body || '') + '" data-verified="' + (c.verified ? '1' : '0') + '" data-dia="' + esc(c.dia) + '" data-axle="' + esc(c.axle || '') + '">' + esc(c.name) + '</option>';
        }).join('') + '</optgroup>';
      }).join('');
    }
    if (!sel.options.length) { root.hidden = true; return; }

    var garageSel = function () {
      var cur = H.garage && H.garage.current();
      if (cur) { var o = $$('option', sel).filter(function (x) { return x.value === cur.handle; })[0]; if (o) sel.value = cur.handle; }
    };
    garageSel();

    function draw(animate) {
      var o = sel.options[sel.selectedIndex]; if (!o) return;
      var dia = parseFloat(o.dataset.dia), body = o.dataset.body || 'coupe';
      var axle = o.dataset.axle ? (D['t' + o.dataset.axle.charAt(0).toUpperCase() + o.dataset.axle.slice(1)] || o.dataset.axle) : '';
      var cells = [];
      var verified = o.dataset.verified === '1';
      if (dia) cells.push([D.tDia, dia.toFixed(1) + '<small>mm</small>' + (verified ? '' : '<small class="fit-est"> ' + esc(D.tEst || 'estimated') + '</small>'), 'mono']);
      if (axle) cells.push([D.tAxle, esc(axle)]);
      if (o.dataset.maker) cells.push([D.tMaker, esc(o.dataset.maker)]);
      if (o.dataset.year) cells.push([D.tYear, esc(o.dataset.year), 'mono']);
      read.style.gridTemplateColumns = 'repeat(' + Math.max(cells.length, 1) + ',1fr)';
      read.innerHTML = cells.map(function (c) { return '<div><span>' + esc(c[0]) + '</span><b' + (c[2] ? ' class="' + c[2] + '"' : '') + (c[0] === D.tAxle || c[0] === D.tMaker ? ' style="font-size:13px;font-family:var(--f-sans)"' : '') + '>' + c[1] + '</b></div>'; }).join('');
      // wheels of this diameter
      go.setAttribute('href', dia && D.hasFilter === 'true' ? wheelsUrl + '?filter.p.m.hpz.diameter=' + encodeURIComponent(o.dataset.dia) : wheelsUrl);

      var path = (H.SIL && (H.SIL[body] || H.SIL.coupe)) || '';
      var wsvg = H.wheelSVG({ spokes: 6, finish: 'gold', lip: 1 });
      vis.innerHTML = '<div class="fv-stage ' + (animate ? 'is-drive' : '') + '">' +
        '<div class="fv-car" style="--w:' + (dia || 10) + '%">' +
        '<svg class="fv-body" viewBox="0 0 200 70" aria-hidden="true"><path d="' + path + '"/></svg>' +
        '<span class="fv-w fv-w1">' + wsvg + '</span><span class="fv-w fv-w2">' + wsvg + '</span>' +
        (dia ? '<span class="fv-dim mono"><i></i>Ø ' + dia.toFixed(1) + ' mm</span>' : '') +
        '</div><div class="fv-ground"></div>' +
        '<div class="fv-meta mono"><span>' + esc((o.dataset.maker || '').toUpperCase()) + '</span><span>' + esc((o.dataset.name || '').toUpperCase()) + '</span><span>' + esc(o.dataset.year || '') + '</span></div></div>' +
        '<div class="fv-made" hidden></div>';
      if (showMade) loadMade(o.dataset.name);
    }

    // "made for this casting": products whose title/tags mention the casting name (predictive search API)
    function loadMade(name) {
      if (ctrl) ctrl.abort();
      var box = $('.fv-made', vis); if (!box || !name || !window.fetch) return;
      ctrl = window.AbortController ? new AbortController() : null;
      var url = ((H.cfg && H.cfg.routes && H.cfg.routes.suggest) || '/search/suggest') + '.json?q=' + encodeURIComponent(name) + '&resources[type]=product&resources[limit]=5&resources[options][fields]=title,tag,product_type';
      fetch(url, ctrl ? { signal: ctrl.signal, headers: { Accept: 'application/json' } } : {})
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          var items = j && j.resources && j.resources.results && j.resources.results.products || [];
          if (!items.length || !box.isConnected) return;
          box.innerHTML = '<span class="eyebrow">' + esc(D.tMade) + '</span><div>' + items.slice(0, 4).map(function (p) {
            return '<a href="' + esc(p.url) + '" title="' + esc(p.title) + '">' + (p.image ? '<img src="' + esc(p.image) + '" alt="" loading="lazy">' : '') + '<span>' + esc(p.type || '') + '</span></a>';
          }).join('') + '</div>';
          box.hidden = false;
        }).catch(function () { });
    }

    sel.addEventListener('change', function () {
      own = true; if (H.garage) H.garage.set(sel.value); own = false;
      draw(true);
    });
    H.on('garage', function () { if (!root.isConnected || own) return; garageSel(); draw(false); });
    draw(false);
  }

  var INIT = { hero: initHero, tabs: initTabs, anatomy: initAnatomy, ugc: initUgc, reviews: initReviews, fitment: initFitment };

  function boot(scope) {
    var root = scope || document;
    var nodes = $$('[data-home]', root);
    if (root.dataset && root.dataset.home) nodes.push(root);
    nodes.forEach(function (el) {
      if (el.__hpzHome) return; el.__hpzHome = true;
      var fn = INIT[el.dataset.home]; if (fn) { try { fn(el); } catch (err) { if (window.console) console.error('[hpz home]', el.dataset.home, err); } }
    });
    if (H.reveal) H.reveal(root);
  }

  H.ready(function () { boot(document); });
  document.addEventListener('shopify:section:load', function (e) { boot(e.target); });
})();
