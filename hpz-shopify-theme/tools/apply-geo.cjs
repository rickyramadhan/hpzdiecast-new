// One-off: wire the IP rule into settings, layout, locale build and theme.js.
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const rd = f => fs.readFileSync(root + '/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(root + '/' + f, s);

const s = JSON.parse(rd('config/settings_schema.json'));
if (!s.find(g => g.name === 'Region (IP rule)')) {
  s.push({ name: 'Region (IP rule)', settings: [
    { type: 'header', content: 'Language and currency by visitor IP' },
    { type: 'checkbox', id: 'geo_enforce', label: 'Enforce IP rule', default: true,
      info: 'Indonesia IP: Bahasa Indonesia and IDR. Any other country: English and USD. Turn off only for testing.' }
  ] });
  wr('config/settings_schema.json', JSON.stringify(s, null, 2) + '\n');
}

let t = rd('layout/theme.liquid');
if (!t.includes("render 'geo-guard'")) t = t.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  {% render \'geo-guard\' %}');
if (!t.includes('geo-form')) {
  const form = [
    "{%- form 'localization', id: 'geo-form', hidden: 'hidden' -%}",
    '      <input type="hidden" name="country_code" value="{{ localization.country.iso_code }}">',
    '      <input type="hidden" name="language_code" value="{{ localization.language.iso_code }}">',
    '      <input type="hidden" name="return_to" value="{{ request.path }}">',
    '    {%- endform -%}',
    '    <div class="geo" id="geo" hidden></div>'
  ].join('\n');
  t = t.replace('<div class="geo" id="geo" hidden></div>', () => form);
}
wr('layout/theme.liquid', t);

let b = rd('tools/build-locales.cjs');
b = b.split('{ en: {}, id: {}, ja: {} }').join('{ en: {}, id: {} }')
  .split("['en', 'id', 'ja']").join("['en', 'id']")
  .split('out.id = fill(out.en, out.id); out.ja = fill(out.en, out.ja);').join('out.id = fill(out.en, out.id);')
  .split('en.default.json, id.json, ja.json').join('en.default.json, id.json')
  .split('\n').filter(l => !l.includes("locales/ja.json")).join('\n');
wr('tools/build-locales.cjs', b);

let j = rd('assets/theme.js');
j = j.split("var t = function (en, id, ja) { return (lang === 'id' && id) ? id : (lang === 'ja' && ja) ? ja : en; };")
  .join("var t = function (en, id) { return (lang === 'id' && id) ? id : en; };");
wr('assets/theme.js', j);
console.log('applied');
