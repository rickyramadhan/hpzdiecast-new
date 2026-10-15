/* ==========================================================================
   HPZ — store chrome: header, mega menu, garage bar, search, drawers,
   market & language switcher, geolocation prompt, quick view, footer.
   Shopify: sections/header-group.json (announcement-bar, header, garage-bar),
   snippets/cart-drawer.liquid, predictive-search, localization-form,
   sections/footer-group.json
   ========================================================================== */
(function () {
  'use strict';
  const H = window.HPZ;
  const { $, $$, esc, t, ICON, FLAG, S, C, money, IMG } = H;

  /* ---------------- logo ---------------- */
  const LOGO = `<svg class="logo-mark" viewBox="0 0 96 34" aria-hidden="true">
    <g transform="skewX(-8)"><rect x="5" y="1" width="28" height="32" rx="2" fill="#e5306b"/><rect x="36" y="1" width="28" height="32" rx="2" fill="#ffb000"/><rect x="67" y="1" width="28" height="32" rx="2" fill="#12a197"/></g>
    <g fill="#fff" font-family="Archivo, sans-serif" font-weight="900" font-size="24" text-anchor="middle" style="font-variation-settings:'wdth' 112"><text x="17" y="25.5">H</text><text x="48" y="25.5">P</text><text x="79" y="25.5">Z</text></g></svg>`;
  const logo = (dark = true) => `<a class="logo ${dark ? '' : 'is-ink'}" href="index.html" aria-label="HPZ Diecast — home">${LOGO}<span class="logo-t"><b>DIECAST</b><i>parts · 1:64</i></span></a>`;

  /* ---------------- nav model (menu: main-menu) ---------------- */
  const count = f => H.query(f).length;
  const NAV = () => [
    { k: 'wheels', l: t('Wheels', 'Velg', 'ホイール'), href: 'shop.html?k=wheels', mega: 'wheels' },
    { k: 'parts', l: t('Parts', 'Parts', 'パーツ'), href: 'shop.html?k=bodykits,engines,exterior,interior', mega: 'parts' },
    { k: 'decals', l: t('Decals', 'Decal', 'デカール'), href: 'shop.html?k=decals' },
    { k: 'brands', l: t('Brands', 'Brand', 'ブランド'), href: 'shop.html', mega: 'brands' },
    { k: 'builds', l: t('Built by You', 'Karya Kalian', 'ビルド'), href: 'builds.html' },
    { k: 'planner', l: t('Build Planner', 'Build Planner', 'ビルドプランナー'), href: 'planner.html', tag: t('New', 'Baru', '新') },
    { k: 'services', l: t('Services', 'Layanan', 'サービス'), href: 'services.html' },
    { k: 'academy', l: t('Academy', 'Academy', 'アカデミー'), href: 'academy.html' },
  ];

  function megaWheels() {
    const dias = [[8.5, '8.5'], [9.5, '9.5'], [10, '10'], [12, '12']];
    const styles = Object.entries(C.STYLES);
    const brands = ['hpz', 'jv', 'sakura', 'turbo', 'carlomo', 'rebel', 'mc23'];
    const pick = H.query({ k: 'wheels', own: 1, avail: 1, sort: 'new' })[0];
    return `<div class="mega-in wrap">
      <div class="mega-col"><h6>${t('By diameter', 'Diameter', '径で選ぶ')}</h6>
        <div class="mega-dia">${dias.map(([d, l]) => `<a href="shop.html?k=wheels&dia=${d}"><b>${l}</b><span>mm</span><em>${count({ k: 'wheels', dia: d })}</em></a>`).join('')}</div>
        <a class="mega-tool" href="planner.html">${ICON.ruler}<span><b>${t('Not sure what fits?', 'Bingung ukuran?', 'サイズが不明？')}</b>${t('Use the fitment finder', 'Pakai fitment finder', 'フィットメント検索')}</span>${ICON.arrow}</a>
      </div>
      <div class="mega-col"><h6>${t('By style', 'Gaya', 'スタイル')}</h6><ul>${styles.map(([k, n]) => `<li><a href="shop.html?k=wheels&s=${k}">${n}<em>${count({ k: 'wheels', s: k })}</em></a></li>`).join('')}
        <li><a href="shop.html?k=wheels&feat=bearing">${t('Bearing series', 'Seri bearing', 'ベアリング')}<em>${count({ k: 'wheels', feat: 'bearing' })}</em></a></li>
        <li><a href="shop.html?k=wheels&feat=disc">${t('With disc brake', 'Dengan disc brake', 'ディスク付')}<em>${count({ k: 'wheels', feat: 'disc' })}</em></a></li></ul></div>
      <div class="mega-col"><h6>${t('By maker', 'Pabrikan', 'メーカー')}</h6><ul>${brands.map(b => `<li><a href="shop.html?k=wheels&b=${b}">${C.BRANDS[b].n}${C.BRANDS[b].own ? '<i class="own">HPZ</i>' : ''}<em>${count({ k: 'wheels', b })}</em></a></li>`).join('')}</ul></div>
      <div class="mega-col mega-lab">
        <div class="mega-wheel">${H.wheelSVG({ spokes: 6, finish: 'gold' })}</div>
        <div><span class="eyebrow"><b>${t('Latest drop', 'Rilis terbaru', '最新')}</b></span>
        ${pick ? `<a class="mega-pick" href="product.html?h=${pick.h}"><img src="${IMG(pick.img[0], 300)}" alt=""><span><b>${esc(pick.t)}</b><em>${money(pick.p)}</em></span></a>` : ''}
        <a class="arrow-link" href="shop.html?k=wheels&own=1">${t('All HPZ Originals', 'Semua HPZ Original', 'HPZオリジナル一覧')} ${ICON.arrow}</a></div>
      </div></div>`;
  }
  function megaParts() {
    const groups = [['bodykits', ICON.layers], ['engines', ICON.bolt], ['exterior', ICON.spark], ['interior', ICON.car], ['dioramas', ICON.box]];
    const feat = ['hpz-add-on-body-kit-for-hot-wheels-r34-v-spec', 'parvus-models-miniatur-mesin-toyota-2jz-gte', 'jv-accessories-voltex-wing'].map(H.byH).filter(Boolean);
    return `<div class="mega-in wrap mega-parts">
      <div class="mega-cats">${groups.map(([k, ic]) => `<a href="shop.html?k=${k}"><span class="mc-ic">${ic}</span><span><b>${C.CATS[k].n}</b><em>${count({ k })} ${t('parts', 'item', '点')}</em></span>${ICON.arrow}</a>`).join('')}</div>
      <div class="mega-feat">${feat.map(p => `<a href="product.html?h=${p.h}"><img src="${IMG(p.img[0], 400)}" alt=""><span class="mono">${H.partNo(p)}</span><b>${esc(p.t)}</b><em>${money(p.p)}</em></a>`).join('')}</div></div>`;
  }
  function megaBrands() {
    return `<div class="mega-in wrap"><div class="mega-brands">${Object.entries(C.BRANDS).map(([k, b]) => `<a href="shop.html?b=${k}"><span class="mb-code mono">${b.code}</span><b>${b.n}</b><em>${count({ b: k })} ${t('products', 'produk', '商品')}</em><p>${esc(b.note)}</p></a>`).join('')}</div></div>`;
  }

  /* ---------------- header ---------------- */
  function marketBtn(cls = '') {
    const m = H.mk();
    return `<button class="mkt-btn ${cls}" data-open="market" aria-label="${t('Change region and language', 'Ganti negara & bahasa', '地域と言語')}">${FLAG[m.flag]}<span>${S.lang.toUpperCase()} · ${m.cur}</span>${ICON.down}</button>`;
  }
  function renderHeader() {
    const host = $('#hpz-header'); if (!host) return;
    const m = H.mk();
    const msgs = [
      H.isLocal() ? t('Free shipping across Indonesia over', 'Gratis ongkir se-Indonesia min.', 'インドネシア国内送料無料') + ' ' + money(m.free, { short: 1 })
        : t('Free tracked shipping over', 'Gratis ongkir internasional min.', '送料無料 — ') + ' ' + money(m.free, { short: 1 }),
      m.duty ? t('US orders: duties prepaid at checkout — no surprise fees', 'Pesanan US: bea masuk dibayar di checkout', '米国：関税は決済時に前払い') : t('Ships from our Semarang workshop within 24 h', 'Dikirim dari workshop Semarang dalam 24 jam', 'スマランの工房から24時間以内に発送'),
      t('Every wheel set is checked and bagged by hand', 'Setiap set velg dicek & dikemas manual', '全セット手作業で検品・梱包'),
    ];
    host.innerHTML = `
    <div class="topbar"><div class="wrap topbar-in">
      <div class="tb-msgs" aria-live="off">${msgs.map((s, i) => `<span class="${i ? '' : 'is-on'}">${esc(s)}</span>`).join('')}</div>
      <nav class="tb-links">
        <a href="account.html#orders">${ICON.truck}<span>${t('Track order', 'Lacak pesanan', '注文追跡')}</span></a>
        <a href="services.html#help">${ICON.chat}<span>${t('Help', 'Bantuan', 'ヘルプ')}</span></a>
        ${marketBtn()}
      </nav></div></div>
    <div class="hdr"><div class="wrap hdr-in">
      <button class="hdr-burger" data-open="menu" aria-label="Menu">${ICON.menu}</button>
      ${logo()}
      <nav class="nav" aria-label="Main">${NAV().map(n => `<div class="nav-i ${n.mega ? 'has-mega' : ''}" ${n.mega ? `data-mega="${n.mega}"` : ''}><a href="${n.href}" class="${document.body.dataset.nav === n.k ? 'is-cur' : ''}">${n.l}${n.tag ? `<sup>${n.tag}</sup>` : ''}${n.mega ? ICON.down : ''}</a></div>`).join('')}</nav>
      <div class="hdr-act">
        <button class="hdr-search" data-open="search">${ICON.search}<span>${t('Search parts, castings…', 'Cari parts, casting…', 'パーツ・車種を検索…')}</span><kbd>/</kbd></button>
        <button class="hdr-ic hdr-s-m" data-open="search" aria-label="Search">${ICON.search}</button>
        <a class="hdr-ic" href="account.html" aria-label="Account">${ICON.user}</a>
        <button class="hdr-ic" data-open="wish" aria-label="Wishlist">${ICON.heart}<i class="cnt" id="hdr-wish-n" ${S.wish.length ? '' : 'hidden'}>${S.wish.length}</i></button>
        <button class="hdr-ic hdr-cart" id="hdr-cart" data-open="cart" aria-label="Cart">${ICON.cart}<i class="cnt" id="hdr-cart-n" ${H.cartCount() ? '' : 'hidden'}><span>${H.cartCount()}</span></i></button>
      </div></div>
      <div class="mega" id="mega" aria-hidden="true"><div class="mega-panel" data-panel="wheels"></div><div class="mega-panel" data-panel="parts"></div><div class="mega-panel" data-panel="brands"></div></div>
    </div>
    ${document.body.dataset.garagebar === 'off' ? '' : `<div class="gbar"><div class="wrap gbar-in" id="gbar"></div></div>`}`;
    renderGarageBar();
    // rotate announcement
    const spans = $$('.tb-msgs span', host); let i = 0;
    clearInterval(renderHeader.tm); renderHeader.tm = setInterval(() => { spans[i].classList.remove('is-on'); i = (i + 1) % spans.length; spans[i].classList.add('is-on'); }, 4200);
    bindMega();
  }

  function cutoff() { // same-day dispatch cut-off 15:00 WIB (UTC+7)
    const now = new Date(); const wib = new Date(now.getTime() + (now.getTimezoneOffset() + 420) * 60000);
    const cut = new Date(wib); cut.setHours(15, 0, 0, 0);
    const day = wib.getDay();
    if (day === 0 || wib >= cut) return null;
    const ms = cut - wib; return { h: Math.floor(ms / 36e5), m: Math.floor(ms % 36e5 / 6e4) };
  }
  function renderGarageBar() {
    const el = $('#gbar'); if (!el) return;
    const c = H.myCast(), co = cutoff();
    el.innerHTML = `<div class="gb-l">${ICON.car}
      ${c ? `<span class="gb-k">${t('My garage', 'Garasi saya', 'マイガレージ')}</span><button class="gb-cast" data-open="garage"><b>${esc(c.n)}</b><span>${esc(c.mk)} · Ø${c.dia} mm</span>${ICON.down}</button><span class="gb-note">${t('Parts that fit are tagged', 'Parts yang pas ditandai', '適合パーツに表示')} <i class="fit-dot"></i></span>`
        : `<span class="gb-k">${t('What are you building?', 'Lagi bangun apa?', '何を作っていますか？')}</span><button class="gb-add" data-open="garage">${ICON.plus}${t('Add your casting', 'Tambah casting', '車種を追加')}</button><span class="gb-note">${t('We will tag wheels, decals and kits that fit it.', 'Kami tandai velg, decal & kit yang pas.', '適合するパーツを表示します。')}</span>`}
    </div>
    <div class="gb-r">${co ? `${ICON.clock}<span>${t('Order within', 'Pesan dalam', 'あと')} <b class="mono">${co.h}h ${String(co.m).padStart(2, '0')}m</b> ${t('for same-day dispatch', 'untuk kirim hari ini', 'で当日発送')}</span>` : `${ICON.truck}<span>${t('Next dispatch', 'Pengiriman berikutnya', '次回発送')}: <b>${H.dfmt(H.addDays(1))}</b>, 15:00 WIB</span>`}</div>`;
  }

  /* ---------------- mega ---------------- */
  function bindMega() {
    const mega = $('#mega'); if (!mega) return;
    const built = {};
    let tm;
    const open = k => {
      clearTimeout(tm);
      const panel = $(`[data-panel="${k}"]`, mega);
      if (!built[k]) { panel.innerHTML = k === 'wheels' ? megaWheels() : k === 'parts' ? megaParts() : megaBrands(); built[k] = 1; }
      $$('.mega-panel', mega).forEach(p => p.classList.toggle('is-on', p === panel));
      $$('.nav-i').forEach(n => n.classList.toggle('is-hot', n.dataset.mega === k));
      mega.classList.add('is-open'); mega.setAttribute('aria-hidden', 'false');
      mega.style.height = panel.offsetHeight + 'px';
    };
    const close = () => { tm = setTimeout(() => { mega.classList.remove('is-open'); mega.style.height = '0px'; mega.setAttribute('aria-hidden', 'true'); $$('.nav-i').forEach(n => n.classList.remove('is-hot')); }, 140); };
    $$('.nav-i').forEach(n => {
      n.addEventListener('mouseenter', () => n.dataset.mega ? open(n.dataset.mega) : close());
      n.addEventListener('mouseleave', close);
    });
    mega.addEventListener('mouseenter', () => clearTimeout(tm));
    mega.addEventListener('mouseleave', close);
  }

  /* hide header on scroll down, show on scroll up */
  function stickyHeader() {
    const host = $('#hpz-header'); if (!host) return; let last = 0, ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY; host.classList.toggle('is-scrolled', y > 40);
        host.classList.toggle('is-hidden', y > 260 && y > last && !document.body.classList.contains('is-locked') && !$('#mega.is-open'));
        last = y; ticking = false;
      });
    }, { passive: true });
  }

  /* ---------------- overlay / drawers ---------------- */
  function ensureShell() {
    if ($('#shell')) return;
    const d = document.createElement('div'); d.id = 'shell';
    d.innerHTML = `
      <div class="scrim" data-close></div>
      <aside class="drawer" id="d-cart" aria-label="Cart" role="dialog" aria-modal="true"></aside>
      <aside class="drawer" id="d-wish" aria-label="Wishlist" role="dialog" aria-modal="true"></aside>
      <aside class="drawer is-left" id="d-menu" aria-label="Menu" role="dialog" aria-modal="true"></aside>
      <div class="search" id="search" role="dialog" aria-modal="true" aria-label="Search"></div>
      <div class="modal" id="m-market" role="dialog" aria-modal="true"><div class="modal-box" id="market-box"></div></div>
      <div class="modal" id="m-garage" role="dialog" aria-modal="true"><div class="modal-box is-wide" id="garage-box"></div></div>
      <div class="modal" id="m-quick" role="dialog" aria-modal="true"><div class="modal-box is-xl" id="quick-box"></div></div>
      <div class="modal" id="m-notify" role="dialog" aria-modal="true"><div class="modal-box is-sm" id="notify-box"></div></div>
      <div class="geo" id="geo" hidden></div>`;
    document.body.appendChild(d);
  }
  let openEl = null;
  function closeAll() {
    $$('.drawer.is-open, .modal.is-open, .search.is-open').forEach(e => e.classList.remove('is-open'));
    $('.scrim') && $('.scrim').classList.remove('is-on');
    document.body.classList.remove('is-locked'); openEl = null;
  }
  function lock(el, scrim = true) {
    closeAll(); el.classList.add('is-open'); openEl = el;
    if (scrim) $('.scrim').classList.add('is-on');
    document.body.classList.add('is-locked');
  }
  function openDrawer(k) {
    ensureShell();
    if (k === 'cart') { renderCart(); lock($('#d-cart')); }
    else if (k === 'wish') { renderWish(); lock($('#d-wish')); }
    else if (k === 'menu') { renderMenu(); lock($('#d-menu')); }
  }
  function openModal(k) {
    ensureShell();
    if (k === 'market') { renderMarket(); lock($('#m-market')); }
    if (k === 'garage') { renderGaragePicker(); lock($('#m-garage')); setTimeout(() => $('#g-q') && $('#g-q').focus(), 200); }
    if (k === 'search') openSearch();
  }

  /* ---------------- cart drawer ---------------- */
  // tachometer: needle = progress to free shipping, redline = unlocked
  function tach(ratio, done) {
    const a0 = -120, a1 = 120, a = a0 + (a1 - a0) * Math.min(1, ratio);
    const ticks = Array.from({ length: 41 }, (_, i) => {
      const an = (a0 + i * 6) * Math.PI / 180, big = i % 5 === 0, r1 = big ? 30 : 33, r2 = 37;
      const red = i >= 34;
      return `<line x1="${50 + r1 * Math.sin(an)}" y1="${50 - r1 * Math.cos(an)}" x2="${50 + r2 * Math.sin(an)}" y2="${50 - r2 * Math.cos(an)}" stroke="${red ? '#e5306b' : (i / 40 <= ratio ? '#0e0f11' : '#c9c6bf')}" stroke-width="${big ? 1.6 : .8}"/>`;
    }).join('');
    const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => { const an = (a0 + i * 30) * Math.PI / 180; return `<text x="${50 + 23 * Math.sin(an)}" y="${50 - 23 * Math.cos(an) + 2.5}" font-size="6.5" text-anchor="middle" fill="${i >= 7 ? '#e5306b' : '#7a7f87'}" font-family="JetBrains Mono">${n}</text>`; }).join('');
    return `<svg class="tach ${done ? 'is-red' : ''}" viewBox="0 0 100 66" aria-hidden="true">${ticks}${nums}
      <g class="tach-needle" style="--a:${a}deg"><path d="M50 50 L49 20 L50 15 L51 20 Z" fill="#e5306b"/><circle cx="50" cy="50" r="4.2" fill="#0e0f11"/><circle cx="50" cy="50" r="1.5" fill="#e5306b"/></g>
      <text x="50" y="63" font-size="5" text-anchor="middle" fill="#7a7f87" font-family="JetBrains Mono" letter-spacing=".6">×1000 r/min</text></svg>`;
  }
  function cartLine(l, compact = true) {
    const p = l.p, v = l.v;
    return `<li class="cl" data-vid="${v.id}">
      <a class="cl-img" href="product.html?h=${p.h}"><img src="${IMG(p.img[v.i > -1 ? v.i : 0], 200)}" alt=""></a>
      <div class="cl-main">
        <div class="cl-top"><div><span class="cl-brand">${esc(H.brand(p).n)} · <span class="mono">${H.partNo(p)}</span></span><a class="cl-t" href="product.html?h=${p.h}">${esc(p.t)}</a>
        ${v.n ? `<span class="cl-v">${H.swatchBg(v.n) ? `<i style="--c:${H.swatchBg(v.n)}"></i>` : ''}${esc(v.n)}</span>` : ''}${l.bundle ? `<span class="cl-bundle">${ICON.layers} ${t('Build bundle −10%', 'Bundle build −10%', 'ビルドセット −10%')}</span>` : ''}</div>
        <button class="cl-x" data-rm="${v.id}" aria-label="${t('Remove', 'Hapus', '削除')}">${ICON.trash}</button></div>
        <div class="cl-bot"><div class="qty qty-sm"><button data-q="-1" aria-label="−">${ICON.minus}</button><input value="${l.q}" inputmode="numeric" aria-label="Qty" data-qi><button data-q="1" aria-label="+">${ICON.plus}</button></div>
        <span class="cl-p">${v.c ? `<s>${money(v.c * l.q)}</s>` : ''}<b>${money(l.line)}</b></span></div>
      </div></li>`;
  }
  function freeBlock(T) {
    const done = T.toFree <= 0, ratio = T.free ? (T.sub - T.bundle) / T.free : 1;
    return `<div class="free ${done ? 'is-done' : ''}">${tach(ratio, done)}<div class="free-t">
      ${done ? `<b>${t('Free shipping unlocked', 'Gratis ongkir aktif', '送料無料達成')}</b><span>${t('Redline reached. Tracked shipping is on us.', 'Sudah redline. Ongkir kami tanggung.', 'レッドライン到達。送料は当店負担。')}</span>`
        : `<b><span class="mono">${money(T.toFree)}</span> ${t('to free shipping', 'lagi untuk gratis ongkir', 'で送料無料')}</b><span>${t('Rev it up — add a decal or a set of tyres.', 'Tambah decal atau ban untuk mencapai redline.', 'デカールやタイヤを追加しましょう。')}</span>`}
    </div></div>`;
  }
  function upsell(T) {
    const inCart = new Set(T.items.map(l => l.p.id));
    const cast = H.myCast();
    let pool = H.query({ k: 'decals', avail: 1 }).filter(p => !inCart.has(p.id));
    if (cast) pool = pool.sort((a, b) => (cast.m.test(b.full) - cast.m.test(a.full)));
    const lowRev = H.query({ avail: 1, max: Math.max(6, T.toFree + 2), sort: 'best' }).filter(p => !inCart.has(p.id) && p.k !== 'wheels');
    const list = [...pool.slice(0, 2), ...lowRev.slice(0, 4)].filter((p, i, a) => a.indexOf(p) === i).slice(0, 5);
    if (!list.length) return '';
    return `<div class="ups"><div class="ups-h"><b>${t('Finish the build', 'Lengkapi build', 'ビルドを仕上げる')}</b><span class="mono xs muted">${t('small parts, big difference', 'part kecil, efek besar', '')}</span></div>
      <div class="ups-r">${list.map(p => `<div class="ups-i"><a href="product.html?h=${p.h}"><img src="${IMG(p.img[0], 160)}" alt=""></a><div><a href="product.html?h=${p.h}">${esc(p.t)}</a><span>${money(p.p)}</span></div><button class="btn-icon btn btn-ghost" data-uadd="${p.id}" aria-label="Add">${ICON.plus}</button></div>`).join('')}</div></div>`;
  }
  function renderCart() {
    const el = $('#d-cart'); if (!el) return;
    const T = H.totals(); const m = H.mk();
    el.innerHTML = `<div class="dr-h"><h3>${t('Cart', 'Keranjang', 'カート')} <span class="mono">(${T.count})</span></h3><button class="dr-x" data-close aria-label="Close">${ICON.close}</button></div>
    ${T.items.length ? `
      ${freeBlock(T)}
      <div class="dr-body"><ul class="cl-list">${T.items.map(l => cartLine(l)).join('')}</ul>
      <div class="addons">
        ${Object.entries(H.ADDON).map(([k, a]) => `<label class="addon"><span class="switch"><input type="checkbox" data-addon="${k}" ${S.addons[k] ? 'checked' : ''}><span></span></span><span class="addon-t"><b>${a.n()}</b><em>${k === 'box' ? t('Hard case instead of padded mailer', 'Hard case, bukan bubble mailer', '') : t('Lost or damaged? Re-shipped free', 'Hilang/rusak? Kirim ulang gratis', '')}</em></span><span class="mono">+${money(a.usd)}</span></label>`).join('')}
      </div>
      ${upsell(T)}</div>
      <div class="dr-f">
        ${T.save > 0 ? `<div class="dr-row is-save"><span>${t('You save', 'Hemat', '割引')}</span><span>−${money(T.save)}</span></div>` : ''}
        <div class="dr-row is-sub"><span>${t('Subtotal', 'Subtotal', '小計')}</span><b class="mono">${money(T.sub - T.bundle + T.add)}</b></div>
        <p class="dr-note">${m.duty ? t('Import duties for the US are calculated and prepaid at checkout (DDP).', 'Bea masuk US dihitung & dibayar di checkout (DDP).', '米国の関税は決済時に計算・前払い。') : H.isLocal() ? t('Shipping calculated at checkout. Pay with QRIS, VA or e-wallet.', 'Ongkir dihitung di checkout. Bayar via QRIS, VA, e-wallet.', '') : t('Shipping and taxes calculated at checkout.', 'Ongkir & pajak dihitung di checkout.', '送料・税は決済時に計算。')}</p>
        <a class="btn btn-signal btn-lg btn-block" href="checkout.html">${ICON.lock}<span>${t('Checkout', 'Checkout', 'ご購入手続き')} · ${money(T.sub - T.bundle + T.add)}</span></a>
        <div class="dr-f2"><a class="link small" href="cart.html">${t('View full cart', 'Lihat keranjang', 'カートを見る')}</a>${H.payIcons(m.pay.slice(0, 5))}</div>
      </div>`
      : `<div class="dr-empty">${H.wheelSVG({ spokes: 5, finish: 'gunmet', style: 'spoke' })}<h4>${t('Your cart is empty', 'Keranjang masih kosong', 'カートは空です')}</h4><p>${t('Start with wheels — the fastest way to transform a casting.', 'Mulai dari velg — cara tercepat mengubah tampilan casting.', 'まずはホイールから。')}</p>
        <div class="dr-empty-l"><a class="btn btn-ink" href="shop.html?k=wheels">${t('Shop wheels', 'Belanja velg', 'ホイールを見る')}</a><a class="btn btn-ghost" href="shop.html?k=decals">${t('Browse decals', 'Lihat decal', 'デカールを見る')}</a></div></div>`}`;
    // animate needle from 0
    const nd = $('.tach-needle', el); if (nd) { const a = nd.style.getPropertyValue('--a'); nd.style.setProperty('--a', renderCart.lastA || '-120deg'); requestAnimationFrame(() => requestAnimationFrame(() => nd.style.setProperty('--a', a))); renderCart.lastA = a; }
  }
  function renderWish() {
    const el = $('#d-wish'); const list = S.wish.map(H.byId).filter(Boolean);
    el.innerHTML = `<div class="dr-h"><h3>${t('Wishlist', 'Wishlist', 'ウィッシュリスト')} <span class="mono">(${list.length})</span></h3><button class="dr-x" data-close aria-label="Close">${ICON.close}</button></div>
    ${list.length ? `<div class="dr-body"><ul class="wl">${list.map(p => `<li><a href="product.html?h=${p.h}"><img src="${IMG(p.img[0], 200)}" alt=""></a><div><span class="cl-brand">${esc(H.brand(p).n)}</span><a class="cl-t" href="product.html?h=${p.h}">${esc(p.t)}</a>${H.priceHTML(p)}
      <div class="wl-a">${p.a ? `<button class="btn btn-sm btn-ink" data-qadd-w="${p.id}">${t('Add to cart', 'Tambah', '追加')}</button>` : `<button class="btn btn-sm btn-ghost" data-notify="${p.id}">${ICON.bell}${t('Notify', 'Kabari', '通知')}</button>`}<button class="link xs" data-wish="${p.id}">${t('Remove', 'Hapus', '削除')}</button></div></div></li>`).join('')}</ul></div>
      <div class="dr-f"><p class="dr-note">${t('Wishlist is saved to this browser. Sign in to sync and get restock alerts.', 'Wishlist tersimpan di browser ini. Login untuk sinkron & notifikasi restock.', '')}</p></div>`
      : `<div class="dr-empty">${ICON.heart}<h4>${t('Nothing saved yet', 'Belum ada yang disimpan', 'まだ保存がありません')}</h4><p>${t('Tap the heart on any part to keep it here.', 'Tekan ikon hati untuk menyimpan.', '')}</p></div>`}`;
  }
  function renderMenu() {
    const el = $('#d-menu');
    el.innerHTML = `<div class="dr-h">${logo()}<button class="dr-x" data-close aria-label="Close">${ICON.close}</button></div>
    <div class="dr-body mm">
      <button class="mm-search" data-open="search">${ICON.search}${t('Search parts, castings…', 'Cari parts, casting…', '検索…')}</button>
      ${NAV().map(n => `<a class="mm-a" href="${n.href}">${n.l}${n.tag ? `<sup>${n.tag}</sup>` : ''}${ICON.right}</a>`).join('')}
      <div class="mm-sub"><a href="account.html">${ICON.user}${t('Account', 'Akun', 'アカウント')}</a><a href="account.html#orders">${ICON.truck}${t('Track order', 'Lacak pesanan', '注文追跡')}</a><a href="services.html#help">${ICON.chat}${t('Help', 'Bantuan', 'ヘルプ')}</a></div>
      ${marketBtn('is-block')}
    </div>`;
  }

  /* ---------------- market & language ---------------- */
  function renderMarket() {
    const box = $('#market-box');
    let sel = S.market, lang = S.lang;
    const draw = () => {
      box.innerHTML = `<button class="modal-x" data-close aria-label="Close">${ICON.close}</button>
      <div class="mk-h"><span class="eyebrow"><b>${t('Region', 'Wilayah', '地域')}</b></span><h3 class="h3">${t('Where should we ship?', 'Dikirim ke mana?', 'お届け先は？')}</h3><p class="small muted">${t('Prices, shipping methods, duties and payment options update for your region.', 'Harga, ongkir, bea masuk dan metode bayar menyesuaikan wilayah.', '価格・配送・関税・決済方法が地域に合わせて更新されます。')}</p></div>
      <div class="mk-grid">${Object.entries(C.MARKETS).map(([k, m]) => `<button class="mk-i ${k === sel ? 'is-on' : ''}" data-mk="${k}">${FLAG[m.flag]}<span><b>${m.n}</b><em class="mono">${m.cur} ${C.CURRENCIES[m.cur].s}</em></span>${m.local ? `<i class="mk-tag">${t('Local', 'Lokal', '国内')}</i>` : ''}${m.duty ? `<i class="mk-tag">DDP</i>` : ''}<span class="mk-r"></span></button>`).join('')}</div>
      <div class="mk-lang"><span class="lbl">${t('Language', 'Bahasa', '言語')}</span><div class="seg">${Object.entries(C.LANGS).map(([k, n]) => `<button class="${k === lang ? 'is-on' : ''}" data-lg="${k}">${n}</button>`).join('')}</div></div>
      <div class="mk-f"><span class="xs muted">${t('Sample price', 'Contoh harga', '価格例')}: <b class="mono" id="mk-sample"></b></span><button class="btn btn-ink" id="mk-save">${t('Save & continue', 'Simpan', '保存')}</button></div>`;
      const c = C.CURRENCIES[C.MARKETS[sel].cur]; $('#mk-sample').textContent = H.fmt(H.conv(13.5, c), c) + ' — HPZ Wheels SIX';
      $$('[data-mk]', box).forEach(b => b.onclick = () => { sel = b.dataset.mk; if (C.MARKETS[sel].lang && lang === 'en' && sel === 'ID') lang = 'id'; draw(); });
      $$('[data-lg]', box).forEach(b => b.onclick = () => { lang = b.dataset.lg; draw(); });
      $('#mk-save').onclick = () => {
        closeAll(); H.setMarket(sel, lang);
        H.toast({ title: t('Region updated', 'Wilayah diperbarui', '地域を更新しました'), sub: `${C.MARKETS[sel].n} · ${C.MARKETS[sel].cur} · ${C.LANGS[lang]}`, icon: FLAG[C.MARKETS[sel].flag] });
      };
    };
    draw();
  }
  function geoPrompt() {
    if (S.geoAsked || H.GEO === S.market || H.params().has('static')) return;
    ensureShell();
    const g = H.GEO, m = C.MARKETS[g]; const el = $('#geo');
    el.innerHTML = `${FLAG[m.flag]}<div><b>${t('Shopping from', 'Belanja dari', 'ご利用地域：')} ${m.n}?</b><span>${t('See prices in', 'Lihat harga dalam', '表示通貨')} ${m.cur}${m.duty ? t(', duties prepaid', ', bea masuk prabayar', '、関税前払い') : ''}${m.local ? t(', local couriers & QRIS', ', kurir lokal & QRIS', '') : ''}.</span>
      <div class="geo-a"><button class="btn btn-sm btn-signal" data-geo="yes">${t('Switch to', 'Ganti ke', '切替')} ${m.cur}</button><button class="btn btn-sm btn-line on-dark" data-geo="no">${t('Stay in', 'Tetap', 'そのまま')} ${H.mk().cur}</button></div></div>`;
    setTimeout(() => { el.hidden = false; requestAnimationFrame(() => el.classList.add('is-in')); }, 1600);
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-geo]'); if (!b) return;
      S.geoAsked = true; H.LS.set('geoAsked', true); el.classList.remove('is-in'); setTimeout(() => el.hidden = true, 400);
      if (b.dataset.geo === 'yes') H.setMarket(g, m.lang);
    });
  }

  /* ---------------- garage picker ---------------- */
  function renderGaragePicker() {
    const box = $('#garage-box'); let mkr = 'all', q = '';
    const makers = ['all', ...new Set(C.CASTINGS.map(c => c.mk))];
    const draw = () => {
      const list = C.CASTINGS.filter(c => (mkr === 'all' || c.mk === mkr) && (!q || (c.n + ' ' + c.mk).toLowerCase().includes(q.toLowerCase())));
      $('#g-list').innerHTML = list.map(c => {
        const n = H.CAT.filter(p => ['decals', 'bodykits', 'engines'].includes(p.k) && c.m.test(p.full)).length;
        return `<button class="g-i ${S.garage[0] === c.id ? 'is-on' : ''}" data-cast="${c.id}"><span class="g-sil">${silhouette(c.body)}</span><span><b>${esc(c.n)}</b><em>${esc(c.mk)} · ${c.yr}</em></span><span class="g-sp mono">Ø${c.dia}<small>mm</small></span><span class="g-n">${n ? `${n} ${t('made-for parts', 'part khusus', '専用パーツ')}` : t('wheels only', 'velg saja', 'ホイールのみ')}</span></button>`;
      }).join('') || `<p class="muted small" style="padding:20px">${t('No casting found. Request it below — we add new castings every month.', 'Casting tidak ada. Request di bawah.', '')}</p>`;
      $$('#g-tabs button').forEach(b => b.classList.toggle('is-on', b.dataset.m === mkr));
    };
    box.innerHTML = `<button class="modal-x" data-close aria-label="Close">${ICON.close}</button>
      <div class="g-h"><span class="eyebrow"><b>${t('My garage', 'Garasi saya', 'マイガレージ')}</b></span><h3 class="h3">${t('Which casting are you building?', 'Casting apa yang sedang kamu bangun?', 'どの車種を作りますか？')}</h3>
      <div class="g-s">${ICON.search}<input id="g-q" class="input" placeholder="${t('Search: R34, Civic, Supra…', 'Cari: R34, Civic, Supra…', '検索：R34、シビック…')}"></div>
      <div class="g-tabs" id="g-tabs">${makers.map(m => `<button data-m="${m}">${m === 'all' ? t('All', 'Semua', 'すべて') : m}</button>`).join('')}</div></div>
      <div class="g-list" id="g-list"></div>
      <div class="g-f"><span class="xs muted">${t('Fitment data is measured on our own castings. Missing yours?', 'Data fitment diukur dari casting kami sendiri. Tidak ada?', '')} <a class="link" href="services.html#request">${t('Request a casting', 'Request casting', '車種をリクエスト')}</a></span>${S.garage[0] ? `<button class="link xs" id="g-clear">${t('Clear garage', 'Kosongkan', 'クリア')}</button>` : ''}</div>`;
    draw();
    $('#g-q').addEventListener('input', e => { q = e.target.value; draw(); });
    $('#g-tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { mkr = b.dataset.m; draw(); } });
    $('#g-list').addEventListener('click', e => {
      const b = e.target.closest('[data-cast]'); if (!b) return; const c = H.castById(b.dataset.cast);
      H.setGarage(c.id); closeAll();
      H.toast({ title: t('Garage set', 'Garasi diset', 'ガレージ設定'), sub: `${c.n} — ${t('fitment tags are on', 'tag fitment aktif', '適合表示オン')}`, icon: ICON.car });
    });
    $('#g-clear') && ($('#g-clear').onclick = () => { S.garage = []; H.LS.set('garage', []); closeAll(); H.emit('garage', null); });
  }
  // side profiles, 200×70, wheels at x=48 / x=152, ground y=62
  const SIL = {
    coupe: 'M14 50 L16 40 Q24 36 46 34 L70 22 Q92 16 120 18 L146 30 Q176 33 186 40 L188 50 Z',
    hatch: 'M14 50 L15 38 Q20 34 40 32 L62 18 Q90 14 150 17 L168 32 Q182 35 186 42 L188 50 Z',
    sedan: 'M12 50 L14 40 Q22 35 44 33 L68 21 Q96 17 126 19 L148 31 Q178 33 188 40 L190 50 Z',
    truck: 'M10 50 L11 34 Q14 30 30 30 L52 30 L58 14 L96 14 L102 30 L190 30 L191 50 Z',
  };
  // side windows for the large stage renders
  const SILW = {
    coupe: 'M74 23.5 Q94 18.6 118 20 L140 30.5 L68 31.5 Z',
    hatch: 'M65 20.5 Q90 16.6 146 19 L159 31 L59 31.5 Z',
    sedan: 'M71 22.5 Q96 19 124 21 L144 31.5 L65 32.5 Z',
    truck: 'M60 16.5 L94 16.5 L99 29 L55 29 Z',
  };
  function silhouette(body, o = {}) {
    const p = SIL[body] || SIL.coupe;
    return `<svg viewBox="0 0 200 70" aria-hidden="true"><path d="${p}" fill="currentColor"/><circle cx="48" cy="52" r="10" fill="currentColor" stroke="var(--sil-bg,#fff)" stroke-width="2.5"/><circle cx="152" cy="52" r="10" fill="currentColor" stroke="var(--sil-bg,#fff)" stroke-width="2.5"/></svg>`;
  }

  /* ---------------- search (predictive) ---------------- */
  const POPULAR = ['TE37', 'BBS', 'R34', 'Civic', 'decal', '9.5mm', 'bearing', 'Supra', 'engine'];
  function openSearch(q0 = '') {
    ensureShell(); const el = $('#search');
    el.innerHTML = `<div class="sr-top"><div class="wrap sr-in">${ICON.search}<input id="sr-q" placeholder="${t('Search 490 parts — try “TE37 gold”, “R34 decal”, “9.5mm”', 'Cari 490 parts — coba “TE37 gold”, “R34 decal”', '490点から検索 — 例「TE37 ゴールド」')}" autocomplete="off" value="${esc(q0)}"><kbd>esc</kbd><button class="dr-x" data-close aria-label="Close">${ICON.close}</button></div></div>
      <div class="sr-body"><div class="wrap" id="sr-res"></div></div>`;
    lock(el); const inp = $('#sr-q'); setTimeout(() => inp.focus(), 60);
    let sel = -1;
    const draw = () => {
      const q = inp.value.trim(); const res = $('#sr-res');
      if (!q) {
        const rec = S.recent.map(H.byId).filter(Boolean).slice(0, 6);
        res.innerHTML = `<div class="sr-cols"><div><h6>${t('Popular searches', 'Pencarian populer', '人気の検索')}</h6><div class="sr-chips">${POPULAR.map(p => `<button class="chip" data-sq="${p}">${p}</button>`).join('')}</div>
          <h6>${t('Shop by category', 'Kategori', 'カテゴリー')}</h6><div class="sr-cats">${Object.entries(C.CATS).map(([k, c]) => `<a href="shop.html?k=${k}">${c.n}<em class="mono">${H.query({ k }).length}</em></a>`).join('')}</div></div>
          <div>${rec.length ? `<h6>${t('Recently viewed', 'Terakhir dilihat', '最近見た商品')}</h6><div class="sr-grid">${rec.map(p => srItem(p)).join('')}</div>` : `<h6>${t('Trending this week', 'Trending minggu ini', '今週のトレンド')}</h6><div class="sr-grid">${H.query({ own: 1, avail: 1, sort: 'new' }).slice(0, 6).map(p => srItem(p)).join('')}</div>`}</div></div>`;
        return;
      }
      const prods = H.query({ q }); const casts = C.CASTINGS.filter(c => c.n.toLowerCase().includes(q.toLowerCase())).slice(0, 4);
      const brands = Object.entries(C.BRANDS).filter(([, b]) => b.n.toLowerCase().includes(q.toLowerCase()));
      res.innerHTML = `<div class="sr-cols"><div>
          ${casts.length ? `<h6>${t('Castings', 'Casting', '車種')}</h6><div class="sr-links">${casts.map(c => `<a href="shop.html?cast=${c.id}">${ICON.car}<span>${hl(c.n, q)} <em>${c.mk}</em></span></a>`).join('')}</div>` : ''}
          ${brands.length ? `<h6>${t('Brands', 'Brand', 'ブランド')}</h6><div class="sr-links">${brands.map(([k, b]) => `<a href="shop.html?b=${k}">${ICON.tag}<span>${hl(b.n, q)}</span></a>`).join('')}</div>` : ''}
          <h6>${t('Suggestions', 'Saran', '候補')}</h6><div class="sr-links">${[...new Set(prods.slice(0, 30).map(p => C.CATS[p.k].n))].slice(0, 4).map(c => `<a href="shop.html?q=${encodeURIComponent(q)}">${ICON.search}<span>${esc(q)} <em>${t('in', 'di', '')} ${c}</em></span></a>`).join('')}</div>
        </div><div><h6>${t('Products', 'Produk', '商品')} <span class="mono muted">${prods.length}</span></h6>
          ${prods.length ? `<div class="sr-grid">${prods.slice(0, 8).map(p => srItem(p, q)).join('')}</div><a class="btn btn-ink sr-all" href="shop.html?q=${encodeURIComponent(q)}">${t('See all', 'Lihat semua', 'すべて表示')} ${prods.length} ${t('results', 'hasil', '件')} ${ICON.arrow}</a>`
          : `<div class="sr-none"><b>${t('No parts match', 'Tidak ada hasil untuk', '該当なし')} “${esc(q)}”</b><p>${t('Try a wheel name (TE37, LM), a casting (R34) or a size (10mm). Or ask us — we source parts on request.', 'Coba nama velg, casting, atau ukuran. Atau tanya kami — kami bisa carikan.', '')}</p><a class="btn btn-ghost btn-sm" href="services.html#request">${t('Request a part', 'Request part', 'パーツをリクエスト')}</a></div>`}
        </div></div>`;
      sel = -1;
    };
    const hl = (s, q) => esc(s).replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
    const srItem = (p, q) => `<a class="sr-p" href="product.html?h=${p.h}"><img src="${IMG(p.img[0], 160)}" alt=""><span><em>${esc(H.brand(p).n)}</em><b>${q ? hl(p.t, q) : esc(p.t)}</b><i>${money(p.p)}</i></span></a>`;
    inp.addEventListener('input', H.debounce(draw, 90));
    inp.addEventListener('keydown', e => {
      const items = $$('#sr-res a'); if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((a, i) => a.classList.toggle('is-sel', i === sel)); items[sel].scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter') { if (sel > -1) location.href = items[sel].href; else if (inp.value.trim()) location.href = 'shop.html?q=' + encodeURIComponent(inp.value.trim()); }
    });
    $('#sr-res').addEventListener('click', e => { const c = e.target.closest('[data-sq]'); if (c) { inp.value = c.dataset.sq; draw(); inp.focus(); } });
    draw();
  }

  /* ---------------- quick view ---------------- */
  function quickView(id) {
    ensureShell(); const p = H.byId(id); if (!p) return; const box = $('#quick-box');
    let v = p.v.find(x => x.a) || p.v[0], idx = v.i > -1 ? v.i : 0;
    const draw = () => {
      box.innerHTML = `<button class="modal-x" data-close aria-label="Close">${ICON.close}</button><div class="qv">
        <div class="qv-g"><div class="qv-main"><img src="${IMG(p.img[idx], 900)}" alt=""></div><div class="qv-th">${p.img.map((s, i) => `<button class="${i === idx ? 'is-on' : ''}" data-qi="${i}"><img src="${IMG(s, 160)}" alt=""></button>`).join('')}</div></div>
        <div class="qv-i"><span class="eyebrow">${esc(H.brand(p).n)} · <b class="mono">${H.partNo(p)}</b></span><h3 class="h2">${esc(p.t)}</h3>
          <div class="qv-pr">${H.priceHTML(p, v)}</div>
          <div class="qv-spec">${H.specLine(p).map(s => `<span>${esc(s)}</span>`).join('')}</div>
          ${p.v.length > 1 ? `<div class="vp"><span class="lbl">${esc(p.o || t('Option', 'Opsi', 'オプション'))}: <b>${esc(v.n)}</b></span><div class="vp-l">${p.v.map(x => `<button class="vp-b ${x === v ? 'is-on' : ''} ${x.a ? '' : 'is-out'}" data-qv="${x.id}">${H.swatchBg(x.n) ? `<i style="--c:${H.swatchBg(x.n)}"></i>` : ''}${esc(x.n)}</button>`).join('')}</div></div>` : ''}
          ${H.fitTag(p)}
          <div class="qv-a">${v.a ? `<button class="btn btn-signal btn-lg" data-qv-add>${ICON.cart}${t('Add to cart', 'Tambah ke keranjang', 'カートに追加')}</button>` : `<button class="btn btn-ghost btn-lg" data-notify="${p.id}">${ICON.bell}${t('Notify when back', 'Kabari saat restock', '再入荷通知')}</button>`}<button class="btn btn-ghost btn-icon btn-lg pc-wish-in ${S.wish.includes(p.id) ? 'is-on' : ''}" data-wish="${p.id}" aria-label="Save">${ICON.heart}</button></div>
          <a class="arrow-link" href="product.html?h=${p.h}">${t('Full details & fitment', 'Detail & fitment lengkap', '詳細と適合')} ${ICON.arrow}</a></div></div>`;
      $$('[data-qi]', box).forEach(b => b.onclick = () => { idx = +b.dataset.qi; draw(); });
      $$('[data-qv]', box).forEach(b => b.onclick = () => { v = H.variant(p, b.dataset.qv); if (v.i > -1) idx = v.i; draw(); });
      const add = $('[data-qv-add]', box); if (add) add.onclick = () => { const img = $('.qv-main', box); closeAll(); H.addToCart(p.id, v.id, 1, img); };
    };
    draw(); lock($('#m-quick'));
  }

  function notify(id) {
    ensureShell(); const p = H.byId(id); const box = $('#notify-box');
    box.innerHTML = `<button class="modal-x" data-close aria-label="Close">${ICON.close}</button><div class="nt"><img src="${IMG(p.img[0], 200)}" alt=""><span class="eyebrow"><b>${t('Restock alert', 'Notifikasi restock', '再入荷通知')}</b></span><h3 class="h3">${esc(p.t)}</h3><p class="small muted">${t('Small-batch parts sell out fast. We email you once — the moment it is back.', 'Part batch kecil cepat habis. Kami email sekali saat restock.', '')}</p>
      <form class="nt-f"><input class="input" type="email" required placeholder="you@email.com"><button class="btn btn-ink">${t('Notify me', 'Kabari saya', '通知する')}</button></form></div>`;
    lock($('#m-notify'));
    $('.nt-f', box).onsubmit = e => { e.preventDefault(); closeAll(); H.toast({ title: t('You are on the list', 'Kamu sudah terdaftar', '登録しました'), sub: p.t, img: IMG(p.img[0], 120) }); };
  }

  /* ---------------- footer ---------------- */
  function renderFooter() {
    const host = $('#hpz-footer'); if (!host) return; const m = H.mk();
    const col = (h, links) => `<div class="ft-col"><h6>${h}</h6><ul>${links.map(([l, u]) => `<li><a href="${u}">${l}</a></li>`).join('')}</ul></div>`;
    host.innerHTML = `<footer class="ft dark-0">
      <div class="ft-ruler" aria-hidden="true"></div>
      <div class="wrap ft-top">
        <div class="ft-news"><span class="eyebrow"><b>${t('Drop alerts', 'Info rilis', 'リリース通知')}</b></span><h3 class="h2">${t('New wheels drop every<br>second Friday.', 'Velg baru rilis setiap<br>Jumat kedua.', '新作は毎月第2金曜日。')}</h3>
          <p class="lead">${t('Get the line-up 24 hours early, plus 10% off your first order. One email per drop, nothing else.', 'Dapat bocoran 24 jam lebih awal + diskon 10% order pertama. Satu email per rilis.', '24時間前に先行案内＋初回10%オフ。')}</p>
          <form class="ft-form" id="ft-form"><input class="input" type="email" required placeholder="${t('Email address', 'Alamat email', 'メールアドレス')}" aria-label="Email"><button class="btn btn-signal">${t('Subscribe', 'Langganan', '登録')} ${ICON.arrow}</button></form>
          <span class="xs muted">${t('Or follow drops on', 'Atau ikuti di', 'または')} <a class="link" href="#">WhatsApp Channel</a> · <a class="link" href="#">Instagram</a></span></div>
        <div class="ft-cols">
          ${col(t('Shop', 'Belanja', 'ショップ'), [[t('Wheels', 'Velg', 'ホイール'), 'shop.html?k=wheels'], [t('Decals', 'Decal', 'デカール'), 'shop.html?k=decals'], [t('Body kits', 'Body kit', 'ボディキット'), 'shop.html?k=bodykits'], [t('Engines', 'Mesin', 'エンジン'), 'shop.html?k=engines'], [t('HPZ Originals', 'HPZ Original', 'HPZオリジナル'), 'shop.html?own=1'], [t('Sale', 'Diskon', 'セール'), 'shop.html?sale=1']])}
          ${col(t('Build', 'Build', 'ビルド'), [[t('Build Planner', 'Build Planner', 'ビルドプランナー'), 'planner.html'], [t('Fitment finder', 'Fitment finder', '適合検索'), 'planner.html'], [t('Built by You', 'Karya Kalian', 'ビルド'), 'builds.html'], [t('Academy', 'Academy', 'アカデミー'), 'academy.html'], [t('Custom decal studio', 'Studio decal custom', 'カスタムデカール'), 'services.html#decal']])}
          ${col(t('Help', 'Bantuan', 'ヘルプ'), [[t('Track your order', 'Lacak pesanan', '注文追跡'), 'account.html#orders'], [t('Shipping & duties', 'Pengiriman & bea', '配送と関税'), 'services.html#help'], [t('Returns', 'Retur', '返品'), 'services.html#help'], [t('Wholesale', 'Grosir', '卸売'), 'services.html#wholesale'], [t('Contact', 'Kontak', 'お問い合わせ'), 'services.html#help']])}
          <div class="ft-col ft-contact"><h6>${t('Workshop', 'Workshop', '工房')}</h6><p>HPZ Diecast<br>Jl. Pamularsih Raya 12<br>Semarang 50148, Indonesia</p><p class="mono xs">Mon–Sat · 09:00–17:00 WIB</p>
            <a class="ft-wa" href="#">${ICON.wa}+62 813 1016 7872</a>
            <div class="ft-soc"><a href="#" aria-label="Instagram">${ICON.ig}</a><a href="#" aria-label="YouTube">${ICON.yt}</a><a href="#" aria-label="TikTok">${ICON.tt}</a><a href="#" aria-label="X">${ICON.x}</a></div></div>
        </div>
      </div>
      <div class="wrap ft-bot">
        <div class="ft-b1">${logo()}<span class="xs">© 2026 HPZ Diecast. ${t('Independent parts maker — not affiliated with Mattel, Hot Wheels or Matchbox.', 'Produsen part independen — tidak berafiliasi dengan Mattel, Hot Wheels atau Matchbox.', 'Mattel社等とは無関係の独立パーツメーカー。')}</span></div>
        <div class="ft-b2">${marketBtn('on-dark')}${H.payIcons(m.pay)}</div>
        <nav class="ft-legal"><a href="#">${t('Privacy', 'Privasi', 'プライバシー')}</a><a href="#">${t('Terms', 'Ketentuan', '利用規約')}</a><a href="#">${t('Shipping policy', 'Kebijakan kirim', '配送ポリシー')}</a><a href="#">${t('Refund policy', 'Kebijakan refund', '返金ポリシー')}</a><a href="pages.html">${t('Page index', 'Indeks halaman', 'ページ一覧')}</a></nav>
      </div></footer>`;
    $('#ft-form').onsubmit = e => { e.preventDefault(); e.target.reset(); H.toast({ title: t('You are in. Check your inbox.', 'Berhasil. Cek inbox kamu.', '登録完了。メールをご確認ください。'), sub: t('Code PITCREW10 — 10% off your first order', 'Kode PITCREW10 — diskon 10%', 'コード PITCREW10 — 初回10%オフ'), icon: ICON.mail }); };
  }

  /* ---------------- global delegation ---------------- */
  function bindGlobal() {
    document.addEventListener('click', e => {
      const t0 = e.target;
      const op = t0.closest('[data-open]');
      if (op) { e.preventDefault(); const k = op.dataset.open; if (['cart', 'wish', 'menu'].includes(k)) openDrawer(k); else if (k === 'search') openSearch(); else openModal(k); return; }
      if (t0.closest('[data-close]') || t0.classList.contains('modal')) { closeAll(); return; }
      const w = t0.closest('[data-wish]'); if (w) { e.preventDefault(); H.toggleWish(w.dataset.wish, w); return; }
      const qa = t0.closest('[data-qadd]'); if (qa) { e.preventDefault(); H.openQuickAdd(qa); return; }
      const qc = t0.closest('[data-qclose]'); if (qc) { H.closeQuickAdd(qc.closest('.pc-quick')); return; }
      const pv = t0.closest('[data-pv]'); if (pv) { const c = pv.closest('.pc'); H.addToCart(c.dataset.pid, pv.dataset.pv, 1, c.querySelector('.pc-media')); H.closeQuickAdd(pv.closest('.pc-quick')); return; }
      const qv = t0.closest('[data-quick]'); if (qv) { e.preventDefault(); quickView(qv.dataset.quick); return; }
      const nt = t0.closest('[data-notify]'); if (nt) { e.preventDefault(); notify(nt.dataset.notify); return; }
      const ua = t0.closest('[data-uadd]'); if (ua) { const p = H.byId(ua.dataset.uadd); const had = document.body.classList.contains('no-drawer'); document.body.classList.add('no-drawer'); H.addToCart(p.id, null, 1); if (!had) document.body.classList.remove('no-drawer'); return; }
      const wa = t0.closest('[data-qadd-w]'); if (wa) { H.addToCart(wa.dataset.qaddW, null, 1); return; }
      const rm = t0.closest('[data-rm]'); if (rm) { const li = rm.closest('.cl'); li.classList.add('is-out'); setTimeout(() => H.removeLine(rm.dataset.rm), 260); return; }
      const qb = t0.closest('.cl [data-q]'); if (qb) { const li = qb.closest('.cl'); const l = S.cart.find(x => String(x.vid) === li.dataset.vid); H.setQty(li.dataset.vid, l.q + Number(qb.dataset.q)); return; }
      const sw = t0.closest('.pc [data-sw]'); if (sw) { e.preventDefault(); const c = sw.closest('.pc'); const p = H.byId(c.dataset.pid); const i = +sw.dataset.img; if (i > -1) c.querySelector('.pc-a').src = IMG(p.img[i], 600); $$('[data-sw]', c).forEach(x => x.classList.toggle('is-on', x === sw)); return; }
    });
    document.addEventListener('change', e => {
      const a = e.target.closest('[data-addon]'); if (a) H.setAddon(a.dataset.addon, a.checked);
      const qi = e.target.closest('.cl [data-qi]'); if (qi) H.setQty(qi.closest('.cl').dataset.vid, parseInt(qi.value, 10) || 1);
    });
    // swatch hover preview
    document.addEventListener('mouseover', e => { const sw = e.target.closest('.pc [data-sw]'); if (!sw) return; const c = sw.closest('.pc'); const i = +sw.dataset.img; if (i > -1) { const p = H.byId(c.dataset.pid); c.querySelector('.pc-a').src = IMG(p.img[i], 600); c.classList.add('is-sw'); } });
    document.addEventListener('mouseout', e => { const c = e.target.closest('.pc.is-sw'); if (c && !c.contains(e.relatedTarget)) { c.classList.remove('is-sw'); const p = H.byId(c.dataset.pid); const on = c.querySelector('[data-sw].is-on'); const i = on ? +on.dataset.img : 0; c.querySelector('.pc-a').src = IMG(p.img[i > -1 ? i : 0], 600); } });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAll();
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
    });
    H.on('cart', () => {
      const n = H.cartCount(), el = $('#hdr-cart-n');
      if (el) { el.hidden = !n; el.innerHTML = `<span class="roll">${n}</span>`; }
      if ($('#d-cart.is-open')) renderCart();
    });
    H.on('wish', () => { const el = $('#hdr-wish-n'); if (el) { el.hidden = !S.wish.length; el.textContent = S.wish.length; } if ($('#d-wish.is-open')) renderWish(); });
    H.on('market', () => { renderHeader(); renderFooter(); if ($('#d-cart.is-open')) renderCart(); });
    H.on('garage', () => { renderGarageBar(); });
  }

  Object.assign(H, { openDrawer, openModal, closeAll, openSearch, quickView, notify, renderCart, silhouette, SIL, SILW, logo, tach, cartLine });

  H.ready(() => {
    ensureShell(); renderHeader(); renderFooter(); bindGlobal(); stickyHeader();
    H.applyI18n(); H.reveal(); H.countOnView(); H.acc(); geoPrompt();
    setInterval(renderGarageBar, 60000);
  });
})();
