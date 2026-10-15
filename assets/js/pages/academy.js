/* HPZ — Academy (guide index + article view)
   Shopify: blog "academy" → templates/blog.academy.json (sections/academy-hero, academy-list, glossary)
            article → templates/article.guide.json (sections/article-guide). Steps live in a metaobject list
            (guide_step: title, minutes, body richtext, callout type/text, widget), tools + parts as metafields.
   Long-form step copy is English here; in Shopify it is translated per locale with Translate & Adapt. */
HPZ.ready(() => {
  const H = HPZ, { $, $$, t, esc, IMG, ICON, C } = H;
  const arrow = ICON.arrow;
  const G = C.GUIDES;
  const LSK = id => 'guide.' + id;
  const doneOf = id => H.LS.get(LSK(id), []);

  /* guide images — fall back if a handle is missing from the catalog */
  const FALLBACK = { 'white-toner': 'decal-matchbox-bmw-3-series-touring-white-toner-decal' };
  const gImg = (g, w = 600, i = 0) => { const p = H.byH(g.img) || H.byH(FALLBACK[g.id]) || H.query({ k: 'decals' })[0]; return p ? IMG(p.img[i] || p.img[0], w) : ''; };

  const CAT_L = { Wheels: () => t('Wheels', 'Velg', 'ホイール'), Decals: () => t('Decals', 'Decal', 'デカール'), Fitment: () => t('Fitment', 'Fitment', 'フィットメント'), 'Body kits': () => t('Body kits', 'Body kit', 'ボディキット'), Engines: () => t('Engines', 'Mesin', 'エンジン') };
  const LVL = { Beginner: 1, Intermediate: 2, Advanced: 3, 'All levels': 1 };
  const lvlL = l => ({ Beginner: t('Beginner', 'Pemula', '初級'), Intermediate: t('Intermediate', 'Menengah', '中級'), Advanced: t('Advanced', 'Mahir', '上級'), 'All levels': t('All levels', 'Semua level', '全レベル') }[l] || l);
  const lvlBars = l => `<span class="lv" title="${esc(l)}">${[1, 2, 3].map(n => `<i class="${n <= (LVL[l] || 1) ? 'on' : ''}"></i>`).join('')}</span>`;

  /* ================= guide bodies ================= */
  const BODY = {
    'wheel-swap': {
      tools: ['Rotary tool + 120-grit sanding drum (or a flat needle file)', 'Kapton or masking tape', 'Flat 3 mm screwdriver', 'Flush cutters', '1.2 mm drill bit in a pin vise', 'M1.7 × 5 mm self-tapping screw', 'Phillips #00 driver', 'Safety glasses'],
      parts: () => H.query({ k: 'wheels', own: 1, feat: 'bearing', avail: 1 }).slice(0, 4),
      steps: [
        { t: 'Read the base before you touch it', min: 1, b: ['Flip the car and find the posts that hold it together. Most Hot Wheels mainlines have two rivets — one under the front axle, one at the rear. Mini GT, Tomica Premium and most Matchbox Collectors use screws, so stop here and unscrew.', 'Take a photo of the base and interior. On some castings (the R34 and EG6 in particular) the window piece and interior only go back one way.'] },
        { t: 'Mask around the rivets', min: 1, b: ['Put a square of Kapton or masking tape around each rivet head, leaving just the head exposed. The base printing — model name, year, copyright — scratches the moment the drum skips.'], tip: 'Mark the front rivet with a dot of marker. They are often different heights and you want to put the right screw back in the right hole.' },
        { t: 'Shave the head, keep the post', min: 3, b: ['This is the whole trick. Instead of drilling down through the rivet, grind only the mushroom head off until it is flush with the base. The post underneath stays full length — and that is what your screw will bite into later.', 'Use the sanding drum at low speed (around 5,000 rpm) with light pressure, or a flat needle file if you have patience. Zinc gets hot fast: work in 10-second bursts.'], warn: 'Stop the moment you see a thin bright ring appear around the post. Go further and you sand into the base and the screw has nothing to hold.' },
        { t: 'Lift the base off', min: 1, b: ['Slide a flat 3 mm screwdriver between body and base at the rear and twist gently. The base should pop off the shaved posts. Lay out the parts in the order they came out: base, interior, window, body.'] },
        { t: 'Remove the stock wheels', min: 2, b: ['Stock axles sit in crimped tabs moulded into the base. Lever them out with the screwdriver, or cut the axle next to one wheel with flush cutters if the tabs are tight. Keep the stock wheels in a bag — they are worth something to the next owner.'] },
        { t: 'Fit the new wheels and axles', min: 2, b: ['HPZ bearing wheels come with two axle lengths: short and long (JDM). Rest the axle in the tabs and check that it sticks out 0.5–1 mm past the tab on each side — that is what puts the tyre flush with the arch.', 'Press one wheel fully onto the axle, slide it through the tabs, then press the second wheel on until there is about 0.2 mm of side play. No play means no roll.'], tip: 'If a wheel is loose on the axle, put a pin-head of thin CA on the axle tip, not near the hub. Glue in the bearing ends the free roll forever.' },
        { t: 'Check stance and roll before closing', min: 1, b: ['Drop the body loosely on the base and roll it across a sheet of glass. A wobble is a bent axle — replace it, never bend it back. If a tyre touches the inside of the arch, trim the inner arch lip with a hobby knife or move up one axle length.'] },
        { t: 'Pilot the posts and close with screws', min: 1, b: ['Drill a 1.2 mm pilot hole 4 mm deep into the centre of each shaved post. Drive an M1.7 × 5 mm self-tapping screw in until it is snug, then a quarter-turn more.'], warn: 'Do not overtighten. The post is cast zinc and splits — a split rear post is the most common way we see these builds fail.' },
        { t: 'Final check', min: 1, b: ['Check the window sits flush and the interior is not twisted, then roll it again. You can now reopen the car any time — perfect for trying a different finish next month.'] },
      ],
    },
    waterslide: {
      tools: ['Gloss clear (spray or airbrush)', 'Fresh #11 hobby blade + cutting mat', 'Shallow dish of lukewarm water (30–35 °C)', 'Soft flat brush', 'Fine tweezers', 'Cotton buds + tissue', 'Decal softener (Micro Sol or Mr. Mark Softer)', 'Semi-gloss or gloss clear for sealing'],
      parts: () => H.query({ k: 'decals', avail: 1 }).slice(0, 4),
      steps: [
        { t: 'Clear coat: start on gloss', min: 1, b: ['Decals silver — tiny trapped air shows as a milky edge — on matte or satin paint. Spray two light coats of gloss clear on the body and let it cure 24 hours.', 'HPZ sheets are precoated, so you do not need to seal the decal sheet itself. The body still has to be gloss.'], tip: 'Semarang humidity is 75–85% most of the year. We give the gloss coat 36 hours instead of 24 here; if you are somewhere dry, 24 is fine.' },
        { t: 'Cut', min: 2, b: ['Cut as close to the printed edge as you can — 0.3 to 0.5 mm of clear film is ideal. Use a fresh blade and cut one decal at a time, only when you are ready to apply it. Pre-cut decals left lying around pick up dust and curl.'] },
        { t: 'Soak — briefly', min: 1, b: ['Dip the decal in lukewarm water for 10–20 seconds, then lift it out and lay it on a paper towel for 30–60 seconds. The glue releases on the towel, not in the dish.', 'Test it: nudge the decal with the brush. When it slides on the backing paper, it is ready.'], warn: 'Do not leave decals floating in the dish. The film separates, curls onto itself and almost never comes flat again.' },
        { t: 'Slide, do not lift', min: 1, b: ['Wet the area of the body with a drop of water first. Hold the backing paper right next to the spot with tweezers and push the decal off the paper with the brush. Never pick the film up with tweezers — it stretches and tears.'] },
        { t: 'Position and blot', min: 1, b: ['Float it into place on the water film. Once it is right, roll a cotton bud from the centre outward to push the water and air out, then touch the edges with the corner of a tissue to wick the rest away.'] },
        { t: 'Set it over the curves', min: 1, b: ['Brush decal softener over the decal. It will wrinkle — that is the film softening. Do not touch it; it pulls flat over door lines and arches in 10–15 minutes.', 'After an hour, slice through panel lines and door shuts with a fresh blade tip and add one more coat of softener.'], tip: 'For the arch lip on a 1:64 body, two thin coats of softener ten minutes apart work better than one heavy one.' },
        { t: 'Seal', min: 1, b: ['Wait 24 hours (48 h in humid weather), then mist on clear: first coat almost dry from 25–30 cm so the solvent cannot attack the ink, then two wetter coats 15 minutes apart. Gloss for a race-car look, semi-gloss for period-correct.'] },
      ],
    },
    fitment: {
      tools: ['Digital calipers (0.01 mm)', 'Steel ruler', 'Sheet of glass or a flat tile', 'Your casting with the stock wheels on'],
      parts: () => [9.5, 10, 12, 8.5].map(d => H.query({ k: 'wheels', dia: d, avail: 1 })[0]).filter(Boolean),
      steps: [
        { t: 'Know the three numbers', min: 1, b: ['Every fitment comes down to three measurements: the wheel diameter (outside of the tyre), the arch opening, and the track width — the distance across the outside faces of both wheels on one axle.', 'On our product pages, diameter always means the tyre’s outside diameter, not the rim. A “10 mm” HPZ wheel is 10.0 mm across the rubber.'] },
        { t: 'Measure the arch', min: 2, b: ['Put the car on the glass with stock wheels on. With calipers, measure the arch opening horizontally at its widest, then the height from the glass to the top of the arch lip.', 'Arch height minus your wished-for gap is the largest wheel you can run. Most current Hot Wheels JDM castings measure 10.4–10.6 mm from glass to arch top.'] },
        { t: 'Compare diameters against an arch', min: 1, widget: 'dia', b: ['The drawing below is a typical 10.5 mm arch at true proportion. Pick a diameter to see what happens to the gap above the tyre.'] },
        { t: 'Ride height changes everything', min: 1, b: ['Dropping a car by relocating the axle 0.5 mm up eats 0.5 mm of gap. If you plan to lower the car, size down: a 10 mm wheel that is flush at stock height will rub once lowered — 9.5 mm will tuck.'], tip: 'Low-profile tyres look bigger than they are. A 10 mm wheel with a thin sidewall fills the arch visually like a 10.5.' },
        { t: 'Check axle length and track', min: 1, b: ['Measure across the chassis tabs, add the width of two wheels (6 mm each for most HPZ sets) and compare with the body width at the arches. Short axles tuck the wheels in; long JDM axles bring them out flush with wide arches.', 'Poke — tyres outside the fender — looks right on a stanced build and wrong on everything else.'] },
        { t: 'Use our measured data', min: 1, widget: 'table', b: ['We measure every casting on the bench. These are the diameters we recommend for a flush fit at stock height — the full list lives in the garage picker at the top of every page.'] },
      ],
    },
    'resin-kit': {
      tools: ['Warm soapy water + old toothbrush', 'Flush cutters', 'Fresh #11 blade', 'Sanding sticks 400 / 600 / 1000', 'Sheet of glass', 'Blu-Tack', 'Medium CA glue + CA gel', 'Toothpicks', 'Grey surfacer 1200', 'Dust mask'],
      parts: () => H.query({ k: 'bodykits', avail: 1 }).slice(0, 4),
      steps: [
        { t: 'Wash off the mould release', min: 2, b: ['Resin parts come out of silicone moulds coated in release agent. Paint and glue will not stick to it. Scrub every part in warm soapy water with an old toothbrush, rinse, and let them dry for an hour.'] },
        { t: 'Remove pour stubs and flash', min: 4, b: ['Clip pour stubs off with flush cutters, leaving 0.5 mm, then sand the rest flat. Flash — the thin film along mould seams — comes off best by scraping with the blade held upright, not by cutting.'], warn: 'Sand resin wet and wear a dust mask. The dust is fine enough to stay in the air and you do not want it in your lungs.' },
        { t: 'Test-fit dry', min: 3, b: ['Hold every piece in place with a small ball of Blu-Tack and look at the car from all four sides and from above. Check that the arch flares line up with the body lines.', 'Where a part rocks or leaves a gap, sand its contact face in a figure-eight on 600-grit laid flat on glass. Check again. This step decides how the finished car looks.'] },
        { t: 'Prep the body', min: 2, b: ['Strip the paint where the kit meets the body, or at least scuff it with 400-grit. CA holds on bare zinc and scuffed paint; on glossy factory paint it lets go with the first knock.'] },
        { t: 'Glue with CA — dots, not beads', min: 2, b: ['Put three small dots of medium CA on the part with a toothpick, never a continuous bead. Press it on and hold for 30 seconds. Use gel where there is a gap to bridge.'], tip: 'Skip the accelerator unless you have to. It makes CA brittle and leaves a white bloom on the resin that shows through primer.' },
        { t: 'Fill the seams', min: 3, b: ['Run thin CA along the seam and dust it with talc, or use a fine putty. Let it cure fully — CA filler needs about 20 minutes, putty a few hours — then sand 600 → 1000 until you cannot feel the join with a fingernail.'] },
        { t: 'Prime and look again', min: 2, b: ['Spray a light coat of grey surfacer 1200. It shows every scratch and seam you missed. Fix, sand, re-prime. Two rounds is normal.'] },
        { t: 'Paint and clear', min: 2, b: ['Three light colour coats beat one heavy coat on a 1:64 body — detail disappears fast. Finish with gloss clear before decals, as in the waterslide guide.'] },
      ],
    },
    'white-toner': {
      tools: ['Gloss-coated dark body', 'Fresh #11 blade', 'Lukewarm water', 'Small piece of clear acetate or a blister-pack window', 'Soft flat brush', 'Decal softener', 'Acrylic gloss clear'],
      parts: () => H.query({ k: 'decals', avail: 1 }).filter(p => p.sp.toner).slice(0, 4),
      steps: [
        { t: 'Why the sheet looks backwards', min: 1, b: ['White toner sheets are printed mirrored on purpose. The decal goes onto the body face-down, so the white sits between paint and film. That protects the toner from scratches and gives a cleaner, glossier edge.', 'If the lettering reads backwards on the sheet, it is correct.'] },
        { t: 'Dark, glossy base', min: 1, b: ['White toner is around 85–90% opaque. On black and deep blue it looks solid; on mid colours you may see the base through it. Gloss the body exactly as for a normal waterslide.'] },
        { t: 'Cut tight', min: 1, b: ['There is no clear border to hide behind on a dark body — any film edge shows as a shiny outline. Cut right on the printed edge with a fresh blade.'] },
        { t: 'Soak and release onto acetate', min: 1, b: ['Soak 15–20 seconds, rest on a towel until it slides, then push the decal off its paper onto a wet piece of clear acetate, print side up.'] },
        { t: 'Flip and slide face-down', min: 1, b: ['Turn the acetate over above the wet body so the printed side faces the paint, and slide the decal off the acetate with the brush. Position it on the water film, then blot from the centre outward.'], warn: 'The film is now on top and slightly thicker than a normal decal. Use two thin coats of softener rather than one heavy coat, or the white can crack over sharp curves.' },
        { t: 'Seal with acrylic first', min: 1, b: ['Toner can lift under hot lacquer clear. Seal with a light acrylic gloss coat first, wait an hour, then use whatever clear you prefer on top.'] },
      ],
    },
    'engine-paint': {
      tools: ['Toothpicks + Blu-Tack or an alligator-clip handle', 'Gloss black primer', 'Chrome / aluminium metallic', 'Red or crinkle black for cam covers', 'Tamiya masking tape 2 mm', 'Black panel-line wash (enamel)', 'Enamel thinner + cotton buds', 'Old flat brush for dry-brushing', '0.3 mm wire for plug leads'],
      parts: () => H.query({ k: 'engines', avail: 1 }).slice(0, 4),
      steps: [
        { t: 'Clean up and wash', min: 2, b: ['Remove any pour stubs and flash, then wash the engine as you would a resin body kit. Check the cam cover lettering survived the mould — that is the detail everyone looks at.'] },
        { t: 'Mount it on a handle', min: 1, b: ['Push a toothpick into the gearbox mount hole with a dab of Blu-Tack, or clip the engine in an alligator clip on a stick. You should be able to paint every face without touching the part.'] },
        { t: 'Prime gloss black', min: 2, b: ['Metallics are only as smooth as what is under them. A gloss black primer makes aluminium look like cast alloy instead of grey paint.'] },
        { t: 'Metallic base coat', min: 2, b: ['Spray or brush the block and intake in aluminium; use chrome only on pipes and pulleys. Two very thin coats, ten minutes apart.'] },
        { t: 'Mask and paint the cam covers', min: 3, b: ['Cut 2 mm masking tape and frame the cam covers. RB26s get red, SR20s often black crinkle, K-series silver with a red plenum. Pull the tape back on itself at a low angle once the paint is touch-dry.'] },
        { t: 'Black wash into the recesses', min: 2, b: ['Flow black panel-line wash into the gaps between cylinders, around the plenum and into the fin detail. After five minutes, wipe the raised surfaces with a cotton bud barely damp with enamel thinner. The wash stays only where shadows would be.'], tip: 'Wipe in one direction across the cam covers. Circular wiping drags the wash back out of the lettering.' },
        { t: 'Dry-brush the edges', min: 2, b: ['Load an old flat brush with aluminium, wipe almost all of it off on a tissue, then flick it lightly across edges and raised lettering. The light catches them and the engine suddenly reads as metal at 1:64.'] },
        { t: 'Details and seal', min: 1, b: ['Add plug leads from 0.3 mm wire and pick out hose clamps with a fine brush. Seal with flat clear everywhere except the metallic parts — clear dulls metallics.'] },
      ],
    },
  };

  /* ================= glossary ================= */
  const GLOSS = () => [
    ['Bearing series', t('HPZ wheels with a miniature ball bearing in each hub. They roll three to four times farther than plain-axle wheels on a track.', 'Velg HPZ dengan bearing mini di setiap hub. Meluncur 3–4x lebih jauh di track.', 'ハブにミニベアリングを内蔵。通常の3〜4倍転がる。')],
    ['JDM axle', t('The longer of the two axles in our sets, for wide-track JDM castings. Puts the tyre flush with a wide arch instead of tucked inside it.', 'Axle yang lebih panjang untuk casting JDM bertrack lebar. Ban jadi rata dengan arch lebar.', 'ワイドトレッドの車種向けロングアクスル。')],
    ['Precoated', t('A decal sheet sealed with clear film at the factory, so the ink will not dissolve in water. No need to spray the sheet before cutting.', 'Sheet decal yang sudah dilapisi clear dari pabrik, tinta tidak larut. Tidak perlu di-clear sebelum dipotong.', '工場でクリアコート済み。カット前の処理不要。')],
    ['White toner', t('Opaque white printing for decals on dark paint. Printed mirrored and applied face-down.', 'Cetak putih opak untuk decal di cat gelap. Dicetak mirror dan dipasang terbalik.', '濃色ボディ用の白印刷。反転印刷で裏向きに貼る。')],
    ['Flash', t('The thin film of excess resin along mould seams. Scrape it off with an upright blade, then sand.', 'Lapisan tipis resin berlebih di garis cetakan. Kerok dengan pisau tegak lalu amplas.', '型の合わせ目にできる薄いバリ。')],
    ['Pour stub', t('The plug of resin where it entered the mould. Clip it close, then sand flat.', 'Sisa resin di titik tuang. Potong dekat lalu amplas rata.', '注型口の余り。')],
    ['CA glue', t('Cyanoacrylate — super glue. Thin CA wicks into tight joints, medium is for general assembly, gel bridges gaps.', 'Cyanoacrylate — lem super. Thin meresap, medium untuk umum, gel untuk celah.', '瞬間接着剤。低粘度・中粘度・ゼリー状。')],
    ['Tucked fitment', t('The tyre sits just inside the arch lip, with a small even gap above it. The default “clean” look.', 'Ban duduk sedikit di dalam bibir arch dengan celah rata. Tampilan “bersih” standar.', 'タイヤがフェンダー内に収まる状態。')],
    ['Poke', t('Wheels that stick out past the fender. Right for a stanced build, wrong on a stock-look car.', 'Velg yang menonjol melewati fender. Cocok untuk stance, tidak untuk tampilan standar.', 'フェンダーからはみ出す状態。')],
    ['Track width', t('Distance across the outside faces of both wheels on one axle. Set by axle length.', 'Jarak antar sisi luar dua roda pada satu axle. Ditentukan panjang axle.', '左右ホイール外側の距離。')],
    ['Rivet', t('The mushroom-headed post that holds a Hot Wheels base to its body. Shave the head, keep the post.', 'Tiang berkepala jamur yang mengunci base Hot Wheels. Kikis kepalanya, simpan tiangnya.', 'ベースを留めるカシメ。')],
    ['Decal softener', t('A setting solution (Micro Sol, Mr. Mark Softer) that softens decal film so it pulls down over curves and panel lines.', 'Cairan (Micro Sol, Mr. Mark Softer) yang melunakkan film decal agar menempel di lekukan.', 'デカール軟化剤。')],
    ['Surfacer', t('A fine filler primer, usually grey 1200 grit. Shows the defects you missed before colour goes on.', 'Primer pengisi halus, biasanya abu-abu 1200. Menampakkan cacat sebelum dicat.', 'サーフェイサー。下地の傷を見つける。')],
    ['Dry-brushing', t('Painting with an almost-dry brush so pigment only catches raised edges. Makes 1:64 metal detail readable.', 'Mengecat dengan kuas hampir kering agar warna hanya kena tepi menonjol.', 'ドライブラシ。凸部だけに色を乗せる。')],
    ['Panel-line wash', t('Very thin dark paint flowed into recesses, wiped off the high points. Adds depth to engines and body lines.', 'Cat gelap encer dialirkan ke celah, dihapus dari bagian menonjol. Memberi kedalaman.', 'スミ入れ。')],
  ];

  /* ================= index ================= */
  let filter = 'All';
  const CATS = ['All', 'Wheels', 'Decals', 'Fitment', 'Body kits', 'Engines'];
  const steps = id => (BODY[id] ? BODY[id].steps.length : 0);
  function progBar(id) { const n = steps(id), d = doneOf(id).length; return `<span class="pg ${d && d === n ? 'is-full' : ''}" title="${d}/${n}"><i style="--p:${n ? d / n * 100 : 0}%"></i></span><span class="mono pg-t">${d ? `${d}/${n}` : t('Not started', 'Belum mulai', '未着手')}</span>`; }
  function drawIndexHead() {
    const total = G.reduce((s, g) => s + g.min, 0);
    $('#ach-meta').textContent = `· ${G.length} ${t('guides', 'panduan', 'ガイド')} · ${total} min ${t('total', 'total', '合計')}`;
    const started = G.filter(g => doneOf(g.id).length), done = G.filter(g => doneOf(g.id).length === steps(g.id));
    const allSteps = G.reduce((s, g) => s + steps(g.id), 0), doneSteps = G.reduce((s, g) => s + doneOf(g.id).length, 0);
    const R = 34, L = 2 * Math.PI * R;
    $('#ach-prog').innerHTML = `<div class="ap-h mono"><span>${t('Your bench log', 'Log kerja kamu', 'あなたの記録')}</span><span>${t('saved on this device', 'tersimpan di perangkat ini', 'この端末に保存')}</span></div>
      <div class="ap-b"><svg class="ring" viewBox="0 0 80 80"><circle cx="40" cy="40" r="${R}" class="ring-bg"/><circle cx="40" cy="40" r="${R}" class="ring-fg" style="stroke-dasharray:${L};stroke-dashoffset:${L - L * (allSteps ? doneSteps / allSteps : 0)}"/></svg><span class="ap-pc mono"><b data-count="${allSteps ? Math.round(doneSteps / allSteps * 100) : 0}">0</b>%</span>
      <dl><div><dt>${t('Steps done', 'Langkah selesai', '完了ステップ')}</dt><dd class="mono">${doneSteps} / ${allSteps}</dd></div><div><dt>${t('Guides started', 'Panduan dimulai', '開始')}</dt><dd class="mono">${started.length}</dd></div><div><dt>${t('Completed', 'Selesai', '完了')}</dt><dd class="mono">${done.length}</dd></div></dl></div>
      ${started.length && started.length > done.length ? (() => { const g = started.find(x => doneOf(x.id).length < steps(x.id)); return `<a class="ap-cont" href="academy.html?a=${g.id}"><span>${t('Continue', 'Lanjutkan', '続ける')}: <b>${esc(g.t)}</b></span>${arrow}</a>`; })() : `<a class="ap-cont" href="academy.html?a=${G[0].id}"><span>${t('Start with', 'Mulai dari', 'まずは')}: <b>${esc(G[0].t)}</b></span>${arrow}</a>`}`;
    H.countOnView($('#ach-prog'));
  }
  function drawChips() {
    $('#ac-chips').innerHTML = CATS.map(c => { const n = c === 'All' ? G.length : G.filter(g => g.cat === c).length; return `<button class="chip ${c === filter ? 'is-on' : ''}" data-cat="${c}" role="tab" aria-selected="${c === filter}">${c === 'All' ? t('All', 'Semua', 'すべて') : CAT_L[c]()}<span class="ct">${n}</span></button>`; }).join('');
  }
  function drawList(anim) {
    const list = G.filter(g => filter === 'All' || g.cat === filter);
    $('#ac-count').textContent = `${list.length} ${t(list.length === 1 ? 'guide' : 'guides', 'panduan', 'ガイド')}`;
    const f = list[0], rest = list.slice(1);
    const b = BODY[f.id];
    $('#ac-feat').innerHTML = `<a class="af" href="academy.html?a=${f.id}">
      <span class="af-img"><img src="${gImg(f, 1000)}" alt=""><span class="af-tag mono">${t('Featured', 'Pilihan', '注目')} · ${CAT_L[f.cat]()}</span></span>
      <span class="af-b"><span class="af-n mono">${String(G.indexOf(f) + 1).padStart(2, '0')} / ${String(G.length).padStart(2, '0')}</span>
        <h2 class="h1">${esc(f.t)}</h2><p class="lead">${esc(f.d)}</p>
        <span class="af-meta"><span>${lvlBars(f.lvl)}${lvlL(f.lvl)}</span><span class="mono">${f.min} min</span><span class="mono">${steps(f.id)} ${t('steps', 'langkah', 'ステップ')}</span><span class="mono">${b.tools.length} ${t('tools', 'alat', '道具')}</span></span>
        <span class="af-tools">${b.tools.slice(0, 4).map(x => `<i>${esc(x.replace(/\s*\(.*\)/, ''))}</i>`).join('')}${b.tools.length > 4 ? `<i>+${b.tools.length - 4}</i>` : ''}</span>
        <span class="af-f"><span class="af-pg">${progBar(f.id)}</span><span class="btn btn-signal">${doneOf(f.id).length ? t('Continue guide', 'Lanjutkan', '続きを読む') : t('Read the guide', 'Baca panduan', 'ガイドを読む')} ${arrow}</span></span></span></a>`;
    $('#ac-list').innerHTML = rest.map((g, i) => `<li data-reveal style="--i:${i}"><a class="al" href="academy.html?a=${g.id}">
      <span class="mono al-n">${String(G.indexOf(g) + 1).padStart(2, '0')}</span>
      <span class="al-img"><img src="${gImg(g, 400)}" alt="" loading="lazy"></span>
      <span class="al-c"><span class="mono al-cat">${CAT_L[g.cat]()}</span><span class="al-lv">${lvlBars(g.lvl)}${lvlL(g.lvl)}</span></span>
      <span class="al-t"><b>${esc(g.t)}</b><em>${esc(g.d)}</em></span>
      <span class="mono al-m">${g.min} min · ${steps(g.id)} ${t('steps', 'langkah', 'ステップ')}</span>
      <span class="al-pg">${progBar(g.id)}</span>${arrow}</a></li>`).join('') || `<li class="al-empty">${t('Only one guide in this category so far — more are being written on the bench.', 'Baru satu panduan di kategori ini — sisanya sedang ditulis.', 'このカテゴリーは現在1件です。')}</li>`;
    if (anim) { [$('#ac-feat'), $('#ac-list')].forEach(el => { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }); }
    H.reveal($('#ac-list'));
  }
  function drawGloss() {
    const q = ($('#gl-q').value || '').trim().toLowerCase();
    const list = GLOSS().filter(([k, d]) => !q || (k + ' ' + d).toLowerCase().includes(q)).sort((a, b) => a[0].localeCompare(b[0]));
    $('#gl-list').innerHTML = list.map(([k, d]) => `<div class="gl-i"><dt><span class="mono gl-l">${k[0]}</span>${esc(k)}</dt><dd>${esc(d)}</dd></div>`).join('') || `<p class="muted">${t('No term matches', 'Tidak ada istilah untuk', '該当なし')} “${esc(q)}”.</p>`;
  }
  function initIndex() {
    $('#ac-index').hidden = false;
    const pc = H.params().get('cat'); if (pc && CATS.includes(pc)) filter = pc;
    const h = $('#ach-h');
    const intro = () => { h.classList.remove('is-in'); delete h.dataset.splitDone; H.splitLines(h); void h.offsetWidth; requestAnimationFrame(() => h.classList.add('is-in')); };
    const draw = () => { drawIndexHead(); drawChips(); drawList(); drawGloss(); H.applyI18n(); H.reveal(); };
    $('#ac-chips').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b || b.dataset.cat === filter) return; filter = b.dataset.cat; drawChips(); drawList(true); });
    $('#gl-q').addEventListener('input', H.debounce(drawGloss, 80));
    draw(); intro();
    H.on('market', () => { draw(); intro(); });
  }

  /* ================= article ================= */
  function diaWidget() {
    return `<div class="dw" id="dw">
      <div class="dw-ctl"><span class="mono xs">${t('Wheel diameter', 'Diameter velg', 'ホイール径')}</span><div class="dw-btns" role="group">${[9, 9.5, 10, 12].map(d => `<button type="button" data-dia="${d}" class="${d === 10 ? 'is-on' : ''}">${d}<small>mm</small></button>`).join('')}</div></div>
      <div class="dw-stage">
        <div class="dw-wheel" id="dw-wheel">${H.wheelSVG({ spokes: 6, finish: 'gold', lip: 1 })}</div>
        <svg class="dw-svg" viewBox="0 0 240 140" aria-hidden="true">
          <path class="dw-body" d="M0 100 L0 34 Q0 22 14 22 L226 22 Q240 22 240 34 L240 100 L163.3 100 A44 44 0 1 0 76.7 100 Z"/>
          <path class="dw-arch" id="dw-arch" d="M76.7 100 A44 44 0 1 1 163.3 100"/>
          <line class="dw-ground" x1="0" y1="121.5" x2="240" y2="121.5"/>
          ${Array.from({ length: 35 }, (_, i) => `<line class="dw-tick" x1="${8 + i * 7}" y1="121.5" x2="${8 + i * 7}" y2="${i % 5 ? 125 : 129}"/>`).join('')}
          <line class="dw-top" x1="104" y1="48" x2="202" y2="48"/><line class="dw-top dw-tt" id="dw-tt" x1="120" y1="51.5" x2="202" y2="51.5"/>
          <g id="dw-dim"><line class="dw-dl" id="dw-dl" x1="196" x2="196" y1="48" y2="51.5"/><line class="dw-dl" x1="190" x2="202" y1="48" y2="48"/><line class="dw-dl" id="dw-dl2" x1="190" x2="202" y1="51.5" y2="51.5"/></g>
        </svg>
        <span class="dw-lab mono" id="dw-lab"></span>
        <span class="dw-note mono">${t('Arch: 10.5 mm from ground · scale 7:1', 'Arch: 10.5 mm dari tanah · skala 7:1', 'アーチ高10.5mm · 7:1')}</span>
      </div>
      <div class="dw-read" id="dw-read"></div>
    </div>`;
  }
  function bindDia(root) {
    const S = 7, GROUND = 121.5, ARCH = 10.5; // px per mm, ground y, arch top in mm
    const verdict = d => ({
      9: [t('Toy-like', 'Seperti mainan', 'おもちゃっぽい'), t('1.5 mm of air above the tyre. Reads as stock or lifted — fine for off-road builds, odd on a street car.', 'Celah 1,5 mm di atas ban. Terlihat standar atau lifted — cocok untuk off-road.', 'タイヤ上に1.5mmの隙間。オフロード向き。'), 'warn'],
      9.5: [t('Clean street', 'Street rapi', 'クリーン'), t('1.0 mm gap. The right look on small 80s castings — AE86, Miata NA, E30, S13.', 'Celah 1,0 mm. Pas untuk casting kecil era 80-an — AE86, Miata NA, E30, S13.', '1.0mm。80年代の小型車に最適。'), 'ok'],
      10: [t('Flush', 'Flush', 'ツライチ'), t('0.5 mm gap. The default for most current Hot Wheels JDM castings — R34, Supra, EG6, S15.', 'Celah 0,5 mm. Standar untuk mayoritas casting JDM Hot Wheels — R34, Supra, EG6, S15.', '0.5mm。現行JDM車種の標準。'), 'ok'],
      12: [t('Rubs', 'Gesek', '干渉'), t('1.5 mm too big. Needs trimmed arches or a raised body — made for trucks and muscle like the Silverado and Camaro.', 'Kebesaran 1,5 mm. Perlu potong arch atau body dinaikkan — untuk truk & muscle seperti Silverado dan Camaro.', '1.5mm大きい。トラック・マッスル向け。'), 'err'],
    }[d]);
    const set = d => {
      const r = d / 2 * S, gap = ARCH - d;
      const w = root.querySelector('#dw-wheel');
      Object.assign(w.style, { width: (2 * r / 240 * 100) + '%', left: ((120 - r) / 240 * 100) + '%', top: ((GROUND - 2 * r) / 140 * 100) + '%' });
      const ty = GROUND - 2 * r, at = GROUND - ARCH * S;
      root.querySelector('#dw-dl').setAttribute('y2', ty); root.querySelector('#dw-tt').setAttribute('y1', ty); root.querySelector('#dw-tt').setAttribute('y2', ty); root.querySelector('#dw-dl2').setAttribute('y1', ty); root.querySelector('#dw-dl2').setAttribute('y2', ty);
      root.querySelector('#dw-dim').classList.toggle('is-neg', gap < 0);
      const lab = root.querySelector('#dw-lab'); lab.textContent = `${gap >= 0 ? '' : '−'}${Math.abs(gap).toFixed(1)} mm`; lab.style.top = ((Math.min(ty, at) + Math.abs(ty - at) / 2) / 140 * 100) + '%';
      const [n, txt, cls] = verdict(d);
      root.querySelector('#dw').dataset.v = cls;
      root.querySelector('#dw-read').innerHTML = `<b class="mono">Ø ${d.toFixed(1)} mm</b><span class="dw-v dw-${cls}">${n}</span><p>${txt}</p><span class="mono xs">${H.query({ k: 'wheels', dia: d }).length || t('No', 'Tidak ada', '0')} ${t('wheels in this size', 'velg ukuran ini', '点のホイール')}</span>`;
      root.querySelectorAll('[data-dia]').forEach(b => b.classList.toggle('is-on', +b.dataset.dia === d));
    };
    root.querySelector('.dw-btns').addEventListener('click', e => { const b = e.target.closest('[data-dia]'); if (b) set(+b.dataset.dia); });
    set(10);
  }
  function castTable() {
    const pick = ['civic-eg6', 'r34', 'supra', 's13', 'miata', 'm3-e30', 'tomica-ae86', 'silverado', 'camaro'].map(H.castById).filter(Boolean);
    return `<table class="ct"><thead><tr><th>${t('Casting', 'Casting', '車種')}</th><th>${t('Maker', 'Pabrikan', 'メーカー')}</th><th>${t('Diameter', 'Diameter', '径')}</th><th>${t('Axle', 'Axle', 'アクスル')}</th><th></th></tr></thead><tbody>${pick.map(c => `<tr><td><b>${esc(c.n)}</b></td><td>${esc(c.mk)}</td><td class="mono"><span class="ct-d ct-${String(c.dia).replace('.', '')}">${c.dia.toFixed(1)}</span></td><td>${esc(c.axle)}</td><td><a class="link xs" href="shop.html?cast=${c.id}">${t('Parts', 'Parts', 'パーツ')}</a></td></tr>`).join('')}</tbody></table>`;
  }

  function initArticle(g) {
    const b = BODY[g.id], host = $('#ac-article');
    host.hidden = false; document.body.classList.add('is-article');
    document.title = `${g.t} — HPZ Academy | HPZ Diecast`;
    let done = doneOf(g.id);
    const N = b.steps.length, R = 21, L = 2 * Math.PI * R;
    const others = G.filter(x => x.id !== g.id);
    const next = others.filter(x => x.cat === g.cat).concat(others.filter(x => x.cat !== g.cat)).slice(0, 2);

    function render() {
      host.innerHTML = `
      <!-- sections/article-guide.liquid : header -->
      <header class="arh"><div class="wrap arh-in">
        <div class="arh-copy">
          <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">${t('Home', 'Beranda', 'ホーム')}</a><span><a href="academy.html">Academy</a></span><span><a href="academy.html?cat=${encodeURIComponent(g.cat)}">${CAT_L[g.cat]()}</a></span><span>${esc(g.t)}</span></nav>
          <span class="eyebrow"><b>${String(G.indexOf(g) + 1).padStart(2, '0')}</b> ${CAT_L[g.cat]()} ${t('guide', 'panduan', 'ガイド')}</span>
          <h1 class="h1 arh-h">${esc(g.t)}</h1>
          <p class="lead">${esc(g.d)}</p>
          <dl class="arh-meta"><div><dt>${t('Level', 'Level', 'レベル')}</dt><dd>${lvlBars(g.lvl)}${lvlL(g.lvl)}</dd></div><div><dt>${t('Time', 'Waktu', '時間')}</dt><dd class="mono">${g.min} min</dd></div><div><dt>${t('Steps', 'Langkah', 'ステップ')}</dt><dd class="mono">${N}</dd></div><div><dt>${t('Your progress', 'Progres kamu', '進捗')}</dt><dd class="arh-pr"><svg class="ring ring-s" viewBox="0 0 50 50"><circle cx="25" cy="25" r="${R}" class="ring-bg"/><circle cx="25" cy="25" r="${R}" class="ring-fg" id="ar-ring" style="stroke-dasharray:${L}"/></svg><span class="mono" id="ar-pt"></span></dd></div></dl>
        </div>
        <div class="arh-side">
          <figure class="arh-img"><img src="${gImg(g, 900)}" alt=""><figcaption class="mono">FIG. 0 · ${esc(g.cat.toUpperCase())}</figcaption></figure>
          <div class="tools"><h2 class="tools-h mono">${t('Tools needed', 'Alat yang dibutuhkan', '必要な道具')} <span>${b.tools.length}</span></h2><ul>${b.tools.map((x, i) => `<li><span class="mono">${String(i + 1).padStart(2, '0')}</span>${esc(x)}</li>`).join('')}</ul></div>
        </div>
      </div></header>

      <!-- steps with scroll-spy rail -->
      <section class="arb"><div class="wrap arb-in">
        <nav class="rail-s" id="rail-s" aria-label="${t('Steps', 'Langkah', 'ステップ')}">
          <span class="rs-h mono">${t('Steps', 'Langkah', 'ステップ')}</span>
          <ol>${b.steps.map((s, i) => `<li><a href="#step-${i + 1}" data-rs="${i}" class="${done.includes(i) ? 'is-done' : ''}"><span class="rs-n mono">${String(i + 1).padStart(2, '0')}</span><span class="rs-t">${esc(s.t)}</span><span class="rs-ck">${ICON.check}</span></a></li>`).join('')}</ol>
          <div class="rs-f"><span class="pg"><i id="rs-bar"></i></span><span class="mono" id="rs-n"></span></div>
        </nav>
        <div class="steps" id="ar-body">
          ${b.steps.map((s, i) => `<article class="st ${done.includes(i) ? 'is-done' : ''}" id="step-${i + 1}" data-st="${i}">
            <div class="st-h"><span class="st-num mono">${String(i + 1).padStart(2, '0')}</span><div><span class="mono st-m">${t('Step', 'Langkah', 'ステップ')} ${i + 1} / ${N} · ~${s.min} min</span><h2 class="h3">${esc(s.t)}</h2></div></div>
            <div class="st-b">${s.b.map(p => `<p>${esc(p)}</p>`).join('')}
              ${s.widget === 'dia' ? diaWidget() : ''}${s.widget === 'table' ? castTable() : ''}
              ${s.tip ? `<aside class="co co-tip"><span class="co-ic">${ICON.info}</span><div><b>${t('Workshop tip', 'Tips workshop', '工房のコツ')}</b><p>${esc(s.tip)}</p></div></aside>` : ''}
              ${s.warn ? `<aside class="co co-warn"><span class="co-ic">!</span><div><b>${t('Careful', 'Hati-hati', '注意')}</b><p>${esc(s.warn)}</p></div></aside>` : ''}
              <label class="mk"><input type="checkbox" data-mk="${i}" ${done.includes(i) ? 'checked' : ''}><span class="mk-box">${ICON.tick}</span><span class="mk-t">${done.includes(i) ? t('Done', 'Selesai', '完了') : t('Mark step done', 'Tandai selesai', '完了にする')}</span></label>
            </div></article>`).join('')}
          <div class="fin" id="fin"></div>
        </div>
      </div></section>

      <!-- parts used -->
      <section class="section-s on-white arp"><div class="wrap">
        <div class="shead"><span class="idx">P</span><div><h2 class="h2">${t('Parts used in this guide', 'Parts di panduan ini', 'このガイドで使うパーツ')}</h2></div><a class="arrow-link" href="shop.html?k=${{ Wheels: 'wheels', Fitment: 'wheels', Decals: 'decals', 'Body kits': 'bodykits', Engines: 'engines' }[g.cat]}">${t('Shop the category', 'Lihat kategori', 'カテゴリーを見る')} ${arrow}</a></div>
        <div class="grid" style="--cols:4">${b.parts().map((p, i) => H.card(p, { i })).join('')}</div>
      </div></section>

      <!-- next guides -->
      <section class="section-s arn"><div class="wrap">
        <span class="eyebrow"><b>${t('Next on the bench', 'Berikutnya', '次のガイド')}</b></span>
        <div class="arn-g">${next.map(x => `<a class="arn-c" href="academy.html?a=${x.id}"><img src="${gImg(x, 300)}" alt="" loading="lazy"><span><span class="mono">${CAT_L[x.cat]()} · ${x.min} min</span><b>${esc(x.t)}</b></span>${arrow}</a>`).join('')}<a class="arn-c arn-all" href="academy.html"><span><span class="mono">${G.length} ${t('guides', 'panduan', 'ガイド')}</span><b>${t('All Academy guides', 'Semua panduan Academy', 'すべてのガイド')}</b></span>${arrow}</a></div>
      </div></section>`;
      if (b.steps.some(s => s.widget === 'dia')) bindDia(host);
      updProgress(false);
      H.reveal(host);
      spy();
    }

    function updProgress(fromClick) {
      const n = done.length, pc = n / N;
      const ring = $('#ar-ring'); if (ring) ring.style.strokeDashoffset = L - L * pc;
      $('#ar-pt').textContent = `${n} / ${N}`;
      $('#rs-bar').style.width = pc * 100 + '%'; $('#rs-n').textContent = `${n}/${N} ${t('done', 'selesai', '完了')}`;
      const fin = $('#fin');
      fin.className = 'fin' + (n === N ? ' is-done' : '');
      fin.innerHTML = n === N
        ? `<span class="fin-badge mono">${ICON.check}</span><div><b>${t('Guide complete', 'Panduan selesai', 'ガイド完了')}</b><p>${t('Post the result with #hpzacademy — featured builds earn 500 Pit Points.', 'Posting hasilnya dengan #hpzacademy — build terpilih dapat 500 Pit Points.', '#hpzacademy で投稿を。掲載で500ポイント。')}</p></div><button class="btn btn-sm btn-line" type="button" id="fin-reset">${t('Reset checklist', 'Reset checklist', 'リセット')}</button>`
        : `<span class="mono fin-n">${n}/${N}</span><div><b>${n ? t('Keep going', 'Lanjutkan', 'その調子') : t('Track your progress', 'Catat progresmu', '進捗を記録')}</b><p>${t('Tick each step as you finish it. Your checklist is saved on this device, so you can come back mid-build.', 'Centang tiap langkah. Checklist tersimpan di perangkat ini, jadi bisa lanjut kapan saja.', '各ステップにチェック。この端末に保存されます。')}</p></div>${n ? `<button class="btn btn-sm btn-ghost" type="button" id="fin-reset">${t('Reset', 'Reset', 'リセット')}</button>` : ''}`;
      const rs = $('#fin-reset'); if (rs) rs.onclick = () => { done = []; H.LS.set(LSK(g.id), done); $$('[data-mk]').forEach(c => { c.checked = false; setStep(+c.dataset.mk, false); }); updProgress(); };
      if (fromClick && n === N) {
        H.toast({ title: t('Guide complete', 'Panduan selesai', 'ガイド完了'), sub: `${g.t} — ${N}/${N} ${t('steps', 'langkah', 'ステップ')}`, icon: ICON.check });
        fin.classList.add('is-pop');
      }
    }
    function setStep(i, on) {
      const st = $(`[data-st="${i}"]`), a = $(`[data-rs="${i}"]`);
      st.classList.toggle('is-done', on); a.classList.toggle('is-done', on);
      st.querySelector('.mk-t').textContent = on ? t('Done', 'Selesai', '完了') : t('Mark step done', 'Tandai selesai', '完了にする');
      if (on) { const bx = st.querySelector('.mk-box'); bx.innerHTML = ICON.tick; st.classList.remove('is-flash'); void st.offsetWidth; st.classList.add('is-flash'); }
    }
    host.addEventListener('change', e => {
      const c = e.target.closest('[data-mk]'); if (!c) return;
      const i = +c.dataset.mk;
      done = c.checked ? [...new Set([...done, i])].sort((a, b2) => a - b2) : done.filter(x => x !== i);
      H.LS.set(LSK(g.id), done); setStep(i, c.checked); updProgress(true);
      if (c.checked && i < N - 1 && done.length < N) {
        const nx = $(`#step-${i + 2}`); const r = nx.getBoundingClientRect();
        if (r.top > innerHeight * .85) setTimeout(() => nx.scrollIntoView({ behavior: 'smooth', block: 'start' }), 450);
      }
    });
    host.addEventListener('click', e => {
      const a = e.target.closest('[data-rs]'); if (a) { e.preventDefault(); $('#step-' + (+a.dataset.rs + 1)).scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });

    /* scroll-spy + reading bar */
    let spyIO;
    function spy() {
      if (spyIO) spyIO.disconnect();
      const items = $$('[data-st]');
      spyIO = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting) { const i = e.target.dataset.st; $$('[data-rs]').forEach(a => a.classList.toggle('is-cur', a.dataset.rs === i)); const cur = $(`[data-rs="${i}"]`); const ol = cur && cur.closest('ol'); if (ol && ol.scrollWidth > ol.clientWidth) ol.scrollTo({ left: cur.offsetLeft - 16, behavior: 'smooth' }); } });
      }, { rootMargin: '-35% 0px -60% 0px' });
      items.forEach(el => spyIO.observe(el));
    }
    const bar = $('#readbar');
    const onScroll = () => {
      const body = $('#ar-body'); if (!body) return;
      const r = body.getBoundingClientRect(); const total = r.height - innerHeight * .6;
      const p = Math.max(0, Math.min(1, (-r.top + innerHeight * .4) / total));
      bar.style.setProperty('--p', p); bar.classList.toggle('is-on', r.top < innerHeight * .5 && r.bottom > 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    render(); H.applyI18n(); onScroll();
    if (location.hash && /^#step-\d+$/.test(location.hash)) setTimeout(() => { const el = $(location.hash); el && el.scrollIntoView(); }, 100);
    H.on('market', () => { render(); H.applyI18n(); onScroll(); });
  }

  /* ================= route ================= */
  const id = H.params().get('a');
  const g = id && G.find(x => x.id === id);
  if (g && BODY[g.id]) initArticle(g); else initIndex();
});
