/* HPZ — thank you / order status
   Shopify: Thank-you + Order status pages with Checkout UI extensions
   (purchase.thank-you.block.render / customer-account.order-status.block.render) */
HPZ.ready(() => {
  const H = HPZ, { $, $$, t, esc, IMG, money, ICON, C, S } = H;
  let o = S.orders.find(x => x.no === H.params().get('o')) || S.orders[0];
  if (!o) { // demo order so the page is reviewable on its own
    const items = [['hpz-wheels-model-six-bearing-series', 'Gold'], ['decal-set-hotwheels-honda-s2000-hks-super-gt', null]].map(([h, vn]) => { const p = H.byH(h); return { id: p.id, vid: H.vByName(p, vn).id, q: 1 }; });
    const sub = items.reduce((s, l) => s + H.variant(H.byId(l.id), l.vid).p * l.q, 0);
    o = { no: 'HPZ-260141', date: new Date().toISOString(), items, sub, disc: 0, add: 1.5, ship: 8.5, duty: 0, total: sub + 10, market: S.market, cur: H.mk().cur, shipName: H.mk().ship[0][1], eta: H.mk().ship[0][3], pay: H.isLocal() ? 'qris' : 'card', email: 'ricky@example.com', name: 'Ricky Ramadhan', addr: 'Torstraße 120, Berlin, 10119, Germany', phone: '+49 30 555 0142', points: Math.round(sub + 10) };
  }
  const first = (o.name || 'there').split(' ')[0];
  const payLabel = { card: t('Visa ending 4242', 'Visa berakhiran 4242', 'Visa 末尾4242'), paypal: 'PayPal', shop: 'Shop Pay', qris: 'QRIS', va: 'Virtual account BCA', ewallet: 'GoPay', klarna: 'Klarna', afterpay: 'Afterpay' }[o.pay] || o.pay;
  const payIcon = { card: 'visa', paypal: 'paypal', shop: 'shop', qris: 'qris', va: 'bca', ewallet: 'gopay', klarna: 'klarna', afterpay: 'afterpay' }[o.pay];

  function header() { $('#co-hdr').innerHTML = `${H.logo(false)}<ol class="co-steps"><li class="is-done">${t('Cart', 'Keranjang', 'カート')}</li><li class="is-done">${t('Information & payment', 'Data & pembayaran', '情報・お支払い')}</li><li class="is-on">${t('Confirmation', 'Konfirmasi', '確認')}</li></ol><a class="link small" href="index.html">${t('Continue shopping', 'Lanjut belanja', '買い物を続ける')}</a>`; }

  function render() {
    header();
    const items = o.items.map(l => { const p = H.byId(l.id); if (!p) return null; const v = H.variant(p, l.vid); return { ...l, p, v }; }).filter(Boolean);
    const hasW = items.some(l => l.p.k === 'wheels'), hasD = items.some(l => l.p.k === 'decals');
    const [ea, eb] = String(o.eta || '8–14').split('–').map(Number);
    const steps = [
      [t('Order confirmed', 'Pesanan dikonfirmasi', '注文確定'), t('Payment received', 'Pembayaran diterima', 'お支払い完了'), t('Now', 'Sekarang', '今'), 'done'],
      [t('Quality check', 'Quality check', '検品'), hasW ? t('Every wheel is spun and checked for wobble', 'Setiap velg diputar & dicek oleng', '全ホイールの振れを確認') : t('Parts inspected under a loupe', 'Part dicek dengan loupe', 'ルーペで検品'), t('Today', 'Hari ini', '本日'), 'now'],
      [t('Packed', 'Dikemas', '梱包'), t('Bagged, boxed and labelled in Semarang', 'Dikantong, dibox & dilabel di Semarang', 'スマランで梱包'), H.dfmt(H.addDays(1)), ''],
      [t('Shipped', 'Dikirim', '発送'), `${esc(o.shipName)} — ${t('tracking by email', 'resi via email', '追跡番号をメール')}${S.market === 'ID' ? ' & WhatsApp' : ''}`, H.dfmt(H.addDays(1)), ''],
      [t('Delivered', 'Diterima', 'お届け'), t('Estimated arrival', 'Perkiraan tiba', 'お届け予定'), o.eta === '0' ? t('Today', 'Hari ini', '本日') : `${H.dfmt(H.addDays(ea || 1))} – ${H.dfmt(H.addDays(eb || ea || 2))}`, ''],
    ];
    $('#ty').innerHTML = `<div class="ty-l">
      <div class="ty-hero"><div class="ty-check"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="27"/><path d="m18 31 8 8 16-17"/></svg></div>
        <div><span class="mono ty-no">${t('Order', 'Pesanan', '注文')} ${esc(o.no)}</span><h1 class="h1">${t('Thank you', 'Terima kasih', 'ありがとうございます')}, ${esc(first)}.</h1><p class="lead">${t('Your parts are reserved and heading to the bench for a final check. A confirmation is on its way to', 'Parts kamu sudah dikunci dan masuk pengecekan akhir. Konfirmasi dikirim ke', '確認メールを送信しました：')} <b>${esc(o.email || '')}</b>.</p></div></div>

      <div class="tl-card"><div class="tl-h"><h2>${t('What happens next', 'Langkah selanjutnya', '今後の流れ')}</h2><span class="mono xs muted">${t('Updated live', 'Update langsung', 'リアルタイム')}</span></div>
        <ol class="tl">${steps.map(([h, d, w, st], i) => `<li class="${st ? 'is-' + st : ''}" style="--i:${i}"><span class="tl-dot">${st === 'done' ? ICON.check : ''}</span><div><b>${h}</b><span>${d}</span></div><em class="mono">${w}</em></li>`).join('')}</ol>
        <label class="wa-opt"><span class="switch"><input type="checkbox" id="wa" ${S.market === 'ID' ? 'checked' : ''}><span></span></span><span>${ICON.wa}<b>${t('Send shipping updates to WhatsApp', 'Kirim update pengiriman ke WhatsApp', 'WhatsAppで配送通知')}</b><em class="mono">${esc(o.phone || '')}</em></span></label>
      </div>

      ${o.pay === 'va' ? `<div class="va-card"><span class="eyebrow"><b>${t('Pay to virtual account', 'Bayar ke virtual account', 'VAへ入金')}</b></span><b class="mono va-n">8806 0813 1016 7872</b><span class="xs muted">BCA · ${t('valid 24 hours', 'berlaku 24 jam', '24時間有効')}</span><button class="btn btn-sm btn-ghost" data-copy="880608131016787">${t('Copy number', 'Salin nomor', 'コピー')}</button></div>` : ''}

      <div class="ty-grid">
        <div class="ty-info"><h3>${t('Contact', 'Kontak', '連絡先')}</h3><p>${esc(o.email || '')}</p></div>
        <div class="ty-info"><h3>${t('Payment', 'Pembayaran', 'お支払い')}</h3><p class="ty-pay">${payIcon ? H.payIcons([payIcon]) : ''} ${esc(payLabel)} · <span class="mono">${money(o.total)}</span></p></div>
        <div class="ty-info"><h3>${t('Shipping address', 'Alamat pengiriman', '配送先')}</h3><p>${esc(o.name || '')}<br>${esc(o.addr || '')}</p></div>
        <div class="ty-info"><h3>${t('Shipping method', 'Metode pengiriman', '配送方法')}</h3><p>${esc(o.shipName)}${o.duty ? `<br><span class="tagddp mono">DDP</span> ${t('duties prepaid', 'bea prabayar', '関税前払い')}` : ''}</p></div>
      </div>

      <div class="ty-cards">
        <div class="pp-card"><span class="eyebrow"><b>Pit Points</b></span><div class="pp-n"><b class="mono" id="pp">0</b><span>${t('points earned', 'poin didapat', 'ポイント獲得')}</span></div><p class="small">${t('Create an account to keep them — they are worth', 'Buat akun untuk menyimpannya — senilai', 'アカウント作成で保存 — 価値')} ${money(o.points / 100)} ${t('on your next order.', 'di order berikutnya.', '')}</p>
          <form class="pp-f" id="pp-f"><input class="input" type="password" placeholder="${t('Choose a password', 'Buat password', 'パスワード')}" required minlength="6"><button class="btn btn-signal">${t('Save points', 'Simpan poin', '保存')}</button></form></div>
        <div class="share-card mat"><span class="eyebrow"><b>${t('When it arrives', 'Saat paket tiba', '到着したら')}</b></span><h3>${t('Show us the build.', 'Tunjukkan build-mu.', 'ビルドを見せてください。')}</h3><p>${t('Tag @hpzdiecast or upload it to Built by You. Featured builds earn 500 Pit Points.', 'Tag @hpzdiecast atau upload ke Karya Kalian. Build terpilih dapat 500 Pit Points.', '@hpzdiecastをタグ付け。掲載で500ポイント。')}</p><a class="btn btn-line" href="builds.html#submit">${ICON.camera}${t('Submit a build', 'Kirim build', '投稿する')}</a></div>
      </div>
    </div>

    <aside class="co-s ty-s"><div class="co-s-in">
      <h3 class="ty-sh">${t('Order summary', 'Ringkasan', '注文内容')}</h3>
      <ul class="co-items">${items.map(l => `<li><span class="co-im"><img src="${IMG(l.p.img[l.v.i > -1 ? l.v.i : 0], 140)}" alt=""><i class="mono">${l.q}</i></span><span class="co-it"><b>${esc(l.p.t)}</b><em>${l.v.n ? esc(l.v.n) + ' · ' : ''}${esc(H.brand(l.p).n)}</em></span><span class="mono">${money(l.v.p * l.q)}</span></li>`).join('')}</ul>
      <dl class="tot">
        <div><dt>${t('Subtotal', 'Subtotal', '小計')}</dt><dd class="mono">${money(o.sub)}</dd></div>
        ${o.disc ? `<div class="is-g"><dt>${t('Discounts', 'Diskon', '割引')}</dt><dd class="mono">−${money(o.disc)}</dd></div>` : ''}
        ${o.add ? `<div><dt>${t('Add-ons', 'Tambahan', 'オプション')}</dt><dd class="mono">${money(o.add)}</dd></div>` : ''}
        <div><dt>${t('Shipping', 'Ongkir', '送料')}</dt><dd class="mono">${o.ship ? money(o.ship) : t('Free', 'Gratis', '無料')}</dd></div>
        ${o.duty ? `<div><dt>${t('Duties (DDP)', 'Bea (DDP)', '関税')}</dt><dd class="mono">${money(o.duty)}</dd></div>` : ''}
        <div class="is-tot"><dt>${t('Paid', 'Dibayar', '支払額')}</dt><dd><small class="mono">${H.mk().cur}</small> <b class="mono">${money(o.total)}</b></dd></div>
      </dl>
      <div class="ty-acts"><a class="btn btn-ink btn-block" href="account.html#orders">${ICON.truck}${t('Track this order', 'Lacak pesanan', '注文を追跡')}</a><button class="btn btn-ghost btn-block" onclick="window.print()">${ICON.box}${t('Print receipt', 'Cetak struk', '領収書を印刷')}</button></div>
      <p class="xs muted">${t('Questions about this order? Reply to the confirmation email or message us on WhatsApp with', 'Ada pertanyaan? Balas email konfirmasi atau WhatsApp kami dengan nomor', 'ご質問は注文番号を添えて：')} <b class="mono">${esc(o.no)}</b>.</p>
    </div></aside>`;

    const g = hasD ? C.GUIDES.find(x => x.id === 'waterslide') : C.GUIDES.find(x => x.id === 'wheel-swap');
    const gp = H.byH(g.img);
    const recs = H.query({ avail: 1, sort: 'best' }).filter(p => !items.some(l => l.id === p.id) && p.k !== 'wheels').slice(0, 3);
    $('#ty-more').innerHTML = `<div class="tm"><a class="tm-g" href="academy.html?a=${g.id}"><img src="${IMG(gp.img[0], 700)}" alt=""><div><span class="eyebrow"><b>${t('While you wait', 'Sambil menunggu', 'お待ちの間に')}</b></span><h3 class="h3">${esc(g.t)}</h3><p class="small">${esc(g.d)}</p><span class="arrow-link small">${g.min} min · ${t('Read the guide', 'Baca panduan', 'ガイドを読む')} ${ICON.arrow}</span></div></a>
      <div class="tm-r"><span class="eyebrow"><b>${t('Add to your next order', 'Untuk order berikutnya', '次回の注文に')}</b></span><div class="grid" style="--cols:3">${recs.map((p, i) => H.card(p, { i })).join('')}</div></div></div>`;

    H.reveal(); H.applyI18n();
    setTimeout(() => H.countUp($('#pp'), o.points, { dur: 1400 }), 700);
  }

  function confetti() {
    if (document.documentElement.classList.contains('static') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const host = document.createElement('div'); host.className = 'confetti'; document.body.appendChild(host);
    const cols = ['#e5306b', '#ffb000', '#12a197', '#ffd100', '#0e0f11'];
    const r = $('.ty-check').getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 70; i++) {
      const e = document.createElement('i'); e.style.background = cols[i % cols.length]; e.style.left = cx + 'px'; e.style.top = cy + 'px';
      if (i % 3 === 0) { e.style.width = '6px'; e.style.height = '6px'; e.style.borderRadius = '50%'; }
      host.appendChild(e);
      const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 320;
      e.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d * .6 - 60}px) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: .6 }, { transform: `translate(${Math.cos(a) * d * 1.1}px, ${Math.sin(a) * d * .6 + 220}px) rotate(${Math.random() * 1080}deg)`, opacity: 0 }], { duration: 1600 + Math.random() * 900, delay: 500, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'forwards' });
    }
    setTimeout(() => host.remove(), 3500);
  }

  document.addEventListener('submit', e => { if (e.target.id !== 'pp-f') return; e.preventDefault(); e.target.innerHTML = `<p class="pp-ok">${ICON.tick}${t('Account created — points saved.', 'Akun dibuat — poin tersimpan.', 'アカウント作成完了。')}</p>`; });
  document.addEventListener('change', e => { if (e.target.id === 'wa') H.toast({ title: e.target.checked ? t('WhatsApp updates on', 'Update WhatsApp aktif', 'WhatsApp通知オン') : t('WhatsApp updates off', 'Update WhatsApp nonaktif', 'オフ'), icon: ICON.wa }); });
  document.addEventListener('click', e => { const c = e.target.closest('[data-copy]'); if (c) { navigator.clipboard && navigator.clipboard.writeText(c.dataset.copy); H.toast({ title: t('Copied', 'Disalin', 'コピーしました'), sub: c.dataset.copy }); } });

  render(); confetti();
  H.on('market', render);
});
