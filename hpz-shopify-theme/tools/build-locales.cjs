// Merges every _locales/<area>.json into locales/{en.default,id,ja}.json.
// Each area file looks like: { "en": { "products": { "product": { "sold_out": "Sold out" } } }, "id": {...}, "ja": {...} }
// Missing translations fall back to English so Shopify never shows a raw key.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const dir = path.join(ROOT, '_locales');
const merge = (a, b) => { for (const k of Object.keys(b)) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) a[k] = merge(a[k] && typeof a[k] === 'object' ? a[k] : {}, b[k]); else a[k] = b[k]; } return a; };
const out = { en: {}, id: {} };
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const src = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const L of ['en', 'id']) if (src[L]) merge(out[L], src[L]);
}
// fallback: id/ja missing a key -> English value
const fill = (en, lang) => { for (const k of Object.keys(en)) { if (en[k] && typeof en[k] === 'object') { lang[k] = fill(en[k], lang[k] && typeof lang[k] === 'object' ? lang[k] : {}); } else if (lang[k] === undefined) lang[k] = en[k]; } return lang; };
out.id = fill(out.en, out.id);
fs.mkdirSync(path.join(ROOT, 'locales'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'locales/en.default.json'), JSON.stringify(out.en, null, 2) + '\n');
fs.writeFileSync(path.join(ROOT, 'locales/id.json'), JSON.stringify(out.id, null, 2) + '\n');
console.log('locales written: en.default.json, id.json');
