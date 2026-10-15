// Builds assets/js/catalog.js from the public Shopify export (_src/*.json).
// node tools/build-catalog.cjs   (run from hpz-redesign/)
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '../../_src');
const all = [...require(SRC + '/p1.json').products, ...require(SRC + '/p2.json').products];
const colOf = {};
for (const f of fs.readdirSync(SRC + '/col')) {
  const h = f.replace('.json', '');
  for (const p of JSON.parse(fs.readFileSync(SRC + '/col/' + f)).products) (colOf[p.id] = colOf[p.id] || []).push(h);
}
const txt = h => (h || '').replace(/<br\s*\/?>/g, '\n').replace(/<\/p>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n\s*/g, '\n').trim();
const img = s => s.replace('https://cdn.shopify.com/s/files/1/0716/6427/1450/files/', '');

function brandOf(t, cols) {
  if (/^HPZ/i.test(t)) return 'hpz';
  if (/^JV /i.test(t)) return 'jv';
  if (/^Sakura/i.test(t)) return 'sakura';
  if (/^Octopus/i.test(t)) return 'octopus';
  if (/^Parvus/i.test(t)) return 'parvus';
  if (/^Rebel/i.test(t)) return 'rebel';
  if (/^Turbominiscale/i.test(t)) return 'turbo';
  if (/Carlomo/i.test(t)) return 'carlomo';
  if (/^Muscle Car 23/i.test(t)) return 'mc23';
  if (/^WS Scale/i.test(t)) return 'ws';
  if (/^Decal/i.test(t)) return 'hpzdecal';
  if (cols.includes('jv-custom')) return 'jv';
  if (cols.includes('sakura-model')) return 'sakura';
  return 'hpz';
}
function catOf(t, cols) {
  if (/^decal/i.test(t) || cols.includes('decals') && !/wheel/i.test(t)) return 'decals';
  if (/body ?kit|wide ?body|bumper|fender|bodykit|front lip|overfender/i.test(t) || cols.includes('body-kit') || cols.includes('wide-body-kit')) return 'bodykits';
  if (/engine|mesin/i.test(t) || cols.includes('engines')) return 'engines';
  if (/seat|recaro|steering|interior|roll ?cage/i.test(t) || cols.some(c => c.startsWith('interior'))) return 'interior';
  if (/diorama|rack diorama|paper diorama|garage/i.test(t) || cols.includes('dioramas')) return 'dioramas';
  if (cols.includes('wheels') || /^WS Scale|wheel|tires|retorims|turbominiscale|muscle car 23|carlomo|rims/i.test(t)) return 'wheels';
  return 'exterior';
}
const STYLE = [
  ['offroad', /off ?road|method|fuel|4x4|beadlock|mud|baja|trd pro|black rhino|kmc/i],
  ['muscle', /muscle car|cragar|torq|american racing|centerline|weld|darko|falcon|crager|5 ?star classic/i],
  ['classic', /steel|banded|speedline|fuchs|longchamp|campagnolo|watanabe|minilite|ssr mk|hayashi|star shark|mesh|cosmis|old ?school|classic|ronal|bbs rs|bbs e50|gotti|eagle/i],
  ['euro', /porsche|manthey|alpina|amg|bmw|oz |o\.z|hre|vossen|rotiform|aerodisc|bbs|monoblock|mercedes|audi|gt3|vw |ferrari|lamborghini|mclaren|bentley/i],
  ['jdm', /te37|ce28|rays|volk|work|ssr|weds|advan|enkei|rs ?watanabe|yokohama|gram|57|rpf|nismo|mugen|spoon|regamaster|meister|emotion|lmgt|lm gt|gt ?c|zr10|vr|g025|xxr|aimgain|kranze|leon|tws|lxz|seeker|sixx|six|thrust|yabaking/i],
];
const styleOf = t => (STYLE.find(([, r]) => r.test(t)) || ['jdm'])[0];
const cleanTitle = (t, brand) => t
  .replace(/^HPZ Wheels Anodize Model\s*/i, 'Anodize ')
  .replace(/^HPZ Wheels Model\s*/i, '')
  .replace(/^HPZ Wheels\s*/i, '')
  .replace(/^HPZ\s*-\s*/i, '')
  .replace(/^JV Wheels model\s*/i, '').replace(/^JV Wheels\s*-?\s*/i, '').replace(/^JV Accessories\s*/i, '')
  .replace(/^Sakura\s*-\s*Custom wheel 64 scale model\s*/i, '').replace(/^Sakura( Model)?\s*-\s*/i, '')
  .replace(/^Octopus\s*-\s*/i, '').replace(/^Parvus Models\s*(1:64\s*)?/i, '')
  .replace(/^Rebel tires by Arise\s*/i, '').replace(/^Rebel (Accessories by Arise\s*)?/i, '')
  .replace(/^Turbominiscale Model\s*/i, '').replace(/^Premium Alloy Wheels Carlomo\s*/i, 'Carlomo ')
  .replace(/^Muscle Car 23\s*-\s*/i, '').replace(/^WS Scale\s*-\s*/i, '')
  .replace(/^Decal set Hotwheels\s*/i, '').replace(/^Decal set\s*/i, '')
  .replace(/^Add on Body kit for /i, '').replace(/\s+/g, ' ').trim();

