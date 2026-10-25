// One-off: replace the three region buttons with the store-switch snippet and add its CSS.
const fs = require('fs');
const root = require('path').resolve(__dirname, '..');
const rd = f => fs.readFileSync(root + '/' + f, 'utf8');
const wr = (f, s) => fs.writeFileSync(root + '/' + f, s);
const must = (s, needle, label) => { if (!s.includes(needle)) throw new Error('anchor missing: ' + label); };

let h = rd('sections/header.liquid');
const hOld = /<button class="mkt-btn" data-open="market" aria-label="Change region and language">[\s\S]*?<\/button>/;
if (!hOld.test(h)) throw new Error('header button not found');
h = h.replace(hOld, () => "{% render 'store-switch', chevron: true %}");
wr('sections/header.liquid', h);

let f = rd('sections/footer.liquid');
const fOld = /<button class="mkt-btn on-dark" data-open="market">[\s\S]*?<\/button>/;
if (!fOld.test(f)) throw new Error('footer button not found');
f = f.replace(fOld, () => "{% render 'store-switch', cls: 'on-dark' %}");
wr('sections/footer.liquid', f);

let t = rd('layout/theme.liquid');
const tOld = /<button class="mkt-btn is-block" data-open="market">[\s\S]*?<\/button>/;
if (!tOld.test(t)) throw new Error('drawer button not found');
t = t.replace(tOld, () => "{% render 'store-switch', cls: 'is-block' %}");
wr('layout/theme.liquid', t);

let c = rd('assets/components.css');
if (!c.includes('.ss {')) {
  c += "\n/* store switch (Indonesia store): fixed state + link to the international store */\n.ss { display: inline-flex; gap: 6px; align-items: center; }\n.mkt-btn.is-static { cursor: default; opacity: .75; }\n.mkt-btn.is-block ~ .mkt-btn, .ss .is-block { width: auto; }\n";
  wr('assets/components.css', c);
}
console.log('switch wired');
