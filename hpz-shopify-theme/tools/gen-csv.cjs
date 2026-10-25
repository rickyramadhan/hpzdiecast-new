// Builds an import CSV (Shopify product import format, metafield columns) from the live export in ../_src.
// Guessed values are flagged in hpz.needs_review = TRUE so the team checks them by hand.
// Usage: node tools/gen-csv.cjs   -> writes setup/product-metafields.csv
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '../../_src');
const all = [...require(SRC + '/p1.json').products, ...require(SRC + '/p2.json').products];
const txt = h => (h || '').replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const BRANDS = [
  [/^HPZ/i, 'hpz', 'HPZ Wheels'], [/^JV /i, 'jv', 'JV Custom'], [/^Sakura/i, 'sakura', 'Sakura Model'],
  [/^Octopus/i, 'octopus', 'Octopus Hobbies'], [/^Parvus/i, 'parvus', 'Parvus Models'], [/^Rebel/i, 'rebel', 'Rebel x Arise'],
  [/^Turbominiscale/i, 'turbo', 'Turbominiscale'], [/carlomo/i, 'carlomo', 'Carlomo'], [/^Muscle Car 23/i, 'mc23', 'Muscle Car 23'],
  [/^WS Scale/i, 'ws', 'WS Scale'], [/^Decal/i, 'hpzdecal', 'HPZ Decal'],
];
const brandOf = p => { for (const [re, , name] of BRANDS) if (re.test(p.title)) return name; return p.vendor || ''; };
const DIA = t => { const m = t.match(/(\d+(?:[.,]\d+)?)\s*mm/i); if (!m) return null; const v = parseFloat(m[1].replace(',', '.')); return v >= 7 && v <= 14 ? v : null; };
const style = t => /off ?road|method|fuel|beadlock/i.test(t) ? 'offroad' : /muscle|cragar|torq|centerline|darko|falcon/i.test(t) ? 'muscle' : /steel|banded|speedline|fuchs|longchamp|minilite|ronal|eagle/i.test(t) ? 'classic' : /porsche|manthey|alpina|amg|bbs|bmw|oz |hre|vossen|rotiform|aerodisc|mercedes|audi|gt3/i.test(t) ? 'euro' : 'jdm';
const rows = [];
for (const p of all) {
  const body = txt(p.body_html), t = p.title;
  const isWheel = /wheel|retorim|tire|tyre|rims|carlomo|bearing|turbominiscale|muscle car 23|ws scale/i.test(t) && !/decal|body kit|accessor/i.test(t) || /^HPZ Wheels|^JV Wheels|^Sakura - Custom wheel|^Premium Alloy|^Rebel tires/i.test(t);
  const dia = DIA(body) ?? DIA(t);
  const guessed = [];
  let d = dia;
  if (isWheel && d == null) { d = /muscle car 23/i.test(t) ? 12 : /carlomo/i.test(t) ? 9.5 : 10; guessed.push('diameter'); }
  const bearing = /bearing/i.test(t + ' ' + body) ? 'true' : 'false';
  const disc = /disc ?brake|discbrake/i.test(t + ' ' + body) ? 'true' : 'false';
  const sheet = /decal/i.test(t) ? (/white toner|toner/i.test(t + body) ? 'white-toner' : 'transparent') : '';
  const brand = brandOf(p);
  if (brand === p.vendor) guessed.push('brand');
  const sku = p.variants.length === 1 ? 'HPZ-' + (p.handle.slice(0, 18).toUpperCase().replace(/[^A-Z0-9]+/g, '-')).replace(/-+$/, '') : '';
  rows.push({
    Handle: p.handle, Title: t, Vendor: brand, 'Type': p.variants.length ? '' : '',
    'Variant SKU': p.variants.length === 1 ? sku : '',
    'metafield: hpz.diameter [number_decimal]': isWheel && d ? d : '',
    'metafield: hpz.axle [single_line_text_field]': isWheel ? (/long axle|jdm/i.test(body) ? 'long' : '') : '',
    'metafield: hpz.has_bearing [boolean]': isWheel ? bearing : '',
    'metafield: hpz.has_disc_brake [boolean]': isWheel ? disc : '',
    'metafield: hpz.wheel_style [single_line_text_field]': isWheel ? style(t) : '',
    'metafield: hpz.sheet_type [single_line_text_field]': sheet,
    'metafield: hpz.needs_review [boolean]': guessed.length || !dia ? 'true' : 'false',
    'Review note': guessed.join(';'),
  });
}
const cols = Object.keys(rows[0]);
const esc = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const out = [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
fs.mkdirSync(path.join(__dirname, '../setup'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../setup/product-metafields.csv'), '﻿' + out + '\n');
const flagged = rows.filter(r => r['metafield: hpz.needs_review [boolean]'] === 'true').length;
console.log(`rows ${rows.length}, needs review ${flagged}`);
