// One-off: render the SEO snippet from the layout (replacing the old title/description/canonical/hreflang block and the language
// hreflang loop, which pointed every language at the home page) and add the SEO theme settings.
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const rd = f => fs.readFileSync(root + '/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(root + '/' + f, s);

let t = rd('layout/theme.liquid');
if (!t.includes("render 'seo-head'")) {
  const a = t.indexOf('  <title>');
  const b = t.indexOf('  <link rel="icon"');
  if (a < 0 || b < a) throw new Error('title..icon block not found');
  t = t.slice(0, a) + "  {% render 'seo-head' %}\n" + t.slice(b);
  const loop = /  \{%- for lang in localization\.available_languages -%\}\s*<link rel="alternate" hreflang="\{\{ lang\.iso_code \}\}"[^\n]*\n\s*\{%- endfor -%\}\n/;
  if (!loop.test(t)) throw new Error('language hreflang loop not found');
  t = t.replace(loop, '');
  wr('layout/theme.liquid', t);
}

const s = JSON.parse(rd('config/settings_schema.json'));
if (!s.find(g => g.name === 'SEO')) {
  s.push({ name: 'SEO', settings: [
    { type: 'header', content: 'Search engines and social sharing' },
    { type: 'text', id: 'seo_brand', label: 'Brand name in titles', default: 'HPZ Diecast', info: 'Added to page titles: "Product name | Brand".' },
    { type: 'text', id: 'seo_home_title', label: 'Home page title', default: 'HPZ Diecast | Custom Wheels, Decals & Resin Kits for 1:64', info: 'Keep it under 60 characters. Shown as the blue link in Google.' },
    { type: 'textarea', id: 'seo_home_description', label: 'Home page description', default: 'Custom wheels, waterslide decals, resin body kits and engines for 1:64 diecast. Handmade in Jakarta, shipped worldwide with tracking.', info: 'Keep it between 120 and 155 characters. Shown under the title in Google.' },
    { type: 'image_picker', id: 'seo_social_image', label: 'Share image (home page)', info: '1200 x 630 px works best. Used when the home page is shared on WhatsApp, Facebook, X and in Google.' },
    { type: 'text', id: 'seo_opening_hours', label: 'Opening hours (schema format)', default: 'Mo-Sa 09:00-17:00', info: 'Format Mo-Sa 09:00-17:00. Goes into the structured data Google reads.' }
  ] });
  wr('config/settings_schema.json', JSON.stringify(s, null, 2) + '\n');
}

// values for the international store live in the repo settings; the Indonesia store gets its own through tools/store-overrides.json
const d = JSON.parse(rd('config/settings_data.json'));
Object.assign(d.current, {
  seo_brand: 'HPZ Diecast',
  seo_home_title: 'HPZ Diecast | Custom Wheels, Decals & Resin Kits for 1:64',
  seo_home_description: 'Custom wheels, waterslide decals, resin body kits and engines for 1:64 diecast. Handmade in Jakarta, shipped worldwide with tracking.',
  seo_opening_hours: 'Mo-Sa 09:00-17:00'
});
wr('config/settings_data.json', JSON.stringify(d, null, 2) + '\n');
console.log('seo wired');
