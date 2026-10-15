/* HPZ — collection / search results
   Shopify: collection template + Search & Discovery filters
   (filter.p.product_type, filter.p.vendor, filter.p.m.hpz.diameter, filter.v.option.color, filter.v.price, filter.v.availability) */
HPZ.ready(() => {
  const H = HPZ, { $, $$, t, esc, IMG, money, ICON, C, S } = H;
  const P = H.params();
  const arr = k => (P.get(k) || '').split(',').filter(Boolean);
  const F = {
    k: arr('k'), b: arr('b'), s: arr('s'), dia: arr('dia').map(Number), col: arr('col'), feat: arr('feat'),
    avail: P.get('avail') === '1', sale: P.get('sale') === '1', own: P.get('own') === '1', cast: P.get('cast') || '',
    min: P.get('min') ? +P.get('min') : null, max: P.get('max') ? +P.get('max') : null, q: P.get('q') || '', sort: P.get('sort') || '',
  };
  if (F.cast && !H.castById(F.cast)) F.cast = '';
  if (F.cast) H.setGarage(F.cast);
  const PRICE = [Math.floor(Math.min(...H.CAT.map(p => p.p))), Math.ceil(Math.max(...H.CAT.map(p => p.p)))];
  let shown = 24, cols = H.LS.get('cols', 4);
  const PAGE = 24;

  const L = {
    k: () => t('Category', 'Kategori', 'カテゴリー'), b: () => t('Maker', 'Pabrikan', 'メーカー'), s: () => t('Wheel style', 'Gaya velg', 'スタイル'),
    dia: () => t('Diameter', 'Diameter', '径'), col: () => t('Finish', 'Warna', '仕上げ'), feat: () => t('Features', 'Fitur', '特徴'), price: () => t('Price', 'Harga', '価格'),
  };
  const FEATS = () => ({ bearing: t('Bearing series', 'Seri bearing', 'ベアリング'), metal: t('Alloy lip / barrel', 'Lip / barrel alloy', 'アルミリップ'), disc: t('Disc brake', 'Disc brake', 'ディスク'), rubber: t('Rubber tyre', 'Ban karet', 'ラバータイヤ'), precoat: t('Precoated decal', 'Decal precoated', 'プレコート'), print: t('3D printed', 'Cetak 3D', '3Dプリント') });
  const COLN = { gold: 'Gold', silver: 'Silver', chrome: 'Chrome', gunmet: 'Gunmetal', bronze: 'Bronze', white: 'White', black: 'Black', blue: 'Blue', red: 'Red', tosca: 'Tosca', pink: 'Pink', purple: 'Purple', green: 'Green', orange: 'Orange', grey: 'Grey' };
  const SORTS = () => [['', t('Featured', 'Unggulan', 'おすすめ')], ['new', t('Newest', 'Terbaru', '新着順')], ['best', t('Best selling', 'Terlaris', '人気順')], ['price-asc', t('Price: low to high', 'Harga: termurah', '価格の安い順')], ['price-desc', t('Price: high to low', 'Harga: termahal', '価格の高い順')], ['sale', t('Biggest discount', 'Diskon terbesar', '割引率順')], ['az', 'A–Z']];

  const q = (over = {}) => H.query({ ...F, k: F.k.length ? F.k : null, b: F.b.length ? F.b : null, s: F.s.length ? F.s : null, dia: F.dia.length ? F.dia : null, col: F.col.length ? F.col : null, feat: F.feat.length ? F.feat : null, avail: F.avail, sale: F.sale, own: F.own, cast: F.cast || null, ...over });
  // facet count = results if this value were the only one selected in its group (OR within group, AND across)
  const cnt = (key, val) => q(key === 'k' ? { k: [val], dia: null, col: null, s: null } : { [key]: [val] }).length;

  function syncURL() {
    const u = new URLSearchParams();
    ['k', 'b', 's', 'dia', 'col', 'feat'].forEach(k => F[k].length && u.set(k, F[k].join(',')));
    ['avail', 'sale', 'own'].forEach(k => F[k] && u.set(k, '1'));
    if (F.cast) u.set('cast', F.cast); if (F.q) u.set('q', F.q); if (F.sort) u.set('sort', F.sort);
    if (F.min != null) u.set('min', F.min); if (F.max != null) u.set('max', F.max);
    history.replaceState(null, '', 'shop.html' + (u.toString() ? '?' + u : ''));
  }

  /* ---------- head ---------- */
  function drawHead(n) {
    const cat = F.k.length === 1 ? C.CATS[F.k[0]] : null, br = F.b.length === 1 ? C.BRANDS[F.b[0]] : null, cast = H.castById(F.cast);
    let title = t('All parts', 'Semua parts', '全パーツ'), desc = t('Every wheel, decal, kit and engine we stock — filter by casting, size and finish.', 'Semua velg, decal, kit dan mesin — filter berdasarkan casting, ukuran dan warna.', '全商品。車種・サイズ・仕上げで絞り込み。');
    if (F.q) { title = `“${esc(F.q)}”`; desc = t('Search results', 'Hasil pencarian', '検索結果'); }
    else if (cat) { title = t(cat.n, null, null); desc = { wheels: t('Resin, alloy and bearing wheels from 9 to 12 mm. Sold as a set of four with rubber tyres.', 'Velg resin, alloy dan bearing 9–12 mm. Dijual per set isi 4 dengan ban karet.', '9〜12mm。4本セット、ラバータイヤ付き。'), decals: t('Waterslide liveries designed for specific castings. Precoated, transparent or white toner.', 'Livery waterslide khusus casting tertentu. Precoated, transparan atau white toner.', '車種専用の水転写デカール。'), bodykits: t('Raw resin widebody and aero kits. Test-fit, sand, prime, paint.', 'Kit widebody & aero resin raw.', 'レジン製ワイドボディキット。'), engines: t('Swap-ready engines, raw resin or factory painted.', 'Mesin siap swap, resin raw atau sudah dicat.', 'スワップ用エンジン。') }[F.k[0]] || ''; }
    else if (br) { title = br.n; desc = br.note; }
    else if (F.own) { title = 'HPZ Originals'; desc = t('Designed in-house in Semarang.', 'Didesain in-house di Semarang.', 'スマランで自社設計。'); }
    else if (F.sale) { title = t('On sale', 'Diskon', 'セール'); desc = t('Marked down while stock lasts.', 'Diskon selama stok ada.', '在庫限り。'); }
    $('#col-title').innerHTML = title; $('#col-desc').textContent = desc;
    document.title = `${title.replace(/<[^>]+>/g, '')} — HPZ Diecast`;
    $('#crumbs').innerHTML = `<a href="index.html">${t('Home', 'Beranda', 'ホーム')}</a><span><a href="shop.html">${t('Shop', 'Belanja', 'ショップ')}</a></span>${cat ? `<span>${cat.n}</span>` : ''}${br ? `<span>${br.n}</span>` : ''}`;
    $('#col-side').innerHTML = cast
      ? `<div class="cast-on"><span class="g-sil">${H.silhouette(cast.body)}</span><div><span class="eyebrow">${t('Showing parts for', 'Parts untuk', '適合車種')}</span><b>${esc(cast.n)}</b><em class="mono">Ø${cast.dia} mm · ${cast.axle}</em></div><button class="dr-x" data-uncast aria-label="${t('Remove', 'Hapus', '解除')}">${ICON.close}</button></div>`
      : `<button class="cast-off" data-open="garage">${ICON.car}<span><b>${t('Filter by your casting', 'Filter sesuai casting', '車種で絞り込み')}</b><em>${t('Only see parts that fit', 'Hanya tampilkan yang pas', '適合品のみ表示')}</em></span>${ICON.arrow}</button>`;
    const cats = Object.entries(C.CATS);
    const all = q({ k: null }).length;
    $('#col-cats').innerHTML = `<a class="chip ${F.k.length ? '' : 'is-on'}" data-cat="">${t('All', 'Semua', 'すべて')} <span class="ct">${all}</span></a>` + cats.map(([k, c]) => { const n = cnt('k', k); return `<a class="chip ${F.k.includes(k) ? 'is-on' : ''} ${n ? '' : 'is-empty'}" data-cat="${k}">${c.short} <span class="ct">${n}</span></a>`; }).join('');
  }

  /* ---------- filters ---------- */
  const group = (key, title, body, open = true) => `<div class="fg acc ${open ? 'is-open' : ''}" data-acc><button class="acc-h fg-h" aria-expanded="${open}">${title}<span class="acc-ic"></span></button><div class="acc-b" ${open ? 'style="height:auto"' : ''}><div class="fg-c">${body}</div></div></div>`;
  const checks = (key, items) => items.map(([v, label, extra]) => { const n = cnt(key, v); const on = F[key].map(String).includes(String(v)); if (!n && !on) return ''; return `<label class="check fc"><input type="checkbox" data-f="${key}" value="${v}" ${on ? 'checked' : ''}><span class="box">${ICON.check}</span><span class="fc-l">${label}${extra || ''}</span><span class="fc-n mono">${n}</span></label>`; }).join('');
  function drawFilters() {
    const cast = H.myCast();
    const isWheels = !F.k.length || F.k.includes('wheels');
    const lo = F.min ?? PRICE[0], hi = F.max ?? PRICE[1];
    $('#filters').innerHTML = `<div class="fl-h"><h3>${t('Filters', 'Filter', '絞り込み')}</h3><button class="dr-x fl-x" data-fclose aria-label="Close">${ICON.close}</button></div>
      <div class="fl-body">
      <div class="fl-toggles">
        <label class="ft"><span><b>${t('In stock only', 'Hanya yang ready', '在庫ありのみ')}</b><em>${q({ avail: true }).length} ${t('parts', 'item', '点')}</em></span><span class="switch"><input type="checkbox" data-t="avail" ${F.avail ? 'checked' : ''}><span></span></span></label>
        <label class="ft ${cast ? '' : 'is-dis'}"><span><b>${t('Fits my casting', 'Pas untuk casting saya', '適合品のみ')}</b><em>${cast ? esc(cast.n) : `<button class="link" data-open="garage">${t('Add a casting', 'Tambah casting', '車種を追加')}</button>`}</em></span><span class="switch"><input type="checkbox" data-t="cast" ${F.cast ? 'checked' : ''} ${cast ? '' : 'disabled'}><span></span></span></label>
        <label class="ft"><span><b>HPZ Originals</b><em>${t('Designed in-house', 'Desain in-house', '自社設計')}</em></span><span class="switch"><input type="checkbox" data-t="own" ${F.own ? 'checked' : ''}><span></span></span></label>
        <label class="ft"><span><b>${t('On sale', 'Diskon', 'セール')}</b><em>${q({ sale: true }).length} ${t('parts', 'item', '点')}</em></span><span class="switch"><input type="checkbox" data-t="sale" ${F.sale ? 'checked' : ''}><span></span></span></label>
      </div>
      ${group('k', L.k(), checks('k', Object.entries(C.CATS).map(([k, c]) => [k, c.n])))}
      ${isWheels ? group('dia', L.dia(), `<div class="fdia">${[8.5, 9.5, 10, 12].map(d => { const n = cnt('dia', d), on = F.dia.includes(d); return `<button class="fdia-b ${on ? 'is-on' : ''}" data-dia="${d}" ${!n && !on ? 'disabled' : ''}><b>${d}</b><span>mm</span><em class="mono">${n}</em></button>`; }).join('')}</div>${cast ? `<p class="fhint">${ICON.info}${t('Recommended for', 'Disarankan untuk', '推奨')} ${esc(H.shortCast(cast))}: <b>${cast.dia} mm</b></p>` : ''}`) : ''}
      ${isWheels ? group('col', L.col(), `<div class="fcol">${H.COLOR_FAMILIES.map(c => { const n = cnt('col', c), on = F.col.includes(c); if (!n && !on) return ''; return `<button class="fcol-b ${on ? 'is-on' : ''}" data-col="${c}" title="${COLN[c]} (${n})"><i style="--c:${H.swatchBg(COLN[c])}"></i><span>${COLN[c]}</span></button>`; }).join('')}</div>`) : ''}
      ${group('b', L.b(), checks('b', Object.entries(C.BRANDS).map(([k, b]) => [k, b.n, b.own ? ' <i class="own">HPZ</i>' : ''])))}
      ${isWheels ? group('s', L.s(), checks('s', Object.entries(C.STYLES)), false) : ''}
      ${group('feat', L.feat(), checks('feat', Object.entries(FEATS())), false)}
      ${group('price', L.price(), `<div class="fprice"><div class="range" id="range"><span class="track"></span><span class="fill"></span><input type="range" min="${PRICE[0]}" max="${PRICE[1]}" step="0.5" value="${lo}" data-r="min" aria-label="Min"><input type="range" min="${PRICE[0]}" max="${PRICE[1]}" step="0.5" value="${hi}" data-r="max" aria-label="Max"></div><div class="fprice-v mono"><span id="pmin">${money(lo)}</span><span id="pmax">${money(hi)}</span></div><div class="fprice-q">${[[0, 5, t('Under', 'Di bawah', '〜') + ' ' + money(5, { short: 1 })], [5, 12, money(5, { short: 1 }) + '–' + money(12, { short: 1 })], [12, 40, money(12, { short: 1 }) + '+']].map(([a, b, l]) => `<button class="chip" data-pq="${a},${b}">${l}</button>`).join('')}</div></div>`)}
      </div>
      <div class="fl-f"><button class="btn btn-ghost" data-clear>${t('Clear all', 'Hapus semua', 'クリア')}</button><button class="btn btn-ink" data-fclose>${t('Show', 'Lihat', '表示')} <span class="mono">${q().length}</span></button></div>`;
    H.acc($('#filters'));
    paintRange();
  }
  function paintRange() {
    const r = $('#range'); if (!r) return; const [a, b] = $$('input', r); const lo = Math.min(+a.value, +b.value), hi = Math.max(+a.value, +b.value);
    const pc = v => (v - PRICE[0]) / (PRICE[1] - PRICE[0]) * 100;
    $('.fill', r).style.left = pc(lo) + '%'; $('.fill', r).style.right = (100 - pc(hi)) + '%';
    $('#pmin').textContent = money(lo); $('#pmax').textContent = money(hi);
  }

  /* ---------- results ---------- */
  function chipsHTML() {
    const c = [];
    F.k.forEach(v => c.push(['k', v, C.CATS[v].short]));
    F.dia.forEach(v => c.push(['dia', v, 'Ø' + v + ' mm']));
    F.col.forEach(v => c.push(['col', v, COLN[v]]));
    F.b.forEach(v => c.push(['b', v, C.BRANDS[v].n]));
    F.s.forEach(v => c.push(['s', v, C.STYLES[v]]));
    F.feat.forEach(v => c.push(['feat', v, FEATS()[v]]));
    if (F.avail) c.push(['avail', 1, t('In stock', 'Ready', '在庫あり')]);
    if (F.sale) c.push(['sale', 1, t('On sale', 'Diskon', 'セール')]);
    if (F.own) c.push(['own', 1, 'HPZ Originals']);
    if (F.cast) c.push(['cast', 1, H.shortCast(H.castById(F.cast))]);
    if (F.min != null || F.max != null) c.push(['price', 1, `${money(F.min ?? PRICE[0])}–${money(F.max ?? PRICE[1])}`]);
    if (F.q) c.push(['q', 1, `“${F.q}”`]);
    return c.map(([k, v, l]) => `<button class="rchip" data-rm-f="${k}" data-v="${v}">${esc(l)}${ICON.close}</button>`).join('') + (c.length > 1 ? `<button class="link xs" data-clear>${t('Clear all', 'Hapus semua', 'クリア')}</button>` : '');
  }
  function promo(kind) {
    if (kind === 'fit') return `<a class="promo promo-fit" href="planner.html"><div class="promo-w">${H.wheelSVG({ spokes: 5, finish: 'silver' })}</div><span class="eyebrow"><b>${t('Fitment finder', 'Fitment finder', '適合検索')}</b></span><h3>${t('Not sure it fits?', 'Ragu ukurannya?', 'サイズに迷ったら')}</h3><p>${t('Pick your casting — we tag every part that fits it.', 'Pilih casting — kami tandai semua part yang pas.', '車種を選ぶと適合品を表示。')}</p><span class="arrow-link">${t('Open finder', 'Buka finder', '開く')} ${ICON.arrow}</span></a>`;
    return `<a class="promo promo-decal mat" href="services.html#decal"><span class="eyebrow"><b>${t('Custom Decal Studio', 'Studio Decal Custom', 'カスタムデカール')}</b></span><h3>${t('Your livery, printed to fit.', 'Livery-mu, dicetak pas.', 'オリジナルカラーを印刷。')}</h3><p>${t('Send a reference, get a test sheet in 5–7 days.', 'Kirim referensi, sheet tes 5–7 hari.', '5〜7日でテストシート。')}</p><span class="arrow-link">${t('From', 'Mulai', '')} ${money(25, { short: 1 })} ${ICON.arrow}</span></a>`;
  }
  function drawResults(append) {
    const list = q();
    const grid = $('#grid'); grid.style.setProperty('--cols', cols);
    const prev = +($('#r-count').dataset.v || 0);
    H.countUp($('#r-count'), list.length, { from: append ? list.length : prev, dur: 600 }); $('#r-count').dataset.v = list.length;
    $('#r-label').textContent = list.length === 1 ? t('result', 'hasil', '件') : t('results', 'hasil', '件');
    $('#r-chips').innerHTML = chipsHTML();
    if (!list.length) {
      grid.innerHTML = `<div class="empty"><div class="empty-w">${H.wheelSVG({ spokes: 5, finish: 'gunmet' })}</div><h3 class="h3">${t('Nothing fits that combination', 'Tidak ada yang cocok dengan kombinasi itu', '該当なし')}</h3><p>${t('Loosen a filter, or let us source it — we take part requests every week.', 'Kurangi filter, atau minta kami carikan.', '条件を減らすか、リクエストしてください。')}</p><div><button class="btn btn-ink" data-clear>${t('Clear filters', 'Hapus filter', 'クリア')}</button> <a class="btn btn-ghost" href="services.html#request">${t('Request a part', 'Request part', 'リクエスト')}</a></div></div>`;
      $('#pager').innerHTML = ''; return;
    }
    const from = append ? shown - PAGE : 0;
    const slice = list.slice(from, shown);
    const useP = !F.q && list.length > 12 && !append;
    let html = slice.map((p, i) => H.card(p, { i: i })).join('');
    if (useP) {
      const parts = slice.map((p, i) => H.card(p, { i }));
      parts.splice(Math.min(5, parts.length), 0, `<div data-reveal style="--i:5">${promo('fit')}</div>`);
      if (parts.length > 16) parts.splice(15, 0, `<div data-reveal style="--i:3">${promo('decal')}</div>`);
      html = parts.join('');
    }
    if (append) { $$('.skel-card', grid).forEach(e => e.remove()); grid.insertAdjacentHTML('beforeend', html); }
    else grid.innerHTML = html;
    H.reveal(grid);
    const showing = Math.min(shown, list.length);
    $('#pager').innerHTML = `<div class="pg-t mono">${t('Showing', 'Menampilkan', '表示')} ${showing} / ${list.length}</div><div class="pg-bar"><i style="width:${showing / list.length * 100}%"></i></div>${showing < list.length ? `<button class="btn btn-ink btn-lg" id="more">${t('Load', 'Muat', 'さらに')} ${Math.min(PAGE, list.length - showing)} ${t('more', 'lagi', '件表示')}</button>` : `<span class="xs muted">${t('That is everything.', 'Sudah semua.', 'すべて表示しました。')}</span>`}`;
  }

  function drawToolbar() {
    $('#sort').innerHTML = SORTS().map(([v, l]) => `<option value="${v}" ${v === F.sort ? 'selected' : ''}>${l}</option>`).join('');
    $('#dens').innerHTML = [3, 4, 5].map(n => `<button class="${n === cols ? 'is-on' : ''}" data-cols="${n}" aria-label="${n} columns">${Array.from({ length: n }, () => '<i></i>').join('')}</button>`).join('');
  }
  function drawRecent() {
    const r = S.recent.map(H.byId).filter(Boolean);
    $('#recent-s').hidden = r.length < 2;
    if (r.length >= 2) { $('#recent').innerHTML = r.slice(0, 10).map(p => H.card(p, { reveal: false })).join(''); H.rail($('#recent')); }
  }

  function update(o = {}) { if (!o.keepPage) shown = PAGE; syncURL(); drawHead(); if (!o.keepFilters) drawFilters(); drawResults(); H.applyI18n(); }

  /* ---------- events ---------- */
  document.addEventListener('change', e => {
    const f = e.target.closest('[data-f]');
    if (f) { const k = f.dataset.f, v = k === 'dia' ? +f.value : f.value; F[k] = f.checked ? [...F[k], v] : F[k].filter(x => String(x) !== String(v)); update(); return; }
    const tg = e.target.closest('[data-t]');
    if (tg) { const k = tg.dataset.t; if (k === 'cast') F.cast = tg.checked && H.myCast() ? H.myCast().id : ''; else F[k] = tg.checked; update(); return; }
    if (e.target.id === 'sort') { F.sort = e.target.value; update({ keepFilters: true }); }
  });
  document.addEventListener('input', e => {
    const r = e.target.closest('[data-r]'); if (!r) return; paintRange();
  });
  document.addEventListener('change', e => {
    const r = e.target.closest('[data-r]'); if (!r) return; const [a, b] = $$('#range input'); const lo = Math.min(+a.value, +b.value), hi = Math.max(+a.value, +b.value);
    F.min = lo > PRICE[0] ? lo : null; F.max = hi < PRICE[1] ? hi : null; update();
  });
  document.addEventListener('click', e => {
    const tg = e.target;
    const cat = tg.closest('[data-cat]'); if (cat) { e.preventDefault(); F.k = cat.dataset.cat ? [cat.dataset.cat] : []; if (!F.k.includes('wheels')) { F.dia = []; F.col = []; F.s = []; } update(); return; }
    const d = tg.closest('[data-dia]'); if (d) { const v = +d.dataset.dia; F.dia = F.dia.includes(v) ? F.dia.filter(x => x !== v) : [...F.dia, v]; update(); return; }
    const c = tg.closest('[data-col]'); if (c) { const v = c.dataset.col; F.col = F.col.includes(v) ? F.col.filter(x => x !== v) : [...F.col, v]; update(); return; }
    const pq = tg.closest('[data-pq]'); if (pq) { const [a, b] = pq.dataset.pq.split(',').map(Number); F.min = a > PRICE[0] ? a : null; F.max = b < PRICE[1] ? b : null; update(); return; }
    const rm = tg.closest('[data-rm-f]'); if (rm) { const k = rm.dataset.rmF, v = rm.dataset.v; if (Array.isArray(F[k])) F[k] = F[k].filter(x => String(x) !== v); else if (k === 'price') { F.min = F.max = null; } else F[k] = k === 'cast' || k === 'q' ? '' : false; update(); return; }
    if (tg.closest('[data-clear]')) { Object.assign(F, { k: [], b: [], s: [], dia: [], col: [], feat: [], avail: false, sale: false, own: false, cast: '', min: null, max: null, q: '' }); update(); return; }
    if (tg.closest('[data-uncast]')) { F.cast = ''; update(); return; }
    const dn = tg.closest('[data-cols]'); if (dn) { cols = +dn.dataset.cols; H.LS.set('cols', cols); $$('#dens button').forEach(b => b.classList.toggle('is-on', b === dn)); $('#grid').style.setProperty('--cols', cols); return; }
    if (tg.closest('#more')) {
      const grid = $('#grid'); grid.insertAdjacentHTML('beforeend', Array.from({ length: 4 }, () => `<div class="skel-card"><div class="skel"></div><i class="skel"></i><i class="skel"></i></div>`).join(''));
      tg.closest('#more').classList.add('is-loading'); tg.closest('#more').insertAdjacentHTML('beforeend', '<span class="spin"></span>');
      setTimeout(() => { shown += PAGE; drawResults(true); }, 550); return;
    }
    if (tg.closest('#open-filters')) { $('#filters').classList.add('is-open'); document.body.classList.add('is-locked'); return; }
    if (tg.closest('[data-fclose]')) { $('#filters').classList.remove('is-open'); document.body.classList.remove('is-locked'); return; }
  });

  drawToolbar(); update(); drawRecent();
  H.on('market', () => { drawToolbar(); update({ keepPage: true }); drawRecent(); });
  H.on('garage', id => { if (F.cast && id) F.cast = id; update({ keepPage: true }); });
});
