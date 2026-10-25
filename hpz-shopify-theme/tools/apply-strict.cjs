// One-off: strict Indonesia store + international store switcher rules + bypass setting.
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const rd = f => fs.readFileSync(root + '/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(root + '/' + f, s);

// setting: staff bypass key
const s = JSON.parse(rd('config/settings_schema.json'));
const g = s.find(x => x.name === 'Stores (Indonesia / International)');
if (!g.settings.find(x => x.id === 'geo_bypass_key')) {
  g.settings.push({ type: 'text', id: 'geo_bypass_key', label: 'Indonesia store staff bypass key',
    info: 'Indonesia store only. Staff outside Indonesia can open the store once per tab with ?hpz_bypass=<this key>. Use a random string and keep it private. Empty = no bypass.' });
  wr('config/settings_schema.json', JSON.stringify(s, null, 2) + '\n');
}

// store-switch: on the international store only Indonesian visitors get a switcher; everyone else sees a fixed "EN · USD"
let sw = rd('snippets/store-switch.liquid');
if (!sw.includes('is-static" aria-current="true">{% render \'flag\', code: \'US\' %}')) {
  const oldElse = /\{%- else -%\}\s*<button class="mkt-btn \{\{ cls \}\}" data-open="market"[\s\S]*?<\/button>\s*\{%- endif -%\}/;
  if (!oldElse.test(sw)) throw new Error('else branch not found');
  sw = sw.replace(oldElse, () => [
    "{%- elsif localization.country.iso_code == 'ID' -%}",
    "  <button class=\"mkt-btn {{ cls }}\" data-open=\"market\" aria-label=\"{{ 'hpz.region.title' | t }}\">",
    "    {% render 'flag', code: 'US' %}",
    "    <span>EN · USD</span>",
    "    {%- if chevron -%}{% render 'icon', name: 'down' %}{%- endif -%}",
    "  </button>",
    "{%- else -%}",
    "  <span class=\"mkt-btn {{ cls }} is-static\" aria-current=\"true\">{% render 'flag', code: 'US' %}<span>EN · USD</span></span>",
    "{%- endif -%}"
  ].join('\n'));
  wr('snippets/store-switch.liquid', sw);
}

// region modal on the international store: Indonesia option only for Indonesian visitors
let mf = rd('snippets/market-form.liquid');
if (!mf.includes("mf_role == 'indonesia' or localization.country.iso_code == 'ID'")) {
  mf = mf.replace("{%- if mf_id_url != blank -%}", () => "{%- if mf_id_url != blank and mf_role == 'indonesia' or mf_id_url != blank and localization.country.iso_code == 'ID' -%}");
  wr('snippets/market-form.liquid', mf);
}
console.log('strict rules wired');
