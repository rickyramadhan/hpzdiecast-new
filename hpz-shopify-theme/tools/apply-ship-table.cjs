// One-off: switch the product delivery box to the generated shipping table (no token).
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const rd = f => fs.readFileSync(root + '/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(root + '/' + f, s);

let d = rd('snippets/product-delivery.liquid');
d = d.replace(/<div class="dlv" data-dlv\{% if settings\.storefront_token[\s\S]*?%\}>/, () => '<div class="dlv" data-dlv>');
if (!d.includes('data-dlv-rates')) {
  const data = [
    '  <script type="application/json" data-dlv-rates>{% render \'shipping-rates-data\' %}</script>',
    '  <script type="application/json" data-dlv-weights>{ {%- for v in product.variants -%}"{{ v.id }}":{{ v.weight | default: 0 }}{% unless forloop.last %},{% endunless %}{%- endfor -%} }</script>',
    '</div>'
  ].join('\n');
  const i = d.lastIndexOf('</div>');
  d = d.slice(0, i) + data + d.slice(i + 6);
}
d = d.replace(/\{%- if settings\.storefront_token != blank -%\}\s*<script src="\{\{ 'delivery-estimate\.js' \| asset_url \}\}" defer><\/script>\s*\{%- endif -%\}/, () => '<script src="{{ \'delivery-estimate.js\' | asset_url }}" defer></script>');
wr('snippets/product-delivery.liquid', d);

const s = JSON.parse(rd('config/settings_schema.json'));
const g = s.find(x => x.name === 'Commerce');
g.settings = g.settings.filter(x => x.id !== 'storefront_token' && !(x.type === 'header' && x.content === 'Shipping estimate on product pages'));
wr('config/settings_schema.json', JSON.stringify(s, null, 2) + '\n');

let c = rd('assets/p-product.css');
if (!c.includes('.dlv-est')) { c += '.dlv-est { font-size: 11px; color: var(--mute); margin-top: 2px; }\n'; wr('assets/p-product.css', c); }
console.log('shipping table wired');
