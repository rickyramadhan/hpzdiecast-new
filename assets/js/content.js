/* ==========================================================================
   HPZ — shared content (mockup)
   In Shopify: metaobjects (casting, build, guide, brand), Markets settings,
   locale files and shop metafields.
   ========================================================================== */
window.HPZ_CONTENT = (function () {
  'use strict';

  /* ---------- brands (metaobject: brand) ---------- */
  const BRANDS = {
    hpz:      { n: 'HPZ Wheels',      code: 'HPZ', own: 1, note: 'Designed and assembled in-house in Semarang. Resin faces, alloy lips, bearing series.' },
    hpzdecal: { n: 'HPZ Decal Lab',   code: 'HDL', own: 1, note: 'Waterslide liveries printed in-house, precoated, cut-to-template.' },
    jv:       { n: 'JV Custom',       code: 'JVC', note: 'Resin wheels with long JDM axles. Huge colour range.' },
    sakura:   { n: 'Sakura Model',    code: 'SKR', note: 'CNC-machined lips, resin body kits, interior detailing.' },
    turbo:    { n: 'Turbominiscale',  code: 'TMS', note: 'Aluminium barrel replicas of real-world JDM fitments.' },
    rebel:    { n: 'Rebel × Arise',   code: 'RBL', note: 'Handmade resin & alloy wheels, retro rims, aero parts.' },
    carlomo:  { n: 'Carlomo',         code: 'CLM', note: '9.5 mm premium alloy wheels with disc brake and axle.' },
    octopus:  { n: 'Octopus Hobbies', code: 'OCT', note: 'Resin engines — raw for painters or factory painted.' },
    parvus:   { n: 'Parvus Models',   code: 'PRV', note: 'Wings, mirrors, racks and engines for 1:64.' },
    mc23:     { n: 'Muscle Car 23',   code: 'MC23', note: '3D-printed faces with alloy lips. Staggered 12/10 mm.' },
    ws:       { n: 'WS Scale',        code: 'WSS', note: 'Truck and dually fitments.' },
  };

  /* ---------- categories ---------- */
  const CATS = {
    wheels:   { n: 'Wheels & Tyres',  short: 'Wheels',    code: 'W' },
    decals:   { n: 'Waterslide Decals', short: 'Decals',  code: 'D' },
    bodykits: { n: 'Body Kits',       short: 'Body kits', code: 'B' },
    engines:  { n: 'Engines',         short: 'Engines',   code: 'E' },
    exterior: { n: 'Aero & Exterior', short: 'Exterior',  code: 'X' },
    interior: { n: 'Interior',        short: 'Interior',  code: 'I' },
    dioramas: { n: 'Dioramas',        short: 'Dioramas',  code: 'R' },
  };
  const STYLES = { jdm: 'JDM', euro: 'Euro', classic: 'Classic', muscle: 'Muscle', offroad: 'Off-road' };

  /* ---------- castings (metaobject: casting) ----------
     m   = regex matched against product titles to find parts made for it
     dia = recommended wheel diameter (mm) for a flush fit
     body = silhouette used in the fitment visual */
  const CASTINGS = [
    { id: 'civic-eg6',   n: 'Honda Civic EG6',            mk: 'Hot Wheels', yr: '2019', body: 'hatch',  dia: 10,  axle: 'Long (JDM)', m: /civic eg|eg6/i },
    { id: 'civic-ef',    n: 'Honda Civic EF',             mk: 'Hot Wheels', yr: '2020', body: 'hatch',  dia: 9.5, axle: 'Long (JDM)', m: /civic ef/i },
    { id: 'civic-ek9',   n: 'Honda Civic Type R EK9',     mk: 'Hot Wheels', yr: '2021', body: 'hatch',  dia: 10,  axle: 'Long (JDM)', m: /ek9/i },
    { id: 'civic-si',    n: 'Honda Civic Si (EM1)',       mk: 'Hot Wheels', yr: '2022', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /civic si/i },
    { id: 's2000',       n: 'Honda S2000',                mk: 'Hot Wheels', yr: '2020', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /s2000/i },
    { id: 'nsx',         n: 'Acura / Honda NSX',          mk: 'Hot Wheels', yr: '2012', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /nsx/i },
    { id: 'r32',         n: 'Nissan Skyline GT-R R32',    mk: 'Hot Wheels', yr: '2019', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /r32/i },
    { id: 'r33',         n: 'Nissan Skyline GT-R R33',    mk: 'Hot Wheels', yr: '2020', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /r33/i },
    { id: 'r34',         n: 'Nissan Skyline GT-R R34',    mk: 'Hot Wheels', yr: '2018', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /r34|rb26/i },
    { id: 'r35',         n: 'Nissan GT-R R35',            mk: 'Hot Wheels', yr: '2017', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /r35|vr38/i },
    { id: 's13',         n: 'Nissan Silvia S13 / 180SX',  mk: 'Hot Wheels', yr: '2021', body: 'coupe',  dia: 9.5, axle: 'Long (JDM)', m: /s13|180sx|sr20/i },
    { id: 's15',         n: 'Nissan Silvia S15',          mk: 'Hot Wheels', yr: '2019', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /s15|sr20/i },
    { id: 'supra',       n: 'Toyota Supra MK4',           mk: 'Hot Wheels', yr: '2020', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /supra|2jz/i },
    { id: 'rx7-fd',      n: 'Mazda RX-7 FD',              mk: 'Hot Wheels', yr: '2019', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /rx ?-?7 ?fd|rx7 fd|26b/i },
    { id: 'rx7-fc',      n: 'Mazda RX-7 FC Savanna',      mk: 'Hot Wheels', yr: '2021', body: 'coupe',  dia: 9.5, axle: 'Long (JDM)', m: /rx ?7 ?fc|savanna|rx7 fc/i },
    { id: 'miata',       n: 'Mazda MX-5 Miata (NA)',      mk: 'Hot Wheels', yr: '1991', body: 'coupe',  dia: 9.5, axle: 'Short',      m: /miata|mx ?5/i },
    { id: 'evo',         n: 'Mitsubishi Lancer Evolution', mk: 'Hot Wheels', yr: '2023', body: 'sedan', dia: 10,  axle: 'Long (JDM)', m: /evo|lancer/i },
    { id: 'impreza',     n: 'Subaru Impreza 22B / WRX',   mk: 'Hot Wheels', yr: '2020', body: 'sedan',  dia: 10,  axle: 'Long (JDM)', m: /22b|impreza|wrx/i },
    { id: 'brz',         n: 'Subaru BRZ / Scion FR-S',    mk: 'Hot Wheels', yr: '2019', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /brz|frs|fr-s/i },
    { id: 'm3-e30',      n: 'BMW M3 E30',                 mk: 'Hot Wheels', yr: '2018', body: 'sedan',  dia: 9.5, axle: 'Short',      m: /e30/i },
    { id: 'm3-e36',      n: 'BMW M3 E36',                 mk: 'Hot Wheels', yr: '2020', body: 'sedan',  dia: 10,  axle: 'Short',      m: /e36/i },
    { id: 'm3-e46',      n: 'BMW M3 E46',                 mk: 'Hot Wheels', yr: '2021', body: 'coupe',  dia: 10,  axle: 'Short',      m: /e46/i },
    { id: 'm4',          n: 'BMW M4 (G82)',               mk: 'Hot Wheels', yr: '2022', body: 'coupe',  dia: 10,  axle: 'Short',      m: /m4/i },
    { id: '500e',        n: 'Mercedes-Benz 500E',         mk: 'Hot Wheels', yr: '2021', body: 'sedan',  dia: 10,  axle: 'Short',      m: /500e/i },
    { id: 'delta',       n: 'Lancia Delta Integrale',     mk: 'Hot Wheels', yr: '2022', body: 'hatch',  dia: 9.5, axle: 'Short',      m: /lancia|delta/i },
    { id: '911-96',      n: 'Porsche 911 Carrera (993)',  mk: 'Hot Wheels', yr: '1996', body: 'coupe',  dia: 10,  axle: 'Short',      m: /porsche|carrera/i },
    { id: 'f40',         n: 'Ferrari F40',                mk: 'Hot Wheels', yr: '2020', body: 'coupe',  dia: 10,  axle: 'Short',      m: /f40/i },
    { id: 'silverado',   n: "'83 Chevy Silverado",        mk: 'Hot Wheels', yr: '2021', body: 'truck',  dia: 12,  axle: 'Short',      m: /silverado|dually|v8/i },
    { id: 'camaro',      n: "'18 Camaro SS",              mk: 'Hot Wheels', yr: '2018', body: 'coupe',  dia: 12,  axle: 'Short',      m: /camaro|muscle car|v8/i },
    { id: 'mb-touring',  n: 'BMW 3 Series Touring',       mk: 'Matchbox',   yr: '2022', body: 'hatch',  dia: 10,  axle: 'Short',      m: /touring/i },
    { id: 'mgt-r34',     n: 'Nissan Skyline R34 (Mini GT)', mk: 'Mini GT',  yr: '2023', body: 'coupe',  dia: 10,  axle: 'Long (JDM)', m: /r34|rb26/i },
    { id: 'tomica-ae86', n: 'Toyota AE86 Trueno',         mk: 'Tomica Premium', yr: '2020', body: 'hatch', dia: 9.5, axle: 'Short', m: /ae86|4a-?g/i },
  ];

  /* ---------- builds (metaobject: build) ----------
     spots: [x%, y%, handle, variant name] on the photo */
  const IG = 'https://cdn.shopify.com/s/files/1/0716/6427/1450/files/';
  const BUILDS = [
    { id: 'b1', by: 'armygreentaco.diecast', title: 'GT-R Pit Row', cast: 'r34', img: IG + '627859247_17903468040358636_9215028376513405304_n.jpg', likes: 1284,
      story: 'Three R34s on gold six-spokes, staged in a home-made pit garage. Bearing series wheels so they actually roll down the line.',
      spots: [[58, 64, 'hpz-wheels-model-te37-sl-bearing-series', 'Gold'], [82, 59, 'hpz-wheels-model-six-bearing-series', 'Gold']],
      parts: ['add-on-body-kit-for-hot-wheels-skyline-r34', 'decal-set-hotwheels-skyline-r34-nismo-z-tune'] },
    { id: 'b2', by: 'colo.customs', title: 'BN Sports Chaser', cast: null, img: IG + '631316196_18006175139836329_2723227655320315377_n.jpg', likes: 932,
      story: 'Hand-masked checker livery, ducktail wing and silver five-spokes tucked under the arches.',
      spots: [[50, 61, 'hpz-wheels-model-super-advan-bearing-series', 'Silver'], [38, 47, 'jv-accessories-voltex-wing', null]],
      parts: ['jv-accessories-c-west'] },
    { id: 'b3', by: 'ozzyg_7customs', title: 'Sakura S2000', cast: 's2000', img: IG + '625947038_17917284378256467_2530175199263028026_n.jpg', likes: 2051,
      story: 'Candy magenta with a hand-drawn line-art wrap. Mismatched mesh fronts and pink five-spokes — on purpose.',
      spots: [[25, 58, 'hpz-wheels-model-yabaking-mesh', 'White'], [58, 59, 'hpz-wheels-model-yabaking-5-spoke', 'Pink']],
      parts: ['decal-set-hotwheels-honda-s2000-hks-super-gt'] },
    { id: 'b4', by: 'flames.diecast', title: 'M4 on Deep Dish', cast: 'm4', img: IG + '626183649_17878289820469569_3561695745277330278_n.jpg', likes: 1517,
      story: 'Metallic red M4 dropped on stepped-lip deep dish wheels with resin lips. Photographed in a trade-show diorama.',
      spots: [[53, 69, 'hpz-wheels-model-work-meister-s1', 'Bronze Grey lips Resin'], [91, 66, 'hpz-wheels-model-work-meister-s1', 'Bronze Grey lips Resin']],
      parts: ['decal-set-hotwheels-bmw-m4-gt4'] },
    { id: 'b5', by: 'sq_wheelsproject', title: 'Viper #51 Track Car', cast: null, img: IG + '627967251_17960306688023139_3741770519470168888_n.jpg', likes: 1776,
      story: 'Opened the clam to fit a V8, added a GT wing and Recaro buckets. Every part is 1:64 scale resin or alloy.',
      spots: [[21, 41, 'hpz-wheels-model-rotiform-vsmx-copy', 'Silver'], [30, 33, 'parvus-models-miniatur-mesin-v8-engine-scale-1-64-hotwheels-tomica', null], [86, 38, 'parvus-models-1-64-spoiler-gt-wing-type-2', null], [52, 40, 'recaro-seat-with-detailing', null]],
      parts: [] },
    { id: 'b6', by: 'hpz.workshop', title: 'HKS S2000 Super GT', cast: 's2000', fromProduct: 'decal-set-hotwheels-honda-s2000-hks-super-gt', imgIndex: 1, likes: 864,
      story: 'Our own test build for the HKS sheet. Transparent decal over pearl white, sealed in a display case.',
      spots: [], parts: ['decal-set-hotwheels-honda-s2000-hks-super-gt', 'hpz-wheels-model-six-bearing-series'] },
    { id: 'b7', by: 'hpz.workshop', title: 'Wings West Civic', cast: 'civic-si', fromProduct: 'decal-set-hotwheels-civic-si-wings-west', imgIndex: 0, likes: 711,
      story: 'Period-correct Wings West aero graphics on the Civic Si casting with blue-face five-spokes.',
      spots: [], parts: ['decal-set-hotwheels-civic-si-wings-west', 'hpz-wheels-model-te37-sl-bearing-series'] },
    { id: 'b8', by: 'hpz.workshop', title: 'R34 V-Spec Widebody', cast: 'r34', fromProduct: 'hpz-add-on-body-kit-for-hot-wheels-r34-v-spec', imgIndex: 0, likes: 1390,
      story: 'Carbonbased widebody kit test-fit. Raw resin, sanded, primed and fitted with 10 mm bearing wheels.',
      spots: [], parts: ['hpz-add-on-body-kit-for-hot-wheels-r34-v-spec', 'hpz-wheels-model-bbs-lm-bearing-series'] },
    { id: 'b9', by: 'hpz.workshop', title: 'Delta Integrale Martini', cast: 'delta', fromProduct: 'decal-set-hotwheels-lancia-delta-integrale-wrc-martini', imgIndex: 0, likes: 655,
      story: 'Full Martini rally livery, numbers and sponsor set on the Hot Wheels Delta.',
      spots: [], parts: ['decal-set-hotwheels-lancia-delta-integrale-wrc-martini'] },
  ];

  /* ---------- reviews (placeholder — replace with Judge.me / Okendo) ---------- */
  const REVIEWS = [
    { n: 'Marco R.', c: 'IT', r: 5, d: '2026-09-28', t: 'Bearings make a real difference', b: 'Rolls like a real car on my track. Lips are clean, no flash on the resin faces. Arrived in 9 days to Milan.', p: 'hpz-wheels-model-te37-sl-bearing-series' },
    { n: 'Kenji T.', c: 'JP', r: 5, d: '2026-09-17', t: 'Decal fits perfectly', b: 'Template matches the casting lines exactly. Used softener and clear coat, looks like factory tampo.', p: 'decal-set-hotwheels-skyline-r32-calsonic-jgtc' },
    { n: 'Daniel W.', c: 'DE', r: 5, d: '2026-09-09', t: 'Packed like jewellery', b: 'Every set in its own bag inside a rigid box. Duty was clear at checkout so no surprise at the door.', p: 'hpz-wheels-model-bbs-lm-bearing-series' },
    { n: 'Aisha K.', c: 'MY', r: 4, d: '2026-08-30', t: 'Great kit, needs patience', b: 'Body kit needs sanding like any resin part. Fit on the R34 is very good after test-fitting.', p: 'hpz-add-on-body-kit-for-hot-wheels-r34-v-spec' },
    { n: 'Tom H.', c: 'GB', r: 5, d: '2026-08-21', t: 'My go-to wheel shop', b: 'Fourth order. The fitment finder saved me from buying 10 mm for my Miata, 9.5 was right.', p: 'hpz-wheels-model-six-bearing-series' },
    { n: 'Ryan C.', c: 'US', r: 5, d: '2026-08-12', t: 'Fast to the US even with the new rules', b: 'Duties were prepaid at checkout. DHL took 5 days to California.', p: 'hpz-wheels-model-super-advan-bearing-series' },
  ];

  /* ---------- guides (blog: academy) ---------- */
  const GUIDES = [
    { id: 'wheel-swap', cat: 'Wheels', min: 12, lvl: 'Beginner', t: 'Wheel swap without drilling the rivet', d: 'The cleanest way to open a Hot Wheels casting, fit 10 mm bearing wheels and close it with a screw.', img: 'hpz-wheels-model-six-bearing-series' },
    { id: 'waterslide', cat: 'Decals', min: 8, lvl: 'Beginner', t: 'Waterslide decals: the 7-step method', d: 'Clear coat, cut, soak, slide, blot, set, seal. With the timings that actually work in humid weather.', img: 'decal-set-hotwheels-civic-si-wings-west' },
    { id: 'fitment', cat: 'Fitment', min: 6, lvl: 'All levels', t: '9 mm, 9.5 mm or 10 mm? Picking a diameter', d: 'How arch size, ride height and tyre profile change what fits — and how to measure your casting.', img: 'hpz-wheels-model-te37-sl-bearing-series' },
    { id: 'resin-kit', cat: 'Body kits', min: 20, lvl: 'Intermediate', t: 'Fitting a resin widebody kit', d: 'Cleaning flash, test-fitting, gluing with CA, filling seams and priming before paint.', img: 'hpz-add-on-body-kit-for-hot-wheels-r34-v-spec' },
    { id: 'white-toner', cat: 'Decals', min: 5, lvl: 'Intermediate', t: 'White toner decals on dark paint', d: 'Why white toner sheets are printed mirrored, and how to flip them onto the body.', img: 'decal-matchbox-bmw-3-series-touring-white-toner-decal' },
    { id: 'engine-paint', cat: 'Engines', min: 15, lvl: 'Advanced', t: 'Painting a raw resin engine', d: 'Primer, metallic base, black wash and dry-brush to bring out the cam covers.', img: 'octopus-engine-rb26dett-nismo' },
  ];

  /* ---------- markets (Shopify Markets) ----------
     rate = USD → local, round = rounding rule applied by Markets */
  const MARKETS = {
    INT: { n: 'International', cur: 'USD', flag: 'INT', lang: 'en', free: 75, ship: [['std', 'Tracked Standard', 8.5, '8–14'], ['exp', 'DHL Express', 22, '3–6']], pay: ['paypal', 'visa', 'mc', 'amex', 'apple', 'gpay'] },
    US:  { n: 'United States', cur: 'USD', flag: 'US', lang: 'en', free: 75, duty: 1, ship: [['std', 'USPS via Asendia (DDP)', 11, '7–12'], ['exp', 'DHL Express (DDP)', 24, '3–5']], pay: ['shop', 'paypal', 'visa', 'mc', 'amex', 'apple', 'gpay'] },
    EU:  { n: 'Europe', cur: 'EUR', flag: 'EU', lang: 'en', free: 75, ship: [['std', 'Tracked Standard (IOSS)', 8.5, '8–14'], ['exp', 'DHL Express', 22, '3–6']], pay: ['paypal', 'visa', 'mc', 'apple', 'gpay', 'klarna'] },
    GB:  { n: 'United Kingdom', cur: 'GBP', flag: 'GB', lang: 'en', free: 75, ship: [['std', 'Royal Mail Tracked', 8.5, '7–12'], ['exp', 'DHL Express', 22, '3–5']], pay: ['paypal', 'visa', 'mc', 'apple', 'gpay'] },
    AU:  { n: 'Australia', cur: 'AUD', flag: 'AU', lang: 'en', free: 75, ship: [['std', 'Tracked Standard', 8.5, '7–12'], ['exp', 'DHL Express', 22, '3–5']], pay: ['paypal', 'visa', 'mc', 'apple', 'gpay', 'afterpay'] },
    JP:  { n: 'Japan', cur: 'JPY', flag: 'JP', lang: 'ja', free: 75, ship: [['std', 'Japan Post EMS', 9, '5–9'], ['exp', 'DHL Express', 20, '2–4']], pay: ['paypal', 'visa', 'mc', 'jcb', 'apple'] },
    SG:  { n: 'Singapore', cur: 'SGD', flag: 'SG', lang: 'en', free: 60, ship: [['std', 'Ninja Van International', 6, '4–7'], ['exp', 'DHL Express', 15, '2–3']], pay: ['paypal', 'visa', 'mc', 'apple', 'gpay'] },
    MY:  { n: 'Malaysia', cur: 'MYR', flag: 'MY', lang: 'en', free: 60, ship: [['std', 'J&T International', 5, '4–7'], ['exp', 'DHL Express', 14, '2–3']], pay: ['paypal', 'visa', 'mc', 'fpx'] },
    ID:  { n: 'Indonesia', cur: 'IDR', flag: 'ID', lang: 'id', free: 30, local: 1, ship: [['jne', 'JNE Reguler', 1.2, '2–4'], ['sicepat', 'SiCepat BEST', 1.6, '1–2'], ['gosend', 'GoSend Same Day (Semarang)', 1.5, '0']], pay: ['qris', 'bca', 'mandiri', 'bni', 'gopay', 'ovo', 'visa'] },
  };
  const CURRENCIES = {
    USD: { s: '$', rate: 1, dp: 2, code: 'USD' },
    EUR: { s: '€', rate: 0.92, dp: 2, code: 'EUR' },
    GBP: { s: '£', rate: 0.79, dp: 2, code: 'GBP' },
    AUD: { s: 'A$', rate: 1.52, dp: 2, code: 'AUD' },
    JPY: { s: '¥', rate: 150, dp: 0, round: 10, code: 'JPY' },
    SGD: { s: 'S$', rate: 1.34, dp: 2, code: 'SGD' },
    MYR: { s: 'RM', rate: 4.7, dp: 2, code: 'MYR' },
    IDR: { s: 'Rp', rate: 16300, dp: 0, round: 1000, code: 'IDR' },
  };
  const LANGS = { en: 'English', id: 'Bahasa Indonesia', ja: '日本語' };

  return { BRANDS, CATS, STYLES, CASTINGS, BUILDS, REVIEWS, GUIDES, MARKETS, CURRENCIES, LANGS, IG };
})();
