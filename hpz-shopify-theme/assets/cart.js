/* HPZ cart — window.HPZ.cart (loaded globally by layout, defer, after theme.js)

   Approach
   - Mutations use the Ajax API (/cart/add.js, /cart/change.js, /cart/update.js, /cart.js), serialised through a queue.
   - After every mutation sync() fetches /cart.js plus the Section Rendering API
     (/cart?section_id=cart-drawer-content and section_id=main-cart) and swaps the drawer (#d-cart) and cart page ([data-cart-root]).
     Markup therefore always comes from Liquid (snippets/cart-*.liquid, sections/main-cart.liquid).
   - Recommendations: /recommendations/products?section_id=cart-drawer-content (drawer upsell) and
     section_id=main-cart (page rail). The Liquid fallback (collection setting) stays if they return nothing.
   - Add-ons (box / protection) are normal variants identified by product handle (HPZ.cfg.addonBox/addonProtect);
     they are hidden from line lists, shown as switches, and removed automatically when the last real line goes.
   - Money: /cart.js values are already in presentment currency; they are only formatted (HPZ.money = Intl, no conversion).
     Only the free-shipping threshold is converted: HPZ.cfg.freeShipCents() = freeShipUsd * 100 * Shopify.currency.rate.
   - JS strings use HPZ.t(en, id, ja) (known tech debt). Emits hpz:cart with the cart JSON. */
