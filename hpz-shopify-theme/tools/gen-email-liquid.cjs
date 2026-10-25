// Builds the Shopify notification templates (HTML + Liquid) for the priority emails, for both stores.
//   node tools/gen-email-liquid.cjs [qrisUrl]        -> docs/emails/liquid/<global|indonesia>/*.liquid  + subjects.md per store
// The look follows docs/emails/index.html. Every variable that Shopify may not provide is guarded so a missing value hides its block.
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '../docs/emails/liquid');
const QRIS = process.argv[2] || 'https://REPLACE-WITH-QRIS-FILE-URL';

const C = { ink: '#0e0f11', paper: '#f3f2ee', mat: '#1e4b40', signal: '#ffd100', line: '#e4e1d9', mute: '#6d7177' };
const HEAD = "font-family:'Archivo Black','Arial Black','Helvetica Neue',Arial,sans-serif;text-transform:uppercase;letter-spacing:-.5px;line-height:1.05;font-weight:900";
const BODY = "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "font-family:'Courier New',Courier,monospace;letter-spacing:.08em;text-transform:uppercase";
const WA = '6281310167872', MAIL = 'admin@hpzdiecast.com';

const L = {
  en: { store: 'EN · USD', brandSuffix: '', hi: 'Hi', items: 'Your items', qty: 'Qty', subtotal: 'Subtotal', shipping: 'Shipping', discount: 'Discount', tax: 'Taxes', total: 'Total',
    shipTo: 'Shipping to', method: 'Delivery', view: 'View your order', help: 'Need help?', helpText: 'Reply to this email or message us on WhatsApp. We answer Mon–Sat, 09:00–17:00 WIB.', wa: 'WhatsApp us',
    footer: 'Independent parts maker, not affiliated with Mattel, Hot Wheels or Matchbox.', why: 'You get this email because you ordered from HPZ Diecast.', steps: ['Ordered', 'Paid', 'Packed', 'Shipped', 'Delivered'] },
  id: { store: 'ID · IDR', brandSuffix: ' Indonesia', hi: 'Halo', items: 'Barang kamu', qty: 'Jml', subtotal: 'Subtotal', shipping: 'Ongkir', discount: 'Diskon', tax: 'Pajak', total: 'Total',
    shipTo: 'Dikirim ke', method: 'Pengiriman', view: 'Lihat pesanan', help: 'Butuh bantuan?', helpText: 'Balas email ini atau chat WhatsApp kami. Kami membalas Senin–Sabtu, 09.00–17.00 WIB.', wa: 'Chat WhatsApp',
    footer: 'Pembuat part independen, tidak berafiliasi dengan Mattel, Hot Wheels atau Matchbox.', why: 'Kamu menerima email ini karena memesan di HPZ Diecast.', steps: ['Dipesan', 'Dibayar', 'Dikemas', 'Dikirim', 'Sampai'] }
};

const btn = (lbl, href, kind = 'signal') => `<a href="${href}" style="display:inline-block;${BODY};font-weight:700;font-size:15px;text-decoration:none;padding:15px 28px;border-radius:10px;${kind === 'signal' ? `background:${C.signal};color:${C.ink}` : kind === 'dark' ? `background:${C.ink};color:#fff` : 'background:transparent;color:#fff;border:1px solid #ffffff55'}">${lbl}</a>`;
const label = (t, color = C.mute) => `<div style="${MONO};font-size:11px;color:${color};margin-bottom:6px">${t}</div>`;
const logo = `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table"><tr>
<td style="background:#e5306b;color:#fff;${HEAD};font-size:17px;width:26px;height:30px;text-align:center;border-radius:3px">H</td><td width="3"></td>
<td style="background:#ffb000;color:#fff;${HEAD};font-size:17px;width:26px;height:30px;text-align:center;border-radius:3px">P</td><td width="3"></td>
<td style="background:#12a18f;color:#fff;${HEAD};font-size:17px;width:26px;height:30px;text-align:center;border-radius:3px">Z</td><td width="10"></td>
<td style="color:#fff;${BODY};line-height:1.1"><b style="${HEAD};font-size:15px;letter-spacing:2px">Diecast</b><br><span style="${MONO};font-size:9px;color:#9aa0a6">parts · 1:64</span></td></tr></table>`;

