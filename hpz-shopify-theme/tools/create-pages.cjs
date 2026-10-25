// Creates the pages and the Academy blog the theme links to, with the right theme template, only if they do not exist yet.
//   node tools/create-pages.cjs <store.myshopify.com> <global|indonesia>        (store must be authorised with write_content)
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const [store, role] = process.argv.slice(2);
if (!store || !/^(global|indonesia)$/.test(role || '')) { console.error('usage: node tools/create-pages.cjs <store.myshopify.com> <global|indonesia>'); process.exit(1); }
const QA = path.resolve(__dirname, '../../.qa');

function gql(query, variables, mutate) {
  const q = path.join(QA, '_q.graphql'), v = path.join(QA, '_v.json'), o = path.join(QA, '_o.json');
  fs.writeFileSync(q, query); fs.writeFileSync(v, JSON.stringify(variables || {}));
  try { fs.unlinkSync(o); } catch (e) {}
  const args = ['store', 'execute', '-s', store, '--query-file', q, '--variable-file', v, '--json', '--output-file', o].concat(mutate ? ['--allow-mutations'] : []);
  const r = spawnSync('shopify', args, { shell: true, encoding: 'utf8', env: Object.assign({}, process.env, { MSYS_NO_PATHCONV: '1' }) });
  if (!fs.existsSync(o)) throw new Error('no output: ' + (r.stdout || '').slice(-300) + (r.stderr || '').slice(-300));
  const j = JSON.parse(fs.readFileSync(o, 'utf8'));
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 400));
  return j.data || j;
}

const id = role === 'indonesia';
const PAGES = [
  { handle: 'services', template: 'services', title: id ? 'Layanan' : 'Services' },
  { handle: 'builds', template: 'builds', title: id ? 'Karya Kalian' : 'Built by You' },
  { handle: 'planner', template: 'planner', title: 'Build Planner' },
  { handle: 'contact', template: 'contact', title: id ? 'Kontak' : 'Contact' }
];
if (id) PAGES.push({ handle: 'bayar', template: 'payment', title: 'Bayar' });

const have = {};
gql('query{pages(first:100){nodes{id handle templateSuffix isPublished}}}').pages.nodes.forEach(p => { have[p.handle] = p; });
for (const p of PAGES) {
  if (have[p.handle]) { console.log('exists   ', p.handle, '(template:', have[p.handle].templateSuffix || 'default', ', published:', have[p.handle].isPublished + ')'); continue; }
  const r = gql('mutation($page:PageCreateInput!){pageCreate(page:$page){page{id handle}userErrors{field message}}}', { page: { title: p.title, handle: p.handle, templateSuffix: p.template, isPublished: true, body: '' } }, true).pageCreate;
  console.log(r.userErrors.length ? 'ERROR    ' + p.handle + ' ' + JSON.stringify(r.userErrors) : 'created  ' + p.handle + ' (template ' + p.template + ')');
}
const blogs = gql('query{blogs(first:20){nodes{handle templateSuffix}}}').blogs.nodes;
if (blogs.find(b => b.handle === 'academy')) console.log('exists    blog academy');
else {
  const r = gql('mutation($blog:BlogCreateInput!){blogCreate(blog:$blog){blog{id handle}userErrors{field message}}}', { blog: { title: 'Academy', handle: 'academy', templateSuffix: 'academy', commentPolicy: 'MODERATED' } }, true).blogCreate;
  console.log(r.userErrors.length ? 'ERROR    blog academy ' + JSON.stringify(r.userErrors) : 'created  blog academy (template academy)');
}
