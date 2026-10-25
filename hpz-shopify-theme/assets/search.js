/* HPZ - global search: overlay, predictive search, recently viewed handles.
   Overlay markup: snippets/search-overlay.liquid inside .search#search.
   Predictive: /search/suggest?section_id=predictive-search&q=... (sections/predictive-search.liquid)
   Exposes HPZ.openSearch(q) and HPZ.recent {get, add}. */
(function () {
  var H = window.HPZ;
  if (!H) return;
  var $ = H.$, $$ = H.$$, esc = H.esc, LS = H.LS;

  /* ---------- recently viewed product handles (shared with collection.js) ---------- */
  var MAX = 12;
  H.recent = {
    get: function () { var l = LS.get('recent', []); return Array.isArray(l) ? l.filter(Boolean) : []; },
    add: function (handle) {
      if (!handle) return;
      var l = H.recent.get().filter(function (h) { return h !== handle; });
      l.unshift(handle); LS.set('recent', l.slice(0, MAX));
    }
  };

  H.ready(function () {
    // Record the product being viewed (any /products/{handle} page).
    var m = location.pathname.match(/(?:^|\/)products\/([^\/?#]+)/);
    if (m) H.recent.add(decodeURIComponent(m[1]));

    var el = $('#search'), inp = $('#sr-q'), res = $('#sr-res');
    if (!el || !inp || !res) return;

    var homeHTML = res.innerHTML, sel = -1, ctrl = null, seq = 0;
    var cache = {};
    var root = ((H.cfg && H.cfg.routes && H.cfg.routes.root) || '/').replace(/\/$/, '');
    var suggestUrl = root + '/search/suggest';
    var searchUrl = (H.cfg && H.cfg.routes && H.cfg.routes.search) || (root + '/search');

    /* ---------- home state (popular, categories, recently viewed) ---------- */
    function productJSON(handle) {
      if (cache[handle]) return Promise.resolve(cache[handle]);
      return fetch(root + '/products/' + encodeURIComponent(handle) + '.js', { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (p) { if (p) cache[handle] = p; return p; })
        .catch(function () { return null; });
    }
    function srItem(p) {
      var img = p.featured_image ? p.featured_image + (p.featured_image.indexOf('?') > -1 ? '&' : '?') + 'width=160' : '';
      return '<a class="sr-p" href="' + esc(p.url) + '">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" width="58" height="58">' : '') +
        '<span>' + (p.vendor ? '<em>' + esc(p.vendor) + '</em>' : '') + '<b>' + esc(p.title) + '</b><i>' + H.money(p.price) + '</i></span></a>';
    }
    function fillRecent() {
      var box = $('[data-sr-recent]', res), list = $('[data-sr-recent-list]', res), hint = $('[data-sr-hint]', res);
      if (!box || !list) return;
      var handles = H.recent.get().slice(0, 6);
      if (!handles.length) return;
      Promise.all(handles.map(productJSON)).then(function (ps) {
        ps = ps.filter(Boolean);
        if (!ps.length || inp.value.trim()) return;
        list.innerHTML = ps.map(srItem).join('');
        box.hidden = false; if (hint) hint.hidden = true;
      });
    }
    function showHome() { res.innerHTML = homeHTML; sel = -1; fillRecent(); }

    /* ---------- predictive ---------- */
    function draw() {
      var q = inp.value.trim();
      if (!q) { if (ctrl) ctrl.abort(); showHome(); return; }
      var my = ++seq;
      if (ctrl) ctrl.abort();
      ctrl = window.AbortController ? new AbortController() : null;
      var p = new URLSearchParams({
        q: q, section_id: 'predictive-search',
        'resources[type]': 'product,collection,article,query',
        'resources[limit]': '8', 'resources[limit_scope]': 'each',
        'resources[options][fields]': 'title,product_type,variant_title,vendor,tag'
      });
      fetch(suggestUrl + '?' + p.toString(), { signal: ctrl ? ctrl.signal : undefined, credentials: 'same-origin' })
        .then(function (r) { if (!r.ok) throw new Error('bad'); return r.text(); })
        .then(function (html) {
          if (my !== seq) return;
          var node = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-predictive]');
          if (!node) return;
          res.innerHTML = node.innerHTML; sel = -1;
        })
        .catch(function () { /* aborted or offline: keep the current view; Enter still submits the form */ });
    }
    inp.addEventListener('input', H.debounce(draw, 140));

    inp.addEventListener('keydown', function (e) {
      var items = $$('a', res);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!items.length) return;
        e.preventDefault();
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach(function (a, i) { a.classList.toggle('is-sel', i === sel); });
        items[sel].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && sel > -1 && items[sel]) {
        e.preventDefault(); location.href = items[sel].href;
      }
    });

    res.addEventListener('click', function (e) {
      var c = e.target.closest('[data-sq]');
      if (!c) return;
      e.preventDefault();
      inp.value = c.getAttribute('data-sq'); draw(); inp.focus();
    });

    /* ---------- open / focus ---------- */
    function openSearch(q) {
      if (!el.classList.contains('is-open')) H.open('search');
      inp.value = q || '';
      draw();
      setTimeout(function () { inp.focus(); }, 60);
    }
    H.openSearch = openSearch;

    // Opened by [data-open="search"] / the "/" shortcut in theme.js: reset state and focus.
    var wasOpen = el.classList.contains('is-open');
    new MutationObserver(function () {
      var now = el.classList.contains('is-open');
      if (now && !wasOpen) { if (!inp.value.trim()) showHome(); setTimeout(function () { inp.focus(); }, 60); }
      wasOpen = now;
    }).observe(el, { attributes: true, attributeFilter: ['class'] });

    // Deep link: ?open_search=term opens the overlay (optional helper for emails/links).
    var qp = new URLSearchParams(location.search).get('open_search');
    if (qp !== null) openSearch(qp);

    showHome();
  });

  // Fallback until the overlay is wired (replaced inside ready()).
  if (!H.openSearch) H.openSearch = function () { H.open('search'); };
})();
