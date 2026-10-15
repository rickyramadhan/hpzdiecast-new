/* HPZ — 404 "Lost a wheel"
   Shopify: templates/404.json → sections/main-404.liquid (+ featured-collection) */
HPZ.ready(() => {
  const H = HPZ, { $, t, ICON } = H;
  const wheel = $('#nf-wheel'), spin = $('#nf-spin'), shadow = $('#nf-shadow'), stage = $('#nf-stage');
  spin.innerHTML = H.wheelSVG({ spokes: 6, finish: 'gold', disc: 1 });
  wheel.appendChild(shadow); // contact shadow travels with the wheel

  /* ---------- rolling physics ----------
     rotation is derived from travel (θ = x / circumference · 360°) so the tyre never "skates" */
  const isStatic = document.documentElement.classList.contains('static') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const easeOutBack = (k, s = 1.35) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
  const easeInCubic = k => k * k * k;
  let x = 0, busy = false, rolls = 0;
  const deg = v => v / (Math.PI * wheel.offsetWidth) * 360;
  function place(px, hop = 0, tilt = 0) {
    x = px;
    spin.style.transform = `translate(${px}px, ${-hop}px) rotate(${deg(px) + tilt}deg)`;
    // contact shadow tightens as the wheel lands
    shadow.style.transform = `translateX(${px}px) scaleX(${1 - Math.min(hop, 60) / 120})`;
    shadow.style.opacity = String(1 - Math.min(hop, 60) / 90);
  }
  const tween = (dur, fn) => new Promise(res => {
    const t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / dur); fn(k); if (k < 1) requestAnimationFrame(step); else res(); };
    requestAnimationFrame(step);
  });
  const leftGap = () => wheel.getBoundingClientRect().left + wheel.offsetWidth + 40;
  const rightGap = () => innerWidth - wheel.getBoundingClientRect().left + 40;

  async function rollIn(drop) {
    const d = leftGap(), D = 1500;
    await tween(D, k => {
      const e = easeOutBack(k);
      // optional drop: falls in from above, bounces twice on the ground line, then rolls on
      let hop = 0;
      if (drop) { const b = Math.max(0, 1 - k / .55); hop = b > 0 ? Math.abs(Math.cos(k / .55 * Math.PI * 2.5)) * 120 * b * b : 0; }
      place(-d + d * e, hop);
    });
    // settle: tiny back-and-forth like a wheel finding its flat spot
    await tween(520, k => place(0, 0, Math.sin(k * Math.PI * 3) * 4 * (1 - k)));
    place(0);
  }
  async function rollOff() {
    const d = rightGap();
    stage.classList.add('is-off');
    await tween(760, k => place(d * easeInCubic(k)));
    stage.classList.remove('is-off');
  }
  async function cycle() {
    if (busy) return; busy = true; rolls++;
    $('#nf-hint').classList.add('is-gone');
    await rollOff();
    await new Promise(r => setTimeout(r, 260));
    place(-leftGap());
    await rollIn(rolls % 3 === 0);
    $('#nf-count').innerHTML = `${t('Wheels recovered', 'Velg ditemukan', '回収したホイール')} <b>${String(rolls).padStart(2, '0')}</b>`;
    busy = false;
  }
  wheel.addEventListener('click', cycle);

  if (isStatic) place(0);
  else { place(-leftGap()); setTimeout(() => rollIn(true).then(() => stage.classList.add('is-ready')), 250); }
  window.addEventListener('resize', H.debounce(() => { if (!busy) place(0); }, 120));

  /* ---------- quick links + products ---------- */
  function draw() {
    const L = [
      ['shop.html?k=wheels', ICON.wheel, 'W', t('Wheels', 'Velg', 'ホイール'), `${H.query({ k: 'wheels' }).length} ${t('sets, 9–12 mm', 'set, 9–12 mm', 'セット・9〜12mm')}`],
      ['shop.html?k=decals', ICON.layers, 'D', t('Decals', 'Decal', 'デカール'), `${H.query({ k: 'decals' }).length} ${t('waterslide sheets', 'sheet waterslide', '水転写シート')}`],
      ['planner.html', ICON.ruler, 'P', t('Build Planner', 'Build Planner', 'ビルドプランナー'), t('Plan a full build', 'Rencanakan build lengkap', 'ビルドを計画')],
      ['account.html#orders', ICON.truck, 'T', t('Track order', 'Lacak pesanan', '注文追跡'), t('DHL, JNE, Royal Mail', 'DHL, JNE, Royal Mail', 'DHL・JNEなど')],
    ];
    $('#nf-links').innerHTML = L.map(([href, ic, code, n, d], i) => `<a href="${href}" data-reveal style="--i:${i}"><span class="nf-ic">${ic}</span><span><b>${n}</b><em>${d}</em></span><span class="mono nf-code">${code}-0${i + 1}</span>${ICON.arrow}</a>`).join('');
    $('#nf-grid').innerHTML = H.query({ own: 1, avail: 1, sort: 'new' }).slice(0, 4).map((p, i) => H.card(p, { i })).join('');
    if (rolls) $('#nf-count').innerHTML = `${t('Wheels recovered', 'Velg ditemukan', '回収したホイール')} <b>${String(rolls).padStart(2, '0')}</b>`;
    H.reveal();
  }
  draw();
  H.on('market', draw);
  H.on('garage', draw);
});
