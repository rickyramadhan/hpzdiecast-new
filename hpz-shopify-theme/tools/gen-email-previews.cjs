// Builds the static design previews of the redesigned customer emails (docs/emails/*.html).
// These are previews with sample data. After approval the same components are turned into the Shopify notification templates (Liquid).
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '../docs/emails');
fs.mkdirSync(OUT, { recursive: true });

const C = { ink: '#0e0f11', paper: '#f3f2ee', mat: '#1e4b40', signal: '#ffd100', line: '#e4e1d9', mute: '#6d7177', white: '#ffffff', ok: '#1a9a5a' };
const HEAD = "font-family:'Archivo Black','Arial Black','Helvetica Neue',Arial,sans-serif;text-transform:uppercase;letter-spacing:-.5px;line-height:1.05;font-weight:900";
const BODY = "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "font-family:'Courier New',Courier,monospace;letter-spacing:.08em;text-transform:uppercase";

const T = {
  en: {
    store: 'EN · USD', tag: 'parts · 1:64', hello: 'Hi', order: 'Order', items: 'Your items', qty: 'Qty', subtotal: 'Subtotal', shipping: 'Shipping', total: 'Total',
    shipTo: 'Shipping to', method: 'Delivery', billTo: 'Billed to', pay: 'Payment', help: 'Need help?', helpText: 'Reply to this email or message us on WhatsApp. We answer Mon–Sat, 09:00–17:00 WIB.',
    wa: 'WhatsApp us', view: 'View your order', visit: 'Keep shopping', footer: 'Independent parts maker, not affiliated with Mattel, Hot Wheels or Matchbox.', unsub: 'You get this email because you ordered from HPZ Diecast.',
    steps: ['Ordered', 'Paid', 'Packed', 'Shipped', 'Delivered']
  },
  id: {
    store: 'ID · IDR', tag: 'parts · 1:64', hello: 'Halo', order: 'Pesanan', items: 'Barang kamu', qty: 'Jml', subtotal: 'Subtotal', shipping: 'Ongkir', total: 'Total',
    shipTo: 'Dikirim ke', method: 'Pengiriman', billTo: 'Penagihan', pay: 'Pembayaran', help: 'Butuh bantuan?', helpText: 'Balas email ini atau chat WhatsApp kami. Kami membalas Senin–Sabtu, 09.00–17.00 WIB.',
    wa: 'Chat WhatsApp', view: 'Lihat pesanan', visit: 'Lanjut belanja', footer: 'Pembuat part independen, tidak berafiliasi dengan Mattel, Hot Wheels atau Matchbox.', unsub: 'Kamu menerima email ini karena memesan di HPZ Diecast.',
    steps: ['Dipesan', 'Dibayar', 'Dikemas', 'Dikirim', 'Sampai']
  }
};
const IMG1 = 'https://cdn.shopify.com/s/files/1/0716/6427/1450/files/1001030315.jpg?v=1792383967';
const IMG2 = "https://cdn.shopify.com/s/files/1/0716/6427/1450/files/e41e9bb3-52c7-4742-bbd3-89af8b175a4a_1.jpg?width=300";
const logoMark = `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table"><tr>
  <td style="background:#e5306b;color:#fff;${HEAD};font-size:17px;width:26px;height:30px;text-align:center;border-radius:3px">H</td><td width="3"></td>
  <td style="background:#ffb000;color:#fff;${HEAD};font-size:17px;width:26px;height:30px;text-align:center;border-radius:3px">P</td><td width="3"></td>
  <td style="background:#12a18f;color:#fff;${HEAD};font-size:17px;width:26px;height:30px;text-align:center;border-radius:3px">Z</td>
  <td width="10"></td>
  <td style="color:#fff;${BODY};line-height:1.1"><b style="${HEAD};font-size:15px;letter-spacing:2px">Diecast</b><br><span style="${MONO};font-size:9px;color:#9aa0a6">parts · 1:64</span></td></tr></table>`;

