// One-off: setting "hide_services_academy" removes the Services and Academy links (header nav + footer links) when on.
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const rd = f => fs.readFileSync(root + '/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(root + '/' + f, s);

const s = JSON.parse(rd('config/settings_schema.json'));
const g = s.find(x => x.name === 'Stores (Indonesia / International)');
if (!g.settings.find(x => x.id === 'hide_services_academy')) {
  g.settings.push({ type: 'checkbox', id: 'hide_services_academy', label: 'Hide Services and Academy links', default: false,
    info: 'Removes the Services and Academy items from the header menu and the footer (including links to /pages/services and /blogs/academy).' });
  wr('config/settings_schema.json', JSON.stringify(s, null, 2) + '\n');
}

let h = rd('sections/header.liquid');
const a1 = `<div class="nav-i"><a href="/pages/services">{{ 'hpz.nav.services' | t }}</a></div>`;
const a2 = `<div class="nav-i"><a href="/blogs/academy">{{ 'hpz.nav.academy' | t }}</a></div>`;
if (!h.includes(a1) || !h.includes(a2)) throw new Error('header anchors missing');
if (!h.includes('hide_services_academy')) {
  h = h.replace(a1, () => `{%- unless settings.hide_services_academy -%}${a1}{%- endunless -%}`);
  h = h.replace(a2, () => `{%- unless settings.hide_services_academy -%}${a2}{%- endunless -%}`);
  wr('sections/header.liquid', h);
}

let f = rd('sections/footer.liquid');
const old = '{%- if label != blank -%}\n                    <li><a href="{{ url | default: \'#\' }}">{{ label }}</a></li>';
if (!f.includes(old)) throw new Error('footer anchor missing');
if (!f.includes('hide_services_academy')) {
  const neu = "{%- assign skip_link = false -%}\n                  {%- if settings.hide_services_academy and url contains '/pages/services' or settings.hide_services_academy and url contains '/blogs/academy' -%}{%- assign skip_link = true -%}{%- endif -%}\n                  {%- if label != blank and skip_link == false -%}\n                    <li><a href=\"{{ url | default: '#' }}\">{{ label }}</a></li>";
  f = f.replace(old, () => neu);
  wr('sections/footer.liquid', f);
}
console.log('hide services/academy wired');
