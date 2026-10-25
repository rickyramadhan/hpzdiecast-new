// Copies manual collections (title, description, image, product membership in order) between two stores
// with `shopify store execute` (user-authorised Admin API, no tokens in files).
//   node tools/copy-collections.cjs export <source.myshopify.com>        -> .qa/collections-export.json  (read_products)
//   node tools/copy-collections.cjs import <target.myshopify.com>        creates what is missing on the target (write_products)
// Products are matched by handle, so import the product CSV into the target first. Existing collections (same handle) are left alone.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const QA = path.resolve(__dirname, '../../.qa');
const OUT = path.join(QA, 'collections-export.json');

function gql(store, query, variables, mutate) {
  const q = path.join(QA, '_q.graphql'), v = path.join(QA, '_v.json'), o = path.join(QA, '_o.json');
  fs.writeFileSync(q, query); fs.writeFileSync(v, JSON.stringify(variables || {}));
  try { fs.unlinkSync(o); } catch (e) {}
  const args = ['store', 'execute', '-s', store, '--query-file', q, '--variable-file', v, '--json', '--output-file', o].concat(mutate ? ['--allow-mutations'] : []);
  const r = spawnSync('shopify', args, { shell: true, encoding: 'utf8', env: Object.assign({}, process.env, { MSYS_NO_PATHCONV: '1' }) });
  if (!fs.existsSync(o)) throw new Error('no output: ' + (r.stdout || '').slice(-400) + (r.stderr || '').slice(-400));
  const j = JSON.parse(fs.readFileSync(o, 'utf8'));
  const d = j.data || j;
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 500));
  return d;
}

function exportAll(store) {
  const list = [];
  let after = null;
  for (;;) {
    const d = gql(store, `query($after:String){collections(first:100,after:$after){pageInfo{hasNextPage endCursor}nodes{id handle title descriptionHtml sortOrder image{url altText} ruleSet{appliedDisjunctively}}}}`, { after });
    list.push(...d.collections.nodes);
    if (!d.collections.pageInfo.hasNextPage) break;
    after = d.collections.pageInfo.endCursor;
  }
  for (const c of list) {
    c.handles = [];
    let a = null;
    for (;;) {
      const d = gql(store, `query($id:ID!,$after:String){collection(id:$id){products(first:250,after:$after){pageInfo{hasNextPage endCursor}nodes{handle}}}}`, { id: c.id, after: a });
      const p = d.collection.products;
      c.handles.push(...p.nodes.map(n => n.handle));
      if (!p.pageInfo.hasNextPage) break;
      a = p.pageInfo.endCursor;
    }
    console.log(c.handle, c.ruleSet ? 'SMART' : 'manual', c.handles.length);
  }
  fs.writeFileSync(OUT, JSON.stringify(list, null, 2));
  console.log('exported', list.length, 'collections ->', OUT);
}

function importAll(store) {
  const list = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  const ids = {};
  let after = null;
  for (;;) {
    const d = gql(store, `query($after:String){products(first:250,after:$after){pageInfo{hasNextPage endCursor}nodes{id handle}}}`, { after });
    d.products.nodes.forEach(p => { ids[p.handle] = p.id; });
    if (!d.products.pageInfo.hasNextPage) break;
    after = d.products.pageInfo.endCursor;
  }
  console.log('target products', Object.keys(ids).length);
  const have = new Set();
  after = null;
  for (;;) {
    const d = gql(store, `query($after:String){collections(first:100,after:$after){pageInfo{hasNextPage endCursor}nodes{handle}}}`, { after });
    d.collections.nodes.forEach(c => have.add(c.handle));
    if (!d.collections.pageInfo.hasNextPage) break;
    after = d.collections.pageInfo.endCursor;
  }
  let made = 0, skipped = 0, missing = 0;
  for (const c of list) {
    if (c.ruleSet) { console.log('SKIP smart collection (needs rules):', c.handle); skipped++; continue; }
    if (have.has(c.handle)) { console.log('exists:', c.handle); skipped++; continue; }
    const input = { title: c.title, handle: c.handle, descriptionHtml: c.descriptionHtml || '', sortOrder: c.sortOrder };
    if (c.image && c.image.url) input.image = { src: c.image.url, altText: c.image.altText || '' };
    const r = gql(store, `mutation($input:CollectionInput!){collectionCreate(input:$input){collection{id handle}userErrors{field message}}}`, { input }, true);
    const res = r.collectionCreate;
    if (res.userErrors.length) { console.log('ERROR create', c.handle, JSON.stringify(res.userErrors)); continue; }
    const pids = c.handles.map(h => ids[h]).filter(Boolean);
    missing += c.handles.length - pids.length;
    for (let i = 0; i < pids.length; i += 200) {
      const a = gql(store, `mutation($id:ID!,$p:[ID!]!){collectionAddProducts(id:$id,productIds:$p){userErrors{message}}}`, { id: res.collection.id, p: pids.slice(i, i + 200) }, true);
      if (a.collectionAddProducts.userErrors.length) console.log('ERROR add', c.handle, JSON.stringify(a.collectionAddProducts.userErrors));
    }
    made++;
    console.log('created', c.handle, pids.length + '/' + c.handles.length);
  }
  console.log(`done: created ${made}, skipped ${skipped}, product handles not found on target ${missing}`);
}

function publishAll(store) {
  const pubs = gql(store, 'query{publications(first:20){nodes{id name}}}').publications.nodes;
  const online = pubs.find(p => /online store/i.test(p.name));
  if (!online) throw new Error('no Online Store publication: ' + JSON.stringify(pubs));
  const list = JSON.parse(fs.readFileSync(OUT, 'utf8')).map(c => c.handle);
  let after = null, n = 0;
  for (;;) {
    const d = gql(store, 'query($after:String){collections(first:100,after:$after){pageInfo{hasNextPage endCursor}nodes{id handle}}}', { after });
    for (const c of d.collections.nodes) {
      if (!list.includes(c.handle)) continue;
      const r = gql(store, 'mutation($id:ID!,$in:[PublicationInput!]!){publishablePublish(id:$id,input:$in){userErrors{message}}}', { id: c.id, in: [{ publicationId: online.id }] }, true);
      const e = r.publishablePublish.userErrors;
      console.log(e.length ? 'ERROR ' + c.handle + ' ' + JSON.stringify(e) : 'published ' + c.handle); n++;
    }
    if (!d.collections.pageInfo.hasNextPage) break;
    after = d.collections.pageInfo.endCursor;
  }
  console.log('processed', n, 'collections on', online.name);
}

const [mode, store] = process.argv.slice(2);
if (mode === 'export' && store) exportAll(store);
else if (mode === 'import' && store) importAll(store);
else if (mode === 'publish' && store) publishAll(store);
else { console.error('usage: node tools/copy-collections.cjs export|import <store.myshopify.com>'); process.exit(1); }