const newest = Math.max(...all.map(p => +new Date(p.created_at)));
const out = all.map(p => {
  const cols = colOf[p.id] || [];
  const t = p.title.trim();
  const brand = brandOf(t, cols), cat = catOf(t, cols);
  const body = txt(p.body_html);
  const dm = body.match(/(\d+(?:[.,]\d+)?)\s*(?:-\s*\d+(?:[.,]\d+)?\s*)?mm/i);
  let dia = dm ? parseFloat(dm[1].replace(',', '.')) : null;
  if (dia && (dia < 7 || dia > 14)) dia = null;
  if (!dia && cat === 'wheels') dia = /muscle car 23/i.test(t) ? 12 : /carlomo/i.test(t) ? 9.5 : 10;
  let casting = (t.match(/(?:Hot ?wheels|Matchbox|Mini ?GT|Tomica|Inno64)\s+(.+?)(?:\s*\(|$)/i) || [])[0] || null;
  if (casting) casting = casting.replace(/^hot ?wheels/i, 'Hot Wheels').replace(/\s*\(.*$/, '').trim();
  const opt = p.options[0] ? p.options[0].name : 'Title';
  const variants = p.variants.map(v => ({
    id: v.id, n: v.title === 'Default Title' ? null : v.title, p: +v.price,
    c: v.compare_at_price && +v.compare_at_price > +v.price ? +v.compare_at_price : null,
    a: v.available, i: v.featured_image ? p.images.findIndex(x => x.id === v.featured_image.id) : -1,
  }));
  const price = Math.min(...variants.map(v => v.p));
  const v0 = variants.find(v => v.p === price);
  const days = (newest - new Date(p.created_at)) / 864e5;
  const spec = {};
  if (dia) spec.dia = dia;
  if (/bearing/i.test(t + body)) spec.bearing = 1;
  if (/aluminium|aluminum|alloy|cnc/i.test(body)) spec.metal = 1;
  if (/resin/i.test(body)) spec.resin = 1;
  if (/rubber/i.test(body)) spec.rubber = 1;
  if (/long axle|jdm/i.test(body)) spec.axle = 'long';
  if (/disc ?brake/i.test(body)) spec.disc = 1;
  if (/3d print/i.test(body)) spec.print = 1;
  if (/precoat/i.test(body)) spec.precoat = 1;
  if (/white toner/i.test(t + body)) spec.toner = 1;
  return {
    id: p.id, h: p.handle, t: cleanTitle(t, brand), full: t, b: brand, k: cat,
    s: cat === 'wheels' ? styleOf(t) : null, o: opt === 'Title' ? null : opt,
    p: price, c: v0.c, v: variants, img: p.images.slice(0, 6).map(x => img(x.src)),
    ar: p.images[0] ? +(p.images[0].height / p.images[0].width).toFixed(2) : 1,
    sp: spec, cast: casting, d: Math.round(days), a: variants.some(v => v.a), g: p.variants[0].grams || 20,
    body: body.slice(0, 900), tags: p.tags,
  };
}).filter(p => p.img.length);
fs.writeFileSync(path.join(__dirname, '../assets/js/catalog.js'),
  '/* GENERATED by tools/build-catalog.cjs from the live Shopify export — do not edit */\nwindow.HPZ_CATALOG=' + JSON.stringify(out) + ';\n');
const cnt = (k) => out.reduce((m, p) => (m[p[k]] = (m[p[k]] || 0) + 1, m), {});
console.log(out.length, cnt('k'), cnt('b'), cnt('s'));
console.log(out.filter(p => p.cast).slice(0, 8).map(p => p.cast));
console.log(out.filter(p => p.k === 'exterior').slice(0, 30).map(p => p.full));
