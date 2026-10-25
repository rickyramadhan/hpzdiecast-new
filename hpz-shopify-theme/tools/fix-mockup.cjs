// One-off corrections applied to the static mockup (hpz-redesign) so it matches the live store facts:
// location = Jakarta Selatan, 40 countries, duties paid by recipient (no DDP claim), no % discount badges.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '../../hpz-redesign');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (e.name === 'node_modules' ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
const RULES = [
  // address / location
  [/Jl\. Pamularsih Raya 12,\s*Semarang 50148, Indonesia/g, 'Jakarta Selatan, Indonesia'],
  [/Jl\. Pamularsih Raya 12, Semarang 50148/g, 'Jakarta Selatan, Indonesia'],
  [/Jl\. Pamularsih Raya 12/g, 'Jakarta Selatan'],
  [/Jl\. Pandanaran No\. 88/g, 'Jl. Kemang Raya No. 88'],
  [/Kec\. Semarang Tengah/g, 'Kec. Mampang Prapatan'],
  [/Kota Semarang/g, 'Jakarta Selatan'],
  [/Jawa Tengah/g, 'DKI Jakarta'],
  [/'50241'/g, "'12730'"],
  [/'50148'/g, "'12730'"],
  [/Semarang/g, 'Jakarta Selatan'],
  // countries: store ships to 40
  [/dikirim ke 40\+ negara/g, 'dikirim ke 40 negara'],
  [/40\+ negara/g, '40 negara'],
  [/shipped to 40\+ countries/g, 'shipped to 40 countries'],
  [/data-count="43"/g, 'data-count="40"'],
  [/43 countries/g, '40 countries'],
  [/to 43 countries/g, 'to 40 countries'],
  [/ke 43 negara/g, 'ke 40 negara'],
  // duties: recipient pays, no DDP promise
  [/US orders: duties prepaid at checkout — no surprise fees/g, 'Import duties and taxes, if any, are paid by the recipient'],
  [/Pesanan US: bea masuk dibayar di checkout/g, 'Bea dan pajak impor, jika ada, dibayar penerima'],
  [/米国：関税は決済時に前払い/g, '輸入関税・税は受取人負担'],
  [/Import duties for the US are calculated and prepaid at checkout \(DDP\)\./g, 'Import duties and taxes, if any, are paid by the recipient.'],
  [/Bea masuk US dihitung & dibayar di checkout \(DDP\)\./g, 'Bea dan pajak impor, jika ada, dibayar penerima.'],
  [/Duties were prepaid at checkout\. DHL took 5 days to California\./g, 'DHL took 5 days to California.'],
  [/Fast to the US even with the new rules/g, 'Fast delivery to the US'],
  [/USPS via Asendia \(DDP\)/g, 'USPS Tracked'],
  [/DHL Express \(DDP\)/g, 'DHL Express'],
  [/Duties & tariffs \(DDP\)/g, 'Import duties & taxes'],
  [/Bea & tarif \(DDP\)/g, 'Bea & pajak impor'],
  [/関税 \(DDP\)/g, '輸入関税・税'],
  [/Collected now so the courier never asks you to pay on delivery\./g, 'Paid by the recipient, if your country charges them.'],
  [/Dikumpulkan sekarang supaya kurir tidak menagih saat diterima\./g, 'Dibayar penerima, jika negaranya mengenakan.'],
  [/Courier needs a phone number to clear US customs under DDP\./g, 'The courier needs a phone number for customs clearance.'],
  [/Kurir butuh nomor telepon untuk clearance bea cukai US \(DDP\)\./g, 'Kurir butuh nomor telepon untuk pengurusan bea cukai.'],
  [/Duties & tariffs/g, 'Import duties & taxes'],
  [/Bea & tarif/g, 'Bea & pajak impor'],
  [/US duties & tariffs are calculated and prepaid at checkout\. Nothing to pay on delivery\./g, 'Import duties and taxes, if any, are paid by the recipient.'],
  [/Duties prepaid at checkout/g, 'Import duties and taxes, if any, are paid by the recipient'],
  [/Bea masuk dibayar di checkout/g, 'Bea dan pajak impor, jika ada, dibayar penerima'],
  [/Duties prepaid \(DDP\)/g, 'Import duties paid by recipient'],
  [/Bea masuk prabayar \(DDP\)/g, 'Bea masuk dibayar penerima'],
  [/関税前払い/g, '関税は受取人負担'],
  [/Duties \(DDP\)/g, 'Import duties'],
  [/Bea \(DDP\)/g, 'Bea impor'],
  [/Duties and import taxes/g, 'Import duties and taxes'],
  [/Duties & tariffs/g, 'Import duties & taxes'],
  [/Duties paid by recipient/g, 'Import duties paid by recipient'],
  [/Duties prepaid at checkout \(DDP\)/g, 'Import duties and taxes, if any, are paid by the recipient'],
  [/Bea masuk dibayar di checkout \(DDP\)/g, 'Bea dan pajak impor, jika ada, dibayar penerima'],
  [/Duties & taxes/g, 'Import duties & taxes'],
  [/Ship US orders DDP[^<]*/g, 'Import duties and taxes, if any, are paid by the recipient. We declare the value honestly and mark gifts as such when you ask.'],
  [/so we ship US orders DDP \(Delivered Duty Paid\)[^<]*/g, 'import duties and taxes are paid by the recipient when the parcel is delivered, as set by the destination country.'],
  // brand copy: do not claim "in-house" for partner-made designs
  [/Designed and assembled in-house in Jakarta Selatan\./g, 'Designed by HPZ.'],
  [/Designed in-house in Jakarta Selatan\./g, 'Designed by HPZ.'],
  [/Designed in-house\./g, 'Designed by HPZ.'],
  [/Didesain in-house di Jakarta Selatan\./g, 'Didesain oleh HPZ.'],
  [/Didesain in-house\./g, 'Didesain oleh HPZ.'],
];
const SKIP = /catalog\.js$/;
let total = 0; const changed = [];
for (const f of walk(ROOT)) {
  if (!/\.(html|js|css)$/.test(f) || SKIP.test(f)) continue;
  let s = fs.readFileSync(f, 'utf8'), o = s;
  for (const [re, to] of RULES) s = s.replace(re, to);
  if (s !== o) { fs.writeFileSync(f, s, 'utf8'); changed.push(path.relative(ROOT, f)); }
}
console.log('files changed:', changed.length); console.log(changed.join('\n'));
