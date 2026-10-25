/* HPZ — product page (sections: main-product, product-details, product-bundle, product-recommendations)
   Loaded by each of those sections; guarded so it only runs once.
   Add to cart itself is handled by the global [data-add-to-cart] delegate in cart.js (qty comes from [name=quantity] / data-qty-for).
   Known tech debt: JS-built strings use HPZ.t(en, id, ja) instead of locale files. */
(function () {
  'use strict';
  if (window.__hpzProduct) return;
  window.__hpzProduct = true;

  var lastAdd = null, lbBound = false;

  function ready(fn) { if (window.HPZ) window.HPZ.ready(fn); else document.addEventListener('DOMContentLoaded', fn); }
  var q = function (s, r) { return (r || document).querySelector(s); };
  var qa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };

  ready(function () { initAll(document); });
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });

  function initAll(scope) {
    qa('[data-pdp]', scope).concat(scope.matches && scope.matches('[data-pdp]') ? [scope] : []).forEach(initPDP);
    qa('[data-subnav]', scope).forEach(initSubnav);
    qa('[data-bundle]', scope).forEach(initBundle);
    qa('[data-recs]', scope).forEach(initRecs);
    qa('[data-video]', scope).forEach(initVideo);
    qa('[data-cmp]', scope).forEach(function (c) {
      var inp = q('input', c); if (inp) inp.addEventListener('input', function () { c.style.setProperty('--x', inp.value + '%'); });
    });
    qa('[data-eta-min]', scope).forEach(localiseEta);
    if (window.HPZ) { HPZ.reveal(scope); }
  }

  /* ---------- delivery ETA in the visitor's locale ---------- */
  function localiseEta(el) {
    try {
      var f = new Intl.DateTimeFormat(HPZ.cfg.locale || undefined, { month: 'short', day: 'numeric' });
      el.textContent = f.format(new Date(+el.getAttribute('data-eta-min') * 1000)) + ' – ' + f.format(new Date(+el.getAttribute('data-eta-max') * 1000));
    } catch (e) { /* keep server text */ }
  }

  /* ---------- video poster -> iframe ---------- */
  function initVideo(box) {
    var src = box.getAttribute('data-video-src'); if (!src) return;
    var b = q('button.vid-b', box); if (!b) return;
    b.addEventListener('click', function () {
      box.classList.add('is-play');
      var f = document.createElement('iframe');
      f.src = src; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.title = 'Video';
      f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
      box.style.position = 'relative'; box.appendChild(f); b.remove();
    });
  }

  /* ---------- sub-navigation: prune, sort, number, scroll-spy ---------- */
  function initSubnav(nav) {
    if (nav.dataset.init) return; nav.dataset.init = '1';
    var wrap = q('.sn-tabs', nav);
    var links = qa('[data-sn]', nav).filter(function (a) {
      var ok = document.getElementById(a.getAttribute('data-sn')); if (!ok) a.remove(); return !!ok;
    });
    links.sort(function (a, b) {
      var ta = document.getElementById(a.getAttribute('data-sn')), tb = document.getElementById(b.getAttribute('data-sn'));
      return ta.compareDocumentPosition(tb) & 4 ? -1 : 1;
    }).forEach(function (a) { wrap.appendChild(a); });
    var n = 0;
    qa('.sec[id]').forEach(function (s) { var m = q('.sec-h .mono', s); if (m && !s.classList.contains('sec-dark')) m.textContent = pad2(++n); });
    if (!('IntersectionObserver' in window)) return;
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle('is-on', l.getAttribute('data-sn') === en.target.id); }); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (l) { so.observe(document.getElementById(l.getAttribute('data-sn'))); });
    links.forEach(function (l) {
      l.addEventListener('click', function (e) {
        var t = document.getElementById(l.getAttribute('data-sn')); if (!t) return;
        e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + t.id);
      });
    });
  }

  /* ---------- fitment check ---------- */
  function initFit(box) {
    var sel = q('[data-fitc-sel]', box), out = q('#fitc-out', box); if (!sel || !out) return;
    var H = window.HPZ, C = H.cfg.castings || [];
    var list = C.slice();
    if (!list.length) return;
    list.forEach(function (c) {
      var o = document.createElement('option'); o.value = c.handle; o.textContent = c.name + (c.maker ? ' · ' + c.maker : ''); sel.appendChild(o);
    });
    box.hidden = false;
    var prod = {
      dia: parseFloat(box.getAttribute('data-dia')) || null,
      madeFor: (box.getAttribute('data-made-for') || '').split(',').filter(Boolean),
      kind: box.getAttribute('data-kind') || ''
    };
    var esc = H.esc;
    var tile = function (cls, ic, h, d) { return '<div class="fitc-r ' + cls + '"><span class="fitc-ic">' + ic + '</span><div><b>' + h + '</b><span>' + d + '</span></div></div>'; };
    /* same rules as HPZ.fits, but ignores the "verified" gate so unverified castings can still show an estimate */
    function rawFit(c) {
      if (prod.madeFor.indexOf(c.handle) > -1) return 'made';
      if (prod.kind === 'wheels') { if (!prod.dia || !c.dia) return null; var d = Math.abs(prod.dia - c.dia); return d === 0 ? 'fit' : d <= 0.5 ? 'close' : 'no'; }
      if (prod.kind === 'decals' || prod.kind === 'bodykits' || prod.kind === 'engines') return prod.madeFor.length ? 'no' : null;
      return 'universal';
    }
    function estimate(c) {
      var t = H.t, f = rawFit(c), h = t('Estimated, not yet measured by the workshop', 'Perkiraan, belum diukur oleh workshop', '見積り値・工房での実測は未実施'), d;
      if (f === 'made') d = t('The title says this is made for ' + c.name + '. Check the arches before you buy.', 'Judul menyebut dibuat untuk ' + c.name + '. Cek arch sebelum beli.', 'タイトルでは ' + c.name + ' 用とされています。');
      else if (prod.kind === 'wheels' && prod.dia && c.dia) d = t('This wheel is Ø' + prod.dia + ' mm. ' + c.name + ' is estimated at Ø' + c.dia + ' mm. Check the arches before you buy.', 'Velg ini Ø' + prod.dia + ' mm. ' + c.name + ' diperkirakan Ø' + c.dia + ' mm. Cek arch sebelum beli.', 'このホイールは Ø' + prod.dia + ' mm。' + c.name + ' の推定は Ø' + c.dia + ' mm。');
      else if (f === 'no') d = t('This item looks cut for other castings. Check the product text before you buy.', 'Item ini tampaknya untuk casting lain. Baca deskripsi produk sebelum beli.', '他の車種用の可能性があります。');
      else d = t('No measured data for ' + c.name + ' yet. Check the product text before you buy.', 'Belum ada data terukur untuk ' + c.name + '. Baca deskripsi produk sebelum beli.', c.name + ' の実測データはまだありません。');
      return tile('warn', H.ICON.info, esc(h), esc(d));
    }
    function result(c) {
      if (c && !c.verified) return estimate(c);
      if (!c) return '<p class="fitc-hint">' + esc(H.t('Choose your casting to check fit before you buy.', 'Pilih casting untuk cek kecocokan sebelum beli.', '購入前に車種で適合確認。')) + '</p>';
      var f = H.fits(prod, c), isW = prod.kind === 'wheels', t = H.t;
      if (f === 'fit') return tile('ok', H.ICON.check, esc(t('Fits', 'Pas', '適合')) + ' ' + esc(c.name), esc(t('Diameter matches this casting (Ø' + prod.dia + ' mm).', 'Diameter sesuai casting ini (Ø' + prod.dia + ' mm).', '径が一致 (Ø' + prod.dia + ' mm)。')));
      if (f === 'made') return tile('ok', H.ICON.check, esc(t('Made for', 'Dibuat untuk', '専用')) + ' ' + esc(c.name), esc(t('Designed for this casting.', 'Dirancang untuk casting ini.', 'この車種用に設計。')));
      if (f === 'close') return tile('warn', H.ICON.info, esc(t('Close fit', 'Hampir pas', 'ほぼ適合')), esc(t('Within 0.5 mm of the recommended Ø' + c.dia + ' mm. Check the arches before you buy.', 'Selisih maks. 0,5 mm dari Ø' + c.dia + ' mm. Cek arch sebelum beli.', '推奨 Ø' + c.dia + ' mm との差0.5mm以内。')));
      if (f === 'universal') return tile('ok', H.ICON.check, esc(t('Universal part', 'Part universal', '汎用パーツ')), esc(t('Not cut for a single casting.', 'Tidak khusus satu casting.', '特定車種専用ではありません。')));
      if (f === 'no') {
        var link = isW && H.cfg.wheelsCollection ? ' <a class="link" href="' + esc((H.cfg.routes.root || '/').replace(/\/?$/, '/') + 'collections/' + H.cfg.wheelsCollection) + '">' + esc(t('See wheels', 'Lihat velg', 'ホイールを見る')) + '</a>' : '';
        return tile('no', H.ICON.close, esc(isW ? t('Not recommended', 'Tidak disarankan', '非推奨') : t('Made for a different casting', 'Untuk casting lain', '別車種用')), isW ? esc(t('Use Ø' + c.dia + ' mm for ' + c.name + '.', 'Gunakan Ø' + c.dia + ' mm untuk ' + c.name + '.', c.name + ' には Ø' + c.dia + ' mm を推奨。')) + link : esc(t('This item is cut for other castings.', 'Item ini untuk casting lain.', '他の車種用です。')));
      }
      return '<p class="fitc-hint">' + esc(t('No fitment data for this casting yet.', 'Belum ada data fitment untuk casting ini.', 'この車種の適合データはまだありません。')) + '</p>';
    }
    function draw(c, animate) {
      if (!animate) { out.innerHTML = result(c); return; }
      out.classList.add('is-swap'); setTimeout(function () { out.innerHTML = result(c); out.classList.remove('is-swap'); }, 160);
    }
    var cur = H.garage.current();
    if (cur && list.some(function (c) { return c.handle === cur.handle; })) { sel.value = cur.handle; draw(cur); }
    sel.addEventListener('change', function () {
      var c = C.filter(function (x) { return x.handle === sel.value; })[0] || null;
      draw(c, true); if (c) H.garage.set(c.handle);
    });
    H.on('garage', function () {
      var c = H.garage.current();
      if (c && sel.value !== c.handle && list.some(function (x) { return x.handle === c.handle; })) { sel.value = c.handle; draw(c, true); }
    });
  }

  /* ---------- main product ---------- */
  function initPDP(root) {
    if (!root || root.dataset.init) return; root.dataset.init = '1';
    var H = window.HPZ;
    var data = JSON.parse(q('[data-pdp-json]', root).textContent || '[]');
    var secId = root.getAttribute('data-section-id'), url = root.getAttribute('data-product-url');
    var form0 = q('[name="id"]', root);
    var curId = form0 ? +form0.value : (data[0] && data[0].id);
    var qty = 1, token = 0;
    var gal = q('[data-gal]', root), thumbs = qa('[data-gi]', root), img = q('[data-gal-img]', root), zoom = q('[data-gal-zoom]', root), counter = q('[data-gal-n]', root);
    var idx = gal ? (+gal.getAttribute('data-index') || 0) : 0;
    var variantById = function (id) { return data.filter(function (v) { return +v.id === +id; })[0]; };

    /* gallery */
    function setImg(i) {
      if (!thumbs.length || !img) return;
      idx = (i + thumbs.length) % thumbs.length;
      var t = thumbs[idx];
      img.classList.add('is-swap');
      setTimeout(function () {
        img.removeAttribute('srcset'); img.onload = function () { img.classList.remove('is-swap'); };
        img.src = t.getAttribute('data-main'); img.alt = t.getAttribute('data-alt') || '';
        setTimeout(function () { img.classList.remove('is-swap'); }, 700);
      }, 120);
      thumbs.forEach(function (b, k) { b.classList.toggle('is-on', k === idx); });
      if (counter) counter.textContent = pad2(idx + 1) + ' / ' + pad2(thumbs.length);
    }
    if (zoom) {
      zoom.addEventListener('mousemove', function (e) {
        var rc = zoom.getBoundingClientRect();
        img.style.transformOrigin = ((e.clientX - rc.left) / rc.width * 100) + '% ' + ((e.clientY - rc.top) / rc.height * 100) + '%';
        zoom.classList.add('is-z');
      });
      zoom.addEventListener('mouseleave', function () { zoom.classList.remove('is-z'); });
      zoom.addEventListener('click', openLB);
      var sx = null;
      zoom.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      zoom.addEventListener('touchend', function (e) {
        if (sx == null) return; var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) setImg(idx + (dx < 0 ? 1 : -1)); sx = null;
      });
    }

    /* lightbox */
    var lb = q('#lb', root), li = 0;
    function lbDraw() {
      var t = thumbs[li]; if (!t) return;
      var im = q('#lb-img', lb); im.style.opacity = 0;
      setTimeout(function () { im.onload = function () { im.style.opacity = 1; }; im.src = t.getAttribute('data-full'); im.alt = t.getAttribute('data-alt') || ''; setTimeout(function () { im.style.opacity = 1; }, 600); }, 120);
      qa('[data-li]', lb).forEach(function (x, i) { x.classList.toggle('is-on', i === li); });
      q('.lb-c', lb).textContent = (t.getAttribute('data-alt') || '') + ' — ' + (li + 1) + '/' + thumbs.length;
    }
    function lbGo(d) { li = (li + d + thumbs.length) % thumbs.length; lbDraw(); }
    function closeLB() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('is-locked'); }
    function openLB() {
      if (!thumbs.length || !lb) return; li = idx;
      lb.innerHTML = '<button class="lb-x" aria-label="Close">' + H.ICON.close + '</button>' +
        (thumbs.length > 1 ? '<button class="lb-ar lb-p" aria-label="Previous">' + H.ICON.left + '</button>' : '') +
        '<figure class="lb-f"><img id="lb-img" src="' + H.esc(thumbs[li].getAttribute('data-full')) + '" alt=""></figure>' +
        (thumbs.length > 1 ? '<button class="lb-ar lb-n" aria-label="Next">' + H.ICON.right + '</button>' : '') +
        '<div class="lb-th">' + thumbs.map(function (t, i) { return '<button data-li="' + i + '" class="' + (i === li ? 'is-on' : '') + '"><img src="' + H.esc(t.querySelector('img').src) + '" alt=""></button>'; }).join('') + '</div><span class="lb-c mono"></span>';
      q('.lb-c', lb).textContent = (thumbs[li].getAttribute('data-alt') || '') + ' — ' + (li + 1) + '/' + thumbs.length;
      lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('is-locked');
      lb.onclick = function (e) {
        var li2 = e.target.closest('[data-li]');
        if (e.target.closest('.lb-x') || e.target === lb) closeLB();
        else if (e.target.closest('.lb-p')) lbGo(-1);
        else if (e.target.closest('.lb-n')) lbGo(1);
        else if (li2) { li = +li2.getAttribute('data-li'); lbDraw(); }
      };
      lbKeys = { go: lbGo, close: closeLB, el: lb };
    }
    if (!lbBound) {
      lbBound = true;
      document.addEventListener('keydown', function (e) {
        if (!lbKeys || !lbKeys.el.classList.contains('is-open')) return;
        if (e.key === 'ArrowRight') lbKeys.go(1); if (e.key === 'ArrowLeft') lbKeys.go(-1); if (e.key === 'Escape') lbKeys.close();
      });
    }

    /* qty + price in the add button */
    function syncQty() {
      var inp = q('[data-qty]', root); if (!inp) return;
      inp.value = qty;
      var btn = q('[data-add-price]', root), add = q('[data-unit-price]', root);
      if (btn && add && qty > 1) btn.textContent = H.money(+add.getAttribute('data-unit-price') * qty);
    }

    /* variant switching via the Section Rendering API */
    function pickOption(btn) {
      var cur = variantById(curId); if (!cur) return;
      var i = +btn.getAttribute('data-opt-index'), val = btn.getAttribute('data-opt-value');
      var opts = cur.options.slice(); opts[i] = val;
      var v = data.filter(function (x) { return x.options.join('\u0001') === opts.join('\u0001'); })[0] ||
        data.filter(function (x) { return x.options[i] === val && x.available; })[0] ||
        data.filter(function (x) { return x.options[i] === val; })[0];
      if (v && +v.id !== +curId) selectVariant(v.id);
    }
    function selectVariant(id) {
      curId = +id; var tk = ++token, v = variantById(id);
      root.classList.add('is-busy');
      var u = url + (url.indexOf('?') > -1 ? '&' : '?') + 'variant=' + id + '&section_id=' + secId;
      fetch(u, { credentials: 'same-origin' }).then(function (r) { if (r.ok) return r; /* one retry: the section API can 404 for a moment while a theme is being re-uploaded */ return new Promise(function (ok) { setTimeout(ok, 900); }).then(function () { return fetch(u, { credentials: 'same-origin' }); }); }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (html) {
        if (tk !== token) return;
        var doc = new DOMParser().parseFromString(html, 'text/html');
        qa('[data-dyn]', root).forEach(function (el) {
          var n = doc.querySelector('[data-dyn="' + el.getAttribute('data-dyn') + '"]'); if (n) el.innerHTML = n.innerHTML;
        });
        syncQty();
        if (window.Shopify && Shopify.PaymentButton && Shopify.PaymentButton.init) Shopify.PaymentButton.init();
        var priceEl = doc.querySelector('.bb-price .pr b') || doc.querySelector('.pr b');
        var priceTxt = priceEl ? priceEl.textContent : (v ? H.money(v.price) : '');
        qa('[data-sn-price]').forEach(function (el) { el.textContent = priceTxt; });
        history.replaceState(null, '', url + '?variant=' + id);
        if (v && v.featured_media) {
          var k = thumbs.map(function (t) { return +t.getAttribute('data-media-id'); }).indexOf(+v.featured_media.id);
          if (k > -1) setImg(k);
        }
        H.emit('pdp-variant', { id: +id, available: v ? !!v.available : false, priceText: priceTxt, priceCents: v ? v.price : 0, image: v && v.featured_image ? v.featured_image.src : null });
      }).catch(function (err) { if (window.console) console.error('[hpz] variant switch failed', err); window.location.href = url + '?variant=' + id; })
        .then(function () { if (tk === token) root.classList.remove('is-busy'); });
    }

    root.addEventListener('click', function (e) {
      var tg = e.target, el;
      if ((el = tg.closest('[data-gi]'))) { setImg(+el.getAttribute('data-gi')); return; }
      if ((el = tg.closest('[data-gstep]'))) { setImg(idx + +el.getAttribute('data-gstep')); return; }
      if (tg.closest('[data-lb]')) { openLB(); return; }
      if ((el = tg.closest('[data-opt-value]'))) { pickOption(el); return; }
      if ((el = tg.closest('[data-qs]'))) { qty = Math.max(1, Math.min(99, qty + +el.getAttribute('data-qs'))); syncQty(); return; }
      if ((el = tg.closest('[data-add-to-cart]'))) { lastAdd = el; setTimeout(function () { if (lastAdd === el) lastAdd = null; }, 8000); }
    });
    root.addEventListener('change', function (e) {
      if (e.target.matches('[data-qty]')) { qty = Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1)); syncQty(); }
    });
    root.addEventListener('submit', function (e) { if (e.target.matches('[data-pdp-form]')) e.preventDefault(); });

    /* "Added" flash once cart.js reports success */
    H.on('cart', function () {
      var b = lastAdd; lastAdd = null; if (!b || !document.body.contains(b)) return;
      var lab = q('[data-add-label]', b), old = lab ? lab.textContent : '';
      b.classList.add('is-done'); if (lab) lab.textContent = H.t('Added', 'Ditambahkan', '追加しました');
      setTimeout(function () { b.classList.remove('is-done'); if (lab) lab.textContent = old; }, 1800);
    });

    /* sticky bar (small screens, CSS) + subnav buy button (desktop) */
    var anchor = q('[data-buy-anchor]', root), sb = q('.sbar', root), sn = q('[data-subnav]');
    if (anchor && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var en = es[0], past = !en.isIntersecting && en.boundingClientRect.top < 0;
        if (sb) sb.classList.toggle('is-on', past); if (sn) sn.classList.toggle('is-buy', past);
      }).observe(anchor);
    }

    qa('[data-fitc]', root).forEach(initFit);
    setTimeout(function () { H.tagFit(root); }, 0);
  }
  var lbKeys = null;

  /* ---------- bundle ---------- */
  function initBundle(box) {
    if (box.dataset.init) return; box.dataset.init = '1';
    var H = window.HPZ, sum = q('[data-bnd-sum]', box), pct = +box.getAttribute('data-discount') || 0, mainOk = true;
    var items = qa('[data-bnd]', box);
    function draw() {
      var on = items.filter(function (i) { return i.checked && !(i.hasAttribute('data-bnd-main') && !mainOk); });
      var total = on.reduce(function (s, i) { return s + (+i.getAttribute('data-price') || 0); }, 0);
      var disc = pct > 0 && on.length > 1 ? Math.round(total * pct / 100) : 0;
      var lab = sum.getAttribute('data-label-add').replace('__N__', on.length);
      sum.innerHTML = '<span class="xs muted">' + on.length + ' ' + H.esc(sum.getAttribute('data-label-items')) + '</span>' +
        '<div class="bnd-p">' + (disc ? '<s class="mono">' + H.money(total) + '</s>' : '') + '<b class="mono">' + H.money(total - disc) + '</b></div>' +
        (disc ? '<span class="bnd-save">' + H.esc(sum.getAttribute('data-label-save')) + ' ' + H.money(disc) + '</span>' : '') +
        '<button type="button" class="btn btn-signal btn-block" data-bnd-add' + (on.length ? '' : ' disabled') + '>' + H.esc(lab) + '<span class="spin"></span></button>';
    }
    box.addEventListener('change', function (e) {
      if (e.target.matches('[data-bnd]')) { e.target.closest('.bnd-i').classList.toggle('is-off', !e.target.checked); draw(); }
    });
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-bnd-add]'); if (!b || b.classList.contains('is-loading')) return;
      var ids = items.filter(function (i) { return i.checked && !(i.hasAttribute('data-bnd-main') && !mainOk); }).map(function (i) { return +i.getAttribute('data-variant-id'); });
      if (!ids.length) return;
      b.classList.add('is-loading');
      var p = ids.length > 1 ? H.cart.addBundle(ids, { bundleId: 'b' + Date.now().toString(36), from: b }) : H.cart.add([{ id: ids[0], quantity: 1 }], { from: b });
      Promise.resolve(p).then(function () { b.classList.remove('is-loading'); });
    });
    H.on('pdp-variant', function (e) {
      var d = e.detail, m = q('[data-bnd-main]', box); if (!m) return;
      m.setAttribute('data-variant-id', d.id); m.setAttribute('data-price', d.priceCents);
      var pe = q('[data-bnd-main-price]', box); if (pe && d.priceText) pe.textContent = d.priceText;
      mainOk = d.available; draw();
    });
    draw();
  }

  /* ---------- recommendations ---------- */
  function initRecs(el) {
    if (el.dataset.init) return; el.dataset.init = '1';
    var H = window.HPZ;
    function wire() {
      var rail = q('[data-rc-rail]', el);
      if (rail) { H.rail(rail, q('[data-rc-prev]', el), q('[data-rc-next]', el)); H.tagFit(el); H.reveal(el); }
    }
    if (!el.hidden && q('[data-rc-rail]', el)) { wire(); if (!el.hasAttribute('data-fallback')) return; }
    function load() {
      fetch(el.getAttribute('data-url'), { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
        if (!html) return;
        var n = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-recs]');
        if (n && q('[data-rc-rail]', n)) { el.innerHTML = n.innerHTML; el.removeAttribute('data-fallback'); el.hidden = false; wire(); }
      }).catch(function () { /* section stays hidden */ });
    }
    if ('IntersectionObserver' in window) {
      /* a hidden element never intersects, so observe a 1px probe placed before it */
      var probe = document.createElement('div'); probe.style.height = '1px'; el.parentNode.insertBefore(probe, el);
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); probe.remove(); load(); } }, { rootMargin: '600px 0px' });
      io.observe(probe);
    } else load();
  }
})();