function stepper(t, active) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px"><tr>${t.steps.map((s, i) => {
    const done = i <= active, cur = i === active;
    return `<td align="center" style="width:20%;padding:0 2px;vertical-align:top"><div style="width:26px;height:26px;border-radius:13px;margin:0 auto;background:${done ? C.ink : '#fff'};border:2px solid ${done ? C.ink : C.line};color:${done ? C.signal : C.mute};${MONO};font-size:11px;line-height:22px;text-align:center;font-weight:700">${done && !cur ? '&#10003;' : i + 1}</div><div style="${BODY};font-size:11px;margin-top:6px;color:${cur ? C.ink : C.mute};font-weight:${cur ? 700 : 500}">${s}</div></td>`;
  }).join('')}</tr></table>`;
}
const stepperIf = (t, cond, a, b) => `{% if ${cond} %}${stepper(t, a)}{% else %}${stepper(t, b)}{% endif %}`;

function shell(lang, inner, pre) {
  const t = L[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>{{ shop.name }}</title></head>
<body style="margin:0;padding:0;background:${C.paper};${BODY}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${pre}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:14px;overflow:hidden;border:1px solid ${C.line}">
<tr><td style="background:${C.ink};padding:18px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>${logo}</td><td align="right" style="${MONO};font-size:11px;color:${C.signal}">${t.store}</td></tr></table></td></tr>
${inner}
<tr><td style="padding:0 28px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};border-radius:12px"><tr><td style="padding:20px 22px">
<div style="${HEAD};font-size:17px;color:${C.ink};margin-bottom:6px">${t.help}</div>
<div style="${BODY};font-size:13px;line-height:1.55;color:${C.mute};margin-bottom:14px">${t.helpText}</div>${btn(t.wa, 'https://wa.me/' + WA, 'dark')}</td></tr></table></td></tr>
<tr><td style="background:${C.ink};padding:26px 28px;${BODY};font-size:12px;line-height:1.7;color:#9aa0a6">
<div style="color:#fff;font-weight:700">HPZ Diecast${t.brandSuffix}</div><div>Jakarta Selatan, Indonesia &middot; Mon–Sat 09:00–17:00 WIB</div><div>${MAIL} &middot; +62 813-1016-7872</div>
<div style="margin-top:12px;font-size:11px;color:#6d7177">${t.footer}<br>${t.why}</div></td></tr>
</table></td></tr></table></body></html>`;
}
const hero = (eyebrow, title, sub, color = C.mat) => `<tr><td style="background:${color};padding:34px 28px 30px"><div style="${MONO};font-size:11px;color:${C.signal};margin-bottom:12px">${eyebrow}</div><div style="${HEAD};font-size:34px;color:#fff">${title}</div><div style="${BODY};font-size:15px;line-height:1.55;color:#d9e6e0;margin-top:12px">${sub}</div></td></tr>`;
const body = inner => `<tr><td style="padding:26px 28px 8px">${inner}</td></tr>`;
const first = `{% assign first = customer.first_name | default: shipping_address.first_name | default: billing_address.first_name %}{% assign show_pay = false %}{% if financial_status == 'pending' or order_name == '#9999' %}{% assign show_pay = true %}{% endif %}`;
const greet = t => `${t.hi}{% if first != blank %} {{ first }}{% endif %}`;

