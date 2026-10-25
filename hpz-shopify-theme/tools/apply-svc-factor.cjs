// One-off: Services page amounts are authored in USD. Setting "svc_price_factor" (1 on the international store, 16000 on the Indonesia store)
// scales every amount the Services page shows, in Liquid and in assets/services.js, so the Indonesia store shows real Rupiah figures.
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const rd = f => fs.readFileSync(root + '/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(root + '/' + f, s);
function sub(file, pairs) {
  let s = rd(file);
  for (const [a, b] of pairs) { if (!s.includes(a)) throw new Error(file + ': anchor missing: ' + a.slice(0, 60)); s = s.split(a).join(b); }
  wr(file, s);
}
const FX = "{%- assign svc_fx = settings.svc_price_factor | default: 1 -%}\n";

// setting
const sc = JSON.parse(rd('config/settings_schema.json'));
const g = sc.find(x => x.name === 'Stores (Indonesia / International)');
if (!g.settings.find(x => x.id === 'svc_price_factor')) {
  g.settings.push({ type: 'number', id: 'svc_price_factor', label: 'Services page price multiplier', default: 1,
    info: 'The Services page prices are written in US dollars. 1 = show them as they are (international store). Indonesia store: use 16000 so $25 becomes Rp 400.000.' });
  wr('config/settings_schema.json', JSON.stringify(sc, null, 2) + '\n');
}

// JS gets the factor through HPZ_RAW
let t = rd('layout/theme.liquid');
if (!t.includes('svcFactor')) {
  const a = "idrRate: {{ settings.idr_rate | default: 0 | json }},";
  if (!t.includes(a)) throw new Error('layout idrRate anchor missing');
  t = t.replace(a, () => a + "\n        svcFactor: {{ settings.svc_price_factor | default: 1 | json }},");
  wr('layout/theme.liquid', t);
}
if (!rd('assets/services.js').includes('SVC_FX')) {
  sub('assets/services.js', [["const money = n => H.money(Math.round(n * 100));",
    "const SVC_FX = +((window.HPZ_RAW && HPZ_RAW.settings && HPZ_RAW.settings.svcFactor) || 1) || 1; // services amounts are authored in USD\n  const money = n => H.money(Math.round(n * 100 * SVC_FX));"]]);
}

// Liquid snippets
for (const f of ['service-decal', 'service-build', 'service-wholesale', 'service-points']) {
  const p = 'snippets/' + f + '.liquid';
  if (!rd(p).startsWith(FX)) wr(p, FX + rd(p));
}
sub('snippets/service-decal.liquid', [
  ["b.settings.add | times: 100 | money_without_trailing_zeros", "b.settings.add | times: 100 | times: svc_fx | money_without_trailing_zeros"],
  ["b.settings.price | times: 100 | money_without_trailing_zeros }}</span>", "b.settings.price | times: 100 | times: svc_fx | money_without_trailing_zeros }}</span>"]
]);
sub('snippets/service-build.liquid', [
  ["b.settings.price | times: 100 | money_without_trailing_zeros | escape", "b.settings.price | times: 100 | times: svc_fx | money_without_trailing_zeros | escape"],
  ["assign lo_c = lo | times: 100 -%}", "assign lo_c = lo | times: 100 | times: svc_fx -%}"],
  ["assign hi_c = hi | times: 100 %}", "assign hi_c = hi | times: 100 | times: svc_fx %}"]
]);
sub('snippets/service-wholesale.liquid', [["assign rrp_c = s.ws_rrp | times: 100 -%}", "assign rrp_c = s.ws_rrp | times: 100 | times: svc_fx -%}"]]);
sub('snippets/service-points.liquid', [
  ["assign redeem_c = s.pp_redeem_value | times: 100 -%}", "assign redeem_c = s.pp_redeem_value | times: 100 | times: svc_fx -%}\n{%- assign unit_txt = '$1' -%}{%- if svc_fx != 1 -%}{%- assign unit_c = svc_fx | times: 100 -%}{%- assign unit_txt = unit_c | money_without_trailing_zeros -%}{%- endif -%}"],
  ["{{ p | strip }}</li>", "{{ p | strip | replace: '$1', unit_txt }}</li>"],
  ["<td class=\"mono\">{{ f[1] | strip }}</td>", "<td class=\"mono\">{{ f[1] | strip | replace: '$1', unit_txt }}</td>"]
]);

// the cart note still said "checkout is in USD": the Indonesia store now charges in Rupiah
let pay = rd('_locales/payment.json');
pay = pay.split('Prices are shown in Rupiah as an estimate. Checkout is charged in USD, and the Rupiah amount to pay is shown on the payment page. Pay with QRIS or BCA transfer, then confirm on WhatsApp.')
  .join('All prices and checkout are in Rupiah. Pay with QRIS or BCA transfer, then confirm on WhatsApp.')
  .split('Harga ditampilkan dalam Rupiah sebagai perkiraan. Checkout tercatat dalam USD, dan nominal Rupiah yang dibayar ada di halaman pembayaran. Bayar pakai QRIS atau transfer BCA, lalu konfirmasi lewat WhatsApp.')
  .join('Semua harga dan checkout dalam Rupiah. Bayar pakai QRIS atau transfer BCA, lalu konfirmasi lewat WhatsApp.');
wr('_locales/payment.json', pay);
console.log('services factor wired');
