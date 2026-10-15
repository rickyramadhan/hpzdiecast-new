/* HPZ — homepage */
HPZ.ready(() => {
  const H = HPZ, { $, $$, t, esc, IMG, money, ICON, C } = H;
  const arrow = ICON.arrow;

  /* ---------- hero: workbench ---------- */
  const heroH = $('#hero-h');
  function heroIntro() { heroH.classList.remove('is-in'); delete heroH.dataset.splitDone; H.splitLines(heroH); void heroH.offsetWidth; requestAnimationFrame(() => heroH.classList.add('is-in')); }

  const FINS = [['gold', 'Gold'], ['silver', 'Silver'], ['gunmet', 'Gunmetal'], ['bronze', 'Bronze'], ['white', 'White'], ['tosca', 'Tosca']];
  let fin = 'gold';
  const spin = $('#bw-spin');
  const drawWheel = () => { spin.innerHTML = H.wheelSVG({ spokes: 6, finish: fin, disc: 1 }); };
  drawWheel();
  $('#bw-fin').innerHTML = `<span class="mono">${t('Finish', 'Warna', '仕上げ')}</span>` + FINS.map(([k, n]) => `<button class="${k === fin ? 'is-on' : ''}" data-fin="${k}" style="--c:linear-gradient(135deg,${H.swatchBg(n) || '#ccc'},${H.swatchBg(n) || '#999'})" aria-label="${n}" title="${n}"></button>`).join('');
  // rotation: idle spin + scroll velocity + click "whoosh"
  let ang = 0, vel = 0, boost = 0, lastY = scrollY;
  (function loop() {
    const dy = scrollY - lastY; lastY = scrollY;
    vel += (dy * .9 - vel) * .12; boost *= .94;
    ang += .25 + vel + boost;
    spin.style.transform = `rotate(${ang}deg)`;
    requestAnimationFrame(loop);
  })();
  $('#bw-fin').addEventListener('click', e => {
    const b = e.target.closest('[data-fin]'); if (!b || b.dataset.fin === fin) return;
    fin = b.dataset.fin; boost = 34;
    $$('#bw-fin button').forEach(x => x.classList.toggle('is-on', x === b));
    spin.classList.add('is-blur'); setTimeout(() => { drawWheel(); }, 160); setTimeout(() => spin.classList.remove('is-blur'), 520);
  });

  // reference prints taped to the mat
  const benchCards = [
    ['decal-set-hotwheels-honda-s2000-hks-super-gt', 0, 'c1'],
    ['hpz-add-on-body-kit-for-hot-wheels-r34-v-spec', 0, 'c2'],
    ['hpz-wheels-model-te37-sl-bearing-series', 0, 'c3'],
    ['parvus-models-nissan-rb26-engine', 0, 'c4'],
  ].map(([h, i, c]) => [H.byH(h), i, c]).filter(x => x[0]);
  function drawBench() {
    $('#bench-cards').innerHTML = benchCards.map(([p, i, c], k) => `<a class="bc ${c}" href="product.html?h=${p.h}" style="--d:${k}"><span class="tape"></span><img src="${IMG(p.img[i], 420)}" alt="${esc(p.t)}"><span class="bc-l"><b>${esc(p.t)}</b><em class="mono">${money(p.p)}</em></span></a>`).join('');
  }
  drawBench();
  const bench = $('#bench');
  bench.addEventListener('pointermove', e => {
    const r = bench.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    $$('.bc', bench).forEach((c, i) => { const k = (i % 2 ? -1 : 1) * (8 + i * 3); c.style.setProperty('--px', `${x * k}px`); c.style.setProperty('--py', `${y * k}px`); });
  });
  bench.addEventListener('pointerleave', () => $$('.bc', bench).forEach(c => { c.style.setProperty('--px', '0px'); c.style.setProperty('--py', '0px'); }));
  requestAnimationFrame(() => $('#hero').classList.add('is-in'));

  /* ---------- ticker ---------- */
  function drawTicker() {
    const items = H.query({ avail: 1, sort: 'new' }).slice(0, 14);
    const row = items.map(p => `<a href="product.html?h=${p.h}"><i>${H.isNew(p) ? t('NEW', 'BARU', '新着') : H.brand(p).code}</i>${esc(p.t)}<b>${money(p.p)}</b></a>`).join('');
    $('#ticker').innerHTML = row + row;
  }

  /* ---------- bento ---------- */
  const BENTO = [
    ['wheels', 'hpz-wheels-model-six-bearing-series', 1], ['decals', 'decal-set-hotwheels-civic-si-wings-west', 0], ['bodykits', 'hpz-add-on-body-kit-for-hot-wheels-r34-v-spec', 1],
    ['engines', 'parvus-models-miniatur-mesin-toyota-2jz-gte', 0], ['exterior', 'jv-accessories-voltex-wing', 0], ['interior', 'recaro-seat-with-detailing', 0], ['dioramas', 'paper-diorama-japan-themes-vol-1-accessories-sakura-model', 0],
  ];
  const BLURB = {
    wheels: () => t('Resin, alloy and bearing wheels from 9 to 12 mm. Eleven makers, 300+ finishes.', 'Velg resin, alloy & bearing 9–12 mm. 11 pabrikan, 300+ warna.', '9〜12mmのレジン・アルミ・ベアリングホイール。'),
    decals: () => t('Race liveries printed in-house, cut to each casting.', 'Livery balap dicetak in-house, sesuai template casting.', '車種ごとに合わせた自社印刷デカール。'),
    bodykits: () => t('Widebody and aero kits in raw resin.', 'Kit widebody & aero resin raw.', 'ワイドボディ・エアロキット。'),
    engines: () => t('RB26, 2JZ, K-series — raw or painted.', 'RB26, 2JZ, K-series — raw atau dicat.', 'RB26、2JZ、Kシリーズ。'),
    exterior: () => t('Wings, mirrors, racks and roof boxes.', 'Wing, spion, rack & roof box.', 'ウイング、ミラー、ラック。'),
    interior: () => t('Bucket seats and interior sets.', 'Jok bucket & set interior.', 'バケットシート等。'),
    dioramas: () => t('Garage scenes for display.', 'Diorama garasi untuk display.', 'ガレージジオラマ。'),
  };
  function drawBento() {
    $('#bento').innerHTML = BENTO.map(([k, h, i], n) => {
      const p = H.byH(h); const c = C.CATS[k]; const cnt = H.query({ k }).length;
      return `<a class="bn bn-${k}" href="shop.html?k=${k}" data-reveal style="--i:${n}">
        <div class="bn-img"><img src="${p ? IMG(p.img[i] || p.img[0], n === 0 ? 900 : 500) : ''}" alt="" loading="lazy"></div>
        <div class="bn-t"><span class="mono bn-code">${c.code}-${String(cnt).padStart(3, '0')}</span><h3>${t(c.n, { wheels: 'Velg & Ban', decals: 'Waterslide Decal', bodykits: 'Body Kit', engines: 'Mesin', exterior: 'Aero & Eksterior', interior: 'Interior', dioramas: 'Diorama' }[k], { wheels: 'ホイール', decals: 'デカール', bodykits: 'ボディキット', engines: 'エンジン', exterior: 'エアロ', interior: 'インテリア', dioramas: 'ジオラマ' }[k])}</h3>
        ${n < 3 ? `<p>${BLURB[k]()}</p>` : ''}<span class="bn-n"><b class="mono">${cnt}</b> ${t('parts', 'item', '点')} ${arrow}</span></div></a>`;
    }).join('');
  }

  /* ---------- fitment finder ---------- */
  const sel = $('#fit-sel');
  function drawFitSelect() {
    const groups = [...new Set(C.CASTINGS.map(c => c.mk))];
    const cur = H.myCast() ? H.myCast().id : 'r34';
    sel.innerHTML = groups.map(g => `<optgroup label="${g}">${C.CASTINGS.filter(c => c.mk === g).map(c => `<option value="${c.id}" ${c.id === cur ? 'selected' : ''}>${esc(c.n)}</option>`).join('')}</optgroup>`).join('');
  }
  function drawFit(animate) {
    const c = H.castById(sel.value);
    const wheels = H.query({ k: 'wheels', dia: c.dia, avail: 1 }).length;
    const made = H.CAT.filter(p => ['decals', 'bodykits', 'engines'].includes(p.k) && c.m.test(p.full));
    $('#fit-read').innerHTML = `<div><span>${t('Wheel diameter', 'Diameter velg', 'ホイール径')}</span><b class="mono">${c.dia.toFixed(1)}<small>mm</small></b></div><div><span>${t('Axle', 'Axle', 'アクスル')}</span><b>${c.axle}</b></div><div><span>${t('Wheels that fit', 'Velg yang pas', '適合ホイール')}</span><b class="mono">${wheels}</b></div><div><span>${t('Made-for parts', 'Part khusus', '専用パーツ')}</span><b class="mono">${made.length}</b></div>`;
    $('#fit-go').innerHTML = `${t('Show', 'Lihat', '表示')} ${wheels + made.length} ${t('parts that fit', 'parts yang pas', '点の適合パーツ')} ${arrow}`;
    $('#fit-go').href = `shop.html?cast=${c.id}`;
    const w = c.dia; // % of stage width
    const vis = $('#fit-vis');
    vis.innerHTML = `<div class="fv-stage ${animate ? 'is-drive' : ''}">
      <div class="fv-car" style="--w:${w}%">
        <svg class="fv-body" viewBox="0 0 200 70" aria-hidden="true"><path d="${H.SIL[c.body] || H.SIL.coupe}" /><path class="fv-win" d="${H.SILW[c.body] || H.SILW.coupe}" /></svg>
        <span class="fv-w fv-w1">${H.wheelSVG({ spokes: 6, finish: 'gold', lip: 1 })}</span><span class="fv-w fv-w2">${H.wheelSVG({ spokes: 6, finish: 'gold', lip: 1 })}</span>
        <span class="fv-dim mono"><i></i>Ø ${c.dia.toFixed(1)} mm</span>
      </div>
      <div class="fv-ground"></div>
      <div class="fv-meta mono"><span>${esc(c.mk.toUpperCase())}</span><span>${esc(c.n.toUpperCase())}</span><span>${c.yr}</span></div>
    </div>
    ${made.length ? `<div class="fv-made"><span class="eyebrow">${t('Made for this casting', 'Khusus casting ini', 'この車種専用')}</span><div>${made.slice(0, 4).map(p => `<a href="product.html?h=${p.h}" title="${esc(p.t)}"><img src="${IMG(p.img[0], 200)}" alt=""><span>${esc(C.CATS[p.k].short)}</span></a>`).join('')}${made.length > 4 ? `<a class="fv-more" href="shop.html?cast=${c.id}">+${made.length - 4}</a>` : ''}</div></div>` : `<div class="fv-made"><span class="eyebrow">${t('Wheels only for now — decals coming', 'Saat ini velg saja — decal menyusul', '現在ホイールのみ')}</span></div>`}`;
  }
  sel.addEventListener('change', () => drawFit(true));

  /* ---------- HPZ originals rail ---------- */
  let oTab = 'bearing';
  function drawOriginals() {
    let list = H.query({ own: 1, k: 'wheels' });
    if (oTab === 'bearing') list = list.filter(p => p.sp.bearing);
    if (oTab === 'new') list = H.query({ own: 1, k: 'wheels', sort: 'new' });
    if (oTab === 'anodize') list = list.filter(p => /anodize/i.test(p.full + p.v.map(v => v.n).join(' ')));
    $('#o-rail').innerHTML = list.slice(0, 14).map((p, i) => H.card(p, { i, reveal: false })).join('');
    $('#o-rail').scrollLeft = 0;
  }
  H.tabs($('#o-tabs'), k => { oTab = k; drawOriginals(); });
  H.rail($('#o-rail'), $('#o-prev'), $('#o-next'));

  /* ---------- anatomy ---------- */
  const PARTS = () => [
    ['tyre', t('Rubber tyre', 'Ban karet', 'ラバータイヤ'), t('Real rubber with a moulded sidewall. Grips the track, does not crack.', 'Karet asli dengan sidewall cetak. Tidak getas.', '本物のゴム。'), [37, 49]],
    ['lip', t('Machined alloy lip', 'Lip alloy CNC', 'アルミ削り出しリップ'), t('CNC-turned aluminium barrel, polished. This is where the depth comes from.', 'Barrel aluminium bubut CNC, dipoles.', 'CNC旋盤加工のアルミバレル。'), [33.5, 38]],
    ['face', t('Resin face', 'Face resin', 'レジンフェイス'), t('High-detail resin cast from our own 3D masters. Painted in 11 finishes.', 'Resin detail tinggi dari master 3D kami.', '自社3Dマスターから成形。'), [10, 33]],
    ['disc', t('Disc brake & caliper', 'Disc brake & kaliper', 'ブレーキ＆キャリパー'), t('Separate rotor behind the spokes, so the wheel looks right from every angle.', 'Rotor terpisah di balik spoke.', 'スポーク奥の別体ローター。'), [18, 28]],
    ['hub', t('Bearing hub', 'Hub bearing', 'ベアリングハブ'), t('Miniature bearing on a steel axle. Free-rolling, no wobble.', 'Bearing mini pada axle baja. Meluncur mulus.', '鋼製アクスルにミニベアリング。'), [0, 10]],
  ];
  function drawAnatomy() {
    const ps = PARTS();
    $('#anat-list').innerHTML = ps.map(([k, n, d], i) => `<li data-part="${k}"><span class="mono">0${i + 1}</span><div><b>${n}</b><p>${d}</p></div></li>`).join('');
    const ring = (r0, r1) => `M50 ${50 - r1} A${r1} ${r1} 0 1 1 49.99 ${50 - r1} Z ${r0 ? `M50 ${50 - r0} A${r0} ${r0} 0 1 0 50.01 ${50 - r0} Z` : ''}`;
    $('#anat-vis').innerHTML = `<div class="av-wrap"><div class="av-w">${H.wheelSVG({ spokes: 6, finish: 'gold', disc: 1 })}</div>
      <svg class="av-hl" viewBox="0 0 100 100" aria-hidden="true">${ps.map(([k, , , r]) => `<path data-hl="${k}" d="${ring(r[0], r[1])}" fill-rule="evenodd"/>`).join('')}</svg>
      ${ps.map(([k, n], i) => `<span class="av-tag av-${k}" data-part="${k}"><i class="mono">0${i + 1}</i>${n}</span>`).join('')}</div>
      <div class="av-spec mono"><span>Ø 10.00</span><span>W 6.00</span><span>${t('SET OF 4', 'ISI 4', '4本セット')}</span><span>1:64</span></div>`;
    const set = k => { $('#anat').dataset.part = k || ''; $$('[data-part]', $('#anat')).forEach(e => e.classList.toggle('is-on', e.dataset.part === k)); $$('[data-hl]').forEach(e => e.classList.toggle('is-on', e.dataset.hl === k)); };
    $$('#anat [data-part]').forEach(el => { el.addEventListener('mouseenter', () => set(el.dataset.part)); el.addEventListener('mouseleave', () => set(null)); el.addEventListener('click', () => set(el.dataset.part)); });
  }

  /* ---------- product tabs ---------- */
  let pTab = 'new';
  function drawGrid() {
    const f = { new: { sort: 'new', avail: 1 }, best: { sort: 'best', avail: 1 }, sale: { sale: 1, sort: 'sale', avail: 1 }, decals: { k: 'decals', avail: 1 } }[pTab];
    const list = H.query(f);
    const grid = $('#p-grid'); grid.classList.add('is-swap');
    setTimeout(() => { grid.innerHTML = list.slice(0, 8).map((p, i) => H.card(p, { i })).join(''); grid.classList.remove('is-swap'); H.reveal(grid); }, 180);
    const q = new URLSearchParams(f); q.delete('avail');
    $('#p-more').href = 'shop.html?' + q.toString();
    $('#p-more').innerHTML = `${t('View all', 'Lihat semua', 'すべて見る')} <span class="mono">${list.length}</span> ${arrow}`;
  }
  H.tabs($('#p-tabs'), k => { pTab = k; drawGrid(); });

  /* ---------- UGC ---------- */
  function drawUGC() {
    $('#ugc').innerHTML = C.BUILDS.slice(0, 5).map((b, i) => `<figure class="ug ug-${i}" data-reveal style="--i:${i}">
      <a class="ug-img" href="builds.html?b=${b.id}"><img src="${IMG(b.img, i ? 600 : 900)}" alt="${esc(b.title)} by ${esc(b.by)}" loading="lazy"></a>
      ${b.spots.map(([x, y, h, vn]) => { const p = H.byH(h); if (!p) return ''; const v = H.vByName(p, vn); return `<div class="hs" style="left:${x}%;top:${y}%"><button class="hs-dot" aria-label="${esc(p.t)}"></button><div class="hs-card"><img src="${IMG(p.img[v.i > -1 ? v.i : 0], 120)}" alt=""><div><em>${esc(H.brand(p).n)}</em><b>${esc(p.t)}</b><span class="mono">${v.n ? esc(v.n) + ' · ' : ''}${money(v.p)}</span></div><button class="btn btn-signal btn-icon" data-hs-add="${p.id}" data-v="${v.id}" aria-label="Add">${ICON.plus}</button></div></div>`; }).join('')}
      <figcaption><span class="mono">@${esc(b.by)}</span><b>${esc(b.title)}</b><em>${b.spots.length + b.parts.length} ${t('parts tagged', 'part ditandai', 'パーツ')}</em></figcaption></figure>`).join('') +
      `<a class="ug ug-cta" href="builds.html#submit" data-reveal style="--i:5"><span class="eyebrow"><b>${t('Your build here', 'Build kamu di sini', 'あなたのビルドを')}</b></span><h3 class="h3">${t('Tag @hpzdiecast or submit your build — featured builders get 500 Pit Points.', 'Tag @hpzdiecast atau kirim build-mu — yang terpilih dapat 500 Pit Points.', '@hpzdiecastをタグ付け。掲載で500ポイント。')}</h3><span class="arrow-link">${t('Submit a build', 'Kirim build', '投稿する')} ${arrow}</span></a>`;
  }
  $('#ugc').addEventListener('click', e => {
    const b = e.target.closest('[data-hs-add]'); if (b) { e.preventDefault(); H.addToCart(b.dataset.hsAdd, b.dataset.v, 1, b.closest('.hs-card')); return; }
    const d = e.target.closest('.hs-dot'); if (d) { e.preventDefault(); const hs = d.parentElement; $$('.hs.is-open').forEach(x => x !== hs && x.classList.remove('is-open')); hs.classList.toggle('is-open'); }
  });

  /* ---------- services ---------- */
  function drawSvc() {
    const S = [
      ['decal', ICON.layers, t('Custom Decal Studio', 'Studio Decal Custom', 'カスタムデカール'), t('Send us a reference — your race car, your shop logo, a livery from a game. We draw it to the casting and print a test sheet.', 'Kirim referensi — mobil balapmu, logo toko, livery dari game. Kami gambar sesuai casting dan cetak sheet tes.', '参考画像を送るだけ。車種に合わせて作図・印刷。'), [['from', '$25'], [t('Turnaround', 'Pengerjaan', '納期'), t('5–7 days', '5–7 hari', '5〜7日')], [t('Revisions', 'Revisi', '修正'), '2']], 'services.html#decal'],
      ['build', ICON.wheel, t('Commission Build', 'Jasa Build', '受注ビルド'), t('We build the car for you: wheel swap, lowered stance, paint, decals and a display case. Choose a casting or send your own.', 'Kami bangun mobilnya: ganti velg, ceper, cat, decal, sampai display case.', 'ホイール交換から塗装・デカールまで代行。'), [['from', '$65'], [t('Turnaround', 'Pengerjaan', '納期'), t('2–3 weeks', '2–3 minggu', '2〜3週間')], [t('Slots / month', 'Slot / bulan', '月枠'), '12']], 'services.html#build'],
      ['wholesale', ICON.box, t('Wholesale & Stockists', 'Grosir & Reseller', '卸売'), t('Tiered pricing for hobby shops and resellers, with drop-shipping and white-label packaging for larger accounts.', 'Harga bertingkat untuk toko hobi & reseller, termasuk dropship dan kemasan white-label.', 'ホビーショップ向け段階価格。'), [[t('Minimum', 'Minimum', '最小'), t('20 sets', '20 set', '20セット')], [t('Discount', 'Diskon', '割引'), t('up to 35%', 'hingga 35%', '最大35%')], [t('Stockists', 'Reseller', '取扱店'), '12 ' + t('countries', 'negara', 'ヶ国')]], 'services.html#wholesale'],
    ];
    $('#svc').innerHTML = S.map(([k, ic, h, d, rows, href], i) => `<a class="sv sv-${k}" href="${href}" data-reveal style="--i:${i}"><div class="sv-top"><span class="sv-ic">${ic}</span><span class="mono sv-n">S-0${i + 1}</span></div><h3 class="h3">${h}</h3><p>${d}</p><dl>${rows.map(([a, b]) => `<div><dt>${a === 'from' ? t('From', 'Mulai', '〜') : a}</dt><dd class="mono">${a === 'from' ? money(parseFloat(b.slice(1)), { short: 1 }) : b}</dd></div>`).join('')}</dl><span class="arrow-link">${t('Start a request', 'Mulai request', '依頼する')} ${arrow}</span></a>`).join('');
  }

  /* ---------- reviews ---------- */
  function drawReviews() {
    $('#rev-stars').innerHTML = H.stars(5);
    $('#rev-bars').innerHTML = [[5, 91], [4, 7], [3, 1], [2, .6], [1, .4]].map(([s, p]) => `<div><span class="mono">${s}★</span><i><b style="--p:${p}%"></b></i><span class="mono">${p}%</span></div>`).join('');
    $('#rev-rail').innerHTML = C.REVIEWS.map(r => { const p = H.byH(r.p); return `<article class="rv">${H.stars(r.r)}<h4>${esc(r.t)}</h4><p>${esc(r.b)}</p><div class="rv-f"><span class="rv-who">${H.FLAG[r.c] || (['IT', 'DE', 'FR', 'NL', 'ES'].includes(r.c) ? H.FLAG.EU : H.FLAG.INT)}<b>${esc(r.n)}</b><em>${t('Verified buyer', 'Pembeli terverifikasi', '購入者')}</em></span>${p ? `<a class="rv-p" href="product.html?h=${p.h}"><img src="${IMG(p.img[0], 100)}" alt=""><span>${esc(p.t)}</span></a>` : ''}</div></article>`; }).join('');
    const bars = $('#rev-bars'); const ob = new IntersectionObserver(es => { if (es[0].isIntersecting) { bars.classList.add('is-in'); ob.disconnect(); } }, { threshold: .5 }); ob.observe(bars);
  }
  H.rail($('#rev-rail'), $('#r-prev'), $('#r-next'));

  /* ---------- academy ---------- */
  function drawAcad() {
    $('#acad').innerHTML = C.GUIDES.slice(0, 4).map((g, i) => { const p = H.byH(g.img); return `<a class="ac" href="academy.html?a=${g.id}" data-reveal style="--i:${i}"><span class="mono ac-n">${String(i + 1).padStart(2, '0')}</span><span class="ac-cat mono">${g.cat}</span><h3>${esc(g.t)}</h3><p>${esc(g.d)}</p><span class="ac-meta mono">${g.min} min · ${g.lvl}</span><span class="ac-img"><img src="${p ? IMG(p.img[0], 300) : ''}" alt="" loading="lazy"></span>${arrow}</a>`; }).join('');
  }

  /* ---------- promise ---------- */
  function drawPromise() {
    const m = H.mk();
    const P = [
      [ICON.truck, t('Dispatched in 24 h', 'Dikirim dalam 24 jam', '24時間以内に発送'), H.isLocal() ? t('JNE, SiCepat, GoSend same-day in Semarang', 'JNE, SiCepat, GoSend same-day Semarang', '') : t('DHL Express or tracked standard to 43 countries', 'DHL Express atau tracked standard ke 43 negara', 'DHLまたは追跡付き標準便')],
      [ICON.shield, m.duty ? t('Duties prepaid (DDP)', 'Bea masuk prabayar (DDP)', '関税前払い') : t('No surprise fees', 'Tanpa biaya kejutan', '追加料金なし'), m.duty ? t('US tariffs are calculated at checkout, nothing to pay on delivery', 'Tarif US dihitung di checkout', '') : t('EU IOSS and UK VAT collected at checkout', 'IOSS EU & VAT UK ditagih di checkout', 'EU IOSS / UK VATは決済時')],
      [ICON.box, t('Packed like jewellery', 'Dikemas seperti perhiasan', '丁寧な梱包'), t('Every set bagged and boxed — rigid case on request', 'Setiap set dikantong & dibox — hard case opsional', '全セット個包装')],
      [ICON.ruler, t('Fitment guarantee', 'Garansi fitment', 'フィット保証'), t('Chose with the finder and it does not fit? We swap it free', 'Pilih via finder tapi tidak pas? Kami tukar gratis', '適合検索で選んで合わなければ無料交換')],
    ];
    $('#promise').innerHTML = P.map(([ic, h, d]) => `<div class="pm">${ic}<div><b>${h}</b><span>${d}</span></div></div>`).join('');
  }

  function all() { drawTicker(); drawBento(); drawFitSelect(); drawFit(false); drawOriginals(); drawAnatomy(); drawGrid(); drawUGC(); drawSvc(); drawReviews(); drawAcad(); drawPromise(); drawBench(); H.reveal(); H.applyI18n(); }
  all(); heroIntro();
  H.on('market', () => { all(); heroIntro(); });
  H.on('garage', () => { drawFitSelect(); drawFit(true); drawOriginals(); drawGrid(); });
  H.on('wish', () => {});
});
