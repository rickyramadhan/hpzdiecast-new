// One-off: country picker + shipping estimate in the product delivery box, setting for the Storefront token,
// spacing for the dynamic checkout (PayPal) button.
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const rd = f => fs.readFileSync(root + '/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(root + '/' + f, s);

// 1. settings
const s = JSON.parse(rd('config/settings_schema.json'));
const g = s.find(x => x.name === 'Commerce');
if (!g.settings.find(x => x.id === 'storefront_token')) {
  g.settings.push(
    { type: 'header', content: 'Shipping estimate on product pages' },
    { type: 'text', id: 'storefront_token', label: 'Storefront API access token', info: 'Public Storefront token (not the Admin token). Create it in Settings > Apps and sales channels > Develop apps (scopes: unauthenticated_write_checkouts, unauthenticated_read_checkouts). Empty = shipping cost shown as "Calculated at checkout".' }
  );
  wr('config/settings_schema.json', JSON.stringify(s, null, 2) + '\n');
}

// 2. delivery snippet
let d = rd('snippets/product-delivery.liquid');
if (!d.includes('data-dlv-country')) {
  d = d.replace('<div class="dlv" data-dlv>', () => '<div class="dlv" data-dlv{% if settings.storefront_token != blank %} data-token="{{ settings.storefront_token | strip | escape }}" data-variant="{{ product.selected_or_first_available_variant.id }}"{% endif %}>');
  const oldBtn = /<span>\{\{ 'hpz\.product\.delivery_to' \| t \}\} <button type="button" class="link" data-open="market">[\s\S]*?<\/button><\/span>/;
  if (!oldBtn.test(d)) throw new Error('delivery button not found');
  const neu = [
    "<span class=\"dlv-to\">{{ 'hpz.product.delivery_to' | t }}",
    "      {%- if localization.available_countries.size > 1 -%}",
    "        <select class=\"dlv-sel\" data-dlv-country aria-label=\"{{ 'hpz.product.delivery_to' | t }}\">",
    "          {%- for c in localization.available_countries -%}",
    "            <option value=\"{{ c.iso_code }}\"{% if c.iso_code == localization.country.iso_code %} selected{% endif %}>{{ c.name | escape }}</option>",
    "          {%- endfor -%}",
    "        </select>",
    "      {%- else -%}",
    "        <b>{% render 'flag', code: localization.country.iso_code %} {{ localization.country.name | escape }}</b>",
    "      {%- endif -%}",
    "    </span>"
  ].join('\n');
  d = d.replace(oldBtn, () => neu);
  const oldCost = `<li><span class="dlv-n">{{ 'hpz.product.ship_cost' | t }}</span><span class="mono dlv-d">{{ 'hpz.product.ship_at_checkout' | t }}</span><span class="mono dlv-p"></span></li>`;
  if (!d.includes(oldCost)) throw new Error('cost row not found');
  d = d.replace(oldCost, () => `<li class="dlv-cost"><span class="dlv-n">{{ 'hpz.product.ship_cost' | t }}</span><span class="dlv-opts" data-dlv-cost>{{ 'hpz.product.ship_at_checkout' | t }}</span></li>`);
  d = d.trimEnd() + "\n{%- if settings.storefront_token != blank -%}\n  <script src=\"{{ 'delivery-estimate.js' | asset_url }}\" defer></script>\n{%- endif -%}\n";
  wr('snippets/product-delivery.liquid', d);
}

// 3. CSS
let c = rd('assets/p-product.css');
if (!c.includes('.dlv-sel')) {
  c += `
/* delivery country picker + shipping estimate */
.dlv-to { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dlv-sel { font: inherit; font-weight: 600; padding: 4px 28px 4px 8px; border: 1px solid var(--line); border-radius: var(--r1); background: var(--paper) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23111' stroke-width='1.6'/%3E%3C/svg%3E") no-repeat right 9px center / 10px; appearance: none; cursor: pointer; max-width: 100%; }
.dlv-sel:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.dlv .dlv-cost { grid-template-columns: auto 1fr; }
.dlv-opts { display: grid; gap: 4px; justify-items: end; font-size: 12px; }
.dlv-opt { display: flex; gap: 14px; justify-content: space-between; min-width: 180px; }
.dlv-opt b { font-weight: 600; }

/* dynamic checkout (PayPal etc.) sits under the add-to-cart row with room around it */
.bb-row { margin-bottom: 12px; }
.shopify-payment-button { margin-top: 12px; --shopify-accelerated-checkout-button-block-size: 52px; --shopify-accelerated-checkout-button-border-radius: var(--r2, 8px); --shopify-accelerated-checkout-button-inline-size: 100%; }
.shopify-payment-button__button { min-height: 52px; border-radius: var(--r2, 8px); }
.shopify-payment-button__more-options { margin: 12px auto 4px; display: block; font-size: 13px; }
.shopify-payment-button + .dlv, form + .dlv, .bb + .dlv { margin-top: 16px; }
`;
  wr('assets/p-product.css', c);
}
console.log('delivery wired');
