/* HPZ — checkout (mockup of Shopify Checkout)
   Real build: Shopify Checkout + branding API; extensions = fitment reminder, rigid-box upsell,
   DDP duties line (Markets / Managed Markets), Pit Points earn banner; payments via Shopify Payments,
   PayPal, and for Indonesia a local gateway (Xendit / Midtrans) for QRIS, VA and e-wallets. */
HPZ.ready(() => {
  const H = HPZ, { $, $$, t, esc, IMG, money, ICON, C, S } = H;
  // seed a demo cart so the page is always reviewable
  if (!S.cart.length) { [['hpz-wheels-model-te37-sl-bearing-series', 'Gold', 1], ['decal-set-hotwheels-skyline-r34-nismo-z-tune', null, 1], ['add-on-body-kit-for-hot-wheels-skyline-r34', null, 1]].forEach(([h, vn, q]) => { const p = H.byH(h); if (p) S.cart.push({ id: p.id, vid: H.vByName(p, vn).id, q }); }); H.LS.set('cart', S.cart); }

  const COUNTRIES = [['US', 'United States', 'US'], ['DE', 'Germany', 'EU'], ['FR', 'France', 'EU'], ['NL', 'Netherlands', 'EU'], ['IT', 'Italy', 'EU'], ['ES', 'Spain', 'EU'], ['GB', 'United Kingdom', 'GB'], ['AU', 'Australia', 'AU'], ['JP', 'Japan', 'JP'], ['SG', 'Singapore', 'SG'], ['MY', 'Malaysia', 'MY'], ['ID', 'Indonesia', 'ID'], ['CA', 'Canada', 'INT'], ['PH', 'Philippines', 'INT'], ['TH', 'Thailand', 'INT'], ['AE', 'United Arab Emirates', 'INT']];
  const defCountry = { US: 'US', EU: 'DE', GB: 'GB', AU: 'AU', JP: 'JP', SG: 'SG', MY: 'MY', ID: 'ID', INT: 'CA' };
  const D = H.LS.get('co', {}); // form draft
  if (!D.country || (COUNTRIES.find(c => c[0] === D.country) || [])[2] !== S.market) D.country = defCountry[S.market];
  let ship = null, pay = null, code = H.LS.get('code', '');

  const mk = () => H.mk();
  const local = () => H.isLocal();
  const PAYS = () => local()
    ? [['qris', 'QRIS', t('Scan with any bank or e-wallet app', 'Scan dari aplikasi bank / e-wallet apa pun', ''), ['qris']], ['va', t('Virtual account', 'Virtual account', 'バーチャル口座'), 'BCA · Mandiri · BNI · BRI', ['bca', 'mandiri', 'bni']], ['ewallet', 'GoPay / OVO / DANA', t('Redirect to your e-wallet', 'Diarahkan ke e-wallet', ''), ['gopay', 'ovo']], ['card', t('Credit / debit card', 'Kartu kredit / debit', 'カード'), 'Visa · Mastercard · JCB', ['visa', 'mc']]]
    : [['card', t('Credit / debit card', 'Kartu kredit / debit', 'クレジットカード'), t('All major cards, 3-D Secure', 'Semua kartu utama, 3-D Secure', '主要カード対応'), ['visa', 'mc', 'amex']], ['paypal', 'PayPal', t('Pay with your PayPal balance or card', 'Bayar dengan saldo PayPal', ''), ['paypal']],
      ...(S.market === 'US' ? [['shop', 'Shop Pay', t('Pay in full or in 4 interest-free installments', 'Bayar penuh atau 4x cicilan', '4回払い'), ['shop']]] : []),
      ...(S.market === 'EU' ? [['klarna', 'Klarna', t('Pay later in 30 days', 'Bayar 30 hari kemudian', ''), ['klarna']]] : []),
      ...(S.market === 'AU' ? [['afterpay', 'Afterpay', t('4 payments, interest-free', '4x cicilan tanpa bunga', ''), ['afterpay']]] : [])];

  const field = (id, label, o = {}) => `<div class="fl ${o.cls || ''}"><input class="input" id="${id}" name="${id}" placeholder=" " value="${esc(D[id] || '')}" ${o.type ? `type="${o.type}"` : ''} ${o.req === false ? '' : 'required'} ${o.ac ? `autocomplete="${o.ac}"` : ''} ${o.im ? `inputmode="${o.im}"` : ''}><label for="${id}">${label}${o.req === false ? ` <span class="muted">(${t('optional', 'opsional', '任意')})</span>` : ''}</label><span class="err-msg">${o.err || t('Required', 'Wajib diisi', '必須')}</span></div>`;

  function header() {
    $('#co-hdr').innerHTML = `${H.logo(false)}<ol class="co-steps"><li class="is-done"><a href="cart.html">${t('Cart', 'Keranjang', 'カート')}</a></li><li class="is-on">${t('Information & payment', 'Data & pembayaran', '情報・お支払い')}</li><li>${t('Confirmation', 'Konfirmasi', '確認')}</li></ol><span class="co-sec">${ICON.lock}${t('Secure checkout', 'Checkout aman', '安全な決済')}</span>`;
  }

  function form() {
    const m = mk(); const opts = m.ship; if (!ship || !opts.find(o => o[0] === ship)) ship = opts[0][0];
    const pays = PAYS(); if (!pay || !pays.find(p => p[0] === pay)) pay = pays[0][0];
    const T = H.totals({ ship, code });
    const id = local();
    return `<section class="co-f">
      <button class="demo-fill" id="demo-fill" type="button">${ICON.bolt}${t('Autofill demo details', 'Isi data demo', 'デモ入力')}</button>
      <div class="xp-b"><span class="co-lbl">${t('Express checkout', 'Checkout cepat', 'エクスプレス')}</span><div class="xp-row">${(id ? ['qris', 'gopay', 'ovo'] : S.market === 'US' ? ['shop', 'paypal', 'apple', 'gpay'] : ['paypal', 'apple', 'gpay']).map(k => `<button type="button" class="xpb xpb-${k}" data-xp="${k}">${H.PAYM[k][0]}</button>`).join('')}</div><div class="or"><span>${t('or', 'atau', 'または')}</span></div></div>

      <form id="co-form" novalidate>
      <div class="co-sec-b"><div class="co-sh"><h2>${t('Contact', 'Kontak', '連絡先')}</h2><a class="link small" href="account.html?login">${t('Sign in', 'Masuk', 'ログイン')}</a></div>
        ${field('email', t('Email', 'Email', 'メール'), { type: 'email', ac: 'email', err: t('Enter a valid email', 'Masukkan email yang valid', '有効なメール') })}
        <label class="check"><input type="checkbox" id="news" ${D.news !== false ? 'checked' : ''}><span class="box">${ICON.check}</span><span>${t('Email me drop alerts and restocks', 'Kirimi saya info rilis & restock', '新作・再入荷のお知らせ')}</span></label></div>

      <div class="co-sec-b"><div class="co-sh"><h2>${t('Delivery', 'Pengiriman', '配送先')}</h2></div>
        <div class="fl"><select class="select" id="country">${COUNTRIES.map(([c, n]) => `<option value="${c}" ${c === D.country ? 'selected' : ''}>${n}</option>`).join('')}</select><label>${t('Country / region', 'Negara', '国・地域')}</label></div>
        <div class="row2">${field('first', t('First name', 'Nama depan', '名'), { ac: 'given-name' })}${field('last', t('Last name', 'Nama belakang', '姓'), { ac: 'family-name' })}</div>
        <div class="ac-wrap">${field('addr', id ? t('Street address', 'Alamat lengkap (jalan, no. rumah, RT/RW)', '住所') : t('Address', 'Alamat', '住所'), { ac: 'address-line1' })}<div class="ac-list" id="ac-list"></div></div>
        ${field('addr2', id ? t('Kecamatan / kelurahan', 'Kecamatan / kelurahan', '') : t('Apartment, suite, etc.', 'Apartemen, unit, dll.', '建物名・部屋番号'), { req: !!id, ac: 'address-line2' })}
        <div class="row3">${field('city', id ? t('City / regency', 'Kota / kabupaten', '') : t('City', 'Kota', '市区町村'), { ac: 'address-level2' })}${['US', 'AU', 'ID', 'JP', 'MY'].includes(D.country) ? field('state', id ? t('Province', 'Provinsi', '') : D.country === 'JP' ? '都道府県 / Prefecture' : t('State', 'Negara bagian', '州'), { ac: 'address-level1' }) : ''}${field('zip', D.country === 'US' ? 'ZIP code' : t('Postal code', 'Kode pos', '郵便番号'), { ac: 'postal-code', im: 'numeric' })}</div>
        ${field('phone', id ? t('WhatsApp number', 'Nomor WhatsApp', '') : t('Phone (for courier updates)', 'Telepon (untuk kurir)', '電話（配送連絡用）'), { type: 'tel', ac: 'tel', req: id || m.duty ? true : false })}
        ${m.duty ? `<p class="co-note">${ICON.shield}${t('Courier needs a phone number to clear US customs under DDP.', 'Kurir butuh nomor telepon untuk clearance bea cukai US (DDP).', '米国通関に電話番号が必要です。')}</p>` : ''}
      </div>

      <div class="co-sec-b"><div class="co-sh"><h2>${t('Shipping method', 'Metode pengiriman', '配送方法')}</h2></div>
        <div class="opts">${opts.map((o, i) => { const free = i === 0 && T.sub - T.bundle >= m.free; return `<label class="opt ${o[0] === ship ? 'is-on' : ''}"><input type="radio" name="ship" value="${o[0]}" ${o[0] === ship ? 'checked' : ''}><span class="sh-r"></span><span class="opt-t"><b>${esc(o[1])}</b><em>${o[3] === '0' ? t('Today, before 21:00', 'Hari ini, sebelum 21:00', '本日') : `${H.eta(o[3])} · ${o[3]} ${t('business days', 'hari kerja', '営業日')}`}</em></span><span class="mono">${free ? `<s>${money(o[2])}</s> <b>${t('Free', 'Gratis', '無料')}</b>` : money(o[2])}</span></label>`; }).join('')}</div>
        <label class="up-box"><span class="switch"><input type="checkbox" data-addon="box" ${S.addons.box ? 'checked' : ''}><span></span></span><span><b>${t('Upgrade to a crush-proof rigid box', 'Upgrade ke box rigid anti-penyok', '耐圧ボックスに変更')} <span class="mono">+${money(H.ADDON.box.usd)}</span></b><em>${t('Recommended for resin body kits and long-haul shipping.', 'Disarankan untuk body kit resin & pengiriman jauh.', 'レジンキットにおすすめ。')}</em></span></label>
      </div>

      <div class="co-sec-b"><div class="co-sh"><h2>${t('Payment', 'Pembayaran', 'お支払い')}</h2><span class="xs muted">${ICON.lock} ${t('All transactions are secure and encrypted.', 'Semua transaksi aman & terenkripsi.', '暗号化されています。')}</span></div>
        <div class="pays-l">${pays.map(([k, n, d, logos]) => `<div class="pm-o ${k === pay ? 'is-on' : ''}" data-pm="${k}"><label class="pm-h"><input type="radio" name="pay" value="${k}" ${k === pay ? 'checked' : ''}><span class="sh-r"></span><span class="pm-n"><b>${n}</b><em>${d}</em></span>${H.payIcons(logos)}</label><div class="pm-b">${payBody(k)}</div></div>`).join('')}</div>
        <label class="check"><input type="checkbox" id="bill" checked><span class="box">${ICON.check}</span><span>${t('Billing address same as delivery', 'Alamat tagihan sama dengan pengiriman', '請求先は配送先と同じ')}</span></label>
      </div>

      <div class="pts">${ICON.spark}<span>${t('This order earns', 'Pesanan ini dapat', 'この注文で獲得：')} <b class="mono">${Math.round(T.total)}</b> Pit Points — ${t('worth', 'senilai', '相当')} ${money(Math.round(T.total) / 100)} ${t('on your next order', 'di order berikutnya', '次回利用可')}</span></div>

      <button class="btn btn-signal btn-lg btn-block co-paybtn" id="paybtn" type="submit"><span>${pay === 'qris' ? t('Show QRIS code', 'Tampilkan QRIS', 'QRISを表示') : pay === 'va' ? t('Get virtual account number', 'Dapatkan nomor VA', 'VA番号を取得') : pay === 'paypal' ? t('Continue to PayPal', 'Lanjut ke PayPal', 'PayPalへ') : t('Pay now', 'Bayar sekarang', '支払う')} · <span class="mono">${money(T.total)}</span></span><span class="spin"></span></button>
      <p class="co-terms xs muted">${t('By placing your order you agree to our Terms and Refund policy. Parts are shipped from Semarang, Indonesia.', 'Dengan memesan kamu menyetujui Ketentuan & Kebijakan Refund kami. Dikirim dari Semarang, Indonesia.', '')}</p>
      </form>
      <nav class="co-legal xs"><a href="#">${t('Refund policy', 'Kebijakan refund', '返金')}</a><a href="#">${t('Shipping', 'Pengiriman', '配送')}</a><a href="#">${t('Privacy', 'Privasi', 'プライバシー')}</a><a href="#">${t('Terms', 'Ketentuan', '規約')}</a></nav>
    </section>`;
  }
  function payBody(k) {
    if (k === 'card') return `<div class="card-f"><div class="fl cc"><input class="input" id="ccn" placeholder=" " inputmode="numeric" autocomplete="cc-number" value="${esc(D.ccn || '')}"><label for="ccn">${t('Card number', 'Nomor kartu', 'カード番号')}</label><span class="cc-brand" id="cc-brand">${ICON.lock}</span><span class="err-msg">${t('Enter a valid card number', 'Nomor kartu tidak valid', '有効なカード番号')}</span></div><div class="row2">${field('exp', t('Expiry (MM / YY)', 'Kedaluwarsa (BB / TT)', '有効期限'), { im: 'numeric', ac: 'cc-exp' })}${field('cvc', t('Security code', 'Kode keamanan', 'セキュリティコード'), { im: 'numeric', ac: 'cc-csc' })}</div>${field('ccname', t('Name on card', 'Nama di kartu', 'カード名義'), { ac: 'cc-name' })}</div>`;
    if (k === 'va') return `<div class="va-b">${['BCA', 'Mandiri', 'BNI', 'BRI'].map((b, i) => `<label class="va-o"><input type="radio" name="bank" value="${b}" ${i === 0 ? 'checked' : ''}><span>${b}</span></label>`).join('')}</div><p class="xs muted">${t('You will get a VA number valid for 24 hours. Payment is confirmed automatically.', 'Kamu akan dapat nomor VA berlaku 24 jam. Pembayaran terkonfirmasi otomatis.', '')}</p>`;
    if (k === 'qris') return `<p class="pm-txt">${t('A QR code appears after you click pay. Scan it with BCA, Mandiri, GoPay, OVO, DANA, ShopeePay or any QRIS app. Valid for 15 minutes.', 'QR muncul setelah klik bayar. Scan dengan BCA, Mandiri, GoPay, OVO, DANA, ShopeePay atau aplikasi QRIS lain. Berlaku 15 menit.', '')}</p>`;
    if (k === 'shop') return `<p class="pm-txt">${t('Split into 4 payments of', 'Bagi 4x pembayaran', '4回払い：')} <b class="mono">${money(H.totals({ ship, code }).total / 4)}</b> ${t('every two weeks. No interest.', 'setiap dua minggu. Tanpa bunga.', '')}</p>`;
    return `<p class="pm-txt">${t('After clicking pay you will be redirected to complete your purchase securely.', 'Setelah klik bayar kamu akan diarahkan untuk menyelesaikan pembayaran.', 'お支払いページへ移動します。')}</p>`;
  }

  function summary() {
    const m = mk(); const T = H.totals({ ship, code });
    const vat = ['EU', 'GB'].includes(S.market) ? T.total - T.total / (S.market === 'GB' ? 1.2 : 1.19) : 0;
    return `<aside class="co-s"><div class="co-s-in">
      <ul class="co-items">${T.items.map(l => `<li><span class="co-im"><img src="${IMG(l.p.img[l.v.i > -1 ? l.v.i : 0], 140)}" alt=""><i class="mono">${l.q}</i></span><span class="co-it"><b>${esc(l.p.t)}</b><em>${l.v.n ? esc(l.v.n) + ' · ' : ''}${esc(H.brand(l.p).n)}</em>${l.bundle ? `<em class="co-bn">${t('Build bundle −10%', 'Bundle −10%', 'セット −10%')}</em>` : ''}</span><span class="mono">${money(l.line)}</span></li>`).join('')}</ul>
      ${H.myCast() ? `<div class="co-fit">${ICON.car}<span>${t('Checked for', 'Dicek untuk', '適合確認：')} <b>${esc(H.myCast().n)}</b> — ${T.items.filter(l => H.fits(l.p, H.myCast()) === 'no').length ? `<span class="warn">${t('one part may not fit', 'ada part yang mungkin tidak pas', '非適合の可能性あり')}</span>` : t('all parts fit', 'semua part pas', 'すべて適合')}</span></div>` : ''}
      <form class="code" id="co-code"><input class="input" id="code" placeholder="${t('Discount code or gift card', 'Kode diskon atau gift card', '割引コード')}" value="${esc(code)}" ${code ? 'disabled' : ''}><button class="btn ${code ? 'btn-ghost' : 'btn-ink'}" ${code ? 'type="button" id="code-x"' : ''}>${code ? t('Remove', 'Hapus', '削除') : t('Apply', 'Pakai', '適用')}</button></form>
      <dl class="tot">
        <div><dt>${t('Subtotal', 'Subtotal', '小計')} · ${T.count} ${t('items', 'item', '点')}</dt><dd class="mono">${money(T.sub)}</dd></div>
        ${T.bundle ? `<div class="is-g"><dt>${t('Build bundle', 'Bundle build', 'セット割')}</dt><dd class="mono">−${money(T.bundle)}</dd></div>` : ''}
        ${T.disc ? `<div class="is-g"><dt>${ICON.tag} ${esc(code)}</dt><dd class="mono">−${money(T.disc)}</dd></div>` : ''}
        ${T.add ? `<div><dt>${t('Add-ons', 'Tambahan', 'オプション')}</dt><dd class="mono">${money(T.add)}</dd></div>` : ''}
        <div><dt>${t('Shipping', 'Ongkir', '送料')}</dt><dd class="mono">${T.ship ? money(T.ship) : t('Free', 'Gratis', '無料')}</dd></div>
        ${m.duty ? `<div><dt>${t('Duties & tariffs', 'Bea & tarif', '関税')} <span class="tagddp mono">DDP</span></dt><dd class="mono">${money(T.duty)}</dd></div>` : ''}
        <div class="is-tot"><dt>${t('Total', 'Total', '合計')}</dt><dd><small class="mono">${m.cur}</small> <b class="mono" id="co-tot">${money(T.total)}</b></dd></div>
        ${vat ? `<p class="xs muted">${t('Including', 'Termasuk', '内税')} ${money(vat)} ${S.market === 'GB' ? 'VAT' : 'VAT (IOSS)'}</p>` : ''}
        ${local() ? `<p class="xs muted">${t('Prices include PPN 11%.', 'Harga sudah termasuk PPN 11%.', '')}</p>` : ''}
      </dl>
      <div class="co-help"><span class="eyebrow"><b>${t('Need help?', 'Butuh bantuan?', 'ヘルプ')}</b></span><a href="#">${ICON.wa}WhatsApp · ${t('replies in ~15 min', 'balas ~15 menit', '約15分で返信')}</a></div>
    </div></aside>`;
  }

  function render() {
    header();
    const T = H.totals({ ship, code });
    $('#co-mtoggle').innerHTML = `${ICON.cart}<span>${t('Show order summary', 'Lihat ringkasan', '注文内容を表示')}</span>${ICON.down}<b class="mono">${money(T.total)}</b>`;
    $('#co').innerHTML = form() + summary();
    H.applyI18n();
    ccBrand();
  }
  function repaint() { // keep form values, refresh totals/summary/pay button
    saveDraft();
    const y = scrollY; render(); scrollTo(0, y);
  }
  function saveDraft() { $$('#co-form input.input, #country').forEach(i => { if (i.id) D[i.id] = i.value; }); const n = $('#news'); if (n) D.news = n.checked; H.LS.set('co', D); }

  /* ---------- address autocomplete (mock of Google Places / Shopify address autocomplete) ---------- */
  const SUG = { US: [['1600 Grand Ave', 'Oakland', 'CA', '94610'], ['742 Evergreen Terrace', 'Springfield', 'OR', '97477'], ['88 Colin P Kelly Jr St', 'San Francisco', 'CA', '94107']], DE: [['Torstraße 120', 'Berlin', '', '10119'], ['Schanzenstraße 25', 'Hamburg', '', '20357']], GB: [['221B Baker Street', 'London', '', 'NW1 6XE'], ['14 Deansgate', 'Manchester', '', 'M3 2BW']], JP: [['1-2-3 Akihabara, Chiyoda', 'Tokyo', 'Tokyo', '101-0021']], ID: [['Jl. Pandanaran No. 88', 'Kota Semarang', 'Jawa Tengah', '50241'], ['Jl. Sudirman Kav. 52', 'Jakarta Selatan', 'DKI Jakarta', '12190']], AU: [['12 George St', 'Sydney', 'NSW', '2000']] };
  function acSuggest(v) {
    const list = $('#ac-list'); if (!list) return;
    const s = (SUG[D.country] || SUG.US).filter(x => v.length >= 3 && (x[0] + x[1]).toLowerCase().includes(v.toLowerCase().slice(0, 3)) || v.length >= 3);
    list.innerHTML = v.length >= 3 ? s.slice(0, 3).map(x => `<button type="button" data-ac='${JSON.stringify(x).replace(/'/g, '&#39;')}'>${ICON.pin}<span><b>${esc(x[0])}</b><em>${esc([x[1], x[2], x[3]].filter(Boolean).join(', '))}</em></span></button>`).join('') + `<span class="ac-pw xs muted">${t('Address suggestions', 'Saran alamat', '住所候補')}</span>` : '';
    list.classList.toggle('is-on', v.length >= 3);
  }

  /* ---------- card helpers ---------- */
  function ccBrand() {
    const i = $('#ccn'); if (!i) return; const v = i.value.replace(/\D/g, ''); const el = $('#cc-brand');
    const b = /^4/.test(v) ? 'visa' : /^(5[1-5]|2[2-7])/.test(v) ? 'mc' : /^3[47]/.test(v) ? 'amex' : /^35/.test(v) ? 'jcb' : null;
    el.innerHTML = b ? H.payIcons([b]) : ICON.lock; el.classList.toggle('is-b', !!b);
  }
  const luhn = n => { let s = 0, d = false; for (let i = n.length - 1; i >= 0; i--) { let x = +n[i]; if (d) { x *= 2; if (x > 9) x -= 9; } s += x; d = !d; } return n.length >= 13 && s % 10 === 0; };

  /* ---------- validation & pay ---------- */
  function validate() {
    let ok = true; const bad = [];
    $$('#co-form .fl').forEach(f => f.classList.remove('is-err'));
    $$('#co-form input[required]').forEach(i => { if (!i.closest('.pm-o') || i.closest('.pm-o.is-on')) { const v = i.value.trim(); const e = !v || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(v)); if (e) { i.closest('.fl').classList.add('is-err'); bad.push(i); ok = false; } } });
    if (pay === 'card') { const c = $('#ccn'); if (!luhn(c.value.replace(/\D/g, ''))) { c.closest('.fl').classList.add('is-err'); bad.push(c); ok = false; } }
    if (!ok) { bad[0].focus({ preventScroll: true }); bad[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); bad.forEach(i => { const f = i.closest('.fl'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); }); }
    return ok;
  }
  function qrSVG(seed) {
    let x = seed; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
    const N = 29; let cells = '';
    const finder = (cx, cy) => `<rect x="${cx}" y="${cy}" width="7" height="7" fill="#000"/><rect x="${cx + 1}" y="${cy + 1}" width="5" height="5" fill="#fff"/><rect x="${cx + 2}" y="${cy + 2}" width="3" height="3" fill="#000"/>`;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const inF = (r < 8 && c < 8) || (r < 8 && c > N - 9) || (r > N - 9 && c < 8); if (!inF && rnd() > .52) cells += `<rect x="${c}" y="${r}" width="1" height="1"/>`; }
    return `<svg viewBox="-2 -2 ${N + 4} ${N + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${N + 4}" height="${N + 4}" fill="#fff"/><g fill="#000">${cells}</g>${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</svg>`;
  }
  function placeOrder() {
    const T = H.totals({ ship, code }); const m = mk();
    const no = 'HPZ-' + (260141 + S.orders.length);
    const order = { no, date: new Date().toISOString(), items: S.cart.map(l => ({ id: l.id, vid: l.vid, q: l.q, bundle: !!l.bundle })), sub: T.sub, disc: T.disc + T.bundle, add: T.add, ship: T.ship, duty: T.duty, total: T.total, market: S.market, cur: m.cur, shipName: (m.ship.find(o => o[0] === ship) || m.ship[0])[1], eta: (m.ship.find(o => o[0] === ship) || m.ship[0])[3], pay, email: D.email, name: `${D.first || ''} ${D.last || ''}`.trim(), addr: [D.addr, D.addr2, D.city, D.state, D.zip, (COUNTRIES.find(c => c[0] === D.country) || [])[1]].filter(Boolean).join(', '), phone: D.phone, code, points: Math.round(T.total) };
    S.orders.unshift(order); H.LS.set('orders', S.orders);
    S.cart = []; H.LS.set('cart', []); H.LS.set('code', '');
    location.href = 'thank-you.html?o=' + no;
  }
  function processing() {
    const el = $('#co-pay'); const T = H.totals({ ship, code });
    const steps = [t('Encrypting payment details', 'Mengenkripsi data pembayaran', '決済情報を暗号化'), t('Authorising with your bank', 'Otorisasi dengan bank', 'カード会社で承認'), t('Reserving parts at the workshop', 'Mengunci stok di workshop', '在庫を確保'), t('Confirming your order', 'Mengonfirmasi pesanan', '注文を確定')];
    el.innerHTML = `<div class="cp-box"><div class="cp-w">${H.wheelSVG({ spokes: 6, finish: 'gold' })}</div><b class="mono cp-amt">${money(T.total)}</b><ol class="cp-steps">${steps.map(s => `<li><i></i>${s}</li>`).join('')}</ol><div class="cp-bar"><i></i></div></div>`;
    el.classList.add('is-on'); el.setAttribute('aria-hidden', 'false');
    const lis = $$('.cp-steps li', el); let i = 0;
    const tick = () => { if (i > 0) lis[i - 1].classList.replace('is-on', 'is-done'); if (i < lis.length) { lis[i].classList.add('is-on'); $('.cp-bar i', el).style.width = ((i + 1) / lis.length * 100) + '%'; i++; setTimeout(tick, 650); } else setTimeout(placeOrder, 400); };
    tick();
  }
  function qrisModal() {
    const el = $('#co-pay'); const T = H.totals({ ship, code }); let s = 900;
    el.innerHTML = `<div class="cp-box cp-qr"><div class="qr-h"><span class="pay" style="background:#fff;color:#e2211c;box-shadow:inset 0 0 0 1px #ddd">QRIS</span><b>HPZ DIECAST · SEMARANG</b><span class="xs muted">NMID ID1026xxxx7872</span></div><div class="qr-c">${qrSVG(Date.now() % 9999)}<span class="qr-scan"></span></div><b class="mono cp-amt">${money(T.total)}</b><span class="qr-t mono" id="qr-t">15:00</span><p class="xs muted">${t('Open your banking or e-wallet app, choose “Scan QR”, and pay the exact amount.', 'Buka aplikasi bank/e-wallet, pilih “Scan QR”, dan bayar sesuai nominal.', '')}</p><div class="qr-a"><button class="btn btn-signal btn-block" id="qr-paid">${t('Simulate payment received', 'Simulasikan pembayaran diterima', '支払いを模擬')}</button><button class="btn btn-ghost btn-block" id="qr-x">${t('Cancel', 'Batal', 'キャンセル')}</button></div></div>`;
    el.classList.add('is-on');
    const tm = setInterval(() => { s--; const q = $('#qr-t'); if (!q) return clearInterval(tm); q.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
    $('#qr-paid').onclick = () => { clearInterval(tm); processing(); };
    $('#qr-x').onclick = () => { clearInterval(tm); el.classList.remove('is-on'); };
  }

  /* ---------- events ---------- */
  document.addEventListener('input', e => {
    const i = e.target;
    if (i.id === 'ccn') { const v = i.value.replace(/\D/g, '').slice(0, 19); i.value = v.replace(/(.{4})/g, '$1 ').trim(); ccBrand(); }
    if (i.id === 'exp') { let v = i.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + ' / ' + v.slice(2); i.value = v; }
    if (i.id === 'cvc') i.value = i.value.replace(/\D/g, '').slice(0, 4);
    if (i.id === 'addr') acSuggest(i.value);
    if (i.closest('.fl.is-err') && i.value) i.closest('.fl').classList.remove('is-err');
    if (i.matches('#co-form input')) { D[i.id] = i.value; H.LS.set('co', D); }
  });
  document.addEventListener('change', e => {
    const i = e.target;
    if (i.id === 'country') { saveDraft(); D.country = i.value; H.LS.set('co', D); const mkt = COUNTRIES.find(c => c[0] === i.value)[2]; if (mkt !== S.market) { H.setMarket(mkt, mkt === 'ID' ? 'id' : mkt === 'JP' ? S.lang : S.lang === 'id' ? 'en' : S.lang); H.toast({ title: t('Prices updated', 'Harga diperbarui', '価格を更新'), sub: `${C.MARKETS[mkt].n} · ${C.MARKETS[mkt].cur}`, icon: H.FLAG[C.MARKETS[mkt].flag] }); } else repaint(); }
    if (i.name === 'ship') { ship = i.value; repaint(); }
    if (i.name === 'pay') { pay = i.value; repaint(); }
  });
  document.addEventListener('click', e => {
    const tg = e.target;
    const a = tg.closest('[data-ac]'); if (a) { const [st, city, state, zip] = JSON.parse(a.dataset.ac); Object.assign(D, { addr: st, city, state, zip }); H.LS.set('co', D); ['addr', 'city', 'state', 'zip'].forEach(k => { const el = $('#' + k); if (el) { el.value = D[k] || ''; el.closest('.fl').classList.add('flash'); setTimeout(() => el.closest('.fl').classList.remove('flash'), 700); } }); $('#ac-list').classList.remove('is-on'); return; }
    if (!tg.closest('.ac-wrap')) { const l = $('#ac-list'); l && l.classList.remove('is-on'); }
    if (tg.closest('#demo-fill')) {
      const id = local();
      Object.assign(D, id ? { email: 'ricky@example.com', first: 'Ricky', last: 'Ramadhan', addr: 'Jl. Pandanaran No. 88', addr2: 'Kec. Semarang Tengah', city: 'Kota Semarang', state: 'Jawa Tengah', zip: '50241', phone: '0813 1016 7872' } : { email: 'ricky@example.com', first: 'Ricky', last: 'Ramadhan', addr: S.market === 'US' ? '1600 Grand Ave' : 'Torstraße 120', city: S.market === 'US' ? 'Oakland' : 'Berlin', state: S.market === 'US' ? 'CA' : '', zip: S.market === 'US' ? '94610' : '10119', phone: '+1 510 555 0142', ccn: '4242 4242 4242 4242', exp: '08 / 29', cvc: '123', ccname: 'Ricky Ramadhan' });
      H.LS.set('co', D); render(); return;
    }
    const xp = tg.closest('[data-xp]'); if (xp) { pay = ['qris', 'gopay', 'ovo'].includes(xp.dataset.xp) ? (xp.dataset.xp === 'qris' ? 'qris' : 'ewallet') : 'paypal'; if (pay === 'qris') qrisModal(); else processing(); return; }
    if (tg.closest('#code-x')) { code = ''; H.LS.set('code', ''); repaint(); return; }
    if (tg.closest('#co-mtoggle')) { const s = $('.co-s'); const open = s.classList.toggle('is-open'); tg.closest('#co-mtoggle').setAttribute('aria-expanded', open); return; }
    const pm = tg.closest('.pm-h'); if (pm) return;
  });
  document.addEventListener('submit', e => {
    if (e.target.id === 'co-code') { e.preventDefault(); const v = $('#code').value.trim().toUpperCase(); if (v === 'PITCREW10') { const before = H.moneyRaw(H.totals({ ship, code }).total); code = v; H.LS.set('code', code); repaint(); H.countUp($('#co-tot'), H.moneyRaw(H.totals({ ship, code }).total), { from: before, dur: 900, fmt: x => H.fmt(x) }); H.toast({ title: t('Discount applied', 'Diskon dipakai', '割引を適用'), sub: 'PITCREW10 — 10%', icon: ICON.tag }); } else { const i = $('#code'); i.classList.add('is-err'); H.toast({ title: t('Code not valid', 'Kode tidak valid', '無効なコード'), sub: v || '—', icon: ICON.info }); } return; }
    if (e.target.id !== 'co-form') return; e.preventDefault(); saveDraft();
    if (!validate()) return;
    const b = $('#paybtn'); b.classList.add('is-loading');
    setTimeout(() => { b.classList.remove('is-loading'); if (pay === 'qris') qrisModal(); else processing(); }, 500);
  });

  render();
  H.on('market', () => { ship = null; pay = null; render(); });
  H.on('cart', repaint);
});
