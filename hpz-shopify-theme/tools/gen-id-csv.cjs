// Builds the Indonesia-store import CSV from a Shopify product export of hpzdiecast.com.
// usage: node tools/gen-id-csv.cjs <export.csv> [rate=16300] [round=1000]
// Everything is kept as exported (titles, options, images, SEO, status, tracker, stock quantities, weights, Google fields).
// Only the money columns change: USD x rate, rounded to the nearest <round> rupiah.
// "Cost per item" is converted the same way when present.
const fs = require('fs');
const path = require('path');
const { parse, stringify } = require('./csv-lib.cjs');

const src = process.argv[2];
if (!src) { console.error('usage: node tools/gen-id-csv.cjs <export.csv> [rate] [round]'); process.exit(1); }
const rate = +process.argv[3] || 16300, round = +process.argv[4] || 1000;
const idr = usd => String(Math.max(round, Math.round(parseFloat(usd) * rate / round) * round));

const rows = parse(fs.readFileSync(src, 'utf8'));
const h = rows[0];
const ix = n => { const i = h.indexOf(n); if (i < 0) throw new Error('missing column ' + n); return i; };
const P = ix('Variant Price'), C = ix('Variant Compare At Price'), K = h.indexOf('Cost per item');
let priced = 0, compared = 0, skipped = 0;
const out = [h];
for (const r of rows.slice(1)) {
  if (r.length < 2) continue;
  const row = r.slice();
  while (row.length < h.length) row.push('');
  if (row[P] !== '' && isFinite(parseFloat(row[P]))) { row[P] = idr(row[P]); priced++; }
  else if (row[P] !== '') skipped++;
  if (row[C] !== '' && isFinite(parseFloat(row[C]))) { row[C] = idr(row[C]); compared++; }
  if (K >= 0 && row[K] !== '' && isFinite(parseFloat(row[K]))) row[K] = idr(row[K]);
  out.push(row);
}
const file = path.resolve(__dirname, '../setup/products-idr.csv');
fs.writeFileSync(file, stringify(out));
console.log(`rows ${out.length - 1}, prices converted ${priced}, compare-at converted ${compared}, skipped ${skipped}, rate ${rate}, round ${round} -> ${file}`);
