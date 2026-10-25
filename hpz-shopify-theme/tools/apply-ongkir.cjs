// One-off: wire the courier estimate into the cart, layout, settings and ignore list.
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const rd = f => fs.readFileSync(root + '/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(root + '/' + f, s);

let m = rd('sections/main-cart.liquid');
const a = "<p class=\"xs muted\">{{ 'hpz.cart.shipping_note' | t }}</p>";
if (!m.includes('shipping-calc')) m = m.split(a).join(a + "\n                {% render 'shipping-calc' %}");
wr('sections/main-cart.liquid', m);

let t = rd('layout/theme.liquid');
const c = "<script src=\"{{ 'cart.js' | asset_url }}\" defer></script>";
if (!t.includes('shipping-calc.js')) t = t.split(c).join(c + "\n  <script src=\"{{ 'shipping-calc.js' | asset_url }}\" defer></script>");
wr('layout/theme.liquid', t);

const s = JSON.parse(rd('config/settings_schema.json'));
if (!s.find(g => g.name === 'Shipping estimate (Indonesia)')) {
  s.push({ name: 'Shipping estimate (Indonesia)', settings: [
    { type: 'header', content: 'Courier rate estimate in the cart' },
    { type: 'url', id: 'ongkir_api_url', label: 'Ongkir Worker URL', info: 'Address of the deployed Cloudflare Worker (see docs/ONGKIR-SETUP.md). Leave empty to hide the estimate.' },
    { type: 'text', id: 'ongkir_couriers', label: 'Couriers', default: 'jne:sicepat:jnt:anteraja', info: 'Colon separated codes, for example jne:sicepat:jnt:anteraja:pos:tiki' },
    { type: 'number', id: 'ongkir_pack_grams', label: 'Packaging weight (grams)', default: 50, info: 'Added to the product weight before asking the courier.' }
  ] });
  wr('config/settings_schema.json', JSON.stringify(s, null, 2) + '\n');
}
const i = rd('.shopifyignore');
if (!i.includes('worker/*')) wr('.shopifyignore', i.replace(/\s*$/, '\n') + 'worker/*\n');
console.log('ongkir wired');
