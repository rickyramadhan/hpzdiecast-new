/* HPZ theme core — window.HPZ
   Loaded by layout/theme.liquid (defer). Contract: docs/THEME-CONTRACT.md
   Events are dispatched on document as "hpz:<name>" (cart, garage, market, wish, open, close). */
(function () {
  'use strict';

  var RAW = window.HPZ_RAW || {};
  var S = RAW.settings || {};
  var CASTINGS = (window.HPZ_CASTINGS || []).filter(Boolean);

  /* ---------- utils ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem('hpz.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('hpz.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  var debounce = function (fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 160); }; };
  var emit = function (n, d) { document.dispatchEvent(new CustomEvent('hpz:' + n, { detail: d })); };
  var on = function (n, fn) { document.addEventListener('hpz:' + n, fn); };
  var ready = function (fn) { if (document.readyState !== 'loading') setTimeout(fn, 0); else document.addEventListener('DOMContentLoaded', fn); };
  var lang = (RAW.locale || 'en');
  var t = function (en, id) { return (lang === 'id' && id) ? id : en; };

  /* money: Shopify gives cents. Use the store's money format, converted client-side when the market differs. */
  var money = function (cents) {
    // Cents are already in the presentment currency (cart.js, product .js, Liquid). Format only, never convert.
    var cur = (window.Shopify && Shopify.currency && Shopify.currency.active) || RAW.currency || 'USD';
    var v = cents / 100;
    try { return new Intl.NumberFormat(RAW.locale || 'en', { style: 'currency', currency: cur, maximumFractionDigits: cur === 'IDR' || cur === 'JPY' ? 0 : 2 }).format(v); }
    catch (e) { return cur + ' ' + v.toFixed(2); }
  };

  /* Shopify's own money strings are authoritative in Liquid; this is only for JS-built prices. */
  var freeShipCents = function () { return (S.freeShipUsd || 0) * 100 * ((window.Shopify && Shopify.currency && +Shopify.currency.rate) || 1); };

  /* ---------- icons (match snippets/icon.liquid) ---------- */
  var I = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var ICON = {
    search: I('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    cart: I('<path d="M3 4h2.2l2.1 10.6a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.1"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>'),
    heart: I('<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>'),
    close: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    minus: I('<path d="M5 12h14"/>'),
    check: I('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    arrow: I('<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>'),
    arrowUR: I('<path d="M7 17 17 7"/><path d="M8 7h9v9"/>'),
    left: I('<path d="m15 6-6 6 6 6"/>'),
    right: I('<path d="m9 6 6 6-6 6"/>'),
    down: I('<path d="m6 9 6 6 6-6"/>'),
    bell: I('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15L6 16.5Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
    info: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/>'),
    car: I('<path d="M3.5 15.5v-3l2-4.5a2 2 0 0 1 1.8-1.2h9.4a2 2 0 0 1 1.8 1.2l2 4.5v3"/><path d="M2.5 15.5h19v2h-19z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    ruler: I('<path d="M3.5 15.5 15.5 3.5l5 5-12 12-5-5Z"/><path d="m7 12 2 2M10 9l1.5 1.5M13 6l2 2"/>'),
    box: I('<path d="m3.5 7.5 8.5-4 8.5 4v9l-8.5 4-8.5-4v-9Z"/><path d="m3.5 7.5 8.5 4 8.5-4M12 11.5v9"/>'),
    lock: I('<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
    truck: I('<path d="M2.5 6.5h11v9h-11z"/><path d="M13.5 9.5h4l3 3.2v2.8h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5Z"/></svg>',
    tick: '<svg class="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    wa: "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.04c-.24.69-1.42 1.32-1.96 1.37-.5.05-.97.24-3.27-.68-2.77-1.09-4.52-3.93-4.66-4.11-.13-.18-1.11-1.48-1.11-2.83 0-1.35.71-2.01.96-2.29.25-.27.55-.34.73-.34h.52c.17 0 .4-.06.62.47.24.55.8 1.92.87 2.06.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.11.6-.07.17-.18.69-.81.88-1.09.18-.28.37-.23.62-.14.25.09 1.6.76 1.87.9.28.14.46.2.53.32.07.11.07.66-.17 1.35Z\"/></svg>",
  };
  var icon = function (name) { return ICON[name] || ''; };

  /* ---------- fitment & garage ---------- */
  var castingByHandle = function (h) { return CASTINGS.filter(function (c) { return c.handle === h; })[0] || null; };
  var garage = {
    current: function () { var h = LS.get('garage', [])[0]; return h ? castingByHandle(h) : null; },
    list: function () { return LS.get('garage', []).map(castingByHandle).filter(Boolean); },
    set: function (handle) {
      var g = LS.get('garage', []).filter(function (h) { return h !== handle; });
      g.unshift(handle); LS.set('garage', g.slice(0, 4)); emit('garage', handle);
    },
    clear: function () { LS.set('garage', []); emit('garage', null); }
  };
  /* fits({dia, madeFor:[handles], kind}, casting) -> 'fit' | 'close' | 'made' | 'universal' | 'no' | null
     Tags are only meaningful for verified castings (settings.fitment_requires_verified). */
  var fits = function (p, c) {
    if (!c) return null;
    if (S.requireVerified && !c.verified) return null;
    if (p.madeFor && p.madeFor.indexOf(c.handle) > -1) return 'made';
    if (p.kind === 'wheels') {
      if (!p.dia) return null;
      var d = Math.abs(p.dia - c.dia);
      return d === 0 ? 'fit' : d <= 0.5 ? 'close' : 'no';
    }
    if (p.kind === 'decals' || p.kind === 'bodykits' || p.kind === 'engines') return p.madeFor && p.madeFor.length ? 'no' : null;
    return 'universal';
  };
  var fitTagHTML = function (res, c) {
    if (!res || !c) return '';
    if (res === 'fit') return '<span class="fit fit-ok">' + ICON.check + esc(t('Fits your', 'Pas untuk', '適合')) + ' ' + esc(c.name) + '</span>';
    if (res === 'made') return '<span class="fit fit-ok">' + ICON.check + esc(t('Made for', 'Dibuat untuk', '専用')) + ' ' + esc(c.name) + '</span>';
    if (res === 'close') return '<span class="fit fit-close">' + esc(t('Check fit', 'Cek ukuran', '要確認')) + ' · ' + esc(c.name) + '</span>';
    return '';
  };
  /* Fill [data-fit-slot] inside a freshly rendered root (product cards, rails). */
  var tagFit = function (root) {
    var c = garage.current(); if (!c) return;
    $$('[data-fit-slot]', root || document).forEach(function (slot) {
      var host = slot.closest('[data-dia],[data-made-for],[data-kind]') || slot;
      var p = {
        dia: parseFloat(host.getAttribute('data-dia')) || null,
        madeFor: (host.getAttribute('data-made-for') || '').split(',').filter(Boolean),
        kind: host.getAttribute('data-kind') || ''
      };
      slot.innerHTML = fitTagHTML(fits(p, c), c);
    });
  };

  /* ---------- wheel + silhouette SVG (ported from the mockup) ---------- */
  var FIN = {
    gold: ['#e7c776', '#a57e2c'], silver: ['#eef0f3', '#9aa0a8'], gunmet: ['#6c727a', '#2c3035'], bronze: ['#b38a52', '#5f4422'],
    chrome: ['#ffffff', '#7c838c'], white: ['#ffffff', '#cfd2d6'], black: ['#3a3d42', '#0f1012'], tosca: ['#4fd6c8', '#0f7f74'],
    blue: ['#5d86f0', '#1a3a9a'], red: ['#f05252', '#8f1418'], pink: ['#ff8cc0', '#b0306b']
  };
  var wid = 0;
  var wheelSVG = function (o) {
    o = o || {};
    var n = o.spokes || 6, style = o.style || 'spoke', f = FIN[o.finish] || FIN.silver, id = 'w' + (++wid);
    var lip = o.lip == null ? 1 : o.lip, face = '', i;
    if (style === 'mesh') {
      for (i = 0; i < n; i++) face += '<g transform="rotate(' + (i * 360 / n) + ' 50 50)"><path d="M50 50 L46 21 Q50 19 54 21 Z" fill="url(#' + id + 'f)" stroke="rgba(0,0,0,.35)" stroke-width=".4"/></g>';
    } else if (style === 'disc') {
      face = '<circle cx="50" cy="50" r="29" fill="url(#' + id + 'f)"/>';
    } else {
      for (i = 0; i < n; i++) face += '<g transform="rotate(' + (i * 360 / n) + ' 50 50)"><path d="M45.6 47 L47.2 21.5 Q50 20.4 52.8 21.5 L54.4 47 Z" fill="url(#' + id + 'f)" stroke="rgba(0,0,0,.3)" stroke-width=".4"/></g>';
    }
    var ticks = '';
    for (i = 0; i < 36; i++) ticks += '<path transform="rotate(' + (i * 10) + ' 50 50)" d="M50 2.2 L50 5.4" stroke="#262a2e" stroke-width="2.2"/>';
    return '<svg class="wsvg" viewBox="0 0 100 100" aria-hidden="true"><defs>' +
      '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + f[0] + '"/><stop offset="1" stop-color="' + f[1] + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'b" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#0b0c0d"/><stop offset="1" stop-color="#25282c"/></radialGradient></defs>' +
      '<circle cx="50" cy="50" r="49" fill="#141517"/>' + ticks +
      '<circle cx="50" cy="50" r="' + (lip ? 37 : 35) + '" fill="url(#' + id + 'b)"/>' +
      (o.disc ? '<circle cx="50" cy="50" r="27" fill="#7a8087"/><circle cx="50" cy="50" r="27" fill="none" stroke="#5b6168" stroke-width="2.5" stroke-dasharray=".6 2.2"/><circle cx="50" cy="50" r="17" fill="#3b3f45"/>' : '') +
      '<circle cx="50" cy="50" r="33" fill="none" stroke="url(#' + id + 'f)" stroke-width="2"/>' +
      '<g>' + face + '</g>' +
      '<circle cx="50" cy="50" r="9.5" fill="url(#' + id + 'f)" stroke="rgba(0,0,0,.35)" stroke-width=".5"/>' +
      '<circle cx="50" cy="50" r="3.2" fill="#16181b"/><circle cx="50" cy="50" r="1.4" fill="' + (o.cap || '#e5306b') + '"/></svg>';
  };
  var SIL = {
    coupe: 'M14 50 L16 40 Q24 36 46 34 L70 22 Q92 16 120 18 L146 30 Q176 33 186 40 L188 50 Z',
    hatch: 'M14 50 L15 38 Q20 34 40 32 L62 18 Q90 14 150 17 L168 32 Q182 35 186 42 L188 50 Z',
    sedan: 'M12 50 L14 40 Q22 35 44 33 L68 21 Q96 17 126 19 L148 31 Q178 33 188 40 L190 50 Z',
    truck: 'M10 50 L11 34 Q14 30 30 30 L52 30 L58 14 L96 14 L102 30 L190 30 L191 50 Z'
  };
  var silhouette = function (body) {
    var p = SIL[body] || SIL.coupe;
    return '<svg viewBox="0 0 200 70" aria-hidden="true"><path d="' + p + '" fill="currentColor"/><circle cx="48" cy="52" r="10" fill="currentColor" stroke="var(--sil-bg,#fff)" stroke-width="2.5"/><circle cx="152" cy="52" r="10" fill="currentColor" stroke="var(--sil-bg,#fff)" stroke-width="2.5"/></svg>';
  };

  /* ---------- UI: open/close overlays ---------- */
  var openEl = null;
  var closeAll = function () {
    $$('.drawer.is-open, .modal.is-open, .search.is-open').forEach(function (e) { e.classList.remove('is-open'); });
    var s = $('.scrim'); if (s) s.classList.remove('is-on');
    document.body.classList.remove('is-locked'); openEl = null; emit('close');
  };
  var lock = function (el, scrim) {
    closeAll(); el.classList.add('is-open'); openEl = el;
    if (scrim !== false) { var s = $('.scrim'); if (s) s.classList.add('is-on'); }
    document.body.classList.add('is-locked');
  };
  var open = function (name) {
    var map = { cart: '#d-cart', wish: '#d-wish', menu: '#d-menu', search: '#search', market: '#m-market', garage: '#m-garage' };
    var el = $(map[name] || ('#' + name));
    if (!el) return;
    if (name === 'garage') emit('open', 'garage');
    lock(el, name !== 'search');
    emit('open', name);
    return el;
  };

  /* ---------- toast ---------- */
  var toast = function (o) {
    var host = $('#toasts'); if (!host) return;
    var el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = (o.img ? '<img src="' + esc(o.img) + '" alt="">' : '<span class="toast-ic">' + (o.icon || ICON.check) + '</span>') +
      '<div><b>' + esc(o.title) + '</b>' + (o.sub ? '<span>' + esc(o.sub) + '</span>' : '') + '</div>' +
      (o.action ? '<button class="toast-act">' + esc(o.action) + '</button>' : '') +
      '<button class="toast-x" aria-label="Close">' + ICON.close + '</button><i class="toast-bar"></i>';
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('is-in'); });
    var kill = function () { el.classList.remove('is-in'); el.classList.add('is-out'); setTimeout(function () { el.remove(); }, 400); };
    var tm = setTimeout(kill, o.ms || 4200);
    el.querySelector('.toast-x').onclick = function () { clearTimeout(tm); kill(); };
    var a = el.querySelector('.toast-act');
    if (a) a.onclick = function () { clearTimeout(tm); kill(); if (o.onAction) o.onAction(); };
  };

  /* ---------- reveal / count / acc / tabs / rail ---------- */
  var io = null;
  var reveal = function (root) {
    if (!('IntersectionObserver' in window)) return;
    if (!io) io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    $$('[data-reveal]:not(.is-in)', root || document).forEach(function (el) { io.observe(el); });
  };
  var countUp = function (el, to, o) {
    o = o || {}; var from = o.from || 0, dur = o.dur || 1100, dp = o.dp || 0, t0 = performance.now();
    var f = o.fmt || function (v) { return v.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }); };
    if (document.documentElement.classList.contains('static')) { el.textContent = f(to); return; }
    var step = function (now) { var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = f(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  var countOnView = function (root) {
    if (!('IntersectionObserver' in window)) return;
    var ob = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var el = e.target; countUp(el, parseFloat(el.getAttribute('data-count')), { dp: +(el.getAttribute('data-dp') || 0) }); ob.unobserve(el); } }); }, { threshold: 0.4 });
    $$('[data-count]', root || document).forEach(function (el) { ob.observe(el); });
  };
  var acc = function (root) {
    $$('[data-acc]', root || document).forEach(function (a) {
      if (a.dataset.accOn) return; a.dataset.accOn = '1';
      var btn = a.querySelector('.acc-h'), body = a.querySelector('.acc-b');
      if (!btn || !body) return;
      if (a.classList.contains('is-open')) body.style.height = 'auto';
      btn.addEventListener('click', function () {
        var isOpen = a.classList.toggle('is-open'); btn.setAttribute('aria-expanded', isOpen);
        body.style.height = body.scrollHeight + 'px';
        if (!isOpen) requestAnimationFrame(function () { body.style.height = '0px'; });
        else body.addEventListener('transitionend', function te() { if (a.classList.contains('is-open')) body.style.height = 'auto'; body.removeEventListener('transitionend', te); });
      });
    });
  };
  var tabs = function (el, fn) {
    if (!el) return;
    var ink = document.createElement('i'); ink.className = 'tabs-ink'; el.appendChild(ink);
    var move = function (b) { if (!b) return; ink.style.width = b.offsetWidth + 'px'; ink.style.transform = 'translateX(' + b.offsetLeft + 'px)'; };
    var btns = $$('button', el);
    btns.forEach(function (b) { b.addEventListener('click', function () { btns.forEach(function (x) { x.classList.toggle('is-on', x === b); }); move(b); if (fn) fn(b.dataset.tab, b); }); });
    var cur = btns.filter(function (b) { return b.classList.contains('is-on'); })[0] || btns[0];
    if (cur) cur.classList.add('is-on');
    requestAnimationFrame(function () { move(cur); });
    window.addEventListener('resize', function () { move(el.querySelector('.is-on')); });
  };
  var rail = function (track, prev, next) {
    if (!track) return;
    var go = function (d) { track.scrollBy({ left: d * track.clientWidth * 0.8, behavior: 'smooth' }); };
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    var upd = debounce(function () {
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    }, 50);
    track.addEventListener('scroll', upd); upd();
  };
  var stars = function (r) { var full = Math.round(r); var s = ''; for (var i = 0; i < 5; i++) s += '<i class="' + (i < full ? 'on' : '') + '">' + ICON.star + '</i>'; return '<span class="stars" aria-label="' + r + ' / 5">' + s + '</span>'; };

  /* ---------- wishlist (localStorage handles) ---------- */
  var wish = {
    list: function () { return LS.get('wish', []); },
    has: function (h) { return wish.list().indexOf(h) > -1; },
    toggle: function (h) {
      var l = wish.list(), i = l.indexOf(h);
      if (i > -1) l.splice(i, 1); else l.unshift(h);
      LS.set('wish', l.slice(0, 200));
      $$('[data-wish="' + h + '"]').forEach(function (b) { b.classList.toggle('is-on', i < 0); });
      emit('wish', l);
      return i < 0;
    }
  };

  /* ---------- garage bar + wishlist drawer rendering ---------- */
  function renderGarage() {
    var el = document.getElementById('gbar'); if (!el) return;
    var c = garage.current();
    el.innerHTML = c
      ? '<div class="gb-l">' + ICON.car + '<span class="gb-k">' + esc(t('My garage', 'Garasi saya', 'マイガレージ')) + '</span>' +
        '<button class="gb-cast" data-open="garage"><b>' + esc(c.name) + '</b><span>' + esc(c.maker) + ' · Ø' + esc(c.dia) + ' mm</span>' + ICON.down + '</button></div>'
      : '<div class="gb-l">' + ICON.car + '<span class="gb-k">' + esc(t('What are you building?', 'Lagi bangun apa?', '何を作っていますか？')) + '</span>' +
        '<button class="gb-add" data-open="garage">' + ICON.plus + esc(t('Add your casting', 'Tambah casting', '車種を追加')) + '</button></div>';
  }
  function renderWish() {
    var ul = document.getElementById('wish-list'), empty = document.getElementById('wish-empty'), n = document.getElementById('wish-n');
    if (!ul) return;
    var list = wish.list();
    if (n) n.textContent = list.length ? '(' + list.length + ')' : '';
    if (!list.length) { ul.innerHTML = ''; if (empty) empty.hidden = false; return; }
    if (empty) empty.hidden = true;
    Promise.all(list.map(function (h) { return fetch('/products/' + h + '.js').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }))
      .then(function (items) {
        ul.innerHTML = items.filter(Boolean).map(function (p) {
          var v = p.variants.filter(function (x) { return x.available; })[0];
          var img = p.featured_image ? p.featured_image : '';
          return '<li><a href="' + esc(p.url) + '"><img src="' + esc(img) + '" alt=""></a><div>' +
            '<span class="cl-brand">' + esc(p.vendor) + '</span><a class="cl-t" href="' + esc(p.url) + '">' + esc(p.title) + '</a>' +
            '<span class="mono">' + money(v ? v.price : p.price) + '</span>' +
            '<div class="wl-a">' + (v ? '<button class="btn btn-sm btn-ink" data-add-to-cart data-variant-id="' + v.id + '">' + esc(t('Add to cart', 'Tambah', '追加')) + '</button>'
              : '<button class="btn btn-sm btn-ghost" data-notify="' + esc(p.handle) + '" data-notify-title="' + esc(p.title) + '">' + ICON.bell + esc(t('Notify', 'Kabari', '通知')) + '</button>') +
            '<button class="link xs" data-wish="' + esc(p.handle) + '">' + esc(t('Remove', 'Hapus', '削除')) + '</button></div></div></li>';
        }).join('');
      });
  }
  on('garage', renderGarage);
  on('wish', renderWish);
  document.addEventListener('hpz:open', function (e) { if (e.detail === 'wish') renderWish(); });

  /* ---------- global delegation ---------- */
  document.addEventListener('click', function (e) {
    var tg = e.target;
    var op = tg.closest('[data-open]');
    if (op) { e.preventDefault(); open(op.getAttribute('data-open')); return; }
    if (tg.closest('[data-close]') || tg.classList.contains('modal')) { closeAll(); return; }
    var w = tg.closest('[data-wish]');
    if (w) { e.preventDefault(); wish.toggle(w.getAttribute('data-wish')); return; }
    var n = tg.closest('[data-notify]');
    if (n) {
      e.preventDefault();
      var title = document.getElementById('notify-title'), body = document.getElementById('notify-body');
      if (title) title.textContent = n.getAttribute('data-notify-title') || '';
      if (body) body.value = n.getAttribute('data-notify') || '';
      lock($('#m-notify')); return;
    }
    var q = tg.closest('[data-quick]');
    if (q && window.HPZ && HPZ.quickView) { e.preventDefault(); HPZ.quickView(q.getAttribute('data-quick')); return; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      var s = $('#search'); if (s) { e.preventDefault(); open('search'); var i = $('input', s); if (i) setTimeout(function () { i.focus(); }, 60); }
    }
  });

  /* Shopify theme editor: re-init section JS after edits */
  document.addEventListener('shopify:section:load', function (e) { reveal(e.target); countOnView(e.target); acc(e.target); tagFit(e.target); emit('section', e.target); });

  // split a headline into per-line masks (.split-line > span) for the rise animation
  var splitLines = function (el) {
    if (!el || el.dataset.splitDone) return; el.dataset.splitDone = '1';
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(function (l, i) { return '<span class="split-line" style="--i:' + i + '"><span>' + l + '</span></span>'; }).join('');
  };
  // side windows for the car silhouette (drawn over SIL in fitment visuals)
  var SILW = {
    coupe: 'M74 23.5 Q94 18.6 118 20 L140 30.5 L68 31.5 Z',
    hatch: 'M65 20.5 Q90 16.6 146 19 L159 31 L59 31.5 Z',
    sedan: 'M71 22.5 Q96 19 124 21 L144 31.5 L65 32.5 Z',
    truck: 'M60 16.5 L94 16.5 L99 29 L55 29 Z'
  };

  window.HPZ = {
    splitLines: splitLines, SILW: SILW,
    cfg: { locale: lang, market: RAW.market, currency: RAW.currency, routes: RAW.routes || {}, castings: CASTINGS, freeShipUsd: S.freeShipUsd, freeShipCents: freeShipCents, addonBox: S.addonBox, addonProtect: S.addonProtect, requireVerified: S.requireVerified, lowStock: S.lowStock, bundleDiscount: S.bundleDiscount, showDiscountBadge: S.showDiscountBadge, wheelsCollection: S.wheelsCollection, cartUpsell: S.cartUpsell, whatsapp: S.whatsapp, city: S.city, hours: S.hours, address: S.address, moneyFormat: RAW.moneyFormat },
    $: $, $$: $$, esc: esc, LS: LS, debounce: debounce, emit: emit, on: on, ready: ready, t: t, money: money,
    ICON: ICON, icon: icon, wheelSVG: wheelSVG, silhouette: silhouette, SIL: SIL,
    garage: garage, fits: fits, fitTagHTML: fitTagHTML, tagFit: tagFit,
    open: open, closeAll: closeAll, lock: lock, toast: toast, wish: wish,
    reveal: reveal, countUp: countUp, countOnView: countOnView, acc: acc, tabs: tabs, rail: rail, stars: stars
  };

  ready(function () { reveal(); countOnView(); acc(); tagFit(); renderGarage(); renderWish(); });
})();