const btn = (label, href, kind = 'signal') => `<a href="${href}" style="display:inline-block;${BODY};font-weight:700;font-size:15px;text-decoration:none;padding:15px 28px;border-radius:10px;${kind === 'signal' ? `background:${C.signal};color:${C.ink}` : kind === 'dark' ? `background:${C.ink};color:#fff` : `background:transparent;color:#fff;border:1px solid #ffffff55`}">${label}</a>`;
const label = (txt, color = C.mute) => `<div style="${MONO};font-size:11px;color:${color};margin-bottom:6px">${txt}</div>`;

function stepper(t, active) {
  const cells = t.steps.map((s, i) => {
    const done = i <= active, cur = i === active;
    const dot = `<div style="width:26px;height:26px;border-radius:13px;margin:0 auto;background:${done ? C.ink : '#fff'};border:2px solid ${done ? C.ink : C.line};color:${done ? C.signal : C.mute};${MONO};font-size:11px;line-height:22px;text-align:center;font-weight:700">${done && !cur ? '&#10003;' : i + 1}</div>`;
    return `<td align="center" style="width:20%;padding:0 2px;vertical-align:top">${dot}<div style="${BODY};font-size:11px;margin-top:6px;color:${cur ? C.ink : C.mute};font-weight:${cur ? 700 : 500}">${s}</div></td>`;
  }).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px"><tr>${cells}</tr></table>`;
}