/* line item rows (order confirmation, abandoned checkout) */
function lineRows(t, loop, showPrice = true) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">{% for line in ${loop} %}<tr>
<td style="padding:14px 0;border-bottom:1px solid ${C.line};width:68px">{% if line.image %}<img src="{{ line.image | img_url: '120x120' }}" width="60" height="60" alt="" style="display:block;border-radius:8px;border:1px solid ${C.line}">{% endif %}</td>
<td style="padding:14px 12px;border-bottom:1px solid ${C.line};${BODY}"><div style="font-weight:700;font-size:14px;color:${C.ink};line-height:1.3">{{ line.product.title | default: line.title }}</div>
<div style="font-size:12px;color:${C.mute};margin-top:3px">{% if line.variant.title and line.variant.title != 'Default Title' %}{{ line.variant.title }} &middot; {% endif %}${t.qty} {{ line.quantity }}</div></td>
${showPrice ? `<td align="right" style="padding:14px 0;border-bottom:1px solid ${C.line};${BODY};font-weight:700;font-size:14px;color:${C.ink};white-space:nowrap">{{ line.final_line_price | money }}</td>` : ''}</tr>{% endfor %}</table>`;
}
const trow = (k, v, strong) => `<tr><td style="padding:6px 0;${BODY};font-size:${strong ? 15 : 13}px;color:${strong ? C.ink : C.mute};font-weight:${strong ? 800 : 500}">${k}</td><td align="right" style="padding:6px 0;${BODY};font-size:${strong ? 18 : 13}px;color:${C.ink};font-weight:${strong ? 800 : 600}">${v}</td></tr>`;
const totalsBlock = t => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px">${trow(t.subtotal, '{{ subtotal_price | money }}')}
{% if total_discounts > 0 %}${trow(t.discount, '-{{ total_discounts | money }}')}{% endif %}${trow(t.shipping, '{% if shipping_price > 0 %}{{ shipping_price | money }}{% else %}{{ shipping_price | money }}{% endif %}')}
{% if tax_price > 0 %}${trow(t.tax, '{{ tax_price | money }}')}{% endif %}
<tr><td colspan="2" style="padding-top:8px"><div style="height:2px;background:${C.ink}"></div></td></tr>${trow(t.total, '{{ total_price | money }}', true)}</table>`;
const addr = (t, k1, v1, k2, v2) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:1px solid ${C.line};padding-top:18px"><tr>
<td valign="top" width="50%" style="padding-right:8px;${BODY};font-size:13px;line-height:1.55;color:${C.ink}">${label(k1)}${v1}</td><td valign="top" width="50%" style="${BODY};font-size:13px;line-height:1.55;color:${C.ink}">${label(k2)}${v2}</td></tr></table>`;
const cta = (lbl, href, kind) => `<div style="margin:26px 0 22px;text-align:center">${btn(lbl, href, kind)}</div>`;

/* ---------------- templates ---------------- */
function orderConfirmation(lang, store) {
  const t = L[lang], id = lang === 'id';
  const pay = id ? `{% if show_pay %}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.mat};border-radius:14px;margin:4px 0 22px"><tr><td style="padding:22px">
<div style="${MONO};font-size:11px;color:${C.signal};margin-bottom:8px">Bayar sekarang</div><div style="${BODY};font-size:13px;color:#d9e6e0">Transfer tepat sesuai total</div>
<div style="${HEAD};font-size:34px;color:${C.signal};margin:2px 0 14px">{{ total_price | money }}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="top" width="50%" style="padding-right:10px"><div style="background:#fff;border-radius:10px;padding:10px;text-align:center"><img src="${QRIS}" width="150" alt="QRIS HPZ STORE N TOYS" style="display:block;margin:0 auto;max-width:100%"><div style="${MONO};font-size:9px;color:${C.mute};margin-top:6px">QRIS &middot; semua bank &amp; e-wallet</div></div></td>
<td valign="top" width="50%" style="${BODY};color:#fff;font-size:13px;line-height:1.6;padding-left:6px"><div style="${MONO};font-size:10px;color:#a7c2b8">Transfer bank</div><div style="font-weight:700;font-size:15px">BCA 2913281284</div><div style="color:#d9e6e0">a.n. Heru Prasetyo</div>
<div style="margin-top:10px;color:#d9e6e0">Tulis nomor pesanan <b style="color:#fff">{{ order_name }}</b> di berita transfer.</div><div style="margin-top:8px;${MONO};font-size:10px;color:${C.signal}">Batas bayar: 24 jam</div></td></tr></table>
<div style="margin-top:18px">${btn('Konfirmasi via WhatsApp', 'https://wa.me/' + WA + '?text=Halo%20admin%20HPZ%2C%20saya%20sudah%20bayar%20pesanan%20{{ order_name | url_encode }}', 'signal')}&nbsp;&nbsp;${btn('Buka halaman bayar', 'https://id.hpzdiecast.com/pages/bayar?order={{ order_name | url_encode }}&total={{ total_price | divided_by: 100.0 | round }}&cur={{ currency }}', 'ghost')}</div>
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px"><tr>${['Bayar sesuai total', 'Kirim bukti bayar di WhatsApp', 'Kami konfirmasi dan kirim'].map((s, i) => `<td valign="top" width="33%" style="padding-right:8px;${BODY};font-size:12px;line-height:1.45;color:${C.ink}"><div style="${MONO};font-size:11px;color:${C.mute};margin-bottom:4px">0${i + 1}</div>${s}</td>`).join('')}</tr></table>
{% endif %}` : '';
  const eyebrow = id ? "Pesanan {{ order_name }} &middot; {% if show_pay %}menunggu pembayaran{% else %}dibayar{% endif %}" : "Order {{ order_name }} &middot; {% if show_pay %}payment pending{% else %}paid{% endif %}";
  const title = id ? "{% if show_pay %}Pesanan diterima.<br>Tinggal bayar.{% else %}Terima kasih.<br>Pesananmu masuk.{% endif %}" : "Thank you{% if first != blank %}, {{ first }}{% endif %}.<br>Your order is in.";
  const sub = id ? "{{ greet }}, pesananmu sudah kami catat. Pesanan diproses setelah pembayaran dikonfirmasi admin." : "We got your order. We pack every part by hand in Jakarta and email you tracking when it ships.";
  const duty = id ? '' : `<br><span style="color:${C.mute};font-size:12px">Duties and import taxes, if any, are paid by the recipient.</span>`;
  const html = shell(lang,
    hero(eyebrow, title, sub.replace('{{ greet }}', greet(t)))
    + body(`${stepperIf(t, "show_pay == false", 1, 0)}<div style="height:18px"></div>${pay}${label(t.items)}${lineRows(t, 'subtotal_line_items')}${totalsBlock(t)}
