/* HPZ — product detail page
   Shopify: sections/main-product.liquid (blocks: title, price, variant_picker, fitment_check, buy_buttons, delivery, trust),
   metafields hpz.diameter / hpz.axle / hpz.material / hpz.casting (metaobject ref) / hpz.install_steps */
HPZ.ready(() => {
  const H = HPZ, { $, $$, t, esc, IMG, money, ICON, C, S } = H;
  const p = H.byH(H.params().get('h')) || H.byH('hpz-wheels-model-te37-sl-bearing-series') || H.CAT[0];
  H.pushRecent(p.id);
  let v = H.params().get('variant') ? H.variant(p, H.params().get('variant')) : (p.v.find(x => x.a) || p.v[0]);
  let idx = v.i > -1 ? v.i : 0, qty = 1;
  const b = H.brand(p), cat = C.CATS[p.k], r = H.rating(p);
  const isW = p.k === 'wheels', isD = p.k === 'decals';
  document.title = `${p.t} — ${b.n} | HPZ Diecast`;

  /* ---------- derived specs (metafields) ---------- */
  function specs() {
    const s = p.sp, rows = [[t('Part number', 'Nomor part', '品番'), H.partNo(p)], [t('Maker', 'Pabrikan', 'メーカー'), b.n], [t('Scale', 'Skala', 'スケール'), '1:64']];
    if (isW) {
      rows.push([t('Diameter', 'Diameter', '径'), (s.dia || 10).toFixed(1) + ' mm'], [t('Width', 'Lebar', '幅'), '6.0 mm'], [t('Face', 'Face', 'フェイス'), s.resin ? t('High-detail resin', 'Resin detail tinggi', 'レジン') : t('Alloy', 'Alloy', 'アルミ')],
        [t('Barrel / lip', 'Barrel / lip', 'リップ'), s.metal ? t('Machined aluminium', 'Aluminium bubut', 'アルミ削り出し') : t('Resin', 'Resin', 'レジン')], [t('Tyre', 'Ban', 'タイヤ'), t('Rubber', 'Karet', 'ゴム')],
        [t('Hub', 'Hub', 'ハブ'), s.bearing ? t('Miniature bearing', 'Bearing mini', 'ミニベアリング') : t('Plain axle tube', 'Tabung axle', 'アクスルチューブ')], [t('Axle', 'Axle', 'アクスル'), s.axle === 'long' ? t('Long (JDM)', 'Panjang (JDM)', 'ロング') : t('Included, cut to fit', 'Termasuk, potong sesuai', '付属・カット調整')],
        [t('Disc brake', 'Disc brake', 'ディスク'), s.disc || s.bearing ? t('Included', 'Termasuk', '付属') : '—'], [t('Contents', 'Isi', '内容'), t('4 wheels + 2 axles', '4 velg + 2 axle', 'ホイール4本＋アクスル2本')]);
    } else if (isD) {
      rows.push([t('Type', 'Tipe', 'タイプ'), s.toner ? t('White toner (mirrored)', 'White toner (mirror)', 'ホワイトトナー') : t('Transparent waterslide', 'Waterslide transparan', '透明水転写')], [t('Coating', 'Coating', 'コート'), s.precoat ? t('Precoated', 'Precoated', 'プレコート済') : t('Clear coat before use', 'Clear coat sebelum dipakai', '使用前にクリア')],
        [t('Made for', 'Untuk', '対応'), p.cast || t('See title', 'Lihat judul', 'タイトル参照')], [t('Sheet size', 'Ukuran sheet', 'サイズ'), '60 × 45 mm'], [t('Diecast included', 'Termasuk diecast', 'ダイキャスト'), t('No', 'Tidak', 'なし')]);
    } else {
      rows.push([t('Material', 'Material', '素材'), s.print ? t('3D-printed resin', 'Resin cetak 3D', '3Dプリント') : t('Cast resin', 'Resin cetak', 'レジン')], [t('Finish', 'Finishing', '仕上げ'), p.v.some(x => /paint/i.test(x.n)) ? t('Raw or painted', 'Raw atau cat', '未塗装/塗装') : t('Raw — paint required', 'Raw — perlu dicat', '未塗装')]);
      if (p.cast) rows.push([t('Made for', 'Untuk', '対応'), p.cast]);
      rows.push([t('Diecast included', 'Termasuk diecast', 'ダイキャスト'), t('No', 'Tidak', 'なし')]);
    }
    rows.push([t('Weight (packed)', 'Berat (kemas)', '重量'), (p.g || 20) + ' g']);
    return rows;
  }
  const stock = H.stockOf(p);

  /* ---------- gallery ---------- */
  function gallery() {
    return `<div class="gal">
      <div class="gal-th" id="gal-th">${p.img.map((s, i) => `<button class="${i === idx ? 'is-on' : ''}" data-gi="${i}" aria-label="Image ${i + 1}"><img src="${IMG(s, 160)}" alt=""></button>`).join('')}</div>
      <div class="gal-main" id="gal-main">
        <div class="gal-zoom" id="gal-zoom"><img id="gal-img" src="${IMG(p.img[idx], 1100)}" alt="${esc(p.full)}"></div>
        <div class="gal-badges">${!p.a ? `<span class="badge out">${t('Sold out', 'Habis', '在庫切れ')}</span>` : ''}${H.isNew(p) ? `<span class="badge new">${t('New', 'Baru', '新着')}</span>` : ''}${b.own ? `<span class="badge own">HPZ Original</span>` : ''}</div>
        <span class="gal-n mono" id="gal-n">${String(idx + 1).padStart(2, '0')} / ${String(p.img.length).padStart(2, '0')}</span>
        <button class="gal-ar gal-prev" data-gstep="-1" aria-label="Previous">${ICON.left}</button><button class="gal-ar gal-next" data-gstep="1" aria-label="Next">${ICON.right}</button>
        <button class="gal-full" data-lb aria-label="Fullscreen">${ICON.zoom}<span>${t('Hover to zoom · click to expand', 'Arahkan untuk zoom · klik untuk perbesar', 'ホバーで拡大')}</span></button>
      </div>
    </div>
    ${isW ? drawing() : ''}${isD && p.img.length > 1 ? compare() : ''}`;
  }
  // engineering drawing — title block, front + section view, dimension lines
  function drawing() {
    const d = (p.sp.dia || 10).toFixed(2), sp = /mesh|bbs|lm|rs/i.test(p.t) ? 10 : /six|te37|ce28|6/i.test(p.t) ? 6 : 5;
    const spokes = Array.from({ length: sp }, (_, i) => `<path transform="rotate(${i * 360 / sp} 110 110)" d="M106 104 L107.5 52 L112.5 52 L114 104" />`).join('');
    return `<figure class="drw" data-reveal>
      <svg viewBox="0 0 640 260" aria-label="Technical drawing">
        <g class="drw-grid">${Array.from({ length: 33 }, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="260"/>`).join('')}${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 20}" x2="640" y2="${i * 20}"/>`).join('')}</g>
        <g class="drw-l">
          <circle cx="110" cy="110" r="78"/><circle cx="110" cy="110" r="66"/><circle cx="110" cy="110" r="60" stroke-dasharray="3 3"/><circle cx="110" cy="110" r="14"/><circle cx="110" cy="110" r="5"/>${spokes}
          <path class="ctr" d="M20 110 H200 M110 20 V200"/>
          <rect x="270" y="32" width="44" height="156" rx="6"/><rect x="276" y="44" width="32" height="132"/><path d="M270 110 H314" class="ctr"/><rect x="314" y="102" width="40" height="16"/><path d="M354 110 H380" class="ctr"/>
        </g>
        <g class="drw-dim">
          <path d="M32 214 H188 M32 206 V222 M188 206 V222"/><path d="M36 214 l8 -3 v6 z M184 214 l-8 -3 v6 z" class="fill"/>
          <path d="M270 210 H314 M270 202 V218 M314 202 V218"/>
          <path d="M236 32 V188 M228 32 H244 M228 188 H244"/>
        </g>
        <g class="drw-t mono"><text x="110" y="234" text-anchor="middle">Ø ${d}</text><text x="292" y="234" text-anchor="middle">6.00</text><text x="222" y="114" text-anchor="middle" transform="rotate(-90 222 114)">Ø ${d}</text>
          <text x="120" y="16">A — FRONT</text><text x="270" y="16">B — SECTION</text></g>
        <g class="drw-tb"><rect x="420" y="20" width="200" height="220"/><path d="M420 64 H620 M420 100 H620 M420 136 H620 M420 172 H620 M420 208 H620 M520 100 V208"/>
          <text class="mono" x="430" y="38">HPZ DIECAST · SEMARANG</text><text x="430" y="56" class="drw-big">${esc(p.t.slice(0, 22))}</text>
          <text class="mono" x="430" y="80">PART NO.</text><text class="mono drw-v" x="430" y="93">${H.partNo(p)}</text>
          <text class="mono" x="430" y="116">SCALE</text><text class="mono drw-v" x="430" y="129">10 : 1</text><text class="mono" x="530" y="116">UNIT</text><text class="mono drw-v" x="530" y="129">mm</text>
          <text class="mono" x="430" y="152">FACE</text><text class="mono drw-v" x="430" y="165">${p.sp.resin ? 'RESIN' : 'ALLOY'}</text><text class="mono" x="530" y="152">LIP</text><text class="mono drw-v" x="530" y="165">${p.sp.metal ? 'AL 6061' : 'RESIN'}</text>
          <text class="mono" x="430" y="188">HUB</text><text class="mono drw-v" x="430" y="201">${p.sp.bearing ? 'BEARING' : 'TUBE'}</text><text class="mono" x="530" y="188">QTY</text><text class="mono drw-v" x="530" y="201">4 PCS</text>
          <text class="mono" x="430" y="228">REV. ${String(p.id).slice(-2)} · 1:64 SCALE PART</text></g>
      </svg>
      <figcaption class="xs muted">${t('Dimensions measured on production samples. Tolerance ±0.1 mm.', 'Dimensi diukur dari sampel produksi. Toleransi ±0,1 mm.', '量産サンプル実測。公差±0.1mm。')}</figcaption>
    </figure>`;
  }
  function compare() {
    return `<figure class="cmp" data-reveal><div class="cmp-h"><span class="eyebrow"><b>${t('Compare', 'Bandingkan', '比較')}</b></span><span class="xs muted">${t('Drag the handle', 'Geser pegangan', 'ハンドルをドラッグ')}</span></div>
      <div class="cmp-box" id="cmp" style="--x:50%"><img src="${IMG(p.img[1], 900)}" alt=""><div class="cmp-top"><img src="${IMG(p.img[0], 900)}" alt=""></div><span class="cmp-bar"><i>${ICON.left}${ICON.right}</i></span><input type="range" min="0" max="100" value="50" aria-label="Compare"></div></figure>`;
  }

  /* ---------- buy box ---------- */
  function fitResult(c) {
    if (!c) return `<p class="fitc-hint">${t('Choose your casting to check fit before you buy.', 'Pilih casting untuk cek kecocokan sebelum beli.', '購入前に車種で適合確認。')}</p>`;
    const f = H.fits(p, c);
    const box = (cls, ic, h, d) => `<div class="fitc-r ${cls}"><span class="fitc-ic">${ic}</span><div><b>${h}</b><span>${d}</span></div></div>`;
    if (f === 'fit') return box('ok', ICON.check, t('Fits', 'Pas', '適合') + ' ' + esc(c.n), t(`Ø${p.sp.dia} mm sits flush in the stock arches.`, `Ø${p.sp.dia} mm pas rata di arch standar.`, '純正アーチにツライチ。'));
    if (f === 'made') return box('ok', ICON.check, t('Made for', 'Dibuat untuk', '専用') + ' ' + esc(c.n), t('Cut to this casting’s template.', 'Dipotong sesuai template casting ini.', 'この車種のテンプレートに合わせています。'));
    if (f === 'close') return box('warn', ICON.info, t('Close fit', 'Hampir pas', 'ほぼ適合'), t(`0.5 mm off the recommended Ø${c.dia} mm. Tucks slightly — popular for a lowered look.`, `Selisih 0,5 mm dari Ø${c.dia} mm. Sedikit masuk ke arch — cocok untuk tampilan ceper.`, '推奨より0.5mm差。'));
    if (f === 'universal') return box('ok', ICON.check, t('Universal part', 'Part universal', '汎用パーツ'), t('Fits most 1:64 castings with a little trimming.', 'Cocok untuk kebanyakan casting 1:64 dengan sedikit trimming.', 'ほとんどの1/64に対応。'));
    return box('no', ICON.close, isW ? t('Not recommended', 'Tidak disarankan', '非推奨') : t('Made for a different casting', 'Untuk casting lain', '別車種用'), isW ? `${t('Use', 'Gunakan', '推奨')} Ø${c.dia} mm ${t('for', 'untuk', '')} ${esc(H.shortCast(c))}. <a class="link" href="shop.html?k=wheels&cast=${c.id}">${t('See wheels that fit', 'Lihat velg yang pas', '適合ホイール')}</a>` : `${t('This sheet is cut for', 'Sheet ini untuk', '対応：')} ${esc(p.cast || '—')}.`);
  }
  function delivery() {
    const m = H.mk();
    return `<div class="dlv"><div class="dlv-h">${ICON.truck}<span>${t('Delivery to', 'Kirim ke', 'お届け先')} <button class="link" data-open="market">${H.FLAG[m.flag]} ${m.n}</button></span></div>
      <ul>${m.ship.map((s, i) => `<li><span class="dlv-n">${esc(s[1])}</span><span class="mono dlv-d">${H.eta(s[3])}</span><span class="mono dlv-p">${i === 0 && m.free ? `${t('Free over', 'Gratis min.', '無料')} ${money(m.free, { short: 1 })}` : money(s[2])}</span></li>`).join('')}</ul>
      ${m.duty ? `<p class="dlv-note">${ICON.shield}${t('US duties & tariffs are calculated and prepaid at checkout. Nothing to pay on delivery.', 'Bea & tarif US dihitung dan dibayar di checkout.', '米国の関税は決済時に前払い。')}</p>` : ''}</div>`;
  }
  function buyBox() {
    const c = H.myCast();
    const low = stock && stock <= 4;
    return `<div class="bb">
      <div class="bb-top"><a class="bb-brand" href="shop.html?b=${p.b}">${esc(b.n)}</a><span class="mono bb-pn">${H.partNo(p)}</span></div>
      <h1 class="bb-t">${esc(p.t)}</h1>
      <a class="bb-rate" href="#reviews">${H.stars(+r.r)}<b class="mono">${r.r}</b><span>(${r.n} ${t('reviews', 'ulasan', '件')})</span></a>
      <div class="bb-price" id="bb-price"></div>
      <div class="bb-spec">${H.specLine(p).map(s => `<span>${esc(s)}</span>`).join('')}${isW ? `<span>${t('Set of 4', 'Isi 4', '4本')}</span>` : ''}</div>
      ${p.v.length > 1 ? `<div class="vp" id="vp"></div>` : ''}
      <div class="fitc" id="fitc"><div class="fitc-h"><span class="eyebrow"><b>${t('Fitment check', 'Cek fitment', '適合チェック')}</b></span><select class="select" id="fitc-sel"><option value="">${t('Select your casting…', 'Pilih casting…', '車種を選択…')}</option>${C.CASTINGS.map(x => `<option value="${x.id}" ${c && c.id === x.id ? 'selected' : ''}>${esc(x.n)} · ${x.mk}</option>`).join('')}</select></div><div id="fitc-out">${fitResult(c)}</div></div>
      <div class="bb-stock">${p.a ? `<i class="dot ${low ? 'low' : 'pulse'}"></i>${low ? `${t('Low stock — only', 'Stok tipis — sisa', '残りわずか')} ${stock} ${t('sets left', 'set', 'セット')}` : `${t('In stock', 'Ready stock', '在庫あり')} · ${t('ships from Semarang', 'dikirim dari Semarang', 'スマランから発送')}`}` : `<i class="dot out"></i>${t('Sold out — restock expected in 2–3 weeks', 'Habis — restock 2–3 minggu', '在庫切れ — 2〜3週間で再入荷予定')}`}</div>
      <div class="bb-buy" id="bb-buy"></div>
      ${delivery()}
      <ul class="bb-trust">
        <li>${ICON.ruler}<span><b>${t('Fitment guarantee', 'Garansi fitment', 'フィット保証')}</b>${t('Wrong size? Free swap.', 'Salah ukuran? Tukar gratis.', 'サイズ違いは無料交換')}</span></li>
        <li>${ICON.box}<span><b>${t('Bagged & boxed', 'Dikantong & dibox', '個包装')}</b>${t('Crush-proof option', 'Opsi anti-penyok', '耐圧オプション')}</span></li>
        <li>${ICON.shield}<span><b>${t('Secure checkout', 'Checkout aman', '安全な決済')}</b>${H.isLocal() ? 'QRIS · VA · e-wallet' : 'PayPal · Shop Pay · cards'}</span></li>
      </ul>
      <a class="bb-ask" href="#">${ICON.wa}<span>${t('Ask a builder on WhatsApp — usually replies in 15 min', 'Tanya builder via WhatsApp — biasanya balas 15 menit', 'WhatsAppでビルダーに質問')}</span>${ICON.arrowUR}</a>
    </div>`;
  }
  function drawPrice() {
    const m = H.mk();
    $('#bb-price').innerHTML = `${H.priceHTML(p, v)}${v.c ? `<span class="bb-save">${t('Save', 'Hemat', '割引')} ${money(v.c - v.p)}</span>` : ''}
      <p class="bb-sub">${m.duty ? t('Duties prepaid at checkout', 'Bea masuk dibayar di checkout', '関税前払い') + ' · ' : ''}${m.cur === 'USD' && S.market === 'US' ? `${t('or 4 interest-free payments of', 'atau 4x cicilan', '4回払い')} <b class="mono">${money(v.p * qty / 4)}</b> ${t('with', 'dengan', '')} <span class="pay" style="background:#5a31f4;color:#fff">shop</span>` : H.isLocal() ? t('Price includes PPN. Free shipping over', 'Harga sudah termasuk PPN. Gratis ongkir min.', '') + ' ' + money(m.free, { short: 1 }) : t('Taxes and shipping calculated at checkout', 'Pajak & ongkir dihitung di checkout', '税・送料は決済時')}</p>`;
  }
  function drawVariants() {
    const el = $('#vp'); if (!el) return;
    el.innerHTML = `<span class="lbl">${esc(p.o || t('Option', 'Opsi', 'オプション'))}: <b>${esc(v.n)}</b>${!v.a ? ` <em class="vp-out">— ${t('sold out', 'habis', '在庫切れ')}</em>` : ''}</span><div class="vp-l">${p.v.map(x => `<button class="vp-b ${x === v ? 'is-on' : ''} ${x.a ? '' : 'is-out'}" data-v="${x.id}">${H.swatchBg(x.n) ? `<i style="--c:${H.swatchBg(x.n)}"></i>` : ''}${esc(x.n)}</button>`).join('')}</div>`;
  }
  function drawBuy() {
    $('#bb-buy').innerHTML = v.a ? `<div class="bb-row"><div class="qty"><button data-qs="-1" aria-label="−">${ICON.minus}</button><input id="qty" value="${qty}" inputmode="numeric" aria-label="Quantity"><button data-qs="1" aria-label="+">${ICON.plus}</button></div>
        <button class="btn btn-signal btn-lg bb-add" id="add"><span class="bb-add-t">${ICON.cart}${t('Add to cart', 'Tambah ke keranjang', 'カートに追加')} · <span class="mono">${money(v.p * qty)}</span></span><span class="spin"></span></button>
        <button class="btn btn-ghost btn-icon btn-lg pc-wish-in ${S.wish.includes(p.id) ? 'is-on' : ''}" data-wish="${p.id}" aria-label="Save">${ICON.heart}</button></div>
        <a class="btn btn-ink btn-lg btn-block" href="checkout.html" id="buynow">${t('Buy it now', 'Beli sekarang', '今すぐ購入')}</a>`
      : `<div class="bb-row"><button class="btn btn-ink btn-lg bb-add" data-notify="${p.id}">${ICON.bell}${t('Notify me when it is back', 'Kabari saat restock', '再入荷を通知')}</button><button class="btn btn-ghost btn-icon btn-lg pc-wish-in ${S.wish.includes(p.id) ? 'is-on' : ''}" data-wish="${p.id}" aria-label="Save">${ICON.heart}</button></div>`;
  }
  function setVariant(nv) {
    v = nv; if (v.i > -1) setImg(v.i);
    drawPrice(); drawVariants(); drawBuy(); drawSbar();
    history.replaceState(null, '', `product.html?h=${p.h}&variant=${v.id}`);
  }
  function setImg(i) {
    idx = (i + p.img.length) % p.img.length; const img = $('#gal-img');
    img.classList.add('is-swap'); setTimeout(() => { img.src = IMG(p.img[idx], 1100); img.onload = () => img.classList.remove('is-swap'); }, 120);
    $$('#gal-th button').forEach((x, k) => x.classList.toggle('is-on', k === idx));
    $('#gal-n').textContent = `${String(idx + 1).padStart(2, '0')} / ${String(p.img.length).padStart(2, '0')}`;
  }

  /* ---------- details sections ---------- */
  function installSteps() {
    if (isD) {
      const lines = p.body.split('\n').map(l => l.trim()).filter(l => /^\d+\./.test(l)).map(l => l.replace(/^\d+\.\s*/, ''));
      if (lines.length >= 4) return lines;
      return ['Spray the decal sheet with a light clear coat and let it dry 30–60 minutes.', 'Cut each decal close to the print using small scissors.', 'Dip in water for about 10 seconds — use tweezers.', 'Wet the diecast surface so the decal can slide.', 'Slide the decal off the backing onto the body and position it.', 'Blot water away with tissue while holding the decal in place.', 'Once dry, clear coat the whole body for protection.'];
    }
    if (isW) return [t('Drill or grind the rivet on the base — or use a rivet-free casting.', 'Bor/gerinda rivet di sasis — atau pakai casting tanpa rivet.', 'リベットを削る。'), t('Remove the stock wheels and axles. Keep the interior and glass aside.', 'Lepas velg & axle bawaan. Simpan interior dan kaca.', '純正ホイールを外す。'), t('Measure the axle against the chassis width and cut to length.', 'Ukur axle sesuai lebar sasis lalu potong.', 'アクスルをカット。'), t('Press the wheels onto the axle and test-roll on a flat surface.', 'Pasang velg ke axle dan tes meluncur di permukaan rata.', 'ホイールを圧入し転がりを確認。'), t('Set ride height with the axle position, then close the casting with a screw.', 'Atur ketinggian dari posisi axle, tutup casting dengan sekrup.', '車高を調整しネジで固定。')];
    return [t('Wash the resin part in warm soapy water to remove release agent.', 'Cuci part resin dengan air sabun hangat.', '洗浄する。'), t('Remove flash and sand mating surfaces with 400–800 grit.', 'Buang flash dan amplas permukaan dengan grit 400–800.', 'バリを取る。'), t('Test-fit on the casting before gluing.', 'Tes pasang sebelum dilem.', '仮組みする。'), t('Glue with thin CA, fill seams, prime and paint.', 'Lem dengan CA tipis, isi celah, primer dan cat.', '接着・塗装する。')];
  }
  function bundleItems() {
    const pick = [];
    const castRe = (C.CASTINGS.find(c => c.m.test(p.full)) || {}).m;
    if (isW) {
      const c = H.myCast(); const re = c ? c.m : /r34|civic|supra/i;
      pick.push(H.query({ k: 'decals', avail: 1 }).find(x => re.test(x.full)) || H.query({ k: 'decals', avail: 1 })[0]);
      pick.push(H.query({ k: 'exterior', avail: 1 })[0]);
    } else {
      if (castRe) pick.push(...H.CAT.filter(x => x.a && x.id !== p.id && x.k !== p.k && castRe.test(x.full)).slice(0, 1));
      pick.push(H.query({ k: 'wheels', own: 1, avail: 1, feat: 'bearing' })[0]);
      if (pick.length < 2) pick.push(H.query({ k: 'decals', avail: 1 }).find(x => x.id !== p.id));
    }
    return [p, ...pick.filter(Boolean).filter((x, i, a) => a.indexOf(x) === i && x.id !== p.id)].slice(0, 3);
  }
  function details() {
    const m = H.mk();
    const steps = installSteps();
    const bi = bundleItems();
    const builds = C.BUILDS.filter(bd => bd.spots.some(s => s[2] === p.h) || bd.parts.includes(p.h));
    const revs = C.REVIEWS.slice().sort((a, x) => (x.p === p.h) - (a.p === p.h)).slice(0, 4);
    const body = p.body.split('\n').filter(l => l && !/^\d+\./.test(l) && !/how to apply/i.test(l)).slice(0, 8);
    return `
    <section class="sec" id="s-details"><div class="wrap sec-in"><div class="sec-h"><span class="mono">01</span><h2 class="h3">${t('Details', 'Detail', '詳細')}</h2></div>
      <div class="sec-b two"><div class="desc">${body.map(l => `<p>${esc(l)}</p>`).join('')}<p class="muted small">${isW ? t('Sold as one set: four wheels with tyres and two axles. Diecast car not included.', 'Dijual per set: empat velg dengan ban dan dua axle. Diecast tidak termasuk.', '1セット：ホイール4本・アクスル2本。車体は付属しません。') : t('Diecast car not included.', 'Diecast tidak termasuk.', '車体は付属しません。')}</p></div>
      <div class="box-in"><span class="eyebrow"><b>${t('In the box', 'Isi paket', '内容物')}</b></span><ul>${(isW ? [t('4 × wheels with rubber tyres', '4 × velg dengan ban karet', 'ホイール×4'), t('2 × steel axles', '2 × axle baja', 'アクスル×2'), p.sp.bearing ? t('4 × miniature bearings (fitted)', '4 × bearing mini (terpasang)', 'ベアリング×4') : t('Axle tubes', 'Tabung axle', 'アクスルチューブ'), t('Zip bag + HPZ card', 'Zip bag + kartu HPZ', 'ジップ袋＋カード')] : isD ? [t('1 × decal sheet', '1 × sheet decal', 'デカール×1'), t('Placement guide (printed)', 'Panduan pemasangan', '貼り付けガイド'), t('Rigid backing card', 'Kartu backing kaku', '台紙')] : [t('Resin part(s), unpainted unless stated', 'Part resin, belum dicat kecuali disebut', 'レジンパーツ'), t('Protective bag', 'Kantong pelindung', '保護袋')]).map(x => `<li>${ICON.check}${x}</li>`).join('')}</ul></div></div></div></section>

    <section class="sec" id="s-specs"><div class="wrap sec-in"><div class="sec-h"><span class="mono">02</span><h2 class="h3">${t('Specifications', 'Spesifikasi', '仕様')}</h2></div>
      <div class="sec-b"><table class="spec">${specs().map(([k, x]) => `<tr><th>${k}</th><td>${esc(x)}</td></tr>`).join('')}</table></div></div></section>

    <section class="sec" id="s-install"><div class="wrap sec-in"><div class="sec-h"><span class="mono">03</span><h2 class="h3">${isD ? t('How to apply', 'Cara pasang', '貼り方') : t('How to install', 'Cara pasang', '取り付け方')}</h2></div>
      <div class="sec-b two"><ol class="steps">${steps.map((s, i) => `<li data-reveal style="--i:${i}"><span class="mono">${String(i + 1).padStart(2, '0')}</span><p>${esc(s)}</p></li>`).join('')}</ol>
      <div class="vid"><div class="vid-p"><img src="${IMG(p.img[Math.min(1, p.img.length - 1)], 700)}" alt=""><button class="vid-b" aria-label="Play">${ICON.play}</button><span class="vid-t mono">0:58</span></div><b>${isD ? t('Watch: waterslide in under a minute', 'Tonton: waterslide kurang dari semenit', '動画：1分で分かる水転写') : t('Watch: rivet-free wheel swap', 'Tonton: ganti velg tanpa bor', '動画：ホイール交換')}</b><a class="arrow-link small" href="academy.html?a=${isD ? 'waterslide' : isW ? 'wheel-swap' : 'resin-kit'}">${t('Full guide in the Academy', 'Panduan lengkap di Academy', 'アカデミーで詳しく')} ${ICON.arrow}</a></div></div></div></section>

    ${bi.length > 1 ? `<section class="sec sec-bundle" id="s-bundle"><div class="wrap sec-in"><div class="sec-h"><span class="mono">04</span><h2 class="h3">${t('Complete the build', 'Lengkapi build', 'ビルドを完成')}</h2><p class="small muted">${t('Add together and save 10%', 'Beli bareng hemat 10%', 'まとめて10%オフ')}</p></div>
      <div class="sec-b"><div class="bnd" id="bnd">${bi.map((x, i) => `<label class="bnd-i ${i === 0 ? 'is-main' : ''}"><input type="checkbox" checked data-bnd="${x.id}" ${i === 0 ? 'disabled' : ''}><span class="bnd-c">${ICON.check}</span><img src="${IMG(x.img[0], 300)}" alt=""><span class="bnd-t"><em>${i === 0 ? t('This item', 'Item ini', 'この商品') : C.CATS[x.k].short}</em><b>${esc(x.t)}</b><span class="mono">${money(x.p)}</span></span></label>${i < bi.length - 1 ? `<span class="bnd-plus">${ICON.plus}</span>` : ''}`).join('')}
        <div class="bnd-sum" id="bnd-sum"></div></div></div></div></section>` : ''}

    <section class="sec" id="s-shipping"><div class="wrap sec-in"><div class="sec-h"><span class="mono">0${bi.length > 1 ? 5 : 4}</span><h2 class="h3">${t('Shipping & returns', 'Pengiriman & retur', '配送と返品')}</h2></div>
      <div class="sec-b two"><table class="spec ship-t"><tr><th>${t('Method', 'Metode', '方法')}</th><th>${t('Arrives', 'Tiba', '到着')}</th><th>${t('Cost', 'Biaya', '料金')}</th></tr>${m.ship.map((s, i) => `<tr><td>${esc(s[1])}</td><td class="mono">${H.eta(s[3])}</td><td class="mono">${i === 0 ? `${money(s[2])} · ${t('free over', 'gratis min.', '無料')} ${money(m.free, { short: 1 })}` : money(s[2])}</td></tr>`).join('')}</table>
      <div class="desc small"><p><b>${t('Ships from', 'Dikirim dari', '発送元')}</b> Semarang, Indonesia — ${t('orders before 15:00 WIB leave the same day.', 'pesanan sebelum 15:00 WIB dikirim hari itu.', '15時までの注文は当日発送。')}</p><p><b>${t('Duties', 'Bea masuk', '関税')}</b> — ${m.duty ? t('prepaid at checkout for the US (DDP).', 'prabayar di checkout untuk US (DDP).', '米国は決済時に前払い。') : S.market === 'EU' ? t('EU VAT collected at checkout under IOSS.', 'VAT EU ditagih di checkout (IOSS).', 'EU VATは決済時。') : t('may apply on arrival depending on your country.', 'mungkin berlaku sesuai negara.', '国により発生。')}</p><p><b>${t('Returns', 'Retur', '返品')}</b> — ${t('30 days on unopened parts. Fitment guarantee covers wrong sizes chosen with our finder.', '30 hari untuk part belum dibuka. Garansi fitment untuk salah ukuran via finder.', '未開封30日。適合保証あり。')}</p></div></div></div></section>

    <section class="sec" id="reviews"><div class="wrap sec-in"><div class="sec-h"><span class="mono">0${bi.length > 1 ? 6 : 5}</span><h2 class="h3">${t('Reviews', 'Ulasan', 'レビュー')}</h2></div>
      <div class="sec-b"><div class="rvw-top"><div class="rvw-s"><b class="mono">${r.r}</b>${H.stars(+r.r)}<span>${r.n} ${t('verified reviews', 'ulasan terverifikasi', '件の認証レビュー')}</span></div>
        <div class="rvw-tags">${[t('Rolls smoothly', 'Meluncur mulus', 'よく転がる'), t('Accurate fit', 'Ukuran presisi', '精度が高い'), t('Clean finish', 'Finishing rapi', '仕上げが綺麗'), t('Well packed', 'Packing rapi', '梱包良好')].map((x, i) => `<span class="chip">${x} <span class="ct">${Math.round(r.n * (.7 - i * .12))}</span></span>`).join('')}</div>
        <button class="btn btn-ghost btn-sm">${ICON.edit}${t('Write a review', 'Tulis ulasan', 'レビューを書く')}</button></div>
        <div class="rvw-l">${revs.map(x => `<article class="rvw"><div class="rvw-a">${H.FLAG[x.c] || (['IT', 'DE'].includes(x.c) ? H.FLAG.EU : H.FLAG.INT)}<b>${esc(x.n)}</b><span class="xs muted">${x.d}</span></div>${H.stars(x.r)}<h4>${esc(x.t)}</h4><p>${esc(x.b)}</p><span class="xs rvw-v">${ICON.check}${t('Verified purchase', 'Pembelian terverifikasi', '購入確認済')}${v.n ? ` · ${esc(v.n)}` : ''}</span></article>`).join('')}</div></div></div></section>

    ${builds.length ? `<section class="sec sec-dark" id="s-builds"><div class="wrap sec-in"><div class="sec-h"><span class="mono">↗</span><h2 class="h3">${t('Seen on these builds', 'Dipakai di build ini', 'このパーツを使ったビルド')}</h2></div><div class="sec-b"><div class="pb">${builds.map(bd => `<a href="builds.html?b=${bd.id}"><img src="${IMG(bd.img || H.byH(bd.fromProduct).img[bd.imgIndex || 0], 500)}" alt=""><span><b>${esc(bd.title)}</b><em class="mono">@${esc(bd.by)}</em></span></a>`).join('')}</div></div></div></section>` : ''}`;
  }
  function drawBundle() {
    const el = $('#bnd-sum'); if (!el) return;
    const ids = $$('[data-bnd]').filter(x => x.checked).map(x => +x.dataset.bnd);
    const items = ids.map(H.byId); const sum = items.reduce((s, x) => s + x.p, 0); const disc = items.length > 1 ? sum * .1 : 0;
    el.innerHTML = `<span class="xs muted">${items.length} ${t('items', 'item', '点')}</span><div class="bnd-p"><s class="mono">${disc ? money(sum) : ''}</s><b class="mono">${money(sum - disc)}</b></div>${disc ? `<span class="bnd-save">${t('You save', 'Hemat', '割引')} ${money(disc)}</span>` : ''}<button class="btn btn-signal btn-block" id="bnd-add">${t('Add', 'Tambah', '追加')} ${items.length} ${t('to cart', 'ke keranjang', 'をカートへ')}</button>`;
  }

  /* ---------- sticky bar ---------- */
  function drawSbar() {
    $('#sbar').innerHTML = `<div class="wrap sb-in"><img src="${IMG(p.img[v.i > -1 ? v.i : 0], 120)}" alt=""><div class="sb-t"><b>${esc(p.t)}</b><span>${v.n ? esc(v.n) + ' · ' : ''}${H.priceHTML(p, v)}</span></div>${v.a ? `<button class="btn btn-signal" id="sb-add">${ICON.cart}${t('Add to cart', 'Tambah', '追加')}</button>` : `<button class="btn btn-ink" data-notify="${p.id}">${t('Notify me', 'Kabari', '通知')}</button>`}</div>`;
  }

  /* ---------- render ---------- */
  function render() {
    $('#crumbs').innerHTML = `<a href="index.html">${t('Home', 'Beranda', 'ホーム')}</a><span><a href="shop.html?k=${p.k}">${cat.n}</a></span><span><a href="shop.html?b=${p.b}">${esc(b.n)}</a></span><span>${esc(p.t)}</span>`;
    $('#pdp').innerHTML = `<div class="pdp-g">${gallery()}</div><div class="pdp-i">${buyBox()}</div>`;
    drawPrice(); drawVariants(); drawBuy();
    $('#subnav-in').innerHTML = `<div class="sn-tabs">${[['s-details', t('Details', 'Detail', '詳細')], ['s-specs', t('Specs', 'Spesifikasi', '仕様')], ['s-install', isD ? t('How to apply', 'Cara pasang', '貼り方') : t('Install', 'Pemasangan', '取付')], ['s-bundle', t('Bundle', 'Bundle', 'セット')], ['s-shipping', t('Shipping', 'Pengiriman', '配送')], ['reviews', `${t('Reviews', 'Ulasan', 'レビュー')} <span class="mono">${r.n}</span>`]].map(([id, l]) => `<a href="#${id}" data-sn="${id}">${l}</a>`).join('')}</div><div class="sn-buy"><span class="mono">${money(v.p)}</span><a class="btn btn-sm btn-signal" href="#pdp">${t('Buy', 'Beli', '購入')}</a></div>`;
    $('#details').innerHTML = details();
    if (!$('#s-bundle')) { const a = $('[data-sn="s-bundle"]'); a && a.remove(); }
    drawBundle(); drawSbar();
    const recs = H.query({ k: p.k, avail: 1 }).filter(x => x.id !== p.id).sort((a, x) => (x.b === p.b) - (a.b === p.b) || ((x.sp.dia === p.sp.dia) - (a.sp.dia === p.sp.dia))).slice(0, 12);
    $('#recs-h').textContent = t('You may also like', 'Mungkin kamu suka', 'おすすめ');
    $('#recs').innerHTML = recs.map((x, i) => H.card(x, { i, reveal: false })).join('');
    H.reveal(); H.applyI18n(); bindAfter();
  }

  let bound = false;
  function bindAfter() {
    // zoom on hover
    const z = $('#gal-zoom'), img = $('#gal-img');
    z.addEventListener('mousemove', e => { const rc = z.getBoundingClientRect(); img.style.transformOrigin = `${(e.clientX - rc.left) / rc.width * 100}% ${(e.clientY - rc.top) / rc.height * 100}%`; z.classList.add('is-z'); });
    z.addEventListener('mouseleave', () => z.classList.remove('is-z'));
    z.addEventListener('click', openLB);
    // swipe
    let sx = null; z.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true }); z.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) setImg(idx + (dx < 0 ? 1 : -1)); sx = null; });
    // compare
    const cmp = $('#cmp'); if (cmp) $('input', cmp).addEventListener('input', e => cmp.style.setProperty('--x', e.target.value + '%'));
    // scroll-spy + sticky bar
    const links = $$('[data-sn]');
    const so = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(l => l.classList.toggle('is-on', l.dataset.sn === en.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(l => { const s = document.getElementById(l.dataset.sn); s && so.observe(s); });
    const add = $('#bb-buy'); const sb = $('#sbar'); const sn = $('#subnav');
    new IntersectionObserver(([en]) => { const past = !en.isIntersecting && en.boundingClientRect.top < 0; sb.classList.toggle('is-on', past); sn.classList.toggle('is-buy', past); }).observe(add);
    if (bound) return; bound = true;
    document.addEventListener('click', e => {
      const tg = e.target;
      const gi = tg.closest('[data-gi]'); if (gi) { setImg(+gi.dataset.gi); return; }
      const gs = tg.closest('[data-gstep]'); if (gs) { setImg(idx + +gs.dataset.gstep); return; }
      if (tg.closest('[data-lb]')) { openLB(); return; }
      const vb = tg.closest('#vp [data-v]'); if (vb) { setVariant(H.variant(p, vb.dataset.v)); return; }
      const qs = tg.closest('[data-qs]'); if (qs) { qty = Math.max(1, Math.min(20, qty + +qs.dataset.qs)); $('#qty').value = qty; $('.bb-add-t .mono').textContent = money(v.p * qty); return; }
      const ad = tg.closest('#add'); if (ad) {
        ad.classList.add('is-loading');
        setTimeout(() => { ad.classList.remove('is-loading'); ad.classList.add('is-done'); const tx = $('.bb-add-t', ad); const old = tx.innerHTML; tx.innerHTML = `${ICON.tick}${t('Added', 'Ditambahkan', '追加しました')}`; H.addToCart(p.id, v.id, qty, $('#gal-main')); setTimeout(() => { tx.innerHTML = old; ad.classList.remove('is-done'); }, 1800); }, 450);
        return;
      }
      if (tg.closest('#buynow')) { e.preventDefault(); document.body.classList.add('no-drawer'); H.addToCart(p.id, v.id, qty); location.href = 'checkout.html'; return; }
      if (tg.closest('#sb-add')) { H.addToCart(p.id, v.id, qty, $('#sbar img')); return; }
      if (tg.closest('#bnd-add')) { const ids = $$('[data-bnd]').filter(x => x.checked).map(x => +x.dataset.bnd); H.addMany(ids.map(id => ({ id, vid: id === p.id ? v.id : null, q: 1, bundle: ids.length > 1 })), $('#bnd-add')); return; }
      if (tg.closest('.vid-b')) { tg.closest('.vid-p').classList.add('is-play'); return; }
    });
    document.addEventListener('change', e => {
      if (e.target.id === 'fitc-sel') { const c = H.castById(e.target.value); const out = $('#fitc-out'); out.classList.add('is-swap'); setTimeout(() => { out.innerHTML = fitResult(c); out.classList.remove('is-swap'); }, 160); if (c) H.setGarage(c.id); }
      if (e.target.matches('[data-bnd]')) { e.target.closest('.bnd-i').classList.toggle('is-off', !e.target.checked); drawBundle(); }
      if (e.target.id === 'qty') { qty = Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)); e.target.value = qty; }
    });
    document.addEventListener('keydown', e => { if (!$('#lb.is-open')) return; if (e.key === 'ArrowRight') lbGo(1); if (e.key === 'ArrowLeft') lbGo(-1); if (e.key === 'Escape') closeLB(); });
  }

  /* ---------- lightbox ---------- */
  let li = 0;
  function openLB() {
    li = idx; const lb = $('#lb');
    lb.innerHTML = `<button class="lb-x" aria-label="Close">${ICON.close}</button><button class="lb-ar lb-p" aria-label="Previous">${ICON.left}</button><figure class="lb-f"><img id="lb-img" src="${IMG(p.img[li], 1600)}" alt=""></figure><button class="lb-ar lb-n" aria-label="Next">${ICON.right}</button><div class="lb-th">${p.img.map((s, i) => `<button data-li="${i}" class="${i === li ? 'is-on' : ''}"><img src="${IMG(s, 120)}" alt=""></button>`).join('')}</div><span class="lb-c mono">${esc(p.t)} — ${li + 1}/${p.img.length}</span>`;
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('is-locked');
    lb.onclick = e => { if (e.target.closest('.lb-x') || e.target === lb) closeLB(); else if (e.target.closest('.lb-p')) lbGo(-1); else if (e.target.closest('.lb-n')) lbGo(1); else if (e.target.closest('[data-li]')) { li = +e.target.closest('[data-li]').dataset.li - 0; lbGo(0); } };
  }
  function lbGo(d) { li = (li + d + p.img.length) % p.img.length; const im = $('#lb-img'); im.style.opacity = 0; setTimeout(() => { im.src = IMG(p.img[li], 1600); im.onload = () => im.style.opacity = 1; }, 150); $$('#lb [data-li]').forEach((x, i) => x.classList.toggle('is-on', i === li)); $('.lb-c').textContent = `${p.t} — ${li + 1}/${p.img.length}`; }
  function closeLB() { const lb = $('#lb'); lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('is-locked'); }

  render();
  H.rail($('#recs'), $('#rc-prev'), $('#rc-next'));
  H.on('market', render);
  H.on('garage', () => { const s = $('#fitc-sel'); if (s && H.myCast() && s.value !== H.myCast().id) { s.value = H.myCast().id; $('#fitc-out').innerHTML = fitResult(H.myCast()); } });
});
