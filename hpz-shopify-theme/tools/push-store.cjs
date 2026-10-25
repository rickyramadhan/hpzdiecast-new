// Pushes the theme to one of the two live stores with that store's own settings applied, then restores config/settings_data.json.
//   node tools/push-store.cjs <global|indonesia|both> [file ...]        (no files = the whole theme)
// Per-store values come from tools/store-overrides.json; the Indonesia staff bypass key is read from ../.qa/bypass-key.txt.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const SD = path.join(root, 'config/settings_data.json');
const STORES = {
  global: { store: '1ep9mi-cm.myshopify.com', theme: '188945072218' },
  indonesia: { store: 'my0ywb-0x.myshopify.com', theme: '189342253308' }
};
const [which, ...files] = process.argv.slice(2);
if (!['global', 'indonesia', 'both'].includes(which)) { console.error('usage: node tools/push-store.cjs <global|indonesia|both> [file ...]'); process.exit(1); }
const overrides = JSON.parse(fs.readFileSync(path.join(__dirname, 'store-overrides.json'), 'utf8'));
let bypass = '';
try { bypass = fs.readFileSync(path.resolve(root, '../.qa/bypass-key.txt'), 'utf8').trim(); } catch (e) {}

function push(role) {
  const { store, theme } = STORES[role];
  const original = fs.readFileSync(SD, 'utf8');
  try {
    const j = JSON.parse(original);
    Object.assign(j.current, overrides[role] || {});
    if (role === 'indonesia' && bypass) j.current.geo_bypass_key = bypass;
    fs.writeFileSync(SD, JSON.stringify(j, null, 2) + '\n');
    const args = ['theme', 'push', '--theme', theme, '--store', store, '--allow-live', '--nodelete', '--path', root].concat(...files.map(f => ['--only', f]));
    const r = spawnSync('shopify', args, { shell: true, encoding: 'utf8', env: Object.assign({}, process.env, { MSYS_NO_PATHCONV: '1' }) });
    const out = (r.stdout || '') + (r.stderr || '');
    const clean = out.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
    console.log(role.padEnd(10), /successfully/.test(clean) && !/pushed with errors|syntax error|Liquid error/i.test(clean) ? 'OK' : 'PROBLEM:\n' + clean.replace(/\n\s*\n/g, '\n').slice(-900));
  } finally {
    fs.writeFileSync(SD, original);
  }
}
(which === 'both' ? ['global', 'indonesia'] : [which]).forEach(push);