(function () {
  'use strict';
  var H = window.HPZ;
  if (!H || H.cart) return;
  var $ = H.$, $$ = H.$$, esc = H.esc;
  var t = function (a, b, c) { return H.t(a, b, c); };
  var routes = function () { return (H.cfg && H.cfg.routes) || {}; };
  var R = function (k, d) { return routes()[k] || d; };

  var state = { cart: null, lastA: {}, ups: {}, busy: false };
  var queue = Promise.resolve();
  var enqueue = function (fn) { var p = queue.then(fn); queue = p.catch(function () {}); return p; };

  /* ---------- helpers ---------- */
  function fmt(cents) {
    if (H.money && !(state.cart && state.cart.currency && window.Shopify && Shopify.currency && Shopify.currency.active && state.cart.currency !== Shopify.currency.active)) return H.money(cents);
    var cur = (state.cart && state.cart.currency) || (H.cfg && H.cfg.currency) || 'USD';
    var zero = cur === 'JPY' || cur === 'IDR' || cur === 'KRW';
    try { return new Intl.NumberFormat(H.cfg.locale || 'en', { style: 'currency', currency: cur, minimumFractionDigits: zero ? 0 : 2, maximumFractionDigits: zero ? 0 : 2 }).format(cents / 100); }
    catch (e) { return (cents / 100).toFixed(2) + ' ' + cur; }
  }
  function isAddon(item) {
    var h = item.handle;
    return !!h && (h === H.cfg.addonBox || h === H.cfg.addonProtect);
  }
  function split(cart) {
    var lines = [], addons = [], count = 0, sub = 0;
    (cart.items || []).forEach(function (i) {
      if (isAddon(i)) addons.push(i); else { lines.push(i); count += i.quantity; sub += i.final_line_price; }
    });
    return { lines: lines, addons: addons, count: count, sub: sub };
  }
  function toastErr(msg) {
    H.toast({ title: t('Could not update cart', 'Keranjang tidak bisa diperbarui', 'カートを更新できません'), sub: msg || '', icon: H.ICON.info });
  }
  function post(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body) });
  }
  function errMsg(res) { return res.json().then(function (j) { return j.description || j.message || ''; }).catch(function () { return ''; }); }
  function freeCents() {
    if (H.cfg.freeShipCents) return H.cfg.freeShipCents();
    var rate = (window.Shopify && Shopify.currency && +Shopify.currency.rate) || 1;
    return (H.cfg.freeShipUsd || 0) * 100 * rate;
  }

  /* ---------- header count, bump, fly ---------- */
  function updateHeader(cart) {
    var n = split(cart).count, el = $('#hdr-cart-n');
    if (el) {
      var cur = el.getAttribute('data-n');
      el.hidden = !n;
      if (String(n) !== cur) { el.setAttribute('data-n', n); el.innerHTML = '<span class="roll">' + n + '</span>'; }
    }
    $$('[data-cart-count-paren]').forEach(function (e) { e.textContent = n ? '(' + n + ')' : ''; });
  }
  function bump() {
    var el = $('#hdr-cart'); if (!el) return;
    setTimeout(function () { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }, 600);
  }
  function fly(from, src) {
    var target = $('#hdr-cart');
    if (!target || !from || !from.getBoundingClientRect || !src) return;
    var a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
    if (!a.width) return;
    var img = document.createElement('img'); img.src = src; img.className = 'fly'; img.alt = '';
    var s = Math.min(90, a.width || 90);
    Object.assign(img.style, { left: a.left + a.width / 2 - s / 2 + 'px', top: a.top + a.height / 2 - s / 2 + 'px', width: s + 'px', height: s + 'px' });
    document.body.appendChild(img);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    var anim = img.animate([
      { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
      { transform: 'translate(' + dx * 0.45 + 'px,' + (dy * 0.45 - 120) + 'px) scale(.7) rotate(-12deg)', opacity: 1, offset: 0.55 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.12) rotate(-30deg)', opacity: 0.3 }
    ], { duration: 700, easing: 'cubic-bezier(.5,0,.2,1)' });
    anim.onfinish = function () { img.remove(); };
  }

  /* ---------- free shipping / tachometer ---------- */
  function applyFree(root, key, firstDefault) {
    var box = $('[data-free]', root); if (!box) return;
    var sub = +box.getAttribute('data-sub') || 0, thr = freeCents();
    var ratio = thr > 0 ? sub / thr : 1, done = ratio >= 1, r = Math.min(1, ratio);
    box.classList.toggle('is-done', done);
    var svg = $('.tach', box); if (svg) svg.classList.toggle('is-red', done);
    var on = $('[data-free-on]', box), off = $('[data-free-off]', box);
    if (on) on.hidden = !done; if (off) off.hidden = done;
    var left = $('[data-free-left]', box); if (left) left.textContent = fmt(Math.max(0, thr - sub));
    $$('line[data-i]', box).forEach(function (l) {
      var i = +l.getAttribute('data-i'); if (i >= 34) return;
      l.setAttribute('stroke', (i / 40 <= r) ? '#0e0f11' : '#c9c6bf');
    });
    var nd = $('.tach-needle', box); if (!nd) return;
    var angle = -120 + 240 * r, ssr = parseFloat(nd.getAttribute('data-angle'));
    var prev = state.lastA[key];
    if (prev == null) prev = firstDefault != null ? firstDefault : ssr;
    nd.style.setProperty('--a', prev + 'deg');
    requestAnimationFrame(function () { requestAnimationFrame(function () { nd.style.setProperty('--a', angle + 'deg'); }); });
    state.lastA[key] = angle;
  }

  /* ---------- saved for later (localStorage) ---------- */
  function later() { return H.LS.get('later', []); }
  function renderLater() {
    var list = later();
    $$('[data-later-box]').forEach(function (box) {
      if (!list.length) { box.hidden = true; box.innerHTML = ''; return; }
      box.hidden = false;
      box.innerHTML = '<h3 class="h4">' + esc(t('Saved for later', 'Disimpan untuk nanti', 'あとで買う')) + ' <span class="mono muted">(' + list.length + ')</span></h3><div class="later-l">' +
        list.map(function (l, i) {
          return '<div class="lt">' + (l.img ? '<img src="' + esc(l.img) + '" alt="" width="56" height="56">' : '<span></span>') +
            '<div><b>' + esc(l.title) + '</b><span class="mono xs">' + (l.vtitle ? esc(l.vtitle) + ' · ' : '') + fmt(+l.price || 0) + '</span></div>' +
            '<button type="button" class="btn btn-sm btn-ghost" data-back="' + i + '">' + esc(t('Move to cart', 'Pindah ke keranjang', 'カートへ')) + '</button></div>';
        }).join('') + '</div>';
    });
  }

  /* ---------- rendering ---------- */
  function parse(html) { return new DOMParser().parseFromString(html, 'text/html'); }
  function afterRender(scopeKey, root, first) {
    if (!root) return;
    applyFree(root, scopeKey, scopeKey === 'page' && first ? -120 : null);
    $$('[data-wheel]', root).forEach(function (w) {
      try { var s = H.wheelSVG({ spokes: 5, finish: 'gunmet', style: 'spoke' }); if (s) w.outerHTML = s; } catch (e) { /* keep static svg */ }
    });
    if (H.tagFit) H.tagFit(root);
    renderLater();
  }
  function renderDrawer(html, first) {
    var host = $('#d-cart'); if (!host || !html) return;
    var src = parse(html).querySelector('[data-cart-drawer-src]'); if (!src) return;
    var body = $('.dr-body', host), top = body ? body.scrollTop : 0;
    host.innerHTML = src.innerHTML;
    var nb = $('.dr-body', host); if (nb) nb.scrollTop = top;
    afterRender('drawer', host, first);
    loadDrawerUpsell();
  }
  function renderPage(html, first) {
    var root = $('[data-cart-root]'); if (!root || !html) return;
    var doc = parse(html), nr = doc.querySelector('[data-cart-root]'); if (!nr) return;
    root.innerHTML = nr.innerHTML;
    var xs = $('#xs-s'), nx = doc.querySelector('#xs-s');
    if (xs && nx) { var tr = $('#xs'), ntr = doc.querySelector('#xs'); if (tr && ntr) { tr.innerHTML = ntr.innerHTML; if (H.tagFit) H.tagFit(tr); } xs.hidden = nx.hidden; }
    afterRender('page', root, first);
    loadPageRail();
  }
  function firstLine() { var s = state.cart ? split(state.cart) : null; return s && s.lines[0]; }

  function loadDrawerUpsell() {
    var host = $('#d-cart [data-ups]'); var l = firstLine(); if (!host || !l) return;
    var fallback = host.innerHTML, pid = l.product_id;
    var apply = function (html) {
      var res = parse(html).querySelector('[data-ups-result]');
      if (!res || !$('.ups-i', res)) return;
      var inCart = {}; state.cart.items.forEach(function (i) { inCart[i.product_id] = 1; });
      var tmp = document.createElement('div'); tmp.innerHTML = res.innerHTML;
      $$('.ups-i', tmp).forEach(function (n) { if (inCart[n.getAttribute('data-pid')]) n.remove(); });
      if ($('.ups-i', tmp)) host.innerHTML = tmp.innerHTML; else host.innerHTML = fallback;
    };
    if (state.ups[pid]) { apply(state.ups[pid]); return; }
    fetch(R('root', '/') + 'recommendations/products?section_id=cart-drawer-content&product_id=' + pid + '&limit=6&intent=complementary')
      .then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) { if (html) { state.ups[pid] = html; if ($('#d-cart [data-ups]')) apply(html); } }).catch(function () {});
  }
  function loadPageRail() {
    var track = $('#xs'); var l = firstLine(); if (!track || !l) return;
    var key = 'page' + l.product_id, limit = +track.getAttribute('data-xs-limit') || 8;
    var apply = function (html) {
      var res = parse(html).querySelector('[data-xs-result]');
      if (!res || !$('.pc', res)) return;
      track.innerHTML = res.innerHTML; if (H.tagFit) H.tagFit(track);
      var s = $('#xs-s'); if (s) s.hidden = false;
    };
    if (state.ups[key]) { apply(state.ups[key]); return; }
    fetch(R('root', '/') + 'recommendations/products?section_id=main-cart&product_id=' + l.product_id + '&limit=' + (limit + 4) + '&intent=complementary')
      .then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) { if (html) { state.ups[key] = html; apply(html); } }).catch(function () {});
  }

  /* ---------- sync ---------- */
  function fetchCart() { return fetch(R('cart', '/cart') + '.js', { headers: { Accept: 'application/json' }, cache: 'no-store' }).then(function (r) { return r.json(); }); }
  function sync(first) {
    return fetchCart().then(function (cart) {
      var s = split(cart);
      if (!s.lines.length && s.addons.length) { // add-ons never stay alone in a cart
        var u = {}; s.addons.forEach(function (a) { u[a.variant_id] = 0; });
        return post(R('cartUpdate', '/cart/update.js'), { updates: u }).then(function (r) { return r.json(); });
      }
      return cart;
    }).then(function (cart) {
      state.cart = cart; updateHeader(cart);
      // /cart?sections=... answers with the cart JSON when Accept is JSON, so ask for each section as HTML instead
      var base = R('cart', '/cart');
      var sec = function (id) { return fetch(base + '?section_id=' + id, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('section ' + id); return r.text(); }); };
      var jobs = [sec('cart-drawer-content')];
      if ($('[data-cart-root]')) jobs.push(sec('main-cart'));
      return Promise.all(jobs)
        .then(function (html) { renderDrawer(html[0], first); if (html[1]) renderPage(html[1], first); })
        .catch(function () { /* markup stays as is; state and header are still correct */ })
        .then(function () { H.emit('cart', cart); return cart; });
    });
  }

  /* ---------- public actions ---------- */
  function normalize(items) {
    return (items || []).map(function (i) {
      var o = { id: +i.id, quantity: +i.quantity || 1 };
      if (i.properties && Object.keys(i.properties).length) o.properties = i.properties;
      return o;
    }).filter(function (o) { return o.id; });
  }
  function add(items, opts) {
    opts = opts || {}; items = normalize(items);
    if (!items.length) return Promise.resolve(null);
    return enqueue(function () {
      return post(R('cartAdd', '/cart/add.js'), { items: items }).then(function (res) {
        if (!res.ok) return errMsg(res).then(function (m) { toastErr(m); return null; });
        return res.json().then(function (j) {
          var first = j.items && j.items[0], src = first && (first.image || (first.featured_image && first.featured_image.url));
          if (opts.from && src) fly(opts.from, src);
          return sync().then(function (cart) {
            bump();
            var noDrawer = document.body.classList.contains('no-drawer') || opts.drawer === false;
            if (!noDrawer) setTimeout(function () { H.open('cart'); }, opts.from ? 520 : 0);
            return cart;
          });
        });
      }).catch(function () { toastErr(''); return null; });
    });
  }
  function change(keyOrLine, qty) {
    var body = typeof keyOrLine === 'number' ? { line: keyOrLine, quantity: qty } : { id: String(keyOrLine), quantity: qty };
    return enqueue(function () {
      return post(R('cartChange', '/cart/change.js'), body).then(function (res) {
        var bad = !res.ok;
        return (bad ? errMsg(res) : Promise.resolve('')).then(function (m) { if (bad) toastErr(m); return sync(); });
      }).catch(function () { toastErr(''); return sync(); });
    });
  }
  function update(data) {
    return enqueue(function () {
      return post(R('cartUpdate', '/cart/update.js'), data).then(function (res) {
        if (!res.ok) return errMsg(res).then(function (m) { toastErr(m); return null; });
        return res.json().then(function (cart) { state.cart = cart; updateHeader(cart); H.emit('cart', cart); return cart; });
      });
    });
  }
  function addBundle(ids, opts) {
    opts = opts || {}; var bid = opts.bundleId || ('bundle-' + Date.now());
    return add((ids || []).map(function (id) { return { id: id, quantity: 1, properties: { _bundle: String(bid) } }; }), opts);
  }
  function toggleAddon(kind, on) {
    var input = $('[data-addon="' + kind + '"]'), vid = input && +input.getAttribute('data-variant-id');
    if (!vid) return Promise.resolve(null);
    return on ? add([{ id: vid, quantity: 1 }], { drawer: false }) : change(String(vid), 0);
  }
  function removeLine(key) {
    var item = state.cart && state.cart.items.filter(function (i) { return i.key === key; })[0];
    var row = $('[data-line][data-key="' + (window.CSS && CSS.escape ? CSS.escape(key) : key) + '"]');
    if (row) row.classList.add('is-out');
    return new Promise(function (r) { setTimeout(r, row ? 260 : 0); }).then(function () { return change(key, 0); }).then(function (cart) {
      if (item) H.toast({
        title: t('Removed from cart', 'Dihapus dari keranjang', 'カートから削除しました'), sub: item.product_title, img: item.image,
        action: t('Undo', 'Batal', '元に戻す'),
        onAction: function () { add([{ id: item.variant_id, quantity: item.quantity, properties: item.properties || undefined }], { drawer: false }); }
      });
      return cart;
    });
  }

  H.cart = {
    get: function () { return state.cart ? Promise.resolve(state.cart) : fetchCart().then(function (c) { state.cart = c; return c; }); },
    add: add, change: change, update: update, addBundle: addBundle, toggleAddon: toggleAddon, remove: removeLine,
    refresh: function () { return enqueue(function () { return sync(); }); },
    count: function () { return state.cart ? split(state.cart).count : 0; }
  };

  /* ---------- delegated events ---------- */
  document.addEventListener('click', function (e) {
    var tg = e.target;
    var ab = tg.closest && tg.closest('[data-add-to-cart]');
    if (ab) {
      e.preventDefault();
      if (ab.disabled || ab.classList.contains('is-loading')) return;
      var vid = ab.getAttribute('data-variant-id'), form = ab.closest('form');
      var keys = [ab.getAttribute('data-qty-for'), vid, ab.getAttribute('data-product-id')].filter(Boolean), qin = null;
      keys.some(function (k) { qin = document.querySelector('[data-qty-for="' + k + '"]'); return !!qin; });
      if (!qin && form) qin = form.querySelector('[name="quantity"]');
      var q = qin ? Math.max(1, parseInt(qin.value, 10) || 1) : (parseInt(ab.getAttribute('data-quantity'), 10) || 1);
      var props = {};
      try { if (ab.getAttribute('data-properties')) props = JSON.parse(ab.getAttribute('data-properties')); } catch (x) { props = {}; }
      if (form) $$('[name^="properties["]', form).forEach(function (f) { if (f.value && (f.type !== 'checkbox' || f.checked) && (f.type !== 'radio' || f.checked)) props[f.name.replace(/^properties\[|\]$/g, '')] = f.value; });
      var sel = ab.getAttribute('data-fly-from'), from = (sel && document.querySelector(sel)) || (ab.closest('.pc') && ab.closest('.pc').querySelector('.pc-media')) || (ab.hasAttribute('data-keep-open') && ab.closest('.ups-i') && $('img', ab.closest('.ups-i'))) || ab;
      ab.classList.add('is-loading'); ab.setAttribute('aria-busy', 'true');
      add([{ id: vid, quantity: q, properties: props }], { from: from, drawer: ab.hasAttribute('data-keep-open') || ab.hasAttribute('data-no-drawer') ? false : undefined })
        .then(function () { ab.classList.remove('is-loading'); ab.removeAttribute('aria-busy'); });
      return;
    }
    var line = tg.closest && tg.closest('[data-line]');
    if (line) {
      var key = line.getAttribute('data-key');
      if (tg.closest('[data-rm]')) { e.preventDefault(); removeLine(key); return; }
      var qb = tg.closest('[data-q]');
      if (qb) { e.preventDefault(); var inp = $('[data-qi]', line); setLineQty(line, (parseInt(inp.value, 10) || 1) + parseInt(qb.getAttribute('data-q'), 10)); return; }
      if (tg.closest('[data-later]')) {
        e.preventDefault();
        var l = later(); l.unshift({ vid: line.getAttribute('data-vid'), q: +line.getAttribute('data-qty') || 1, title: line.getAttribute('data-title'), vtitle: line.getAttribute('data-vtitle'), img: line.getAttribute('data-img'), url: line.getAttribute('data-url'), price: line.getAttribute('data-price') });
        H.LS.set('later', l.slice(0, 12));
        change(key, 0).then(function () { H.toast({ title: t('Saved for later', 'Disimpan untuk nanti', '保存しました'), sub: line.getAttribute('data-title') }); });
        return;
      }
    }
    var bk = tg.closest && tg.closest('[data-back]');
    if (bk) {
      var list = later(), item = list.splice(parseInt(bk.getAttribute('data-back'), 10), 1)[0];
      H.LS.set('later', list); renderLater();
      if (item) add([{ id: item.vid, quantity: item.q }], { drawer: false });
    }
  });
  function setLineQty(line, q) {
    var inp = $('[data-qi]', line), max = parseInt(inp.getAttribute('data-max'), 10);
    if (q <= 0) { removeLine(line.getAttribute('data-key')); return; }
    if (max && q > max) q = max;
    inp.value = q; change(line.getAttribute('data-key'), q);
  }
  document.addEventListener('change', function (e) {
    var tg = e.target, a = tg.closest && tg.closest('[data-addon]');
    if (a) { a.disabled = true; toggleAddon(a.getAttribute('data-addon'), a.checked).then(function () { a.disabled = false; }); return; }
    var qi = tg.closest && tg.closest('[data-qi]');
    if (qi) { setLineQty(qi.closest('[data-line]'), parseInt(qi.value, 10) || 1); return; }
    if (tg.matches && tg.matches('[data-cart-note]')) update({ note: tg.value });
  });

  /* ---------- init ---------- */
  H.ready(function () {
    fetchCart().then(function (cart) {
      state.cart = cart; updateHeader(cart);
      afterRender('drawer', $('#d-cart'), true);
      afterRender('page', $('[data-cart-page]'), true);
      loadDrawerUpsell(); loadPageRail();
      var tr = $('#xs'); if (tr && H.rail) H.rail(tr, $('#x-prev'), $('#x-next'));
    }).catch(function () {});
  });
  document.addEventListener('shopify:section:load', function (e) { if ($('[data-cart-page]', e.target)) { afterRender('page', e.target, true); } });
})();
