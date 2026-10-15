/* ==========================================================================
   HPZ — core runtime (mockup)
   state · i18n · markets/money · catalog helpers · product card · motion
   Shopify: localization form + Markets, cart Ajax API, product-card snippet,
   small web components (<product-card>, <quantity-input>, <reveal-on-scroll>)
   ========================================================================== */
(function () {
  'use strict';

  const CAT = window.HPZ_CATALOG || [];
  const C = window.HPZ_CONTENT;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('hpz.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('hpz.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };
  const params = () => new URLSearchParams(location.search);
  const debounce = (fn, ms = 160) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const emit = (n, d) => document.dispatchEvent(new CustomEvent('hpz:' + n, { detail: d }));
  const on = (n, fn) => document.addEventListener('hpz:' + n, fn);

  if (params().has('reset')) { Object.keys(localStorage).filter(k => k.startsWith('hpz.')).forEach(k => localStorage.removeItem(k)); }
  if (params().has('static')) document.documentElement.classList.add('static');

  /* ---------------- icons ---------------- */
  const I = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const ICON = {
    search: I('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    user: I('<circle cx="12" cy="8.5" r="3.7"/><path d="M4.5 20.2c1.3-3.6 4.1-5.4 7.5-5.4s6.2 1.8 7.5 5.4"/>'),
    heart: I('<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>'),
    cart: I('<path d="M3 4h2.2l2.1 10.6a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.1"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>'),
    close: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    down: I('<path d="m6 9 6 6 6-6"/>'),
    up: I('<path d="m6 15 6-6 6 6"/>'),
    right: I('<path d="m9 6 6 6-6 6"/>'),
    left: I('<path d="m15 6-6 6 6 6"/>'),
    arrow: I('<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>'),
    arrowUR: I('<path d="M7 17 17 7"/><path d="M8 7h9v9"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    minus: I('<path d="M5 12h14"/>'),
    check: I('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    tick: '<svg class="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    shield: I('<path d="M12 3 5 5.8v5.4c0 4.6 3 8.2 7 9.8 4-1.6 7-5.2 7-9.8V5.8L12 3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
    truck: I('<path d="M2.5 6.5h11v9h-11z"/><path d="M13.5 9.5h4l3 3.2v2.8h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    box: I('<path d="m3.5 7.5 8.5-4 8.5 4v9l-8.5 4-8.5-4v-9Z"/><path d="m3.5 7.5 8.5 4 8.5-4M12 11.5v9"/>'),
    globe: I('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5S9.6 5.9 12 3.5Z"/>'),
    pin: I('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>'),
    clock: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    ruler: I('<path d="M3.5 15.5 15.5 3.5l5 5-12 12-5-5Z"/><path d="m7 12 2 2M10 9l1.5 1.5M13 6l2 2"/>'),
    car: I('<path d="M3.5 15.5v-3l2-4.5a2 2 0 0 1 1.8-1.2h9.4a2 2 0 0 1 1.8 1.2l2 4.5v3"/><path d="M2.5 15.5h19v2h-19z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/><path d="M5 12h14"/>'),
    wheel: I('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3"/><path d="M12 7v3.7M12 13.3V17M7.2 10.4l3.5 1.1M13.3 12.5l3.5 1.1M9 16l2.2-3M12.8 11l2.2-3"/>'),
    layers: I('<path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8 12 3.5Z"/><path d="m3.5 12 8.5 4.5 8.5-4.5"/><path d="m3.5 16 8.5 4.5 8.5-4.5"/>'),
    drop: I('<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z"/>'),
    spark: I('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
    tag: I('<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9-8-8Z"/><circle cx="8.5" cy="8.5" r="1.4"/>'),
    lock: I('<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
    info: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.01"/>'),
    filter: I('<path d="M4 6h16M7 12h10M10 18h4"/>'),
    grid: I('<rect x="4" y="4" width="6.5" height="6.5"/><rect x="13.5" y="4" width="6.5" height="6.5"/><rect x="4" y="13.5" width="6.5" height="6.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5"/>'),
    grid3: I('<rect x="3.5" y="4" width="4.5" height="4.5"/><rect x="9.75" y="4" width="4.5" height="4.5"/><rect x="16" y="4" width="4.5" height="4.5"/><rect x="3.5" y="15.5" width="4.5" height="4.5"/><rect x="9.75" y="15.5" width="4.5" height="4.5"/><rect x="16" y="15.5" width="4.5" height="4.5"/>'),
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8L12 3.5Z"/></svg>',
    camera: I('<path d="M4 7.5h3.5L9 5h6l1.5 2.5H20a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.8"/>'),
    upload: I('<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v3.5h16V16"/>'),
    menu: I('<path d="M4 7h16M4 12h16M4 17h10"/>'),
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10-6.5-10-6.5Z"/></svg>',
    trash: I('<path d="M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5l1 13.5h9l1-13.5"/>'),
    edit: I('<path d="M4 20h4L19 9l-4-4L4 16v4Z"/>'),
    gift: I('<rect x="3.5" y="8.5" width="17" height="4"/><path d="M5 12.5V20h14v-7.5M12 8.5V20M12 8.5c-1-3-5-4.5-5.5-2S10 8.5 12 8.5Zm0 0c1-3 5-4.5 5.5-2S14 8.5 12 8.5Z"/>'),
    bolt: I('<path d="M13 3 5 13.5h6L10 21l9-11h-6l0-7Z"/>'),
    chat: I('<path d="M4.5 18.5V6a1.5 1.5 0 0 1 1.5-1.5h12A1.5 1.5 0 0 1 19.5 6v8.5A1.5 1.5 0 0 1 18 16H8l-3.5 2.5Z"/><path d="M8.5 9h7M8.5 12h4.5"/>'),
    eye: I('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>'),
    repeat: I('<path d="M17 3.5 20.5 7 17 10.5"/><path d="M3.5 12V10a3 3 0 0 1 3-3h14M7 20.5 3.5 17 7 13.5"/><path d="M20.5 12v2a3 3 0 0 1-3 3h-14"/>'),
    bell: I('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15L6 16.5Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
    zoom: I('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5.5 5.5M8 10.5h5M10.5 8v5"/>'),
    mail: I('<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 6 8.5 7 8.5-7"/>'),
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.04c-.24.69-1.42 1.32-1.96 1.37-.5.05-.97.24-3.27-.68-2.77-1.09-4.52-3.93-4.66-4.11-.13-.18-1.11-1.48-1.11-2.83 0-1.35.71-2.01.96-2.29.25-.27.55-.34.73-.34h.52c.17 0 .4-.06.62.47.24.55.8 1.92.87 2.06.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.11.6-.07.17-.18.69-.81.88-1.09.18-.28.37-.23.62-.14.25.09 1.6.76 1.87.9.28.14.46.2.53.32.07.11.07.66-.17 1.35Z"/></svg>',
    ig: I('<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><path d="M17.3 6.7v.01"/>'),
    yt: I('<rect x="2.5" y="5.5" width="19" height="13" rx="3.5"/><path d="m10 9.2 5 2.8-5 2.8V9.2Z"/>'),
    tt: I('<path d="M14 3.5v11.2a3.3 3.3 0 1 1-3.3-3.3"/><path d="M14 3.5c.4 2.6 2.2 4.4 5 4.6"/>'),
    x: I('<path d="M4.5 4.5 19.5 19.5M19.5 4.5 4.5 19.5" stroke-width="1.4"/>'),
  };

  const FLAG = {
    INT: '<svg class="flag" viewBox="0 0 30 20"><rect width="30" height="20" fill="#17191c"/><circle cx="15" cy="10" r="6" fill="none" stroke="#ffd100" stroke-width="1.2"/><path d="M9 10h12M15 4c2 1.8 2.7 3.8 2.7 6S17 14.2 15 16c-2-1.8-2.7-3.8-2.7-6S13 5.8 15 4Z" fill="none" stroke="#ffd100" stroke-width="1.1"/></svg>',
    US: '<svg class="flag" viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><g fill="#b22234"><rect width="30" height="1.54"/><rect y="3.08" width="30" height="1.54"/><rect y="6.15" width="30" height="1.54"/><rect y="9.23" width="30" height="1.54"/><rect y="12.3" width="30" height="1.54"/><rect y="15.4" width="30" height="1.54"/><rect y="18.46" width="30" height="1.54"/></g><rect width="13" height="10.8" fill="#3c3b6e"/></svg>',
    EU: '<svg class="flag" viewBox="0 0 30 20"><rect width="30" height="20" fill="#003399"/><g fill="#ffcc00">' + Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<circle cx="${(15 + 6 * Math.cos(a)).toFixed(2)}" cy="${(10 + 6 * Math.sin(a)).toFixed(2)}" r=".9"/>`; }).join('') + '</g></svg>',
    GB: '<svg class="flag" viewBox="0 0 30 20"><rect width="30" height="20" fill="#012169"/><path d="M0 0 30 20M30 0 0 20" stroke="#fff" stroke-width="4"/><path d="M0 0 30 20M30 0 0 20" stroke="#c8102e" stroke-width="1.6"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.4"/></svg>',
    AU: '<svg class="flag" viewBox="0 0 30 20"><rect width="30" height="20" fill="#012169"/><path d="M0 0 15 10M15 0 0 10" stroke="#fff" stroke-width="2"/><path d="M7.5 0v10M0 5h15" stroke="#fff" stroke-width="3"/><path d="M7.5 0v10M0 5h15" stroke="#c8102e" stroke-width="1.6"/><g fill="#fff"><circle cx="7.5" cy="15" r="1.6"/><circle cx="22" cy="5" r=".9"/><circle cx="25" cy="9" r=".9"/><circle cx="22" cy="15.5" r=".9"/><circle cx="19" cy="9.5" r=".9"/></g></svg>',
    JP: '<svg class="flag" viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5.6" fill="#bc002d"/></svg>',
    SG: '<svg class="flag" viewBox="0 0 30 20"><rect width="30" height="10" fill="#ef3340"/><rect y="10" width="30" height="10" fill="#fff"/><circle cx="7" cy="5" r="3.3" fill="#fff"/><circle cx="8.3" cy="5" r="3.1" fill="#ef3340"/></svg>',
    MY: '<svg class="flag" viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><g fill="#cc0001">' + Array.from({ length: 7 }, (_, i) => `<rect y="${i * 2.86}" width="30" height="1.43"/>`).join('') + '</g><rect width="15" height="11.4" fill="#010066"/><circle cx="6" cy="5.7" r="3.6" fill="#fc0"/><circle cx="7.2" cy="5.7" r="3.1" fill="#010066"/></svg>',
    ID: '<svg class="flag" viewBox="0 0 30 20"><rect width="30" height="10" fill="#e70011"/><rect y="10" width="30" height="10" fill="#fff"/></svg>',
  };

  /* payment marks — simple wordmark chips (replace with Shopify payment_type_svg_tag) */
  const PAYM = {
    visa: ['VISA', '#1a1f71', '#fff'], mc: ['<i style="display:inline-flex"><b style="width:9px;height:9px;border-radius:50%;background:#eb001b;display:block"></b><b style="width:9px;height:9px;border-radius:50%;background:#f79e1b;display:block;margin-left:-4px;mix-blend-mode:multiply"></b></i>', '#fff', '#000'],
    amex: ['AMEX', '#2e77bc', '#fff'], paypal: ['<b style="color:#003087">Pay</b><b style="color:#009cde">Pal</b>', '#fff', '#000'], apple: [' Pay', '#000', '#fff'], gpay: ['G Pay', '#fff', '#3c4043'],
    shop: ['shop', '#5a31f4', '#fff'], klarna: ['Klarna.', '#ffb3c7', '#0a0b09'], afterpay: ['afterpay', '#b2fce4', '#000'], jcb: ['JCB', '#0e4c96', '#fff'], fpx: ['FPX', '#fff', '#1f3c88'],
    qris: ['QRIS', '#fff', '#e2211c'], bca: ['BCA', '#005eaa', '#fff'], mandiri: ['mandiri', '#003d79', '#ffb700'], bni: ['BNI', '#f15a23', '#fff'], gopay: ['gopay', '#00aed6', '#fff'], ovo: ['OVO', '#4c3494', '#fff'],
  };
  const payIcons = list => `<span class="pays">${list.map(k => { const m = PAYM[k]; return m ? `<span class="pay" style="background:${m[1]};color:${m[2]}" title="${k}">${m[0]}</span>` : ''; }).join('')}</span>`;

  /* ---------------- state ---------------- */
  const MARKETS = C.MARKETS, CUR = C.CURRENCIES;
  const S = {
    market: LS.get('market', null),
    lang: LS.get('lang', null),
    cart: LS.get('cart', []),
    wish: LS.get('wish', []),
    recent: LS.get('recent', []),
    garage: LS.get('garage', []),
    addons: LS.get('addons', { box: false, ins: true }),
    orders: LS.get('orders', []),
    geoAsked: LS.get('geoAsked', false),
  };
  // guess market from timezone (Shopify: Geolocation app / browser locale)
  function guessMarket() {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    if (/Jakarta|Pontianak|Makassar|Jayapura/.test(tz)) return 'ID';
    if (/Tokyo/.test(tz)) return 'JP';
    if (/Singapore/.test(tz)) return 'SG';
    if (/Kuala_Lumpur|Kuching/.test(tz)) return 'MY';
    if (/London/.test(tz)) return 'GB';
    if (/^Australia/.test(tz)) return 'AU';
    if (/^Europe/.test(tz)) return 'EU';
    if (/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit)/.test(tz)) return 'US';
    return 'INT';
  }
  const GEO = guessMarket();
  if (!S.market) S.market = 'INT';
  if (!S.lang) S.lang = 'en';
  const mk = () => MARKETS[S.market] || MARKETS.INT;
  const cur = () => CUR[mk().cur];
  const isLocal = () => !!mk().local;

  function setMarket(code, lang) {
    if (MARKETS[code]) S.market = code;
    if (lang && C.LANGS[lang]) S.lang = lang;
    LS.set('market', S.market); LS.set('lang', S.lang);
    document.documentElement.lang = S.lang;
    applyI18n();
    emit('market', { market: S.market, lang: S.lang });
  }

  /* ---------------- i18n ----------------
     t('English', 'Indonesia', '日本語') in JS.
     Static HTML: <span data-id="…" data-ja="…">English</span>, placeholders via data-ph-id / data-ph-ja.
     Shopify: locales/en.default.json, id.json, ja.json + Translate & Adapt. */
  const t = (en, id, ja) => (S.lang === 'id' && id) ? id : (S.lang === 'ja' && ja) ? ja : en;
  function applyI18n(root = document) {
    $$('[data-id],[data-ja]', root).forEach(el => {
      if (el.dataset.en0 === undefined) el.dataset.en0 = el.innerHTML;
      const v = S.lang === 'en' ? el.dataset.en0 : (el.dataset[S.lang] || el.dataset.en0);
      if (el.innerHTML !== v) el.innerHTML = v;
    });
    $$('[data-ph-id],[data-ph-ja]', root).forEach(el => {
      if (el.dataset.ph0 === undefined) el.dataset.ph0 = el.placeholder;
      el.placeholder = S.lang === 'id' ? (el.dataset.phId || el.dataset.ph0) : S.lang === 'ja' ? (el.dataset.phJa || el.dataset.ph0) : el.dataset.ph0;
    });
  }

  /* ---------------- money ----------------
     Base prices in USD; Markets converts + rounds. */
  function conv(usd, c = cur()) {
    let v = usd * c.rate;
    if (c.round) v = Math.ceil(v / c.round) * c.round;
    else v = Math.round(v * 100) / 100;
    return v;
  }
  function fmt(v, c = cur(), opt = {}) {
    const neg = v < 0; v = Math.abs(v);
    const dp = c.dp;
    let s = v.toFixed(dp);
    let [i, d] = s.split('.');
    const sep = c.code === 'IDR' ? '.' : ',';
    i = i.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    if (opt.short && d === '00') d = null;
    const n = d ? i + (c.code === 'IDR' ? ',' : '.') + d : i;
    const sym = c.code === 'IDR' ? 'Rp ' : c.s;
    return (neg ? '−' : '') + sym + n + (opt.code ? ' ' + c.code : '');
  }
  const money = (usd, opt = {}) => fmt(conv(usd), cur(), opt);
  const moneyRaw = usd => conv(usd);

  /* ---------------- catalog ---------------- */
  const CDN = 'https://cdn.shopify.com/s/files/1/0716/6427/1450/files/';
  const IMG = (src, w = 600) => !src ? '' : (src.startsWith('http') ? src : CDN + src) + (src.includes('?') ? '&' : '?') + 'width=' + w;
  const byId = id => CAT.find(p => String(p.id) === String(id));
  const byH = h => CAT.find(p => p.h === h);
  const variant = (p, vid) => p.v.find(v => String(v.id) === String(vid)) || p.v[0];
  const vByName = (p, n) => p.v.find(v => v.n === n) || p.v.find(v => v.a) || p.v[0];
  const partNo = p => 'HPZ-' + C.CATS[p.k].code + String(p.id).slice(-5);
  const brand = p => C.BRANDS[p.b] || { n: p.b };
  const pct = (p, c) => c ? Math.round((1 - p / c) * 100) : 0;
  const isNew = p => p.d <= 21;
  const stockOf = p => { // placeholder stock counts — replace with inventory_quantity
    if (!p.a) return 0; const n = (p.id % 23); return n < 4 ? n + 1 : n + 6;
  };
  const rating = p => { const r = 4.5 + ((p.id % 5) / 10); return { r: Math.min(5, r).toFixed(1), n: 6 + (p.id % 61) }; };

  function specLine(p) {
    const s = p.sp, out = [];
    if (s.dia) out.push('Ø' + String(s.dia).replace('.', '.') + ' mm');
    if (p.k === 'wheels') {
      if (s.bearing) out.push(t('Bearing', 'Bearing', 'ベアリング'));
      else if (s.disc) out.push(t('Disc brake', 'Disc brake', 'ディスク'));
      if (s.metal) out.push(t('Alloy lip', 'Lip alloy', 'アルミリップ'));
      else if (s.resin) out.push(t('Resin', 'Resin', 'レジン'));
    } else if (p.k === 'decals') {
      out.push(s.toner ? t('White toner', 'White toner', 'ホワイトトナー') : t('Transparent', 'Transparan', '透明'));
      if (s.precoat) out.push(t('Precoated', 'Precoated', 'プレコート'));
    } else if (p.k === 'engines') {
      out.push(p.v.length > 1 ? t('Raw / Painted', 'Raw / Cat', '未塗装 / 塗装済') : t('Resin', 'Resin', 'レジン'));
    } else {
      out.push(t('Resin', 'Resin', 'レジン'));
    }
    out.push('1:64');
    return out.slice(0, 3);
  }

  function query(f = {}) {
    let r = CAT.slice();
    if (f.k) r = r.filter(p => [].concat(f.k).includes(p.k));
    if (f.b) r = r.filter(p => [].concat(f.b).includes(p.b));
    if (f.s) r = r.filter(p => [].concat(f.s).includes(p.s));
    if (f.dia) r = r.filter(p => [].concat(f.dia).map(Number).includes(p.sp.dia));
    if (f.feat) [].concat(f.feat).forEach(x => { r = r.filter(p => p.sp[x]); });
    if (f.col) r = r.filter(p => p.v.some(v => v.n && [].concat(f.col).some(c => colorFamily(v.n) === c)));
    if (f.avail) r = r.filter(p => p.a);
    if (f.sale) r = r.filter(p => p.c);
    if (f.own) r = r.filter(p => C.BRANDS[p.b] && C.BRANDS[p.b].own);
    if (f.cast) { const c = castById(f.cast); if (c) r = r.filter(p => fits(p, c) !== 'no'); }
    if (f.min != null) r = r.filter(p => p.p >= f.min);
    if (f.max != null) r = r.filter(p => p.p <= f.max);
    if (f.q) { const words = f.q.toLowerCase().split(/\s+/).filter(Boolean); r = r.filter(p => { const h = (p.full + ' ' + brand(p).n + ' ' + partNo(p) + ' ' + (p.sp.dia ? p.sp.dia + 'mm' : '') + ' ' + p.v.map(v => v.n).join(' ')).toLowerCase(); return words.every(w => h.includes(w)); }); }
    const sorts = {
      new: (a, b) => a.d - b.d, 'price-asc': (a, b) => a.p - b.p, 'price-desc': (a, b) => b.p - a.p,
      az: (a, b) => a.t.localeCompare(b.t), best: (a, b) => (rating(b).n - rating(a).n), sale: (a, b) => pct(b.p, b.c) - pct(a.p, a.c),
    };
    if (f.sort && sorts[f.sort]) r.sort(sorts[f.sort]);
    else r.sort((a, b) => (b.a - a.a) || (a.d - b.d));
    return r;
  }

  /* ---------------- colours ---------------- */
  const COL = {
    gold: '#c9a24a', silver: '#c5c9cf', chrome: 'linear-gradient(135deg,#f4f6f8 0%,#8d939b 45%,#eef1f4 55%,#6b7178 100%)', gunmet: '#4a4f56', 'gun metal': '#4a4f56', gunmetal: '#4a4f56',
    white: '#f6f6f3', black: '#141516', bronze: '#8c6a3d', blue: '#2453c8', red: '#c8202a', tosca: '#1fb3a5', pink: '#ef6aa6', purple: '#7a3fc0', green: '#2f9a4c',
    orange: '#ef7d1a', grey: '#8d9198', 'dark grey': '#4e5257', yellow: '#f2d21b', 'fluorescent yellow': '#d9ff1f', fluorescene: '#d9ff1f', raw: '#ddd5c4', painted: 'linear-gradient(135deg,#c8202a 50%,#141516 50%)', 'rose gold': '#d7a08b',
  };
  function colorFamily(n) {
    const s = (n || '').toLowerCase();
    for (const k of ['gold', 'silver', 'chrome', 'gunmet', 'gun metal', 'gunmetal', 'bronze', 'white', 'black', 'blue', 'red', 'tosca', 'pink', 'purple', 'green', 'orange', 'grey', 'yellow']) if (s.includes(k)) return k === 'gun metal' || k === 'gunmetal' ? 'gunmet' : k;
    return null;
  }
  function swatchBg(n) {
    const s = (n || '').toLowerCase().replace(/anodize|lips?|resin|alloy|decal|rims|full|metalic|discbrake|rays/g, '').replace(/\s+-\s+|\s+/g, ' ').trim();
    if (COL[s]) return COL[s];
    const parts = s.split(' ').map(w => COL[w] || (w === 'gun' ? COL.gunmet : null)).filter(Boolean);
    if (parts.length >= 2) { const a = parts[0], b = parts[parts.length - 1]; if (!a.includes('gradient') && !b.includes('gradient')) return `linear-gradient(135deg,${a} 50%,${b} 50%)`; return a; }
    if (parts.length === 1) return parts[0];
    return null;
  }
  const isColorOpt = p => p.o === 'Color' && p.v.filter(v => swatchBg(v.n)).length >= p.v.length * .6;
  const COLOR_FAMILIES = ['gold', 'silver', 'chrome', 'gunmet', 'bronze', 'white', 'black', 'blue', 'red', 'tosca', 'pink', 'purple', 'green', 'orange', 'grey'];

  /* ---------------- castings & fitment ---------------- */
  const castById = id => C.CASTINGS.find(c => c.id === id);
  function fits(p, c) {
    if (!c) return null;
    if (p.k === 'wheels') {
      if (!p.sp.dia) return 'close';
      const d = Math.abs(p.sp.dia - c.dia);
      return d === 0 ? 'fit' : d <= .5 ? 'close' : 'no';
    }
    if (['decals', 'bodykits', 'engines'].includes(p.k)) return c.m.test(p.full) ? 'made' : 'no';
    return 'universal';
  }
  const myCast = () => castById(S.garage[0]);
  function setGarage(id) {
    S.garage = [id, ...S.garage.filter(x => x !== id)].slice(0, 4);
    LS.set('garage', S.garage); emit('garage', id);
  }
  function fitTag(p) {
    const c = myCast(); if (!c) return '';
    const f = fits(p, c);
    if (f === 'fit') return `<span class="fit fit-ok" title="${esc(c.n)}">${ICON.check}${t('Fits your', 'Pas untuk', '適合')} ${esc(shortCast(c))}</span>`;
    if (f === 'made') return `<span class="fit fit-ok" title="${esc(c.n)}">${ICON.check}${t('Made for', 'Dibuat untuk', '専用')} ${esc(shortCast(c))}</span>`;
    if (f === 'close') return `<span class="fit fit-close">${t('Check fit', 'Cek ukuran', '要確認')} · ${esc(shortCast(c))}</span>`;
    return '';
  }
  const shortCast = c => c.n.replace(/^(Nissan|Honda|Toyota|Mazda|Mitsubishi|Subaru|BMW|Mercedes-Benz|Acura \/ Honda|Lancia|Porsche|Ferrari)\s+/, '').replace(/Skyline GT-R /, '');

  /* ---------------- cart ---------------- */
  const saveCart = () => { LS.set('cart', S.cart); emit('cart', S.cart); };
  function cartItems() {
    return S.cart.map(l => { const p = byId(l.id); if (!p) return null; const v = variant(p, l.vid); return { ...l, p, v, line: v.p * l.q, cline: (v.c || v.p) * l.q }; }).filter(Boolean);
  }
  const cartCount = () => S.cart.reduce((n, l) => n + l.q, 0);
  function addToCart(id, vid, q = 1, from) {
    const p = byId(id); if (!p) return;
    const v = vid ? variant(p, vid) : (p.v.find(x => x.a) || p.v[0]);
    if (!v.a) { toast({ title: t('Sold out', 'Stok habis', '在庫切れ'), sub: t('We will email you when it is back.', 'Kami kabari saat restock.', '再入荷時にお知らせします。') }); return; }
    const ex = S.cart.find(l => String(l.vid) === String(v.id));
    if (ex) ex.q = Math.min(ex.q + q, 20); else S.cart.unshift({ id: p.id, vid: v.id, q });
    saveCart();
    const imgSrc = p.img[v.i > -1 ? v.i : 0];
    if (from) flyToCart(from, IMG(imgSrc, 200));
    bumpCart();
    setTimeout(() => { if (window.HPZ.openDrawer && !document.body.classList.contains('no-drawer')) window.HPZ.openDrawer('cart'); }, from ? 520 : 0);
  }
  function addMany(lines, from) { // [{id, vid, q}]
    lines.forEach(l => {
      const p = byId(l.id); if (!p) return; const v = l.vid ? variant(p, l.vid) : (p.v.find(x => x.a) || p.v[0]); if (!v.a) return;
      const ex = S.cart.find(x => String(x.vid) === String(v.id)); if (ex) ex.q += l.q || 1; else S.cart.unshift({ id: p.id, vid: v.id, q: l.q || 1, bundle: l.bundle });
    });
    saveCart(); if (from) flyToCart(from, IMG(byId(lines[0].id).img[0], 200)); bumpCart();
    setTimeout(() => window.HPZ.openDrawer('cart'), from ? 520 : 0);
  }
  function setQty(vid, q) {
    const l = S.cart.find(x => String(x.vid) === String(vid)); if (!l) return;
    if (q <= 0) S.cart = S.cart.filter(x => x !== l); else l.q = Math.min(q, 20);
    saveCart();
  }
  function removeLine(vid) {
    const idx = S.cart.findIndex(x => String(x.vid) === String(vid)); if (idx < 0) return;
    const [l] = S.cart.splice(idx, 1); saveCart();
    const p = byId(l.id);
    toast({ title: t('Removed from cart', 'Dihapus dari keranjang', 'カートから削除しました'), sub: p ? p.t : '', img: p ? IMG(p.img[0], 120) : null, action: t('Undo', 'Batal', '元に戻す'), onAction: () => { S.cart.splice(idx, 0, l); saveCart(); } });
  }
  function setAddon(k, v) { S.addons[k] = v; LS.set('addons', S.addons); emit('cart', S.cart); }
  const ADDON = { box: { usd: 2.5, n: () => t('Crush-proof rigid box', 'Box rigid anti-penyok', '耐圧リジッドボックス') }, ins: { usd: 1.5, n: () => t('Shipping protection', 'Proteksi pengiriman', '配送保証') } };
  function totals(o = {}) {
    const items = cartItems();
    const sub = items.reduce((s, l) => s + l.line, 0);
    const compare = items.reduce((s, l) => s + l.cline, 0);
    const bundle = items.filter(l => l.bundle).reduce((s, l) => s + l.line * .1, 0);
    const add = (S.addons.box && items.length ? ADDON.box.usd : 0) + (S.addons.ins && items.length ? ADDON.ins.usd : 0);
    const free = mk().free;
    const shipOpt = o.ship ? mk().ship.find(s => s[0] === o.ship) : mk().ship[0];
    let ship = o.ship === undefined ? null : (shipOpt ? shipOpt[2] : 0);
    if (ship != null && sub - bundle >= free && shipOpt === mk().ship[0]) ship = 0;
    const disc = o.code === 'PITCREW10' ? (sub - bundle) * .1 : 0;
    const duty = mk().duty && o.ship !== undefined ? Math.max(0, (sub - bundle - disc) * .1) : 0;
    const total = sub - bundle - disc + add + (ship || 0) + duty;
    return { items, sub, compare, save: compare - sub + bundle, bundle, add, ship, free, toFree: Math.max(0, free - (sub - bundle)), disc, duty, total, count: cartCount() };
  }

  /* ---------------- wishlist / recent ---------------- */
  function toggleWish(id, el) {
    id = Number(id);
    const has = S.wish.includes(id);
    S.wish = has ? S.wish.filter(x => x !== id) : [id, ...S.wish];
    LS.set('wish', S.wish); emit('wish', S.wish);
    $$(`[data-wish="${id}"]`).forEach(b => { b.classList.toggle('is-on', !has); if (!has) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); } });
    const p = byId(id);
    if (!has) toast({ title: t('Saved to wishlist', 'Disimpan ke wishlist', 'ウィッシュリストに保存'), sub: p.t, img: IMG(p.img[0], 120), action: t('View', 'Lihat', '見る'), onAction: () => window.HPZ.openDrawer('wish') });
  }
  function pushRecent(id) { S.recent = [Number(id), ...S.recent.filter(x => x !== Number(id))].slice(0, 12); LS.set('recent', S.recent); }

  /* ---------------- motion helpers ---------------- */
  let io;
  function reveal(root = document) {
    if (!io) io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    $$('[data-reveal]:not(.is-in), [data-split]:not(.is-in)', root).forEach(el => io.observe(el));
  }
  function splitLines(el) { // wraps each <br>-separated line for a masked rise
    if (el.dataset.splitDone) return; el.dataset.splitDone = 1;
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map((l, i) => `<span class="split-line" style="--i:${i}"><span>${l}</span></span>`).join('');
  }
  function countUp(el, to, o = {}) {
    const from = o.from || 0, dur = o.dur || 1100, dp = o.dp || 0; const t0 = performance.now();
    const f = o.fmt || (v => v.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }));
    if (document.documentElement.classList.contains('static')) { el.textContent = f(to); return; }
    const step = now => { const k = Math.min(1, (now - t0) / dur); const e = 1 - Math.pow(1 - k, 4); el.textContent = f(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function countOnView(root = document) {
    const ob = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const el = e.target; countUp(el, parseFloat(el.dataset.count), { dp: +(el.dataset.dp || 0) }); ob.unobserve(el); } }), { threshold: .4 });
    $$('[data-count]', root).forEach(el => ob.observe(el));
  }
  function flyToCart(from, src) {
    const target = $('#hdr-cart'); if (!target || !from || !from.getBoundingClientRect) return;
    const a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
    const img = document.createElement('img'); img.src = src; img.className = 'fly';
    const s = Math.min(90, a.width || 90);
    Object.assign(img.style, { left: a.left + a.width / 2 - s / 2 + 'px', top: a.top + a.height / 2 - s / 2 + 'px', width: s + 'px', height: s + 'px' });
    document.body.appendChild(img);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    img.animate([
      { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
      { transform: `translate(${dx * .45}px, ${dy * .45 - 120}px) scale(.7) rotate(-12deg)`, opacity: 1, offset: .55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(-30deg)`, opacity: .3 },
    ], { duration: 700, easing: 'cubic-bezier(.5,0,.2,1)' }).onfinish = () => img.remove();
  }
  function bumpCart() {
    const el = $('#hdr-cart'); if (!el) return;
    setTimeout(() => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }, 600);
  }

  /* ---------------- toast ---------------- */
  function toast(o) {
    let host = $('#toasts'); if (!host) { host = document.createElement('div'); host.id = 'toasts'; host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = `${o.img ? `<img src="${o.img}" alt="">` : `<span class="toast-ic">${o.icon || ICON.check}</span>`}<div><b>${esc(o.title)}</b>${o.sub ? `<span>${esc(o.sub)}</span>` : ''}</div>${o.action ? `<button class="toast-act">${esc(o.action)}</button>` : ''}<button class="toast-x" aria-label="Close">${ICON.close}</button><i class="toast-bar"></i>`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
    const kill = () => { el.classList.remove('is-in'); el.classList.add('is-out'); setTimeout(() => el.remove(), 400); };
    const tm = setTimeout(kill, o.ms || 4200);
    el.querySelector('.toast-x').onclick = () => { clearTimeout(tm); kill(); };
    if (o.action) el.querySelector('.toast-act').onclick = () => { clearTimeout(tm); kill(); o.onAction && o.onAction(); };
  }

  /* ---------------- product card ----------------
     Shopify: snippets/product-card.liquid */
  function swatches(p, max = 6, size = '') {
    if (!isColorOpt(p)) return p.v.length > 1 ? `<span class="pc-opts">${p.v.length} ${p.o === 'Color' ? t('finishes', 'warna', '色') : t('options', 'opsi', 'オプション')}</span>` : '';
    const vs = p.v.filter(v => swatchBg(v.n));
    return `<div class="sw ${size}">${vs.slice(0, max).map(v => `<button class="sw-i ${v.a ? '' : 'is-out'}" style="--c:${swatchBg(v.n)}" data-sw="${v.id}" data-img="${v.i}" title="${esc(v.n)}" aria-label="${esc(v.n)}"></button>`).join('')}${vs.length > max ? `<span class="sw-more">+${vs.length - max}</span>` : ''}</div>`;
  }
  function priceHTML(p, v) {
    const pr = v ? v.p : p.p, c = v ? v.c : p.c;
    const varies = !v && p.v.some(x => x.p !== p.p);
    return `<span class="pr ${c ? 'is-sale' : ''}">${varies ? `<small>${t('from', 'mulai', '')}</small> ` : ''}<b>${money(pr)}</b>${c ? `<s>${money(c)}</s><em>−${pct(pr, c)}%</em>` : ''}</span>`;
  }
  function card(p, o = {}) {
    const b = brand(p);
    const second = p.img[1] ? `<img class="pc-b" src="${IMG(p.img[1], 600)}" alt="" loading="lazy">` : '';
    const st = stockOf(p);
    const badges = [
      !p.a ? `<span class="badge out">${t('Sold out', 'Habis', '在庫切れ')}</span>` : '',
      p.a && isNew(p) ? `<span class="badge new">${t('New', 'Baru', '新着')}</span>` : '',
      p.a && p.c && pct(p.p, p.c) >= 10 ? `<span class="badge sale">−${pct(p.p, p.c)}%</span>` : '',
      b.own ? `<span class="badge own">HPZ ${t('Original', 'Original', 'オリジナル')}</span>` : '',
    ].filter(Boolean).slice(0, 2).join('');
    return `<article class="pc ${p.a ? '' : 'is-out'}" data-pid="${p.id}" ${o.reveal !== false ? `data-reveal style="--i:${(o.i || 0) % 8}"` : ''}>
      <a class="pc-media" href="product.html?h=${p.h}" aria-label="${esc(p.t)}">
        <img class="pc-a" src="${IMG(p.img[0], 600)}" alt="${esc(p.full)}" loading="lazy">${second}
        <span class="pc-badges">${badges}</span>
        ${p.a && st && st <= 4 ? `<span class="pc-low"><i class="dot low"></i>${t('Only', 'Sisa', '残り')} ${st}</span>` : ''}
      </a>
      <button class="pc-wish ${S.wish.includes(p.id) ? 'is-on' : ''}" data-wish="${p.id}" aria-label="${t('Save', 'Simpan', '保存')}">${ICON.heart}</button>
      <div class="pc-quick">${p.a ? `<button class="pc-qbtn" data-qadd="${p.id}">${ICON.plus}<span>${p.v.length > 1 ? t('Quick add', 'Tambah cepat', 'クイック追加') : t('Add to cart', 'Tambah', 'カートに追加')}</span></button><button class="pc-qv" data-quick="${p.id}" aria-label="Quick view">${ICON.eye}</button>` : `<button class="pc-qbtn is-notify" data-notify="${p.id}">${ICON.bell}<span>${t('Notify me', 'Kabari saya', '入荷通知')}</span></button>`}</div>
      <div class="pc-body">
        <div class="pc-meta"><span>${esc(b.n)}</span><span class="mono">${partNo(p)}</span></div>
        <a class="pc-title" href="product.html?h=${p.h}">${esc(p.t)}</a>
        <div class="pc-spec">${specLine(p).map(s => `<span>${esc(s)}</span>`).join('')}</div>
        ${fitTag(p)}
        <div class="pc-foot">${priceHTML(p)}${swatches(p, o.swMax || 5)}</div>
      </div>
    </article>`;
  }
  // inline quick-add variant picker inside the card
  function openQuickAdd(btn) {
    const cardEl = btn.closest('.pc'); const p = byId(btn.dataset.qadd);
    if (p.v.length === 1) { addToCart(p.id, p.v[0].id, 1, cardEl.querySelector('.pc-media')); return; }
    const q = cardEl.querySelector('.pc-quick');
    q.classList.add('is-open');
    q.innerHTML = `<div class="pc-pick"><div class="pc-pick-h"><span>${t('Choose', 'Pilih', '選択')} ${esc((p.o || 'option').toLowerCase())}</span><button data-qclose aria-label="Close">${ICON.close}</button></div><div class="pc-pick-l">${p.v.map(v => `<button class="pc-pv ${v.a ? '' : 'is-out'}" data-pv="${v.id}" ${v.a ? '' : 'disabled'}>${swatchBg(v.n) ? `<i style="--c:${swatchBg(v.n)}"></i>` : ''}${esc(v.n)}</button>`).join('')}</div></div>`;
  }
  function closeQuickAdd(q) {
    const cardEl = q.closest('.pc'); const p = byId(cardEl.dataset.pid);
    q.classList.remove('is-open');
    q.innerHTML = `<button class="pc-qbtn" data-qadd="${p.id}">${ICON.plus}<span>${t('Quick add', 'Tambah cepat', 'クイック追加')}</span></button><button class="pc-qv" data-quick="${p.id}" aria-label="Quick view">${ICON.eye}</button>`;
  }

  /* ---------------- procedural wheel (SVG) ----------------
     used in hero, mega menu, planner, 404 — no image needed */
  const FIN = {
    gold: ['#e7c776', '#a57e2c'], silver: ['#eef0f3', '#9aa0a8'], gunmet: ['#6c727a', '#2c3035'], bronze: ['#b38a52', '#5f4422'],
    chrome: ['#ffffff', '#7c838c'], white: ['#ffffff', '#cfd2d6'], black: ['#3a3d42', '#0f1012'], tosca: ['#4fd6c8', '#0f7f74'], blue: ['#5d86f0', '#1a3a9a'], red: ['#f05252', '#8f1418'], pink: ['#ff8cc0', '#b0306b'],
  };
  let wid = 0;
  function wheelSVG(o = {}) {
    const n = o.spokes || 6, style = o.style || 'spoke', f = FIN[o.finish] || FIN.silver, id = 'w' + (++wid);
    const lip = o.lip == null ? 1 : o.lip;
    let face = '';
    if (style === 'mesh') {
      for (let i = 0; i < n; i++) { const a = i * 360 / n; face += `<g transform="rotate(${a} 50 50)"><path d="M50 50 L46 21 Q50 19 54 21 Z" fill="url(#${id}f)" stroke="rgba(0,0,0,.35)" stroke-width=".4"/><path d="M50 50 L58 22" stroke="url(#${id}f)" stroke-width="1.6"/><path d="M50 50 L42 22" stroke="url(#${id}f)" stroke-width="1.6"/></g>`; }
    } else if (style === 'disc') {
      face = `<circle cx="50" cy="50" r="29" fill="url(#${id}f)"/>` + Array.from({ length: n }, (_, i) => `<circle cx="${50 + 20 * Math.cos(i * 2 * Math.PI / n)}" cy="${50 + 20 * Math.sin(i * 2 * Math.PI / n)}" r="3.4" fill="#16181b"/>`).join('');
    } else if (style === 'dish') {
      face = `<circle cx="50" cy="50" r="30" fill="none" stroke="url(#${id}f)" stroke-width="6"/>` + Array.from({ length: n }, (_, i) => `<g transform="rotate(${i * 360 / n} 50 50)"><path d="M47.5 50 L48.5 26 L51.5 26 L52.5 50 Z" fill="url(#${id}f)"/></g>`).join('');
    } else {
      face = Array.from({ length: n }, (_, i) => `<g transform="rotate(${i * 360 / n} 50 50)"><path d="M45.6 47 L47.2 21.5 Q50 20.4 52.8 21.5 L54.4 47 Z" fill="url(#${id}f)" stroke="rgba(0,0,0,.3)" stroke-width=".4"/></g>`).join('');
    }
    const lugs = Array.from({ length: 5 }, (_, i) => `<circle cx="${(50 + 6.2 * Math.cos(i * 2 * Math.PI / 5 - Math.PI / 2)).toFixed(2)}" cy="${(50 + 6.2 * Math.sin(i * 2 * Math.PI / 5 - Math.PI / 2)).toFixed(2)}" r="1.1" fill="#16181b"/>`).join('');
    return `<svg class="wsvg" viewBox="0 0 100 100" aria-hidden="true"><defs>
      <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${f[0]}"/><stop offset="1" stop-color="${f[1]}"/></linearGradient>
      <linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fafbfc"/><stop offset=".5" stop-color="#8e949c"/><stop offset="1" stop-color="#e6e9ec"/></linearGradient>
      <radialGradient id="${id}b" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#0b0c0d"/><stop offset="1" stop-color="#25282c"/></radialGradient></defs>
      <circle cx="50" cy="50" r="49" fill="#141517"/><circle cx="50" cy="50" r="46.5" fill="none" stroke="#222428" stroke-width="2"/>
      ${Array.from({ length: 36 }, (_, i) => `<path transform="rotate(${i * 10} 50 50)" d="M50 2.2 L50 5.4" stroke="#262a2e" stroke-width="2.2"/>`).join('')}
      <circle cx="50" cy="50" r="${lip ? 37 : 35}" fill="url(#${id}b)"/>
      ${lip ? `<circle cx="50" cy="50" r="36" fill="none" stroke="url(#${id}l)" stroke-width="3.2"/>` : ''}
      ${o.disc ? `<circle cx="50" cy="50" r="27" fill="#7a8087"/><circle cx="50" cy="50" r="27" fill="none" stroke="#5b6168" stroke-width="2.5" stroke-dasharray=".6 2.2"/><circle cx="50" cy="50" r="17" fill="#3b3f45"/>` : ''}
      <circle cx="50" cy="50" r="33" fill="none" stroke="url(#${id}f)" stroke-width="2"/>
      <g class="wsvg-face">${face}</g>
      <circle cx="50" cy="50" r="9.5" fill="url(#${id}f)" stroke="rgba(0,0,0,.35)" stroke-width=".5"/>${lugs}
      <circle cx="50" cy="50" r="3.2" fill="#16181b"/><circle cx="50" cy="50" r="1.4" fill="${o.cap || '#e5306b'}"/>
    </svg>`;
  }

  /* ---------------- widgets ---------------- */
  function acc(root = document) {
    $$('[data-acc]', root).forEach(a => {
      if (a.dataset.accOn) return; a.dataset.accOn = 1;
      const btn = a.querySelector('.acc-h'), body = a.querySelector('.acc-b');
      if (a.classList.contains('is-open')) body.style.height = 'auto';
      btn.addEventListener('click', () => {
        const open = a.classList.toggle('is-open'); btn.setAttribute('aria-expanded', open);
        body.style.height = body.scrollHeight + 'px';
        if (!open) { requestAnimationFrame(() => { body.style.height = '0px'; }); }
        else body.addEventListener('transitionend', function te() { if (a.classList.contains('is-open')) body.style.height = 'auto'; body.removeEventListener('transitionend', te); });
      });
    });
  }
  function tabs(el, fn) { // segmented control with sliding ink
    const ink = document.createElement('i'); ink.className = 'tabs-ink'; el.appendChild(ink);
    const move = b => { ink.style.width = b.offsetWidth + 'px'; ink.style.transform = `translateX(${b.offsetLeft}px)`; };
    const btns = $$('button', el);
    btns.forEach(b => b.addEventListener('click', () => { btns.forEach(x => x.classList.toggle('is-on', x === b)); move(b); fn && fn(b.dataset.tab, b); }));
    const cur = btns.find(b => b.classList.contains('is-on')) || btns[0]; cur.classList.add('is-on');
    requestAnimationFrame(() => move(cur)); window.addEventListener('resize', () => move(el.querySelector('.is-on')));
  }
  function rail(track, prev, next) {
    const go = d => track.scrollBy({ left: d * track.clientWidth * .8, behavior: 'smooth' });
    prev && prev.addEventListener('click', () => go(-1)); next && next.addEventListener('click', () => go(1));
    const upd = () => { if (prev) prev.disabled = track.scrollLeft < 4; if (next) next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4; };
    track.addEventListener('scroll', debounce(upd, 50)); upd();
    // drag to scroll (desktop)
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-drag'); } track.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { down = false; setTimeout(() => track.classList.remove('is-drag'), 0); });
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }
  function stars(r) { const full = Math.round(r); return `<span class="stars" aria-label="${r} / 5">${Array.from({ length: 5 }, (_, i) => `<i class="${i < full ? 'on' : ''}">${ICON.star}</i>`).join('')}</span>`; }
  function addDays(n) { const d = new Date(); let k = 0; while (k < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) k++; } return d; }
  const dfmt = d => d.toLocaleDateString(S.lang === 'id' ? 'id-ID' : S.lang === 'ja' ? 'ja-JP' : 'en-GB', { day: 'numeric', month: 'short' });
  function eta(range) { const [a, b] = String(range).split('–').map(Number); if (!b && !a) return t('Today', 'Hari ini', '本日'); return `${dfmt(addDays(a || 0))} – ${dfmt(addDays(b || a))}`; }

  window.HPZ = {
    $, $$, esc, LS, params, debounce, emit, on, CAT, C, ICON, FLAG, PAYM, payIcons, S, mk, cur, isLocal, GEO, setMarket, t, applyI18n,
    money, moneyRaw, fmt, conv, IMG, byId, byH, variant, vByName, partNo, brand, pct, isNew, stockOf, rating, specLine, query,
    swatchBg, colorFamily, isColorOpt, COLOR_FAMILIES, castById, fits, myCast, setGarage, fitTag, shortCast,
    cartItems, cartCount, addToCart, addMany, setQty, removeLine, setAddon, ADDON, totals, toggleWish, pushRecent,
    reveal, splitLines, countUp, countOnView, flyToCart, toast, card, swatches, priceHTML, openQuickAdd, closeQuickAdd,
    wheelSVG, acc, tabs, rail, stars, addDays, dfmt, eta,
    ready(fn) { if (document.readyState !== 'loading') setTimeout(fn, 0); else document.addEventListener('DOMContentLoaded', fn); },
  };
  document.documentElement.lang = S.lang;
})();
