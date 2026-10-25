// Validates every JSON file in the theme (templates, config, locales, setup, _locales).
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.name === 'node_modules' ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
let bad = 0, n = 0;
for (const f of walk(ROOT)) {
  if (!f.endsWith('.json') || f.includes(path.sep + 'docs' + path.sep)) continue;
  n++;
  try { JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch (e) { bad++; console.log('INVALID', path.relative(ROOT, f), e.message); }
}
console.log(`json files: ${n}, invalid: ${bad}`);
process.exit(bad ? 1 : 0);
