// One-off: theme settings for the floating WhatsApp widget, and render it from the layout.
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const rd = f => fs.readFileSync(root + '/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(root + '/' + f, s);

const sc = JSON.parse(rd('config/settings_schema.json'));
if (!sc.find(g => g.name === 'WhatsApp chat')) {
  sc.push({ name: 'WhatsApp chat', settings: [
    { type: 'header', content: 'Floating WhatsApp button (bottom left)' },
    { type: 'checkbox', id: 'wa_float_enabled', label: 'Show the floating WhatsApp button', default: true },
    { type: 'text', id: 'wa_admin1_name', label: 'Admin 1 name', default: 'Admin 1' },
    { type: 'text', id: 'wa_admin1_number', label: 'Admin 1 WhatsApp number', default: '6285187889668', info: 'Digits with country code, no plus or spaces. Leave empty to hide this admin.' },
    { type: 'text', id: 'wa_admin2_name', label: 'Admin 2 name', default: 'Admin 2' },
    { type: 'text', id: 'wa_admin2_number', label: 'Admin 2 WhatsApp number', default: '6281310167872', info: 'Digits with country code. Leave empty to hide this admin.' },
    { type: 'range', id: 'wa_float_delay', label: 'Seconds before the greeting pops up', min: 2, max: 20, step: 1, default: 6 }
  ] });
  wr('config/settings_schema.json', JSON.stringify(sc, null, 2) + '\n');
}
let t = rd('layout/theme.liquid');
if (!t.includes("render 'wa-float'")) {
  const a = "{% render 'id-suggest' %}";
  if (!t.includes(a)) throw new Error('id-suggest anchor missing');
  t = t.replace(a, () => a + "\n    {% render 'wa-float' %}");
  wr('layout/theme.liquid', t);
}
console.log('whatsapp widget wired');
