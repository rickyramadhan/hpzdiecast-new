// One-off: render the Indonesia suggestion pop-up from the layout.
const fs = require('fs');
const f = require('path').resolve(__dirname, '../layout/theme.liquid');
let t = fs.readFileSync(f, 'utf8');
if (!t.includes("render 'id-suggest'")) {
  const a = '<div id="toasts" aria-live="polite"></div>';
  if (!t.includes(a)) throw new Error('toasts anchor missing');
  t = t.replace(a, () => a + "\n    {% render 'id-suggest' %}");
  fs.writeFileSync(f, t);
}
console.log('popup wired');
