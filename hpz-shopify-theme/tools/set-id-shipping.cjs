// Replaces the flat domestic rate of the Indonesia store with regional, weight-based rates (manual, estimates).
//   node tools/set-id-shipping.cjs <store.myshopify.com> [--dry]      (store must be authorised with read_shipping,write_shipping)
// The existing "Domestic" zone (all provinces, one flat rate) becomes the first regional zone, six more zones are created,
// and the old flat method is deleted. Rates are placeholders in the range of regular courier prices from Jakarta Selatan:
// edit the table below and re-run to change them (zones with the same names are updated, not duplicated).
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const store = process.argv[2], dry = process.argv.includes('--dry');
if (!store) { console.error('usage: node tools/set-id-shipping.cjs <store.myshopify.com> [--dry]'); process.exit(1); }
const QA = path.resolve(__dirname, '../../.qa');

// price per started kilogram (IDR) and delivery estimate in the method name
const ZONES = [
  { name: 'Jakarta',                         eta: '1-3 hari kerja',  perKg: 9000,  prov: ['JK'] },
  { name: 'Jawa Barat dan Banten',           eta: '1-3 hari kerja',  perKg: 11000, prov: ['JB', 'BT'] },
  { name: 'Jawa Tengah, Yogyakarta, Jawa Timur', eta: '2-4 hari kerja', perKg: 15000, prov: ['JT', 'YO', 'JI'] },
  { name: 'Sumatera',                        eta: '3-6 hari kerja',  perKg: 28000, prov: ['AC', 'SU', 'SB', 'RI', 'KR', 'JA', 'SS', 'BB', 'BE', 'LA'] },
  { name: 'Bali dan Nusa Tenggara',          eta: '3-6 hari kerja',  perKg: 32000, prov: ['BA', 'NB', 'NT'] },
  { name: 'Kalimantan dan Sulawesi',         eta: '4-8 hari kerja',  perKg: 40000, prov: ['KB', 'KT', 'KS', 'KI', 'KU', 'SA', 'GO', 'ST', 'SR', 'SN', 'SG'] },
  { name: 'Maluku dan Papua', eta: '6-12 hari kerja', perKg: 70000, prov: ['MA', 'MU', 'PA', 'PB'], prices: [100000, 135700, 135700, 135700, 135700, 135700] } // RajaOngkir Jayapura: J&T 1 kg Rp 100.000, AnterAja Rp 135.700 for 2-10 kg
];
// [from kg, to kg (null = open end), multiple of perKg]
const TIERS = [[0, 1, 1], [1.0001, 2, 2], [2.0001, 3, 3], [3.0001, 5, 5], [5.0001, 10, 10], [10.0001, null, 15]];

function gql(query, variables, mutate) {
  const q = path.join(QA, '_q.graphql'), v = path.join(QA, '_v.json'), o = path.join(QA, '_o.json');
  fs.writeFileSync(q, query); fs.writeFileSync(v, JSON.stringify(variables || {}));
  try { fs.unlinkSync(o); } catch (e) {}
  const args = ['store', 'execute', '-s', store, '--query-file', q, '--variable-file', v, '--json', '--output-file', o].concat(mutate ? ['--allow-mutations'] : []);
  const r = spawnSync('shopify', args, { shell: true, encoding: 'utf8', env: Object.assign({}, process.env, { MSYS_NO_PATHCONV: '1' }) });
  if (!fs.existsSync(o)) throw new Error('no output: ' + (r.stdout || '').slice(-400) + (r.stderr || '').slice(-300));
  const j = JSON.parse(fs.readFileSync(o, 'utf8'));
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 600));
  return j.data || j;
}

const cur = gql(`query{deliveryProfiles(first:5){nodes{id default profileLocationGroups{locationGroup{id}locationGroupZones(first:50){nodes{zone{id name countries{code{countryCode}}}methodDefinitions(first:50){nodes{id name}}}}}}}}`);
const profile = cur.deliveryProfiles.nodes.find(p => p.default);
const lg = profile.profileLocationGroups[0];
const zones = lg.locationGroupZones.nodes;
const domestic = zones.find(z => z.zone.countries.some(c => c.code.countryCode === 'ID'));
if (!domestic) throw new Error('no zone with Indonesia found');
const byName = {}; zones.forEach(z => { byName[z.zone.name] = z; });

const methods = z => TIERS.map(([from, to, mult], i) => {
  const w = [{ operator: 'GREATER_THAN_OR_EQUAL_TO', criteria: { value: from, unit: 'KILOGRAMS' } }];
  if (to != null) w.push({ operator: 'LESS_THAN_OR_EQUAL_TO', criteria: { value: to, unit: 'KILOGRAMS' } });
  return { name: 'Reguler (' + z.eta + ')', active: true, rateDefinition: { price: { amount: z.prices ? z.prices[i] : z.perKg * mult, currencyCode: 'IDR' } }, weightConditionsToCreate: w };
});
const country = z => [{ code: 'ID', provinces: z.prov.map(code => ({ code })) }];

const toUpdate = [], toCreate = [], toDeleteMethods = [];
ZONES.forEach((z, i) => {
  const existing = byName[z.name] || (i === 0 ? domestic : null);
  if (existing) {
    existing.methodDefinitions.nodes.forEach(m => toDeleteMethods.push(m.id));
    toUpdate.push({ id: existing.zone.id, name: z.name, countries: country(z), methodDefinitionsToCreate: methods(z) });
  } else toCreate.push({ name: z.name, countries: country(z), methodDefinitionsToCreate: methods(z) });
});
const input = { methodDefinitionsToDelete: toDeleteMethods, locationGroupsToUpdate: [{ id: lg.locationGroup.id, zonesToUpdate: toUpdate, zonesToCreate: toCreate }] };
console.log('plan:', ZONES.map(z => z.name + ' (' + z.prov.length + ' prov, Rp ' + z.perKg + '/kg)').join('; '));
console.log('update', toUpdate.length, 'zone(s), create', toCreate.length, 'zone(s), delete', toDeleteMethods.length, 'old method(s)');
if (dry) { console.log('dry run, nothing changed'); process.exit(0); }
const r = gql(`mutation($id:ID!,$p:DeliveryProfileInput!){deliveryProfileUpdate(id:$id,profile:$p){profile{id}userErrors{field message}}}`, { id: profile.id, p: input }, true).deliveryProfileUpdate;
if (r.userErrors.length) { console.log('ERRORS:', JSON.stringify(r.userErrors, null, 1)); process.exit(2); }
console.log('shipping rates updated');
