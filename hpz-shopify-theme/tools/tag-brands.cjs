// Adds a "brand-<collection handle>" tag to every product of each brand collection, so /collections/<category>/brand-<handle> lists
// one brand inside one category. Membership comes from .qa/collections-export.json (made by tools/copy-collections.cjs export).
//   node tools/tag-brands.cjs <store.myshopify.com> [onlyBrandHandle]      (store must be authorised with write_products)
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const store = process.argv[2], only = process.argv[3];
if (!store) { console.error('usage: node tools/tag-brands.cjs <store> [brand-handle]'); process.exit(1); }
const QA = path.resolve(__dirname, '../../.qa');
const BRANDS = ['hpz-wheels', 'jv-custom', 'muscle-car-23', 'sakura-model', 'turbo-miniscale', 'parvus-models', 'octopus', 'rebel-tires', 'carlomo-alloy-wheels', 'bmj-diecast-custom'];

function gql(query, variables, mutate) {
  const q = path.join(QA, '_tq.graphql'), v = path.join(QA, '_tv.json'), o = path.join(QA, '_to.json');
  fs.writeFileSync(q, query); fs.writeFileSync(v, JSON.stringify(variables || {}));
  try { fs.unlinkSync(o); } catch (e) {}
  const args = ['store', 'execute', '-s', store, '--query-file', q, '--variable-file', v, '--json', '--output-file', o].concat(mutate ? ['--allow-mutations'] : []);
  const r = spawnSync('shopify', args, { shell: true, encoding: 'utf8', env: Object.assign({}, process.env, { MSYS_NO_PATHCONV: '1' }) });
  if (!fs.existsSync(o)) throw new Error('no output: ' + (r.stdout || '').slice(-300) + (r.stderr || '').slice(-300));
  const j = JSON.parse(fs.readFileSync(o, 'utf8'));
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 400));
  return j.data || j;
}

const exp = JSON.parse(fs.readFileSync(path.join(QA, 'collections-export.json'), 'utf8'));
const members = {}; exp.forEach(c => { members[c.handle] = c.handles; });
const ids = {};
let after = null;
for (;;) {
  const d = gql('query($after:String){products(first:250,after:$after){pageInfo{hasNextPage endCursor}nodes{id handle tags}}}', { after });
  d.products.nodes.forEach(p => { ids[p.handle] = p; });
  if (!d.products.pageInfo.hasNextPage) break;
  after = d.products.pageInfo.endCursor;
}
console.log('products on', store + ':', Object.keys(ids).length);
let total = 0, skipped = 0, missing = 0;
for (const b of BRANDS) {
  if (only && b !== only) continue;
  const tag = 'brand-' + b;
  const todo = (members[b] || []).map(h => ids[h]).filter(Boolean);
  missing += (members[b] || []).length - todo.length;
  const need = todo.filter(p => !(p.tags || []).includes(tag));
  skipped += todo.length - need.length;
  for (let i = 0; i < need.length; i += 20) {
    const chunk = need.slice(i, i + 20);
    const doc = 'mutation {' + chunk.map((p, k) => `a${k}: tagsAdd(id: "${p.id}", tags: ["${tag}"]) { userErrors { message } }`).join(' ') + '}';
    const r = gql(doc, {}, true);
    const errs = Object.values(r).flatMap(x => x.userErrors || []);
    if (errs.length) console.log('  errors:', JSON.stringify(errs).slice(0, 200));
    total += chunk.length;
  }
  console.log(tag.padEnd(30), 'tagged', need.length, '(already had it:', todo.length - need.length + ')');
}
console.log('done: tagged', total, '| already tagged', skipped, '| handles not found on this store', missing);