function itemsTable(t, lang, rows) {
  const money = v => lang === 'id' ? 'Rp&nbsp;' + v.toLocaleString('id-ID') : '$' + v.toFixed(2);
  const lines = rows.map(r => `<tr><td style="padding:14px 0;border-bottom:1px solid ${C.line};width:68px"><img src="${r.img}" width="60" height="60" alt="" style="display:block;border-radius:8px;border:1px solid ${C.line};background:#f6f5f2;object-fit:contain"></td>
    <td style="padding:14px 12px;border-bottom:1px solid ${C.line};${BODY}"><div style="font-weight:700;font-size:14px;color:${C.ink};line-height:1.3">${r.name}</div><div style="font-size:12px;color:${C.mute};margin-top:3px">${r.variant} &middot; ${t.qty} ${r.qty}</div></td>
    <td align="right" style="padding:14px 0;border-bottom:1px solid ${C.line};${BODY};font-weight:700;font-size:14px;color:${C.ink};white-space:nowrap">${money(r.price * r.qty)}</td></tr>`).join('');
  const sub = rows.reduce((a, r) => a + r.price * r.qty, 0);
  return { html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${lines}</table>`, sub, money };
}

function totals(t, money, sub, ship, extra = '') {
  const row = (k, v, strong) => `<tr><td style="padding:6px 0;${BODY};font-size:${strong ? 15 : 13}px;color:${strong ? C.ink : C.mute};font-weight:${strong ? 800 : 500}">${k}</td><td align="right" style="padding:6px 0;${BODY};font-size:${strong ? 18 : 13}px;color:${C.ink};font-weight:${strong ? 800 : 600}">${v}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px">${row(t.subtotal, money(sub))}${row(t.shipping, money(ship))}${extra}
    <tr><td colspan="2" style="padding-top:8px"><div style="height:2px;background:${C.ink}"></div></td></tr>${row(t.total, money(sub + ship), true)}</table>`;
}

function addrBlock(t, left, right) {
  const cell = (k, v) => `<td valign="top" width="50%" style="padding:0 8px 0 0;${BODY};font-size:13px;line-height:1.55;color:${C.ink}">${label(k)}${v}</td>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:1px solid ${C.line};padding-top:18px"><tr>${cell(left[0], left[1])}${cell(right[0], right[1])}</tr></table>`;
}

function shell(lang, title, inner, preheader) {
  const t = T[lang];
  const social = ['Instagram', 'YouTube', 'TikTok'].map(s => `<a href="#" style="color:#c9ccd0;text-decoration:none;margin-right:14px">${s}</a>`).join('');
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${C.paper};${BODY}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:14px;overflow:hidden;border:1px solid ${C.line}">
  <tr><td style="background:${C.ink};padding:18px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>${logoMark}</td><td align="right" style="${MONO};font-size:11px;color:${C.signal}">${t.store}</td></tr></table></td></tr>
  ${inner}
  <tr><td style="padding:0 28px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};border-radius:12px"><tr><td style="padding:20px 22px">
    <div style="${HEAD};font-size:17px;color:${C.ink};margin-bottom:6px">${t.help}</div>
    <div style="${BODY};font-size:13px;line-height:1.55;color:${C.mute};margin-bottom:14px">${t.helpText}</div>
    ${btn(t.wa, 'https://wa.me/6281310167872', 'dark')}
  </td></tr></table></td></tr>
  <tr><td style="background:${C.ink};padding:26px 28px;${BODY};font-size:12px;line-height:1.7;color:#9aa0a6">
    <div style="margin-bottom:12px">${social}</div>
    <div style="color:#fff;font-weight:700">HPZ Diecast${lang === 'id' ? ' Indonesia' : ''}</div>
    <div>Jakarta Selatan, Indonesia &middot; Mon–Sat 09:00–17:00 WIB</div>
    <div>admin@hpzdiecast.com &middot; +62 813-1016-7872</div>
    <div style="margin-top:12px;font-size:11px;color:#6d7177">${t.footer}<br>${t.unsub}</div>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function hero(eyebrow, title, sub, color = C.mat) {
  return `<tr><td style="background:${color};padding:34px 28px 30px">
    <div style="${MONO};font-size:11px;color:${C.signal};margin-bottom:12px">${eyebrow}</div>
    <div style="${HEAD};font-size:34px;color:#fff">${title}</div>
    <div style="${BODY};font-size:15px;line-height:1.55;color:#d9e6e0;margin-top:12px">${sub}</div></td></tr>`;
}
const body = inner => `<tr><td style="padding:26px 28px 8px">${inner}</td></tr>`;

/* ---------- emails ---------- */
function orderConfirmation(lang) {
  const t = T[lang], id = lang === 'id';
  const rows = [
    { img: IMG1, name: id ? 'HPZ Wheels Model Emitz' : 'HPZ Wheels Model Emitz', variant: id ? 'Krom' : 'Chrome', qty: 1, price: id ? 220000 : 13.5 },
    { img: IMG2, name: id ? 'Kursi Recaro dengan detail, Sakura Model' : 'Recaro Seat with detailing, Sakura Model', variant: id ? 'Hitam' : 'Black', qty: 2, price: id ? 81500 : 5 }
  ];
  const it = itemsTable(t, lang, rows);
  const ship = id ? 11000 : 15;
  const total = it.sub + ship;
  const idPay = id ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.mat};border-radius:14px;margin:4px 0 22px"><tr><td style="padding:22px">
      <div style="${MONO};font-size:11px;color:${C.signal};margin-bottom:8px">Bayar sekarang</div>
      <div style="${BODY};font-size:13px;color:#d9e6e0">Transfer tepat sesuai total</div>
      <div style="${HEAD};font-size:34px;color:${C.signal};margin:2px 0 14px">${it.money(total)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td valign="top" width="50%" style="padding-right:10px"><div style="background:#fff;border-radius:10px;padding:10px;text-align:center"><img src="../../assets/qris-hpz.jpg" width="150" alt="QRIS HPZ STORE N TOYS" style="display:block;margin:0 auto;max-width:100%"><div style="${MONO};font-size:9px;color:${C.mute};margin-top:6px">QRIS &middot; semua bank &amp; e-wallet</div></div></td>
        <td valign="top" width="50%" style="${BODY};color:#fff;font-size:13px;line-height:1.6;padding-left:6px">
          <div style="${MONO};font-size:10px;color:#a7c2b8">Transfer bank</div>
          <div style="font-weight:700;font-size:15px">BCA 2913281284</div>
          <div style="color:#d9e6e0">a.n. Heru Prasetyo</div>
          <div style="margin-top:10px;color:#d9e6e0">Tulis nomor pesanan <b style="color:#fff">#1023</b> di berita transfer.</div>
          <div style="margin-top:8px;${MONO};font-size:10px;color:${C.signal}">Batas bayar: 24 jam</div></td></tr></table>
      <div style="margin-top:18px">${btn('Konfirmasi via WhatsApp', 'https://wa.me/6281310167872?text=Halo%20admin%20HPZ%2C%20saya%20sudah%20bayar%20pesanan%20%231023', 'signal')}&nbsp;&nbsp;${btn('Buka halaman bayar', 'https://id.hpzdiecast.com/pages/bayar?order=%231023&total=' + total + '&cur=IDR', 'ghost')}</div>
    </td></tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px"><tr>
      ${['Bayar sesuai total', 'Kirim bukti bayar di WhatsApp', 'Kami konfirmasi dan kirim'].map((s, i) => `<td valign="top" width="33%" style="padding-right:8px;${BODY};font-size:12px;line-height:1.45;color:${C.ink}"><div style="${MONO};font-size:11px;color:${C.mute};margin-bottom:4px">0${i + 1}</div>${s}</td>`).join('')}
    </tr></table>` : '';
  const inner = hero(id ? 'Pesanan #1023 &middot; menunggu pembayaran' : 'Order #1023 &middot; paid with PayPal', id ? 'Pesanan diterima.<br>Tinggal bayar.' : 'Thank you, Budi.<br>Your order is in.',
    id ? 'Halo Budi, pesananmu sudah kami catat. Pesanan diproses setelah pembayaran dikonfirmasi admin.' : 'We got your order and payment. We pack every part by hand in Jakarta and email you tracking when it ships.')
    + body(`${stepper(t, id ? 0 : 1)}<div style="height:18px"></div>${idPay}${label(t.items)}${it.html}${totals(t, it.money, it.sub, ship)}
    ${addrBlock(t, [t.shipTo, id ? 'Budi Santoso<br>Jl. Contoh No. 12<br>Cileungsi, Bogor 16820<br>Jawa Barat, Indonesia' : 'Budi Santoso<br>12 Example Street<br>Portland, OR 97201<br>United States'], [t.method, id ? 'Reguler (1–3 hari kerja)<br><span style="color:' + C.mute + '">Estimasi tiba 28–30 Okt</span>' : 'Priority International US<br><span style="color:' + C.mute + '">10–15 business days</span><br><span style="color:' + C.mute + ';font-size:12px">Duties and import taxes, if any, are paid by the recipient.</span>'])}
    <div style="margin:26px 0 22px;text-align:center">${btn(t.view, '#')}</div>`);
  return shell(lang, 'Order confirmation', inner, id ? 'Pesanan #1023 diterima. Bayar Rp ' + total.toLocaleString('id-ID') + ' lewat QRIS atau transfer BCA.' : 'Order #1023 confirmed. We will email tracking when it ships.');
}

function shipping(lang) {
  const t = T[lang], id = lang === 'id';
  const rows = [{ img: IMG1, name: 'HPZ Wheels Model Emitz', variant: id ? 'Krom' : 'Chrome', qty: 1, price: id ? 220000 : 13.5 }];
  const it = itemsTable(t, lang, rows);
  const inner = hero(id ? 'Pesanan #1023 &middot; dalam pengiriman' : 'Order #1023 &middot; shipped', id ? 'Paketmu<br>sudah jalan.' : 'Your parcel<br>is on its way.', id ? 'Pesanan dikemas rapi dan sudah diserahkan ke kurir.' : 'Packed by hand and handed to the courier. Here is how to follow it.', C.ink)
    + body(`${stepper(t, 3)}<div style="height:18px"></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};border-radius:12px;margin-bottom:22px"><tr><td style="padding:20px 22px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td valign="top" style="${BODY};font-size:13px;color:${C.ink}">${label(id ? 'Kurir' : 'Carrier')}<b style="font-size:15px">${id ? 'JNE Reguler' : 'DHL eCommerce'}</b></td>
        <td valign="top" style="${BODY};font-size:13px;color:${C.ink}">${label(id ? 'Nomor resi' : 'Tracking number')}<b style="font-size:15px;${MONO}">CGK1234567890</b></td>
        <td valign="top" style="${BODY};font-size:13px;color:${C.ink}">${label(id ? 'Estimasi tiba' : 'Estimated arrival')}<b style="font-size:15px">${id ? '28–30 Okt' : 'Nov 4–9'}</b></td></tr></table>
      <div style="margin-top:16px">${btn(id ? 'Lacak paket' : 'Track your parcel', '#')}</div></td></tr></table>
    ${label(id ? 'Isi paket' : 'In this parcel')}${it.html}
    ${addrBlock(t, [t.shipTo, id ? 'Budi Santoso<br>Jl. Contoh No. 12<br>Cileungsi, Bogor 16820' : 'Budi Santoso<br>12 Example Street<br>Portland, OR 97201, US'], [id ? 'Tips' : 'Good to know', id ? 'Cek paket saat diterima dan simpan video unboxing kalau ada masalah.' : 'Check the parcel when it arrives and keep an unboxing video if anything is wrong.'])}
    <div style="margin:26px 0 22px;text-align:center">${btn(t.view, '#', 'dark')}</div>`);
  return shell(lang, 'Shipping confirmation', inner, id ? 'Paket #1023 sudah dikirim. Resi CGK1234567890.' : 'Order #1023 has shipped. Tracking CGK1234567890.');
}

function account(lang) {
  const t = T[lang], id = lang === 'id';
  const inner = hero(id ? 'Akun HPZ Diecast' : 'HPZ Diecast account', id ? 'Aktifkan<br>akun kamu.' : 'Activate<br>your account.', id ? 'Satu akun untuk simpan alamat, lihat pesanan, dan lacak paket.' : 'One account to save addresses, see orders and track parcels.', C.mat)
    + body(`<div style="${BODY};font-size:15px;line-height:1.6;color:${C.ink};margin:6px 0 22px">${id ? 'Halo Budi, klik tombol di bawah untuk membuat kata sandi dan mengaktifkan akun kamu.' : 'Hi Budi, tap the button below to set your password and activate your account.'}</div>
    <div style="margin-bottom:22px">${btn(id ? 'Aktifkan akun' : 'Activate account', '#')}</div>
    <div style="${BODY};font-size:12px;line-height:1.6;color:${C.mute};border-top:1px solid ${C.line};padding-top:16px;margin-bottom:24px">${id ? 'Tombol tidak berfungsi? Salin tautan ini ke browser: <span style="word-break:break-all">https://id.hpzdiecast.com/account/activate/…</span><br>Kalau kamu tidak merasa mendaftar, abaikan saja email ini.' : 'Button not working? Paste this link into your browser: <span style="word-break:break-all">https://hpzdiecast.com/account/activate/…</span><br>If you did not sign up, you can ignore this email.'}</div>`);
  return shell(lang, 'Account', inner, id ? 'Aktifkan akun HPZ Diecast kamu.' : 'Activate your HPZ Diecast account.');
}

const files = {
  'order-confirmation-en.html': orderConfirmation('en'), 'order-confirmation-id.html': orderConfirmation('id'),
  'shipping-confirmation-en.html': shipping('en'), 'shipping-confirmation-id.html': shipping('id'),
  'account-invite-en.html': account('en'), 'account-invite-id.html': account('id')
};
for (const [n, h] of Object.entries(files)) fs.writeFileSync(path.join(OUT, n), h);
console.log('previews written:', Object.keys(files).join(', '));