${addr(t, t.shipTo, '{{ shipping_address | format_address }}', t.method, `{% if shipping_method.title != blank %}{{ shipping_method.title }}{% endif %}${duty}`)}
${cta(t.view, '{{ order_status_url }}')}`),
    id ? "Pesanan {{ order_name }} diterima. {% if show_pay %}Bayar {{ total_price | money }} lewat QRIS atau transfer BCA.{% endif %}" : 'Order {{ order_name }} confirmed. We will email tracking when it ships.');
  return `{% comment %} HPZ ${store} · Order confirmation · subject: see subjects.md {% endcomment %}\n${first}\n${html}`;
}

function shippingMail(lang, store, delivered) {
  const t = L[lang], id = lang === 'id';
  const e = id ? (delivered ? 'Pesanan {{ order_name }} &middot; sampai' : 'Pesanan {{ order_name }} &middot; dalam pengiriman') : (delivered ? 'Order {{ order_name }} &middot; delivered' : 'Order {{ order_name }} &middot; shipped');
  const ttl = id ? (delivered ? 'Paketmu<br>sudah sampai.' : 'Paketmu<br>sudah jalan.') : (delivered ? 'Your parcel<br>has arrived.' : 'Your parcel<br>is on its way.');
  const sub = id ? (delivered ? 'Semoga sesuai harapan. Cek isi paket, lalu pasang dan pamerkan hasilnya.' : 'Pesanan dikemas rapi dan sudah diserahkan ke kurir.') : (delivered ? 'We hope it is everything you wanted. Check the parcel and show us the build.' : 'Packed by hand and handed to the courier. Here is how to follow it.');
  const track = delivered ? '' : `{% assign tno = fulfillment.tracking_numbers.first %}{% assign turl = fulfillment.tracking_urls.first %}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};border-radius:12px;margin-bottom:22px"><tr><td style="padding:20px 22px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
{% if fulfillment.tracking_company != blank %}<td valign="top" style="${BODY};font-size:13px;color:${C.ink}">${label(id ? 'Kurir' : 'Carrier')}<b style="font-size:15px">{{ fulfillment.tracking_company }}</b></td>{% endif %}
{% if tno != blank %}<td valign="top" style="${BODY};font-size:13px;color:${C.ink}">${label(id ? 'Nomor resi' : 'Tracking number')}<b style="font-size:15px;${MONO}">{{ tno }}</b></td>{% endif %}
{% if fulfillment.estimated_delivery_at %}<td valign="top" style="${BODY};font-size:13px;color:${C.ink}">${label(id ? 'Estimasi tiba' : 'Estimated arrival')}<b style="font-size:15px">{{ fulfillment.estimated_delivery_at | date: '%d %b' }}</b></td>{% endif %}
</tr></table>{% if turl != blank %}<div style="margin-top:16px">${btn(id ? 'Lacak paket' : 'Track your parcel', '{{ turl }}')}</div>{% endif %}</td></tr></table>`;
  const items = `${label(id ? 'Isi paket' : 'In this parcel')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">{% for fl in fulfillment.fulfillment_line_items %}<tr>
<td style="padding:12px 0;border-bottom:1px solid ${C.line};${BODY};font-size:14px;color:${C.ink};font-weight:700">{{ fl.line_item.title }}</td><td align="right" style="padding:12px 0;border-bottom:1px solid ${C.line};${BODY};font-size:13px;color:${C.mute}">${t.qty} {{ fl.quantity }}</td></tr>{% endfor %}</table>`;
  const html = shell(lang, hero(e, ttl, sub, C.ink)
    + body(`${stepper(t, delivered ? 4 : 3)}<div style="height:18px"></div>${track}${items}
${addr(t, t.shipTo, '{{ shipping_address | format_address }}', id ? 'Tips' : 'Good to know', id ? 'Cek paket saat diterima dan simpan video unboxing kalau ada masalah.' : 'Check the parcel when it arrives and keep an unboxing video if anything is wrong.')}
${cta(t.view, '{{ order_status_url }}', 'dark')}`),
    id ? 'Pesanan {{ order_name }}' + (delivered ? ' sudah sampai.' : ' sudah dikirim.') : 'Order {{ order_name }}' + (delivered ? ' has arrived.' : ' has shipped.'));
  return `{% comment %} HPZ ${store} · ${delivered ? 'Delivered' : 'Shipping confirmation'} {% endcomment %}\n${html}`;
}

function canceled(lang, store) {
  const t = L[lang], id = lang === 'id';
  const reason = id ? `{% case cancel_reason %}{% when 'customer' %}Pesanan dibatalkan atas permintaan kamu.{% when 'inventory' %}Stok barang tidak mencukupi.{% when 'fraud' %}Pesanan tidak dapat kami proses.{% when 'declined' %}Pembayaran tidak berhasil.{% else %}Pesanan dibatalkan.{% endcase %}`
    : `{% case cancel_reason %}{% when 'customer' %}This order was canceled at your request.{% when 'inventory' %}Some items were out of stock.{% when 'fraud' %}We could not process this order.{% when 'declined' %}The payment did not go through.{% else %}This order was canceled.{% endcase %}`;
  const html = shell(lang, hero(id ? 'Pesanan {{ order_name }} &middot; dibatalkan' : 'Order {{ order_name }} &middot; canceled', id ? 'Pesanan<br>dibatalkan.' : 'Order<br>canceled.', reason, C.ink)
    + body(`<div style="${BODY};font-size:15px;line-height:1.6;color:${C.ink};margin:6px 0 20px">${id ? 'Kalau kamu sudah membayar, admin akan menghubungi untuk pengembalian dana. Ada yang ingin ditanyakan? Balas email ini atau chat WhatsApp.' : 'If you already paid, any refund is handled for you and you will get a separate email. Questions? Reply to this email or message us on WhatsApp.'}</div>
${label(t.items)}${lineRows(t, 'line_items')}${cta(id ? 'Lanjut belanja' : 'Keep shopping', id ? 'https://id.hpzdiecast.com' : 'https://hpzdiecast.com')}`),
    id ? 'Pesanan {{ order_name }} dibatalkan.' : 'Order {{ order_name }} was canceled.');
  return `{% comment %} HPZ ${store} · Order canceled {% endcomment %}\n${html}`;
}

function refund(lang, store) {
  const t = L[lang], id = lang === 'id';
  const html = shell(lang, hero(id ? 'Pesanan {{ order_name }} &middot; refund' : 'Order {{ order_name }} &middot; refund', id ? 'Refund<br>diproses.' : 'Refund<br>on its way.', id ? 'Kami sudah memproses pengembalian dana untuk pesananmu.' : 'We have processed a refund for your order.', C.mat)
    + body(`{% if refund.amount %}<div style="${BODY};margin:6px 0 20px"><div style="${MONO};font-size:11px;color:${C.mute};margin-bottom:4px">${id ? 'Jumlah refund' : 'Refund amount'}</div><div style="${HEAD};font-size:34px;color:${C.ink}">{{ refund.amount | money }}</div></div>{% endif %}
<div style="${BODY};font-size:15px;line-height:1.6;color:${C.ink};margin-bottom:20px">${id ? 'Karena pembayaran dilakukan manual, admin akan menghubungi kamu lewat WhatsApp untuk mengirim dana ke rekeningmu. Pastikan kamu menyiapkan nama bank dan nomor rekening.' : 'The money returns to your original payment method. Your bank or PayPal can take a few business days to show it.'}</div>
{% if refund.refund_line_items.size > 0 %}${label(id ? 'Barang yang di-refund' : 'Refunded items')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">{% for rl in refund.refund_line_items %}<tr><td style="padding:12px 0;border-bottom:1px solid ${C.line};${BODY};font-size:14px;color:${C.ink};font-weight:700">{{ rl.line_item.title }}</td><td align="right" style="padding:12px 0;border-bottom:1px solid ${C.line};${BODY};font-size:13px;color:${C.mute}">${t.qty} {{ rl.quantity }}</td></tr>{% endfor %}</table>{% endif %}
${cta(t.view, '{{ order_status_url }}', 'dark')}`),
    id ? 'Refund untuk pesanan {{ order_name }} diproses.' : 'A refund for order {{ order_name }} was processed.');
  return `{% comment %} HPZ ${store} · Refund {% endcomment %}\n${html}`;
}

function invite(lang, store) {
  const id = lang === 'id';
  const html = shell(lang, hero(id ? 'Akun HPZ Diecast' : 'HPZ Diecast account', id ? 'Aktifkan<br>akun kamu.' : 'Activate<br>your account.', id ? 'Satu akun untuk simpan alamat, lihat pesanan, dan lacak paket.' : 'One account to save addresses, see orders and track parcels.')
    + body(`<div style="${BODY};font-size:15px;line-height:1.6;color:${C.ink};margin:6px 0 22px">${id ? 'Halo{% if customer.first_name != blank %} {{ customer.first_name }}{% endif %}, klik tombol di bawah untuk membuat kata sandi dan mengaktifkan akun kamu.' : 'Hi{% if customer.first_name != blank %} {{ customer.first_name }}{% endif %}, tap the button below to set your password and activate your account.'}</div>
<div style="margin-bottom:22px">${btn(id ? 'Aktifkan akun' : 'Activate account', '{{ customer.account_activation_url }}')}</div>
<div style="${BODY};font-size:12px;line-height:1.6;color:${C.mute};border-top:1px solid ${C.line};padding-top:16px;margin-bottom:24px">${id ? 'Tombol tidak berfungsi? Salin tautan ini ke browser:' : 'Button not working? Paste this link into your browser:'} <span style="word-break:break-all">{{ customer.account_activation_url }}</span><br>${id ? 'Kalau kamu tidak merasa mendaftar, abaikan saja email ini.' : 'If you did not sign up, you can ignore this email.'}</div>`),
    id ? 'Aktifkan akun HPZ Diecast kamu.' : 'Activate your HPZ Diecast account.');
  return `{% comment %} HPZ ${store} · Customer account invite {% endcomment %}\n${html}`;
}

function reset(lang, store) {
  const id = lang === 'id';
  const html = shell(lang, hero(id ? 'Keamanan akun' : 'Account security', id ? 'Atur ulang<br>kata sandi.' : 'Reset your<br>password.', id ? 'Kami menerima permintaan untuk mengganti kata sandi akunmu.' : 'We got a request to reset the password for your account.', C.ink)
    + body(`<div style="${BODY};font-size:15px;line-height:1.6;color:${C.ink};margin:6px 0 22px">${id ? 'Klik tombol di bawah untuk membuat kata sandi baru.' : 'Tap the button below to choose a new password.'}</div>
<div style="margin-bottom:22px">${btn(id ? 'Buat kata sandi baru' : 'Choose a new password', '{{ customer.reset_password_url }}')}</div>
<div style="${BODY};font-size:12px;line-height:1.6;color:${C.mute};border-top:1px solid ${C.line};padding-top:16px;margin-bottom:24px">${id ? 'Kalau kamu tidak meminta ini, abaikan email ini. Kata sandimu tidak berubah.' : 'If you did not ask for this, ignore this email. Your password stays the same.'}<br><span style="word-break:break-all">{{ customer.reset_password_url }}</span></div>`),
    id ? 'Atur ulang kata sandi HPZ Diecast.' : 'Reset your HPZ Diecast password.');
  return `{% comment %} HPZ ${store} · Customer account password reset {% endcomment %}\n${html}`;
}

function abandoned(lang, store) {
  const t = L[lang], id = lang === 'id';
  const html = shell(lang, hero(id ? 'Keranjangmu menunggu' : 'Your cart is waiting', id ? 'Masih<br>mau ini?' : 'Still want<br>these?', id ? 'Kamu meninggalkan beberapa barang di checkout. Kami simpankan, tinggal lanjutkan.' : 'You left a few items at checkout. We saved them, just pick up where you stopped.', C.mat)
    + body(`${lineRows(t, 'line_items', false)}${cta(id ? 'Lanjutkan checkout' : 'Resume checkout', '{{ url }}')}
<div style="${BODY};font-size:12px;line-height:1.6;color:${C.mute};text-align:center;margin-bottom:22px">${id ? 'Stok bisa berubah, jadi sebaiknya selesaikan sebelum kehabisan.' : 'Stock can change, so finish before it sells out.'}</div>`),
    id ? 'Barang di keranjangmu masih tersimpan.' : 'The items in your cart are still saved.');
  return `{% comment %} HPZ ${store} · Abandoned checkout {% endcomment %}\n${html}`;
}


/* ---------- payment emails (unpaid orders): reminder, order invoice, draft order invoice ---------- */
const payCard = (amountExpr, orderExpr) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.mat};border-radius:14px;margin:4px 0 22px"><tr><td style="padding:22px">
<div style="${MONO};font-size:11px;color:${C.signal};margin-bottom:8px">Cara bayar</div><div style="${BODY};font-size:13px;color:#d9e6e0">Transfer tepat sesuai total</div>
<div style="${HEAD};font-size:34px;color:${C.signal};margin:2px 0 14px">{{ ${amountExpr} | money }}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="top" width="50%" style="padding-right:10px"><div style="background:#fff;border-radius:10px;padding:10px;text-align:center"><img src="${QRIS}" width="150" alt="QRIS HPZ STORE N TOYS" style="display:block;margin:0 auto;max-width:100%"><div style="${MONO};font-size:9px;color:${C.mute};margin-top:6px">QRIS &middot; semua bank &amp; e-wallet</div></div></td>
<td valign="top" width="50%" style="${BODY};color:#fff;font-size:13px;line-height:1.6;padding-left:6px"><div style="${MONO};font-size:10px;color:#a7c2b8">Transfer bank</div><div style="font-weight:700;font-size:15px">BCA 2913281284</div><div style="color:#d9e6e0">a.n. Heru Prasetyo</div>
<div style="margin-top:10px;color:#d9e6e0">Tulis nomor pesanan <b style="color:#fff">{{ ${orderExpr} }}</b> di berita transfer.</div><div style="margin-top:8px;${MONO};font-size:10px;color:${C.signal}">Batas bayar: 24 jam</div></td></tr></table>
<div style="margin-top:18px">${btn('Konfirmasi via WhatsApp', 'https://wa.me/' + WA + '?text=Halo%20admin%20HPZ%2C%20saya%20sudah%20bayar%20pesanan%20{{ ' + orderExpr + ' | url_encode }}', 'signal')}</div>
</td></tr></table>`;

function paymentMail(lang, store, kind) {
  const t = L[lang], id = lang === 'id';
  const ord = "order_name | default: name";
  const amount = "outstanding_balance | default: total_price";
  const E = {
    reminder: { id: ['Pengingat &middot; {{ ' + ord + ' }}', 'Pesananmu<br>menunggu bayar.', 'Kami belum menerima pembayaran untuk pesanan ini. Selesaikan sekarang supaya pesanan bisa kami proses.'],
      en: ['Reminder &middot; {{ ' + ord + ' }}', 'Your order<br>is waiting.', 'We have not received payment for this order yet. Complete it now so we can pack and ship.'] },
    invoice: { id: ['Tagihan &middot; {{ ' + ord + ' }}', 'Tagihan<br>pesanan.', 'Ada sisa pembayaran untuk pesananmu. Rincian dan cara bayar ada di bawah.'],
      en: ['Invoice &middot; {{ ' + ord + ' }}', 'Invoice<br>for your order.', 'There is an outstanding balance on your order. Details and how to pay are below.'] },
    draft: { id: ['Tagihan dari HPZ Diecast', 'Tagihan<br>untukmu.', 'Kami menyiapkan pesanan untukmu. Periksa rinciannya, lalu bayar lewat tautan atau transfer.'],
      en: ['Invoice from HPZ Diecast', 'Your invoice<br>is ready.', 'We prepared an order for you. Review it, then pay with the button below.'] }
  }[kind][lang];
  const link = "{{ invoice_url | default: order_status_url }}";
  const inner = hero(E[0], E[1], E[2], kind === 'reminder' ? C.ink : C.mat) + body(
    (id ? payCard(amount, ord) : `<div style="${BODY};margin:6px 0 20px"><div style="${MONO};font-size:11px;color:${C.mute};margin-bottom:4px">Amount due</div><div style="${HEAD};font-size:34px;color:${C.ink}">{{ ${amount} | money }}</div></div><div style="margin-bottom:22px">${btn('Pay now', link)}</div>`)
    + `{% if line_items.size > 0 %}${label(t.items)}${lineRows(t, 'line_items')}{% endif %}`
    + (id ? `<div style="margin:22px 0 22px;text-align:center">${btn('Buka rincian pesanan', link, 'dark')}</div>` : ''));
  const kn = { reminder: 'Payment reminder', invoice: 'Order invoice', draft: 'Draft order invoice' }[kind];
  return `{% comment %} HPZ ${store} · ${kn} {% endcomment %}
` + shell(lang, inner, id ? 'Pesanan {{ ' + ord + ' }}: ' + { reminder: 'belum dibayar.', invoice: 'ada tagihan.', draft: 'tagihan siap dibayar.' }[kind] : 'Order {{ ' + ord + ' }}: payment ' + { reminder: 'reminder.', invoice: 'invoice.', draft: 'invoice ready.' }[kind]);
}
function paymentReminder(lang, store) { return paymentMail(lang, store, 'reminder'); }
function orderInvoice(lang, store) { return paymentMail(lang, store, 'invoice'); }
function draftInvoice(lang, store) { return paymentMail(lang, store, 'draft'); }

const SUBJECTS = {
  en: { '01-order-confirmation': "Order {{ order_name }} confirmed", '02-shipping-confirmation': "Order {{ order_name }} has shipped", '03-delivered': "Order {{ order_name }} has arrived", '04-order-canceled': "Order {{ order_name }} was canceled", '05-refund': "Refund for order {{ order_name }}", '06-customer-account-invite': "Activate your HPZ Diecast account", '07-password-reset': "Reset your HPZ Diecast password", '08-abandoned-checkout': "Your cart at HPZ Diecast is waiting", '09-payment-reminder': "Payment reminder for order {{ order_name | default: name }}", '10-order-invoice': "Invoice for order {{ order_name | default: name }}", '11-draft-order-invoice': "Your invoice from HPZ Diecast" },
  id: { '01-order-confirmation': "{% if financial_status == 'pending' %}Pesanan {{ order_name }} diterima, tinggal bayar{% else %}Pesanan {{ order_name }} diterima{% endif %}", '02-shipping-confirmation': "Pesanan {{ order_name }} sudah dikirim", '03-delivered': "Pesanan {{ order_name }} sudah sampai", '04-order-canceled': "Pesanan {{ order_name }} dibatalkan", '05-refund': "Refund untuk pesanan {{ order_name }}", '06-customer-account-invite': "Aktifkan akun HPZ Diecast kamu", '07-password-reset': "Atur ulang kata sandi HPZ Diecast", '08-abandoned-checkout': "Keranjangmu di HPZ Diecast masih tersimpan", '09-payment-reminder': "Pengingat bayar pesanan {{ order_name | default: name }}", '10-order-invoice': "Tagihan pesanan {{ order_name | default: name }}", '11-draft-order-invoice': "Tagihan dari HPZ Diecast" }
};
const NAMES = { '01-order-confirmation': 'Order confirmation', '02-shipping-confirmation': 'Shipping confirmation', '03-delivered': 'Delivered', '04-order-canceled': 'Order canceled', '05-refund': 'Order refund', '06-customer-account-invite': 'Customer account invite', '07-password-reset': 'Customer account password reset', '08-abandoned-checkout': 'Abandoned checkout', '09-payment-reminder': 'Payment reminder', '10-order-invoice': 'Order invoice', '11-draft-order-invoice': 'Draft order invoice' };

for (const [store, lang] of [['global', 'en'], ['indonesia', 'id']]) {
  const dir = path.join(OUT, store);
  fs.mkdirSync(dir, { recursive: true });
  const T8 = {
    '01-order-confirmation': orderConfirmation(lang, store), '02-shipping-confirmation': shippingMail(lang, store, false), '03-delivered': shippingMail(lang, store, true),
    '04-order-canceled': canceled(lang, store), '05-refund': refund(lang, store), '06-customer-account-invite': invite(lang, store), '07-password-reset': reset(lang, store), '08-abandoned-checkout': abandoned(lang, store),
    '09-payment-reminder': paymentReminder(lang, store), '10-order-invoice': orderInvoice(lang, store), '11-draft-order-invoice': draftInvoice(lang, store)
  };
  for (const [n, h] of Object.entries(T8)) fs.writeFileSync(path.join(dir, n + '.liquid'), lang === 'id' ? h.split('| money }}').join('| money_without_trailing_zeros }}') : h);
  fs.writeFileSync(path.join(dir, 'subjects.md'), `# ${store === 'global' ? 'International store' : 'Indonesia store'}: notification subjects\n\nPaste into Settings > Notifications > (template) > Subject. Body = the matching .liquid file.\n\n| Shopify template | Subject |\n|---|---|\n` + Object.keys(NAMES).map(k => `| ${NAMES[k]} | \`${SUBJECTS[lang][k]}\` |`).join('\n') + '\n');
}
console.log('liquid templates written for global and indonesia (QRIS url:', QRIS + ')');
