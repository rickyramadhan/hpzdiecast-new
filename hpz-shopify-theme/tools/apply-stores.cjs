// One-off: two-store setup (role setting, hreflang, local-payment-note condition, stub localization.js).
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const rd = f => fs.readFileSync(root + '/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(root + '/' + f, s);

const s = JSON.parse(rd('config/settings_schema.json'));
if (!s.find(g => g.name === 'Stores (Indonesia / International)')) {
  s.push({ name: 'Stores (Indonesia / International)', settings: [
    { type: 'header', content: 'Two stores, one theme' },
    { type: 'select', id: 'store_role', label: 'This store is', default: 'global',
      options: [{ value: 'global', label: 'International (USD, English)' }, { value: 'indonesia', label: 'Indonesia (IDR, Bahasa Indonesia)' }],
      info: 'International sends Indonesian visitors to the Indonesia store. Indonesia sends foreign visitors to the International store.' },
    { type: 'text', id: 'global_store_url', label: 'International store URL', default: 'https://hpzdiecast.com', info: 'No trailing slash.' },
    { type: 'text', id: 'id_store_url', label: 'Indonesia store URL', info: 'Example https://id.hpzdiecast.com. Leave empty to turn the redirect off. No trailing slash.' }
  ] });
  wr('config/settings_schema.json', JSON.stringify(s, null, 2) + '\n');
}

let t = rd('layout/theme.liquid');
if (!t.includes('hpz-alt-store')) {
  const alt = [
    "{%- if settings.id_store_url != blank and settings.global_store_url != blank -%}",
    "    {%- assign alt_id = settings.id_store_url | strip -%}{%- assign alt_en = settings.global_store_url | strip -%}",
    "    <link rel=\"alternate\" hreflang=\"id-ID\" href=\"{{ alt_id }}{{ request.path }}\" data-hpz-alt-store>",
    "    <link rel=\"alternate\" hreflang=\"en\" href=\"{{ alt_en }}{{ request.path }}\">",
    "    <link rel=\"alternate\" hreflang=\"x-default\" href=\"{{ alt_en }}{{ request.path }}\">",
    "  {%- endif -%}"
  ].join('\n');
  t = t.replace('<link rel="canonical" href="{{ canonical_url }}">', m => m + '\n  ' + alt);
  t = t.split('hreflang="{{ lang.iso_code }}"').join('hreflang="{{ lang.iso_code }}"');
}
t = t.split('market: {{ localization.country.iso_code | json }},').join('market: {{ localization.country.iso_code | json }},\n      role: {{ settings.store_role | default: \'global\' | json }},');
wr('layout/theme.liquid', t);

let n = rd('snippets/local-payment-note.liquid');
n = n.split("{%- if settings.local_payment_enabled and localization.country.iso_code == 'ID' -%}")
  .join("{%- if settings.local_payment_enabled and settings.store_role == 'indonesia' -%}");
wr('snippets/local-payment-note.liquid', n);
console.log('stores wired');
