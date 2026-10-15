/* HPZ — cart page
   Shopify: sections/main-cart-items.liquid, main-cart-footer.liquid; cart attributes for add-ons / note;
   discount via /discount/CODE or checkout; shipping estimate via /cart/shipping_rates.json */
HPZ.ready(() => {
  const H = HPZ, { $, $$, t, esc, IMG, money, ICON, C, S } = H;
  let code = H.LS.get('code', ''), ship = H.LS.get('ship', null), later = H.LS.get('later', []);
  const m = () => H.mk();

  function lineRow(l) {
    const p = l.p, v = l.v, st = H.stockOf(p);
    return `<div class="cr cl" data-vid="${v.id}">
      <a class="cr-img" href="product.html?h=${p.h}&variant=${v.id}"><img src="${IMG(p.img[v.i > -1 ? v.i : 0], 260)}" alt=""></a>
      <div class="cr-info"><span class="cl-brand">${esc(H.brand(p).n)} · <span class="mono">${H.partNo(p)}</span></span><a class="cr-t" href="product.html?h=${p.h}&variant=${v.id}">${esc(p.t)}</a>
        <div class="cr-meta">${v.n ? `<span class="cl-v">${H.swatchBg(v.n) ? `<i style="--c:${H.swatchBg(v.n)}"></i>` : ''}${esc(v.n)}</span>` : ''}${H.specLine(p).slice(0, 2).map(s => `<span class="mono">${esc(s)}</span>`).join('')}</div>
        ${l.bundle ? `<span class="cl-bundle">${ICON.layers} ${t('Build bundle — 10% off applied', 'Bundle build — diskon 10%', 'ビルドセット10%オフ')}</span>` : ''}
        ${H.fitTag(p)}
        <div class="cr-act"><span class="cr-stock"><i class="dot ${st <= 4 ? 'low' : ''}"></i>${st <= 4 ? `${t('Only', 'Sisa', '残り')} ${st} ${t('left', '', '')}` : t('In stock', 'Ready', '在庫あり')}</span><button class="link xs" data-later="${v.id}">${t('Save for later', 'Simpan nanti', 'あとで買う')}</button><button class="link xs" data-rm="${v.id}">${t('Remove', 'Hapus', '削除')}</button></div></div>
      <div class="qty"><button data-q="-1" aria-label="−">${ICON.minus}</button><input value="${l.q}" inputmode="numeric" aria-label="Qty" data-qi><button data-q="1" aria-label="+">${ICON.plus}</button></div>
      <div class="cr-p"><b class="mono">${money(l.line * (l.bundle ? .9 : 1))}</b>${l.q > 1 ? `<span class="mono xs muted">${money(v.p)} × ${l.q}</span>` : ''}${v.c ? `<s class="mono xs">${money(v.c * l.q)}</s>` : ''}</div>
    </div>`;
  }

  function summary(T) {
    const mk = m(); const opts = mk.ship;
    const sel = ship && opts.find(o => o[0] === ship) ? ship : opts[0][0];
    const T2 = H.totals({ ship: sel, code });
    return `<aside class="sum">
      ${$('#tachwrap') ? '' : ''}<div class="sum-free" id="tachwrap"></div>
      <div class="sum-b">
        <h3 class="sum-h">${t('Order summary', 'Ringkasan pesanan', '注文概要')}</h3>
        <div class="addons">${Object.entries(H.ADDON).map(([k, a]) => `<label class="addon"><span class="switch"><input type="checkbox" data-addon="${k}" ${S.addons[k] ? 'checked' : ''}><span></span></span><span class="addon-t"><b>${a.n()}</b></span><span class="mono">+${money(a.usd)}</span></label>`).join('')}</div>
        <div class="sum-ship"><div class="sum-row"><span class="lbl">${t('Ship to', 'Kirim ke', '配送先')}</span><button class="link small" data-open="market">${H.FLAG[mk.flag]} ${mk.n} · ${mk.cur}</button></div>
          ${opts.map(o => `<label class="sh-o ${o[0] === sel ? 'is-on' : ''}"><input type="radio" name="ship" value="${o[0]}" ${o[0] === sel ? 'checked' : ''}><span class="sh-r"></span><span class="sh-t"><b>${esc(o[1])}</b><em class="mono">${H.eta(o[3])}</em></span><span class="mono">${o === opts[0] && T2.sub - T2.bundle >= mk.free ? `<s>${money(o[2])}</s> ${t('Free', 'Gratis', '無料')}` : money(o[2])}</span></label>`).join('')}</div>
        <form class="code" id="code-f"><input class="input" id="code" placeholder="${t('Discount code', 'Kode diskon', '割引コード')}" value="${esc(code)}" ${code ? 'disabled' : ''}>${code ? `<button type="button" class="btn btn-ghost" id="code-x">${t('Remove', 'Hapus', '削除')}</button>` : `<button class="btn btn-ink">${t('Apply', 'Pakai', '適用')}</button>`}</form>
        ${code ? `<div class="code-ok">${ICON.tag}<b class="mono">${esc(code)}</b> — ${t('10% off parts', 'diskon 10% parts', 'パーツ10%オフ')}</div>` : `<p class="xs muted">${t('Try', 'Coba', '例')} <button class="link mono" data-try>PITCREW10</button></p>`}
        <dl class="tot">
          <div><dt>${t('Subtotal', 'Subtotal', '小計')}</dt><dd class="mono">${money(T2.sub)}</dd></div>
          ${T2.bundle ? `<div class="is-g"><dt>${t('Build bundle', 'Bundle build', 'セット割')}</dt><dd class="mono">−${money(T2.bundle)}</dd></div>` : ''}
          ${T2.disc ? `<div class="is-g"><dt>${t('Discount', 'Diskon', '割引')} (${esc(code)})</dt><dd class="mono">−${money(T2.disc)}</dd></div>` : ''}
          ${T2.add ? `<div><dt>${t('Add-ons', 'Tambahan', 'オプション')}</dt><dd class="mono">${money(T2.add)}</dd></div>` : ''}
          <div><dt>${t('Shipping', 'Ongkir', '送料')}</dt><dd class="mono">${T2.ship ? money(T2.ship) : t('Free', 'Gratis', '無料')}</dd></div>
          ${mk.duty ? `<div><dt>${t('Duties & tariffs (DDP)', 'Bea & tarif (DDP)', '関税 (DDP)')} <button class="tip" data-tip="${t('Collected now so the courier never asks you to pay on delivery.', 'Dibayar sekarang supaya kurir tidak menagih saat diterima.', '配達時の支払いは不要です。')}">${ICON.info}</button></dt><dd class="mono">${money(T2.duty)}</dd></div>` : ''}
          <div class="is-tot"><dt>${t('Total', 'Total', '合計')}</dt><dd><small class="mono">${mk.cur}</small> <b class="mono" id="tot">${money(T2.total)}</b></dd></div>
        </dl>
        ${T2.save > 0 ? `<p class="sum-save">${ICON.tag}${t('You are saving', 'Kamu hemat', '割引額')} <b class="mono">${money(T2.save + T2.disc)}</b> ${t('on this order', 'di pesanan ini', '')}</p>` : ''}
        <a class="btn btn-signal btn-lg btn-block" href="checkout.html">${ICON.lock}${t('Secure checkout', 'Checkout aman', '安全に購入手続き')}</a>
        <div class="xpay"><span class="xs muted">${t('or express checkout', 'atau checkout cepat', 'またはエクスプレス')}</span><div>${(H.isLocal() ? ['qris', 'gopay', 'bca'] : S.market === 'US' ? ['shop', 'paypal', 'apple'] : ['paypal', 'apple', 'gpay']).map(k => `<a href="checkout.html" class="xp xp-${k}">${H.PAYM[k][0]}</a>`).join('')}</div></div>
        <ul class="sum-trust"><li>${ICON.shield}${t('Encrypted payment — we never see your card', 'Pembayaran terenkripsi', '暗号化決済')}</li><li>${ICON.ruler}${t('Fitment guarantee on every wheel set', 'Garansi fitment untuk setiap set velg', '全ホイールに適合保証')}</li><li>${ICON.box}${t('30-day returns on unopened parts', 'Retur 30 hari untuk part belum dibuka', '未開封30日返品')}</li></ul>
      </div></aside>`;
  }

  function render() {
    const T = H.totals();
    $('#cart-n').textContent = T.count ? `(${T.count})` : '';
    if (!T.items.length) {
      $('#cart').innerHTML = `<div class="cart-empty"><div class="ce-w">${H.wheelSVG({ spokes: 6, finish: 'gunmet' })}</div><h2 class="h2">${t('Your cart is empty', 'Keranjang masih kosong', 'カートは空です')}</h2><p class="lead">${t('Nothing on the bench yet. Start with wheels, or let the planner pick parts for your casting.', 'Belum ada apa-apa. Mulai dari velg, atau biarkan planner memilih parts untuk casting-mu.', 'まずはホイールから。')}</p><div class="ce-a"><a class="btn btn-signal btn-lg" href="shop.html?k=wheels">${t('Shop wheels', 'Belanja velg', 'ホイール')}</a><a class="btn btn-line btn-lg" href="planner.html">${t('Open Build Planner', 'Buka Build Planner', 'ビルドプランナー')}</a></div>${later.length ? `<div class="later">${laterHTML()}</div>` : ''}</div>`;
      $('#xs-s').hidden = true; return;
    }
    $('#xs-s').hidden = false;
    const mk = m();
    $('#cart').innerHTML = `<div class="cart-l">
        ${mk.duty ? `<div class="note-us">${ICON.info}<div><b>${t('Shipping to the United States', 'Kirim ke Amerika Serikat', '米国への配送')}</b><span>${t('Since the end of the $800 de minimis exemption, all imports carry duties. We calculate and prepay them at checkout (DDP), so there is nothing to pay on delivery.', 'Sejak berakhirnya pembebasan $800, semua impor kena bea. Kami hitung & bayar di checkout (DDP).', '関税は決済時に前払い（DDP）。')}</span></div></div>` : ''}
        <div class="cr-head"><span>${t('Part', 'Part', 'パーツ')}</span><span>${t('Qty', 'Jml', '数量')}</span><span>${t('Total', 'Total', '合計')}</span></div>
        <div class="cr-list">${T.items.map(lineRow).join('')}</div>
        <div class="cart-note"><label class="lbl" for="note">${t('Note for the workshop', 'Catatan untuk workshop', '工房へのメモ')}</label><textarea class="textarea" id="note" placeholder="${t('e.g. “Please pack the decal flat”, “Gift — no invoice”', 'mis. “Decal jangan dilipat”, “Hadiah — tanpa invoice”', '例：デカールを平らに梱包')}">${esc(H.LS.get('note', ''))}</textarea></div>
        ${later.length ? `<div class="later">${laterHTML()}</div>` : ''}
      </div>${summary(T)}`;
    drawTach();
  }
  function laterHTML() {
    return `<h3 class="h4">${t('Saved for later', 'Disimpan untuk nanti', 'あとで買う')} <span class="mono muted">(${later.length})</span></h3><div class="later-l">${later.map(l => { const p = H.byId(l.id); if (!p) return ''; const v = H.variant(p, l.vid); return `<div class="lt"><img src="${IMG(p.img[v.i > -1 ? v.i : 0], 140)}" alt=""><div><b>${esc(p.t)}</b><span class="mono xs">${v.n ? esc(v.n) + ' · ' : ''}${money(v.p)}</span></div><button class="btn btn-sm btn-ghost" data-back="${v.id}">${t('Move to cart', 'Pindah ke keranjang', 'カートへ')}</button></div>`; }).join('')}</div>`;
  }
  function drawTach() {
    const T = H.totals(); const done = T.toFree <= 0; const ratio = T.free ? (T.sub - T.bundle) / T.free : 1;
    const el = $('#tachwrap'); if (!el) return;
    el.className = 'sum-free free ' + (done ? 'is-done' : '');
    el.innerHTML = `${H.tach(ratio, done)}<div class="free-t">${done ? `<b>${t('Free shipping unlocked', 'Gratis ongkir aktif', '送料無料達成')}</b><span>${t('Redline. Standard tracked shipping is on us.', 'Redline. Ongkir standar kami tanggung.', 'レッドライン到達。')}</span>` : `<b><span class="mono">${money(T.toFree)}</span> ${t('to free shipping', 'lagi untuk gratis ongkir', 'で送料無料')}</b><span>${t('Add a decal sheet or a set of tyres.', 'Tambah decal atau ban.', 'デカール等を追加')}</span>`}</div>`;
    const nd = $('.tach-needle', el); const a = nd.style.getPropertyValue('--a'); nd.style.setProperty('--a', drawTach.last || '-120deg'); requestAnimationFrame(() => requestAnimationFrame(() => nd.style.setProperty('--a', a))); drawTach.last = a;
  }
  function drawXS() {
    const inCart = new Set(S.cart.map(l => l.id)); const c = H.myCast();
    let pool = H.query({ avail: 1, sort: 'best' }).filter(p => !inCart.has(p.id) && p.k !== 'wheels');
    if (c) pool = pool.sort((a, b) => (c.m.test(b.full) - c.m.test(a.full)));
    $('#xs').innerHTML = pool.slice(0, 12).map((p, i) => H.card(p, { i, reveal: false })).join('');
  }

  document.addEventListener('change', e => {
    if (e.target.name === 'ship') { ship = e.target.value; H.LS.set('ship', ship); render(); }
    if (e.target.id === 'note') H.LS.set('note', e.target.value);
  });
  document.addEventListener('click', e => {
    const tg = e.target;
    const lt = tg.closest('[data-later]'); if (lt) { const l = S.cart.find(x => String(x.vid) === lt.dataset.later); later = [l, ...later]; H.LS.set('later', later); S.cart = S.cart.filter(x => x !== l); H.LS.set('cart', S.cart); H.emit('cart'); H.toast({ title: t('Saved for later', 'Disimpan untuk nanti', '保存しました'), sub: H.byId(l.id).t }); return; }
    const bk = tg.closest('[data-back]'); if (bk) { const l = later.find(x => String(x.vid) === bk.dataset.back); later = later.filter(x => x !== l); H.LS.set('later', later); H.addToCart(l.id, l.vid, l.q); return; }
    if (tg.closest('[data-try]')) { $('#code').value = 'PITCREW10'; $('#code-f').requestSubmit(); return; }
    if (tg.closest('#code-x')) { code = ''; H.LS.set('code', ''); render(); return; }
  });
  document.addEventListener('submit', e => {
    if (e.target.id !== 'code-f') return; e.preventDefault();
    const v = $('#code').value.trim().toUpperCase(); const btn = $('#code-f .btn');
    btn.classList.add('is-loading'); btn.insertAdjacentHTML('beforeend', '<span class="spin"></span>');
    setTimeout(() => {
      if (v === 'PITCREW10') { const before = H.totals({ ship: ship || m().ship[0][0] }).total; code = v; H.LS.set('code', code); render(); const el = $('#tot'); H.countUp(el, H.moneyRaw(H.totals({ ship: ship || m().ship[0][0], code }).total), { from: H.moneyRaw(before), dur: 900, fmt: x => H.fmt(x) }); $('.code-ok').classList.add('pop-in'); }
      else { btn.classList.remove('is-loading'); $('.spin', btn).remove(); const i = $('#code'); i.classList.add('is-err', 'shake'); setTimeout(() => i.classList.remove('shake'), 500); H.toast({ title: t('Code not valid', 'Kode tidak valid', '無効なコード'), sub: v || '—', icon: ICON.info }); }
    }, 600);
  });

  render(); drawXS(); H.rail($('#xs'), $('#x-prev'), $('#x-next'));
  H.on('cart', () => { render(); drawXS(); });
  H.on('market', () => { ship = null; render(); drawXS(); });
});
